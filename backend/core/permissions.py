"""
Permission system for Matreiro Platform.
"""
from functools import wraps
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission
from django.db.models import Q


# System permissions definition
SYSTEM_PERMISSIONS = {
    # Campaigns
    'campaigns.create': {'name': 'Create campaigns', 'module': 'campaigns'},
    'campaigns.read': {'name': 'View campaigns', 'module': 'campaigns'},
    'campaigns.update': {'name': 'Edit campaigns', 'module': 'campaigns'},
    'campaigns.delete': {'name': 'Delete campaigns', 'module': 'campaigns'},
    'campaigns.start': {'name': 'Start campaigns', 'module': 'campaigns'},
    'campaigns.pause': {'name': 'Pause campaigns', 'module': 'campaigns'},
    'campaigns.view_results': {'name': 'View campaign results', 'module': 'campaigns'},
    'campaigns.export': {'name': 'Export campaign data', 'module': 'campaigns'},
    
    # Targets
    'targets.create': {'name': 'Create targets', 'module': 'targets'},
    'targets.read': {'name': 'View targets', 'module': 'targets'},
    'targets.update': {'name': 'Edit targets', 'module': 'targets'},
    'targets.delete': {'name': 'Delete targets', 'module': 'targets'},
    'targets.import': {'name': 'Import targets', 'module': 'targets'},
    'targets.export': {'name': 'Export targets', 'module': 'targets'},
    
    # Templates
    'templates.create': {'name': 'Create templates', 'module': 'templates'},
    'templates.read': {'name': 'View templates', 'module': 'templates'},
    'templates.update': {'name': 'Edit templates', 'module': 'templates'},
    'templates.delete': {'name': 'Delete templates', 'module': 'templates'},
    'templates.create_global': {'name': 'Create global templates', 'module': 'templates'},
    
    # Users
    'users.create': {'name': 'Create users', 'module': 'users'},
    'users.read': {'name': 'View users', 'module': 'users'},
    'users.update': {'name': 'Edit users', 'module': 'users'},
    'users.delete': {'name': 'Delete users', 'module': 'users'},
    'users.impersonate': {'name': 'Impersonate users', 'module': 'users'},
    'users.manage_roles': {'name': 'Manage user roles', 'module': 'users'},
    
    # Tenants
    'tenants.create': {'name': 'Create tenants', 'module': 'tenants'},
    'tenants.read': {'name': 'View tenants', 'module': 'tenants'},
    'tenants.update': {'name': 'Edit tenants', 'module': 'tenants'},
    'tenants.delete': {'name': 'Delete tenants', 'module': 'tenants'},
    'tenants.configure': {'name': 'Configure integrations', 'module': 'tenants'},
    'tenants.create_sub': {'name': 'Create sub-tenants', 'module': 'tenants'},
    
    # Trainings
    'trainings.create': {'name': 'Create trainings', 'module': 'trainings'},
    'trainings.read': {'name': 'View trainings', 'module': 'trainings'},
    'trainings.update': {'name': 'Edit trainings', 'module': 'trainings'},
    'trainings.delete': {'name': 'Delete trainings', 'module': 'trainings'},
    'trainings.assign': {'name': 'Assign trainings', 'module': 'trainings'},
    'trainings.view_results': {'name': 'View training results', 'module': 'trainings'},
    
    # Reports
    'reports.view': {'name': 'View reports', 'module': 'reports'},
    'reports.export': {'name': 'Export reports', 'module': 'reports'},
    'reports.global': {'name': 'View global reports', 'module': 'reports'},
    'reports.captured_data': {'name': 'View captured credentials', 'module': 'reports'},
    
    # System
    'system.audit_logs': {'name': 'View audit logs', 'module': 'system'},
    'system.settings': {'name': 'Manage system settings', 'module': 'system'},
    'system.roles': {'name': 'Manage roles and permissions', 'module': 'system'},
    'system.integrations': {'name': 'Manage integrations', 'module': 'system'},
}


# Default role permissions
DEFAULT_ROLE_PERMISSIONS = {
    'superadmin': list(SYSTEM_PERMISSIONS.keys()),  # All permissions
    
    'tenant_admin': [
        'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete',
        'campaigns.start', 'campaigns.pause', 'campaigns.view_results', 'campaigns.export',
        'targets.create', 'targets.read', 'targets.update', 'targets.delete',
        'targets.import', 'targets.export',
        'templates.create', 'templates.read', 'templates.update', 'templates.delete',
        'users.create', 'users.read', 'users.update', 'users.delete', 'users.manage_roles',
        'tenants.read', 'tenants.update', 'tenants.configure', 'tenants.create_sub',
        'trainings.create', 'trainings.read', 'trainings.update', 'trainings.delete',
        'trainings.assign', 'trainings.view_results',
        'reports.view', 'reports.export', 'reports.captured_data',
        'system.audit_logs', 'system.integrations',
    ],
    
    'sub_tenant_admin': [
        'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete',
        'campaigns.start', 'campaigns.pause', 'campaigns.view_results',
        'targets.create', 'targets.read', 'targets.update', 'targets.delete',
        'targets.import', 'targets.export',
        'templates.create', 'templates.read', 'templates.update', 'templates.delete',
        'users.create', 'users.read', 'users.update', 'users.delete',
        'trainings.read', 'trainings.assign', 'trainings.view_results',
        'reports.view', 'reports.export', 'reports.captured_data',
    ],
    
    'manager': [
        'campaigns.create', 'campaigns.read', 'campaigns.update',
        'campaigns.start', 'campaigns.pause', 'campaigns.view_results',
        'targets.create', 'targets.read', 'targets.update', 'targets.import',
        'templates.read',
        'users.read',
        'trainings.read', 'trainings.assign', 'trainings.view_results',
        'reports.view', 'reports.export',
    ],
    
    'analyst': [
        'campaigns.read', 'campaigns.view_results',
        'targets.read',
        'templates.read',
        'users.read',
        'trainings.read', 'trainings.view_results',
        'reports.view', 'reports.export',
    ],
    
    'viewer': [
        'campaigns.read',
        'targets.read',
        'templates.read',
        'reports.view',
    ],
}


