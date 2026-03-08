"""
Models for Landing Pages and Captured Data.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.conf import settings
import json


class LandingPage(models.Model):
    """Landing page configuration for phishing campaigns"""
    
    template = models.OneToOneField(
        'templates.EmailTemplate',
        on_delete=models.CASCADE,
        related_name='landing_page'
    )
    
    # HTML Content
    html_content = models.TextField(
        help_text='HTML content of the landing page'
    )
    
    # Data capture configuration
    capture_enabled = models.BooleanField(
        default=True,
        help_text='Enable data capture on this landing page'
    )
    capture_fields = models.JSONField(
        default=list,
        help_text='Fields to capture: ["email", "password", "cpf", etc.]'
    )
    capture_field_labels = models.JSONField(
        default=dict,
        blank=True,
        help_text='Custom labels for capture fields'
    )
    
    # Behavior configuration
    success_redirect_url = models.URLField(
        blank=True,
        help_text='URL to redirect after data submission (optional)'
    )
    success_message = models.TextField(
        blank=True,
        default='Obrigado! Suas informações foram enviadas com sucesso.',
        help_text='Message to show after successful submission'
    )
    
    # Tracking configuration
    track_ip = models.BooleanField(default=True)
    track_user_agent = models.BooleanField(default=True)
    track_referer = models.BooleanField(default=True)
    track_geolocation = models.BooleanField(default=False)
    
    # Analytics
    views_count = models.IntegerField(default=0)
    submissions_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'landing_pages'
        verbose_name = _('Landing Page')
        verbose_name_plural = _('Landing Pages')
    
    def __str__(self):
        return f"Landing Page for {self.template.name}"
    
    @property
    def conversion_rate(self):
        """Calculate conversion rate (submissions / views)"""
        if self.views_count == 0:
            return 0
        return (self.submissions_count / self.views_count) * 100


class LandingPageAttachment(models.Model):
    """Downloadable attachments on landing pages"""
    
    landing_page = models.ForeignKey(
        LandingPage,
        on_delete=models.CASCADE,
        related_name='attachments'
    )
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='landing_attachments/%Y/%m/')
    
    # File info
    mimetype = models.CharField(max_length=100)
    size = models.IntegerField(help_text='File size in bytes')
    
    # Tracking
    download_count = models.IntegerField(default=0)
    unique_downloads = models.IntegerField(default=0)
    
    # Malware simulation
    is_malware_simulation = models.BooleanField(
        default=False,
        help_text='Track as malware download attempt'
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'landing_page_attachments'
        verbose_name = _('Landing Page Attachment')
        verbose_name_plural = _('Landing Page Attachments')
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.landing_page.template.name})"


class CapturedData(models.Model):
    """Captured data from landing pages (ENCRYPTED!)"""
    
    campaign = models.ForeignKey(
        'campaigns.Campaign',
        on_delete=models.CASCADE,
        related_name='captured_data'
    )
    
    target = models.ForeignKey(
        'campaigns.Target',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='captured_data'
    )
    
    target_email = models.EmailField()
    
    # ENCRYPTED data storage
    captured_data_encrypted = models.BinaryField(
        help_text='Encrypted JSON data captured from the form'
    )
    
    # Metadata (NOT encrypted - for filtering/analysis)
    fields_captured = models.JSONField(
        default=list,
        help_text='List of field names that were captured'
    )
    
    # Tracking information
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referer = models.URLField(blank=True, max_length=500)
    
    # Geolocation (if enabled)
    geo_country = models.CharField(max_length=100, blank=True)
    geo_region = models.CharField(max_length=100, blank=True)
    geo_city = models.CharField(max_length=100, blank=True)
    geo_data = models.JSONField(default=dict, blank=True)
    
    # Browser/Device info
    browser = models.CharField(max_length=100, blank=True)
    device = models.CharField(max_length=100, blank=True)
    os = models.CharField(max_length=100, blank=True)
    
    # Metadata
    timestamp = models.DateTimeField(auto_now_add=True)
    viewed_by = models.ManyToManyField(
        'core.User',
        related_name='viewed_captured_data',
        blank=True,
        help_text='Users who have viewed this captured data'
    )
    
    class Meta:
        db_table = 'captured_data'
        verbose_name = _('Captured Data')
        verbose_name_plural = _('Captured Data')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['campaign', '-timestamp']),
            models.Index(fields=['target_email']),
            models.Index(fields=['timestamp']),
        ]
    
    def __str__(self):
        return f"Data from {self.target_email} - {self.campaign.name}"
    
    def set_data(self, data_dict):
        """
        Encrypt and store captured data.
        
        Args:
            data_dict: Dictionary of captured form data
        """
        from cryptography.fernet import Fernet
        
        # Get encryption key from settings
        # IMPORTANT: This key should be stored in environment variables!
        key = getattr(settings, 'ENCRYPTION_KEY', None)
        
        if not key:
            raise ValueError(
                "ENCRYPTION_KEY not configured in settings. "
                "Set ENCRYPTION_KEY in your environment variables."
            )
        
        # Ensure key is bytes
        if isinstance(key, str):
            key = key.encode()
        
        f = Fernet(key)
        
        # Serialize and encrypt
        json_data = json.dumps(data_dict)
        self.captured_data_encrypted = f.encrypt(json_data.encode())
        
        # Store field names for filtering (not sensitive)
        self.fields_captured = list(data_dict.keys())
    
    def get_data(self):
        """
        Decrypt and return captured data.
        
        Returns:
            dict: Decrypted form data
        """
        from cryptography.fernet import Fernet
        
        if not self.captured_data_encrypted:
            return {}
        
        # Get encryption key
        key = getattr(settings, 'ENCRYPTION_KEY', None)
        
        if not key:
            raise ValueError("ENCRYPTION_KEY not configured in settings.")
        
        # Ensure key is bytes
        if isinstance(key, str):
            key = key.encode()
        
        f = Fernet(key)
        
        # Decrypt and deserialize
        try:
            decrypted = f.decrypt(bytes(self.captured_data_encrypted))
            return json.loads(decrypted.decode())
        except Exception as e:
            raise ValueError(f"Failed to decrypt data: {str(e)}")
    
    def mark_as_viewed(self, user):
        """Mark this data as viewed by a user (audit trail)"""
        self.viewed_by.add(user)


class AttachmentDownload(models.Model):
    """Track attachment downloads from landing pages"""
    
    attachment = models.ForeignKey(
        LandingPageAttachment,
        on_delete=models.CASCADE,
        related_name='downloads'
    )
    
    campaign = models.ForeignKey(
        'campaigns.Campaign',
        on_delete=models.CASCADE,
        related_name='attachment_downloads'
    )
    
    target = models.ForeignKey(
        'campaigns.Target',
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )
    
    target_email = models.EmailField()
    
    # Tracking
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    referer = models.URLField(blank=True, max_length=500)
    
    # Browser/Device
    browser = models.CharField(max_length=100, blank=True)
    device = models.CharField(max_length=100, blank=True)
    os = models.CharField(max_length=100, blank=True)
    
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'attachment_downloads'
        verbose_name = _('Attachment Download')
        verbose_name_plural = _('Attachment Downloads')
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['campaign', '-timestamp']),
            models.Index(fields=['target_email']),
            models.Index(fields=['attachment']),
        ]
    
    def __str__(self):
        return f"{self.target_email} downloaded {self.attachment.name}"
