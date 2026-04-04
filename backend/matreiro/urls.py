"""
URL configuration for Matreiro Platform.
Modular routing — views live in their respective apps.
"""
import logging
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.db.models import F
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from campaigns.models import Campaign, CampaignEvent, Target, TargetGroup
from campaigns.serializers import CampaignSerializer, CampaignEventSerializer, TargetSerializer, TargetGroupSerializer
from campaigns.models_automation import Automation
from campaigns.serializers_extra import AutomationSerializer, LandingPageSerializer, PhishingDomainSerializer
from campaigns.models_landing import LandingPage
from campaigns.models_domains import PhishingDomain
from templates.models import EmailTemplate
from templates.serializers import EmailTemplateSerializer
from tenants.models import Tenant
from tenants.serializers import TenantSerializer
from trainings.models import Training, TrainingEnrollment
from trainings.serializers import TrainingSerializer
from trainings.models_certificate import Certificate
from trainings.serializers_extra import CertificateSerializer
from core.models import User, AuditLog
from core.serializers import UserSerializer, UserCreateSerializer, AuditLogSerializer
from core.models_notification import Notification
from core.models_system_settings import SystemSettings
from core.serializers_extra import NotificationSerializer

logger = logging.getLogger(__name__)


# =====================================================
# HEALTH
# =====================================================
@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "healthy", "service": "matreiro-api"})


# =====================================================
# AUTH
# =====================================================
@api_view(['POST'])
@permission_classes([AllowAny])
def auth_login(request):
    """JWT login via email + password."""
    from django.contrib.auth import authenticate
    email = request.data.get('email', '')
    password = request.data.get('password', '')
    user = authenticate(request, username=email, password=password)
    if user is None:
        # Try email field
        try:
            u = User.objects.get(email=email)
            user = authenticate(request, username=u.username, password=password)
        except User.DoesNotExist:
            pass
    if user is None:
        return Response({"error": "Invalid credentials"}, status=401)
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    return Response({
        "token": str(refresh.access_token),
        "refresh": str(refresh),
        "user": UserSerializer(user).data,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def auth_me(request):
    """Get current user info."""
    if request.user and request.user.is_authenticated:
        return Response(UserSerializer(request.user).data)
    return Response({"error": "Not authenticated"}, status=401)


@api_view(['GET'])
@permission_classes([AllowAny])
def auth_callback(request):
    return Response({"access_token": "", "token_type": "Bearer"})


# =====================================================
# GENERIC CRUD HELPERS
# =====================================================
def make_list_create_view(model_class, serializer_class, filter_tenant=True):
    """Factory for list+create views."""
    @api_view(['GET', 'POST'])
    @permission_classes([AllowAny])
    def view(request):
        if request.method == 'GET':
            qs = model_class.objects.all()
            if filter_tenant and hasattr(model_class, 'tenant') and hasattr(request, 'tenant') and request.tenant:
                qs = qs.filter(tenant=request.tenant)
            serializer = serializer_class(qs[:200], many=True)
            return Response(serializer.data)
        else:
            data = request.data.copy() if hasattr(request.data, 'copy') else dict(request.data)
            if filter_tenant and hasattr(request, 'tenant') and request.tenant:
                data.setdefault('tenant', request.tenant.id)
            serializer = serializer_class(data=data)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=201)
            return Response(serializer.errors, status=400)
    return view


def make_detail_view(model_class, serializer_class):
    """Factory for get+update+delete views."""
    @api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
    @permission_classes([AllowAny])
    def view(request, pk):
        try:
            obj = model_class.objects.get(pk=pk)
        except model_class.DoesNotExist:
            return Response({"error": f"{model_class.__name__} not found"}, status=404)
        if request.method == 'GET':
            return Response(serializer_class(obj).data)
        elif request.method in ('PUT', 'PATCH'):
            serializer = serializer_class(obj, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=400)
        else:
            obj.delete()
            return Response(status=204)
    return view


# =====================================================
# CAMPAIGNS
# =====================================================
campaigns_list = make_list_create_view(Campaign, CampaignSerializer)
campaign_detail = make_detail_view(Campaign, CampaignSerializer)

@api_view(['GET'])
@permission_classes([AllowAny])
def campaign_events(request, campaign_id):
    try:
        campaign = Campaign.objects.get(pk=campaign_id)
    except Campaign.DoesNotExist:
        return Response({"error": "Campaign not found"}, status=404)
    events = campaign.events.all()
    return Response(CampaignEventSerializer(events, many=True).data)


@api_view(['POST'])
@permission_classes([AllowAny])
def campaign_launch(request, pk):
    """Launch a campaign — triggers async email sending via Celery."""
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({"error": "Campaign not found"}, status=404)
    if campaign.status in ('active', 'completed'):
        return Response({"error": "Campaign already launched"}, status=400)
    from campaigns.tasks import execute_campaign
    execute_campaign.delay(campaign.id)
    campaign.status = 'scheduled'
    campaign.save(update_fields=['status'])
    return Response({"success": True, "message": "Campaign queued for sending"})


@api_view(['POST'])
@permission_classes([AllowAny])
def smtp_test(request):
    """Test SMTP connection."""
    host = request.data.get('host', '')
    port = request.data.get('port', 587)
    user = request.data.get('user', '')
    password = request.data.get('password', '')
    encryption = request.data.get('encryption', 'tls')
    test_to = request.data.get('testEmail', '')
    if not host:
        return Response({"success": False, "error": "SMTP host required"}, status=400)
    try:
        import smtplib
        if encryption == 'ssl':
            server = smtplib.SMTP_SSL(host, int(port), timeout=10)
        else:
            server = smtplib.SMTP(host, int(port), timeout=10)
            if encryption == 'tls':
                server.starttls()
        if user and password:
            server.login(user, password)
        server.quit()
        return Response({"success": True, "message": "SMTP connection successful"})
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=400)


