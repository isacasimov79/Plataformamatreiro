"""
URL configuration for Matreiro Platform.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API Routes
    path('api/auth/', include('core.urls.auth')),
    path('api/tenants/', include('tenants.urls')),
    path('api/campaigns/', include('campaigns.urls')),
    path('api/trainings/', include('trainings.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/templates/', include('templates.urls')),
    path('api/users/', include('core.urls.users')),
    path('api/rbac/', include('core.urls.permissions')),
    path('api/', include('core.urls.health')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)