def has_permission(user, permission_code, tenant=None, resource_id=None):
    """
    Check if user has a specific permission.
    
    Args:
        user: User object
        permission_code: Permission code (e.g., 'campaigns.create')
        tenant: Optional tenant for tenant-specific permissions
        resource_id: Optional resource ID for object-level permissions
    
    Returns:
        bool: True if user has permission, False otherwise
    """
    # Superadmins have all permissions
    if user.role == 'superadmin':
        return True
    
    # Check if permission exists in user's role default permissions
    role_permissions = DEFAULT_ROLE_PERMISSIONS.get(user.role, [])
    if permission_code in role_permissions:
        # Additional tenant check
        if tenant and user.tenant:
            # User can only access resources from their tenant
            if tenant.id != user.tenant.id:
                # Check if it's a parent-child relationship
                if not (tenant.parent_tenant_id == user.tenant.id):
                    return False
        return True
    
    # TODO: Check custom user permissions from database
    # from .models import UserPermission
    # user_perms = UserPermission.objects.filter(
    #     user=user,
    #     permission__code=permission_code
    # )
    # if tenant:
    #     user_perms = user_perms.filter(Q(tenant=tenant) | Q(tenant__isnull=True))
    # if resource_id:
    #     user_perms = user_perms.filter(Q(resource_id=resource_id) | Q(resource_id__isnull=True))
    # 
    # return user_perms.exists()
    
    return False


def require_permission(permission_code):
    """
    Decorator to require a specific permission.
    
    Usage:
        @require_permission('campaigns.create')
        def create_campaign(request):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not has_permission(request.user, permission_code):
                raise PermissionDenied(
                    f"You don't have permission to perform this action: {permission_code}"
                )
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def require_any_permission(*permission_codes):
    """
    Decorator to require ANY of the specified permissions.
    
    Usage:
        @require_any_permission('campaigns.create', 'campaigns.update')
        def manage_campaign(request):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not any(has_permission(request.user, code) for code in permission_codes):
                raise PermissionDenied(
                    f"You don't have any of the required permissions: {', '.join(permission_codes)}"
                )
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


def require_all_permissions(*permission_codes):
    """
    Decorator to require ALL of the specified permissions.
    
    Usage:
        @require_all_permissions('campaigns.create', 'templates.read')
        def create_campaign_with_template(request):
            ...
    """
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not all(has_permission(request.user, code) for code in permission_codes):
                raise PermissionDenied(
                    f"You don't have all required permissions: {', '.join(permission_codes)}"
                )
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator


class HasPermission(BasePermission):
    """
    DRF Permission class for checking permissions.
    
    Usage in ViewSet:
        class CampaignViewSet(viewsets.ModelViewSet):
            permission_classes = [HasPermission]
            required_permission = 'campaigns.read'
            
            def get_required_permission(self):
                if self.action == 'create':
                    return 'campaigns.create'
                elif self.action in ['update', 'partial_update']:
                    return 'campaigns.update'
                elif self.action == 'destroy':
                    return 'campaigns.delete'
                return 'campaigns.read'
    """
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Get required permission from view
        if hasattr(view, 'get_required_permission'):
            permission = view.get_required_permission()
        elif hasattr(view, 'required_permission'):
            permission = view.required_permission
        else:
            # Default to allowing if no permission specified
            return True
        
        return has_permission(request.user, permission)
    
    def has_object_permission(self, request, view, obj):
        """Check object-level permissions"""
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superadmins can access everything
        if request.user.role == 'superadmin':
            return True
        
        # Check if object belongs to user's tenant
        if hasattr(obj, 'tenant'):
            if request.user.tenant:
                if obj.tenant.id == request.user.tenant.id:
                    return True
                # Check parent-child relationship
                if obj.tenant.parent_tenant_id == request.user.tenant.id:
                    return True
            return False
        
        return True


class PermissionViewSetMixin:
    """
    Mixin for ViewSets to handle permissions easily.
    
    Usage:
        class CampaignViewSet(PermissionViewSetMixin, viewsets.ModelViewSet):
            permission_map = {
                'list': 'campaigns.read',
                'retrieve': 'campaigns.read',
                'create': 'campaigns.create',
                'update': 'campaigns.update',
                'partial_update': 'campaigns.update',
                'destroy': 'campaigns.delete',
            }
    """
    permission_map = {}
    
    def get_required_permission(self):
        """Get the required permission based on the action"""
        return self.permission_map.get(self.action, None)
    
    def check_object_permissions(self, request, obj):
        """Override to add custom object permission checks"""
        super().check_object_permissions(request, obj)
        
        permission = self.get_required_permission()
        if permission and not has_permission(request.user, permission):
            self.permission_denied(
                request,
                message=f"You don't have permission: {permission}"
            )
