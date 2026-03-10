"""
API Views
"""

from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny


@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """
    Health check endpoint
    """
    return JsonResponse({
        'status': 'ok',
        'service': 'Plataforma Matreiro API',
        'version': '1.0.0'
    })
