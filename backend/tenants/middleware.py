"""
Middleware for tenant-aware requests.
"""
from django.utils.deprecation import MiddlewareMixin


class TenantMiddleware(MiddlewareMixin):
    """
    Middleware to add tenant context to requests.
    """
    
    def process_request(self, request):
        """Add tenant to request if user is authenticated."""
        if hasattr(request, 'user') and request.user.is_authenticated:
            request.tenant = getattr(request.user, 'tenant', None)
        else:
            request.tenant = None
        return None
