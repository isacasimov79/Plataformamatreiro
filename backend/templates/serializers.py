from rest_framework import serializers
from .models import EmailTemplate


class EmailTemplateSerializer(serializers.ModelSerializer):
    """
    Serializer that accepts both camelCase (frontend) and snake_case (Django) field names.
    """
    # Accept any category string — we normalize hyphens to underscores in validate_category
    category = serializers.CharField(required=True)
    # Frontend sends these camelCase names; map them to model fields
    htmlContent = serializers.CharField(source='body_html', required=False, write_only=True)
    bodyHtml = serializers.CharField(source='body_html', required=False)
    landingPageHtml = serializers.CharField(source='landing_page_html', required=False, allow_blank=True)
    hasAttachment = serializers.BooleanField(required=False, write_only=True, default=False)
    isGlobal = serializers.BooleanField(source='is_global', required=False, default=False)
    tenantId = serializers.IntegerField(source='tenant_id', required=False, allow_null=True)
    tenantName = serializers.CharField(source='tenant.name', read_only=True)
    attachmentCount = serializers.IntegerField(required=False, write_only=True, default=0)
    landingAttachmentCount = serializers.IntegerField(required=False, write_only=True, default=0)
    captureFields = serializers.ListField(required=False, write_only=True, default=list)

    class Meta:
        model = EmailTemplate
        fields = [
            'id', 'tenant', 'tenantId', 'tenantName', 'name', 'category', 'subject',
            'body_html', 'bodyHtml', 'htmlContent', 'body_text', 'landing_page_html', 'landingPageHtml',
            'is_global', 'isGlobal', 'visibility', 'is_locked',
            'parent_template', 'phishing_domain',
            'created_by', 'created_at', 'updated_at',
            # Write-only fields from frontend (not stored as model fields, just accepted)
            'hasAttachment', 'attachmentCount', 'landingAttachmentCount', 'captureFields',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
        extra_kwargs = {
            'tenant': {'required': False, 'allow_null': True},
            'body_html': {'required': False},
            'body_text': {'required': False, 'allow_blank': True},
            'landing_page_html': {'required': False, 'allow_blank': True},
            'is_global': {'required': False},
            'visibility': {'required': False},
            'is_locked': {'required': False},
            'parent_template': {'required': False, 'allow_null': True},
            'phishing_domain': {'required': False, 'allow_null': True},
            'created_by': {'required': False, 'allow_null': True},
            'category': {'required': True},
        }

    def validate_category(self, value):
        """Accept hyphenated categories from frontend and convert to underscored."""
        return value.replace('-', '_') if value else value

    def validate(self, attrs):
        # Remove write-only non-model fields
        attrs.pop('hasAttachment', None)
        attrs.pop('attachmentCount', None)
        attrs.pop('landingAttachmentCount', None)
        attrs.pop('captureFields', None)

        # Ensure body_html has a value (could come from htmlContent or bodyHtml)
        if not attrs.get('body_html'):
            raise serializers.ValidationError({'body_html': 'HTML content is required'})

        # Handle tenantId string 'current-tenant' or 'null'
        tenant_id = attrs.get('tenant_id')
        if tenant_id and isinstance(tenant_id, str):
            if tenant_id in ('current-tenant', 'null', 'undefined', ''):
                attrs.pop('tenant_id', None)

        return attrs
