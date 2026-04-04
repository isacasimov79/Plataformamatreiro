"""
Tenant Context Middleware.
Extracts tenant context from requests and associates it with the request object.
"""
import logging
from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger(__name__)


class TenantContextMiddleware(MiddlewareMixin):
    """
    Reads X-Tenant-Id header and sets request.tenant.
    
    Rules:
    - Superadmin users can set any tenant via X-Tenant-Id header (impersonation)
    - Regular users always use their assigned tenant
    - Unauthenticated requests have request.tenant = None
    """
    
    def process_request(self, request):
        request.tenant = None
        
        # Skip for non-authenticated requests
        if not hasattr(request, 'user') or not request.user or not request.user.is_authenticated:
            return
        
        tenant_id = request.headers.get('X-Tenant-Id')
        
        if tenant_id and hasattr(request.user, 'role') and request.user.role == 'superadmin':
            # Superadmin can impersonate any tenant
            try:
                from tenants.models import Tenant
                request.tenant = Tenant.objects.get(id=tenant_id)
                logger.debug(f"Superadmin {request.user.email} impersonating tenant {request.tenant.name}")
            except Exception:
                # Fall through to user's own tenant
                request.tenant = getattr(request.user, 'tenant', None)
        else:
            # Regular users use their own tenant
            request.tenant = getattr(request.user, 'tenant', None)
    
    def process_response(self, request, response):
        return response
