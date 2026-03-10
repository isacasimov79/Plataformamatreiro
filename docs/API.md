# 🔌 API Documentation - Plataforma Matreiro

Documentação completa das APIs REST do backend Django.

---

## 📋 Índice

- [Informações Gerais](#informações-gerais)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
  - [Health Check](#health-check)
  - [Tenants](#tenants)
  - [Users](#users)
  - [Campaigns](#campaigns)
  - [Targets](#targets)
  - [Templates](#templates)
  - [Landing Pages](#landing-pages)
  - [Trainings](#trainings)
  - [Azure Integration](#azure-integration)
  - [Analytics](#analytics)
- [Códigos de Status](#códigos-de-status)
- [Exemplos de Uso](#exemplos-de-uso)

---

## 📡 Informações Gerais

### Base URL

- **Desenvolvimento**: `http://localhost:8000/api`
- **Produção**: `https://api.matreiro.com.br/api`

### Formato

- **Request**: JSON
- **Response**: JSON
- **Charset**: UTF-8

### Headers Padrão

```http
Content-Type: application/json
Authorization: Bearer {keycloak_token}
X-Tenant-ID: {tenant_id}
Accept-Language: pt-BR
```

### Paginação

Endpoints que retornam listas suportam paginação:

```
GET /api/campaigns?page=1&page_size=20
```

**Resposta**:
```json
{
  "count": 100,
  "next": "http://localhost:8000/api/campaigns?page=2",
  "previous": null,
  "results": [...]
}
```

### Filtros

Suporte a filtros via query parameters:

```
GET /api/campaigns?status=running&created_by=uuid
GET /api/targets?tenant_id=uuid&source=azure_ad
```

---

## 🔐 Autenticação

### Keycloak SSO

Todas as APIs requerem autenticação via Bearer Token do Keycloak.

#### Obter Token

```bash
POST http://keycloak:8080/realms/matreiro/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=password&
client_id=matreiro-backend&
client_secret=your-client-secret&
username=user@example.com&
password=userpassword
```

**Resposta**:
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6...",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6...",
  "token_type": "Bearer"
}
```

#### Usar Token

```bash
GET http://localhost:8000/api/campaigns
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6...
```

---

## 🛣️ Endpoints

### Health Check

#### GET `/api/health`

Verifica status da API.

**Request**:
```bash
curl http://localhost:8000/api/health
```

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2026-03-10T14:30:00Z",
  "version": "1.0.0",
  "database": "connected",
  "redis": "connected"
}
```

---

### Tenants

#### GET `/api/tenants`

Lista todos os tenants (apenas super_admin).

**Response**:
```json
{
  "count": 4,
  "results": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "name": "Under Protection",
      "slug": "under-protection",
      "domain": "underprotection.com.br",
      "is_active": true,
      "subscription_tier": "enterprise",
      "max_users": 1000,
      "max_campaigns": 100,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

#### POST `/api/tenants`

Cria um novo tenant (apenas super_admin).

**Request**:
```json
{
  "name": "New Company",
  "slug": "new-company",
  "domain": "newcompany.com",
  "subscription_tier": "pro",
  "max_users": 500,
  "max_campaigns": 50,
  "contact_email": "admin@newcompany.com"
}
```

**Response**:
```json
{
  "id": "new-uuid-here",
  "name": "New Company",
  "slug": "new-company",
  "created_at": "2026-03-10T14:30:00Z"
}
```

#### GET `/api/tenants/{id}`

Obtém detalhes de um tenant específico.

#### PUT `/api/tenants/{id}`

Atualiza um tenant.

#### DELETE `/api/tenants/{id}`

Deleta um tenant (soft delete).

---

### Users

#### GET `/api/users`

Lista usuários do tenant atual.

**Query Parameters**:
- `role`: Filtrar por role (super_admin, tenant_admin, manager, analyst, user)
- `is_active`: Filtrar por status (true/false)
- `search`: Buscar por nome ou email

**Response**:
```json
{
  "count": 25,
  "results": [
    {
      "id": "user-uuid",
      "email": "user@example.com",
      "username": "johndoe",
      "first_name": "John",
      "last_name": "Doe",
      "role": "manager",
      "is_active": true,
      "last_login": "2026-03-10T10:00:00Z",
      "created_at": "2024-06-01T00:00:00Z"
    }
  ]
}
```

#### POST `/api/users`

Cria um novo usuário.

**Request**:
```json
{
  "email": "newuser@example.com",
  "username": "newuser",
  "first_name": "New",
  "last_name": "User",
  "role": "analyst",
  "password": "SecurePass123!"
}
```

#### GET `/api/users/me`

Obtém dados do usuário autenticado.

---

### Campaigns

#### GET `/api/campaigns`

Lista todas as campanhas do tenant.

**Query Parameters**:
- `status`: draft, scheduled, running, paused, completed, cancelled
- `created_by`: UUID do criador
- `start_date_after`: Data de início após (ISO 8601)
- `start_date_before`: Data de início antes (ISO 8601)

**Response**:
```json
{
  "count": 10,
  "results": [
    {
      "id": "campaign-uuid",
      "name": "Q1 Security Awareness",
      "description": "Primeiro trimestre de 2026",
      "status": "running",
      "start_date": "2026-01-15T08:00:00Z",
      "end_date": "2026-03-31T23:59:59Z",
      "template_id": "template-uuid",
      "landing_page_id": "landing-uuid",
      "total_targets": 500,
      "emails_sent": 500,
      "emails_opened": 320,
      "links_clicked": 85,
      "data_submitted": 12,
      "open_rate": 64.00,
      "click_rate": 17.00,
      "submission_rate": 2.40,
      "created_at": "2026-01-01T00:00:00Z",
      "created_by": {
        "id": "user-uuid",
        "name": "John Doe"
      }
    }
  ]
}
```

#### POST `/api/campaigns`

Cria uma nova campanha.

**Request**:
```json
{
  "name": "Q2 Phishing Test",
  "description": "Teste trimestral de phishing",
  "start_date": "2026-04-01T08:00:00Z",
  "end_date": "2026-06-30T23:59:59Z",
  "template_id": "template-uuid",
  "landing_page_id": "landing-uuid",
  "sender_name": "IT Support",
  "sender_email": "it@company.com",
  "track_opens": true,
  "track_clicks": true,
  "track_submissions": true
}
```

**Response**:
```json
{
  "id": "new-campaign-uuid",
  "name": "Q2 Phishing Test",
  "status": "draft",
  "created_at": "2026-03-10T14:30:00Z"
}
```

#### GET `/api/campaigns/{id}`

Obtém detalhes de uma campanha específica.

#### PUT `/api/campaigns/{id}`

Atualiza uma campanha.

#### DELETE `/api/campaigns/{id}`

Deleta uma campanha.

#### POST `/api/campaigns/{id}/start`

Inicia uma campanha (muda status para running).

**Response**:
```json
{
  "message": "Campaign started successfully",
  "status": "running",
  "started_at": "2026-03-10T14:30:00Z"
}
```

#### POST `/api/campaigns/{id}/pause`

Pausa uma campanha.

#### POST `/api/campaigns/{id}/stop`

Para uma campanha.

---

### Targets

#### GET `/api/targets`

Lista alvos (targets).

**Query Parameters**:
- `tenant_id`: UUID do tenant
- `campaign_id`: UUID da campanha
- `source`: manual, azure_ad, csv_import, api
- `search`: Buscar por email ou nome

**Response**:
```json
{
  "count": 1500,
  "results": [
    {
      "id": "target-uuid",
      "email": "employee@company.com",
      "first_name": "Jane",
      "last_name": "Smith",
      "department": "Engineering",
      "position": "Software Engineer",
      "source": "azure_ad",
      "created_at": "2026-01-10T00:00:00Z"
    }
  ]
}
```

#### POST `/api/targets`

Cria um novo target manualmente.

**Request**:
```json
{
  "email": "newemployee@company.com",
  "first_name": "Bob",
  "last_name": "Johnson",
  "department": "Sales",
  "position": "Account Executive"
}
```

#### POST `/api/targets/import`

Importa targets via CSV.

**Request** (multipart/form-data):
```bash
curl -X POST http://localhost:8000/api/targets/import \
  -H "Authorization: Bearer {token}" \
  -F "file=@targets.csv" \
  -F "campaign_id=campaign-uuid"
```

**Formato CSV**:
```csv
email,first_name,last_name,department,position
user1@company.com,John,Doe,IT,Engineer
user2@company.com,Jane,Smith,HR,Manager
```

**Response**:
```json
{
  "message": "Import successful",
  "imported": 245,
  "failed": 5,
  "errors": [
    {
      "row": 12,
      "email": "invalid@",
      "error": "Invalid email format"
    }
  ]
}
```

#### DELETE `/api/targets/tenant/{tenant_id}`

Limpa todos os targets de um tenant (apenas admin).

**⚠️ ATENÇÃO**: Esta operação é destrutiva!

**Response**:
```json
{
  "message": "Targets cleared successfully",
  "deleted_count": 1500,
  "tenant_id": "tenant-uuid"
}
```

---

### Templates

#### GET `/api/templates`

Lista templates de e-mail.

**Query Parameters**:
- `category`: phishing, spear_phishing, business_email_compromise
- `is_public`: true/false
- `search`: Buscar por nome

**Response**:
```json
{
  "count": 15,
  "results": [
    {
      "id": "template-uuid",
      "name": "Microsoft 365 Password Reset",
      "description": "Simula reset de senha M365",
      "category": "credential_harvest",
      "subject": "Reset Your Password",
      "is_public": true,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### POST `/api/templates`

Cria um novo template.

**Request**:
```json
{
  "name": "Custom Phishing Template",
  "description": "Template personalizado",
  "category": "phishing",
  "subject": "Important: Action Required",
  "html_content": "<html>...</html>",
  "text_content": "Plain text version",
  "variables": [
    {"name": "{{first_name}}", "description": "First name"},
    {"name": "{{tracking_link}}", "description": "Tracking link"}
  ]
}
```

#### GET `/api/templates/{id}`

Obtém detalhes de um template.

---

### Landing Pages

#### GET `/api/landing-pages`

Lista landing pages.

**Response**:
```json
{
  "count": 8,
  "results": [
    {
      "id": "landing-uuid",
      "name": "Microsoft 365 Login",
      "description": "Fake M365 login page",
      "slug": "microsoft-365-login",
      "page_type": "credential_harvest",
      "total_visits": 1250,
      "total_submissions": 85,
      "is_public": true,
      "created_at": "2025-06-01T00:00:00Z"
    }
  ]
}
```

#### POST `/api/landing-pages`

Cria uma nova landing page.

**Request**:
```json
{
  "name": "Fake Portal",
  "description": "Portal de acesso falso",
  "slug": "fake-portal",
  "page_type": "credential_harvest",
  "html_content": "<!DOCTYPE html>...",
  "css_content": "body { ... }",
  "capture_credentials": true,
  "redirect_url": "https://real-site.com"
}
```

---

### Trainings

#### GET `/api/trainings`

Lista módulos de treinamento.

**Response**:
```json
{
  "count": 12,
  "results": [
    {
      "id": "training-uuid",
      "title": "Phishing Awareness 101",
      "description": "Curso básico sobre phishing",
      "category": "security_awareness",
      "content_type": "video",
      "duration_minutes": 45,
      "has_quiz": true,
      "passing_score": 70,
      "total_completions": 523,
      "average_score": 82.5,
      "created_at": "2025-01-15T00:00:00Z"
    }
  ]
}
```

#### POST `/api/trainings`

Cria um novo treinamento.

#### POST `/api/trainings/{id}/enroll`

Inscreve o usuário autenticado no treinamento.

#### POST `/api/trainings/{id}/complete`

Marca treinamento como completo e envia respostas do quiz.

**Request**:
```json
{
  "quiz_answers": [
    {"question_id": 1, "answer": "B"},
    {"question_id": 2, "answer": "A"}
  ]
}
```

**Response**:
```json
{
  "status": "completed",
  "score": 85.0,
  "passed": true,
  "certificate_url": "https://cdn.../certificate.pdf"
}
```

---

### Azure Integration

#### GET `/api/azure/config`

Obtém configuração Azure AD do tenant.

**Response**:
```json
{
  "id": "azure-config-uuid",
  "tenant_id": "tenant-uuid",
  "azure_tenant_id": "azure-tenant-id",
  "azure_client_id": "azure-client-id",
  "is_active": true,
  "auto_sync": true,
  "sync_frequency": "daily",
  "last_sync_at": "2026-03-10T02:00:00Z",
  "allowed_domains": ["company.com", "corp.com"],
  "sync_groups": ["All Users", "IT Department"]
}
```

#### POST `/api/azure/config`

Cria/atualiza configuração Azure AD.

**Request**:
```json
{
  "azure_tenant_id": "your-azure-tenant-id",
  "azure_client_id": "your-azure-client-id",
  "azure_client_secret": "your-azure-client-secret",
  "auto_sync": true,
  "sync_frequency": "daily",
  "allowed_domains": ["company.com"],
  "sync_groups": ["Security Team"]
}
```

#### POST `/api/azure/sync-users`

Sincroniza usuários do Azure AD.

**Request**:
```json
{
  "group_filter": "Security Team",
  "domain_filter": "company.com"
}
```

**Response**:
```json
{
  "message": "Sync completed",
  "imported": 245,
  "updated": 12,
  "failed": 3,
  "sync_id": "sync-uuid",
  "started_at": "2026-03-10T14:30:00Z",
  "completed_at": "2026-03-10T14:35:23Z"
}
```

#### POST `/api/azure/sync-groups`

Sincroniza grupos do Azure AD.

#### GET `/api/azure/groups`

Lista grupos disponíveis no Azure AD.

**Response**:
```json
{
  "count": 25,
  "groups": [
    {
      "id": "azure-group-id",
      "displayName": "Engineering Team",
      "description": "All engineers",
      "memberCount": 150
    }
  ]
}
```

#### GET `/api/azure/users`

Lista usuários disponíveis no Azure AD (preview antes de importar).

---

### Analytics

#### GET `/api/analytics/dashboard`

Dados consolidados para o dashboard.

**Query Parameters**:
- `start_date`: Data de início (ISO 8601)
- `end_date`: Data de fim (ISO 8601)

**Response**:
```json
{
  "period": {
    "start": "2026-01-01T00:00:00Z",
    "end": "2026-03-31T23:59:59Z"
  },
  "campaigns": {
    "total": 5,
    "active": 2,
    "completed": 3
  },
  "targets": {
    "total": 1500,
    "active": 1200
  },
  "metrics": {
    "emails_sent": 7500,
    "emails_opened": 4800,
    "links_clicked": 950,
    "data_submitted": 120,
    "open_rate": 64.0,
    "click_rate": 12.67,
    "submission_rate": 1.6
  },
  "trainings": {
    "total_completions": 523,
    "average_score": 82.5,
    "pass_rate": 91.2
  },
  "risk_score": {
    "current": 35.2,
    "previous": 42.8,
    "trend": "improving"
  }
}
```

#### GET `/api/analytics/reports`

Lista relatórios disponíveis.

#### POST `/api/analytics/reports/generate`

Gera um novo relatório.

**Request**:
```json
{
  "type": "campaign_summary",
  "format": "pdf",
  "campaign_id": "campaign-uuid",
  "include_charts": true,
  "language": "pt-BR"
}
```

**Response**:
```json
{
  "report_id": "report-uuid",
  "status": "generating",
  "estimated_time": 30
}
```

#### GET `/api/analytics/reports/{id}`

Obtém relatório gerado.

**Response**:
```json
{
  "id": "report-uuid",
  "status": "completed",
  "download_url": "https://cdn.../report.pdf",
  "expires_at": "2026-03-17T14:30:00Z"
}
```

---

## 📊 Códigos de Status

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 201 | Created - Recurso criado com sucesso |
| 204 | No Content - Sucesso sem conteúdo de resposta |
| 400 | Bad Request - Dados inválidos |
| 401 | Unauthorized - Autenticação necessária |
| 403 | Forbidden - Sem permissão |
| 404 | Not Found - Recurso não encontrado |
| 409 | Conflict - Conflito (ex: email duplicado) |
| 422 | Unprocessable Entity - Validação falhou |
| 429 | Too Many Requests - Rate limit excedido |
| 500 | Internal Server Error - Erro no servidor |
| 503 | Service Unavailable - Serviço temporariamente indisponível |

---

## 💡 Exemplos de Uso

### Criar Campanha Completa

```bash
# 1. Criar template
TEMPLATE_ID=$(curl -X POST http://localhost:8000/api/templates \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Phishing Test",
    "subject": "Action Required",
    "html_content": "<html>...</html>"
  }' | jq -r '.id')

# 2. Criar landing page
LANDING_ID=$(curl -X POST http://localhost:8000/api/landing-pages \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fake Login",
    "slug": "fake-login",
    "html_content": "<html>...</html>"
  }' | jq -r '.id')

# 3. Criar campanha
CAMPAIGN_ID=$(curl -X POST http://localhost:8000/api/campaigns \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Q1 Test\",
    \"template_id\": \"$TEMPLATE_ID\",
    \"landing_page_id\": \"$LANDING_ID\",
    \"start_date\": \"2026-04-01T08:00:00Z\"
  }" | jq -r '.id')

# 4. Importar targets
curl -X POST http://localhost:8000/api/targets/import \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@targets.csv" \
  -F "campaign_id=$CAMPAIGN_ID"

# 5. Iniciar campanha
curl -X POST http://localhost:8000/api/campaigns/$CAMPAIGN_ID/start \
  -H "Authorization: Bearer $TOKEN"
```

### Sincronizar com Azure AD

```bash
# 1. Configurar Azure AD
curl -X POST http://localhost:8000/api/azure/config \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "azure_tenant_id": "...",
    "azure_client_id": "...",
    "azure_client_secret": "...",
    "auto_sync": true,
    "allowed_domains": ["company.com"]
  }'

# 2. Sincronizar usuários
curl -X POST http://localhost:8000/api/azure/sync-users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "domain_filter": "company.com"
  }'
```

---

**🛡️ Plataforma Matreiro - Under Protection © 2024-2026**
