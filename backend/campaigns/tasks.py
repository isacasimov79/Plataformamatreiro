"""
Celery tasks for Matreiro Platform.
Campaign execution, Azure AD sync, and automation evaluation.
"""
import base64
import logging
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from celery import shared_task
from django.conf import settings

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=60)
def execute_campaign(self, campaign_id):
    """Send all emails for a campaign via Graph API or SMTP."""
    from campaigns.models import Campaign, CampaignEvent, Target
    from templates.models import EmailTemplate
    from tenants.models_settings import TenantSettings

    try:
        campaign = Campaign.objects.select_related('template', 'tenant').get(id=campaign_id)
    except Campaign.DoesNotExist:
        logger.error(f"Campaign {campaign_id} not found")
        return {'error': 'Campaign not found'}

    template = campaign.template
    if not template:
        logger.error(f"Campaign {campaign_id} has no template")
        return {'error': 'No template assigned'}

    # Get targets
    targets = []
    if campaign.target_list:
        targets = list(Target.objects.filter(id__in=campaign.target_list, status='active'))
    elif campaign.tenant:
        targets = list(Target.objects.filter(tenant=campaign.tenant, status='active'))

    if not targets:
        logger.warning(f"Campaign {campaign_id} has no targets")
        return {'sent': 0}

    # Get phishing domain
    phishing_base = 'http://localhost:8080'
    if template.phishing_domain:
        domain = template.phishing_domain.domain
        phishing_base = f"https://{domain}" if template.phishing_domain.ssl_enabled else f"http://{domain}"

    # Determine sending method based on tenant configuration
    try:
        tenant_settings = TenantSettings.objects.get(tenant=campaign.tenant)
        sending_method = tenant_settings.email_sending_method
    except TenantSettings.DoesNotExist:
        sending_method = 'smtp_client'  # fallback
        tenant_settings = None

    graph_client = None
    smtp_config = None

    if sending_method == 'graph_api':
        graph_client = _get_graph_client(campaign.tenant)
        if not graph_client:
            logger.error(f"Graph API selected but not configured for tenant {campaign.tenant}")
            return {'error': 'Graph API not configured'}
    elif sending_method == 'smtp_master':
        # Use parent tenant's (master) SMTP config
        master_tenant = campaign.tenant.parent_tenant if campaign.tenant.parent_tenant else campaign.tenant
        smtp_config = _get_smtp_config(master_tenant)
        if not smtp_config:
            logger.error(f"Master SMTP selected but not configured")
            return {'error': 'Master SMTP not configured'}
    else:  # smtp_client (default)
        smtp_config = _get_smtp_config(campaign.tenant)
        if not smtp_config:
            # Fallback: try Graph API
            graph_client = _get_graph_client(campaign.tenant)

    from_email = _get_from_email(campaign.tenant, graph_client, smtp_config)

    if not graph_client and not smtp_config:
        logger.error(f"No sending method configured for tenant {campaign.tenant}")
        return {'error': 'No Graph API or SMTP configured. Configure email sending in tenant settings.'}

    # Update campaign status
    campaign.status = 'active'
    campaign.save(update_fields=['status'])

    sent_count = 0
    for target in targets:
        try:
            # Generate tracking token
            token = base64.urlsafe_b64encode(
                f"{campaign.id}:{target.email}".encode()
            ).decode().rstrip('=')

            # Build email HTML with tracking
            html = _inject_tracking(template.body_html, token, phishing_base)

            # Send via Graph API or SMTP
            if graph_client:
                result = graph_client.send_mail(
                    from_email=from_email,
                    to_email=target.email,
                    subject=template.subject,
                    body_html=html,
                )
                if not result.get('success'):
                    raise Exception(result.get('error', 'Graph send failed'))
            else:
                _send_email(
                    smtp_config=smtp_config,
                    to_email=target.email,
                    to_name=f"{target.first_name} {target.last_name}".strip(),
                    subject=template.subject,
                    html_body=html,
                    text_body=template.body_text or '',
                )

            CampaignEvent.objects.create(
                campaign=campaign,
                event_type='sent',
                target_email=target.email,
            )
            sent_count += 1

        except Exception as e:
            logger.error(f"Failed to send to {target.email}: {e}")
            CampaignEvent.objects.create(
                campaign=campaign,
                event_type='error',
                target_email=target.email,
                details={'error': str(e)},
            )

    # Update campaign counters
    campaign.emails_sent = sent_count
    campaign.target_count = len(targets)
    if sent_count == len(targets):
        campaign.status = 'completed'
    campaign.save(update_fields=['emails_sent', 'target_count', 'status'])

    logger.info(f"Campaign {campaign_id} sent {sent_count}/{len(targets)} emails")
    return {'sent': sent_count, 'total': len(targets)}


