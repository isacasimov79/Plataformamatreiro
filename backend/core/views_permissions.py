"""
Views for Permissions, Roles, and UserPermissions management.
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Q

from .models import Permission, Role, UserPermission, User
from .serializers_permissions import (
    PermissionSerializer,
    RolePermissionSerializer,
    RoleListSerializer,
    UserPermissionSerializer,
    AssignPermissionsSerializer,
    UserWithPermissionsSerializer,
)
from .permissions import has_permission, SYSTEM_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS


class PermissionViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing Permissions.
    Permissions can only be viewed, not created/edited (system-managed).
    """
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter permissions based on user role"""
        user = self.request.user
        
        # Superadmins see all
        if user.role == 'superadmin':
            return Permission.objects.all()
        
        # Others see only their available permissions
        return Permission.objects.all()
    
    @action(detail=False, methods=['get'])
    def by_module(self, request):
        """Get permissions grouped by module"""
        permissions = self.get_queryset()
        
        modules = permissions.values('module').annotate(
            count=Count('id')
        ).order_by('module')
        
        result = []
        for module_data in modules:
            module_name = module_data['module']
            module_perms = permissions.filter(module=module_name)
            
            result.append({
                'module': module_name,
                'count': module_data['count'],
                'permissions': PermissionSerializer(module_perms, many=True).data
            })
        
        return Response(result)
    
    @action(detail=False, methods=['get'])
    def available_for_role(self, request):
        """Get available permissions for a specific role"""
        role = request.query_params.get('role')
        
        if not role:
            return Response(
                {'error': 'role parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get default permissions for this role
        role_perms = DEFAULT_ROLE_PERMISSIONS.get(role, [])
        
        return Response({
            'role': role,
            'permissions': role_perms,
            'count': len(role_perms)
        })


class RoleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing Roles.
    """
    queryset = Role.objects.all()
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return RoleListSerializer
        return RolePermissionSerializer
    
    def get_queryset(self):
        """Filter roles based on user"""
        user = self.request.user
        
        if user.role == 'superadmin':
            return Role.objects.all()
        elif user.tenant:
            # Tenant admins see global roles + their tenant roles
            return Role.objects.filter(
                Q(tenant__isnull=True) | Q(tenant=user.tenant)
            )
        else:
            # Others see only global roles
            return Role.objects.filter(tenant__isnull=True)
    
    def perform_create(self, serializer):
        """Set tenant for new roles"""
        user = self.request.user
        
        # Non-superadmins can only create tenant-specific roles
        if user.role != 'superadmin' and user.tenant:
            serializer.save(tenant=user.tenant)
        else:
            serializer.save()
    
    @action(detail=True, methods=['post'])
    def add_permissions(self, request, pk=None):
        """Add permissions to a role"""
        role = self.get_object()
        permission_ids = request.data.get('permission_ids', [])
        
        if not permission_ids:
            return Response(
                {'error': 'permission_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        permissions = Permission.objects.filter(id__in=permission_ids)
        role.permissions.add(*permissions)
        
        return Response({
            'success': True,
            'added': len(permissions),
            'total': role.permissions.count()
        })
    
    @action(detail=True, methods=['post'])
    def remove_permissions(self, request, pk=None):
        """Remove permissions from a role"""
        role = self.get_object()
        permission_ids = request.data.get('permission_ids', [])
        
        if not permission_ids:
            return Response(
                {'error': 'permission_ids is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        permissions = Permission.objects.filter(id__in=permission_ids)
        role.permissions.remove(*permissions)
        
        return Response({
            'success': True,
            'removed': len(permissions),
            'total': role.permissions.count()
        })


class UserPermissionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing individual user permissions.
    """
    queryset = UserPermission.objects.all()
    serializer_class = UserPermissionSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter user permissions based on user role"""
        user = self.request.user
        
        if user.role == 'superadmin':
            return UserPermission.objects.all()
        elif user.tenant:
            return UserPermission.objects.filter(
                Q(user__tenant=user.tenant) | Q(tenant=user.tenant)
            )
        else:
            return UserPermission.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """Set created_by when creating permission"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['post'])
    def assign_permissions(self, request):
        """Assign multiple permissions to a user"""
        serializer = AssignPermissionsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        user = User.objects.get(id=data['user_id'])
        permission_codes = data['permission_codes']
        
        # Get permissions
        permissions = Permission.objects.filter(code__in=permission_codes)
        
        created_count = 0
        for permission in permissions:
            _, created = UserPermission.objects.get_or_create(
                user=user,
                permission=permission,
                tenant_id=data.get('tenant_id'),
                resource_id=data.get('resource_id'),
                defaults={
                    'granted': data.get('granted', True),
                    'created_by': request.user
                }
            )
            if created:
                created_count += 1
        
        return Response({
            'success': True,
            'user_id': user.id,
            'permissions_assigned': created_count,
            'total_permissions': permissions.count()
        })
    
    @action(detail=False, methods=['post'])
    def revoke_permissions(self, request):
        """Revoke permissions from a user"""
        user_id = request.data.get('user_id')
        permission_codes = request.data.get('permission_codes', [])
        
        if not user_id or not permission_codes:
            return Response(
                {'error': 'user_id and permission_codes are required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get permissions
        permissions = Permission.objects.filter(code__in=permission_codes)
        
        # Delete user permissions
        deleted_count, _ = UserPermission.objects.filter(
            user_id=user_id,
            permission__in=permissions
        ).delete()
        
        return Response({
            'success': True,
            'user_id': user_id,
            'permissions_revoked': deleted_count
        })
    
    @action(detail=False, methods=['get'])
    def user_permissions(self, request):
        """Get all permissions for a specific user"""
        user_id = request.query_params.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {'error': 'User not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = UserWithPermissionsSerializer(user)
        return Response(serializer.data)


class PermissionCheckViewSet(viewsets.ViewSet):
    """
    ViewSet for checking permissions.
    """
    permission_classes = [IsAuthenticated]
    
    @action(detail=False, methods=['post'])
    def check(self, request):
        """Check if user has specific permission"""
        permission_code = request.data.get('permission')
        
        if not permission_code:
            return Response(
                {'error': 'permission parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        has_perm = has_permission(request.user, permission_code)
        
        return Response({
            'permission': permission_code,
            'has_permission': has_perm,
            'user': request.user.email,
            'role': request.user.role
        })
    
    @action(detail=False, methods=['post'])
    def check_multiple(self, request):
        """Check multiple permissions at once"""
        permission_codes = request.data.get('permissions', [])
        
        if not permission_codes:
            return Response(
                {'error': 'permissions parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        results = {}
        for code in permission_codes:
            results[code] = has_permission(request.user, code)
        
        return Response({
            'permissions': results,
            'user': request.user.email,
            'role': request.user.role,
            'has_all': all(results.values()),
            'has_any': any(results.values())
        })
    
    @action(detail=False, methods=['get'])
    def my_permissions(self, request):
        """Get all permissions for current user"""
        serializer = UserWithPermissionsSerializer(request.user)
        return Response(serializer.data)
