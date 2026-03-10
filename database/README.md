# 🗄️ Plataforma Matreiro - Database Documentation

## Overview

Este diretório contém todos os scripts e documentação relacionados ao banco de dados PostgreSQL da Plataforma Matreiro.

---

## 📁 Estrutura de Arquivos

```
database/
├── README.md          # Este arquivo
├── schema.sql         # Schema completo do banco de dados
├── seed.sql           # Dados iniciais (desenvolvimento/testes)
├── migrations/        # Migrações do Django (geradas automaticamente)
└── backups/          # Diretório para backups (criado automaticamente)
```

---

## 🏗️ Arquitetura do Banco de Dados

### Tecnologia
- **PostgreSQL 15+**
- **Extensões**: uuid-ossp, pg_trgm, pgcrypto

### Características
- **Multi-tenancy**: Isolamento de dados por tenant
- **Soft Delete**: Registros marcados como deletados mantêm histórico
- **Audit Trail**: Logs completos de todas as ações
- **JSONB**: Campos flexíveis para metadata
- **Triggers**: Atualização automática de timestamps
- **Views**: Estatísticas pré-calculadas
- **Índices**: Otimizados para performance

---

## 📊 Tabelas Principais

### 1. **tenants** - Organizações/Clientes
Armazena informações das organizações que usam a plataforma.

**Campos principais:**
- `id` (UUID) - Identificador único
- `name` - Nome da organização
- `slug` - Identificador amigável (URL)
- `subscription_tier` - Plano (basic, pro, enterprise)
- `parent_tenant_id` - Para hierarquia (sub-clientes)

**Relações:**
- Pai de: `users`, `campaigns`, `targets`, `azure_integrations`

---

### 2. **users** - Usuários do Sistema
Usuários autenticados via Keycloak.

**Campos principais:**
- `id` (UUID) - Identificador único
- `tenant_id` - Organização do usuário
- `keycloak_id` - ID no Keycloak
- `email` - Email único
- `role` - Papel (super_admin, tenant_admin, manager, analyst, user)

**Roles disponíveis:**
- `super_admin` - Acesso total (Under Protection)
- `tenant_admin` - Administrador do tenant
- `manager` - Gerente de campanhas
- `analyst` - Visualização e relatórios
- `user` - Usuário básico

---

### 3. **campaigns** - Campanhas de Phishing
Campanhas de simulação de phishing.

**Campos principais:**
- `id` (UUID) - Identificador único
- `tenant_id` - Organização dona
- `name` - Nome da campanha
- `status` - Status (draft, scheduled, running, paused, completed, cancelled)
- `template_id` - Template de e-mail usado
- `landing_page_id` - Landing page usada

**Métricas calculadas:**
- `total_targets` - Total de alvos
- `emails_sent` - E-mails enviados
- `emails_opened` - E-mails abertos
- `links_clicked` - Links clicados
- `data_submitted` - Dados submetidos
- `open_rate` - Taxa de abertura (%)
- `click_rate` - Taxa de clique (%)
- `submission_rate` - Taxa de submissão (%)

---

### 4. **templates** - Templates de E-mail
Templates HTML/texto para os e-mails de phishing.

**Campos principais:**
- `subject` - Assunto do e-mail
- `html_content` - Conteúdo HTML
- `text_content` - Conteúdo texto puro
- `variables` - Variáveis disponíveis ({{first_name}}, etc)
- `is_public` - Se pode ser usado por outros tenants

**Variáveis suportadas:**
- `{{first_name}}` - Primeiro nome
- `{{last_name}}` - Sobrenome
- `{{email}}` - Email do alvo
- `{{department}}` - Departamento
- `{{tracking_link}}` - Link de tracking único

---

### 5. **landing_pages** - Landing Pages
Páginas de destino para captura de dados.

**Campos principais:**
- `slug` - URL única
- `html_content` - HTML da página
- `css_content` - CSS customizado
- `js_content` - JavaScript customizado
- `page_type` - Tipo (credential_harvest, malware_download, survey)
- `capture_credentials` - Se captura credenciais
- `redirect_url` - URL de redirecionamento pós-submissão

---

### 6. **targets** - Alvos das Campanhas
Lista de pessoas alvo de uma campanha.

