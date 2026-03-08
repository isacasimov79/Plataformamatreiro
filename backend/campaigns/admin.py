"""
Admin configuration for Campaigns app.
"""
from django.contrib import admin
from .models import Campaign, CampaignEvent


@admin.register(Campaign)
class CampaignAdmin(admin.ModelAdmin):
    list_display = ('name', 'tenant', 'status', 'start_date', 'emails_sent', 'links_clicked', 'created_at')
    list_filter = ('status', 'tenant', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('-created_at',)


@admin.register(CampaignEvent)
class CampaignEventAdmin(admin.ModelAdmin):
    list_display = ('campaign', 'event_type', 'target_email', 'timestamp')
    list_filter = ('event_type', 'timestamp')
    search_fields = ('target_email', 'campaign__name')
    readonly_fields = ('campaign', 'event_type', 'target_email', 'ip_address', 'user_agent', 'timestamp', 'details')
    ordering = ('-timestamp',)
