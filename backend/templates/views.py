from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from .models import EmailTemplate
from .serializers import EmailTemplateSerializer


class EmailTemplateViewSet(viewsets.ModelViewSet):
    queryset = EmailTemplate.objects.all()
    serializer_class = EmailTemplateSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'superadmin':
            return EmailTemplate.objects.all()
        elif user.tenant:
            return EmailTemplate.objects.filter(Q(tenant=user.tenant) | Q(is_global=True))
        return EmailTemplate.objects.filter(is_global=True)