**Campos principais:**
- `email` - Email do alvo
- `first_name`, `last_name` - Nome
- `department`, `position` - Cargo
- `source` - Origem (manual, azure_ad, csv_import, api)
- `source_id` - ID na fonte original

**Constraint:** Email único por campanha

---

### 7. **results** - Resultados das Campanhas
Tracking detalhado de interações.

**Campos de tracking:**
- `email_sent`, `email_sent_at` - Email enviado
- `email_opened`, `email_opened_at`, `open_count` - Aberturas
- `link_clicked`, `link_clicked_at`, `click_count` - Cliques
- `data_submitted`, `data_submitted_at`, `submitted_data` - Submissões

**Informações do cliente:**
- `ip_address` - IP do usuário
- `user_agent` - User agent do browser
- `browser`, `os`, `device` - Informações do dispositivo
- `location` - Geolocalização (cidade, país, lat/lon)

---

### 8. **trainings** - Módulos de Treinamento
Conteúdo educacional sobre segurança.

**Tipos de conteúdo:**
- `video` - Vídeos educativos
- `article` - Artigos/textos
- `quiz` - Questionários
- `interactive` - Conteúdo interativo

**Features:**
- Quiz integrado com pontuação
- Validação por IA (GPT-4)
- Certificados automáticos
- Tracking de progresso

---

### 9. **azure_integrations** - Integração Azure AD
Configurações de sincronização com Microsoft Azure AD.

**Campos principais:**
- `azure_tenant_id` - ID do tenant Azure
- `azure_client_id` - ID da aplicação
- `azure_client_secret_encrypted` - Secret criptografado
- `auto_sync` - Sincronização automática
- `sync_frequency` - Frequência (hourly, daily, weekly)
- `allowed_domains` - Domínios permitidos
- `sync_groups` - Grupos a sincronizar

---

### 10. **kv_store_99a65fc7** - Key-Value Store
Store flexível para configurações e cache.

**Uso:**
- Configurações dinâmicas
- Cache de dados
- Feature flags
- Dados temporários

**API:**
```sql
-- Get
SELECT value FROM kv_store_99a65fc7 WHERE key = 'my_key';

-- Set
INSERT INTO kv_store_99a65fc7 (key, value, tenant_id) 
VALUES ('my_key', '{"data": "value"}'::jsonb, 'tenant-uuid')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Delete
DELETE FROM kv_store_99a65fc7 WHERE key = 'my_key';
```

---

### 11. **audit_logs** - Logs de Auditoria
Registro de todas as ações no sistema.

**Ações rastreadas:**
- `login`, `logout` - Autenticação
- `create`, `update`, `delete` - CRUD
- `start`, `pause`, `stop` - Controle de campanhas
- `sync` - Sincronizações
- `export`, `import` - Transferência de dados

**Informações capturadas:**
- Usuário que executou
- Recurso afetado
- Mudanças (before/after)
- IP e User Agent
- Timestamp

---

## 🔧 Comandos Úteis

### Conectar ao Banco de Dados

```bash
# Via Docker
docker-compose exec postgres psql -U matreiro_user -d matreiro_db

# Direto (se PostgreSQL estiver instalado localmente)
psql -h localhost -p 5432 -U matreiro_user -d matreiro_db
```

### Importar Schema

```bash
# Via Docker
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < database/schema.sql

# Direto
psql -h localhost -p 5432 -U matreiro_user -d matreiro_db -f database/schema.sql
```

### Importar Dados Iniciais (Seed)

```bash
# Via Docker
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < database/seed.sql

# Direto
psql -h localhost -p 5432 -U matreiro_user -d matreiro_db -f database/seed.sql
```

### Listar Tabelas

```sql
-- No psql
\dt

-- Ou via SQL
SELECT tablename FROM pg_tables WHERE schemaname = 'public';
```

### Descrever Tabela

```sql
-- No psql
\d tenants

-- Ou via SQL
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'tenants';
```

### Ver Índices

```sql
-- No psql
\di

-- Ou via SQL
SELECT indexname, tablename 
FROM pg_indexes 
WHERE schemaname = 'public';
```

### Contar Registros

