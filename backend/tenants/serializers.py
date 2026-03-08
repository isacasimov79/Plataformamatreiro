"""
Serializers for Tenants app.
"""
from rest_framework import serializers
from .models import Tenant


class TenantSerializer(serializers.ModelSerializer):
    """Serializer for Tenant model."""
    
    active_users_count = serializers.IntegerField(read_only=True)
    is_sub_tenant = serializers.BooleanField(read_only=True)
    parent_tenant_name = serializers.CharField(source='parent_tenant.name', read_only=True)
    
    class Meta:
        model = Tenant
        fields = [
            'id', 'name', 'slug', 'domain', 'status', 'parent_tenant', 'parent_tenant_name',
            'is_sub_tenant', 'contact_name', 'contact_email', 'contact_phone',
            'address', 'city', 'state', 'country', 'postal_code',
            'settings', 'max_users', 'max_campaigns', 'active_users_count',
            'subscription_start', 'subscription_end',
            'microsoft_tenant_id', 'google_workspace_domain',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TenantCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating tenants."""
    
    class Meta:
        model = Tenant
        fields = [
            'name', 'slug', 'domain', 'status', 'parent_tenant',
            'contact_name', 'contact_email', 'contact_phone',
            'max_users', 'max_campaigns',
            'microsoft_tenant_id', 'google_workspace_domain'
        ]
