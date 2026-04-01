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

@api_view(['GET', 'POST'])
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
def reports_overview(request):
    return Response({"total_campaigns": 0, "total_targets": 0, "total_sent": 0, "total_opened": 0, "total_clicked": 0})

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
def debug_logs(request):
    return Response([])

@api_view(['GET'])
@permission_classes([AllowAny])
def templates_list(request):
    return Response([])

@api_view(['GET'])
@permission_classes([AllowAny])
def login_view(request):
    return Response({"detail": "Authentication required"}, status=401)

@api_view(['GET'])
@permission_classes([AllowAny])
def auth_callback(request):
    return Response({"access_token": "", "token_type": "Bearer"})

urlpatterns = [
    path('admin/', admin.site.urls),
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
    path('api/v1/tenants', users_list),
    path('api/v1/tenants/', users_list),
    path('api/v1/clients', users_list),
    path('api/v1/clients/', users_list),
    path('api/v2/tenants/', users_list),
    path('api/v2/clients/', users_list),
    
    # Campaigns
    path('api/v1/campaigns', users_list),
    path('api/v1/campaigns/', users_list),
    path('api/v2/campaigns/', users_list),
    
    # Trainings
    path('api/v1/trainings/', users_list),
    
    # Users & Groups
    path('api/v1/users', users_list),
    path('api/v1/users/', users_list),
    path('api/v1/groups', groups_list),
    path('api/v1/groups/', groups_list),
    path('api/v1/targets', users_list),
    path('api/v1/targets/', users_list),
    path('api/v1/targets/sync', targets_sync),
    path('api/v1/target-groups', groups_list),
    path('api/v1/target-groups/', groups_list),
    path('api/v2/users/', users_list),
    path('api/v2/groups/', groups_list),
    
    # LDAP
    path('api/v1/ldap/config', ldap_config),
    path('api/v1/ldap/test', ldap_test),
    path('api/v2/ldap/config', ldap_config),
    
    # SMTP
    path('api/v1/smtp/config', smtp_config),
    path('api/v2/smtp/config', smtp_config),
    
    # O365
    path('api/v1/o365/config', o365_config),
    path('api/v1/o365/users', o365_users),
    path('api/v1/o365/users/', o365_users),
    path('api/v1/o365/groups', o365_groups),
    path('api/v1/o365/groups/', o365_groups),
    path('api/v1/o365/groups/sync', o365_sync),
    path('api/v1/o365/domains', o365_domains),
    path('api/v1/o365/sync', o365_sync),
    path('api/v2/o365/config', o365_config),
    path('api/v2/o365/users', o365_users),
    path('api/v2/o365/users/', o365_users),
    path('api/v2/o365/groups', o365_groups),
    path('api/v2/o365/groups/', o365_groups),
    path('api/v2/o365/groups/sync', o365_sync),
    path('api/v2/o365/groups/filter', o365_groups_filter),
    path('api/v2/o365/domains', o365_domains),
    path('api/v2/o365/sync', o365_sync),
    
    # Onboarding
    path('api/v1/onboarding/config', onboarding_config),
    path('api/v1/onboarding/history', onboarding_history),
    path('api/v2/onboarding/config', onboarding_config),
    path('api/v2/onboarding/history', onboarding_history),
    
    # Phishing
    path('api/v1/phishing/config', phishing_config),
    path('api/v2/phishing/config', phishing_config),
    
    # Reports
    path('api/v1/reports/overview', reports_overview),
    path('api/v1/reports/timeline', reports_timeline),
    path('api/v1/reports/departments', reports_departments),
    path('api/v2/reports/overview', reports_overview),
    path('api/v2/reports/timeline', reports_timeline),
    path('api/v2/reports/departments', reports_departments),
    
    # Audit
    path('api/v1/audit/logs', audit_logs),
    path('api/v1/audit/logs/', audit_logs),
    path('api/v2/audit/logs', audit_logs),
    path('api/v2/audit/logs/', audit_logs),
    
    # Debug
    path('api/v1/debug/logs', debug_logs),
    path('api/v1/debug/logs/', debug_logs),
    
    # Templates
    path('api/v1/templates', templates_list),
    path('api/v1/templates/', templates_list),
    path('api/v2/templates', templates_list),
    path('api/v2/templates/', templates_list),
    
    # RBAC
    path('api/v1/rbac/', users_list),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
