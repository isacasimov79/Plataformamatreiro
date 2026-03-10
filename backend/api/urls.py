"""
API URL Configuration
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

# Create a router and register viewsets
router = DefaultRouter()
# router.register(r'tenants', views.TenantViewSet, basename='tenant')
# router.register(r'users', views.UserViewSet, basename='user')
# router.register(r'campaigns', views.CampaignViewSet, basename='campaign')
# router.register(r'templates', views.TemplateViewSet, basename='template')
# router.register(r'landing-pages', views.LandingPageViewSet, basename='landing-page')
# router.register(r'targets', views.TargetViewSet, basename='target')
# router.register(r'results', views.ResultViewSet, basename='result')
# router.register(r'trainings', views.TrainingViewSet, basename='training')

urlpatterns = [
    # Router URLs
    path('', include(router.urls)),
    
    # Health check
    path('health/', views.health_check, name='health-check'),
    
    # Authentication
    # path('auth/', include('api.auth.urls')),
    
    # Azure AD Integration
    # path('azure/', include('api.azure.urls')),
]
