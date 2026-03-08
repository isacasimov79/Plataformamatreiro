"""
URL configuration for Campaigns app.
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CampaignViewSet, CampaignEventViewSet

router = DefaultRouter()
router.register(r'', CampaignViewSet, basename='campaign')
router.register(r'events', CampaignEventViewSet, basename='campaign-event')

urlpatterns = [
    path('', include(router.urls)),
]