@shared_task
def sync_azure_ad(tenant_id):
    """Periodic Azure AD sync for a tenant."""
    from tenants.models import Tenant
    from tenants.models_settings import TenantSettings
    from campaigns.models import Target
    from matreiro.microsoft_graph import MicrosoftGraphClient

    try:
        tenant = Tenant.objects.get(id=tenant_id)
        ts = TenantSettings.objects.get(tenant=tenant)
    except (Tenant.DoesNotExist, TenantSettings.DoesNotExist):
        return {'error': 'Tenant or settings not found'}

    if not ts.azure_tenant_id or not ts.azure_client_id:
        return {'skipped': True, 'reason': 'Azure not configured'}

    try:
        client = MicrosoftGraphClient(
            ts.azure_tenant_id, ts.azure_client_id, ts.get_azure_client_secret()
        )
        result = client.get_users(max_results=500, allowed_domains=ts.azure_allowed_domains)
        if not result.get('success'):
            return {'error': result.get('error')}

        saved = 0
        for u in result.get('users', []):
            email = u.get('email', '')
            if not email:
                continue
            name_parts = u.get('name', '').split()
            Target.objects.update_or_create(
                email=email, tenant=tenant,
                defaults={
                    'first_name': name_parts[0] if name_parts else '',
                    'last_name': ' '.join(name_parts[1:]) if len(name_parts) > 1 else '',
                    'department': u.get('department', ''),
                    'position': u.get('jobTitle', '') or u.get('title', ''),
                    'source': 'azure_ad',
                    'source_id': u.get('id', ''),
                }
            )
            saved += 1
        # Update last sync
        from django.utils import timezone
        ts.azure_last_sync_at = timezone.now()
        ts.save(update_fields=['azure_last_sync_at'])
        return {'synced': saved}
    except Exception as e:
        logger.error(f"Azure sync error for tenant {tenant_id}: {e}")
        return {'error': str(e)}


@shared_task
def evaluate_automations():
    """Evaluate all active automations and fire campaigns if conditions are met."""
    from campaigns.models_automation import Automation, AutomationExecution
    from campaigns.models import Target

    automations = Automation.objects.filter(status='active')
    fired = 0

    for auto in automations:
        try:
            # For now, handle scheduled automations
            if auto.trigger == 'schedule':
                # Execute the campaign template for all matching targets
                if auto.campaign_template and auto.tenant:
                    targets = Target.objects.filter(tenant=auto.tenant, status='active')
                    if auto.condition_type == 'in_department' and auto.condition_department:
                        targets = targets.filter(department=auto.condition_department)

                    if targets.exists():
                        # Create a campaign from the automation
                        from campaigns.models import Campaign
                        campaign = Campaign.objects.create(
                            name=f"Auto: {auto.name}",
                            description=f"Campanha automática gerada por: {auto.name}",
                            template=auto.campaign_template,
                            tenant=auto.tenant,
                            status='scheduled',
                            target_list=list(targets.values_list('id', flat=True)),
                        )
                        # Fire campaign execution
                        execute_campaign.delay(campaign.id)
                        AutomationExecution.objects.create(
                            automation=auto, campaign=campaign, status='success',
                            details={'targets': targets.count()}
                        )
                        auto.execution_count += 1
                        from django.utils import timezone
                        auto.last_executed_at = timezone.now()
                        auto.save(update_fields=['execution_count', 'last_executed_at'])
                        fired += 1
        except Exception as e:
            logger.error(f"Automation {auto.id} error: {e}")
            AutomationExecution.objects.create(
                automation=auto, status='failed', details={'error': str(e)}
            )

    return {'evaluated': automations.count(), 'fired': fired}


@shared_task
def sync_all_azure_tenants():
    """Periodic task to sync Azure AD users for all tenants that have it configured."""
    from tenants.models_settings import TenantSettings

    tenants_with_azure = TenantSettings.objects.filter(
        azure_auto_sync=True,
    ).exclude(azure_tenant_id='').exclude(azure_client_id='')

    results = []
    for ts in tenants_with_azure:
        result = sync_azure_ad.delay(ts.tenant_id)
        results.append({'tenant_id': ts.tenant_id, 'task_id': str(result.id)})

    logger.info(f"Queued Azure AD sync for {len(results)} tenants")
    return {'queued': len(results), 'tenants': results}

# =====================================================
# HELPER FUNCTIONS
# =====================================================

