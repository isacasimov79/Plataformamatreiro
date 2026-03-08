"""
Models for Tenants app - Multi-tenancy support.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class Tenant(models.Model):
    """Main tenant (client) model."""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('suspended', 'Suspended'),
        ('trial', 'Trial'),
    ]
    
    name = models.CharField(max_length=200)
    slug = models.SlugField(unique=True)
    domain = models.CharField(max_length=200, blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='trial')
    
    # Parent tenant for sub-clients
    parent_tenant = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='sub_tenants',
        null=True,
        blank=True
    )
    
    # Contact information
    contact_name = models.CharField(max_length=200, blank=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    
    # Address
    address = models.TextField(blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    country = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    
    # Configuration
    settings = models.JSONField(default=dict, blank=True)
    
    # Subscription
    max_users = models.IntegerField(default=10)
    max_campaigns = models.IntegerField(default=5)
    subscription_start = models.DateField(null=True, blank=True)
    subscription_end = models.DateField(null=True, blank=True)
    
    # Integrations
    microsoft_tenant_id = models.CharField(max_length=200, blank=True, null=True)
    google_workspace_domain = models.CharField(max_length=200, blank=True, null=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'tenants'
        verbose_name = _('Tenant')
        verbose_name_plural = _('Tenants')
        ordering = ['name']
    
    def __str__(self):
        return self.name
    
    @property
    def is_sub_tenant(self):
        return self.parent_tenant is not None
    
    @property
    def active_users_count(self):
        return self.users.filter(is_active=True).count()
