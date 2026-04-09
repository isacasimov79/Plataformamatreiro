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


class TenantSettingsSerializer(serializers.ModelSerializer):
    """Serializer for Tenant Settings — email, SMTP, Azure, Syslog configs."""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        from .models_settings import TenantSettings as TS
        model = TS
        fields = [
            'id', 'tenant', 'tenant_name',
            # Email sending method
            'email_sending_method', 'smtp_master_domain',
            # SMTP
            'smtp_host', 'smtp_port', 'smtp_user', 'smtp_from_email',
            'smtp_from_name', 'smtp_encryption', 'smtp_configured', 'smtp_verified',
            # Azure
            'azure_tenant_id', 'azure_client_id', 'azure_auto_sync',
            'azure_sync_interval_hours', 'azure_last_sync_at', 'azure_allowed_domains',
            # Syslog
            'syslog_host', 'syslog_port', 'syslog_protocol', 'syslog_facility',
            'syslog_audit_enabled', 'syslog_phishing_enabled',
            # General
            'primary_color',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'tenant_name', 'smtp_verified', 'azure_last_sync_at', 'created_at', 'updated_at']
    
    def update(self, instance, validated_data):
        # Handle SMTP password separately (write-only)
        smtp_password = self.context['request'].data.get('smtp_password')
        if smtp_password:
            instance.set_smtp_password(smtp_password)
        
        azure_secret = self.context['request'].data.get('azure_client_secret')
        if azure_secret:
            instance.set_azure_client_secret(azure_secret)
        
        return super().update(instance, validated_data)
