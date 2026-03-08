"""
Admin configuration for Tenants app.
"""
from django.contrib import admin
from .models import Tenant


@admin.register(Tenant)
class TenantAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'status', 'parent_tenant', 'active_users_count', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('name', 'slug', 'contact_email')
    prepopulated_fields = {'slug': ('name',)}
    ordering = ('-created_at',)
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'slug', 'domain', 'status', 'parent_tenant')
        }),
        ('Contact Information', {
            'fields': ('contact_name', 'contact_email', 'contact_phone')
        }),
        ('Address', {
            'fields': ('address', 'city', 'state', 'country', 'postal_code')
        }),
        ('Subscription', {
            'fields': ('max_users', 'max_campaigns', 'subscription_start', 'subscription_end')
        }),
        ('Integrations', {
            'fields': ('microsoft_tenant_id', 'google_workspace_domain')
        }),
        ('Settings', {
            'fields': ('settings',),
            'classes': ('collapse',)
        }),
    )
