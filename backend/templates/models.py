from django.db import models


class EmailTemplate(models.Model):
    CATEGORY_CHOICES = [
        ('credential_harvest', 'Credential Harvest'),
        ('malware', 'Malware'),
        ('business_email', 'Business Email Compromise'),
        ('social_engineering', 'Social Engineering'),
    ]
    
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='templates', null=True, blank=True)
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES)
    subject = models.CharField(max_length=300)
    body_html = models.TextField()
    body_text = models.TextField(blank=True)
    landing_page_html = models.TextField(blank=True)
    is_global = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'email_templates'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name
