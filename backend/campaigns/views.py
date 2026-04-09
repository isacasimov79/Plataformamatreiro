"""
Views for Campaigns app.
"""
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db import models
from .models import Campaign, CampaignEvent
from .serializers import CampaignSerializer, CampaignEventSerializer


class CampaignViewSet(viewsets.ModelViewSet):
    """ViewSet for Campaign management."""
    
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter campaigns based on user role and tenant."""
        user = self.request.user
        
        if user.role == 'superadmin':
            return Campaign.objects.all()
        elif user.tenant:
            return Campaign.objects.filter(tenant=user.tenant)
        else:
            return Campaign.objects.none()

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            from core.models import AuditLog
            
            # Log the bad request validation error to Debug / Syslog
            AuditLog.objects.create(
                user=request.user if request.user.is_authenticated else None,
                action='create',
                resource_type='campaign_error',
                details={'error': 'Validation Failed', 'validation_errors': serializer.errors},
                ip_address=request.META.get('REMOTE_ADDR')
            )
            return Response(serializer.errors, status=400)
            
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=201, headers=headers)


    @action(detail=True, methods=['post'])
    def launch(self, request, pk=None):
        """Trigger campaign execution asynchronously via Celery."""
        from .tasks import execute_campaign
        
        campaign = self.get_object()
        
        if not campaign.template:
            return Response({'error': 'Campaign has no template assigned'}, status=400)
            
        if not campaign.target_list and not campaign.tenant:
            return Response({'error': 'Campaign has no targets'}, status=400)
            
        # Trigger celery task
        execute_campaign.delay(campaign.id)
        
        # Soft-update local status before task starts
        if campaign.status in ['draft', 'scheduled']:
            campaign.status = 'active'
            campaign.save(update_fields=['status'])
            
        return Response({'status': 'launched', 'message': 'Campaign execution queued successfully'})


class CampaignEventViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet for Campaign Events."""
    
    queryset = CampaignEvent.objects.all()
    serializer_class = CampaignEventSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter campaign events based on user tenant."""
        user = self.request.user
        
        if user.role == 'superadmin':
            return CampaignEvent.objects.all()
        elif user.tenant:
            return CampaignEvent.objects.filter(campaign__tenant=user.tenant)
        else:
            return CampaignEvent.objects.none()
