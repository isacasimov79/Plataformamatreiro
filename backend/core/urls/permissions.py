"""
URL configuration for permissions, roles, and user permissions.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from ..views_permissions import (
    PermissionViewSet,
    RoleViewSet,
    UserPermissionViewSet,
    PermissionCheckViewSet,
)

router = DefaultRouter()
router.register(r'permissions', PermissionViewSet, basename='permission')
router.register(r'roles', RoleViewSet, basename='role')
router.register(r'user-permissions', UserPermissionViewSet, basename='user-permission')
router.register(r'check', PermissionCheckViewSet, basename='permission-check')

urlpatterns = router.urls
