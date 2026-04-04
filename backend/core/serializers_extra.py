"""
Serializers for Notification and SystemSettings models.
"""
from rest_framework import serializers
from .models_notification import Notification
from .models_system_settings import SystemSettings


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for Notification model."""
    
    class Meta:
        model = Notification
        fields = [
            'id', 'user', 'tenant', 'title', 'message',
            'notification_type', 'related_object_type', 'related_object_id',
            'is_read', 'read_at', 'created_at',
        ]
        read_only_fields = ['id', 'created_at', 'read_at']


class SystemSettingsSerializer(serializers.ModelSerializer):
    """Serializer for SystemSettings model."""
    
    class Meta:
        model = SystemSettings
        fields = ['id', 'key', 'value', 'description', 'updated_at', 'updated_by']
        read_only_fields = ['id', 'updated_at']
