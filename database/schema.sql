-- #############################################
-- PLATAFORMA MATREIRO - DATABASE SCHEMA
-- #############################################
-- PostgreSQL 15+ Database Schema
-- Under Protection © 2024-2026
-- #############################################

-- Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- #############################################
-- SCHEMA PRINCIPAL
-- #############################################

-- ==============================================
-- TABELA: tenants (Organizações/Clientes)
-- ==============================================
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    domain VARCHAR(255),
    
    -- Configurações
    is_active BOOLEAN DEFAULT TRUE,
    subscription_tier VARCHAR(50) DEFAULT 'basic', -- basic, pro, enterprise
    max_users INTEGER DEFAULT 100,
    max_campaigns INTEGER DEFAULT 10,
    
    -- Branding
    logo_url TEXT,
    primary_color VARCHAR(7) DEFAULT '#242545',
    secondary_color VARCHAR(7) DEFAULT '#834a8b',
    
    -- Contato
    contact_email VARCHAR(255),
    contact_phone VARCHAR(50),
    
    -- Endereço
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(50),
    address_country VARCHAR(50) DEFAULT 'BR',
    address_zipcode VARCHAR(20),
    
    -- Multi-tenancy hierarchy
    parent_tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Metadata
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para tenants
CREATE INDEX idx_tenants_slug ON tenants(slug);
CREATE INDEX idx_tenants_parent ON tenants(parent_tenant_id);
CREATE INDEX idx_tenants_active ON tenants(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_tenants_domain ON tenants(domain) WHERE domain IS NOT NULL;

-- ==============================================
-- TABELA: users (Usuários do Sistema)
-- ==============================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Keycloak integration
    keycloak_id UUID UNIQUE,
    
    -- Informações pessoais
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(150) UNIQUE NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    full_name VARCHAR(300) GENERATED ALWAYS AS (first_name || ' ' || last_name) STORED,
    
    -- Avatar
    avatar_url TEXT,
    
    -- Roles & Permissions
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- super_admin, tenant_admin, manager, analyst, user
    permissions JSONB DEFAULT '[]',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    email_verified_at TIMESTAMP WITH TIME ZONE,
    
    -- Preferências
    language VARCHAR(5) DEFAULT 'pt-BR', -- pt-BR, en, es
    timezone VARCHAR(50) DEFAULT 'America/Sao_Paulo',
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para users
CREATE INDEX idx_users_tenant ON users(tenant_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_keycloak ON users(keycloak_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active) WHERE is_active = TRUE;

-- ==============================================
-- TABELA: azure_integrations (Integrações Azure AD)
-- ==============================================
CREATE TABLE IF NOT EXISTS azure_integrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    
    -- Azure AD Configuration
    azure_tenant_id VARCHAR(255) NOT NULL,
    azure_client_id VARCHAR(255) NOT NULL,
    azure_client_secret_encrypted TEXT NOT NULL, -- Encrypted!
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    auto_sync BOOLEAN DEFAULT FALSE,
    sync_frequency VARCHAR(20) DEFAULT 'daily', -- hourly, daily, weekly
    last_sync_at TIMESTAMP WITH TIME ZONE,
    
    -- Sync filters
    allowed_domains TEXT[], -- domains permitidos
    sync_groups TEXT[], -- grupos para sincronizar
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para azure_integrations
CREATE INDEX idx_azure_tenant ON azure_integrations(tenant_id);
CREATE INDEX idx_azure_active ON azure_integrations(is_active) WHERE is_active = TRUE;

-- ==============================================
-- TABELA: campaigns (Campanhas de Phishing)
-- ==============================================
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Informações básicas
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, running, paused, completed, cancelled
    
    -- Agendamento
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    
    -- Template
    template_id UUID, -- Referência será criada depois
    landing_page_id UUID, -- Referência será criada depois
    
    -- Configurações de envio
    sender_name VARCHAR(255),
    sender_email VARCHAR(255),
    reply_to VARCHAR(255),
    
    -- Tracking
    track_opens BOOLEAN DEFAULT TRUE,
    track_clicks BOOLEAN DEFAULT TRUE,
    track_submissions BOOLEAN DEFAULT TRUE,
    
    -- URL de tracking
    tracking_domain VARCHAR(255),
    
    -- Métricas (calculadas)
    total_targets INTEGER DEFAULT 0,
    emails_sent INTEGER DEFAULT 0,
    emails_opened INTEGER DEFAULT 0,
    links_clicked INTEGER DEFAULT 0,
    data_submitted INTEGER DEFAULT 0,
    
    -- Rates (calculadas)
    open_rate DECIMAL(5, 2) DEFAULT 0.00,
    click_rate DECIMAL(5, 2) DEFAULT 0.00,
    submission_rate DECIMAL(5, 2) DEFAULT 0.00,
    
    -- Metadata
    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para campaigns
CREATE INDEX idx_campaigns_tenant ON campaigns(tenant_id);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);

-- ==============================================
-- TABELA: templates (Templates de E-mail)
-- ==============================================
CREATE TABLE IF NOT EXISTS templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Informações
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100), -- phishing, spear_phishing, business_email_compromise, etc
    
    -- Conteúdo
    subject VARCHAR(500) NOT NULL,
    html_content TEXT NOT NULL,
    text_content TEXT,
    
    -- Variáveis disponíveis
    variables JSONB DEFAULT '[]', -- [{"name": "{{first_name}}", "description": "..."}]
    
    -- Preview
    preview_text VARCHAR(255),
    thumbnail_url TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE, -- Se pode ser usado por outros tenants
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para templates
CREATE INDEX idx_templates_tenant ON templates(tenant_id);
CREATE INDEX idx_templates_category ON templates(category);
CREATE INDEX idx_templates_active ON templates(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_templates_public ON templates(is_public) WHERE is_public = TRUE;

-- ==============================================
-- TABELA: landing_pages (Landing Pages)
-- ==============================================
CREATE TABLE IF NOT EXISTS landing_pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Informações
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    -- URL
    slug VARCHAR(150) UNIQUE NOT NULL,
    custom_domain VARCHAR(255),
    
    -- Conteúdo
    html_content TEXT NOT NULL,
    css_content TEXT,
    js_content TEXT,
    
    -- Tipo
    page_type VARCHAR(50) DEFAULT 'credential_harvest', -- credential_harvest, malware_download, survey, etc
    
    -- Captura de dados
    capture_credentials BOOLEAN DEFAULT TRUE,
    capture_files BOOLEAN DEFAULT FALSE,
    
    -- Redirecionamento
    redirect_url TEXT,
    redirect_delay INTEGER DEFAULT 0, -- segundos
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_public BOOLEAN DEFAULT FALSE,
    
    -- Analytics
    total_visits INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para landing_pages
CREATE INDEX idx_landing_pages_tenant ON landing_pages(tenant_id);
CREATE INDEX idx_landing_pages_slug ON landing_pages(slug);
CREATE INDEX idx_landing_pages_active ON landing_pages(is_active) WHERE is_active = TRUE;

-- ==============================================
-- TABELA: targets (Alvos das Campanhas)
-- ==============================================
CREATE TABLE IF NOT EXISTS targets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    
    -- Informações do alvo
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(150),
    last_name VARCHAR(150),
    department VARCHAR(100),
    position VARCHAR(150),
    
    -- Origem
    source VARCHAR(50) DEFAULT 'manual', -- manual, azure_ad, csv_import, api
    source_id VARCHAR(255), -- ID na origem (ex: Azure AD object ID)
    
    -- Metadata adicional
    custom_fields JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para targets
CREATE INDEX idx_targets_tenant ON targets(tenant_id);
CREATE INDEX idx_targets_campaign ON targets(campaign_id);
CREATE INDEX idx_targets_email ON targets(email);
CREATE INDEX idx_targets_source ON targets(source);

-- Constraint de unicidade: email + campaign
CREATE UNIQUE INDEX idx_targets_email_campaign ON targets(email, campaign_id) WHERE deleted_at IS NULL;

-- ==============================================
-- TABELA: results (Resultados das Campanhas)
-- ==============================================
CREATE TABLE IF NOT EXISTS results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
    target_id UUID NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
    
    -- Status do e-mail
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMP WITH TIME ZONE,
    email_error TEXT,
    
    -- Tracking de abertura
    email_opened BOOLEAN DEFAULT FALSE,
    email_opened_at TIMESTAMP WITH TIME ZONE,
    open_count INTEGER DEFAULT 0,
    
    -- Tracking de clique
    link_clicked BOOLEAN DEFAULT FALSE,
    link_clicked_at TIMESTAMP WITH TIME ZONE,
    click_count INTEGER DEFAULT 0,
    
    -- Submissão de dados
    data_submitted BOOLEAN DEFAULT FALSE,
    data_submitted_at TIMESTAMP WITH TIME ZONE,
    submitted_data JSONB,
    
    -- Informações do cliente
    ip_address INET,
    user_agent TEXT,
    browser VARCHAR(100),
    os VARCHAR(100),
    device VARCHAR(50),
    location JSONB, -- {city, region, country, lat, lon}
    
    -- Timestamps de interação
    first_interaction_at TIMESTAMP WITH TIME ZONE,
    last_interaction_at TIMESTAMP WITH TIME ZONE,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para results
CREATE INDEX idx_results_campaign ON results(campaign_id);
CREATE INDEX idx_results_target ON results(target_id);
CREATE INDEX idx_results_email_sent ON results(email_sent) WHERE email_sent = TRUE;
CREATE INDEX idx_results_email_opened ON results(email_opened) WHERE email_opened = TRUE;
CREATE INDEX idx_results_link_clicked ON results(link_clicked) WHERE link_clicked = TRUE;
CREATE INDEX idx_results_data_submitted ON results(data_submitted) WHERE data_submitted = TRUE;

-- ==============================================
-- TABELA: trainings (Módulos de Treinamento)
-- ==============================================
CREATE TABLE IF NOT EXISTS trainings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Informações
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    
    -- Conteúdo
    content_type VARCHAR(50) DEFAULT 'video', -- video, article, quiz, interactive
    content_url TEXT,
    duration_minutes INTEGER, -- duração estimada
    
    -- Quiz/Avaliação
    has_quiz BOOLEAN DEFAULT FALSE,
    quiz_questions JSONB, -- Array de questões
    passing_score INTEGER DEFAULT 70, -- %
    
    -- Validação por IA
    ai_validation BOOLEAN DEFAULT FALSE,
    ai_model VARCHAR(100), -- gpt-4, gpt-3.5-turbo, etc
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_mandatory BOOLEAN DEFAULT FALSE,
    
    -- Analytics
    total_completions INTEGER DEFAULT 0,
    average_score DECIMAL(5, 2),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE
);

