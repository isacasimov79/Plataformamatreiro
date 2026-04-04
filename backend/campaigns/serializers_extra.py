"""
Serializers for new Campaigns models.
"""
from rest_framework import serializers
from .models_automation import Automation, AutomationExecution
from .models_domains import PhishingDomain
from .models_landing import LandingPage, CapturedData


class AutomationSerializer(serializers.ModelSerializer):
    """Serializer for Automation model."""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    campaign_template_name = serializers.CharField(
        source='campaign_template.name', read_only=True
    )
    condition = serializers.DictField(read_only=True)
    
    class Meta:
        model = Automation
        fields = [
            'id', 'tenant', 'tenant_name', 'name', 'description',
            'trigger', 'trigger_delay',
            'condition_type', 'condition_group_ids',
            'condition_department', 'condition_custom_logic',
            'condition',
            'campaign_template', 'campaign_template_name',
            'status', 'execution_count', 'last_executed_at',
            'created_by', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'execution_count', 'last_executed_at', 'created_at', 'updated_at']

    # Map frontend field names to model fields
    campaignTemplateId = serializers.IntegerField(
        source='campaign_template_id', required=False, write_only=True
    )
    tenantId = serializers.IntegerField(
        source='tenant_id', required=False, write_only=True
    )


class AutomationExecutionSerializer(serializers.ModelSerializer):
    class Meta:
        model = AutomationExecution
        fields = '__all__'
        read_only_fields = ['id', 'executed_at']


class PhishingDomainSerializer(serializers.ModelSerializer):
    """Serializer for PhishingDomain model."""
    
    owner_tenant_name = serializers.CharField(
        source='owner_tenant.name', read_only=True
    )
    allowed_tenant_ids = serializers.PrimaryKeyRelatedField(
        source='allowed_tenants', many=True, read_only=True
    )
    
    class Meta:
        model = PhishingDomain
        fields = [
            'id', 'domain', 'owner_tenant', 'owner_tenant_name',
            'allowed_tenant_ids', 'is_active', 'ssl_enabled',
            'description', 'dns_configured', 'dns_records',
            'campaigns_count', 'last_used_at',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'campaigns_count', 'last_used_at', 'created_at', 'updated_at']


class LandingPageSerializer(serializers.ModelSerializer):
    """Serializer for LandingPage model."""
    
    template_name = serializers.CharField(source='template.name', read_only=True)
    conversion_rate = serializers.FloatField(read_only=True)
    
    class Meta:
        model = LandingPage
        fields = [
            'id', 'template', 'template_name',
            'html_content', 'capture_enabled', 'capture_fields',
            'capture_field_labels', 'success_redirect_url',
            'success_message', 'track_ip', 'track_user_agent',
            'track_referer', 'track_geolocation',
            'views_count', 'submissions_count', 'conversion_rate',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'views_count', 'submissions_count', 'created_at', 'updated_at']


class CapturedDataSerializer(serializers.ModelSerializer):
    """Serializer for CapturedData (without decrypted data for listing)."""
    
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    
    class Meta:
        model = CapturedData
        fields = [
            'id', 'campaign', 'campaign_name', 'target', 'target_email',
            'fields_captured', 'ip_address', 'user_agent',
            'browser', 'device', 'os',
            'geo_country', 'geo_region', 'geo_city',
            'timestamp',
        ]
        read_only_fields = ['id', 'timestamp']
