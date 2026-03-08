from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Training, TrainingEnrollment
from .serializers import TrainingSerializer, TrainingEnrollmentSerializer


class TrainingViewSet(viewsets.ModelViewSet):
    queryset = Training.objects.all()
    serializer_class = TrainingSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'superadmin':
            return Training.objects.all()
        elif user.tenant:
            return Training.objects.filter(tenant=user.tenant)
        return Training.objects.none()


class TrainingEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = TrainingEnrollment.objects.all()
    serializer_class = TrainingEnrollmentSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'superadmin':
            return TrainingEnrollment.objects.all()
        elif user.tenant:
            return TrainingEnrollment.objects.filter(training__tenant=user.tenant)
        return TrainingEnrollment.objects.none()
