"""
Views for Campaigns app.
"""
from rest_framework import viewsets
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
