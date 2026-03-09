# 📘 Plataforma Matreiro - Documentação de API

**Versão:** 1.0.0  
**Data de Atualização:** 09/03/2026  
**Stack:** React + Node.js/Python + PostgreSQL + Redis  

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Autenticação](#autenticação)
3. [Endpoints por Módulo](#endpoints-por-módulo)
4. [Schemas de Dados](#schemas-de-dados)
5. [Códigos de Status](#códigos-de-status)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)

---

## 🎯 Visão Geral

### Base URL

```
Desenvolvimento: http://localhost:8000/api/v1
Produção: https://api.matreiro.underprotection.com.br/api/v1
Supabase (atual): https://{projectId}.supabase.co/functions/v1/make-server-99a65fc7
```

### Formato de Resposta

Todas as respostas da API seguem o padrão JSON:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2026-03-09T14:30:00Z"
}
```

Em caso de erro:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "details": { ... }
  },
  "timestamp": "2026-03-09T14:30:00Z"
}
```

---

## 🔐 Autenticação

### JWT Authentication

A API utiliza JSON Web Tokens (JWT) para autenticação.

#### Login

```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600,
    "user": {
      "id": "user-123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "tenant_admin",
      "tenant_id": "tenant-1"
    }
  }
}
```

#### Refresh Token

```http
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Uso do Token

Todas as requisições autenticadas devem incluir o header:

```
Authorization: Bearer {access_token}
```

---

## 📦 Endpoints por Módulo

### 1️⃣ Tenants (Clientes)

#### Listar Tenants

```http
GET /tenants
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (int): Número da página (padrão: 1)
- `limit` (int): Itens por página (padrão: 50, máx: 100)
- `status` (string): Filtrar por status (active, inactive, suspended, trial)
- `search` (string): Buscar por nome ou documento
- `parent_id` (string): Filtrar sub-tenants

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "tenant-1",
        "name": "Banco Nacional S.A.",
        "document": "12.345.678/0001-90",
        "status": "active",
        "parent_id": null,
        "created_at": "2025-01-15T10:00:00Z",
        "auto_phishing_config": {
          "enabled": true,
          "delay_days": 30,
          "template_id": "template-1"
        },
        "stats": {
          "users_count": 150,
          "campaigns_count": 45,
          "sub_tenants_count": 3
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 128,
      "total_pages": 3
    }
  }
}
```

#### Buscar Tenant por ID

```http
GET /tenants/{id}
Authorization: Bearer {token}
```

#### Criar Tenant

```http
POST /tenants
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Nova Empresa LTDA",
  "document": "98.765.432/0001-11",
  "status": "trial",
  "parent_id": null,
  "contact_name": "Maria Silva",
  "contact_email": "maria@novaempresa.com",
  "contact_phone": "+55 11 98765-4321",
  "auto_phishing_config": {
    "enabled": false,
    "delay_days": 30,
    "template_id": null
  },
  "settings": {
    "timezone": "America/Sao_Paulo",
    "language": "pt-BR",
    "max_users": 50,
    "max_campaigns_month": 10
  }
}
```

#### Atualizar Tenant

```http
PUT /tenants/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Empresa Atualizada LTDA",
  "status": "active",
  "auto_phishing_config": {
    "enabled": true,
    "delay_days": 45,
    "template_id": "template-2"
  }
}
```

#### Deletar Tenant

```http
DELETE /tenants/{id}
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Tenant deleted successfully",
  "data": {
    "archived": true,
    "archived_at": "2026-03-09T14:30:00Z"
  }
}
```

---

### 2️⃣ Templates

#### Listar Templates

```http
GET /templates
Authorization: Bearer {token}
```

**Query Parameters:**
- `page` (int): Número da página
- `limit` (int): Itens por página
- `category` (string): Filtrar por categoria (credential-harvest, social-engineering, ceo-fraud, malware, link)
- `tenant_id` (string): Filtrar por tenant (null = global)
- `search` (string): Buscar por nome ou assunto
- `has_attachment` (boolean): Filtrar templates com anexos

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "template-1",
        "tenant_id": null,
        "name": "Atualização Urgente de Senha",
        "subject": "[URGENTE] Atualize sua senha corporativa",
        "category": "credential-harvest",
        "has_attachment": false,
        "body_html": "<p>Prezado(a) {{nome}},</p>...",
        "html_content": "<html>...</html>",
        "landing_page_html": "<html>...</html>",
        "capture_fields": ["nome", "email", "senha_atual", "senha"],
        "variables": ["nome", "email", "empresa", "link_phishing"],
        "attachment_count": 0,
        "landing_attachment_count": 0,
        "created_at": "2025-01-15T10:00:00Z",
        "updated_at": "2025-02-20T15:30:00Z",
        "stats": {
          "usage_count": 127,
          "avg_click_rate": 0.34,
          "avg_submission_rate": 0.18
        }
      }
    ],
    "pagination": { ... }
  }
}
```

