from rest_framework import serializers
from .models import Training, TrainingEnrollment


class TrainingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Training
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']


class TrainingEnrollmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrainingEnrollment
        fields = '__all__'
        read_only_fields = ['id', 'created_at']
