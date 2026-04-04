"""
Models for Training Certificates.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
import shortuuid


def generate_certificate_hash():
    return shortuuid.uuid()


class Certificate(models.Model):
    """Training completion certificate."""
    
    training = models.ForeignKey(
        'trainings.Training',
        on_delete=models.CASCADE,
        related_name='certificates'
    )
    
    user = models.ForeignKey(
        'core.User',
        on_delete=models.CASCADE,
        related_name='certificates',
        null=True,
        blank=True
    )
    
    target = models.ForeignKey(
        'campaigns.Target',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='certificates'
    )
    
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='certificates',
        null=True,
        blank=True
    )
    
    # Certificate details
    certificate_hash = models.CharField(
        max_length=50,
        unique=True,
        default=generate_certificate_hash
    )
    
    recipient_name = models.CharField(max_length=255)
    recipient_email = models.EmailField()
    
    score = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        null=True,
        blank=True,
        help_text='Score achieved (percentage)'
    )
    
    issued_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    
    # PDF storage
    pdf_file = models.FileField(
        upload_to='certificates/%Y/%m/',
        null=True,
        blank=True
    )
    
    class Meta:
        db_table = 'certificates'
        verbose_name = _('Certificate')
        verbose_name_plural = _('Certificates')
        ordering = ['-issued_at']
        unique_together = ['training', 'recipient_email']
    
    def __str__(self):
        return f"Certificate: {self.recipient_name} - {self.training.title}"
    
    @property
    def is_valid(self):
        if self.expires_at is None:
            return True
        from django.utils import timezone
        return timezone.now() < self.expires_at