#### Buscar Template por ID

```http
GET /templates/{id}
Authorization: Bearer {token}
```

#### Criar Template

```http
POST /templates
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenant_id": null,
  "name": "Novo Template de Teste",
  "subject": "Assunto do E-mail",
  "category": "credential-harvest",
  "body_html": "<p>Olá {{nome}},</p><p>Clique em {{link_phishing}}</p>",
  "html_content": "<html>...</html>",
  "landing_page_html": "<html>...</html>",
  "capture_fields": ["email", "senha"],
  "has_attachment": false,
  "attachment_count": 0,
  "landing_attachment_count": 0
}
```

#### Atualizar Template

```http
PUT /templates/{id}
Authorization: Bearer {token}
Content-Type: application/json
```

#### Deletar Template

```http
DELETE /templates/{id}
Authorization: Bearer {token}
```

#### Duplicar Template

```http
POST /templates/{id}/duplicate
Authorization: Bearer {token}
Content-Type: application/json

{
  "new_name": "Cópia de Template Original",
  "tenant_id": "tenant-123"
}
```

#### Upload de Anexos

```http
POST /templates/{id}/attachments
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": (binary),
  "type": "email",
  "name": "documento.pdf"
}
```

---

### 3️⃣ Campanhas

#### Listar Campanhas

```http
GET /campaigns
Authorization: Bearer {token}
```