# =====================================================
# TARGETS
# =====================================================
targets_list = make_list_create_view(Target, TargetSerializer)
target_detail = make_detail_view(Target, TargetSerializer)
target_groups_list = make_list_create_view(TargetGroup, TargetGroupSerializer)
target_group_detail = make_detail_view(TargetGroup, TargetGroupSerializer)

@api_view(['DELETE'])
@permission_classes([AllowAny])
def targets_delete_by_tenant(request, tenant_id):
    count, _ = Target.objects.filter(tenant_id=tenant_id).delete()
    return Response({"success": True, "deletedCount": count, "tenantId": str(tenant_id)})

@api_view(['POST'])
@permission_classes([AllowAny])
def targets_sync(request):
    return Response({"status": "synced", "targets": 0})


# =====================================================
# TEMPLATES
# =====================================================
templates_list = make_list_create_view(EmailTemplate, EmailTemplateSerializer)
template_detail = make_detail_view(EmailTemplate, EmailTemplateSerializer)


# =====================================================
# TENANTS
# =====================================================
tenants_list = make_list_create_view(Tenant, TenantSerializer, filter_tenant=False)
tenant_detail = make_detail_view(Tenant, TenantSerializer)


# =====================================================
# TRAININGS
# =====================================================
trainings_list = make_list_create_view(Training, TrainingSerializer)
training_detail = make_detail_view(Training, TrainingSerializer)


# =====================================================
# AUTOMATIONS
# =====================================================
automations_list = make_list_create_view(Automation, AutomationSerializer)
automation_detail = make_detail_view(Automation, AutomationSerializer)


# =====================================================
# LANDING PAGES
# =====================================================
landing_pages_list = make_list_create_view(LandingPage, LandingPageSerializer, filter_tenant=False)
landing_page_detail = make_detail_view(LandingPage, LandingPageSerializer)


# =====================================================
# CERTIFICATES
# =====================================================
certificates_list = make_list_create_view(Certificate, CertificateSerializer)
certificate_detail = make_detail_view(Certificate, CertificateSerializer)


# =====================================================
# PHISHING DOMAINS
# =====================================================
phishing_domains_list = make_list_create_view(PhishingDomain, PhishingDomainSerializer, filter_tenant=False)
phishing_domain_detail = make_detail_view(PhishingDomain, PhishingDomainSerializer)


# =====================================================
# SYSTEM USERS
# =====================================================
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def users_list(request):
    if request.method == 'GET':
        users = User.objects.all()[:200]
        return Response(UserSerializer(users, many=True).data)
    else:
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(UserSerializer(serializer.instance).data, status=201)
        return Response(serializer.errors, status=400)

user_detail = make_detail_view(User, UserSerializer)


# =====================================================
# NOTIFICATIONS
# =====================================================
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def notifications_list(request):
    if request.method == 'GET':
        qs = Notification.objects.all()
        if request.user and request.user.is_authenticated:
            qs = qs.filter(user=request.user)
        return Response(NotificationSerializer(qs[:100], many=True).data)
    else:
        serializer = NotificationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['POST'])