-- Índices para trainings
CREATE INDEX idx_trainings_tenant ON trainings(tenant_id);
CREATE INDEX idx_trainings_category ON trainings(category);
CREATE INDEX idx_trainings_active ON trainings(is_active) WHERE is_active = TRUE;

-- ==============================================
-- TABELA: training_completions (Conclusões de Treinamento)
-- ==============================================
CREATE TABLE IF NOT EXISTS training_completions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    training_id UUID NOT NULL REFERENCES trainings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Status
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, completed, failed
    
    -- Progresso
    progress DECIMAL(5, 2) DEFAULT 0.00, -- 0.00 a 100.00
    
    -- Quiz
    quiz_score DECIMAL(5, 2),
    quiz_answers JSONB,
    quiz_attempts INTEGER DEFAULT 0,
    
    -- Validação IA
    ai_validation_result JSONB,
    ai_validation_score DECIMAL(5, 2),
    
    -- Certificado
    certificate_url TEXT,
    certificate_issued_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para training_completions
CREATE INDEX idx_training_completions_training ON training_completions(training_id);
CREATE INDEX idx_training_completions_user ON training_completions(user_id);
CREATE INDEX idx_training_completions_status ON training_completions(status);

-- Constraint de unicidade: user + training
CREATE UNIQUE INDEX idx_training_completions_user_training ON training_completions(user_id, training_id);