**Query Parameters:**
- `page`, `limit`: Paginação
- `status` (string): draft, scheduled, active, paused, completed, cancelled
- `tenant_id` (string): Filtrar por tenant
- `created_by` (string): Filtrar por criador
- `start_date_from` (date): Data início (ISO 8601)
- `start_date_to` (date): Data fim
- `search` (string): Buscar por nome

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "campaign-1",
        "tenant_id": "tenant-1",
        "name": "Campanha Q1 2026 - Credenciais",
        "description": "Teste de conscientização...",
        "status": "active",
        "type": "standard",
        "template_id": "template-1",
        "target_group_ids": ["group-1", "group-2"],
        "scheduled_at": "2026-03-15T09:00:00Z",
        "created_by": "user-admin",
        "created_at": "2026-03-01T14:00:00Z",
        "stats": {
          "sent": 1523,
          "opened": 847,
          "clicked": 289,
          "submitted": 67,
          "reported": 12,
          "open_rate": 0.556,
          "click_rate": 0.190,
          "submit_rate": 0.044,
          "report_rate": 0.008
        }
      }
    ],
    "pagination": { ... }
  }
}
```

#### Buscar Campanha por ID

```http
GET /campaigns/{id}
Authorization: Bearer {token}
```

#### Criar Campanha

```http
POST /campaigns
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenant_id": "tenant-1",
  "name": "Nova Campanha de Teste",
  "description": "Descrição da campanha",
  "template_id": "template-1",
  "target_group_ids": ["group-1"],
  "type": "standard",
  "scheduled_at": "2026-03-20T10:00:00Z",
  "send_window": {
    "type": "immediate",
    "randomize": false,
    "delay_minutes": 0
  },
  "settings": {
    "track_opens": true,
    "track_clicks": true,
    "track_attachments": true,
    "notification_email": "admin@tenant.com"
  }
}
```

#### Atualizar Campanha

```http
PUT /campaigns/{id}
Authorization: Bearer {token}
```

#### Deletar Campanha

```http
DELETE /campaigns/{id}
Authorization: Bearer {token}
```

#### Iniciar Campanha

```http
POST /campaigns/{id}/start
Authorization: Bearer {token}
```

#### Pausar Campanha

```http
POST /campaigns/{id}/pause
Authorization: Bearer {token}
```

#### Retomar Campanha

```http
POST /campaigns/{id}/resume
Authorization: Bearer {token}
```

#### Cancelar Campanha

```http
POST /campaigns/{id}/cancel
Authorization: Bearer {token}
```

#### Obter Eventos da Campanha

```http
GET /campaigns/{id}/events
Authorization: Bearer {token}
```

**Query Parameters:**
- `event_type` (string): sent, opened, clicked, submitted, reported
- `page`, `limit`: Paginação
- `start_date`, `end_date`: Filtros de data

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "event-12345",
        "campaign_id": "campaign-1",
        "event_type": "clicked",
        "target_email": "usuario@empresa.com",
        "target_name": "João Silva",
        "ip_address": "203.0.113.45",
        "user_agent": "Mozilla/5.0...",
        "timestamp": "2026-03-15T10:23:45Z",
        "details": {
          "link_clicked": "https://phishing-simulation.com/track/abc123",
          "device": "desktop",
          "os": "Windows 10",
          "browser": "Chrome 122"
        }
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 4️⃣ Targets (Alvos/Colaboradores)

#### Listar Targets

```http
GET /targets
Authorization: Bearer {token}
```

**Query Parameters:**
- `tenant_id` (string): Filtrar por tenant
- `status` (string): active, inactive
- `department` (string): Filtrar por departamento
- `group_id` (string): Filtrar por grupo
- `search` (string): Buscar por nome ou email
- `source` (string): manual, ad, google, csv_import

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "target-123",
        "tenant_id": "tenant-1",
        "email": "colaborador@empresa.com",
        "name": "Maria Santos",
        "department": "TI",
        "position": "Analista de Sistemas",
        "group": "Developers",
        "status": "active",
        "source": "ad",
        "custom_fields": {
          "employee_id": "EMP-001",
          "manager": "João Silva",
          "location": "São Paulo"
        },
        "created_at": "2025-02-10T08:00:00Z",
        "last_campaign_date": "2026-03-01T10:00:00Z",
        "stats": {
          "campaigns_received": 8,
          "emails_opened": 6,
          "links_clicked": 2,
          "credentials_submitted": 0,
          "reported_phishing": 1,
          "risk_score": 0.25
        }
      }
    ],
    "pagination": { ... }
  }
}
```

#### Criar Target

```http
POST /targets
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenant_id": "tenant-1",
  "email": "novo@empresa.com",
  "name": "Pedro Oliveira",
  "department": "Financeiro",
  "position": "Contador",
  "group": "Finance Team",
  "status": "active",
  "source": "manual",
  "custom_fields": {
    "employee_id": "EMP-150"
  }
}
```

#### Importar Targets (CSV)

```http
POST /targets/import
Authorization: Bearer {token}
Content-Type: multipart/form-data

{
  "file": (binary),
  "tenant_id": "tenant-1",
  "mapping": {
    "email": "Email Address",
    "name": "Full Name",
    "department": "Department",
    "position": "Job Title"
  },
  "overwrite_existing": false
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "import_id": "import-789",
    "status": "processing",
    "total_rows": 1523,
    "processed": 0,
    "successful": 0,
    "failed": 0,
    "started_at": "2026-03-09T14:30:00Z"
  }
}
```

#### Status da Importação

```http
GET /targets/import/{import_id}
Authorization: Bearer {token}
```

#### Atualizar Target

```http
PUT /targets/{id}
Authorization: Bearer {token}
```

#### Deletar Target

```http
DELETE /targets/{id}
Authorization: Bearer {token}
```

---

### 5️⃣ Grupos de Targets

#### Listar Grupos

