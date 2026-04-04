"""
Models for System Settings.
Persistent key-value store for platform-level configuration.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _


class SystemSettings(models.Model):
    """Global platform settings (Master-level only)."""
    
    key = models.CharField(max_length=255, unique=True)
    value = models.JSONField(default=dict)
    description = models.TextField(blank=True)
    
    updated_at = models.DateTimeField(auto_now=True)
    updated_by = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='settings_updates'
    )
    
    class Meta:
        db_table = 'system_settings'
        verbose_name = _('System Setting')
        verbose_name_plural = _('System Settings')
    
    def __str__(self):
        return f"Setting: {self.key}"
    
    @classmethod
    def get_value(cls, key, default=None):
        """Get a setting value by key."""
        try:
            setting = cls.objects.get(key=key)
            return setting.value
        except cls.DoesNotExist:
            return default
    
    @classmethod
    def set_value(cls, key, value, user=None, description=''):
        """Set a setting value by key."""
        setting, created = cls.objects.update_or_create(
            key=key,
            defaults={
                'value': value,
                'updated_by': user,
                'description': description,
            }
        )
        return setting
    
    @classmethod
    def get_all_settings(cls):
        """Get all settings as a dict."""
        result = {}
        for setting in cls.objects.all():
            result[setting.key] = setting.value
        return result
