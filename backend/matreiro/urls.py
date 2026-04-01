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
    return Response({"detail": "Authentication credentials were not provided."}, status=401)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # Health
    path('api/health/', health_check, name='health'),
    path('api/v1/health/', health_check, name='health_v1'),
    
    # Auth
    path('api/v1/auth/login', login_view, name='login'),
    
    # Tenants/Clients
    path('api/v1/tenants/', include('tenants.urls')),
    path('api/v1/clients/', include('tenants.urls')),
    
    # Campaigns
    path('api/v1/campaigns/', include('campaigns.urls')),
    
    # Trainings
    path('api/v1/trainings/', include('trainings.urls')),
    
    # Users & Groups
    path('api/v1/users/', users_list, name='users_list'),
    path('api/v1/groups/', groups_list, name='groups_list'),
    path('api/v1/targets/', users_list, name='targets_list'),
    path('api/v1/target-groups/', groups_list, name='target_groups_list'),
    
    # Config endpoints
    path('api/v1/ldap/config', ldap_config, name='ldap_config'),
    path('api/v1/smtp/config', smtp_config, name='smtp_config'),
    path('api/v1/o365/config', o365_config, name='o365_config'),
    path('api/v1/o365/users', o365_users, name='o365_users'),
    path('api/v1/o365/groups', o365_groups, name='o365_groups'),
    path('api/v1/o365/domains', o365_domains, name='o365_domains'),
    path('api/v1/onboarding/config', onboarding_config, name='onboarding_config'),
    path('api/v1/onboarding/history', onboarding_history, name='onboarding_history'),
    
    # Reports
    path('api/v1/reports/overview', reports_overview, name='reports_overview'),
    path('api/v1/reports/timeline', reports_timeline, name='reports_timeline'),
    path('api/v1/reports/departments', reports_departments, name='reports_departments'),
    
    # Audit
    path('api/v1/audit/logs', audit_logs, name='audit_logs'),
    
    # Templates
    path('api/v1/templates', templates_list, name='templates_list'),
    path('api/v1/templates/', templates_list, name='templates_list_slash'),
    
    # RBAC
    path('api/v1/rbac/', include('core.urls.permissions')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
