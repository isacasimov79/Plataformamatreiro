# 🗄️ Plataforma Matreiro - Guia de Migração de Banco de Dados

**Versão:** 1.0.0  
**Data de Atualização:** 09/03/2026  
**Banco de Dados:** PostgreSQL 15+  

---

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Pré-requisitos](#pré-requisitos)
3. [Esquema do Banco de Dados](#esquema-do-banco-de-dados)
4. [Scripts de Migração](#scripts-de-migração)
5. [Procedimentos de Backup](#procedimentos-de-backup)
6. [Rollback](#rollback)
7. [Otimizações e Índices](#otimizações-e-índices)
8. [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

Este documento descreve o processo completo de migração do banco de dados da Plataforma Matreiro, incluindo:

- Criação de esquema inicial
- Migrações incrementais
- Estratégias de backup e restore
- Otimizações de performance
- Procedimentos de rollback

### Arquitetura Multi-Tenant

A plataforma utiliza uma arquitetura **multi-tenant compartilhada** (shared database), onde todos os tenants compartilham as mesmas tabelas, mas os dados são isolados através de `tenant_id`.

```
┌─────────────────────────────────────┐
│         PostgreSQL Database         │
│                                     │
│  ┌────────────┐  ┌────────────┐   │
│  │  Tenant 1  │  │  Tenant 2  │   │
│  │    Data    │  │    Data    │   │
│  └────────────┘  └────────────┘   │
│          ↓              ↓          │
│  ┌─────────────────────────────┐  │
│  │    Shared Tables (RLS)      │  │
│  │  - users                    │  │
│  │  - campaigns                │  │
│  │  - templates                │  │
│  │  - targets                  │  │
│  └─────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 🔧 Pré-requisitos

### Software Necessário

```bash
# PostgreSQL 15+
postgresql-15
postgresql-contrib-15
postgresql-15-pgvector  # Para busca semântica (futuro)

# Ferramentas de migração
python 3.11+
django 5.0+
psycopg2-binary

# Ferramentas de backup
pg_dump
pg_restore
pgbackrest (recomendado para produção)
```

### Variáveis de Ambiente

```bash
# .env
DATABASE_URL=postgresql://matreiro_user:password@localhost:5432/matreiro_db
POSTGRES_DB=matreiro_db
POSTGRES_USER=matreiro_user
POSTGRES_PASSWORD=matreiro_password_secure
POSTGRES_HOST=localhost
POSTGRES_PORT=5432

# Conexões
POSTGRES_MAX_CONNECTIONS=200
POSTGRES_SHARED_BUFFERS=256MB
POSTGRES_EFFECTIVE_CACHE_SIZE=1GB
```

---

## 📊 Esquema do Banco de Dados

### ERD (Entity Relationship Diagram)

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Tenants   │◄──────│    Users    │──────►│Permissions  │
└─────────────┘       └─────────────┘       └─────────────┘
       │                     │                      │
       │                     │                      │
       ▼                     ▼                      ▼
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│  Campaigns  │──────►│  Templates  │       │    Roles    │
└─────────────┘       └─────────────┘       └─────────────┘
       │                     │
       │                     │
       ▼                     ▼
┌─────────────┐       ┌─────────────┐
│   Targets   │◄──────│TargetGroups │
└─────────────┘       └─────────────┘
       │
       │
       ▼
┌─────────────┐       ┌─────────────┐
│  Trainings  │       │ AuditLogs   │
└─────────────┘       └─────────────┘
```

### Schema SQL Completo

```sql
-- =====================================================
-- 1. EXTENSÕES
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- =====================================================
-- 2. SCHEMA
-- =====================================================

CREATE SCHEMA IF NOT EXISTS matreiro;
SET search_path TO matreiro, public;

-- =====================================================
-- 3. TIPOS ENUM
-- =====================================================

-- Status de Tenant
CREATE TYPE tenant_status AS ENUM (
    'active',
    'inactive',
    'suspended',
    'trial'
);

-- Roles de Usuário
CREATE TYPE user_role AS ENUM (
    'superadmin',
    'tenant_admin',
    'sub_tenant_admin',
    'manager',
    'analyst',
    'viewer'
);

-- Status de Campanha
CREATE TYPE campaign_status AS ENUM (
    'draft',
    'scheduled',
    'active',
    'paused',
    'completed',
    'cancelled'
);

-- Tipo de Campanha
CREATE TYPE campaign_type AS ENUM (
    'standard',
    'automated',
    'test'
);

-- Categoria de Template
CREATE TYPE template_category AS ENUM (
    'credential-harvest',
    'social-engineering',
    'ceo-fraud',
    'malware',
    'link'
);

-- Tipo de Evento
CREATE TYPE event_type AS ENUM (
    'sent',
    'opened',
    'clicked',
    'submitted',
    'reported',
    'attachment_downloaded'
);

-- Status de Target
CREATE TYPE target_status AS ENUM (
    'active',
    'inactive'
);

-- Fonte de Target
CREATE TYPE target_source AS ENUM (
    'manual',
    'ad',
    'google',
    'csv_import',
    'api'
);

-- Tipo de Grupo
CREATE TYPE group_type AS ENUM (
    'local',
    'ad',
    'google'
);

-- Tipo de Treinamento
CREATE TYPE training_type AS ENUM (
    'video',
    'quiz',
    'interactive',
    'scorm',
    'document'
);

-- Nível de Treinamento
CREATE TYPE training_level AS ENUM (
    'beginner',
    'intermediate',
    'advanced'
);

-- Status de Treinamento
CREATE TYPE training_assignment_status AS ENUM (
    'assigned',
    'in_progress',
    'completed',
    'failed',
    'expired'
);

-- Tipo de Ação (Audit)
CREATE TYPE audit_action AS ENUM (
    'create',
    'update',
    'delete',
    'view',
    'login',
    'logout',
    'impersonate_start',
    'impersonate_end'
);

-- Status de Automação
CREATE TYPE automation_status AS ENUM (
    'active',
    'paused',
    'error'
);

-- =====================================================
-- 4. TABELAS PRINCIPAIS
-- =====================================================

-- -----------------------------------------------
-- Tenants (Clientes)
-- -----------------------------------------------
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(200) UNIQUE NOT NULL,
    document VARCHAR(50) UNIQUE,
    status tenant_status DEFAULT 'trial',
    
    -- Hierarquia multi-tenant
    parent_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Contato
    contact_name VARCHAR(200),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    
    -- Endereço
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Brasil',
    postal_code VARCHAR(20),
    
    -- Configurações
    settings JSONB DEFAULT '{}',
    
    -- Limites de assinatura
    max_users INTEGER DEFAULT 10,
    max_campaigns_month INTEGER DEFAULT 5,
    max_storage_mb INTEGER DEFAULT 1000,
    subscription_start DATE,
    subscription_end DATE,
    
    -- Integrações
    microsoft_tenant_id VARCHAR(200),
    google_workspace_domain VARCHAR(200),
    
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#242545',
    
    -- Auto-phishing config
    auto_phishing_enabled BOOLEAN DEFAULT false,
    auto_phishing_delay_days INTEGER DEFAULT 30,
    auto_phishing_template_id UUID,
    
    -- Metadados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- -----------------------------------------------
-- Users (Usuários)
-- -----------------------------------------------
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Autenticação
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    
    -- Dados pessoais
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    phone VARCHAR(20),
    department VARCHAR(100),
    position VARCHAR(100),
    
    -- Permissões
    role user_role DEFAULT 'viewer',
    is_active BOOLEAN DEFAULT true,
    is_superuser BOOLEAN DEFAULT false,
    
    -- Preferências
    language VARCHAR(10) DEFAULT 'pt-BR',
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Segurança
    last_login TIMESTAMP,
    last_login_ip INET,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    password_changed_at TIMESTAMP,
    must_change_password BOOLEAN DEFAULT false,
    
    -- Impersonation
    original_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    is_impersonating BOOLEAN DEFAULT false,
    
    -- 2FA
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(100),
    
    -- Metadados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- Constraints
    CONSTRAINT valid_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_role CHECK (tenant_id IS NOT NULL OR role = 'superadmin')
);

-- -----------------------------------------------
-- Permissions (Permissões)
-- -----------------------------------------------
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    module VARCHAR(50) NOT NULL,
    resource VARCHAR(50),
    action VARCHAR(50),
    is_system BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- Roles (Papéis Customizados)
-- -----------------------------------------------
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    description TEXT,
    is_system_role BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(slug, tenant_id)
);

-- -----------------------------------------------
-- Role Permissions (Permissões por Papel)
-- -----------------------------------------------
CREATE TABLE role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(role_id, permission_id)
);

-- -----------------------------------------------
-- User Permissions (Permissões Individuais)
-- -----------------------------------------------
CREATE TABLE user_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    resource_id VARCHAR(100),
    granted BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------
-- Templates
-- -----------------------------------------------
CREATE TABLE templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    name VARCHAR(200) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    category template_category NOT NULL,
    
    -- Conteúdo
    body_html TEXT NOT NULL,
    html_content TEXT NOT NULL,
    landing_page_html TEXT,
    
    -- Variáveis e campos
    variables TEXT[], -- Array de variáveis disponíveis
    capture_fields TEXT[], -- Campos capturados na landing page
    
    -- Anexos
    has_attachment BOOLEAN DEFAULT false,
    attachment_count INTEGER DEFAULT 0,
    landing_attachment_count INTEGER DEFAULT 0,
    
    -- Metadados
    language VARCHAR(10) DEFAULT 'pt-BR',
    is_public BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------
-- Template Attachments
-- -----------------------------------------------
CREATE TABLE template_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES templates(id) ON DELETE CASCADE,
    
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(100),
    storage_path TEXT NOT NULL,
    
    attachment_type VARCHAR(20) DEFAULT 'email', -- 'email' ou 'landing'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------
-- Targets (Alvos/Colaboradores)
-- -----------------------------------------------
CREATE TABLE targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    email VARCHAR(255) NOT NULL,
    name VARCHAR(200) NOT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    
    status target_status DEFAULT 'active',
    source target_source DEFAULT 'manual',
    
    -- Campos customizados
    custom_fields JSONB DEFAULT '{}',
    
    -- Metadados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    imported_at TIMESTAMP,
    last_campaign_date TIMESTAMP,
    
    -- Risk score calculado
    risk_score DECIMAL(3,2) DEFAULT 0.00,
    
    UNIQUE(tenant_id, email),
    CONSTRAINT valid_risk_score CHECK (risk_score BETWEEN 0 AND 1)
);

-- -----------------------------------------------
-- Target Groups
-- -----------------------------------------------
CREATE TABLE target_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    type group_type DEFAULT 'local',
    source target_source DEFAULT 'manual',
    
    -- Integração
    integration_provider VARCHAR(50),
    external_id VARCHAR(255),
    
    -- Hierarquia
    parent_group_id UUID REFERENCES target_groups(id) ON DELETE SET NULL,
    
    -- Sincronização
    sync_enabled BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMP,
    sync_status VARCHAR(50),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(tenant_id, name)
);

-- -----------------------------------------------
-- Target Group Members
-- -----------------------------------------------
CREATE TABLE target_group_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID REFERENCES target_groups(id) ON DELETE CASCADE,
    target_id UUID REFERENCES targets(id) ON DELETE CASCADE,
    
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    added_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(group_id, target_id)
);

-- -----------------------------------------------
-- Campaigns
-- -----------------------------------------------
CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    template_id UUID REFERENCES templates(id) ON DELETE SET NULL,
    
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    status campaign_status DEFAULT 'draft',
    type campaign_type DEFAULT 'standard',
    
    -- Agendamento
    scheduled_at TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    -- Configurações de envio
    send_window_start TIME,
    send_window_end TIME,
    randomize_send BOOLEAN DEFAULT false,
    delay_minutes INTEGER DEFAULT 0,
    
    -- Tracking
    track_opens BOOLEAN DEFAULT true,
    track_clicks BOOLEAN DEFAULT true,
    track_attachments BOOLEAN DEFAULT true,
    
    -- Notificações
    notification_email VARCHAR(255),
    notify_on_click BOOLEAN DEFAULT false,
    notify_on_submit BOOLEAN DEFAULT false,
    
    -- Metadados
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------
-- Campaign Target Groups
-- -----------------------------------------------
CREATE TABLE campaign_target_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    target_group_id UUID REFERENCES target_groups(id) ON DELETE CASCADE,
    
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(campaign_id, target_group_id)
);

-- -----------------------------------------------
-- Campaign Events
-- -----------------------------------------------
CREATE TABLE campaign_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    target_id UUID REFERENCES targets(id) ON DELETE SET NULL,
    
    event_type event_type NOT NULL,
    
    -- Dados do evento
    target_email VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    
    -- Detalhes
    details JSONB DEFAULT '{}',
    
    -- Geolocalização
    country VARCHAR(100),
    city VARCHAR(100),
    
    -- Dispositivo
    device_type VARCHAR(50),
    os VARCHAR(100),
    browser VARCHAR(100),
    
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Index para queries rápidas
    INDEX idx_campaign_events_campaign (campaign_id, timestamp DESC),
    INDEX idx_campaign_events_target (target_id, timestamp DESC),
    INDEX idx_campaign_events_type (event_type, timestamp DESC)
);

-- -----------------------------------------------
-- Captured Data (Landing Pages)
-- -----------------------------------------------
CREATE TABLE captured_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    target_id UUID REFERENCES targets(id) ON DELETE SET NULL,
    
    target_email VARCHAR(255) NOT NULL,
    
    -- Dados capturados (encriptados)
    captured_fields JSONB NOT NULL,
    
    -- Contexto
    ip_address INET,
    user_agent TEXT,
    referer TEXT,
    
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Notificação
    notification_sent BOOLEAN DEFAULT false,
    
    INDEX idx_captured_data_campaign (campaign_id, timestamp DESC)
);

-- -----------------------------------------------
-- Trainings
-- -----------------------------------------------
CREATE TABLE trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    title VARCHAR(200) NOT NULL,
    description TEXT,
    
    type training_type NOT NULL,
    level training_level DEFAULT 'beginner',
    
    -- Conteúdo
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    duration INTEGER DEFAULT 0, -- segundos
    
    -- Idioma e tópicos
    language VARCHAR(10) DEFAULT 'pt-BR',
    topics TEXT[],
    
    -- Quiz
    has_quiz BOOLEAN DEFAULT false,
    quiz_questions JSONB,
    quiz_pass_score INTEGER DEFAULT 70,
    
    -- Certificado
    certificate_enabled BOOLEAN DEFAULT false,
    certificate_template_id UUID,
    
    -- Publicação
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------
-- Training Assignments
-- -----------------------------------------------
CREATE TABLE training_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id UUID REFERENCES trainings(id) ON DELETE CASCADE,
    target_id UUID REFERENCES targets(id) ON DELETE CASCADE,
    
    status training_assignment_status DEFAULT 'assigned',
    
    -- Datas
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    due_date TIMESTAMP,
    
    -- Progresso
    progress_percent INTEGER DEFAULT 0,
    time_spent_seconds INTEGER DEFAULT 0,
    
    -- Quiz
    quiz_attempts INTEGER DEFAULT 0,
    quiz_best_score INTEGER,
    quiz_passed BOOLEAN DEFAULT false,
    
    -- Certificado
    certificate_issued BOOLEAN DEFAULT false,
    certificate_url TEXT,
    
    assigned_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    UNIQUE(training_id, target_id),
    CONSTRAINT valid_progress CHECK (progress_percent BETWEEN 0 AND 100)
);

-- -----------------------------------------------
-- Automations
-- -----------------------------------------------
CREATE TABLE automations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    name VARCHAR(200) NOT NULL,
    description TEXT,
    
    -- Trigger
    trigger_type VARCHAR(50) NOT NULL, -- 'campaign_click', 'campaign_submit', 'training_fail', 'schedule'
    trigger_config JSONB NOT NULL,
    trigger_delay_seconds INTEGER DEFAULT 0,
    
    -- Condição
    condition_type VARCHAR(50) DEFAULT 'always', -- 'always', 'first_time_only', 'risk_threshold'
    condition_config JSONB,
    
    -- Ação
    action_type VARCHAR(50) NOT NULL, -- 'assign_training', 'create_campaign', 'send_notification'
    action_config JSONB NOT NULL,
    
    status automation_status DEFAULT 'paused',
    
    -- Estatísticas
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMP,
    last_error TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------
-- Automation Executions (Log)
-- -----------------------------------------------
CREATE TABLE automation_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
    
    trigger_event_id UUID,
    target_id UUID REFERENCES targets(id) ON DELETE SET NULL,
    
    status VARCHAR(20), -- 'success', 'failed', 'skipped'
    error_message TEXT,
    
    execution_data JSONB,
    
    executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_automation_executions (automation_id, executed_at DESC)
);

-- -----------------------------------------------
-- Integrations
-- -----------------------------------------------
CREATE TABLE integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    provider VARCHAR(50) NOT NULL, -- 'microsoft', 'google', 'slack', 'okta'
    type VARCHAR(50) NOT NULL, -- 'active_directory', 'workspace', 'sso'
    name VARCHAR(200) NOT NULL,
    
    status VARCHAR(20) DEFAULT 'inactive', -- 'active', 'inactive', 'error'
    
    -- Configuração (credenciais encriptadas)
    config JSONB NOT NULL,
    
    -- Sincronização
    sync_enabled BOOLEAN DEFAULT false,
    sync_frequency VARCHAR(20), -- 'hourly', 'daily', 'weekly'
    last_sync_at TIMESTAMP,
    last_sync_status VARCHAR(50),
    last_sync_error TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------
-- Audit Logs
-- -----------------------------------------------
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    action audit_action NOT NULL,
    
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100),
    
    details JSONB DEFAULT '{}',
    
    -- Contexto
    ip_address INET,
    user_agent TEXT,
    
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Particionamento por data (performance)
    INDEX idx_audit_logs_user (user_id, timestamp DESC),
    INDEX idx_audit_logs_resource (resource_type, resource_id, timestamp DESC),
    INDEX idx_audit_logs_tenant (tenant_id, timestamp DESC)
) PARTITION BY RANGE (timestamp);

-- Criar partições para audit_logs (exemplo: mensal)
CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

CREATE TABLE audit_logs_2026_04 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- -----------------------------------------------
-- Notifications
-- -----------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    
    data JSONB DEFAULT '{}',
    
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    INDEX idx_notifications_user (user_id, is_read, created_at DESC)
);

-- -----------------------------------------------
-- Webhooks
-- -----------------------------------------------
CREATE TABLE webhooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    url TEXT NOT NULL,
    secret VARCHAR(255) NOT NULL,
    
    events TEXT[] NOT NULL,
    
    enabled BOOLEAN DEFAULT true,
    
    -- Estatísticas
    last_triggered_at TIMESTAMP,
    total_triggers INTEGER DEFAULT 0,
    failed_triggers INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL
);

-- -----------------------------------------------
-- Webhook Logs
-- -----------------------------------------------
CREATE TABLE webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    webhook_id UUID REFERENCES webhooks(id) ON DELETE CASCADE,
    
    event_type VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    
    response_status INTEGER,
    response_body TEXT,
    
    success BOOLEAN DEFAULT false,
    error_message TEXT,
    
    triggered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_webhook_logs (webhook_id, triggered_at DESC)
);

-- =====================================================
-- 5. ÍNDICES ADICIONAIS
-- =====================================================

-- Tenants
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_parent ON tenants(parent_tenant_id);

-- Users
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Permissions
CREATE INDEX idx_permissions_module ON permissions(module);
CREATE INDEX idx_permissions_code ON permissions(code);

-- User Permissions
CREATE INDEX idx_user_permissions_user ON user_permissions(user_id);
CREATE INDEX idx_user_permissions_tenant ON user_permissions(tenant_id);

-- Templates
CREATE INDEX idx_templates_tenant ON templates(tenant_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_public ON templates(is_public);

-- Targets
CREATE INDEX idx_targets_tenant ON targets(tenant_id);
CREATE INDEX idx_targets_email ON targets(email);
CREATE INDEX idx_targets_status ON targets(status);
CREATE INDEX idx_targets_risk_score ON targets(risk_score DESC);

-- Target Groups
CREATE INDEX idx_target_groups_tenant ON target_groups(tenant_id);
CREATE INDEX idx_target_groups_type ON target_groups(type);

-- Campaigns
CREATE INDEX idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_scheduled ON campaigns(scheduled_at);

-- Trainings
CREATE INDEX idx_trainings_tenant ON trainings(tenant_id);
CREATE INDEX idx_trainings_type ON trainings(type);
CREATE INDEX idx_trainings_published ON trainings(is_published);

-- Training Assignments
CREATE INDEX idx_training_assignments_training ON training_assignments(training_id);
CREATE INDEX idx_training_assignments_target ON training_assignments(target_id);
CREATE INDEX idx_training_assignments_status ON training_assignments(status);

-- Automations
CREATE INDEX idx_automations_tenant ON automations(tenant_id);
CREATE INDEX idx_automations_status ON automations(status);

-- Integrations
CREATE INDEX idx_integrations_tenant ON integrations(tenant_id);
CREATE INDEX idx_integrations_provider ON integrations(provider);

-- =====================================================
-- 6. ÍNDICES DE BUSCA FULL-TEXT
-- =====================================================

-- Busca em Templates
CREATE INDEX idx_templates_search ON templates 
    USING gin(to_tsvector('portuguese', name || ' ' || subject || ' ' || COALESCE(body_html, '')));

-- Busca em Targets
CREATE INDEX idx_targets_search ON targets 
    USING gin(to_tsvector('portuguese', name || ' ' || email || ' ' || COALESCE(department, '')));

-- Busca em Campanhas
CREATE INDEX idx_campaigns_search ON campaigns 
    USING gin(to_tsvector('portuguese', name || ' ' || COALESCE(description, '')));

-- =====================================================
-- 7. TRIGGERS
-- =====================================================

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_target_groups_updated_at BEFORE UPDATE ON target_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_automations_updated_at BEFORE UPDATE ON automations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_integrations_updated_at BEFORE UPDATE ON integrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 8. FUNÇÕES DE UTILIDADE
-- =====================================================

-- Função para calcular Risk Score
CREATE OR REPLACE FUNCTION calculate_target_risk_score(target_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
    total_campaigns INTEGER;
    clicks INTEGER;
    submissions INTEGER;
    reports INTEGER;
    score DECIMAL;
BEGIN
    SELECT
        COUNT(DISTINCT ce.campaign_id),
        COUNT(CASE WHEN ce.event_type = 'clicked' THEN 1 END),
        COUNT(CASE WHEN ce.event_type = 'submitted' THEN 1 END),
        COUNT(CASE WHEN ce.event_type = 'reported' THEN 1 END)
    INTO
        total_campaigns, clicks, submissions, reports
    FROM campaign_events ce
    WHERE ce.target_id = target_id_param;
    
    IF total_campaigns = 0 THEN
        RETURN 0.00;
    END IF;
    
    -- Cálculo: (clicks * 0.3 + submissions * 0.6 - reports * 0.5) / total_campaigns
    score := (clicks * 0.3 + submissions * 0.6 - reports * 0.5) / total_campaigns;
    
    -- Garantir que está entre 0 e 1
    score := GREATEST(0, LEAST(1, score));
    
    RETURN score;
END;
$$ LANGUAGE plpgsql;

-- Função para obter estatísticas de campanha
CREATE OR REPLACE FUNCTION get_campaign_stats(campaign_id_param UUID)
RETURNS TABLE(
    sent BIGINT,
    opened BIGINT,
    clicked BIGINT,
    submitted BIGINT,
    reported BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        COUNT(CASE WHEN event_type = 'sent' THEN 1 END) AS sent,
        COUNT(CASE WHEN event_type = 'opened' THEN 1 END) AS opened,
        COUNT(CASE WHEN event_type = 'clicked' THEN 1 END) AS clicked,
        COUNT(CASE WHEN event_type = 'submitted' THEN 1 END) AS submitted,
        COUNT(CASE WHEN event_type = 'reported' THEN 1 END) AS reported
    FROM campaign_events
    WHERE campaign_id = campaign_id_param;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS nas tabelas principais
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE target_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaign_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE trainings ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_assignments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (exemplo para tenants)
CREATE POLICY tenant_isolation ON tenants
    FOR ALL
    USING (
        -- Superadmin pode ver tudo
        current_setting('app.user_role', true) = 'superadmin'
        OR
        -- Users podem ver apenas seu tenant e sub-tenants
        id = current_setting('app.user_tenant_id', true)::UUID
        OR
        parent_tenant_id = current_setting('app.user_tenant_id', true)::UUID
    );

-- =====================================================
-- 10. DADOS INICIAIS (SEED)
-- =====================================================

-- Inserir permissões do sistema
INSERT INTO permissions (code, name, description, module, resource, action) VALUES
    -- Campaigns
    ('campaigns.view', 'View Campaigns', 'View campaign list and details', 'campaigns', 'campaign', 'view'),
    ('campaigns.create', 'Create Campaigns', 'Create new campaigns', 'campaigns', 'campaign', 'create'),
    ('campaigns.edit', 'Edit Campaigns', 'Edit existing campaigns', 'campaigns', 'campaign', 'edit'),
    ('campaigns.delete', 'Delete Campaigns', 'Delete campaigns', 'campaigns', 'campaign', 'delete'),
    ('campaigns.execute', 'Execute Campaigns', 'Start/pause/cancel campaigns', 'campaigns', 'campaign', 'execute'),
    
    -- Templates
    ('templates.view', 'View Templates', 'View template list and details', 'templates', 'template', 'view'),
    ('templates.create', 'Create Templates', 'Create new templates', 'templates', 'template', 'create'),
    ('templates.edit', 'Edit Templates', 'Edit existing templates', 'templates', 'template', 'edit'),
    ('templates.delete', 'Delete Templates', 'Delete templates', 'templates', 'template', 'delete'),
    
    -- Targets
    ('targets.view', 'View Targets', 'View target list and details', 'targets', 'target', 'view'),
    ('targets.create', 'Create Targets', 'Create new targets', 'targets', 'target', 'create'),
    ('targets.edit', 'Edit Targets', 'Edit existing targets', 'targets', 'target', 'edit'),
    ('targets.delete', 'Delete Targets', 'Delete targets', 'targets', 'target', 'delete'),
    ('targets.import', 'Import Targets', 'Import targets from CSV/AD/Google', 'targets', 'target', 'import'),
    
    -- Trainings
    ('trainings.view', 'View Trainings', 'View training list and details', 'trainings', 'training', 'view'),
    ('trainings.create', 'Create Trainings', 'Create new trainings', 'trainings', 'training', 'create'),
    ('trainings.edit', 'Edit Trainings', 'Edit existing trainings', 'trainings', 'training', 'edit'),
    ('trainings.delete', 'Delete Trainings', 'Delete trainings', 'trainings', 'training', 'delete'),
    ('trainings.assign', 'Assign Trainings', 'Assign trainings to targets', 'trainings', 'training', 'assign'),
    
    -- Reports
    ('reports.view', 'View Reports', 'View all reports', 'reports', 'report', 'view'),
    ('reports.export', 'Export Reports', 'Export reports to PDF/CSV/Excel', 'reports', 'report', 'export'),
    
    -- Users
    ('users.view', 'View Users', 'View user list and details', 'users', 'user', 'view'),
    ('users.create', 'Create Users', 'Create new users', 'users', 'user', 'create'),
    ('users.edit', 'Edit Users', 'Edit existing users', 'users', 'user', 'edit'),
    ('users.delete', 'Delete Users', 'Delete users', 'users', 'user', 'delete'),
    ('users.impersonate', 'Impersonate Users', 'Impersonate other users', 'users', 'user', 'impersonate'),
    
    -- Tenants
    ('tenants.view', 'View Tenants', 'View tenant list and details', 'tenants', 'tenant', 'view'),
    ('tenants.create', 'Create Tenants', 'Create new tenants', 'tenants', 'tenant', 'create'),
    ('tenants.edit', 'Edit Tenants', 'Edit existing tenants', 'tenants', 'tenant', 'edit'),
    ('tenants.delete', 'Delete Tenants', 'Delete tenants', 'tenants', 'tenant', 'delete'),
    
    -- Integrations
    ('integrations.view', 'View Integrations', 'View integration list and details', 'integrations', 'integration', 'view'),
    ('integrations.create', 'Create Integrations', 'Create new integrations', 'integrations', 'integration', 'create'),
    ('integrations.edit', 'Edit Integrations', 'Edit existing integrations', 'integrations', 'integration', 'edit'),
    ('integrations.delete', 'Delete Integrations', 'Delete integrations', 'integrations', 'integration', 'delete'),
    ('integrations.sync', 'Sync Integrations', 'Trigger integration sync', 'integrations', 'integration', 'sync'),
    
    -- Automations
    ('automations.view', 'View Automations', 'View automation list and details', 'automations', 'automation', 'view'),
    ('automations.create', 'Create Automations', 'Create new automations', 'automations', 'automation', 'create'),
    ('automations.edit', 'Edit Automations', 'Edit existing automations', 'automations', 'automation', 'edit'),
    ('automations.delete', 'Delete Automations', 'Delete automations', 'automations', 'automation', 'delete'),
    
    -- Audit
    ('audit.view', 'View Audit Logs', 'View audit logs', 'audit', 'log', 'view');

-- =====================================================
-- 11. VIEWS ÚTEIS
-- =====================================================

-- View: Campaign Statistics
CREATE OR REPLACE VIEW campaign_statistics AS
SELECT
    c.id AS campaign_id,
    c.name,
    c.tenant_id,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'sent' THEN ce.target_email END) AS sent_count,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'opened' THEN ce.target_email END) AS opened_count,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'clicked' THEN ce.target_email END) AS clicked_count,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'submitted' THEN ce.target_email END) AS submitted_count,
    COUNT(DISTINCT CASE WHEN ce.event_type = 'reported' THEN ce.target_email END) AS reported_count,
    ROUND(
        COUNT(DISTINCT CASE WHEN ce.event_type = 'opened' THEN ce.target_email END)::DECIMAL / 
        NULLIF(COUNT(DISTINCT CASE WHEN ce.event_type = 'sent' THEN ce.target_email END), 0),
        3
    ) AS open_rate,
    ROUND(
        COUNT(DISTINCT CASE WHEN ce.event_type = 'clicked' THEN ce.target_email END)::DECIMAL / 
        NULLIF(COUNT(DISTINCT CASE WHEN ce.event_type = 'sent' THEN ce.target_email END), 0),
        3
    ) AS click_rate,
    ROUND(
        COUNT(DISTINCT CASE WHEN ce.event_type = 'submitted' THEN ce.target_email END)::DECIMAL / 
        NULLIF(COUNT(DISTINCT CASE WHEN ce.event_type = 'sent' THEN ce.target_email END), 0),
        3
    ) AS submit_rate
FROM campaigns c
LEFT JOIN campaign_events ce ON c.id = ce.campaign_id
GROUP BY c.id, c.name, c.tenant_id;

-- View: Target Risk Scores
CREATE OR REPLACE VIEW target_risk_analysis AS
SELECT
    t.id AS target_id,
    t.tenant_id,
    t.email,
    t.name,
    t.department,
    COUNT(DISTINCT ce.campaign_id) AS total_campaigns,
    COUNT(CASE WHEN ce.event_type = 'clicked' THEN 1 END) AS click_count,
    COUNT(CASE WHEN ce.event_type = 'submitted' THEN 1 END) AS submit_count,
    COUNT(CASE WHEN ce.event_type = 'reported' THEN 1 END) AS report_count,
    calculate_target_risk_score(t.id) AS calculated_risk_score,
    CASE
        WHEN calculate_target_risk_score(t.id) >= 0.7 THEN 'high'
        WHEN calculate_target_risk_score(t.id) >= 0.4 THEN 'medium'
        ELSE 'low'
    END AS risk_level
FROM targets t
LEFT JOIN campaign_events ce ON t.id = ce.target_id
GROUP BY t.id, t.tenant_id, t.email, t.name, t.department;

-- =====================================================
-- FIM DO SCHEMA
-- =====================================================
```

---

## 🔄 Scripts de Migração

### Migração Inicial (Django)

```bash
# Criar migrações
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Popular permissões
python manage.py populate_permissions

# Criar superusuário
python manage.py createsuperuser
```

### Script de Migração Manual

```bash
#!/bin/bash
# migrate.sh

set -e

echo "==================================="
echo "Matreiro Platform - Database Migration"
echo "==================================="

# Configurações
DB_HOST=${POSTGRES_HOST:-localhost}
DB_PORT=${POSTGRES_PORT:-5432}
DB_NAME=${POSTGRES_DB:-matreiro_db}
DB_USER=${POSTGRES_USER:-matreiro_user}

echo "Database: $DB_NAME"
echo "Host: $DB_HOST:$DB_PORT"
echo "User: $DB_USER"
echo ""

# Backup antes da migração
echo "[1/4] Creating backup..."
pg_dump -h $DB_HOST -p $DB_PORT -U $DB_USER -Fc $DB_NAME > backup_$(date +%Y%m%d_%H%M%S).dump
echo "✓ Backup created"

# Aplicar schema
echo "[2/4] Applying schema..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f schema.sql
echo "✓ Schema applied"

# Popular dados iniciais
echo "[3/4] Seeding initial data..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f seed.sql
echo "✓ Initial data seeded"

# Verificar integridade
echo "[4/4] Verifying database integrity..."
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "
    SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
    FROM pg_tables
    WHERE schemaname = 'matreiro'
    ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
"
echo "✓ Verification complete"

echo ""
echo "==================================="
echo "Migration completed successfully!"
echo "==================================="
```

---

## 💾 Procedimentos de Backup

### Backup Diário Automatizado

```bash
#!/bin/bash
# backup_daily.sh

# Configurações
BACKUP_DIR="/backups/matreiro"
RETENTION_DAYS=30
DB_NAME="matreiro_db"
DB_USER="matreiro_user"
DATE=$(date +%Y%m%d_%H%M%S)

# Criar diretório se não existir
mkdir -p $BACKUP_DIR

# Backup completo
echo "Starting full backup..."
pg_dump -h localhost -U $DB_USER -Fc $DB_NAME > $BACKUP_DIR/full_backup_$DATE.dump

# Backup apenas dados
pg_dump -h localhost -U $DB_USER -Fc --data-only $DB_NAME > $BACKUP_DIR/data_backup_$DATE.dump

# Backup apenas schema
pg_dump -h localhost -U $DB_USER -Fc --schema-only $DB_NAME > $BACKUP_DIR/schema_backup_$DATE.dump

# Comprimir
gzip $BACKUP_DIR/full_backup_$DATE.dump
gzip $BACKUP_DIR/data_backup_$DATE.dump
gzip $BACKUP_DIR/schema_backup_$DATE.dump

# Remover backups antigos
find $BACKUP_DIR -name "*.dump.gz" -mtime +$RETENTION_DAYS -delete

echo "Backup completed: $BACKUP_DIR"
```

### Restore de Backup

```bash
# Restore completo
pg_restore -h localhost -U matreiro_user -d matreiro_db -c backup.dump

# Restore apenas dados
pg_restore -h localhost -U matreiro_user -d matreiro_db --data-only backup.dump

# Restore apenas schema
pg_restore -h localhost -U matreiro_user -d matreiro_db --schema-only backup.dump
```

---

## ⏪ Rollback

### Procedimento de Rollback

```sql
-- 1. Criar backup do estado atual
\! pg_dump -Fc matreiro_db > before_rollback.dump

-- 2. Restaurar backup anterior
\! pg_restore -d matreiro_db -c backup_20260309.dump

-- 3. Verificar versão
SELECT * FROM django_migrations ORDER BY applied DESC LIMIT 10;

-- 4. Rollback de migração específica (Django)
```

```bash
# Reverter última migração
python manage.py migrate campaigns zero

# Reverter para migração específica
python manage.py migrate campaigns 0003
```

---

## ⚡ Otimizações e Índices

### Análise de Performance

```sql
-- Tabelas maiores
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS indexes_size
FROM pg_tables
WHERE schemaname = 'matreiro'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Índices não utilizados
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
    AND schemaname = 'matreiro'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Queries lentas
SELECT
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE query LIKE '%matreiro%'
ORDER BY mean_time DESC
LIMIT 20;
```

### Vacuum e Analyze

```sql
-- Vacuum completo
VACUUM FULL ANALYZE;

-- Vacuum por tabela
VACUUM ANALYZE matreiro.campaign_events;
VACUUM ANALYZE matreiro.audit_logs;

-- Reindex
REINDEX DATABASE matreiro_db;
```

### Otimizações Recomendadas

```sql
-- Aumentar work_mem para queries complexas
SET work_mem = '256MB';

-- Aumentar shared_buffers
-- No postgresql.conf:
-- shared_buffers = 512MB

-- Habilitar parallel queries
SET max_parallel_workers_per_gather = 4;

-- Autovacuum settings
-- autovacuum = on
-- autovacuum_max_workers = 3
-- autovacuum_naptime = 30s
```

---

## 🐛 Troubleshooting

### Problema: Migração Falha

```bash
# Verificar status
python manage.py showmigrations

# Forçar fake migration
python manage.py migrate --fake campaigns 0001

# Verificar conflitos
python manage.py makemigrations --check

# Resetar migrations (CUIDADO!)
python manage.py migrate campaigns zero
```

### Problema: Conexão Recusada

```bash
# Verificar PostgreSQL rodando
sudo systemctl status postgresql

# Testar conexão
psql -h localhost -U matreiro_user -d matreiro_db -c "SELECT version();"

# Verificar pg_hba.conf
# Adicionar: host matreiro_db matreiro_user 0.0.0.0/0 md5
```

### Problema: Performance Lenta

```sql
-- Atualizar estatísticas
ANALYZE;

-- Verificar queries bloqueadas
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Matar query bloqueada
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = 12345;

-- Verificar locks
SELECT * FROM pg_locks WHERE granted = false;
```

---

## 📞 Suporte

- **Documentação:** https://docs.matreiro.underprotection.com.br
- **Email:** suporte@underprotection.com.br

---

**Última Atualização:** 09/03/2026  
**Versão:** 1.0.0
