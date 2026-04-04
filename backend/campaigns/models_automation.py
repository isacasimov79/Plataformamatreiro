"""
Models for Phishing Automations.
Automations trigger campaigns based on events (new users, group changes, etc.)
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class Automation(models.Model):
    """Automation rule for triggering phishing campaigns."""
    
    TRIGGER_CHOICES = [
        ('new_user_ad', 'New user in Active Directory / Microsoft 365'),
        ('new_user_google', 'New user in Google Workspace'),
        ('user_added_group', 'User added to a group'),
        ('user_removed_group', 'User removed from a group'),
        ('schedule', 'Scheduled (cron-based)'),
    ]
    
    CONDITION_TYPE_CHOICES = [
        ('always', 'Always execute'),
        ('in_group', 'User is in group(s)'),
        ('not_in_group', 'User is NOT in group(s)'),
        ('in_department', 'User is in department'),
        ('custom', 'Custom logic'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('draft', 'Draft'),
    ]
    
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='automations',
        null=True,
        blank=True
    )
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Trigger configuration
    trigger = models.CharField(max_length=50, choices=TRIGGER_CHOICES)
    trigger_delay = models.IntegerField(
        default=0,
        help_text='Delay in days after trigger event before executing'
    )
    
    # Condition configuration
    condition_type = models.CharField(
        max_length=50,
        choices=CONDITION_TYPE_CHOICES,
        default='always'
    )
    condition_group_ids = models.JSONField(
        default=list,
        blank=True,
        help_text='Group IDs for group-based conditions'
    )
    condition_department = models.CharField(max_length=200, blank=True)
    condition_custom_logic = models.TextField(
        blank=True,
        help_text='Custom condition logic (JSON expression)'
    )
    
    # Action: which campaign template to use
    campaign_template = models.ForeignKey(
        'templates.EmailTemplate',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='automations'
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    # Execution tracking
    execution_count = models.IntegerField(default=0)
    last_executed_at = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_by = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_automations'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'automations'
        verbose_name = _('Automation')
        verbose_name_plural = _('Automations')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} ({self.get_trigger_display()})"
    
    @property
    def condition(self):
        """Return condition as a dict for API serialization."""
        return {
            'type': self.condition_type,
            'groupIds': self.condition_group_ids,
            'department': self.condition_department,
            'customLogic': self.condition_custom_logic,
        }


class AutomationExecution(models.Model):
    """Log of automation executions."""
    
    automation = models.ForeignKey(
        Automation,
        on_delete=models.CASCADE,
        related_name='executions'
    )
    
    target = models.ForeignKey(
        'campaigns.Target',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    campaign = models.ForeignKey(
        'campaigns.Campaign',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text='Campaign created by this execution'
    )
    
    status = models.CharField(
        max_length=20,
        choices=[
            ('success', 'Success'),
            ('failed', 'Failed'),
            ('skipped', 'Skipped (condition not met)'),
        ],
        default='success'
    )
    
    details = models.JSONField(default=dict, blank=True)
    executed_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'automation_executions'
        verbose_name = _('Automation Execution')
        verbose_name_plural = _('Automation Executions')
        ordering = ['-executed_at']
    
    def __str__(self):
        return f"{self.automation.name} - {self.status} at {self.executed_at}"
