"""
Extended API views for:
- Analytics (advanced metrics, timeseries, departments)
- Gamification (badges, rankings, stats)
- AI Template Generator (multi-provider)
- Template Library (shared/global templates)
- Seed Database (enriched)
"""
import json
import logging
import random
from datetime import datetime, timedelta
from django.db.models import Sum, Count, Avg, F, Q
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

logger = logging.getLogger(__name__)


# =====================================================
# ANALYTICS
# =====================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def analytics_metrics(request):
    """Advanced analytics metrics with time range support."""
    from campaigns.models import Campaign, CampaignEvent
    
    time_range = request.query_params.get('timeRange', '30d')
    days = {'7d': 7, '30d': 30, '90d': 90, '1y': 365}.get(time_range, 30)
    
    since = timezone.now() - timedelta(days=days)
    
    qs = Campaign.objects.all()
    if hasattr(request, 'tenant') and request.tenant:
        qs = qs.filter(tenant=request.tenant)
    
    # Filter by time range
    qs_period = qs.filter(created_at__gte=since)
    
    agg = qs_period.aggregate(
        total_sent=Sum('emails_sent'),
        total_opened=Sum('emails_opened'),
        total_clicked=Sum('links_clicked'),
        total_submitted=Sum('credentials_submitted'),
    )
    
    total_sent = agg['total_sent'] or 0
    total_opened = agg['total_opened'] or 0
    total_clicked = agg['total_clicked'] or 0
    total_submitted = agg['total_submitted'] or 0
    
    open_rate = round((total_opened / total_sent * 100), 1) if total_sent > 0 else 0
    click_rate = round((total_clicked / total_sent * 100), 1) if total_sent > 0 else 0
    submit_rate = round((total_submitted / total_sent * 100), 1) if total_sent > 0 else 0
    
    # Previous period for comparison
    prev_since = since - timedelta(days=days)
    qs_prev = qs.filter(created_at__gte=prev_since, created_at__lt=since)
    prev_agg = qs_prev.aggregate(
        total_sent=Sum('emails_sent'),
        total_opened=Sum('emails_opened'),
        total_clicked=Sum('links_clicked'),
    )
    prev_sent = prev_agg['total_sent'] or 0
    prev_open_rate = round((prev_agg['total_opened'] or 0) / prev_sent * 100, 1) if prev_sent > 0 else 0
    prev_click_rate = round((prev_agg['total_clicked'] or 0) / prev_sent * 100, 1) if prev_sent > 0 else 0
    
    return Response({
        'overview': {
            'totalSent': total_sent,
            'totalOpened': total_opened,
            'totalClicked': total_clicked,
            'totalSubmitted': total_submitted,
            'openRate': str(open_rate),
            'clickRate': str(click_rate),
            'submitRate': str(submit_rate),
        },
        'campaigns': qs_period.count(),
        'timeRange': time_range,
        'comparison': {
            'openRateChange': round(open_rate - prev_open_rate, 1),
            'clickRateChange': round(click_rate - prev_click_rate, 1),
        },
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def analytics_timeseries(request):
    """Time series data for charts."""
    from campaigns.models import CampaignEvent
    
    time_range = request.query_params.get('timeRange', '30d')
    days = {'7d': 7, '30d': 30, '90d': 90, '1y': 365}.get(time_range, 30)
    
    since = timezone.now() - timedelta(days=days)
    
    events = CampaignEvent.objects.filter(timestamp__gte=since)
    if hasattr(request, 'tenant') and request.tenant:
        events = events.filter(campaign__tenant=request.tenant)
    
    # Group by date
    from django.db.models.functions import TruncDate
    daily = events.annotate(date=TruncDate('timestamp')).values('date').annotate(
        opened=Count('id', filter=Q(event_type='opened')),
        clicked=Count('id', filter=Q(event_type='clicked')),
        submitted=Count('id', filter=Q(event_type='submitted')),
    ).order_by('date')
    
    timeseries = []
    for d in daily:
        timeseries.append({
            'date': d['date'].isoformat() if d['date'] else None,
            'opened': d['opened'],
            'clicked': d['clicked'],
            'submitted': d['submitted'],
        })
    
    return Response({'timeSeries': timeseries})


@api_view(['GET'])
@permission_classes([AllowAny])
def analytics_departments(request):
    """Vulnerability metrics by department."""
    from campaigns.models_targets import Target
    from campaigns.models import CampaignEvent
    
    # Get departments from targets
    departments = Target.objects.exclude(
        department__isnull=True
    ).exclude(
        department=''
    ).values('department').annotate(
        total=Count('id'),
    ).order_by('department')
    
    result = []
    for dept in departments:
        dept_name = dept['department']
        # Count events for targets in this department
        dept_emails = Target.objects.filter(department=dept_name).values_list('email', flat=True)
        
        events = CampaignEvent.objects.filter(target_email__in=list(dept_emails))
        clicked = events.filter(event_type='clicked').count()
        submitted = events.filter(event_type='submitted').count()
        total_events = events.filter(event_type='sent').count() or dept['total']
        
        click_rate = round((clicked / total_events * 100), 1) if total_events > 0 else 0
        
        result.append({
            'department': dept_name,
            'total': total_events,
            'clicked': clicked,
            'submitted': submitted,
            'clickRate': str(click_rate),
        })
    
    return Response({'departments': result})


# =====================================================
# GAMIFICATION
# =====================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def gamification_user_stats(request):
    """Get gamification stats for the current user."""
    from campaigns.models import Campaign, CampaignEvent
    from core.models import User
    
    user = request.user if request.user and request.user.is_authenticated else None
    
    # Calculate points based on campaign outcomes
    total_campaigns = Campaign.objects.count()
    total_sent = Campaign.objects.aggregate(s=Sum('emails_sent'))['s'] or 0
    total_clicked = Campaign.objects.aggregate(c=Sum('links_clicked'))['c'] or 0
    
    avoided = total_sent - total_clicked
    
    # Calculate level and points
    points = avoided * 10 + total_campaigns * 50
    level = max(1, points // 500 + 1)
    
    # Calculate badges
    badges = []
    if total_campaigns >= 1:
        badges.append({
            'badgeId': 'first-campaign',
            'awardedAt': timezone.now().isoformat(),
            'reason': 'Primeira campanha criada',
        })
    if avoided >= 10:
        badges.append({
            'badgeId': 'eagle-eye',
            'awardedAt': timezone.now().isoformat(),
            'reason': 'Evitou phishing mais de 10 vezes',
        })
    if total_campaigns >= 5:
        badges.append({
            'badgeId': 'master-trainer',
            'awardedAt': timezone.now().isoformat(),
            'reason': 'Criou 5+ campanhas de treinamento',
        })
    # Always give perfect-month if no clicks in last 30 days
    recent_clicks = CampaignEvent.objects.filter(
        event_type='clicked',
        timestamp__gte=timezone.now() - timedelta(days=30)
    ).count()
    if recent_clicks == 0:
        badges.append({
            'badgeId': 'perfect-month',
            'awardedAt': timezone.now().isoformat(),
            'reason': 'Nenhum clique em phishing nos últimos 30 dias',
        })
    
    return Response({
        'userId': str(user.id) if user else 'anonymous',
        'badges': badges,
        'points': points,
        'level': level,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def gamification_rankings(request):
    """Get department rankings based on phishing avoidance."""
    from campaigns.models_targets import Target
    from campaigns.models import CampaignEvent
    
    ranking_type = request.query_params.get('type', 'department')
    
    departments = Target.objects.exclude(
        department__isnull=True
    ).exclude(
        department=''
    ).values('department').annotate(
        total=Count('id'),
    ).order_by('department')
    
    rankings = []
    for dept in departments:
        dept_name = dept['department']
        dept_emails = list(Target.objects.filter(department=dept_name).values_list('email', flat=True))
        
        # Count click events for this department
        events = CampaignEvent.objects.filter(target_email__in=dept_emails)
        sent_count = events.filter(event_type='sent').count()
        clicked_count = events.filter(event_type='clicked').count()
        avoided = sent_count - clicked_count
        
        # Score: higher is better (more avoided, fewer clicked)
        score = max(0, avoided * 10 - clicked_count * 5)
        
        rankings.append({
            'name': dept_name,
            'score': score,
            'avoided': max(0, avoided),
            'failed': clicked_count,
        })
    
    # Sort by score descending
    rankings.sort(key=lambda x: x['score'], reverse=True)
    
    return Response({'rankings': rankings})


# =====================================================
# AI TEMPLATE GENERATOR
# =====================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def ai_providers_list(request):
    """List available AI providers and their configuration status."""
    from .ai_providers import get_available_providers
    return Response({'providers': get_available_providers()})


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_providers_config(request):
    """Save AI provider API keys."""
    from core.models_system_settings import SystemSettings
    
    data = request.data
    ai_settings = SystemSettings.get_value('ai_providers', {})
    
    if 'openai_key' in data:
        ai_settings['openai_key'] = data['openai_key']
    if 'gemini_key' in data:
        ai_settings['gemini_key'] = data['gemini_key']
    if 'minimax_key' in data:
        ai_settings['minimax_key'] = data['minimax_key']
    if 'openrouter_key' in data:
        ai_settings['openrouter_key'] = data['openrouter_key']
    
    user = request.user if request.user and request.user.is_authenticated else None
    SystemSettings.set_value('ai_providers', ai_settings, user=user)
    
    from .ai_providers import get_available_providers
    return Response({'success': True, 'providers': get_available_providers()})


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_test_provider(request):
    """Test an AI provider by sending a simple prompt and returning raw response."""
    import traceback
    from .ai_providers import get_provider
    
    provider_name = request.data.get('provider', '')
    model = request.data.get('model', '')
    test_prompt = request.data.get('prompt', 'Responda apenas: "OK - provider funcionando" em uma única linha.')
    
    if not provider_name:
        return Response({'error': 'Provider name is required'}, status=400)
    
    result = {
        'provider': provider_name,
        'model': model or 'default',
        'prompt': test_prompt,
        'success': False,
    }
    
    try:
        provider = get_provider(provider_name, model or None)
        raw_response = provider.generate(test_prompt, max_tokens=200, temperature=0.3)
        result['success'] = True
        result['response'] = raw_response
        result['response_length'] = len(raw_response)
    except Exception as e:
        tb = traceback.format_exc()
        result['error'] = str(e)
        result['traceback'] = tb
        logger.error(f"AI test error ({provider_name}): {e}\n{tb}")
    
    return Response(result)

@api_view(['POST'])
@permission_classes([AllowAny])
def ai_generate_template(request):
    """Generate a phishing template using AI."""
    from .ai_providers import (
        get_provider, get_first_available_provider,
        build_generate_prompt, generate_template_fallback
    )
    
    category = request.data.get('category', 'banking')
    difficulty = request.data.get('difficulty', 'basic')
    language = request.data.get('language', 'pt-br')
    custom_instructions = request.data.get('customInstructions', '')
    provider_name = request.data.get('provider', '')
    model = request.data.get('model', '')
    
    # Try to use specified provider, or first available, or fallback
    provider = None
    used_provider = 'local_fallback'
    
    if provider_name:
        try:
            provider = get_provider(provider_name, model or None)
            used_provider = provider_name
        except ValueError as e:
            logger.warning(f"Requested provider {provider_name} not available: {e}")
    
    if not provider:
        pname, pinstance = get_first_available_provider()
        if pinstance:
            provider = pinstance
            used_provider = pname
    
    if provider:
        try:
            prompt = build_generate_prompt(category, difficulty, language, custom_instructions)
            raw_response = provider.generate(prompt, max_tokens=4000)
            
            logger.info(f"--- RAW LLM RESPONSE ({used_provider}) ---\n{raw_response[:500]}...\n--------------------------")
            
            try:
                from core.models import AuditLog
                user = request.user if request.user and request.user.is_authenticated else None
                AuditLog.objects.create(
                    user=user,
                    action='ai_generation',
                    resource_type='template_generation',
                    details={
                        'provider': used_provider, 
                        'prompt_length': len(prompt), 
                        'raw_response_length': len(raw_response),
                        'raw_response_preview': raw_response[:1000],
                        'endpoint': 'generateAITemplate'
                    }
                )
            except Exception as e:
                logger.error(f"Failed to save AI audit log: {e}")
            
            # Parse JSON from response — robust multi-strategy extraction
            import re
            json_str = raw_response.strip()
            template_data = None
            
            # Strategy 1: Try direct parse first
            try:
                template_data = json.loads(json_str, strict=False)
            except json.JSONDecodeError:
                pass
            
            # Strategy 2: Extract from markdown code block ```json ... ```
            if template_data is None:
                md_match = re.search(r'```(?:json)?\s*\n(.*?)\n```', json_str, re.DOTALL)
                if md_match:
                    try:
                        template_data = json.loads(md_match.group(1).strip(), strict=False)
                    except json.JSONDecodeError:
                        pass
            
            # Strategy 3: Find first { ... last } (outermost JSON object)
            if template_data is None:
                first_brace = json_str.find('{')
                last_brace = json_str.rfind('}')
                if first_brace != -1 and last_brace > first_brace:
                    try:
                        template_data = json.loads(json_str[first_brace:last_brace + 1], strict=False)
                    except json.JSONDecodeError:
                        pass
            
            if template_data is None:
                raise json.JSONDecodeError("Could not extract JSON from LLM response", json_str[:200], 0)
            template_data['generatedAt'] = datetime.now().isoformat()
            template_data['provider'] = used_provider
            template_data['model'] = model or 'default'
            
            return Response({'success': True, 'template': template_data})
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error for {used_provider}: {e}. Raw (first 500): {raw_response[:500]}")
            try:
                from core.models import AuditLog
                user = request.user if request.user and request.user.is_authenticated else None
                AuditLog.objects.create(
                    user=user,
                    action='ai_generation_error',
                    resource_type='template_generation',
                    details={
                        'provider': used_provider,
                        'error': f'JSON parse error: {str(e)}',
                        'raw_response': raw_response[:3000],
                        'endpoint': 'generateAITemplate'
                    }
                )
            except Exception:
                pass
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            logger.error(f"AI generation error with {used_provider}: {e}\n{tb}")
            try:
                from core.models import AuditLog
                user = request.user if request.user and request.user.is_authenticated else None
                AuditLog.objects.create(
                    user=user,
                    action='ai_generation_error',
                    resource_type='template_generation',
                    details={
                        'provider': used_provider,
                        'error': str(e),
                        'traceback': tb[:2000],
                        'endpoint': 'generateAITemplate'
                    }
                )
            except Exception:
                pass
    
    # Use local fallback
    template = generate_template_fallback(category, difficulty, language)
    return Response({'success': True, 'template': template, 'fallback': True})


@api_view(['POST'])
@permission_classes([AllowAny])
def ai_analyze_template(request):
    """Analyze a phishing template using AI."""
    from .ai_providers import (
        get_provider, get_first_available_provider,
        build_analyze_prompt, analyze_template_fallback
    )
    
    subject = request.data.get('subject', '')
    body_html = request.data.get('bodyHtml', '')
    provider_name = request.data.get('provider', '')
    model = request.data.get('model', '')
    
    if not subject and not body_html:
        return Response({'error': 'Subject or body required'}, status=400)
    
    provider = None
    used_provider = 'local_heuristics'
    
    if provider_name:
        try:
            provider = get_provider(provider_name, model or None)
            used_provider = provider_name
        except ValueError:
            pass
    
    if not provider:
        pname, pinstance = get_first_available_provider()
        if pinstance:
            provider = pinstance
            used_provider = pname
    
    if provider:
        try:
            prompt = build_analyze_prompt(subject, body_html)
            raw_response = provider.generate(prompt)
            
            try:
                from core.models import AuditLog
                user = request.user if request.user and request.user.is_authenticated else None
                AuditLog.objects.create(
                    user=user,
                    action='ai_generation',
                    resource_type='template_analysis',
                    details={
                        'provider': used_provider, 
                        'prompt': prompt, 
                        'raw_response': raw_response,
                        'endpoint': 'analyzeAITemplate'
                    }
                )
            except Exception as e:
                logger.error(f"Failed to save AI audit log: {e}")
            
            import re
            json_str = raw_response.strip()
            analysis = None
            
            try:
                analysis = json.loads(json_str, strict=False)
            except json.JSONDecodeError:
                pass
            
            if analysis is None:
                md_match = re.search(r'```(?:json)?\s*\n(.*?)\n```', json_str, re.DOTALL)
                if md_match:
                    try:
                        analysis = json.loads(md_match.group(1).strip(), strict=False)
                    except json.JSONDecodeError:
                        pass
            
            if analysis is None:
                first_brace = json_str.find('{')
                last_brace = json_str.rfind('}')
                if first_brace != -1 and last_brace > first_brace:
                    try:
                        analysis = json.loads(json_str[first_brace:last_brace + 1], strict=False)
                    except json.JSONDecodeError:
                        pass
            
            if analysis is None:
                raise json.JSONDecodeError("Could not extract JSON", json_str[:200], 0)
            analysis['provider'] = used_provider
            
            return Response({'success': True, 'analysis': analysis})
        except Exception as e:
            logger.error(f"AI analysis error with {used_provider}: {e}")
    
    # Fallback
    analysis = analyze_template_fallback(subject, body_html)
    return Response({'success': True, 'analysis': analysis})


# =====================================================
# TEMPLATE LIBRARY
# =====================================================

@api_view(['GET'])
@permission_classes([AllowAny])
def template_library_list(request):
    """List templates available in the shared library."""
    from templates.models import EmailTemplate
    
    # Get all templates that are shared/global or have no tenant (master templates)
    qs = EmailTemplate.objects.all()
    
    category = request.query_params.get('category')
    difficulty = request.query_params.get('difficulty')
    search = request.query_params.get('search', '')
    
    if category and category != 'all':
        qs = qs.filter(category=category)
    if difficulty and difficulty != 'all':
        qs = qs.filter(difficulty=difficulty)
    if search:
        qs = qs.filter(Q(name__icontains=search) | Q(subject__icontains=search))
    
    templates = []
    for t in qs:
        templates.append({
            'id': str(t.id),
            'name': t.name,
            'description': t.subject or '',
            'category': t.category or '',
            'difficulty': getattr(t, 'difficulty', 'basic'),
            'subject': t.subject,
            'bodyHtml': t.body_html,
            'uses': getattr(t, 'use_count', 0),
            'avgClickRate': None,
        })
    
    return Response({'templates': templates})


@api_view(['POST'])
@permission_classes([AllowAny])
def template_library_clone(request, template_id):
    """Clone a template from the library to a tenant."""
    from templates.models import EmailTemplate
    from tenants.models import Tenant
    
    try:
        source = EmailTemplate.objects.get(pk=template_id)
    except EmailTemplate.DoesNotExist:
        return Response({'error': 'Template not found'}, status=404)
    
    tenant_id = request.data.get('tenantId')
    new_name = request.data.get('name', f'{source.name} (Cópia)')
    
    tenant = None
    if tenant_id:
        try:
            tenant = Tenant.objects.get(pk=tenant_id)
        except Tenant.DoesNotExist:
            pass
    
    clone = EmailTemplate.objects.create(
        tenant=tenant,
        name=new_name,
        subject=source.subject,
        body_html=source.body_html,
        category=source.category,
        has_attachment=source.has_attachment,
    )
    
    return Response({
        'success': True,
        'id': str(clone.id),
        'name': clone.name,
    })


# =====================================================
# ENHANCED SEED
# =====================================================

@api_view(['POST'])
@permission_classes([AllowAny])
def seed_database_enhanced(request):
    """Seed database with rich initial data (excluding targets/groups)."""
    from tenants.models import Tenant
    from core.models import User
    from templates.models import EmailTemplate
    from campaigns.models import Campaign
    from trainings.models import Training
    from campaigns.models_domains import PhishingDomain
    
    created = {'tenants': 0, 'users': 0, 'templates': 0, 'campaigns': 0,
               'trainings': 0, 'domains': 0}
    
    # === Tenants ===
    tenants_data = [
        {'name': 'Under Protection', 'slug': 'under-protection', 'status': 'active',
         'contact_name': 'Administrador', 'contact_email': 'admin@upn.com.br'},
        {'name': 'TechCorp Brasil', 'slug': 'techcorp', 'status': 'active',
         'contact_name': 'Carlos Silva', 'contact_email': 'carlos@techcorp.com.br'},
        {'name': 'Banco Digital S.A.', 'slug': 'banco-digital', 'status': 'active',
         'contact_name': 'Ana Costa', 'contact_email': 'ana@bancodigital.com.br'},
    ]
    for td in tenants_data:
        _, c = Tenant.objects.get_or_create(slug=td['slug'], defaults=td)
        if c:
            created['tenants'] += 1
    
    default_tenant = Tenant.objects.first()
    
    # === Superadmin ===
    if not User.objects.filter(role='superadmin').exists():
        User.objects.create_superuser(
            username='admin', email='admin@matreiro.com',
            password='admin123', role='superadmin',
            first_name='Igor', last_name='Moura'
        )
        created['users'] += 1
    
    # === Templates ===
    templates_data = [
        {
            'name': 'Verificação de Conta - Banco',
            'subject': 'Ação necessária: Verifique sua conta',
            'body_html': '<p>Prezado(a) {{TARGET_NAME}},</p><p>Identificamos uma atividade incomum em sua conta bancária. Para sua proteção, precisamos que você verifique suas informações.</p><p><strong><a href="{{PHISHING_URL}}">Verificar Conta Agora</a></strong></p><p>Caso não reconheça esta solicitação, entre em contato imediatamente.</p><p>Atenciosamente,<br>Equipe de Segurança Bancária</p>',
            'category': 'Financeiro',
            'has_attachment': False,
        },
        {
            'name': 'Atualização Office 365',
            'subject': 'Urgente: Atualize seu Office 365',
            'body_html': '<p>Olá {{TARGET_NAME}},</p><p>Sua licença do Microsoft Office 365 precisa ser atualizada para continuar usando os serviços.</p><p><a href="{{PHISHING_URL}}">Atualizar Licença</a></p><p>Se não atualizar em 48 horas, o acesso será suspenso.</p><p>Suporte Microsoft</p>',
            'category': 'TI',
            'has_attachment': False,
        },
        {
            'name': 'Login - Banco Nacional',
            'subject': 'Confirmação de Login Suspeito',
            'body_html': '<p>{{TARGET_NAME}},</p><p>Detectamos um login de um dispositivo não reconhecido em sua conta.</p><p>Se não foi você, <a href="{{PHISHING_URL}}">bloqueie o acesso imediatamente</a>.</p><p>Banco Nacional de Segurança</p>',
            'category': 'Financeiro',
            'has_attachment': False,
        },
        {
            'name': 'Portal Microsoft 365',
            'subject': 'Sua conta será desativada',
            'body_html': '<p>Prezado(a) {{TARGET_NAME}},</p><p>Notamos que sua conta Microsoft 365 não foi verificada nos últimos 90 dias.</p><p>Verificação obrigatória: <a href="{{PHISHING_URL}}">Verificar Agora</a></p><p>Microsoft Account Team</p>',
            'category': 'TI',
            'has_attachment': False,
        },
        {
            'name': 'Entrega Pendente - Correios',
            'subject': 'Sua encomenda está retida',
            'body_html': '<p>Prezado(a) {{TARGET_NAME}},</p><p>Sua encomenda está retida na unidade de distribuição por pendência de endereço.</p><p>Confirme seus dados para liberar: <a href="{{PHISHING_URL}}">Confirmar Endereço</a></p><p>Código: BR{{TRACKING_CODE}}</p><p>Correios - Sistema de Rastreamento</p>',
            'category': 'Logística',
            'has_attachment': False,
        },
        {
            'name': 'RH - Atualização Cadastral',
            'subject': 'Obrigatório: Atualização de Dados Cadastrais',
            'body_html': '<p>Caro(a) {{TARGET_NAME}},</p><p>Conforme política interna, é necessário atualizar seus dados cadastrais para manter seus benefícios ativos.</p><p><a href="{{PHISHING_URL}}">Acessar Portal RH</a></p><p>Prazo: até sexta-feira desta semana.</p><p>Departamento de Recursos Humanos</p>',
            'category': 'RH',
            'has_attachment': False,
        },
        {
            'name': 'Nota Fiscal Eletrônica',
            'subject': 'NF-e Pendente de Aceite - R$ 2.340,00',
            'body_html': '<p>{{TARGET_NAME}},</p><p>Você possui uma Nota Fiscal Eletrônica pendente de aceite.</p><p>Valor: R$ 2.340,00<br>Vencimento: 3 dias úteis</p><p><a href="{{PHISHING_URL}}">Visualizar NF-e</a></p><p>Portal de Notas Fiscais</p>',
            'category': 'Financeiro',
            'has_attachment': True,
        },
        {
            'name': 'LinkedIn - Verificação de Perfil',
            'subject': 'Seu perfil será limitado',
            'body_html': '<p>Olá {{TARGET_NAME}},</p><p>Seu perfil do LinkedIn será limitado a partir de amanhã devido à nossa nova política de verificação.</p><p><a href="{{PHISHING_URL}}">Verificar Perfil</a></p><p>LinkedIn Safety Team</p>',
            'category': 'Social',
            'has_attachment': False,
        },
    ]
    
    for td in templates_data:
        _, c = EmailTemplate.objects.get_or_create(
            name=td['name'],
            defaults={**td, 'tenant': None}  # Global templates
        )
        if c:
            created['templates'] += 1
    
    # === Campaigns (example) ===
    if default_tenant and not Campaign.objects.exists():
        first_template = EmailTemplate.objects.first()
        superadmin = User.objects.filter(role='superadmin').first()
        
        campaigns_data = [
            {
                'name': 'Campanha Bancária Q1 2026',
                'description': 'Simulação de phishing bancário para avaliar conscientização',
                'status': 'completed',
                'emails_sent': 150,
                'emails_opened': 98,
                'links_clicked': 23,
                'credentials_submitted': 8,
            },
            {
                'name': 'Teste Office 365 - TI',
                'description': 'Teste de phishing simulando Microsoft para equipe de TI',
                'status': 'completed',
                'emails_sent': 45,
                'emails_opened': 38,
                'links_clicked': 5,
                'credentials_submitted': 2,
            },
            {
                'name': 'Campanha RH Março 2026',
                'description': 'Simulação de phishing de atualização cadastral',
                'status': 'active',
                'emails_sent': 200,
                'emails_opened': 145,
                'links_clicked': 34,
                'credentials_submitted': 12,
            },
        ]
        
        for cd in campaigns_data:
            Campaign.objects.create(
                tenant=default_tenant,
                template=first_template,
                created_by=superadmin,
                start_date=timezone.now() - timedelta(days=random.randint(5, 60)),
                **cd,
            )
            created['campaigns'] += 1
    
    # === Trainings ===
    trainings_data = [
        {
            'title': 'Introdução à Segurança Digital',
            'description': 'Treinamento básico sobre segurança digital, senhas e navegação segura.',
            'type': 'video',
            'duration': 15,
            'media_url': '',
        },
        {
            'title': 'Identificando E-mails de Phishing',
            'description': 'Aprenda a identificar e-mails fraudulentos e proteger suas informações.',
            'type': 'presentation',
            'duration': 20,
            'media_url': '',
        },
        {
            'title': 'Proteção de Dados Pessoais (LGPD)',
            'description': 'Entenda a LGPD e como proteger dados pessoais na empresa.',
            'type': 'video',
            'duration': 30,
            'media_url': '',
        },
        {
            'title': 'Engenharia Social - Como se Proteger',
            'description': 'Técnicas de engenharia social e como evitar ser vítima.',
            'type': 'presentation',
            'duration': 25,
            'media_url': '',
        },
    ]
    
    for td in trainings_data:
        _, c = Training.objects.get_or_create(
            title=td['title'],
            defaults={**td, 'tenant': None}
        )
        if c:
            created['trainings'] += 1
    
    # === Phishing Domains ===
    domains_data = [
        {'domain': 'seguranca-banco.com.br', 'description': 'Domínio de phishing bancário', 'is_active': True, 'ssl_enabled': True},
        {'domain': 'verificar-conta.net', 'description': 'Domínio de verificação de conta', 'is_active': True, 'ssl_enabled': True},
        {'domain': 'portal-rh.com.br', 'description': 'Domínio de phishing RH', 'is_active': False, 'ssl_enabled': False},
    ]
    
    for dd in domains_data:
        _, c = PhishingDomain.objects.get_or_create(domain=dd['domain'], defaults=dd)
        if c:
            created['domains'] += 1
    
    return Response({
        'success': True,
        'message': 'Database seeded successfully',
        'created': created,
    })
