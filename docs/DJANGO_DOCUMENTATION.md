# 🐍 Plataforma Matreiro - Documentação Django

**Versão:** 1.0.0  
**Data de Atualização:** 09/03/2026  
**Framework:** Django 5.0 + Django REST Framework  

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura do Projeto](#estrutura-do-projeto)
3. [Configuração](#configuração)
4. [Models](#models)
5. [Serializers](#serializers)
6. [Views e ViewSets](#views-e-viewsets)
7. [URLs](#urls)
8. [Autenticação e Permissões](#autenticação-e-permissões)
9. [Middleware](#middleware)
10. [Celery Tasks](#celery-tasks)
11. [Management Commands](#management-commands)
12. [Testes](#testes)

---

## 🎯 Visão Geral

A Plataforma Matreiro utiliza Django 5.0 como backend principal, com as seguintes características:

- **Django REST Framework** para API RESTful
- **JWT Authentication** via django-simplejwt
- **Multi-tenancy** com isolamento de dados
- **Celery** para tarefas assíncronas
- **PostgreSQL** como banco de dados
- **Redis** para cache e message broker
- **Object-level permissions** com django-guardian

### Arquitetura

```
┌─────────────────────────────────────────────┐
│            Frontend (React)                 │
└──────────────────┬──────────────────────────┘
                   │ REST API (JSON)
┌──────────────────▼──────────────────────────┐
│         Django REST Framework               │
│  ┌──────────────────────────────────────┐  │
│  │  ViewSets & Serializers              │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  Authentication & Permissions        │  │
│  └──────────────────────────────────────┘  │
│  ┌──────────────────────────────────────┐  │
│  │  Tenant Middleware                   │  │
│  └──────────────────────────────────────┘  │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│         Models (ORM) + Celery Tasks         │
└──────────────────┬──────────────────────────┘
                   │
┌──────────────────▼──────────────────────────┐
│      PostgreSQL + Redis + Storage           │
└─────────────────────────────────────────────┘
```

---

## 📁 Estrutura do Projeto

```
backend/
├── matreiro/                  # Projeto principal
│   ├── __init__.py
│   ├── settings.py           # Configurações
│   ├── urls.py               # URLs principais
│   ├── wsgi.py               # WSGI application
│   └── celery.py             # Configuração Celery
│
├── core/                      # App principal (users, auth)
│   ├── __init__.py
│   ├── models.py             # User, Permission, Role, AuditLog
│   ├── serializers.py        # User serializers
│   ├── serializers_permissions.py
│   ├── views.py              # Auth views
│   ├── views_permissions.py  # Permission views
│   ├── permissions.py        # Permission checks
│   ├── utils.py              # Utilities
│   ├── admin.py              # Django Admin
│   ├── urls/
│   │   ├── auth.py           # Auth endpoints
│   │   ├── users.py          # User endpoints
│   │   ├── permissions.py    # Permission endpoints
│   │   └── health.py         # Health check
│   └── management/
│       └── commands/
│           └── populate_permissions.py
│
├── tenants/                   # Multi-tenancy
│   ├── __init__.py
│   ├── models.py             # Tenant model
│   ├── serializers.py        # Tenant serializers
│   ├── views.py              # Tenant views
│   ├── urls.py               # Tenant endpoints
│   ├── middleware.py         # Tenant middleware
│   └── admin.py
│
├── campaigns/                 # Campanhas de phishing
│   ├── __init__.py
│   ├── models.py             # Campaign, CampaignEvent
│   ├── models_targets.py     # Target, TargetGroup, TargetImport
│   ├── models_landing.py     # LandingPage, CapturedData
│   ├── serializers.py        # Campaign serializers
│   ├── views.py              # Campaign views
│   ├── urls.py               # Campaign endpoints
│   ├── tasks.py              # Celery tasks
│   └── admin.py
│
├── templates/                 # Templates de e-mail
│   ├── __init__.py
│   ├── models.py             # EmailTemplate, Attachment
│   ├── serializers.py        # Template serializers
│   ├── views.py              # Template views
│   └── urls.py
│
├── trainings/                 # Treinamentos
│   ├── __init__.py
│   ├── models.py             # Training, TrainingAssignment
│   ├── serializers.py        # Training serializers
│   ├── views.py              # Training views
│   ├── urls.py
│   └── tasks.py              # Celery tasks
│
├── reports/                   # Relatórios
│   ├── __init__.py
│   ├── views.py              # Report views
│   ├── generators.py         # PDF/Excel generators
│   └── urls.py
│
├── integrations/              # Integrações (AD, Google)
│   ├── __init__.py
│   ├── models.py             # Integration model
│   ├── providers/
│   │   ├── microsoft.py      # Microsoft AD/Azure
│   │   ├── google.py         # Google Workspace
│   │   └── slack.py          # Slack
│   ├── views.py
│   └── urls.py
│
├── automations/               # Automações
│   ├── __init__.py
│   ├── models.py             # Automation, AutomationExecution
│   ├── serializers.py
│   ├── views.py
│   ├── engine.py             # Automation engine
│   ├── tasks.py
│   └── urls.py
│
├── manage.py                  # Django management
└── requirements.txt           # Dependências Python
```

---

## ⚙️ Configuração

### settings.py

```python
"""
Django settings for Matreiro Platform.
"""

import os
from pathlib import Path
from datetime import timedelta
import dj_database_url

BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY
SECRET_KEY = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')
DEBUG = os.environ.get('DEBUG', 'True') == 'True'
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', 'localhost,127.0.0.1').split(',')

# APPLICATIONS
INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    
    # Third party
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'django_celery_beat',
    'django_celery_results',
    'drf_spectacular',
    'django_extensions',
    'guardian',
    
    # Matreiro apps
    'core',
    'tenants',
    'campaigns',
    'trainings',
    'reports',
    'templates',
    'integrations',
    'automations',
]

# MIDDLEWARE
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'tenants.middleware.TenantMiddleware',  # Multi-tenancy
]

ROOT_URLCONF = 'matreiro.urls'

# TEMPLATES
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [BASE_DIR / 'templates'],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'matreiro.wsgi.application'

# DATABASE
DATABASES = {
    'default': dj_database_url.config(
        default=os.environ.get('DATABASE_URL', 
            'postgresql://matreiro_user:matreiro_password_dev@postgres:5432/matreiro_db'),
        conn_max_age=600
    )
}

# CACHE (Redis)
CACHES = {
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": os.environ.get('REDIS_URL', 'redis://redis:6379/0'),
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
        }
    }
}

# AUTHENTICATION
AUTH_USER_MODEL = 'core.User'

AUTHENTICATION_BACKENDS = (
    'django.contrib.auth.backends.ModelBackend',
    'guardian.backends.ObjectPermissionBackend',
)

# PASSWORD VALIDATION
AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'},
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
    {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'},
    {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'},
]

# INTERNATIONALIZATION
LANGUAGE_CODE = 'pt-br'
TIME_ZONE = 'America/Sao_Paulo'
USE_I18N = True
USE_L10N = True
USE_TZ = True

LANGUAGES = [
    ('pt-br', 'Português (Brasil)'),
    ('en', 'English'),
    ('es', 'Español'),
]

# STATIC & MEDIA FILES
STATIC_URL = '/static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# CORS
CORS_ALLOWED_ORIGINS = os.environ.get(
    'CORS_ALLOWED_ORIGINS', 
    'http://localhost:3000,http://localhost:5173'
).split(',')
CORS_ALLOW_CREDENTIALS = True

# REST FRAMEWORK
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_FILTER_BACKENDS': [
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
}

# JWT
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(hours=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
    'UPDATE_LAST_LOGIN': True,
    'ALGORITHM': 'HS256',
    'SIGNING_KEY': SECRET_KEY,
    'AUTH_HEADER_TYPES': ('Bearer',),
    'USER_ID_FIELD': 'id',
    'USER_ID_CLAIM': 'user_id',
}

# CELERY
CELERY_BROKER_URL = os.environ.get('REDIS_URL', 'redis://redis:6379/0')
CELERY_RESULT_BACKEND = 'django-db'
CELERY_ACCEPT_CONTENT = ['json']
CELERY_TASK_SERIALIZER = 'json'
CELERY_RESULT_SERIALIZER = 'json'
CELERY_TIMEZONE = TIME_ZONE
CELERY_BEAT_SCHEDULER = 'django_celery_beat.schedulers:DatabaseScheduler'

# API DOCUMENTATION
SPECTACULAR_SETTINGS = {
    'TITLE': 'Matreiro Platform API',
    'DESCRIPTION': 'API para plataforma de simulação de phishing e treinamentos',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

# LOGGING
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
        'file': {
            'class': 'logging.FileHandler',
            'filename': 'logs/matreiro.log',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console', 'file'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console', 'file'],
            'level': 'INFO',
            'propagate': False,
        },
        'campaigns': {
            'handlers': ['console', 'file'],
            'level': 'DEBUG',
        },
    },
}

# EMAIL (para envio de campanhas)
EMAIL_BACKEND = 'django.core.mail.backends.smtp.EmailBackend'
EMAIL_HOST = os.environ.get('EMAIL_HOST', 'smtp.gmail.com')
EMAIL_PORT = int(os.environ.get('EMAIL_PORT', 587))
EMAIL_USE_TLS = True
EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD')
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@matreiro.com')

# STORAGE (AWS S3 ou local)
if os.environ.get('USE_S3', 'False') == 'True':
    DEFAULT_FILE_STORAGE = 'storages.backends.s3boto3.S3Boto3Storage'
    AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID')
    AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY')
    AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME')
    AWS_S3_REGION_NAME = os.environ.get('AWS_S3_REGION_NAME', 'us-east-1')
    AWS_DEFAULT_ACL = 'private'
    AWS_S3_FILE_OVERWRITE = False

# SECURITY (Produção)
if not DEBUG:
    SECURE_SSL_REDIRECT = True
    SESSION_COOKIE_SECURE = True
    CSRF_COOKIE_SECURE = True
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 31536000
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
```

---

## 📊 Models

### Core Models (core/models.py)

```python
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.utils.translation import gettext_lazy as _

class User(AbstractUser):
    """Custom User model."""
    
    ROLE_CHOICES = [
        ('superadmin', 'Super Admin'),
        ('tenant_admin', 'Tenant Admin'),
        ('sub_tenant_admin', 'Sub-Tenant Admin'),
        ('manager', 'Manager'),
        ('analyst', 'Analyst'),
        ('viewer', 'Viewer'),
    ]
    
    email = models.EmailField(_('email address'), unique=True)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='viewer')
    tenant = models.ForeignKey(
        'tenants.Tenant', 
        on_delete=models.CASCADE, 
        related_name='users',
        null=True,
        blank=True
    )
    phone = models.CharField(max_length=20, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    language = models.CharField(max_length=10, default='pt-br')
    
    # Impersonation
    original_user = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='impersonated_sessions'
    )
    is_impersonating = models.BooleanField(default=False)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    last_login_ip = models.GenericIPAddressField(null=True, blank=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username', 'first_name', 'last_name']
    
    class Meta:
        db_table = 'users'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.email})"
    
    @property
    def full_name(self):
        return self.get_full_name() or self.email


class Permission(models.Model):
    """Granular permission."""
    
    code = models.CharField(max_length=100, unique=True, db_index=True)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    module = models.CharField(max_length=50, db_index=True)
    resource = models.CharField(max_length=50, blank=True)
    action = models.CharField(max_length=50, blank=True)
    is_system = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'permissions'
        ordering = ['module', 'code']
    
    def __str__(self):
        return f"{self.code} - {self.name}"


class AuditLog(models.Model):
    """Audit log for tracking user actions."""
    
    ACTION_CHOICES = [
        ('create', 'Create'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('view', 'View'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('impersonate_start', 'Impersonate Start'),
        ('impersonate_end', 'Impersonate End'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    action = models.CharField(max_length=20, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=50)
    resource_id = models.CharField(max_length=100, null=True, blank=True)
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'audit_logs'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['resource_type', 'resource_id']),
        ]
```

### Campaign Models (campaigns/models.py)

```python
from django.db import models

class Campaign(models.Model):
    """Phishing campaign model."""
    
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('scheduled', 'Scheduled'),
        ('active', 'Active'),
        ('paused', 'Paused'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    tenant = models.ForeignKey('tenants.Tenant', on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    
    template = models.ForeignKey('templates.EmailTemplate', on_delete=models.SET_NULL, null=True)
    
    # Schedule
    start_date = models.DateTimeField()
    end_date = models.DateTimeField(null=True, blank=True)
    
    # Targets
    target_count = models.IntegerField(default=0)
    
    # Metrics
    emails_sent = models.IntegerField(default=0)
    emails_opened = models.IntegerField(default=0)
    links_clicked = models.IntegerField(default=0)
    credentials_submitted = models.IntegerField(default=0)
    
    created_by = models.ForeignKey('core.User', on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'campaigns'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.name} - {self.tenant.name}"
    
    @property
    def open_rate(self):
        return self.emails_opened / self.emails_sent if self.emails_sent > 0 else 0
    
    @property
    def click_rate(self):
        return self.links_clicked / self.emails_sent if self.emails_sent > 0 else 0


class CampaignEvent(models.Model):
    """Track individual campaign events."""
    
    EVENT_TYPES = [
        ('sent', 'Email Sent'),
        ('opened', 'Email Opened'),
        ('clicked', 'Link Clicked'),
        ('submitted', 'Credentials Submitted'),
        ('reported', 'Reported as Phishing'),
    ]
    
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE, related_name='events')
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    target_email = models.EmailField()
    
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)
    details = models.JSONField(default=dict)
    
    class Meta:
        db_table = 'campaign_events'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['campaign', '-timestamp']),
            models.Index(fields=['target_email', '-timestamp']),
        ]
```

---

## 🔄 Serializers

### User Serializer (core/serializers.py)

```python
from rest_framework import serializers
from .models import User, Permission, Role

class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(read_only=True)
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name', 'full_name',
            'role', 'tenant', 'tenant_name', 'department', 'phone', 'language',
            'is_active', 'last_login', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_login']
    
    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
        if password:
            user.set_password(password)
        user.save()
        return user


class UserCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    password_confirm = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = User
        fields = [
            'email', 'username', 'first_name', 'last_name', 'password', 
            'password_confirm', 'role', 'tenant', 'department', 'phone', 'language'
        ]
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords don't match"})
        attrs.pop('password_confirm')
        return attrs
    
    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        return user
```

### Campaign Serializer (campaigns/serializers.py)

```python
from rest_framework import serializers
from .models import Campaign, CampaignEvent

class CampaignEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignEvent
        fields = '__all__'


class CampaignSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.name', read_only=True)
    template_name = serializers.CharField(source='template.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.full_name', read_only=True)
    
    open_rate = serializers.FloatField(read_only=True)
    click_rate = serializers.FloatField(read_only=True)
    
    class Meta:
        model = Campaign
        fields = [
            'id', 'tenant', 'tenant_name', 'name', 'description', 'status',
            'template', 'template_name', 'start_date', 'end_date',
            'target_count', 'emails_sent', 'emails_opened', 'links_clicked',
            'credentials_submitted', 'open_rate', 'click_rate',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class CampaignCreateSerializer(serializers.ModelSerializer):
    target_group_ids = serializers.ListField(
        child=serializers.UUIDField(),
        write_only=True
    )
    
    class Meta:
        model = Campaign
        fields = [
            'tenant', 'name', 'description', 'template', 'start_date',
            'end_date', 'target_group_ids'
        ]
    
    def create(self, validated_data):
        target_group_ids = validated_data.pop('target_group_ids')
        campaign = Campaign.objects.create(**validated_data)
        
        # Add target groups
        campaign.target_groups.set(target_group_ids)
        
        # Calculate target count
        campaign.target_count = campaign.get_target_count()
        campaign.save()
        
        return campaign
```

---

## 🎯 Views e ViewSets

### User ViewSet (core/views.py)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken

from .models import User
from .serializers import UserSerializer, UserCreateSerializer
from .permissions import IsSuperAdmin, IsTenantAdmin

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['role', 'tenant', 'is_active']
    search_fields = ['email', 'first_name', 'last_name']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserCreateSerializer
        return UserSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        # Superadmin can see all
        if user.role == 'superadmin':
            return User.objects.all()
        
        # Tenant admin can see users in their tenant and sub-tenants
        if user.role in ['tenant_admin', 'sub_tenant_admin']:
            return User.objects.filter(
                tenant=user.tenant
            ) | User.objects.filter(
                tenant__parent_tenant=user.tenant
            )
        
        # Others can only see themselves
        return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['post'])
    def login(self, request):
        """User login endpoint."""
        email = request.data.get('email')
        password = request.data.get('password')
        
        user = authenticate(email=email, password=password)
        
        if user is None:
            return Response(
                {'error': 'Invalid credentials'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        if not user.is_active:
            return Response(
                {'error': 'User account is disabled'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': UserSerializer(user).data
        })
    
    @action(detail=True, methods=['post'], permission_classes=[IsSuperAdmin])
    def impersonate(self, request, pk=None):
        """Impersonate another user (superadmin only)."""
        target_user = self.get_object()
        
        if target_user.id == request.user.id:
            return Response(
                {'error': 'Cannot impersonate yourself'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Save original user
        target_user.original_user = request.user
        target_user.is_impersonating = True
        target_user.save()
        
        # Generate token for target user
        refresh = RefreshToken.for_user(target_user)
        
        return Response({
            'impersonation_token': str(refresh.access_token),
            'user': UserSerializer(target_user).data
        })
    
    @action(detail=False, methods=['post'])
    def stop_impersonation(self, request):
        """Stop impersonating and return to original user."""
        user = request.user
        
        if not user.is_impersonating:
            return Response(
                {'error': 'Not impersonating'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        original_user = user.original_user
        
        # Clear impersonation
        user.is_impersonating = False
        user.original_user = None
        user.save()
        
        # Generate token for original user
        refresh = RefreshToken.for_user(original_user)
        
        return Response({
            'access_token': str(refresh.access_token),
            'user': UserSerializer(original_user).data
        })
```

### Campaign ViewSet (campaigns/views.py)

```python
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated

from .models import Campaign, CampaignEvent
from .serializers import CampaignSerializer, CampaignCreateSerializer, CampaignEventSerializer
from .tasks import send_campaign_emails

class CampaignViewSet(viewsets.ModelViewSet):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer
    permission_classes = [IsAuthenticated]
    filterset_fields = ['status', 'tenant']
    search_fields = ['name', 'description']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return CampaignCreateSerializer
        return CampaignSerializer
    
    def get_queryset(self):
        user = self.request.user
        
        if user.role == 'superadmin':
            return Campaign.objects.all()
        
        return Campaign.objects.filter(tenant=user.tenant)
    
    @action(detail=True, methods=['post'])
    def start(self, request, pk=None):
        """Start a campaign."""
        campaign = self.get_object()
        
        if campaign.status != 'scheduled':
            return Response(
                {'error': 'Campaign must be scheduled to start'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        campaign.status = 'active'
        campaign.save()
        
        # Trigger async task to send emails
        send_campaign_emails.delay(campaign.id)
        
        return Response({
            'message': 'Campaign started',
            'campaign': CampaignSerializer(campaign).data
        })
    
    @action(detail=True, methods=['post'])
    def pause(self, request, pk=None):
        """Pause a campaign."""
        campaign = self.get_object()
        
        if campaign.status != 'active':
            return Response(
                {'error': 'Only active campaigns can be paused'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        campaign.status = 'paused'
        campaign.save()
        
        return Response({
            'message': 'Campaign paused',
            'campaign': CampaignSerializer(campaign).data
        })
    
    @action(detail=True, methods=['get'])
    def events(self, request, pk=None):
        """Get campaign events."""
        campaign = self.get_object()
        events = campaign.events.all()
        
        # Filter by event type
        event_type = request.query_params.get('event_type')
        if event_type:
            events = events.filter(event_type=event_type)
        
        serializer = CampaignEventSerializer(events, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def stats(self, request, pk=None):
        """Get campaign statistics."""
        campaign = self.get_object()
        
        events = campaign.events.values('event_type').annotate(
            count=models.Count('id')
        )
        
        stats = {
            'sent': campaign.emails_sent,
            'opened': campaign.emails_opened,
            'clicked': campaign.links_clicked,
            'submitted': campaign.credentials_submitted,
            'open_rate': campaign.open_rate,
            'click_rate': campaign.click_rate,
            'events_breakdown': list(events)
        }
        
        return Response(stats)
```

---

## 🔐 Autenticação e Permissões

### Custom Permissions (core/permissions.py)

```python
from rest_framework import permissions

class IsSuperAdmin(permissions.BasePermission):
    """Only superadmins can access."""
    
    def has_permission(self, request, view):
        return request.user and request.user.role == 'superadmin'


class IsTenantAdmin(permissions.BasePermission):
    """Tenant admins and above can access."""
    
    def has_permission(self, request, view):
        return request.user and request.user.role in [
            'superadmin', 'tenant_admin', 'sub_tenant_admin'
        ]


class HasPermission(permissions.BasePermission):
    """Check if user has specific permission."""
    
    permission_code = None
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.role == 'superadmin':
            return True
        
        from .models import Permission
        return request.user.has_permission(self.permission_code)


class CanViewCampaigns(HasPermission):
    permission_code = 'campaigns.view'


class CanCreateCampaigns(HasPermission):
    permission_code = 'campaigns.create'


def has_permission(user, permission_code):
    """Check if user has a specific permission."""
    
    if user.role == 'superadmin':
        return True
    
    # Check user custom permissions
    user_perms = user.custom_permissions.filter(
        permission__code=permission_code,
        granted=True
    ).exists()
    
    if user_perms:
        return True
    
    # Check role permissions
    if user.tenant:
        role_perms = user.tenant.custom_roles.filter(
            permissions__code=permission_code
        ).exists()
        
        return role_perms
    
    return False
```

---

## 🔧 Middleware

### Tenant Middleware (tenants/middleware.py)

```python
from django.utils.deprecation import MiddlewareMixin
from .models import Tenant

class TenantMiddleware(MiddlewareMixin):
    """Set current tenant in thread local storage."""
    
    def process_request(self, request):
        if request.user.is_authenticated and request.user.tenant:
            request.tenant = request.user.tenant
            
            # Set tenant in thread local for use in queries
            from django.db import connection
            with connection.cursor() as cursor:
                cursor.execute(
                    "SET app.user_tenant_id = %s",
                    [str(request.user.tenant.id)]
                )
                cursor.execute(
                    "SET app.user_role = %s",
                    [request.user.role]
                )
        else:
            request.tenant = None
        
        return None
```

---

## ⏰ Celery Tasks

### Campaign Tasks (campaigns/tasks.py)

```python
from celery import shared_task
from django.core.mail import send_mail
from .models import Campaign, CampaignEvent

@shared_task
def send_campaign_emails(campaign_id):
    """Send campaign emails to all targets."""
    
    campaign = Campaign.objects.get(id=campaign_id)
    
    # Get all targets
    targets = campaign.get_targets()
    
    for target in targets:
        # Render email with variables
        email_html = campaign.template.render_for_target(target, campaign)
        
        # Send email
        try:
            send_mail(
                subject=campaign.template.subject,
                message='',
                html_message=email_html,
                from_email='noreply@matreiro.com',
                recipient_list=[target.email],
                fail_silently=False,
            )
            
            # Log event
            CampaignEvent.objects.create(
                campaign=campaign,
                event_type='sent',
                target_email=target.email,
            )
            
            campaign.emails_sent += 1
            campaign.save()
            
        except Exception as e:
            print(f"Error sending email to {target.email}: {e}")
    
    # Mark campaign as completed
    campaign.status = 'completed'
    campaign.save()


@shared_task
def calculate_risk_scores():
    """Calculate risk scores for all targets."""
    from .models import Target
    
    targets = Target.objects.all()
    
    for target in targets:
        target.risk_score = target.calculate_risk_score()
        target.save()
```

---

## 🛠️ Management Commands

### Populate Permissions (core/management/commands/populate_permissions.py)

```python
from django.core.management.base import BaseCommand
from core.models import Permission

class Command(BaseCommand):
    help = 'Populate system permissions'
    
    def handle(self, *args, **options):
        permissions = [
            # Campaigns
            {'code': 'campaigns.view', 'name': 'View Campaigns', 'module': 'campaigns'},
            {'code': 'campaigns.create', 'name': 'Create Campaigns', 'module': 'campaigns'},
            {'code': 'campaigns.edit', 'name': 'Edit Campaigns', 'module': 'campaigns'},
            {'code': 'campaigns.delete', 'name': 'Delete Campaigns', 'module': 'campaigns'},
            
            # Templates
            {'code': 'templates.view', 'name': 'View Templates', 'module': 'templates'},
            {'code': 'templates.create', 'name': 'Create Templates', 'module': 'templates'},
            
            # Add more...
        ]
        
        for perm_data in permissions:
            Permission.objects.get_or_create(
                code=perm_data['code'],
                defaults=perm_data
            )
        
        self.stdout.write(self.style.SUCCESS(f'Successfully created {len(permissions)} permissions'))
```

---

## 🧪 Testes

### Test Campaign ViewSet (campaigns/tests.py)

```python
from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from core.models import User
from tenants.models import Tenant
from .models import Campaign

class CampaignViewSetTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create tenant
        self.tenant = Tenant.objects.create(
            name='Test Tenant',
            slug='test-tenant'
        )
        
        # Create user
        self.user = User.objects.create_user(
            email='test@test.com',
            username='testuser',
            password='testpass123',
            tenant=self.tenant,
            role='tenant_admin'
        )
        
        # Authenticate
        self.client.force_authenticate(user=self.user)
    
    def test_create_campaign(self):
        """Test creating a campaign."""
        data = {
            'tenant': str(self.tenant.id),
            'name': 'Test Campaign',
            'description': 'Test description',
            'template': None,
            'start_date': '2026-03-15T10:00:00Z',
            'target_group_ids': []
        }
        
        response = self.client.post('/api/v1/campaigns/', data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Campaign.objects.count(), 1)
        self.assertEqual(Campaign.objects.get().name, 'Test Campaign')
    
    def test_list_campaigns(self):
        """Test listing campaigns."""
        Campaign.objects.create(
            tenant=self.tenant,
            name='Campaign 1',
            start_date='2026-03-15T10:00:00Z'
        )
        
        response = self.client.get('/api/v1/campaigns/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data['results']), 1)
```

---

## 📚 Recursos Adicionais

### Comandos Úteis

```bash
# Criar app
python manage.py startapp app_name

# Migrations
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations

# Shell
python manage.py shell
python manage.py shell_plus  # Com django-extensions

# Criar superusuário
python manage.py createsuperuser

# Coletar static files
python manage.py collectstatic

# Rodar servidor
python manage.py runserver 0.0.0.0:8000

# Rodar Celery
celery -A matreiro worker -l info
celery -A matreiro beat -l info

# Testes
python manage.py test
pytest
pytest --cov=.
```

---

**Última Atualização:** 09/03/2026  
**Versão:** 1.0.0
