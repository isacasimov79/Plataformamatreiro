"""
Serializers for Permissions, Roles, and UserPermissions.
"""
from rest_framework import serializers
from .models import Permission, Role, UserPermission, User


class PermissionSerializer(serializers.ModelSerializer):
    """Serializer for Permission model"""
    
    class Meta:
        model = Permission
        fields = [
            'id', 'code', 'name', 'description', 'module', 
            'resource', 'action', 'is_system', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class RolePermissionSerializer(serializers.ModelSerializer):
    """Serializer for Role with permissions"""
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True,
        write_only=True,
        queryset=Permission.objects.all(),
        source='permissions'
    )
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    permission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Role
        fields = [
            'id', 'name', 'slug', 'description', 'tenant', 'tenant_name',
            'permissions', 'permission_ids', 'permission_count',
            'is_system_role', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_permission_count(self, obj):
        return obj.permissions.count()


class RoleListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for listing roles"""
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    permission_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Role
        fields = [
            'id', 'name', 'slug', 'description', 'tenant', 'tenant_name',
            'permission_count', 'is_system_role', 'created_at'
        ]
    
    def get_permission_count(self, obj):
        return obj.permissions.count()


class UserPermissionSerializer(serializers.ModelSerializer):
    """Serializer for UserPermission model"""
    permission_details = PermissionSerializer(source='permission', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    created_by_email = serializers.EmailField(source='created_by.email', read_only=True)
    
    class Meta:
        model = UserPermission
        fields = [
            'id', 'user', 'user_email', 'permission', 'permission_details',
            'tenant', 'tenant_name', 'resource_id', 'granted',
            'created_at', 'created_by', 'created_by_email'
        ]
        read_only_fields = ['id', 'created_at', 'created_by']


class UserWithPermissionsSerializer(serializers.ModelSerializer):
    """User serializer with custom permissions"""
    custom_permissions = UserPermissionSerializer(many=True, read_only=True)
    all_permissions = serializers.SerializerMethodField()
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'role', 'role_display', 'custom_permissions', 'all_permissions'
        ]
    
    def get_all_permissions(self, obj):
        """Get all permissions for the user (role + custom)"""
        from .permissions import DEFAULT_ROLE_PERMISSIONS
        
        # Get default role permissions
        role_perms = DEFAULT_ROLE_PERMISSIONS.get(obj.role, [])
        
        # Get custom permissions
        custom_perms = obj.custom_permissions.filter(granted=True).values_list(
            'permission__code', flat=True
        )
        
        # Combine and return unique
        all_perms = list(set(list(role_perms) + list(custom_perms)))
        return sorted(all_perms)


class AssignPermissionsSerializer(serializers.Serializer):
    """Serializer for assigning permissions to a user"""
    user_id = serializers.IntegerField()
    permission_codes = serializers.ListField(
        child=serializers.CharField(),
        required=True
    )
    tenant_id = serializers.IntegerField(required=False, allow_null=True)
    resource_id = serializers.CharField(required=False, allow_null=True)
    granted = serializers.BooleanField(default=True)
    
    def validate_permission_codes(self, value):
        """Validate that all permission codes exist"""
        existing = Permission.objects.filter(code__in=value).values_list('code', flat=True)
        invalid = set(value) - set(existing)
        
        if invalid:
            raise serializers.ValidationError(
                f"Invalid permission codes: {', '.join(invalid)}"
            )
        
        return value
    
    def validate_user_id(self, value):
        """Validate that user exists"""
        if not User.objects.filter(id=value).exists():
            raise serializers.ValidationError("User not found")
        return value
