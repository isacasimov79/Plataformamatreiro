"""
Admin configuration for Core app.
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, AuditLog


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ('email', 'username', 'first_name', 'last_name', 'role', 'tenant', 'is_active', 'created_at')
    list_filter = ('role', 'is_active', 'is_staff', 'tenant')
    search_fields = ('email', 'username', 'first_name', 'last_name')
    ordering = ('-created_at',)
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Matreiro Info', {
            'fields': ('role', 'tenant', 'phone', 'department', 'last_login_ip')
        }),
        ('Impersonation', {
            'fields': ('original_user', 'is_impersonating')
        }),
    )


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'resource_type', 'resource_id', 'ip_address', 'timestamp')
    list_filter = ('action', 'resource_type', 'timestamp')
    search_fields = ('user__email', 'resource_type', 'resource_id')
    readonly_fields = ('user', 'action', 'resource_type', 'resource_id', 'details', 'ip_address', 'user_agent', 'timestamp')
    ordering = ('-timestamp',)