```http
GET /target-groups
Authorization: Bearer {token}
```

**Query Parameters:**
- `tenant_id` (string)
- `type` (string): local, ad, google
- `source` (string): manual, integration
- `search` (string)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "group-1",
        "tenant_id": "tenant-1",
        "name": "Equipe de Desenvolvimento",
        "description": "Todos os desenvolvedores",
        "type": "local",
        "source": "manual",
        "integration_provider": null,
        "member_count": 47,
        "target_ids": ["target-1", "target-2", "..."],
        "nested_group_ids": [],
        "parent_group_id": null,
        "sync_enabled": false,
        "last_sync_at": null,
        "created_at": "2025-01-20T09:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

#### Criar Grupo

```http
POST /target-groups
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenant_id": "tenant-1",
  "name": "Equipe Financeira",
  "description": "Departamento Financeiro",
  "type": "local",
  "source": "manual",
  "target_ids": ["target-10", "target-11"],
  "nested_group_ids": [],
  "sync_enabled": false
}
```

#### Sincronizar Grupo (Active Directory/Google)

```http
POST /target-groups/{id}/sync
Authorization: Bearer {token}
```

---

### 6️⃣ Treinamentos

#### Listar Treinamentos

```http
GET /trainings
Authorization: Bearer {token}
```

**Query Parameters:**
- `tenant_id` (string)
- `type` (string): video, quiz, interactive, scorm
- `status` (string): draft, published, archived
- `search` (string)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "training-1",
        "tenant_id": null,
        "title": "Introdução à Segurança da Informação",
        "description": "Conceitos básicos de segurança",
        "type": "video",
        "media_url": "https://cdn.matreiro.com/trainings/video-123.mp4",
        "duration": 1800,
        "thumbnail_url": "https://cdn.matreiro.com/trainings/thumb-123.jpg",
        "language": "pt-BR",
        "level": "beginner",
        "topics": ["phishing", "passwords", "social_engineering"],
        "has_quiz": true,
        "quiz_pass_score": 70,
        "certificate_enabled": true,
        "created_at": "2025-01-10T10:00:00Z",
        "stats": {
          "enrolled": 523,
          "completed": 487,
          "avg_score": 82.5,
          "completion_rate": 0.931
        }
      }
    ],
    "pagination": { ... }
  }
}
```

#### Criar Treinamento

```http
POST /trainings
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenant_id": null,
  "title": "Phishing Avançado",
  "description": "Técnicas avançadas de detecção",
  "type": "interactive",
  "media_url": "https://cdn.matreiro.com/trainings/scorm-456.zip",
  "duration": 3600,
  "language": "pt-BR",
  "level": "advanced",
  "topics": ["advanced_phishing", "forensics"],
  "has_quiz": true,
  "quiz_questions": [ ... ],
  "certificate_enabled": true
}
```

#### Atribuir Treinamento

```http
POST /trainings/{id}/assign
Authorization: Bearer {token}
Content-Type: application/json

