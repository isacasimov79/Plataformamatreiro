"""
URL configuration for health check endpoint.
"""
from django.urls import path
from ..views import health_check

urlpatterns = [
    path('health/', health_check, name='health'),
]
