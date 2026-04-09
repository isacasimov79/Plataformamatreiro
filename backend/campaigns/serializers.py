"""
Serializers for Campaigns app.
"""
from rest_framework import serializers
from .models import Campaign, CampaignEvent, Target, TargetGroup


class CampaignSerializer(serializers.ModelSerializer):
    """Serializer for Campaign model."""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    stats = serializers.SerializerMethodField()
    tenantId = serializers.IntegerField(source='tenant_id', read_only=True)
    templateId = serializers.IntegerField(source='template_id', read_only=True)
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'tenant', 'tenantId', 'tenant_name', 'name', 'description', 'status',
            'template', 'templateId', 'start_date', 'end_date', 'target_count', 'target_list',
            'emails_sent', 'emails_opened', 'links_clicked', 'credentials_submitted',
            'stats',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'emails_sent', 'emails_opened', 'links_clicked', 'credentials_submitted']
    
    def get_stats(self, obj):
        return {
            'sent': obj.emails_sent or 0,
            'opened': obj.emails_opened or 0,
            'clicked': obj.links_clicked or 0,
            'submitted': obj.credentials_submitted or 0,
        }


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
    """Serializer for Target model with frontend aliases."""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    tenantId = serializers.IntegerField(source='tenant_id', read_only=True)
    full_name = serializers.CharField(read_only=True)
    name = serializers.CharField(source='full_name', read_only=True)
    compromise_rate = serializers.FloatField(read_only=True)
    group = serializers.SerializerMethodField()
    
    class Meta:
        model = Target
        fields = [
            'id', 'tenant', 'tenantId', 'tenant_name', 'email',
            'first_name', 'last_name', 'full_name', 'name',
            'department', 'position', 'employee_id',
            'phone', 'mobile', 'cpf', 'birth_date', 'city', 'state', 'country',
            'custom_fields', 'source', 'source_id', 'status',
            'opted_out', 'bounced', 'bounce_count',
            'campaigns_received', 'campaigns_opened', 'campaigns_clicked',
            'campaigns_submitted', 'compromise_rate',
            'group', 'tags', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_group(self, obj):
        first_group = obj.groups.first()
        return first_group.name if first_group else None


class TargetGroupSerializer(serializers.ModelSerializer):
    """Serializer for TargetGroup model."""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    target_count = serializers.IntegerField(read_only=True)
    targets_list = serializers.SerializerMethodField()
    manual_emails = serializers.ListField(
        child=serializers.EmailField(),
        write_only=True,
        required=False,
    )
    
    class Meta:
        model = TargetGroup
        fields = [
            'id', 'tenant', 'tenant_name', 'name', 'description',
            'targets_list', 'target_count',
            'sync_enabled', 'sync_source', 'sync_config', 'last_sync_at',
            'filter_department', 'filter_position', 'filter_tags',
            'manual_emails', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_targets_list(self, obj):
        return list(obj.targets.values_list('email', flat=True)[:50])
        
    def create(self, validated_data):
        manual_emails = validated_data.pop('manual_emails', [])
        group = super().create(validated_data)
        
        if manual_emails:
            for email in manual_emails:
                target, _ = Target.objects.get_or_create(
                    email=email.strip().lower(),
                    tenant=group.tenant,
                    defaults={'first_name': email.split('@')[0], 'last_name': ''}
                )
                group.targets.add(target)
            
            # target_count is a property, no need to save it.
            group.save()
            
        return group