-- ==============================================
-- TABELA: kv_store_99a65fc7 (Supabase KV Store)
-- ==============================================
CREATE TABLE IF NOT EXISTS kv_store_99a65fc7 (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para kv_store
CREATE INDEX idx_kv_store_tenant ON kv_store_99a65fc7(tenant_id);
CREATE INDEX idx_kv_store_expires ON kv_store_99a65fc7(expires_at) WHERE expires_at IS NOT NULL;

-- ==============================================
-- TABELA: audit_logs (Logs de Auditoria)
-- ==============================================
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Ação
    action VARCHAR(100) NOT NULL, -- create, update, delete, login, logout, etc
    resource_type VARCHAR(100), -- campaign, template, user, etc
    resource_id UUID,
    
    -- Detalhes
    description TEXT,
    changes JSONB, -- before/after
    
    -- Request info
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para audit_logs
CREATE INDEX idx_audit_logs_tenant ON audit_logs(tenant_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource ON audit_logs(resource_type, resource_id);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at DESC);

-- #############################################
-- FOREIGN KEYS ADICIONAIS
-- #############################################

-- Adicionar FKs que dependem de tabelas criadas posteriormente
ALTER TABLE campaigns 
    ADD CONSTRAINT fk_campaigns_template 
    FOREIGN KEY (template_id) REFERENCES templates(id) ON DELETE SET NULL;

ALTER TABLE campaigns 
    ADD CONSTRAINT fk_campaigns_landing_page 
    FOREIGN KEY (landing_page_id) REFERENCES landing_pages(id) ON DELETE SET NULL;

-- #############################################
-- TRIGGERS
-- #############################################

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas relevantes
CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_landing_pages_updated_at BEFORE UPDATE ON landing_pages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_results_updated_at BEFORE UPDATE ON results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trainings_updated_at BEFORE UPDATE ON trainings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_training_completions_updated_at BEFORE UPDATE ON training_completions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kv_store_updated_at BEFORE UPDATE ON kv_store_99a65fc7
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- #############################################
-- VIEWS ÚTEIS
-- #############################################

-- View: Campaign Statistics
CREATE OR REPLACE VIEW campaign_stats AS
SELECT 
    c.id,
    c.name,
    c.status,
    c.tenant_id,
    COUNT(DISTINCT t.id) AS total_targets,
    COUNT(DISTINCT CASE WHEN r.email_sent THEN r.id END) AS emails_sent,
    COUNT(DISTINCT CASE WHEN r.email_opened THEN r.id END) AS emails_opened,
    COUNT(DISTINCT CASE WHEN r.link_clicked THEN r.id END) AS links_clicked,
    COUNT(DISTINCT CASE WHEN r.data_submitted THEN r.id END) AS data_submitted,
    ROUND(
        (COUNT(DISTINCT CASE WHEN r.email_opened THEN r.id END)::DECIMAL / 
         NULLIF(COUNT(DISTINCT CASE WHEN r.email_sent THEN r.id END), 0)) * 100, 
        2
    ) AS open_rate,
    ROUND(
        (COUNT(DISTINCT CASE WHEN r.link_clicked THEN r.id END)::DECIMAL / 
         NULLIF(COUNT(DISTINCT CASE WHEN r.email_sent THEN r.id END), 0)) * 100, 
        2
    ) AS click_rate,
    ROUND(
        (COUNT(DISTINCT CASE WHEN r.data_submitted THEN r.id END)::DECIMAL / 
         NULLIF(COUNT(DISTINCT CASE WHEN r.email_sent THEN r.id END), 0)) * 100, 
        2
    ) AS submission_rate
FROM campaigns c
LEFT JOIN targets t ON t.campaign_id = c.id
LEFT JOIN results r ON r.campaign_id = c.id
GROUP BY c.id, c.name, c.status, c.tenant_id;

-- #############################################
-- FUNÇÕES ÚTEIS
-- #############################################

-- Função para limpar dados expirados do KV store
CREATE OR REPLACE FUNCTION cleanup_expired_kv()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM kv_store_99a65fc7
    WHERE expires_at IS NOT NULL AND expires_at < NOW();
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Função para soft delete
CREATE OR REPLACE FUNCTION soft_delete(table_name TEXT, record_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    EXECUTE format('UPDATE %I SET deleted_at = NOW() WHERE id = $1', table_name)
    USING record_id;
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- #############################################
-- COMENTÁRIOS DAS TABELAS
-- #############################################

COMMENT ON TABLE tenants IS 'Organizações/Clientes da plataforma (multi-tenancy)';
COMMENT ON TABLE users IS 'Usuários do sistema com integração Keycloak';
COMMENT ON TABLE azure_integrations IS 'Configurações de integração com Microsoft Azure AD';
COMMENT ON TABLE campaigns IS 'Campanhas de simulação de phishing';
COMMENT ON TABLE templates IS 'Templates de e-mail para campanhas';
COMMENT ON TABLE landing_pages IS 'Landing pages para captura de dados';
COMMENT ON TABLE targets IS 'Alvos das campanhas de phishing';
COMMENT ON TABLE results IS 'Resultados e métricas das campanhas';
COMMENT ON TABLE trainings IS 'Módulos de treinamento em segurança';
COMMENT ON TABLE training_completions IS 'Conclusões e progresso de treinamentos';
COMMENT ON TABLE kv_store_99a65fc7 IS 'Key-Value store integrado ao Supabase';
COMMENT ON TABLE audit_logs IS 'Logs de auditoria de todas as ações no sistema';

-- #############################################
-- FIM DO SCHEMA
-- #############################################

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '✅ Schema da Plataforma Matreiro criado com sucesso!';
    RAISE NOTICE '📊 Tabelas criadas: 12';
    RAISE NOTICE '🔍 Índices criados: 50+';
    RAISE NOTICE '⚡ Triggers criados: 10';
    RAISE NOTICE '👁️ Views criadas: 1';
    RAISE NOTICE '🛠️ Funções criadas: 3';
END $$;