```sql
SELECT 
    'tenants' AS table_name, COUNT(*) AS count FROM tenants
UNION ALL
SELECT 'users', COUNT(*) FROM users
UNION ALL
SELECT 'campaigns', COUNT(*) FROM campaigns
UNION ALL
SELECT 'targets', COUNT(*) FROM targets
UNION ALL
SELECT 'results', COUNT(*) FROM results;
```

---

## 🔍 Queries Úteis

### 1. Estatísticas de Campanha

```sql
-- Usar a view pre-definida
SELECT * FROM campaign_stats 
WHERE tenant_id = 'your-tenant-id';

-- Ou query completa
SELECT 
    c.id,
    c.name,
    c.status,
    COUNT(DISTINCT t.id) AS total_targets,
    COUNT(DISTINCT CASE WHEN r.email_sent THEN r.id END) AS emails_sent,
    COUNT(DISTINCT CASE WHEN r.email_opened THEN r.id END) AS emails_opened,
    COUNT(DISTINCT CASE WHEN r.link_clicked THEN r.id END) AS links_clicked,
    COUNT(DISTINCT CASE WHEN r.data_submitted THEN r.id END) AS data_submitted
FROM campaigns c
LEFT JOIN targets t ON t.campaign_id = c.id
LEFT JOIN results r ON r.campaign_id = c.id
WHERE c.tenant_id = 'your-tenant-id'
GROUP BY c.id, c.name, c.status;
```

### 2. Top 10 Usuários Mais Vulneráveis

```sql
SELECT 
    t.email,
    t.first_name,
    t.last_name,
    COUNT(*) AS total_campaigns,
    SUM(CASE WHEN r.email_opened THEN 1 ELSE 0 END) AS emails_opened,
    SUM(CASE WHEN r.link_clicked THEN 1 ELSE 0 END) AS links_clicked,
    SUM(CASE WHEN r.data_submitted THEN 1 ELSE 0 END) AS data_submitted
FROM targets t
JOIN results r ON r.target_id = t.id
WHERE t.tenant_id = 'your-tenant-id'
GROUP BY t.email, t.first_name, t.last_name
HAVING SUM(CASE WHEN r.data_submitted THEN 1 ELSE 0 END) > 0
ORDER BY data_submitted DESC, links_clicked DESC
LIMIT 10;
```

### 3. Campanhas Ativas

```sql
SELECT 
    id,
    name,
    status,
    start_date,
    end_date,
    total_targets,
    emails_sent,
    open_rate,
    click_rate
FROM campaigns
WHERE status IN ('running', 'scheduled')
    AND tenant_id = 'your-tenant-id'
ORDER BY start_date DESC;
```

### 4. Taxa de Conclusão de Treinamentos

```sql
SELECT 
    t.title,
    COUNT(tc.id) AS total_attempts,
    COUNT(CASE WHEN tc.status = 'completed' THEN 1 END) AS completed,
    ROUND(
        (COUNT(CASE WHEN tc.status = 'completed' THEN 1 END)::DECIMAL / COUNT(tc.id)) * 100,
        2
    ) AS completion_rate,
    AVG(tc.quiz_score) AS average_score
FROM trainings t
LEFT JOIN training_completions tc ON tc.training_id = t.id
WHERE t.tenant_id = 'your-tenant-id' OR t.tenant_id IS NULL
GROUP BY t.id, t.title;
```

### 5. Logs de Auditoria Recentes

```sql
SELECT 
    al.created_at,
    u.email AS user_email,
    al.action,
    al.resource_type,
    al.description,
    al.ip_address
FROM audit_logs al
LEFT JOIN users u ON u.id = al.user_id
WHERE al.tenant_id = 'your-tenant-id'
ORDER BY al.created_at DESC
LIMIT 50;
```

---

## 🔐 Segurança

### Encriptação

1. **Secrets do Azure AD**: Armazenados criptografados na coluna `azure_client_secret_encrypted`
2. **Passwords**: NUNCA armazenados no banco (gerenciados pelo Keycloak)
3. **Dados Sensíveis**: Use `pgcrypto` para criptografar campos sensíveis

### Exemplo de Criptografia:

