from django.contrib import admin
from .models import Training, TrainingEnrollment


@admin.register(Training)
class TrainingAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'status', 'duration_minutes', 'passing_score', 'created_at')
    list_filter = ('status', 'tenant')
    search_fields = ('name',)


@admin.register(TrainingEnrollment)
class TrainingEnrollmentAdmin(admin.ModelAdmin):
    list_display = ('training', 'user', 'status', 'score', 'completed_at')
    list_filter = ('status',)
