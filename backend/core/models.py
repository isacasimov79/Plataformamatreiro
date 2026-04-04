"""
Core models for Matreiro Platform.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

# Import sub-models so Django discovers them
from .models_notification import Notification  # noqa: F401
from .models_system_settings import SystemSettings  # noqa: F401


class User(AbstractUser):
    """Custom User model with extended fields."""
    
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('tenant_admin', 'Tenant Admin'),
        ('sub_tenant_admin', 'Sub-Tenant Admin'),
        ('manager', 'Manager'),
        ('analyst', 'Analyst'),
        ('viewer', 'Viewer'),
    ]
    
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    tenant = models.ForeignKey(
        'tenants.Tenant', 
        on_delete=models.CASCADE, 
        related_name='users',
        null=True,
        blank=True
    )
    phone = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    language = models.CharField(max_length=10, default='pt-br', choices=[
        ('pt-br', 'Português (Brasil)'),
        ('en', 'English'),
        ('es', 'Español'),
    ])
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    # Impersonation fields
    original_user = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='impersonated_sessions'
    )
    is_impersonating = models.BooleanField(default=False)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        verbose_name = _('User')
        verbose_name_plural = _('Users')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def full_name(self):
        return self.get_full_name() or self.email
    
    def has_permission(self, permission_code):
        """Check if user has a specific permission"""
        from .permissions import has_permission
        return has_permission(self, permission_code)


class Permission(models.Model):
    """Granular permission in the system"""
    
    code = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    module = models.CharField(max_length=50, db_index=True)
    resource = models.CharField(max_length=50, blank=True)
    action = models.CharField(max_length=50, blank=True)
    is_system = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'permissions'
        verbose_name = _('Permission')
        verbose_name_plural = _('Permissions')
        ordering = ['module', 'code']
        indexes = [
            models.Index(fields=['module', 'code']),
        ]
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class Role(models.Model):
    """Custom role with specific permissions"""
    
    name = models.CharField(max_length=100)
    slug = models.SlugField(unique=True)
    description = models.TextField(blank=True)
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='custom_roles',
        null=True,
        blank=True,
        help_text='Leave empty for global roles'
    )
    permissions = models.ManyToManyField(Permission, related_name='roles', blank=True)
    is_system_role = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'roles'
        verbose_name = _('Role')
        verbose_name_plural = _('Roles')
        ordering = ['name']
        unique_together = [['slug', 'tenant']]
    
    def __str__(self):
        return f"{self.name} ({self.tenant or 'Global'})"


class UserPermission(models.Model):
    """Individual user permissions (overrides role permissions)"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='custom_permissions')
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE)
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        help_text='Permission scope limited to this tenant'
    )
    resource_id = models.CharField(
        max_length=100,
        null=True,
        blank=True,
        help_text='Specific resource ID (e.g., campaign_id)'
    )
    granted = models.BooleanField(default=True, help_text='True=granted, False=explicitly denied')
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='granted_permissions'
    )
    
    class Meta:
        db_table = 'user_permissions'
        verbose_name = _('User Permission')
        verbose_name_plural = _('User Permissions')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'permission']),
            models.Index(fields=['user', 'tenant']),
        ]
    
    def __str__(self):
        action = 'granted' if self.granted else 'denied'
        return f"{self.user.email} - {self.permission.code} ({action})"


class AuditLog(models.Model):
    """Audit log for tracking user actions."""
    
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('view', 'View'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('impersonate_start', 'Impersonate Start'),
        ('impersonate_end', 'Impersonate End'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=100, null=True, blank=True)
    details = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_logs'
        verbose_name = _('Audit Log')
        verbose_name_plural = _('Audit Logs')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.action} - {self.resource_type} at {self.timestamp}"