```sql
-- Criptografar
INSERT INTO azure_integrations (azure_client_secret_encrypted) 
VALUES (pgp_sym_encrypt('my-secret', 'encryption-key'));

-- Descriptografar
SELECT pgp_sym_decrypt(azure_client_secret_encrypted::bytea, 'encryption-key') 
FROM azure_integrations;
```

### Permissões

```sql
-- Criar usuário read-only para analytics
CREATE USER analytics_readonly WITH PASSWORD 'strong-password';

-- Dar permissão apenas de leitura
GRANT CONNECT ON DATABASE matreiro_db TO analytics_readonly;
GRANT USAGE ON SCHEMA public TO analytics_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO analytics_readonly;

-- Revogar permissões de escrita
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM analytics_readonly;
```

---

## 🗑️ Manutenção

### Limpeza de Dados Expirados

```sql
-- Limpar KV store expirado
SELECT cleanup_expired_kv();

-- Limpar logs antigos (mais de 90 dias)
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';

-- Limpar campanhas deletadas (mais de 30 dias)
DELETE FROM campaigns 
WHERE deleted_at IS NOT NULL 
    AND deleted_at < NOW() - INTERVAL '30 days';
```

### Backup

```bash
# Backup completo
docker-compose exec -T postgres pg_dump -U matreiro_user -d matreiro_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup apenas schema
docker-compose exec -T postgres pg_dump -U matreiro_user -d matreiro_db --schema-only > schema_backup.sql

# Backup apenas dados
docker-compose exec -T postgres pg_dump -U matreiro_user -d matreiro_db --data-only > data_backup.sql

# Backup de tabela específica
docker-compose exec -T postgres pg_dump -U matreiro_user -d matreiro_db -t campaigns > campaigns_backup.sql
```

### Restore

```bash
# Restore completo
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < backup_20260310_120000.sql

# Restore apenas dados (schema já existe)
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db --data-only < data_backup.sql
```

### Vacuum e Analyze

```sql
-- Vacuum todas as tabelas
VACUUM FULL;

-- Analyze para atualizar estatísticas
ANALYZE;

-- Vacuum e Analyze específico
VACUUM FULL ANALYZE campaigns;
```

---

## 📈 Performance

### Índices Principais

Todos os índices estão definidos em `schema.sql`. Os mais importantes:

- `idx_tenants_slug` - Busca por slug
- `idx_users_email` - Busca por email
- `idx_campaigns_status` - Filtro por status
- `idx_results_campaign` - Join com campaign
- `idx_audit_logs_created` - Ordenação por data

### Monitoramento de Queries Lentas

```sql
-- Habilitar logging de queries lentas
ALTER DATABASE matreiro_db SET log_min_duration_statement = 1000; -- 1 segundo

-- Ver queries mais lentas
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;
```

### Tamanho das Tabelas

```sql
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🐛 Troubleshooting

### Problema: Erro de Conexão

```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Ver logs
docker-compose logs postgres

# Testar conexão
docker-compose exec postgres pg_isready -U matreiro_user
```

### Problema: Permissões Negadas

```sql
-- Dar todas as permissões ao usuário
GRANT ALL PRIVILEGES ON DATABASE matreiro_db TO matreiro_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO matreiro_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO matreiro_user;
```

### Problema: Schema Não Aplicado

```bash
# Verificar se as tabelas existem
docker-compose exec postgres psql -U matreiro_user -d matreiro_db -c "\dt"

# Se não existirem, aplicar schema
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < database/schema.sql
```

---

## 📚 Referências

- **PostgreSQL Documentation**: https://www.postgresql.org/docs/15/
- **Django Models**: https://docs.djangoproject.com/en/5.0/topics/db/models/
- **SQL Style Guide**: https://www.sqlstyle.guide/

---

## 🤝 Contribuindo

Para adicionar novas tabelas ou modificar o schema:

1. **NUNCA** edite o schema diretamente em produção
2. Crie um arquivo de migração no Django: `python manage.py makemigrations`
3. Revise a migração gerada
4. Aplique em desenvolvimento: `python manage.py migrate`
5. Teste completamente
6. Documente as mudanças aqui
7. Crie um PR para revisão

---

**Última atualização:** 10 de Março de 2026  
**Versão do Schema:** 1.0.0  
**Mantenedor:** Under Protection
