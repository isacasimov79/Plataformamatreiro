from django.db import models
from django.utils.translation import gettext_lazy as _


class EmailTemplate(models.Model):
    CATEGORY_CHOICES = [
        ('credential_harvest', 'Credential Harvest'),
        ('malware', 'Malware'),
        ('business_email', 'Business Email Compromise'),
        ('social_engineering', 'Social Engineering'),
        ('spear_phishing', 'Spear Phishing'),
        ('gift_card', 'Gift Card Scam'),
    ]
    
    VISIBILITY_CHOICES = [
        ('private', 'Private (only creator/tenant)'),
        ('shared', 'Shared with selected tenants'),
        ('global', 'Global (available to all)'),
    ]
    
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='templates',
        null=True,
        blank=True,
        help_text='Owner tenant (null = platform-level template)'
    )
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    subject = models.CharField(max_length=300)
    body_html = models.TextField()
    body_text = models.TextField(blank=True)
    landing_page_html = models.TextField(blank=True)
    
    # Sharing/Inheritance
    is_global = models.BooleanField(
        default=False,
        help_text='Legacy field - use visibility instead'
    )
    visibility = models.CharField(
        max_length=20,
        choices=VISIBILITY_CHOICES,
        default='private',
        help_text='Controls who can see and use this template'
    )
    shared_with_tenants = models.ManyToManyField(
        'tenants.Tenant',
        related_name='shared_templates',
        blank=True,
        help_text='Tenants that can use this template (when visibility=shared)'
    )
    parent_template = models.ForeignKey(
        'self',
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='derived_templates',
        help_text='Parent template this was derived from'
    )
    is_locked = models.BooleanField(
        default=False,
        help_text='When true, derived templates cannot modify the content'
    )
    
    # Phishing domain to use for links in this template
    phishing_domain = models.ForeignKey(
        'campaigns.PhishingDomain',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='templates',
        help_text='Phishing domain to use for links in emails'
    )
    
    created_by = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_templates'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'email_templates'
        verbose_name = _('Email Template')
        verbose_name_plural = _('Email Templates')
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
    
    @property
    def is_derived(self):
        return self.parent_template is not None
    
    def is_available_for_tenant(self, tenant):
        """Check if this template is available for a specific tenant."""
        if self.visibility == 'global' or self.is_global:
            return True
        if self.tenant == tenant:
            return True
        if self.visibility == 'shared':
            return self.shared_with_tenants.filter(id=tenant.id).exists()
        return False