{
  "target_ids": ["target-1", "target-2"],
  "target_group_ids": ["group-1"],
  "due_date": "2026-04-15T23:59:59Z",
  "send_notification": true
}
```

#### Progresso do Treinamento

```http
GET /trainings/{id}/progress
Authorization: Bearer {token}
```

**Query Parameters:**
- `target_id` (string): Filtrar por usuário específico
- `status` (string): not_started, in_progress, completed

---

### 7️⃣ Automações

#### Listar Automações

```http
GET /automations
Authorization: Bearer {token}
```

**Query Parameters:**
- `tenant_id` (string)
- `status` (string): active, paused, error
- `trigger` (string): campaign_click, campaign_submit, training_fail

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "automation-1",
        "tenant_id": "tenant-1",
        "name": "Treinamento Após Click",
        "description": "Enviar treinamento quando usuário clicar",
        "trigger": {
          "type": "campaign_click",
          "campaign_id": null,
          "template_id": "template-1"
        },
        "trigger_delay": 3600,
        "condition": {
          "type": "first_time_only",
          "max_executions": 1
        },
        "action": {
          "type": "assign_training",
          "training_id": "training-1",
          "notification_enabled": true
        },
        "status": "active",
        "execution_count": 127,
        "last_executed_at": "2026-03-09T10:15:00Z",
        "created_at": "2025-02-01T08:00:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

#### Criar Automação

```http
POST /automations
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenant_id": "tenant-1",
  "name": "Auto-Phishing Mensal",
  "description": "Campanha automática mensal",
  "trigger": {
    "type": "schedule",
    "cron": "0 9 1 * *",
    "timezone": "America/Sao_Paulo"
  },
  "trigger_delay": 0,
  "condition": {
    "type": "always"
  },
  "action": {
    "type": "create_campaign",
    "template_id": "template-1",
    "target_group_ids": ["group-1"]
  },
  "status": "active"
}
```

---

### 8️⃣ Relatórios e Analytics

#### Dashboard Overview

```http
GET /analytics/dashboard
Authorization: Bearer {token}
```

**Query Parameters:**
- `tenant_id` (string)
- `date_from` (date)
- `date_to` (date)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "period": {
      "from": "2026-02-01T00:00:00Z",
      "to": "2026-03-09T23:59:59Z"
    },
    "campaigns": {
      "total": 12,
      "active": 3,
      "completed": 9,
      "avg_open_rate": 0.547,
      "avg_click_rate": 0.192,
      "avg_submit_rate": 0.041
    },
    "targets": {
      "total": 1523,
      "at_risk": 89,
      "trained": 1201,
      "avg_risk_score": 0.31
    },
    "trainings": {
      "assigned": 2145,
      "completed": 1876,
      "completion_rate": 0.875,
      "avg_score": 81.2
    },
    "trends": {
      "click_rate": [
        {"date": "2026-02-01", "value": 0.23},
        {"date": "2026-02-08", "value": 0.21},
        {"date": "2026-02-15", "value": 0.19},
        {"date": "2026-02-22", "value": 0.17},
        {"date": "2026-03-01", "value": 0.15}
      ],
      "risk_score": [ ... ]
    }
  }
}
```

#### Relatório de Campanha

```http
GET /reports/campaign/{campaign_id}
Authorization: Bearer {token}
```

**Query Parameters:**
- `format` (string): json, pdf, csv, xlsx
- `include_details` (boolean): Incluir eventos detalhados

#### Relatório de Risco por Departamento

```http
GET /reports/risk-by-department
Authorization: Bearer {token}
```

**Query Parameters:**
- `tenant_id` (string)
- `date_from`, `date_to` (date)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "departments": [
      {
        "name": "TI",
        "employee_count": 47,
        "avg_risk_score": 0.18,
        "high_risk_count": 3,
        "campaigns_received": 376,
        "click_rate": 0.14,
        "submit_rate": 0.02
      },
      {
        "name": "Financeiro",
        "employee_count": 23,
        "avg_risk_score": 0.42,
        "high_risk_count": 8,
        "campaigns_received": 184,
        "click_rate": 0.35,
        "submit_rate": 0.09
      }
    ]
  }
}
```

---

### 9️⃣ Integrações

#### Listar Integrações

```http
GET /integrations
Authorization: Bearer {token}
```

**Query Parameters:**
- `tenant_id` (string)
- `provider` (string): microsoft, google, slack
- `status` (string): active, inactive, error

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "integration-1",
        "tenant_id": "tenant-1",
        "provider": "microsoft",
        "type": "active_directory",
        "name": "Microsoft AD - Tenant Principal",
        "status": "active",
        "config": {
          "tenant_id": "microsoft-tenant-id",
          "sync_enabled": true,
          "sync_frequency": "daily",
          "last_sync_at": "2026-03-09T03:00:00Z",
          "sync_status": "success"
        },
        "created_at": "2025-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### Criar Integração

```http
POST /integrations
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenant_id": "tenant-1",
  "provider": "google",
  "type": "workspace",
  "name": "Google Workspace Integration",
  "config": {
    "domain": "empresa.com",
    "client_id": "google-client-id",
    "client_secret": "google-client-secret",
    "sync_enabled": true,
    "sync_frequency": "hourly"
  }
}
```

#### Testar Integração

```http
POST /integrations/{id}/test
Authorization: Bearer {token}
```

#### Sincronizar Integração

```http
POST /integrations/{id}/sync
Authorization: Bearer {token}
```

---

### 🔟 Usuários e Permissões

#### Listar Usuários

```http
GET /users
Authorization: Bearer {token}
```

**Query Parameters:**
- `tenant_id` (string)
- `role` (string): superadmin, tenant_admin, sub_tenant_admin, manager, analyst, viewer
- `status` (string): active, inactive
- `search` (string)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "user-123",
        "email": "admin@empresa.com",
        "first_name": "João",
        "last_name": "Silva",
        "role": "tenant_admin",
        "tenant_id": "tenant-1",
        "department": "TI",
        "phone": "+55 11 98765-4321",
        "language": "pt-BR",
        "is_active": true,
        "last_login": "2026-03-09T08:30:00Z",
        "last_login_ip": "203.0.113.45",
        "created_at": "2025-01-15T10:00:00Z",
        "permissions": [
          "campaigns.create",
          "campaigns.edit",
          "reports.view"
        ]
      }
    ],
    "pagination": { ... }
  }
}
```

