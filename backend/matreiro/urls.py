"""
URL configuration for Matreiro Platform.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    return Response({"status": "healthy", "service": "matreiro-api"})

@api_view(['GET'])
@permission_classes([AllowAny])
def users_list(request):
    return Response([])

@api_view(['GET'])
@permission_classes([AllowAny])
def groups_list(request):
    return Response([])

@api_view(['GET'])
@permission_classes([AllowAny])
def ldap_config(request):
    return Response({"enabled": False})

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

@api_view(['GET'])
@permission_classes([AllowAny])
def onboarding_config(request):
    return Response({"enabled": False})

@api_view(['GET'])
@permission_classes([AllowAny])
def onboarding_history(request):
    return Response([])

@api_view(['GET'])
@permission_classes([AllowAny])
def reports_overview(request):
    return Response({"total_campaigns": 0, "total_targets": 0})

@api_view(['GET'])
@permission_classes([AllowAny])
def reports_timeline(request):
    return Response([])

@api_view(['GET'])
@permission_classes([AllowAny])
def reports_departments(request):
    return Response([])

@api_view(['GET'])
@permission_classes([AllowAny])
def audit_logs(request):
    return Response([])

@api_view(['GET'])
@permission_classes([AllowAny])
def templates_list(request):
    return Response([])

@api_view(['GET'])
@permission_classes([AllowAny])
def login_view(request):
    return Response({"detail": "Credentials required"}, status=401)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Health
    path('api/health/', health_check, name='health'),
    path('api/v1/health/', health_check, name='health_v1'),
    path('api/v2/health/', health_check, name='health_v2'),
    
    # Auth
    path('api/v1/auth/login', login_view, name='login'),
    path('api/v2/auth/login', login_view, name='login_v2'),
    
    # Tenants/Clients
    path('api/v1/tenants/', include('tenants.urls')),
    path('api/v1/clients/', include('tenants.urls')),
    path('api/v2/tenants/', include('tenants.urls')),
    
    # Campaigns
    path('api/v1/campaigns/', include('campaigns.urls')),
    path('api/v2/campaigns/', include('campaigns.urls')),
    
    # Trainings
    path('api/v1/trainings/', include('trainings.urls')),
    
    # Users & Groups
    path('api/v1/users/', users_list, name='users_list'),
    path('api/v1/groups/', groups_list, name='groups_list'),
    path('api/v1/targets/', users_list, name='targets_list'),
    path('api/v1/target-groups/', groups_list, name='target_groups_list'),
    path('api/v2/users/', users_list, name='users_list_v2'),
    path('api/v2/groups/', groups_list, name='groups_list_v2'),
    
    # Config endpoints
    path('api/v1/ldap/config', ldap_config, name='ldap_config'),
    path('api/v2/ldap/config', ldap_config, name='ldap_config_v2'),
    path('api/v1/smtp/config', smtp_config, name='smtp_config'),
    path('api/v2/smtp/config', smtp_config, name='smtp_config_v2'),
    path('api/v1/o365/config', o365_config, name='o365_config'),
    path('api/v2/o365/config', o365_config, name='o365_config_v2'),
    path('api/v1/o365/users', o365_users, name='o365_users'),
    path('api/v2/o365/users', o365_users, name='o365_users_v2'),
    path('api/v1/o365/groups', o365_groups, name='o365_groups'),
    path('api/v2/o365/groups', o365_groups, name='o365_groups_v2'),
    path('api/v1/o365/domains', o365_domains, name='o365_domains'),
    path('api/v2/o365/domains', o365_domains, name='o365_domains_v2'),
    path('api/v1/onboarding/config', onboarding_config, name='onboarding_config'),
    path('api/v2/onboarding/config', onboarding_config, name='onboarding_config_v2'),
    path('api/v1/onboarding/history', onboarding_history, name='onboarding_history'),
    path('api/v2/onboarding/history', onboarding_history, name='onboarding_history_v2'),
    
    # Reports
    path('api/v1/reports/overview', reports_overview, name='reports_overview'),
    path('api/v2/reports/overview', reports_overview, name='reports_overview_v2'),
    path('api/v1/reports/timeline', reports_timeline, name='reports_timeline'),
    path('api/v2/reports/timeline', reports_timeline, name='reports_timeline_v2'),
    path('api/v1/reports/departments', reports_departments, name='reports_departments'),
    path('api/v2/reports/departments', reports_departments, name='reports_departments_v2'),
    
    # Audit
    path('api/v1/audit/logs', audit_logs, name='audit_logs'),
    path('api/v2/audit/logs', audit_logs, name='audit_logs_v2'),
    
    # Templates
    path('api/v1/templates', templates_list, name='templates_list'),
    path('api/v1/templates/', templates_list, name='templates_list_slash'),
    path('api/v2/templates', templates_list, name='templates_list_v2'),
    
    # RBAC
    path('api/v1/rbac/', include('core.urls.permissions')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
