"""
URL configuration for API endpoints.
This provides placeholder endpoints for the frontend.
"""
from django.urls import path
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework import status

@api_view(['GET'])
@permission_classes([AllowAny])
def users_list(request):
    """Placeholder for /api/v1/users"""
    return Response([], status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def groups_list(request):
    """Placeholder for /api/v1/groups"""
    return Response([], status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def ldap_config(request):
    """Placeholder for /api/v1/ldap/config"""
    return Response({"enabled": False}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def smtp_config(request):
    """Placeholder for /api/v1/smtp/config"""
    return Response({"configured": False}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def o365_config(request):
    """Placeholder for /api/v1/o365/config"""
    return Response({"enabled": False}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def o365_users(request):
    """Placeholder for /api/v1/o365/users"""
    return Response([], status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def o365_groups(request):
    """Placeholder for /api/v1/o365/groups"""
    return Response([], status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def o365_domains(request):
    """Placeholder for /api/v1/o365/domains"""
    return Response([], status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def onboarding_config(request):
    """Placeholder for /api/v1/onboarding/config"""
    return Response({"enabled": False}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def onboarding_history(request):
    """Placeholder for /api/v1/onboarding/history"""
    return Response([], status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def reports_overview(request):
    """Placeholder for /api/v1/reports/overview"""
    return Response({"total_campaigns": 0, "total_targets": 0}, status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def reports_timeline(request):
    """Placeholder for /api/v1/reports/timeline"""
    return Response([], status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def reports_departments(request):
    """Placeholder for /api/v1/reports/departments"""
    return Response([], status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([AllowAny])
def audit_logs(request):
    """Placeholder for /api/v1/audit/logs"""
    return Response([], status=status.HTTP_200_OK)

urlpatterns = [
    path('users/', users_list, name='users_list'),
    path('groups/', groups_list, name='groups_list'),
    path('ldap/config', ldap_config, name='ldap_config'),
    path('smtp/config', smtp_config, name='smtp_config'),
    path('o365/config', o365_config, name='o365_config'),
    path('o365/users', o365_users, name='o365_users'),
    path('o365/groups', o365_groups, name='o365_groups'),
    path('o365/domains', o365_domains, name='o365_domains'),
    path('onboarding/config', onboarding_config, name='onboarding_config'),
    path('onboarding/history', onboarding_history, name='onboarding_history'),
    path('reports/overview', reports_overview, name='reports_overview'),
    path('reports/timeline', reports_timeline, name='reports_timeline'),
    path('reports/departments', reports_departments, name='reports_departments'),
    path('audit/logs', audit_logs, name='audit_logs'),
]