def _get_graph_client(tenant):
    """Get Microsoft Graph client for sending emails, from tenant or system settings."""
    from tenants.models_settings import TenantSettings
    from core.models_system_settings import SystemSettings
    from matreiro.microsoft_graph import MicrosoftGraphClient

    # Try tenant-level Azure settings first
    if tenant:
        try:
            ts = TenantSettings.objects.get(tenant=tenant)
            if ts.azure_tenant_id and ts.azure_client_id and ts.azure_client_secret:
                return MicrosoftGraphClient(
                    ts.azure_tenant_id, ts.azure_client_id, ts.get_azure_client_secret()
                )
        except TenantSettings.DoesNotExist:
            pass

    # Fall back to system integration settings
    integrations = SystemSettings.get_value('integrations', {})
    o365 = integrations.get('microsoft365', {})
    if o365.get('tenantId') and o365.get('clientId') and o365.get('clientSecret'):
        return MicrosoftGraphClient(
            o365['tenantId'], o365['clientId'], o365['clientSecret']
        )
    return None


def _get_from_email(tenant, graph_client=None, smtp_config=None):
    """Determine the from_email address."""
    from tenants.models_settings import TenantSettings
    from core.models_system_settings import SystemSettings

    # Try tenant settings
    if tenant:
        try:
            ts = TenantSettings.objects.get(tenant=tenant)
            if ts.smtp_from_email:
                return ts.smtp_from_email
        except TenantSettings.DoesNotExist:
            pass

    # From SMTP config
    if smtp_config and smtp_config.get('from_email'):
        return smtp_config['from_email']

    # Fallback
    return 'noreply@matreiro.com'


def _get_smtp_config(tenant):
    """Get SMTP config for a tenant, falling back to system defaults."""
    from tenants.models_settings import TenantSettings
    from core.models_system_settings import SystemSettings

    if tenant:
        try:
            ts = TenantSettings.objects.get(tenant=tenant)
            if ts.smtp_configured and ts.smtp_host:
                return {
                    'host': ts.smtp_host,
                    'port': ts.smtp_port,
                    'user': ts.smtp_user,
                    'password': ts.get_smtp_password(),
                    'from_email': ts.smtp_from_email,
                    'from_name': ts.smtp_from_name or tenant.name,
                    'encryption': ts.smtp_encryption,
                }
        except TenantSettings.DoesNotExist:
            pass

    # Fall back to system settings
    smtp_settings = SystemSettings.get_value('smtp', {})
    if smtp_settings.get('host'):
        return {
            'host': smtp_settings['host'],
            'port': smtp_settings.get('port', 587),
            'user': smtp_settings.get('user', ''),
            'password': smtp_settings.get('password', ''),
            'from_email': smtp_settings.get('from', ''),
            'from_name': 'Matreiro Platform',
            'encryption': smtp_settings.get('encryption', 'tls'),
        }
    return None


def _inject_tracking(html, token, phishing_base):
    """Inject tracking pixel and rewrite links in email HTML."""
    # Add tracking pixel before </body>
    pixel = f'<img src="{phishing_base}/t/{token}" width="1" height="1" style="display:none" alt="" />'
    if '</body>' in html.lower():
        idx = html.lower().rfind('</body>')
        html = html[:idx] + pixel + html[idx:]
    else:
        html += pixel

    # Rewrite href links to go through click tracker
    import re
    def replace_link(match):
        original_url = match.group(1)
        if 'unsubscribe' in original_url.lower() or original_url.startswith('#'):
            return match.group(0)
        return f'href="{phishing_base}/c/{token}?url={original_url}"'

    html = re.sub(r'href="(https?://[^"]+)"', replace_link, html, flags=re.IGNORECASE)
    return html


def _send_email(smtp_config, to_email, to_name, subject, html_body, text_body=''):
    """Send a single email via SMTP."""
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = f"{smtp_config['from_name']} <{smtp_config['from_email']}>"
    msg['To'] = f"{to_name} <{to_email}>" if to_name else to_email

    if text_body:
        msg.attach(MIMEText(text_body, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_body, 'html', 'utf-8'))

    encryption = smtp_config.get('encryption', 'tls')
    if encryption == 'ssl':
        server = smtplib.SMTP_SSL(smtp_config['host'], smtp_config['port'])
    else:
        server = smtplib.SMTP(smtp_config['host'], smtp_config['port'])
        if encryption == 'tls':
            server.starttls()

    if smtp_config.get('user') and smtp_config.get('password'):
        server.login(smtp_config['user'], smtp_config['password'])

    server.sendmail(smtp_config['from_email'], to_email, msg.as_string())
    server.quit()
