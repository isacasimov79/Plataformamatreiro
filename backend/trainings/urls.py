from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TrainingViewSet, TrainingEnrollmentViewSet

router = DefaultRouter()
router.register(r'', TrainingViewSet, basename='training')
router.register(r'enrollments', TrainingEnrollmentViewSet, basename='training-enrollment')

urlpatterns = [path('', include(router.urls))]
