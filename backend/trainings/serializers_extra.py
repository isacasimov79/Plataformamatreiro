"""
Serializers for Certificate model.
"""
from rest_framework import serializers
from .models_certificate import Certificate


class CertificateSerializer(serializers.ModelSerializer):
    """Serializer for Certificate model."""
    
    training_title = serializers.CharField(source='training.title', read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    is_valid = serializers.BooleanField(read_only=True)
    
    class Meta:
        model = Certificate
        fields = [
            'id', 'training', 'training_title',
            'user', 'target', 'tenant', 'tenant_name',
            'certificate_hash', 'recipient_name', 'recipient_email',
            'score', 'issued_at', 'expires_at', 'is_valid',
        ]
        read_only_fields = ['id', 'certificate_hash', 'issued_at']
