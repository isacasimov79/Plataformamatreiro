"""
Models for Target management and import.
"""
from django.db import models
from django.utils.translation import gettext_lazy as _
from django.core.validators import EmailValidator


class Target(models.Model):
    """Individual target/recipient for campaigns"""
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('inactive', 'Inactive'),
        ('bounced', 'Bounced'),
        ('opted_out', 'Opted Out'),
    ]
    
    SOURCE_CHOICES = [
        ('manual', 'Manual Entry'),
        ('csv', 'CSV Import'),
        ('excel', 'Excel Import'),
        ('azure_ad', 'Azure AD'),
        ('google_workspace', 'Google Workspace'),
        ('api', 'API'),
    ]
    
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='targets'
    )
    
    # Basic Info
    email = models.EmailField(validators=[EmailValidator()])
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    
    # Organizational Info
    department = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    employee_id = models.CharField(max_length=50, blank=True)
    
    # Contact Info
    phone = models.CharField(max_length=20, blank=True)
    mobile = models.CharField(max_length=20, blank=True)
    
    # Personal Info (for variable substitution)
    cpf = models.CharField(max_length=14, blank=True, help_text='CPF brasileiro')
    birth_date = models.DateField(null=True, blank=True)
    
    # Location
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=50, blank=True)
    country = models.CharField(max_length=50, blank=True, default='Brasil')
    
    # Custom fields (JSON for extensibility)
    custom_fields = models.JSONField(
        default=dict,
        blank=True,
        help_text='Additional custom fields as JSON'
    )
    
    # Source tracking
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES, default='manual')
    source_id = models.CharField(
        max_length=200,
        blank=True,
        help_text='External ID from source system (e.g., Azure AD object ID)'
    )
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    opted_out = models.BooleanField(default=False, help_text='User opted out of campaigns')
    bounced = models.BooleanField(default=False, help_text='Email bounced')
    bounce_count = models.IntegerField(default=0)
    last_bounce_date = models.DateTimeField(null=True, blank=True)
    
    # Campaign stats
    campaigns_received = models.IntegerField(default=0)
    campaigns_opened = models.IntegerField(default=0)
    campaigns_clicked = models.IntegerField(default=0)
    campaigns_submitted = models.IntegerField(default=0)
    
    # Metadata
    notes = models.TextField(blank=True)
    tags = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='created_targets'
    )
    
    class Meta:
        db_table = 'targets'
        verbose_name = _('Target')
        verbose_name_plural = _('Targets')
        ordering = ['last_name', 'first_name']
        unique_together = [['tenant', 'email']]
        indexes = [
            models.Index(fields=['tenant', 'email']),
            models.Index(fields=['tenant', 'status']),
            models.Index(fields=['source', 'source_id']),
        ]
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.email})"
    
    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def compromise_rate(self):
        """Calculate percentage of campaigns that resulted in compromise"""
        if self.campaigns_received == 0:
            return 0
        return (self.campaigns_submitted / self.campaigns_received) * 100


class TargetGroup(models.Model):
    """Group of targets for easier campaign management"""
    
    SYNC_SOURCE_CHOICES = [
        ('manual', 'Manual'),
        ('azure_ad_group', 'Azure AD Group'),
        ('azure_ad_query', 'Azure AD Query'),
        ('google_group', 'Google Workspace Group'),
        ('google_ou', 'Google Workspace OU'),
    ]
    
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='target_groups'
    )
    
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    targets = models.ManyToManyField(Target, related_name='groups', blank=True)
    
    # Auto-sync configuration
    sync_enabled = models.BooleanField(
        default=False,
        help_text='Enable automatic synchronization with external source'
    )
    sync_source = models.CharField(
        max_length=50,
        choices=SYNC_SOURCE_CHOICES,
        blank=True,
        help_text='Source for automatic synchronization'
    )
    sync_config = models.JSONField(
        default=dict,
        blank=True,
        help_text='Configuration for sync (e.g., group ID, query)'
    )
    last_sync_at = models.DateTimeField(null=True, blank=True)
    sync_status = models.CharField(max_length=50, blank=True)
    
    # Filters (for dynamic groups)
    filter_department = models.CharField(max_length=100, blank=True)
    filter_position = models.CharField(max_length=100, blank=True)
    filter_tags = models.JSONField(default=list, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_target_groups'
    )
    
    class Meta:
        db_table = 'target_groups'
        verbose_name = _('Target Group')
        verbose_name_plural = _('Target Groups')
        ordering = ['name']
        indexes = [
            models.Index(fields=['tenant', 'name']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.targets.count()} targets)"
    
    @property
    def target_count(self):
        return self.targets.count()
    
    def sync_from_source(self):
        """Synchronize targets from external source"""
        if not self.sync_enabled or not self.sync_source:
            return False
        
        # TODO: Implement actual sync logic based on source
        # This would call Azure AD API, Google API, etc.
        pass


class TargetImport(models.Model):
    """Track import history and status"""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('partial', 'Partially Completed'),
    ]
    
    SOURCE_CHOICES = [
        ('csv', 'CSV File'),
        ('excel', 'Excel File'),
        ('azure_ad', 'Azure Active Directory'),
        ('google_workspace', 'Google Workspace'),
        ('api', 'API'),
    ]
    
    tenant = models.ForeignKey(
        'tenants.Tenant',
        on_delete=models.CASCADE,
        related_name='target_imports'
    )
    
    source = models.CharField(max_length=50, choices=SOURCE_CHOICES)
    file = models.FileField(
        upload_to='target_imports/%Y/%m/',
        null=True,
        blank=True,
        help_text='Uploaded file (for CSV/Excel imports)'
    )
    
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Import configuration
    import_config = models.JSONField(
        default=dict,
        blank=True,
        help_text='Import settings (e.g., field mappings, filters)'
    )
    
    # Statistics
    total_records = models.IntegerField(default=0)
    imported_count = models.IntegerField(default=0)
    updated_count = models.IntegerField(default=0)
    skipped_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
    
    # Errors and warnings
    errors = models.JSONField(
        default=list,
        blank=True,
        help_text='List of errors encountered during import'
    )
    warnings = models.JSONField(
        default=list,
        blank=True,
        help_text='List of warnings during import'
    )
    
    # Results
    imported_targets = models.ManyToManyField(
        Target,
        related_name='imports',
        blank=True
    )
    
    # Target group assignment
    assign_to_group = models.ForeignKey(
        TargetGroup,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='imports',
        help_text='Automatically add imported targets to this group'
    )
    
    # Metadata
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_by = models.ForeignKey(
        'core.User',
        on_delete=models.SET_NULL,
        null=True,
        related_name='target_imports'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'target_imports'
        verbose_name = _('Target Import')
        verbose_name_plural = _('Target Imports')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['tenant', '-created_at']),
            models.Index(fields=['status']),
        ]
    
    def __str__(self):
        return f"Import {self.id} - {self.source} ({self.status})"
    
    @property
    def success_rate(self):
        """Calculate import success rate"""
        if self.total_records == 0:
            return 0
        return ((self.imported_count + self.updated_count) / self.total_records) * 100