#### Criar Usuário

```http
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "email": "novo@empresa.com",
  "first_name": "Maria",
  "last_name": "Santos",
  "password": "Senha@Segura123",
  "role": "analyst",
  "tenant_id": "tenant-1",
  "department": "Segurança",
  "phone": "+55 11 91234-5678",
  "language": "pt-BR",
  "send_welcome_email": true
}
```

#### Listar Permissões

```http
GET /permissions
Authorization: Bearer {token}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "modules": [
      {
        "module": "campaigns",
        "permissions": [
          {
            "code": "campaigns.view",
            "name": "View Campaigns",
            "description": "View campaign list and details"
          },
          {
            "code": "campaigns.create",
            "name": "Create Campaigns",
            "description": "Create new campaigns"
          },
          {
            "code": "campaigns.edit",
            "name": "Edit Campaigns",
            "description": "Edit existing campaigns"
          },
          {
            "code": "campaigns.delete",
            "name": "Delete Campaigns",
            "description": "Delete campaigns"
          },
          {
            "code": "campaigns.execute",
            "name": "Execute Campaigns",
            "description": "Start/pause/cancel campaigns"
          }
        ]
      }
    ]
  }
}
```

#### Impersonar Usuário (Super Admin)

```http
POST /users/{id}/impersonate
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Support ticket #12345"
}
```

**Resposta:**
```json
{
  "success": true,
  "data": {
    "impersonation_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "original_user_id": "user-admin",
    "impersonated_user_id": "user-123",
    "expires_at": "2026-03-09T16:30:00Z"
  }
}
```

#### Encerrar Impersonação

```http
POST /users/impersonate/stop
Authorization: Bearer {impersonation_token}
```

---

### 1️⃣1️⃣ Logs de Auditoria

#### Listar Logs

```http
GET /audit-logs
Authorization: Bearer {token}
```

**Query Parameters:**
- `user_id` (string)
- `action` (string): create, update, delete, view, login, logout, impersonate_start, impersonate_end
- `resource_type` (string): campaign, template, user, tenant
- `resource_id` (string)
- `date_from`, `date_to` (date)
- `ip_address` (string)

**Resposta:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "log-12345",
        "user": {
          "id": "user-123",
          "email": "admin@empresa.com",
          "name": "João Silva"
        },
        "action": "create",
        "resource_type": "campaign",
        "resource_id": "campaign-456",
        "details": {
          "campaign_name": "Nova Campanha Q1",
          "template_id": "template-1"
        },
        "ip_address": "203.0.113.45",
        "user_agent": "Mozilla/5.0...",
        "timestamp": "2026-03-09T14:30:00Z"
      }
    ],
    "pagination": { ... }
  }
}
```

---

### 1️⃣2️⃣ Landing Pages

#### Capturar Dados

```http
POST /landing/{tracking_code}
Content-Type: application/json

