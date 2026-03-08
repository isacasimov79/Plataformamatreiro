"""
Serializers for Campaigns app.
"""
from rest_framework import serializers
from .models import Campaign, CampaignEvent


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
