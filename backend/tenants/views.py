"""
Views for Tenants app.
"""
from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Tenant
from .serializers import TenantSerializer, TenantCreateSerializer


class TenantViewSet(viewsets.ModelViewSet):
    """ViewSet for Tenant management."""
    
    queryset = Tenant.objects.all()
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TenantCreateSerializer
        return TenantSerializer
    
    def get_queryset(self):
        """Filter tenants based on user role."""
        user = self.request.user
        
        if user.role == 'superadmin':
            return Tenant.objects.all()
        elif user.role == 'tenant_admin' and user.tenant:
            # Tenant admins can see their tenant and sub-tenants
            return Tenant.objects.filter(
                models.Q(id=user.tenant.id) | models.Q(parent_tenant=user.tenant)
            )
        elif user.tenant:
            return Tenant.objects.filter(id=user.tenant.id)
        else:
            return Tenant.objects.none()
