"""
Models for Tenant-specific Settings.
Each tenant can have custom SMTP, integration, and other configurations.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings as django_settings
import json


class TenantSettings(models.Model):
    """Per-tenant configuration settings."""
    
    tenant = models.OneToOneField(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='tenant_settings'
    )
    
    # ========================
    # SMTP Configuration
    # ========================
    smtp_host = models.CharField(max_length=255, blank=True)
    smtp_port = models.IntegerField(default=587)
    smtp_user = models.CharField(max_length=255, blank=True)
    smtp_password_encrypted = models.BinaryField(
        null=True,
        blank=True,
        help_text='Encrypted SMTP password (Fernet)'
    )
    smtp_from_email = models.EmailField(blank=True)
    smtp_from_name = models.CharField(max_length=255, blank=True)
    smtp_encryption = models.CharField(
        max_length=10,
        choices=[('none', 'None'), ('tls', 'TLS'), ('ssl', 'SSL')],
        default='tls'
    )
    
    # ========================
    # Email Sending Method
    # ========================
    EMAIL_METHOD_CHOICES = [
        ('smtp_client', 'SMTP do Cliente'),
        ('graph_api', 'Microsoft Graph API'),
        ('smtp_master', 'SMTP da Tenant Master'),
    ]
    email_sending_method = models.CharField(
        max_length=20,
        choices=EMAIL_METHOD_CHOICES,
        default='smtp_client',
        help_text='Método de envio de e-mail: SMTP próprio do cliente, Graph API ou SMTP compartilhado do Master'
    )
    smtp_master_domain = models.CharField(
        max_length=255,
        blank=True,
        help_text='Domínio do SMTP Master autorizado para este tenant'
    )
    
    smtp_configured = models.BooleanField(default=False)
    smtp_verified = models.BooleanField(default=False)
    smtp_last_test_at = models.DateTimeField(null=True, blank=True)
    
    # ========================
    # Azure AD / Microsoft 365
    # ========================
    azure_tenant_id = models.CharField(max_length=255, blank=True)
    azure_client_id = models.CharField(max_length=255, blank=True)
    azure_client_secret_encrypted = models.BinaryField(
        null=True,
        blank=True,
        help_text='Encrypted Azure client secret (Fernet)'
    )
    azure_auto_sync = models.BooleanField(default=False)
    azure_sync_interval_hours = models.IntegerField(default=24)
    azure_last_sync_at = models.DateTimeField(null=True, blank=True)
    azure_allowed_domains = models.JSONField(
        default=list,
        blank=True,
        help_text='Domains to filter when syncing from Azure AD'
    )
    
    # ========================
    # Google Workspace
    # ========================
    google_service_account_json = models.TextField(
        blank=True,
        help_text='Google Workspace Service Account JSON'
    )
    google_domain = models.CharField(max_length=255, blank=True)
    google_auto_sync = models.BooleanField(default=False)
    google_last_sync_at = models.DateTimeField(null=True, blank=True)
    
    # ========================
    # Syslog
    # ========================
    syslog_host = models.CharField(max_length=255, blank=True)
    syslog_port = models.IntegerField(default=514)
    syslog_protocol = models.CharField(
        max_length=5,
        choices=[('udp', 'UDP'), ('tcp', 'TCP')],
        default='udp'
    )
    syslog_facility = models.CharField(max_length=20, default='local0')
    syslog_audit_enabled = models.BooleanField(default=False)
    syslog_phishing_enabled = models.BooleanField(default=False)
    
    # ========================
    # General
    # ========================
    custom_logo = models.ImageField(
        upload_to='tenant_logos/',
        null=True,
        blank=True
    )
    primary_color = models.CharField(max_length=7, default='#834a8b')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tenant_settings'
        verbose_name = _('Tenant Settings')
        verbose_name_plural = _('Tenant Settings')
    
    def __str__(self):
        return f"Settings for {self.tenant.name}"
    
    def set_smtp_password(self, password):
        """Encrypt and store SMTP password."""
        from cryptography.fernet import Fernet
        key = getattr(django_settings, 'ENCRYPTION_KEY', None)
        if not key:
            raise ValueError("ENCRYPTION_KEY not configured")
        if isinstance(key, str):
            key = key.encode()
        f = Fernet(key)
        self.smtp_password_encrypted = f.encrypt(password.encode())
    
    def get_smtp_password(self):
        """Decrypt and return SMTP password."""
        if not self.smtp_password_encrypted:
            return ''
        from cryptography.fernet import Fernet
        key = getattr(django_settings, 'ENCRYPTION_KEY', None)
        if not key:
            raise ValueError("ENCRYPTION_KEY not configured")
        if isinstance(key, str):
            key = key.encode()
        f = Fernet(key)
        return f.decrypt(bytes(self.smtp_password_encrypted)).decode()
    
    def set_azure_client_secret(self, secret):
        """Encrypt and store Azure client secret."""
        from cryptography.fernet import Fernet
        key = getattr(django_settings, 'ENCRYPTION_KEY', None)
        if not key:
            raise ValueError("ENCRYPTION_KEY not configured")
        if isinstance(key, str):
            key = key.encode()
        f = Fernet(key)
        self.azure_client_secret_encrypted = f.encrypt(secret.encode())
    
    def get_azure_client_secret(self):
        """Decrypt and return Azure client secret."""
        if not self.azure_client_secret_encrypted:
            return ''
        from cryptography.fernet import Fernet
        key = getattr(django_settings, 'ENCRYPTION_KEY', None)
        if not key:
            raise ValueError("ENCRYPTION_KEY not configured")
        if isinstance(key, str):
            key = key.encode()
        f = Fernet(key)
        return f.decrypt(bytes(self.azure_client_secret_encrypted)).decode()
