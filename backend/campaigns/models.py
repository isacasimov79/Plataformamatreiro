"""
Models for Campaigns app.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _

# Import target models
from .models_targets import Target, TargetGroup, TargetImport

# Import landing page models
from .models_landing import (
    LandingPage,
    LandingPageAttachment,
    CapturedData,
    AttachmentDownload,
)

# Make them available when importing from campaigns.models
__all__ = [
    'Campaign',
    'CampaignEvent',
    'Target',
    'TargetGroup',
    'TargetImport',
    'LandingPage',
    'LandingPageAttachment',
    'CapturedData',
    'AttachmentDownload',
]


class Campaign(models.Model):
    """Phishing campaign model."""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='campaigns')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    template = models.ForeignKey('templates.EmailTemplate', on_delete=models.SET_NULL, null=True)
    
    # Schedule
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    
    # Targets
    target_count = models.IntegerField(default=0)
    target_list = models.JSONField(default=list, blank=True)
    
    # Metrics
    emails_sent = models.IntegerField(default=0)
    emails_opened = models.IntegerField(default=0)
    links_clicked = models.IntegerField(default=0)
    credentials_submitted = models.IntegerField(default=0)
    
    created_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True, related_name='created_campaigns')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'campaigns'
        verbose_name = _('Campaign')
        verbose_name_plural = _('Campaigns')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.tenant.name}"


class CampaignEvent(models.Model):
    """Track individual campaign events."""
    
    EVENT_TYPES = [
        ('sent', 'Email Sent'),
        ('opened', 'Email Opened'),
        ('clicked', 'Link Clicked'),
        ('submitted', 'Credentials Submitted'),
        ('reported', 'Reported as Phishing'),
    ]
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    target_email = models.EmailField()
    
    # Event details
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict, blank=True)
    
    class Meta:
        db_table = 'campaign_events'
        verbose_name = _('Campaign Event')
        verbose_name_plural = _('Campaign Events')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['campaign', '-timestamp']),
            models.Index(fields=['target_email', '-timestamp']),
        ]
    
    def __str__(self):
        return f"{self.campaign.name} - {self.event_type} - {self.target_email}"