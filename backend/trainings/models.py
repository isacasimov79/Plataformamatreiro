"""Models for Trainings app."""
from django.db import models

# Import sub-models so Django discovers them
from .models_certificate import Certificate  # noqa: F401


class Training(models.Model):
    STATUS_CHOICES = [('draft', 'Draft'), ('active', 'Active'), ('completed', 'Completed')]
    
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE, related_name='trainings')
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    content = models.TextField()
    duration_minutes = models.IntegerField(default=30)
    passing_score = models.IntegerField(default=70)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'trainings'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.name


class TrainingEnrollment(models.Model):
    STATUS_CHOICES = [('enrolled', 'Enrolled'), ('in_progress', 'In Progress'), ('completed', 'Completed'), ('failed', 'Failed')]
    
    training = models.ForeignKey(Training, on_delete=models.CASCADE, related_name='enrollments')
    user = models.ForeignKey('core.User', on_delete=models.CASCADE, related_name='training_enrollments')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='enrolled')
    score = models.IntegerField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'training_enrollments'
        unique_together = ['training', 'user']
        ordering = ['-created_at']
