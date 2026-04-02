"""
Serializers for Campaigns app.
"""
from rest_framework import serializers
from .models import Campaign, CampaignEvent, Target, TargetGroup


class CampaignSerializer(serializers.ModelSerializer):
    """Serializer for Campaign model."""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'tenant', 'tenant_name', 'name', 'description', 'status',
            'template', 'start_date', 'end_date', 'target_count', 'target_list',
            'emails_sent', 'emails_opened', 'links_clicked', 'credentials_submitted',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'emails_sent', 'emails_opened', 'links_clicked', 'credentials_submitted']


class CampaignEventSerializer(serializers.ModelSerializer):
    """Serializer for Campaign Event model."""
    
    campaign_name = serializers.CharField(source='campaign.name', read_only=True)
    
    class Meta:
        model = CampaignEvent
        fields = [
            'id', 'campaign', 'campaign_name', 'event_type', 'target_email',
            'ip_address', 'user_agent', 'timestamp', 'details'
        ]
        read_only_fields = fields


class TargetSerializer(serializers.ModelSerializer):
    """Serializer for Target model."""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    full_name = serializers.CharField(read_only=True)
    compromise_rate = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Target
        fields = [
            'id', 'tenant', 'tenant_name', 'email', 'first_name', 'last_name',
            'full_name', 'department', 'position', 'employee_id',
            'phone', 'mobile', 'cpf', 'birth_date', 'city', 'state', 'country',
            'custom_fields', 'source', 'source_id', 'status',
            'opted_out', 'bounced', 'bounce_count',
            'campaigns_received', 'campaigns_opened', 'campaigns_clicked',
            'campaigns_submitted', 'compromise_rate',
            'tags', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class TargetGroupSerializer(serializers.ModelSerializer):
    """Serializer for TargetGroup model."""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    target_count = serializers.IntegerField(read_only=True)
    targets_list = serializers.SerializerMethodField()
    
    class Meta:
        model = TargetGroup
        fields = [
            'id', 'tenant', 'tenant_name', 'name', 'description',
            'targets_list', 'target_count',
            'sync_enabled', 'sync_source', 'sync_config', 'last_sync_at',
            'filter_department', 'filter_position', 'filter_tags',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_targets_list(self, obj):
        return list(obj.targets.values_list('email', flat=True)[:50])
