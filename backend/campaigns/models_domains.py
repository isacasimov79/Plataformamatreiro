"""
Models for Phishing Domains.
Domains used for phishing simulations (e.g., giobo.com.br).
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class PhishingDomain(models.Model):
    """Phishing simulation domain configuration."""
    
    domain = models.CharField(
        max_length=255,
        unique=True,
        help_text='Domain name for phishing simulation (e.g., giobo.com.br)'
    )
    
    # Ownership: null = platform-level (Master manages)
    owner_tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_phishing_domains',
        help_text='Tenant that owns this domain (null = platform-level)'
    )
    
    # Which tenants can use this domain
    allowed_tenants = models.ManyToManyField(
        'tenants.Tenant',
        related_name='available_phishing_domains',
        blank=True,
        help_text='Tenants allowed to use this domain for campaigns'
    )
    
    is_active = models.BooleanField(default=True)
    ssl_enabled = models.BooleanField(default=False)
    
    description = models.TextField(
        blank=True,
        help_text='Description of what this domain simulates'
    )
    
    # DNS configuration
    dns_configured = models.BooleanField(default=False)
    dns_records = models.JSONField(
        default=dict,
        blank=True,
        help_text='DNS records needed for this domain'
    )
    
    # Tracking
    campaigns_count = models.IntegerField(default=0)
    last_used_at = models.DateTimeField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'phishing_domains'
        verbose_name = _('Phishing Domain')
        verbose_name_plural = _('Phishing Domains')
        ordering = ['domain']
    
    def __str__(self):
        return self.domain
