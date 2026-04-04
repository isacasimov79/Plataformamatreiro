"""
Middleware for tenant-aware requests.
Supports superadmin impersonation via X-Tenant-Id header.
"""
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to add tenant context to requests.
    
    Rules:
    - Superadmin users can impersonate any tenant via X-Tenant-Id header
    - Regular users always use their assigned tenant
    - Unauthenticated requests have request.tenant = None
    """
    
    def process_request(self, request):
        """Add tenant to request based on user and headers."""
        request.tenant = None
        
        if not hasattr(request, 'user') or not request.user or not request.user.is_authenticated:
            return None
        
        tenant_id = request.headers.get('X-Tenant-Id')
        
        if tenant_id and tenant_id != 'master' and hasattr(request.user, 'role') and request.user.role == 'superadmin':
            # Superadmin can impersonate any tenant
            try:
                from tenants.models import Tenant
                request.tenant = Tenant.objects.get(id=tenant_id)
                logger.debug(
                    f"Superadmin {request.user.email} impersonating tenant {request.tenant.name}"
                )
            except Exception:
                # Fall back to user's own tenant
                request.tenant = getattr(request.user, 'tenant', None)
        else:
            # Regular users use their own tenant
            request.tenant = getattr(request.user, 'tenant', None)
        
        return None
