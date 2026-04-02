"""
URL configuration for Matreiro Platform.
All endpoints needed by the React frontend.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from campaigns.models import Campaign, CampaignEvent
from campaigns.serializers import CampaignSerializer, CampaignEventSerializer


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "healthy", "service": "matreiro-api"})


# Real Campaign endpoints
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def campaigns_list(request):
    """List all campaigns or create a new one."""
    if request.method == 'GET':
        campaigns = Campaign.objects.all()[:100]
        serializer = CampaignSerializer(campaigns, many=True)
        return Response(serializer.data)
    else:
        serializer = CampaignSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([AllowAny])
def campaign_detail(request, pk):
    """Get, update or delete a campaign."""
    try:
        campaign = Campaign.objects.get(pk=pk)
    except Campaign.DoesNotExist:
        return Response({"error": "Campaign not found"}, status=404)
    
    if request.method == 'GET':
        serializer = CampaignSerializer(campaign)
        return Response(serializer.data)
    elif request.method == 'PUT':
        serializer = CampaignSerializer(campaign, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    else:
        campaign.delete()
        return Response(status=204)


@api_view(['GET'])
@permission_classes([AllowAny])
def campaign_events(request, campaign_id):
    """Get all events for a campaign."""
    try:
        campaign = Campaign.objects.get(pk=campaign_id)
    except Campaign.DoesNotExist:
        return Response({"error": "Campaign not found"}, status=404)
    
    events = campaign.events.all()
    serializer = CampaignEventSerializer(events, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def reports_overview(request):
    """Get overview statistics for reports."""
    total_campaigns = Campaign.objects.count()
    total_sent = sum(c.emails_sent for c in Campaign.objects.all())
    total_opened = sum(c.emails_opened for c in Campaign.objects.all())
    total_clicked = sum(c.links_clicked for c in Campaign.objects.all())
    total_submitted = sum(c.credentials_submitted for c in Campaign.objects.all())
    
    return Response({
        "total_campaigns": total_campaigns,
        "total_targets": total_sent,
        "total_sent": total_sent,
        "total_opened": total_opened,
        "total_clicked": total_clicked,
        "total_submitted": total_submitted,
        "open_rate": (total_opened / total_sent * 100) if total_sent > 0 else 0,
        "click_rate": (total_clicked / total_sent * 100) if total_sent > 0 else 0,
    })


@api_view(['GET'])
@permission_classes([AllowAny])
def reports_timeline(request):
    """Get timeline of campaign events."""
    events = CampaignEvent.objects.select_related('campaign').order_by('-timestamp')[:100]
    data = []
    for e in events:
        data.append({
            'id': e.id,
            'campaign': e.campaign.name,
            'event_type': e.event_type,
            'target_email': e.target_email,
            'timestamp': e.timestamp.isoformat() if e.timestamp else None,
        })
    return Response(data)


@api_view(['GET'])
@permission_classes([AllowAny])
def reports_departments(request):
    """Get statistics by department."""
    from django.db.models import Count
    departments = (
        CampaignEvent.objects.exclude(details__department__isnull=True)
        .values('details__department')
        .annotate(count=Count('id'))
    )
    return Response(list(departments))


@api_view(['GET'])
@permission_classes([AllowAny])
def audit_logs(request):
    """Get audit logs."""
    events = CampaignEvent.objects.select_related('campaign').order_by('-timestamp')[:200]
    data = []
    for e in events:
        data.append({
            'id': e.id,
            'action': e.event_type,
            'user': e.target_email,
            'resource': f'Campaign: {e.campaign.name}',
            'timestamp': e.timestamp.isoformat() if e.timestamp else None,
            'ip_address': e.ip_address,
        })
    return Response(data)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def templates_list(request):
    """List all templates or create a new one."""
    from templates.models import EmailTemplate
    from templates.serializers import EmailTemplateSerializer
    
    if request.method == 'GET':
        templates = EmailTemplate.objects.all()[:100]
        serializer = EmailTemplateSerializer(templates, many=True)
        return Response(serializer.data)
    else:
        serializer = EmailTemplateSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET'])
@permission_classes([AllowAny])
def template_detail(request, pk):
    """Get a template by ID."""
    from templates.models import EmailTemplate
    from templates.serializers import EmailTemplateSerializer
    
    try:
        template = EmailTemplate.objects.get(pk=pk)
    except EmailTemplate.DoesNotExist:
        return Response({"error": "Template not found"}, status=404)
    
    serializer = EmailTemplateSerializer(template)
    return Response(serializer.data)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def targets_list(request):
    """List all targets or create a new one."""
    from campaigns.models import Target
    from campaigns.serializers import TargetSerializer
    
    if request.method == 'GET':
        targets = Target.objects.all()[:100]
        serializer = TargetSerializer(targets, many=True)
        return Response(serializer.data)
    else:
        serializer = TargetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def target_groups_list(request):
    """List all target groups or create a new one."""
    from campaigns.models import TargetGroup
    from campaigns.serializers import TargetGroupSerializer
    
    if request.method == 'GET':
        groups = TargetGroup.objects.all()[:100]
        serializer = TargetGroupSerializer(groups, many=True)
        return Response(serializer.data)
    else:
        serializer = TargetGroupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


# Stub functions that return minimal valid responses
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])
def ldap_config(request):
    return Response({"enabled": False})


@api_view(['POST'])
@permission_classes([AllowAny])
def ldap_test(request):
    return Response({"success": True, "message": "Test placeholder"})


@api_view(['GET'])
@permission_classes([AllowAny])
def smtp_config(request):
    return Response({"configured": False})


@api_view(['GET'])
@permission_classes([AllowAny])
def o365_config(request):
    return Response({"enabled": False})


@api_view(['GET'])
@permission_classes([AllowAny])
def o365_users(request):
    return Response([])


@api_view(['GET'])
@permission_classes([AllowAny])
def o365_groups(request):
    return Response([])


@api_view(['GET'])
@permission_classes([AllowAny])
def o365_domains(request):
    return Response([])


@api_view(['POST'])
@permission_classes([AllowAny])
def o365_sync(request):
    return Response({"status": "synced", "users": 0, "groups": 0})


@api_view(['GET'])
@permission_classes([AllowAny])
def o365_groups_filter(request):
    return Response([])


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
def targets_sync(request):
    return Response({"status": "synced", "targets": 0})


@api_view(['GET'])
@permission_classes([AllowAny])
def login_view(request):
    return Response({"detail": "Authentication required"}, status=401)


@api_view(['GET'])
@permission_classes([AllowAny])
def auth_callback(request):
    return Response({"access_token": "", "token_type": "Bearer"})


# Import tracking URLs
from .track_urls import urlpatterns as track_urls

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Docs
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Health
    path('api/health/', health_check),
    path('api/v1/health/', health_check),
    path('api/v2/health/', health_check),
    
    # Auth
    path('api/v1/auth/login', login_view),
    path('api/v2/auth/login', login_view),
    path('api/v1/auth/callback', auth_callback),
    path('api/v2/auth/callback', auth_callback),
    
    # Tenants/Clients
    path('api/v1/tenants/', targets_list),
    path('api/v1/clients/', targets_list),
    path('api/v2/tenants/', targets_list),
    path('api/v2/clients/', targets_list),
    
    # Campaigns - REAL endpoints
    path('api/v1/campaigns/', campaigns_list),
    path('api/v1/campaigns/<int:pk>/', campaign_detail),
    path('api/v1/campaigns/<int:campaign_id>/events/', campaign_events),
    path('api/v2/campaigns/', campaigns_list),
    path('api/v2/campaigns/<int:pk>/', campaign_detail),
    
    # Targets - REAL endpoints
    path('api/v1/targets/', targets_list),
    path('api/v1/targets/sync', targets_sync),
    path('api/v1/target-groups/', target_groups_list),
    
    # Trainings
    path('api/v1/trainings/', targets_list),
    
    # LDAP
    path('api/v1/ldap/config', ldap_config),
    path('api/v1/ldap/test', ldap_test),
    path('api/v2/ldap/config', ldap_config),
    
    # SMTP
    path('api/v1/smtp/config', smtp_config),
    path('api/v2/smtp/config', smtp_config),
    
    # O365
    path('api/v1/o365/config', o365_config),
    path('api/v1/o365/users/', o365_users),
    path('api/v1/o365/groups/', o365_groups),
    path('api/v1/o365/groups/sync', o365_sync),
    path('api/v1/o365/domains/', o365_domains),
    path('api/v1/o365/sync', o365_sync),
    path('api/v2/o365/config', o365_config),
    path('api/v2/o365/users/', o365_users),
    path('api/v2/o365/groups/', o365_groups),
    path('api/v2/o365/groups/sync', o365_sync),
    path('api/v2/o365/domains/', o365_domains),
    path('api/v2/o365/sync', o365_sync),
    
    # Onboarding
    path('api/v1/onboarding/config', onboarding_config),
    path('api/v1/onboarding/history', onboarding_history),
    path('api/v2/onboarding/config', onboarding_config),
    path('api/v2/onboarding/history', onboarding_history),
    
    # Phishing
    path('api/v1/phishing/config', phishing_config),
    path('api/v2/phishing/config', phishing_config),
    
    # Reports - REAL endpoints
    path('api/v1/reports/overview', reports_overview),
    path('api/v1/reports/timeline', reports_timeline),
    path('api/v1/reports/departments', reports_departments),
    path('api/v2/reports/overview', reports_overview),
    path('api/v2/reports/timeline', reports_timeline),
    path('api/v2/reports/departments', reports_departments),
    
    # Audit - REAL endpoint
    path('api/v1/audit/logs/', audit_logs),
    path('api/v2/audit/logs/', audit_logs),
    
    # Templates - REAL endpoints
    path('api/v1/templates/', templates_list),
    path('api/v1/templates/<int:pk>/', template_detail),
    path('api/v2/templates/', templates_list),
    path('api/v2/templates/<int:pk>/', template_detail),
    
    # Tracking endpoints (click/open pixel)
    path('api/v1/track/', include(track_urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
