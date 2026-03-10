# 🗄️ Database - Plataforma Matreiro

Documentação completa do banco de dados PostgreSQL.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Schema](#schema)
- [Tabelas](#tabelas)
- [Seed Data](#seed-data)
- [Como Usar](#como-usar)
- [Backup e Restore](#backup-e-restore)
- [Migrações](#migrações)

---

## 🎯 Visão Geral

O banco de dados da Plataforma Matreiro utiliza **PostgreSQL 15** com as seguintes características:

- **Multi-Tenancy**: Todas as tabelas possuem `tenant_id` para isolamento de dados
- **UUIDs**: IDs universalmente únicos ao invés de integers sequenciais
- **Soft Deletes**: Campo `deleted_at` para exclusões lógicas
- **Timestamps**: `created_at` e `updated_at` automáticos via triggers
- **JSONB**: Campos flexíveis para metadata e configurações
- **Índices**: Otimizados para queries comuns

### Extensões Utilizadas

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";    -- Geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "pg_trgm";      -- Full-text search
CREATE EXTENSION IF NOT EXISTS "pgcrypto";     -- Criptografia
```

---

## 📊 Schema

### Diagrama ER (Simplificado)

```
tenants
├── users
├── azure_integrations
├── campaigns
│   ├── templates
│   ├── landing_pages
│   ├── targets
│   └── results
├── trainings
│   └── training_completions
└── audit_logs
```

### Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `schema.sql` | Schema completo do banco de dados |
| `seed.sql` | Dados iniciais para desenvolvimento |
| `README.md` | Este arquivo |

---

## 🗂️ Tabelas

### 1. tenants (Organizações)

Organizações/Clientes da plataforma (multi-tenancy).

**Campos principais**:
- `id` (UUID) - Primary key
- `name` (VARCHAR) - Nome da organização
- `slug` (VARCHAR) - URL-friendly identifier
- `parent_tenant_id` (UUID) - Para hierarquia de sub-clientes
- `subscription_tier` (VARCHAR) - basic, pro, enterprise
- `max_users` (INTEGER) - Limite de usuários
- `max_campaigns` (INTEGER) - Limite de campanhas

**Exemplo**:
```sql
INSERT INTO tenants (name, slug, subscription_tier) 
VALUES ('Acme Corp', 'acme-corp', 'enterprise');
```

### 2. users (Usuários)

Usuários do sistema com integração Keycloak.

**Campos principais**:
- `id` (UUID) - Primary key
- `tenant_id` (UUID) - Foreign key para tenants
- `keycloak_id` (UUID) - ID do usuário no Keycloak
- `email` (VARCHAR) - Email único
- `role` (VARCHAR) - super_admin, tenant_admin, manager, analyst, user
- `permissions` (JSONB) - Permissões customizadas

**Roles**:
- **super_admin**: Acesso total, multi-tenant
- **tenant_admin**: Admin do tenant
- **manager**: Gerencia campanhas
- **analyst**: Visualiza relatórios
- **user**: Usuário final (target de campanhas)

### 3. azure_integrations

Configurações de integração com Microsoft Azure AD.

**Campos principais**:
- `azure_tenant_id` (VARCHAR) - Tenant ID do Azure
- `azure_client_id` (VARCHAR) - Application ID
- `azure_client_secret_encrypted` (TEXT) - Secret criptografado
- `auto_sync` (BOOLEAN) - Sincronização automática
- `allowed_domains` (TEXT[]) - Domínios permitidos
- `sync_groups` (TEXT[]) - Grupos para sincronizar

### 4. campaigns (Campanhas de Phishing)

Campanhas de simulação de phishing.

**Campos principais**:
- `name` (VARCHAR) - Nome da campanha
- `status` (VARCHAR) - draft, scheduled, running, paused, completed, cancelled
- `template_id` (UUID) - Template de e-mail
- `landing_page_id` (UUID) - Landing page
- `total_targets` (INTEGER) - Total de alvos
- `emails_sent` (INTEGER) - E-mails enviados
- `emails_opened` (INTEGER) - E-mails abertos
- `links_clicked` (INTEGER) - Links clicados
- `data_submitted` (INTEGER) - Dados submetidos

**Métricas calculadas**:
- `open_rate` (DECIMAL) - Taxa de abertura %
- `click_rate` (DECIMAL) - Taxa de clique %
- `submission_rate` (DECIMAL) - Taxa de submissão %

### 5. templates (Templates de E-mail)

Templates de e-mail para campanhas.

**Campos principais**:
- `name` (VARCHAR) - Nome do template
- `category` (VARCHAR) - phishing, spear_phishing, etc
- `subject` (VARCHAR) - Assunto do e-mail
- `html_content` (TEXT) - Conteúdo HTML
- `text_content` (TEXT) - Conteúdo texto plano
- `variables` (JSONB) - Variáveis disponíveis

**Variáveis suportadas**:
- `{{first_name}}` - Primeiro nome
- `{{last_name}}` - Sobrenome
- `{{email}}` - Email
- `{{tracking_link}}` - Link de tracking
- `{{random_number}}` - Número aleatório

### 6. landing_pages

Landing pages para captura de dados.

**Campos principais**:
- `name` (VARCHAR) - Nome da página
- `slug` (VARCHAR) - URL slug
- `html_content` (TEXT) - HTML da página
- `page_type` (VARCHAR) - credential_harvest, malware_download, survey
- `capture_credentials` (BOOLEAN) - Capturar credenciais
- `redirect_url` (TEXT) - URL de redirecionamento

### 7. targets (Alvos)

Alvos das campanhas de phishing.

**Campos principais**:
- `email` (VARCHAR) - Email do alvo
- `first_name`, `last_name` (VARCHAR) - Nome
- `department` (VARCHAR) - Departamento
- `position` (VARCHAR) - Cargo
- `source` (VARCHAR) - manual, azure_ad, csv_import, api

### 8. results (Resultados)

Resultados e tracking das campanhas.

**Campos principais**:
- `campaign_id` (UUID) - Campanha
- `target_id` (UUID) - Alvo
- `email_sent`, `email_opened`, `link_clicked`, `data_submitted` (BOOLEAN)
- `submitted_data` (JSONB) - Dados submetidos
- `ip_address` (INET) - IP do alvo
- `user_agent` (TEXT) - User agent
- `location` (JSONB) - Geolocalização

### 9. trainings

Módulos de treinamento em segurança.

**Campos principais**:
- `title` (VARCHAR) - Título do treinamento
- `content_type` (VARCHAR) - video, article, quiz, interactive
- `duration_minutes` (INTEGER) - Duração estimada
- `has_quiz` (BOOLEAN) - Possui quiz
- `quiz_questions` (JSONB) - Questões do quiz
- `passing_score` (INTEGER) - Pontuação mínima

### 10. training_completions

Conclusões e progresso de treinamentos.

**Campos principais**:
- `training_id` (UUID) - Treinamento
- `user_id` (UUID) - Usuário
- `status` (VARCHAR) - in_progress, completed, failed
- `progress` (DECIMAL) - Progresso %
- `quiz_score` (DECIMAL) - Pontuação no quiz
- `certificate_url` (TEXT) - URL do certificado

### 11. kv_store_99a65fc7

Key-Value store integrado ao Supabase.

**Campos principais**:
- `key` (TEXT) - Chave única
- `value` (JSONB) - Valor
- `expires_at` (TIMESTAMP) - Expiração

### 12. audit_logs

Logs de auditoria de todas as ações.

**Campos principais**:
- `action` (VARCHAR) - Ação realizada
- `resource_type` (VARCHAR) - Tipo de recurso
- `resource_id` (UUID) - ID do recurso
- `changes` (JSONB) - Mudanças (before/after)
- `ip_address` (INET) - IP do usuário

---

## 🌱 Seed Data

O arquivo `seed.sql` contém dados iniciais para desenvolvimento:

### Tenants (4 organizações + 1 sub-cliente)
- **Under Protection** - Tenant principal (empresa)
- **Acme Corporation** - Cliente exemplo (Pro)
- **TechStart Brasil** - Cliente exemplo (Basic)
- **Global Finance Inc** - Cliente exemplo (Enterprise)
- **Acme Corp - Filial Rio** - Sub-cliente

### Users (7 usuários com diferentes roles)
- **Super Admin** - admin@underprotection.com.br
- **Tenant Admins** - Admins de cada tenant
- **Manager** - Gerente de segurança
- **Analyst** - Analista
- **Regular Users** - Usuários finais

**Senha padrão (desenvolvimento)**: `Matreiro2024!`

### Templates (3 templates prontos)
1. **Microsoft 365 Password Reset** - Credential harvesting
2. **Payroll Document** - Documento urgente de RH
3. **Package Delivery** - Notificação de entrega

### Landing Pages (3 páginas)
1. **Microsoft 365 Login** - Login falso M365
2. **Payroll Portal** - Portal de folha de pagamento
3. **Package Tracking** - Rastreamento de encomenda

### Campanhas (2 campanhas de exemplo)
- **Q1 Security Awareness** - Campanha trimestral
- **Executive Spear Phishing** - Teste focado

### Treinamentos (3 cursos)
1. **Phishing Awareness 101** - Básico
2. **Advanced Social Engineering** - Avançado
3. **Security Best Practices** - Melhores práticas

---

## 🚀 Como Usar

### 1. Inicializar Banco de Dados

**Via Docker Compose (Automático)**:
```bash
# O schema.sql e seed.sql são executados automaticamente
docker-compose up -d postgres
```

**Manual**:
```bash
# Criar banco
createdb -U matreiro_user matreiro_db

# Executar schema
psql -U matreiro_user -d matreiro_db -f schema.sql

# Executar seed
psql -U matreiro_user -d matreiro_db -f seed.sql
```

### 2. Conectar ao Banco

```bash
# Via Docker
docker-compose exec postgres psql -U matreiro_user -d matreiro_db

# Localmente
psql -U matreiro_user -d matreiro_db
```

### 3. Queries Úteis

**Listar todas as tabelas**:
```sql
\dt
```

**Descrever tabela**:
```sql
\d users
```

**Contar registros**:
```sql
SELECT 
  (SELECT COUNT(*) FROM tenants) as tenants,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM campaigns) as campaigns,
  (SELECT COUNT(*) FROM templates) as templates;
```

**Ver estatísticas de campanha**:
```sql
SELECT * FROM campaign_stats;
```

**Buscar usuários por tenant**:
```sql
SELECT 
  u.email,
  u.role,
  t.name as tenant_name
FROM users u
JOIN tenants t ON t.id = u.tenant_id
WHERE t.slug = 'acme-corp';
```

---

## 💾 Backup e Restore

### Backup

**Backup completo**:
```bash
# Via Docker
docker-compose exec postgres pg_dump -U matreiro_user matreiro_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Localmente
pg_dump -U matreiro_user -d matreiro_db -F c -f backup.dump
```

**Backup de tabela específica**:
```bash
pg_dump -U matreiro_user -d matreiro_db -t users > users_backup.sql
```

**Backup apenas schema (sem dados)**:
```bash
pg_dump -U matreiro_user -d matreiro_db --schema-only > schema_backup.sql
```

### Restore

**Restore completo**:
```bash
# Via Docker
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < backup.sql

# Localmente
pg_restore -U matreiro_user -d matreiro_db backup.dump
```

**Restore de tabela específica**:
```bash
psql -U matreiro_user -d matreiro_db < users_backup.sql
```

### Backup Automatizado

**Script de backup diário**:
```bash
#!/bin/bash
# /scripts/backup_db.sh

BACKUP_DIR="/backups/postgres"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="matreiro_backup_$DATE.sql"

mkdir -p $BACKUP_DIR

docker-compose exec -T postgres pg_dump -U matreiro_user matreiro_db > "$BACKUP_DIR/$FILENAME"

# Comprimir
gzip "$BACKUP_DIR/$FILENAME"

# Manter apenas últimos 30 dias
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup concluído: $FILENAME.gz"
```

**Agendar via cron**:
```bash
# Editar crontab
crontab -e

# Executar todo dia às 2h da manhã
0 2 * * * /path/to/scripts/backup_db.sh
```

---

## 🔄 Migrações

### Django Migrations

**Criar migração**:
```bash
docker-compose exec django python manage.py makemigrations
```

**Aplicar migrações**:
```bash
docker-compose exec django python manage.py migrate
```

**Ver migrações aplicadas**:
```bash
docker-compose exec django python manage.py showmigrations
```

**Reverter migração**:
```bash
docker-compose exec django python manage.py migrate app_name migration_name
```

### SQL Migrations (Manual)

Se precisar executar SQL diretamente:

```sql
-- Adicionar coluna
ALTER TABLE campaigns ADD COLUMN new_field VARCHAR(255);

-- Criar índice
CREATE INDEX idx_campaigns_new_field ON campaigns(new_field);

-- Atualizar dados
UPDATE campaigns SET new_field = 'default_value';
```

---

## 🔍 Manutenção

### Vacuum e Analyze

**Executar periodicamente para otimizar performance**:
```sql
-- Conectar ao banco
docker-compose exec postgres psql -U matreiro_user -d matreiro_db

-- Vacuum e Analyze
VACUUM ANALYZE;

-- Vacuum completo (mais lento, mas mais efetivo)
VACUUM FULL ANALYZE;
```

### Limpar KV Store Expirado

```sql
-- Função já criada no schema
SELECT cleanup_expired_kv();
```

### Verificar Tamanho do Banco

```sql
-- Tamanho total
SELECT pg_size_pretty(pg_database_size('matreiro_db'));

-- Tamanho por tabela
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;
```

### Verificar Conexões Ativas

```sql
SELECT 
  pid,
  usename,
  application_name,
  client_addr,
  state,
  query
FROM pg_stat_activity
WHERE datname = 'matreiro_db';
```

---

## ⚠️ Notas Importantes

1. **Não commite dados sensíveis**: O seed.sql contém dados de exemplo, não use em produção
2. **Backup regular**: Configure backups automáticos
3. **Monitoramento**: Monitore tamanho do banco e queries lentas
4. **Índices**: Crie índices adicionais conforme necessário
5. **Vacuum**: Execute VACUUM ANALYZE regularmente

---

**🛡️ Plataforma Matreiro - Under Protection © 2024-2026**