@permission_classes([AllowAny])
def notification_mark_read(request, pk):
    try:
        notif = Notification.objects.get(pk=pk)
        notif.mark_as_read()
        return Response({"success": True})
    except Notification.DoesNotExist:
        return Response({"error": "Not found"}, status=404)


@api_view(['POST'])
@permission_classes([AllowAny])
def notifications_read_all(request):
    if request.user and request.user.is_authenticated:
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
    return Response({"success": True})


# =====================================================
# AUDIT LOGS
# =====================================================
@api_view(['GET'])
@permission_classes([AllowAny])
def audit_logs(request):
    logs = AuditLog.objects.select_related('user').order_by('-timestamp')[:200]
    return Response(AuditLogSerializer(logs, many=True).data)


# =====================================================
# REPORTS
# =====================================================
@api_view(['GET'])
@permission_classes([AllowAny])
def reports_overview(request):
    from django.db.models import Sum
    qs = Campaign.objects.all()
    if hasattr(request, 'tenant') and request.tenant:
        qs = qs.filter(tenant=request.tenant)
    agg = qs.aggregate(
        total_sent=Sum('emails_sent'),
        total_opened=Sum('emails_opened'),
        total_clicked=Sum('links_clicked'),
        total_submitted=Sum('credentials_submitted'),
    )
    total_sent = agg['total_sent'] or 0
    return Response({
        "total_campaigns": qs.count(),
        "total_targets": total_sent,
        "total_sent": total_sent,
        "total_opened": agg['total_opened'] or 0,
        "total_clicked": agg['total_clicked'] or 0,
        "total_submitted": agg['total_submitted'] or 0,
        "open_rate": ((agg['total_opened'] or 0) / total_sent * 100) if total_sent > 0 else 0,
        "click_rate": ((agg['total_clicked'] or 0) / total_sent * 100) if total_sent > 0 else 0,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def reports_timeline(request):
    events = CampaignEvent.objects.select_related('campaign').order_by('-timestamp')[:100]
    return Response([{
        'id': e.id, 'campaign': e.campaign.name, 'event_type': e.event_type,
        'target_email': e.target_email,
        'timestamp': e.timestamp.isoformat() if e.timestamp else None,
    } for e in events])


@api_view(['GET'])
@permission_classes([AllowAny])
def reports_departments(request):
    from django.db.models import Count
    deps = CampaignEvent.objects.exclude(
        details__department__isnull=True
    ).values('details__department').annotate(count=Count('id'))
    return Response(list(deps))


# =====================================================
# SETTINGS (persistent DB-backed)
# =====================================================
_SETTINGS_DEFAULTS = {
    "general": {"organizationName": "Matreiro Platform", "domain": "", "description": "",
                "timezone": "america-sao-paulo", "language": "pt-br",
                "maintenanceMode": False, "autoArchiveCampaigns": True},
    "smtp": {"host": "", "port": 587, "user": "", "password": "", "from": "", "encryption": "tls"},
    "syslog": {"host": "", "port": 514, "protocol": "udp", "facility": "local0",
               "auditLogsEnabled": False, "phishingEventsEnabled": False},
    "integrations": {
        "microsoft365": {"enabled": False, "tenantId": "", "clientId": "", "clientSecret": "", "autoSync": False},
        "googleWorkspace": {"enabled": False, "serviceAccountJson": "", "domain": ""},
        "azure": {"enabled": False, "tenantId": "", "clientId": "", "clientSecret": "", "autoSync": False},
    },
}


@api_view(['GET', 'PUT'])
@permission_classes([AllowAny])
def settings_get(request):
    all_settings = SystemSettings.get_all_settings()
    result = {}
    for key, default in _SETTINGS_DEFAULTS.items():
        result[key] = all_settings.get(key, default)
    return Response({"settings": result})


@api_view(['POST'])
@permission_classes([AllowAny])
def settings_update(request):
    data = request.data
    user = request.user if request.user and request.user.is_authenticated else None
    if isinstance(data, dict):
        settings_data = data.get("settings", data)
        for key in ["general", "smtp", "syslog", "integrations"]:
            if key in settings_data:
                SystemSettings.set_value(key, settings_data[key], user=user)
    all_settings = SystemSettings.get_all_settings()
    result = {}
    for key, default in _SETTINGS_DEFAULTS.items():
        result[key] = all_settings.get(key, default)
    return Response({"success": True, "settings": result})


# =====================================================
# STUBS (LDAP, Onboarding, Phishing Config)
# =====================================================
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def ldap_config(request):
    return Response({"enabled": False})

@api_view(['POST'])
@permission_classes([AllowAny])
def ldap_test(request):
    return Response({"success": True, "message": "LDAP test placeholder"})

@api_view(['GET'])
@permission_classes([AllowAny])
def smtp_config(request):
    return Response({"configured": False})

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def o365_config(request):
    s = SystemSettings.get_value('integrations', {}).get('microsoft365', {})
    return Response({"enabled": s.get('enabled', False), "tenantId": s.get('tenantId', ''),
                     "autoSync": s.get('autoSync', False)})

@api_view(['GET'])
@permission_classes([AllowAny])
def onboarding_config(request):
    return Response({"enabled": False})

@api_view(['GET'])
@permission_classes([AllowAny])
def onboarding_history(request):
    return Response([])

@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def phishing_config(request):
    return Response({"redirect_url": "", "enabled": False})

@api_view(['POST'])
@permission_classes([AllowAny])
def seed_database(request):
    """Seed database with initial data."""
    # Create default tenant if none exists
    if not Tenant.objects.exists():
        Tenant.objects.create(
            name="Under Protection", slug="under-protection", status="active",
            contact_name="Administrador", contact_email="admin@upn.com.br",
        )
    # Create default superadmin if none exists
    if not User.objects.filter(role='superadmin').exists():
        User.objects.create_superuser(
            username='admin', email='admin@matreiro.com',
            password='admin123', role='superadmin',
            first_name='Admin', last_name='Matreiro'
        )
    return Response({"success": True, "message": "Database seeded"})


# =====================================================
# AZURE AD / MICROSOFT GRAPH (real endpoints)
# =====================================================
@api_view(['POST'])
@permission_classes([AllowAny])
def azure_test_connection(request):
    from .microsoft_graph import MicrosoftGraphClient, validate_credentials
    tid = request.data.get('tenantId')
    cid = request.data.get('clientId')
    cs = request.data.get('clientSecret')
    is_valid, err = validate_credentials(tid, cid, cs)
    if not is_valid:
        return Response({"success": False, "error": err}, status=400)
    try:
        client = MicrosoftGraphClient(tid, cid, cs)
        result = client.test_connection()
        if result.get('success'):
            return Response({"success": True, "message": "Conexão OK", "organization": result.get('organization')})
        return Response({"success": False, "error": result.get('error')}, status=400)
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def azure_sync_users(request):
    from .microsoft_graph import MicrosoftGraphClient, validate_credentials
    tid = request.data.get('tenantId')
    cid = request.data.get('clientId')
    cs = request.data.get('clientSecret')
    target_tid = request.data.get('targetTenantId')
    domains = request.data.get('allowedDomains', [])
    is_valid, err = validate_credentials(tid, cid, cs)
    if not is_valid:
        return Response({"success": False, "error": err}, status=400)
    try:
        client = MicrosoftGraphClient(tid, cid, cs)
        result = client.get_users(max_results=500, allowed_domains=domains)
        if not result.get('success'):
            return Response({"success": False, "error": result.get('error')}, status=400)
        users = result.get('users', [])
        target_tenant = None
        if target_tid and target_tid != 'default':
            try: target_tenant = Tenant.objects.get(id=target_tid)
            except Tenant.DoesNotExist: pass
        if not target_tenant:
            target_tenant = Tenant.objects.first()
        if not target_tenant:
            return Response({"success": False, "error": "No tenant found"}, status=400)
        saved = 0
        for u in users:
            email = u.get('email', '')
            if not email: continue
            name_parts = u.get('name', '').split()
            defaults = {
                'first_name': name_parts[0] if name_parts else '',
                'last_name': ' '.join(name_parts[1:]) if len(name_parts) > 1 else '',
                'department': u.get('department', ''),
                'position': u.get('jobTitle', '') or u.get('title', ''),
                'source': 'azure_ad', 'source_id': u.get('id', ''),
            }
            Target.objects.update_or_create(email=email, tenant=target_tenant, defaults=defaults)
            saved += 1
        return Response({"success": True, "synced": saved, "totalFound": len(users), "users": users[:10]})
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def azure_sync_groups(request):
    from .microsoft_graph import MicrosoftGraphClient, validate_credentials
    tid = request.data.get('tenantId')
    cid = request.data.get('clientId')
    cs = request.data.get('clientSecret')
    target_tid = request.data.get('targetTenantId')
    is_valid, err = validate_credentials(tid, cid, cs)
    if not is_valid:
        return Response({"success": False, "error": err}, status=400)
    try:
        client = MicrosoftGraphClient(tid, cid, cs)
        result = client.get_groups(max_results=200)
        if not result.get('success'):
            return Response({"success": False, "error": result.get('error')}, status=400)
        groups = result.get('groups', [])
        target_tenant = None
        if target_tid and target_tid != 'default':
            try: target_tenant = Tenant.objects.get(id=target_tid)
            except Tenant.DoesNotExist: pass
        saved = 0
        for g in groups:
            name = g.get('name', '')
            if not TargetGroup.objects.filter(name=name).exists():
                TargetGroup.objects.create(name=name, description=g.get('description', ''), tenant=target_tenant)
                saved += 1
        return Response({"success": True, "synced": saved, "totalFound": len(groups), "groups": groups})
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def o365_users(request):
    from .microsoft_graph import MicrosoftGraphClient
    s = SystemSettings.get_value('integrations', {}).get('microsoft365', {})
    tid = request.query_params.get('tenantId') or s.get('tenantId')
    cid = request.query_params.get('clientId') or s.get('clientId')
    cs = request.query_params.get('clientSecret') or s.get('clientSecret')
    if not all([tid, cid, cs]):
        return Response({"error": "Not configured"}, status=400)
    try:
        client = MicrosoftGraphClient(tid, cid, cs)
        return Response(client.get_users(max_results=500))
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def o365_groups(request):
    from .microsoft_graph import MicrosoftGraphClient
    s = SystemSettings.get_value('integrations', {}).get('microsoft365', {})
    tid = request.query_params.get('tenantId') or s.get('tenantId')
    cid = request.query_params.get('clientId') or s.get('clientId')
    cs = request.query_params.get('clientSecret') or s.get('clientSecret')
    if not all([tid, cid, cs]):
        return Response({"error": "Not configured"}, status=400)
    try:
        client = MicrosoftGraphClient(tid, cid, cs)
        return Response(client.get_groups(max_results=200))
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def o365_domains(request):
    from .microsoft_graph import MicrosoftGraphClient
    s = SystemSettings.get_value('integrations', {}).get('microsoft365', {})
    tid = request.query_params.get('tenantId') or s.get('tenantId')
    cid = request.query_params.get('clientId') or s.get('clientId')
    cs = request.query_params.get('clientSecret') or s.get('clientSecret')
    if not all([tid, cid, cs]):
        return Response({"error": "Not configured"}, status=400)
    try:
        client = MicrosoftGraphClient(tid, cid, cs)
        result = client.test_connection()
        if result.get('success'):
            return Response({"domains": [result.get('organization', {}).get('name', '')]})
        return Response({"error": result.get('error')}, status=400)
    except Exception as e:
        return Response({"error": str(e)}, status=500)


@api_view(['POST'])
@permission_classes([AllowAny])
def o365_sync(request):
    from .microsoft_graph import MicrosoftGraphClient
    tid = request.data.get('tenantId')
    cid = request.data.get('clientId')
    cs = request.data.get('clientSecret')
    if not all([tid, cid, cs]):
        s = SystemSettings.get_value('integrations', {}).get('microsoft365', {})
        tid = tid or s.get('tenantId')
        cid = cid or s.get('clientId')
        cs = cs or s.get('clientSecret')
    if not all([tid, cid, cs]):
        return Response({"success": False, "error": "Not configured"}, status=400)
    try:
        client = MicrosoftGraphClient(tid, cid, cs)
        users_r = client.get_users(max_results=500)
        groups_r = client.get_groups(max_results=200)
        return Response({"status": "synced", "success": True,
                         "users": users_r.get('count', 0), "groups": groups_r.get('count', 0)})
    except Exception as e:
        return Response({"success": False, "error": str(e)}, status=500)


# =====================================================
# TRACKING URL IMPORT
# =====================================================
from .track_urls import urlpatterns as track_urls

# =====================================================
# URL PATTERNS
# =====================================================
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),

    # Health
    path('api/health/', health_check),
    path('api/v1/health/', health_check),
    path('api/v2/health/', health_check),

    # Auth
    path('api/v1/auth/login/', auth_login),
    path('api/v1/auth/me/', auth_me),
    path('api/v1/auth/callback', auth_callback),
    path('api/v2/auth/login/', auth_login),
    path('api/v2/auth/me/', auth_me),

    # Tenants
    path('api/v1/tenants/', tenants_list),
    path('api/v1/tenants/<int:pk>/', tenant_detail),
    path('api/v1/clients/', tenants_list),
    path('api/v2/tenants/', tenants_list),
    path('api/v2/tenants/<int:pk>/', tenant_detail),

    # Campaigns
    path('api/v1/campaigns/', campaigns_list),
    path('api/v1/campaigns/<int:pk>/', campaign_detail),
    path('api/v1/campaigns/<int:pk>/launch/', campaign_launch),
    path('api/v1/campaigns/<int:campaign_id>/events/', campaign_events),
    path('api/v2/campaigns/', campaigns_list),
    path('api/v2/campaigns/<int:pk>/', campaign_detail),

    # SMTP
    path('api/v1/smtp/config', smtp_config),
    path('api/v1/smtp/test', smtp_test),

    # Targets
    path('api/v1/targets/', targets_list),
    path('api/v1/targets/<int:pk>/', target_detail),
    path('api/v1/targets/sync', targets_sync),
    path('api/v1/targets/tenant/<int:tenant_id>/', targets_delete_by_tenant),
    path('api/v1/target-groups/', target_groups_list),
    path('api/v1/target-groups/<int:pk>/', target_group_detail),

    # Templates
    path('api/v1/templates/', templates_list),
    path('api/v1/templates/<int:pk>/', template_detail),
    path('api/v2/templates/', templates_list),
    path('api/v2/templates/<int:pk>/', template_detail),

    # Trainings
    path('api/v1/trainings/', trainings_list),
    path('api/v1/trainings/<int:pk>/', training_detail),

    # Automations
    path('api/v1/automations/', automations_list),
    path('api/v1/automations/<int:pk>/', automation_detail),

    # Landing Pages
    path('api/v1/landing-pages/', landing_pages_list),
    path('api/v1/landing-pages/<int:pk>/', landing_page_detail),

    # Certificates
    path('api/v1/certificates/', certificates_list),
    path('api/v1/certificates/<int:pk>/', certificate_detail),

    # Phishing Domains
    path('api/v1/phishing-domains/', phishing_domains_list),
    path('api/v1/phishing-domains/<int:pk>/', phishing_domain_detail),

    # System Users
    path('api/v1/users/', users_list),
    path('api/v1/users/<int:pk>/', user_detail),

    # Notifications
    path('api/v1/notifications/', notifications_list),
    path('api/v1/notifications/<int:pk>/read/', notification_mark_read),
    path('api/v1/notifications/read-all/', notifications_read_all),

    # Audit Logs
    path('api/v1/audit/logs/', audit_logs),
    path('api/v2/audit/logs/', audit_logs),

    # Reports
    path('api/v1/reports/overview', reports_overview),
    path('api/v1/reports/timeline', reports_timeline),
    path('api/v1/reports/departments', reports_departments),
    path('api/v2/reports/overview', reports_overview),
    path('api/v2/reports/timeline', reports_timeline),

    # Settings
    path('api/v1/settings/', settings_get),
    path('api/v1/settings/update', settings_update),
    path('api/v2/settings/', settings_get),
    path('api/v2/settings/update', settings_update),

    # Seed
    path('api/v1/seed/', seed_database),

    # LDAP
    path('api/v1/ldap/config', ldap_config),
    path('api/v1/ldap/test', ldap_test),

    # SMTP
    path('api/v1/smtp/config', smtp_config),

    # O365 / Azure
    path('api/v1/o365/config', o365_config),
    path('api/v1/o365/users/', o365_users),
    path('api/v1/o365/groups/', o365_groups),
    path('api/v1/o365/domains/', o365_domains),
    path('api/v1/o365/sync', o365_sync),
    path('api/v1/azure/test-connection', azure_test_connection),
    path('api/v1/azure/sync-users', azure_sync_users),
    path('api/v1/azure/sync-groups', azure_sync_groups),
    path('api/v2/azure/test-connection', azure_test_connection),
    path('api/v2/azure/sync-users', azure_sync_users),
    path('api/v2/azure/sync-groups', azure_sync_groups),

    # Onboarding
    path('api/v1/onboarding/config', onboarding_config),
    path('api/v1/onboarding/history', onboarding_history),

    # Phishing Config
    path('api/v1/phishing/config', phishing_config),

    # Tracking
    path('api/v1/track/', include(track_urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