{
  "nome": "João Silva",
  "email": "joao@empresa.com",
  "senha": "senha123",
  "cpf": "123.456.789-00"
}
```

**Resposta:**
```json
{
  "success": true,
  "message": "Data captured successfully"
}
```

#### Download de Anexo (Landing Page)

```http
GET /landing/{tracking_code}/attachment/{attachment_id}
```

---

## 📊 Schemas de Dados

### Tenant Schema

```typescript
interface Tenant {
  id: string;
  name: string;
  document: string;
  status: 'active' | 'inactive' | 'suspended' | 'trial';
  parent_id: string | null;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  auto_phishing_config?: {
    enabled: boolean;
    delay_days: number;
    template_id: string | null;
  };
  settings?: Record<string, any>;
  max_users?: number;
  max_campaigns_month?: number;
  subscription_start?: string;
  subscription_end?: string;
  integrations?: {
    microsoft_tenant_id?: string;
    google_workspace_domain?: string;
  };
  created_at: string;
  updated_at?: string;
}
```

### Template Schema

```typescript
interface Template {
  id: string;
  tenant_id: string | null;
  name: string;
  subject: string;
  category: 'credential-harvest' | 'social-engineering' | 'ceo-fraud' | 'malware' | 'link';
  body_html: string;
  html_content: string;
  landing_page_html?: string;
  capture_fields?: string[];
  has_attachment: boolean;
  attachment_count: number;
  landing_attachment_count: number;
  variables?: string[];
  created_at: string;
  updated_at?: string;
}
```

### Campaign Schema

```typescript
interface Campaign {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  type: 'standard' | 'automated' | 'test';
  template_id: string;
  target_group_ids: string[];
  scheduled_at?: string;
  started_at?: string;
  completed_at?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
  stats: {
    sent: number;
    opened: number;
    clicked: number;
    submitted: number;
    reported: number;
  };
  settings?: {
    track_opens: boolean;
    track_clicks: boolean;
    track_attachments: boolean;
    notification_email?: string;
  };
}
```

### Target Schema

```typescript
interface Target {
  id: string;
  tenant_id: string;
  email: string;
  name: string;
  department?: string;
  position?: string;
  group?: string;
  status: 'active' | 'inactive';
  source: 'manual' | 'ad' | 'google' | 'csv_import';
  custom_fields?: Record<string, any>;
  created_at: string;
  updated_at?: string;
}
```

### TargetGroup Schema

```typescript
interface TargetGroup {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  type: 'local' | 'ad' | 'google';
  source: 'manual' | 'integration';
  integration_provider?: string | null;
  member_count: number;
  target_ids: string[];
  nested_group_ids: string[];
  parent_group_id?: string | null;
  sync_enabled: boolean;
  last_sync_at?: string | null;
  created_at: string;
  updated_at?: string;
}
```

### Training Schema

```typescript
interface Training {
  id: string;
  tenant_id: string | null;
  title: string;
  description?: string;
  type: 'video' | 'quiz' | 'interactive' | 'scorm';
  media_url: string;
  duration: number; // seconds
  thumbnail_url?: string;
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  topics: string[];
  has_quiz: boolean;
  quiz_questions?: QuizQuestion[];
  quiz_pass_score?: number;
  certificate_enabled: boolean;
  created_at: string;
  updated_at?: string;
}
```

---

## 🚦 Códigos de Status

### Sucesso (2xx)

- `200 OK`: Requisição bem-sucedida
- `201 Created`: Recurso criado com sucesso
- `202 Accepted`: Requisição aceita para processamento (async)
- `204 No Content`: Requisição bem-sucedida sem conteúdo de resposta

### Erro do Cliente (4xx)

- `400 Bad Request`: Requisição inválida
- `401 Unauthorized`: Não autenticado
- `403 Forbidden`: Não autorizado (sem permissão)
- `404 Not Found`: Recurso não encontrado
- `409 Conflict`: Conflito (ex: email duplicado)
- `422 Unprocessable Entity`: Validação falhou
- `429 Too Many Requests`: Rate limit excedido

### Erro do Servidor (5xx)

- `500 Internal Server Error`: Erro interno
- `502 Bad Gateway`: Erro no gateway
- `503 Service Unavailable`: Serviço indisponível
- `504 Gateway Timeout`: Timeout no gateway

---

## ⚡ Rate Limiting

### Limites por Endpoint

```
Autenticação (/auth/*):
  - 5 requisições por minuto por IP
  - 20 requisições por hora por IP

Leitura (GET):
  - 100 requisições por minuto
  - 5000 requisições por hora

Escrita (POST/PUT/DELETE):
  - 50 requisições por minuto
  - 2000 requisições por hora

Relatórios:
  - 20 requisições por minuto
  - 500 requisições por hora

Import/Export:
  - 5 requisições por minuto
  - 50 requisições por hora
```

### Headers de Rate Limit

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1678368000
```

---

## 🔔 Webhooks

A Plataforma Matreiro suporta webhooks para notificações em tempo real de eventos.

### Configurar Webhook

```http
POST /webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "tenant_id": "tenant-1",
  "url": "https://seu-sistema.com/webhooks/matreiro",
  "events": [
    "campaign.started",
    "campaign.completed",
    "target.clicked",
    "target.submitted",
    "training.completed"
  ],
  "secret": "webhook-secret-key",
  "enabled": true
}
```

### Eventos Disponíveis

```
Campanhas:
- campaign.created
- campaign.started
- campaign.paused
- campaign.completed
- campaign.cancelled

Eventos de Targets:
- target.email_sent
- target.email_opened
- target.link_clicked
- target.credentials_submitted
- target.phishing_reported

Treinamentos:
- training.assigned
- training.started
- training.completed
- training.failed

Integrações:
- integration.sync_started
- integration.sync_completed
- integration.sync_failed

Alertas:
- alert.high_risk_user
- alert.multiple_failures
- alert.unusual_activity
```

### Formato de Payload

```json
{
  "event": "target.link_clicked",
  "timestamp": "2026-03-09T14:30:00Z",
  "tenant_id": "tenant-1",
  "data": {
    "campaign_id": "campaign-123",
    "campaign_name": "Teste Q1 2026",
    "target_email": "usuario@empresa.com",
    "target_name": "João Silva",
    "ip_address": "203.0.113.45",
    "user_agent": "Mozilla/5.0...",
    "link_clicked": "https://phishing-simulation.com/track/abc123"
  }
}
```

### Segurança do Webhook

Todos os webhooks incluem header de assinatura:

```
X-Matreiro-Signature: sha256=abc123def456...
```

Para validar:

```javascript
const crypto = require('crypto');

function validateWebhook(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = 'sha256=' + hmac.update(JSON.stringify(payload)).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}
```

---

## 🛠️ Ambiente de Desenvolvimento

### Configuração Local

```bash
# Clonar repositório
git clone https://github.com/underprotection/matreiro-platform.git
cd matreiro-platform

# Instalar dependências
npm install
cd backend && pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env

# Iniciar serviços com Docker
docker-compose up -d

# Rodar migrações
python manage.py migrate

# Popular dados de teste
python manage.py seed_data

# Iniciar servidor de desenvolvimento
python manage.py runserver
```

### Testes

```bash
# Rodar todos os testes
pytest

# Testes com cobertura
pytest --cov=.

# Testes de integração
pytest tests/integration/

# Testes de API
pytest tests/api/
```

---

## 📞 Suporte

- **Documentação:** https://docs.matreiro.underprotection.com.br
- **Email:** suporte@underprotection.com.br
- **Status da API:** https://status.matreiro.underprotection.com.br
- **Changelog:** https://github.com/underprotection/matreiro-platform/releases

---

## 📝 Changelog

### v1.0.0 (09/03/2026)
- ✅ Documentação inicial completa
- ✅ Todos os endpoints principais documentados
- ✅ Schemas e exemplos de requisições
- ✅ Rate limiting e webhooks configurados

---

**Última Atualização:** 09/03/2026  
**Versão da API:** 1.0.0  
**Versão da Documentação:** 1.0.0
