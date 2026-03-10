# 🏗️ Arquitetura - Plataforma Matreiro

Documentação completa da arquitetura técnica da Plataforma Matreiro.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Stack Tecnológica](#stack-tecnológica)
- [Arquitetura em Camadas](#arquitetura-em-camadas)
- [Fluxo de Dados](#fluxo-de-dados)
- [Multi-Tenancy](#multi-tenancy)
- [Segurança](#segurança)
- [Escalabilidade](#escalabilidade)
- [Decisões Técnicas](#decisões-técnicas)

---

## 🎯 Visão Geral

A Plataforma Matreiro é uma aplicação SaaS multi-tenant construída com arquitetura de três camadas:

```
┌─────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                    │
│                     (React Frontend)                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                     │
│           (Django REST API + Edge Functions)            │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                       DATA LAYER                         │
│            (PostgreSQL + Redis + Supabase)              │
└─────────────────────────────────────────────────────────┘
```

### Princípios Arquiteturais

1. **Separation of Concerns**: Cada camada tem responsabilidades bem definidas
2. **Multi-Tenancy First**: Isolamento completo de dados por tenant
3. **API-First**: Frontend consome apenas APIs REST
4. **Async Processing**: Tarefas pesadas processadas via Celery
5. **Scalability**: Componentes podem escalar independentemente
6. **Security by Design**: Segurança em todas as camadas

---

## 🛠️ Stack Tecnológica

### Frontend

```
React 18
├── TypeScript
├── Tailwind CSS 4
├── React Router (Data Mode)
├── Recharts (Gráficos)
└── Lucide React (Ícones)
```

### Backend

```
Django 4.2
├── Django REST Framework 3.14
├── Celery 5.3 (Tasks assíncronas)
├── Gunicorn (WSGI Server)
└── Python 3.11
```

### Banco de Dados

```
PostgreSQL 15
├── Extensões:
│   ├── uuid-ossp (UUIDs)
│   ├── pg_trgm (Full-text search)
│   └── pgcrypto (Criptografia)
└── Redis 7 (Cache + Queue)
```

### Infraestrutura

```
Docker + Docker Compose
├── Keycloak 23 (IAM/SSO)
├── Nginx (Reverse Proxy)
└── Supabase (Edge Functions + Storage)
```

### Integrações

```
Azure Active Directory
├── Microsoft Graph API
├── SendGrid/AWS SES (Email)
└── OpenAI API (Validação IA)
```

---

## 🏛️ Arquitetura em Camadas

### 1. Presentation Layer (Frontend)

**Responsabilidades**:
- Interface do usuário
- Validação de dados (client-side)
- State management
- Comunicação com API

**Tecnologias**:
- React 18 com TypeScript
- Tailwind CSS 4
- React Router para navegação
- Context API para estado global

**Estrutura**:
```
src/
├── app/
│   ├── App.tsx                 # Componente raiz
│   ├── routes.ts               # Configuração de rotas
│   └── components/             # Componentes reutilizáveis
├── pages/                      # Páginas da aplicação
│   ├── Dashboard.tsx
│   ├── Campaigns.tsx
│   └── ...
└── styles/                     # Estilos globais
```

### 2. Application Layer (Backend)

**Responsabilidades**:
- Lógica de negócio
- Autenticação e autorização
- Validação de dados (server-side)
- Processamento de tarefas
- Integrações externas

**Componentes**:

#### Django REST API
```
backend/
├── matreiro/                   # Projeto principal
│   ├── settings.py            # Configurações
│   ├── urls.py                # URLs principais
│   └── celery.py              # Configuração Celery
│
├── api/                       # App principal
│   ├── models.py              # Modelos de dados
│   ├── views.py               # Controllers
│   ├── serializers.py         # Serialização
│   └── permissions.py         # RBAC
│
├── campaigns/                 # Módulo de campanhas
├── training/                  # Módulo de treinamentos
├── integrations/              # Integrações externas
└── analytics/                 # Analytics e relatórios
```

#### Celery (Processamento Assíncrono)
```
Tarefas:
├── Email sending (bulk)
├── Azure AD sync
├── Report generation
├── Data aggregation
└── Cleanup tasks
```

#### Supabase Edge Functions
```
Edge Functions (Hono):
├── make-server-99a65fc7/      # Servidor principal
│   ├── Health check
│   ├── KV store operations
│   └── Proxy para Django
```

### 3. Data Layer

**Responsabilidades**:
- Armazenamento persistente
- Cache
- Filas de mensagens
- Blob storage

**Componentes**:

#### PostgreSQL
```
Database:
├── Tenants                    # Multi-tenancy
├── Users                      # Usuários
├── Campaigns                  # Campanhas
├── Targets                    # Alvos
├── Results                    # Resultados
├── Templates                  # Templates
├── Landing Pages              # Landing pages
├── Trainings                  # Treinamentos
└── Audit Logs                 # Auditoria
```

#### Redis
```
Uso:
├── Cache (Django cache)
├── Celery broker
├── Celery results
└── Session storage
```

#### Supabase
```
Recursos:
├── Edge Database (KV Store)
├── Storage (Arquivos)
├── Auth (Alternativa)
└── Realtime (WebSockets)
```

---

## 🔄 Fluxo de Dados

### 1. Fluxo de Criação de Campanha

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. POST /api/campaigns
     ↓
┌────────────────┐
│  React App     │
└────┬───────────┘
     │
     │ 2. HTTP Request + JWT
     ↓
┌────────────────┐
│  Django API    │
└────┬───────────┘
     │
     │ 3. Validate JWT (Keycloak)
     │ 4. Check permissions (RBAC)
     │ 5. Validate data
     │ 6. Save to PostgreSQL
     ↓
┌────────────────┐
│  PostgreSQL    │
└────┬───────────┘
     │
     │ 7. Return created campaign
     ↓
┌────────────────┐
│  React App     │
└────┬───────────┘
     │
     │ 8. Update UI
     ↓
┌──────────┐
│  User    │
└──────────┘
```

### 2. Fluxo de Envio de Campanha

```
┌──────────┐
│  User    │ 1. Click "Start Campaign"
└────┬─────┘
     │
     ↓
┌────────────────┐
│  Django API    │ 2. Create Celery task
└────┬───────────┘
     │
     ↓
┌────────────────┐
│  Redis Queue   │ 3. Enqueue task
└────┬───────────┘
     │
     ↓
┌────────────────┐
│  Celery Worker │ 4. Process in background
└────┬───────────┘
     │
     │ 5. For each target:
     │    - Render template
     │    - Send email (SendGrid)
     │    - Save result
     │
     ↓
┌────────────────┐
│  PostgreSQL    │ 6. Update results
└────┬───────────┘
     │
     ↓
┌────────────────┐
│  React App     │ 7. Poll for updates
└────┬───────────┘
     │
     ↓
┌──────────┐
│  User    │ 8. See real-time progress
└──────────┘
```

### 3. Fluxo de Tracking

```
┌──────────┐
│  Target  │ 1. Open email / Click link
└────┬─────┘
     │
     │ 2. GET /track/{id}
     ↓
┌────────────────┐
│  Landing Page  │ 3. Load page + tracking pixel
└────┬───────────┘
     │
     │ 4. POST /api/track/event
     ↓
┌────────────────┐
│  Django API    │ 5. Record event
└────┬───────────┘
     │
     │ 6. Update metrics
     ↓
┌────────────────┐
│  PostgreSQL    │ 7. Save result
└────┬───────────┘
     │
     │ 8. Trigger analytics update
     ↓
┌────────────────┐
│  Celery Task   │ 9. Recalculate stats
└────────────────┘
```

---

## 🏢 Multi-Tenancy

### Estratégia: Shared Database, Isolated Schema

Todos os tenants compartilham o mesmo banco de dados, mas com isolamento lógico via `tenant_id`.

#### Vantagens
- ✅ Menor custo operacional
- ✅ Backup e restore simplificados
- ✅ Mais fácil de escalar inicialmente
- ✅ Updates de schema unificados

#### Implementação

**1. Todas as tabelas têm `tenant_id`**:
```sql
CREATE TABLE campaigns (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    ...
);
```

**2. Middleware de Tenant Context**:
```python
# core/middleware.py
class TenantMiddleware:
    def __call__(self, request):
        # Extrai tenant_id do JWT ou header
        tenant_id = get_tenant_from_request(request)
        
        # Define no contexto da thread
        set_current_tenant(tenant_id)
        
        response = self.get_response(request)
        return response
```

**3. Query Filter Automático**:
```python
# api/models.py
class TenantAwareModel(models.Model):
    tenant_id = models.UUIDField()
    
    class Meta:
        abstract = True
    
    @classmethod
    def get_queryset(cls):
        tenant_id = get_current_tenant()
        return super().get_queryset().filter(tenant_id=tenant_id)
```

**4. Hierarquia de Tenants**:
```
Under Protection (parent)
├── Acme Corp
│   └── Acme Corp - Filial Rio (child)
├── TechStart Brasil
└── Global Finance
```

Child tenants herdam configurações do parent.

---

## 🔒 Segurança

### 1. Autenticação

**Keycloak SSO**:
```
┌──────────┐
│  User    │ 1. Login
└────┬─────┘
     │
     ↓
┌────────────────┐
│  Keycloak      │ 2. Authenticate
└────┬───────────┘
     │
     │ 3. Issue JWT
     ↓
┌────────────────┐
│  React App     │ 4. Store token
└────┬───────────┘
     │
     │ 5. Include in all requests
     ↓
┌────────────────┐
│  Django API    │ 6. Validate JWT
└────────────────┘
```

### 2. Autorização (RBAC)

**Roles**:
```
super_admin
├── Acesso total
├── Impersonation
└── Multi-tenant management

tenant_admin
├── Acesso total ao tenant
├── User management
└── Campaign management

manager
├── Create campaigns
├── View reports
└── Manage targets

analyst
├── View campaigns
└── View reports

user
└── View assigned trainings
```

**Permissions**:
```python
# api/permissions.py
class IsTenantAdmin(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['super_admin', 'tenant_admin']

class CanManageCampaigns(BasePermission):
    def has_permission(self, request, view):
        return request.user.role in ['super_admin', 'tenant_admin', 'manager']
```

### 3. Proteções

- **SQL Injection**: Django ORM com prepared statements
- **XSS**: Escape automático de templates + CSP headers
- **CSRF**: Django CSRF protection
- **Rate Limiting**: django-ratelimit
- **Brute Force**: django-defender
- **Secrets**: Variáveis de ambiente + encryption at rest
- **Audit Logs**: Todas as ações sensíveis são registradas

---

## 📈 Escalabilidade

### Horizontal Scaling

**1. Frontend (React)**:
```
Load Balancer
├── React Instance 1
├── React Instance 2
└── React Instance 3
```

**2. Backend (Django)**:
```
Load Balancer
├── Django Worker 1
├── Django Worker 2
└── Django Worker 3
```

**3. Celery Workers**:
```
Celery Beat (1 instance)
├── Celery Worker 1
├── Celery Worker 2
└── Celery Worker 3
```

### Vertical Scaling

**PostgreSQL**:
- Read replicas para consultas pesadas
- Connection pooling (PgBouncer)
- Índices otimizados

**Redis**:
- Redis Cluster para alta disponibilidade
- Partitioning por tenant

### Caching Strategy

**Níveis de Cache**:
```
1. Browser Cache (static assets)
2. CDN Cache (images, CSS, JS)
3. Redis Cache (API responses)
4. PostgreSQL Query Cache
```

**Exemplo**:
```python
from django.core.cache import cache

def get_campaign_stats(campaign_id):
    cache_key = f'campaign_stats:{campaign_id}'
    stats = cache.get(cache_key)
    
    if not stats:
        stats = calculate_stats(campaign_id)
        cache.set(cache_key, stats, timeout=300)  # 5 min
    
    return stats
```

---

## 🎯 Decisões Técnicas

### Por que Django?

1. **Batteries Included**: ORM, Admin, Auth out-of-the-box
2. **Django REST Framework**: Melhor framework para APIs REST
3. **Ecosystem**: Vasta biblioteca de packages
4. **Security**: Proteções built-in contra vulnerabilidades comuns
5. **Scalability**: Proven em sistemas de grande escala

### Por que PostgreSQL?

1. **ACID Compliance**: Transações confiáveis
2. **JSON Support**: Campos JSONB para dados flexíveis
3. **Full-Text Search**: Busca nativa sem Elasticsearch
4. **Extensions**: pg_trgm, uuid-ossp, pgcrypto
5. **Performance**: Query planner superior

### Por que Redis?

1. **Speed**: In-memory para cache ultra-rápido
2. **Pub/Sub**: Para real-time features
3. **Celery**: Broker nativo do Celery
4. **Sessions**: Armazenamento de sessões
5. **Simplicity**: Fácil de configurar e usar

### Por que Keycloak?

1. **Standards**: OIDC, SAML, OAuth 2.0
2. **SSO**: Single Sign-On corporativo
3. **Federation**: Integração com Azure AD, Google, etc
4. **User Management**: UI completa para gestão de usuários
5. **Open Source**: Sem vendor lock-in

### Por que React?

1. **Component-Based**: Reutilização máxima
2. **Ecosystem**: Melhor ecossistema frontend
3. **TypeScript**: Type safety
4. **Performance**: Virtual DOM
5. **Tooling**: Excelentes ferramentas de desenvolvimento

---

## 📊 Monitoramento

### Métricas Chave

**Application**:
- Request rate
- Response time (p50, p95, p99)
- Error rate
- Celery queue length

**Infrastructure**:
- CPU usage
- Memory usage
- Disk I/O
- Network traffic

**Business**:
- Active campaigns
- Email sent/hour
- User engagement
- Training completion rate

### Ferramentas

- **Logs**: Django logging + ELK stack
- **Metrics**: Prometheus + Grafana
- **Errors**: Sentry
- **APM**: New Relic / DataDog
- **Uptime**: UptimeRobot

---

**🛡️ Plataforma Matreiro - Under Protection © 2024-2026**
