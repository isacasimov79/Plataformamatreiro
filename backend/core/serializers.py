"""
Serializers for Core app.
"""
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, AuditLog


class UserSerializer(serializers.ModelSerializer):
    """Serializer for User model."""
    
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name', 
            'role', 'tenant', 'tenant_name', 'phone', 'department',
            'is_active', 'created_at', 'updated_at', 'last_login'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login']


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating users."""
    
    password = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, required=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = [
            'username', 'email', 'password', 'password_confirm',
            'first_name', 'last_name', 'role', 'tenant', 'phone', 'department'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match."})
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user


class LoginSerializer(serializers.Serializer):
    """Serializer for user login."""
    
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True, style={'input_type': 'password'})
    
    def validate(self, attrs):
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'), username=email, password=password)
            
            if not user:
                raise serializers.ValidationError('Invalid credentials.')
            
            if not user.is_active:
                raise serializers.ValidationError('User account is disabled.')
            
            attrs['user'] = user
            return attrs
        else:
            raise serializers.ValidationError('Must include "email" and "password".')


class ImpersonateSerializer(serializers.Serializer):
    """Serializer for impersonation."""
    
    target_user_id = serializers.IntegerField(required=True)


class AuditLogSerializer(serializers.ModelSerializer):
    """Serializer for Audit Log."""
    
    userName = serializers.SerializerMethodField()
    userEmail = serializers.CharField(source='user.email', read_only=True, default='')
    category = serializers.CharField(source='resource_type', read_only=True)
    status = serializers.SerializerMethodField()
    ipAddress = serializers.CharField(source='ip_address', read_only=True, default='')
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'userName', 'userEmail', 'action', 'category', 'resource_type',
            'resource_id', 'details', 'ipAddress', 'ip_address', 'user_agent',
            'status', 'timestamp'
        ]
        read_only_fields = fields
    
    def get_userName(self, obj):
        if obj.user:
            return obj.user.get_full_name() or obj.user.email
        return 'Sistema'
    
    def get_status(self, obj):
        """Derive status from details or action."""
        if isinstance(obj.details, dict):
            if obj.details.get('error'):
                return 'failure'
            if obj.details.get('warning'):
                return 'warning'
        return 'success'
