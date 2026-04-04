# Pendências Técnicas - Plataforma Matreiro

Data: 2026-04-03
Plataforma: Phishing Simulation & Security Awareness

---

## 1. BOTOES E FUNCIONALIDADES - STATUS

### 1.1 Campanhas (Campaigns.tsx) - ✅ CORRIGIDO

| Botao | Status | Descricao |
|-------|--------|-----------|
| Nova Campanha | **FUNCIONAL** | Agora chama `createCampaign()` da API |
| Pausar Campanha | **FUNCIONAL** | Chama `updateCampaign()` com status 'paused' |
| Retomar Campanha | **FUNCIONAL** | Chama `updateCampaign()` com status 'running' |
| Excluir Campanha | **FUNCIONAL** | Chama `deleteCampaign()` da API |
| Editar Campanha | **EM DESENVOLVIMENTO** | Toast informativo ainda mostrado |
| Ver Relatorio | **EM DESENVOLVIMENTO** | Toast informativo ainda mostrado |

**Correcoes Aplicadas:**
- `NewCampaignDialog.tsx`: Adicionada chamada real à API `createCampaign()`
- `Campaigns.tsx`: Adicionados handlers `handlePauseCampaign()`, `handleResumeCampaign()`, `handleDeleteCampaign()`
- Adicionado event listener para recarregar lista após criação
- Criada funcao `adaptCampaign()` para mapear campos Django -> Frontend

### 1.2 Configuracoes (Settings.tsx) - ✅ PARCIALMENTE CORRIGIDO

| Funcao | Status | Descricao |
|--------|--------|-----------|
| getSettings | **FUNCIONAL** | Agora chama endpoint real `/api/v1/settings/` |
| updateSettings | **FUNCIONAL** | Agora chama endpoint real `/api/v1/settings/update` |
| Testar SMTP | **STUB** | Simulator ainda |
| Testar Syslog | **STUB** | Simulator ainda |
| Modo Manutencao | **FUNCIONAL** | Persiste via updateSettings |
| Auto-arquivar | **FUNCIONAL** | Persiste via updateSettings |

**Correcoes Aplicadas:**
- Adicionado endpoint Django `/api/v1/settings/` e `/api/v1/settings/update`
- Atualizado `supabaseApi.ts` para chamar endpoints reais

### 1.3 Integracoes (Integrations.tsx) - ✅ PARCIALMENTE CORRIGIDO

| Funcao | Status | Descricao |
|--------|--------|-----------|
| Azure test-connection | **FUNCIONAL** | Stub demo implementado |
| Azure sync-users | **FUNCIONAL** | Stub demo implementado (retorna 3 usuarios mock) |
| Azure sync-groups | **FUNCIONAL** | Stub demo implementado (retorna 3 grupos mock) |

**Correcoes Aplicadas:**
- Adicionados endpoints Django stubs para Azure em `/api/v1/azure/*`
- `supabaseApi.ts` agora chama endpoints reais (com dados mock para demo)

### 1.4 Tenants - ✅ CORRIGIDO

| Funcao | Status | Descricao |
|--------|--------|-----------|
| Listar Tenants | **FUNCIONAL** | Endpoint correto agora (`/api/v1/tenants/`) |
| CRUD Tenants | **FUNCIONAL** | Endpoint `/api/v1/tenants/{id}/` implementado |

**Correcoes Aplicadas:**
- `backend/matreiro/urls.py`: Corrigido URL de `tenants/` de `targets_list` para `tenants_list`
- Adicionado `tenant_detail` endpoint para GET/PUT/DELETE
- `Tenants.tsx`: Adicionado adapter `adaptTenant()` para mapear campos Django

### 1.5 Targets/TargetGroups - ✅ CORRIGIDO

- `Targets.tsx`: Adicionado adapter `adaptTarget()`
- `TargetGroups.tsx`: Adicionado adapter `adaptGroup()`
- `Templates.tsx`: Corrigido mapeamento de campos Django (`created_at`, `body_html`, etc.)
| Microsoft Azure AD - Conectar | **STUB** | `azureTestConnection()` retorna erro "not implemented in local mode" |
| Microsoft Azure AD - Sincronizar | **STUB** | `azureSyncUsers()` retorna erro "not implemented in local mode" |
| Microsoft Azure AD - Desconectar | **STUB** | Settings sao salvos localmente mas API real nao existe |
| Microsoft 365 - Conectar | **STUB** | Mesma situacao do Azure |
| Google Workspace - Conectar | **STUB** | Mesma situacao |
| SMTP - Testar | **STUB** | Simulator sem conexao real |
| Webhooks | **NAO IMPLEMENTADO** | UI existe mas NAO ha backend |

**Causa Raiz:** As funcoes em `supabaseApi.ts` retornam `{ success: false, error: '...' }` para Azure/Google integrations.

---

## 2. INTEGRACOES NECESSARIAS

### 2.1 Integracao Azure AD/Microsoft Graph API

**Status:** NAO IMPLEMENTADA

**Endpoints necessarios no Django:**
```
POST   /api/v1/azure/test-connection
POST   /api/v1/azure/sync-users
POST   /api/v1/azure/sync-groups
GET    /api/v1/azure/organization
```

**Funcoes a implementar:**
```typescript
azureTestConnection(tenantId, clientId, clientSecret)  // Testar credenciais
azureSyncUsers(tenantId, clientId, clientSecret, targetTenantId, allowedDomains)  // Importar usuarios
azureGetUsers(tenantId, clientId, clientSecret, maxResults)  // Listar usuarios
azureGetGroups(tenantId, clientId, clientSecret, maxResults)  // Listar grupos
azureGetGroupMembers(tenantId, clientId, clientSecret, groupId)  // Listar membros
azureSyncGroups(tenantId, clientId, clientSecret, targetTenantId, allowedDomains)  // Importar grupos
```

**Permissoes Azure necessarias:**
- `User.Read.All` - Ler usuarios
- `Group.Read.All` - Ler grupos
- `GroupMember.Read.All` - Ler membros
- `Mail.Send` - Enviar emails (opcional)

### 2.2 Integracao Google Workspace

**Status:** NAO IMPLEMENTADA

**Endpoints necessarios no Django:**
```
POST   /api/v1/google/test-connection
POST   /api/v1/google/sync-users
POST   /api/v1/google/sync-groups
```

**Funcoes a implementar:**
```typescript
googleTestConnection(serviceAccountJson, domain)
googleSyncUsers(serviceAccountJson, domain, targetTenantId)
googleSyncGroups(serviceAccountJson, domain, targetTenantId)
```

### 2.3 Integracao SMTP

**Status:** STUB (nao testa conexao real)

**Endpoints necessarios:**
```
POST   /api/v1/smtp/test  // Testar conexao SMTP
POST   /api/v1/smtp/send-test  // Enviar email de teste
```

### 2.4 Integracao Syslog

**Status:** STUB (nao envia logs reais)

**Endpoints necessarios:**
```
POST   /api/v1/syslog/test  // Enviar mensagem de teste
POST   /api/v1/syslog/send-event  // Enviar evento
```

---

## 3. API - MAPEAMENTO FRONTEND <-> BACKEND

### 3.1 Problema: Estrutura de Dados Mismatch

**Frontend espera (mock Supabase):**
```typescript
campaign = {
  id: string,
  name: string,
  status: 'draft' | 'scheduled' | 'running' | 'paused' | 'completed' | 'cancelled',
  templateId: string,       // <- Campo do mock
  tenantId: string,          // <- Campo do mock
  type: 'standard' | 'welcome_automation' | 'scheduled',
  scheduledAt: Date,
  stats: {                   // <- Estrutura mock
    sent: number,
    opened: number,
    clicked: number,
    submitted: number
  }
}
```

**Backend fornece (Django):**
```python
campaign = {
    'id': int,
    'tenant': int,            # <- FK, nao tenantId
    'tenant_name': str,       # <- Related name
    'name': str,
    'description': str,
    'status': str,
    'template': int,          # <- FK, nao templateId
    'start_date': datetime,
    'end_date': datetime,
    'target_count': int,
    'target_list': list,
    'emails_sent': int,       # <- Campos separados, nao dentro de stats
    'emails_opened': int,
    'links_clicked': int,
    'credentials_submitted': int,
    'created_by': int,
    'created_by_name': str,
    'created_at': datetime,
    'updated_at': datetime
}
```

**Solucao Necessaria:** Criar uma camada de transformacao/adapter no frontend ou modificar o backend para retornar a estrutura esperada.

### 3.2 Endpoints Django Existentes vs Necessarios

| Recurso | Endpoint | Metodo | Status |
|---------|----------|--------|--------|
| Campanhas | `/api/v1/campaigns/` | GET/POST | **FUNCIONAL** |
| Campanha | `/api/v1/campaigns/{id}/` | GET/PUT/DELETE | **FUNCIONAL** |
| Targets | `/api/v1/targets/` | GET/POST | **FUNCIONAL** |
| Grupos | `/api/v1/target-groups/` | GET/POST | **FUNCIONAL** |
| Templates | `/api/v1/templates/` | GET/POST | **FUNCIONAL** |
| Tenants | `/api/v1/tenants/` | GET/POST | **FUNCIONAL** ✅ |
| Tenant Detail | `/api/v1/tenants/{id}/` | GET/PUT/DELETE | **FUNCIONAL** ✅ |
| Reports | `/api/v1/reports/overview` | GET | **FUNCIONAL** |
| Reports | `/api/v1/reports/timeline` | GET | **FUNCIONAL** |
| **Settings** | `/api/v1/settings/` | GET/PUT | **FUNCIONAL** ✅ |
| **Settings Update** | `/api/v1/settings/update` | POST | **FUNCIONAL** ✅ |
| **Azure Test** | `/api/v1/azure/test-connection` | POST | **FUNCIONAL** ✅ (stub) |
| **Azure Sync Users** | `/api/v1/azure/sync-users` | POST | **FUNCIONAL** ✅ (stub) |
| **Azure Sync Groups** | `/api/v1/azure/sync-groups` | POST | **FUNCIONAL** ✅ (stub) |
| **Google Sync** | `/api/v1/google/*` | POST | **NAO IMPLEMENTADO** |
| **SMTP Test** | `/api/v1/smtp/test` | POST | **NAO IMPLEMENTADO** |
| **Syslog Test** | `/api/v1/syslog/test` | POST | **NAO IMPLEMENTADO** |

---

## 4. FEATURES DE IA MENCIONADAS

### 4.1 Analise de Phishing com IA

O codigo menciona "analise de phishing" emComentarios mas nao ha implementacao real.

**Necessario:**
- Integracao com OpenAI/Azure OpenAI para analise de emails
- Endpoint `POST /api/v1/ai/analyze-phishing` para analisar templates
- Endpoint `POST /api/v1/ai/suggest-improvements` para sugerir melhorias

### 4.2 Analise Comportamental

**Mencionado em:**
- `analytics.tsx` - "Detailed analysis of campaigns and security metrics"
- Dashboard com "risk heatmap", "vulnerable users", "department comparison"

**Necessario:**
- Algoritmos de risk scoring baseados em historico
- ML para identificar padroes de comportamento vulneravel
- Dashboard analytics conectando ao banco de dados real

---

## 5. SEGURANCA - PROBLEMAS IDENTIFICADOS

### 5.1 Permissoes AllowAny em Todos Endpoints

**Arquivo:** `backend/matreiro/urls.py`

**Problema:**
```python
@api_view(['GET', 'POST'])
@permission_classes([AllowAny])  # <-- SECURITY ISSUE
def campaigns_list(request):
    ...
```

**Impacto:** TODOS os endpoints da API estao expostos publicamente sem autenticacao.

**Solucao:** Implementar autenticacao JWT via simplejwt configurado no Django.

### 5.2 Credenciais no Codigo

**Arquivo:** `seed_data.py`
```python
admin.set_password('admin123')  # <-- Senha hardcoded
```

**Solucao:** Usar variaveis de ambiente para credenciais default.

---

## 6. TABELA RESUMO DE PRIORIDADES

| Prioridade | Item | Esforco | Status |
|------------|------|---------|--------|
| **ALTA** | Implementar createCampaign no NewCampaignDialog | Baixo | **✅ CONCLUIDO** |
| **ALTA** | Implementar deleteCampaign | Baixo | **✅ CONCLUIDO** |
| **ALTA** | Corrigir mismatch de dados (templateId vs template) | Medio | **✅ CONCLUIDO** |
| **ALTA** | Corrigir URL de Tenants (apontava para Targets) | Baixo | **✅ CONCLUIDO** |
| **ALTA** | Configurar autenticacao JWT | Alto | **PENDENTE** |
| **MEDIA** | Implementar Azure AD sync | Alto | **✅ STUB IMPLEMENTADO** |
| **MEDIA** | Implementar Google Workspace sync | Alto | **PENDENTE** |
| **MEDIA** | Implementar Settings persistence | Medio | **✅ CONCLUIDO** |
| **MEDIA** | Implementar SMTP test real | Baixo | **PENDENTE** |
| **BAIXA** | Webhooks | Medio | **PENDENTE** |
| **BAIXA** | IA Analysis features | Alto | **PENDENTE** |

---

## 7. PROXIMOS PASSOS RECOMENDADOS

1. **Curto prazo:** Configurar autenticacao JWT (corrigir AllowAny) - **SEGURANCA**
2. **Curto prazo:** Implementar Google Workspace sync real
3. **Medio prazo:** Implementar SMTP test real
4. **Medio prazo:** Implementar Syslog test real
5. **Longo prazo:** Integracao de IA para analise de phishing

---

## 7. CORRECOES DE CONTRASTE DE CORES - ✅ CONCLUIDO

### Problemas Corrigidos

**Arquivos modificados:**

1. **Layout.tsx** - Sidebar navigation:
   - Corrigido texto de cliente impersonado: `text-[#e0c7e6]` → `text-purple-200`
   - Corrigido link ativo: `text-[#e0c7e6]` → `text-white`
   - Corrigido icone ativo: `text-[#9D4B97]` → `text-purple-300`
   - Corrigido badge: `bg-[#9D4B97]` → `bg-purple-600`
   - Corrigido titulo de secao: `text-gray-400 opacity-50` → `text-gray-300 opacity-70`
   - Corrigido badge NEW: `bg-[#9D4B97]` → `bg-purple-600`

2. **Dashboard.tsx** - Pagina principal:
   - Corrigido background: Adicionado `dark:` variants com tons escuros
   - Corrigido cards: Adicionado gradiente escuro `dark:from-slate-800`
   - Corrigido texto de titulos: Adicionado `dark:text-gray-200`
   - Corrigido icon backgrounds: `bg-purple-100` → `bg-purple-100 dark:bg-purple-900/50`
   - Corrigido icones: `text-[#834a8b]` → `text-[#834a8b] dark:text-purple-300`
   - Corrigido texto numerico: Adicionado `dark:text-*` variants

3. **Targets.tsx, AuditLogs.tsx, Notifications.tsx, SystemUsers.tsx, Automations.tsx, Certificates.tsx, Settings.tsx, TargetGroups.tsx, LandingPages.tsx, AdvancedDashboard.tsx** - Titulos de paginas:
   - Corrigido: `text-[#242545]` → `text-foreground` (adapta ao tema)

4. **Templates.tsx, LandingPages.tsx, Certificates.tsx** - Botoes outline:
   - Corrigido: `border-[#834a8b] text-[#834a8b]` → `border-secondary text-secondary`

5. **AuditLogs.tsx, PhishingSyslogDialog.tsx** - Botoes outline:
   - Corrigido: `border-[#242545] text-foreground` → `border-foreground/50 text-foreground`

### Cores da Marca (do manual)

- **Azul (Primary):** `#212146` - textos em fundo claro
- **Uva (Secondary):** `#9D4B97` - destaques e CTAs
- **Grafite:** `#4A4A4C` - textos secundarios
- **Branco:** `#FFFFFF` - fundos e textos em fundo escuro

### Variaveis de Tema CSS

O tema agora usa variaveis CSS que se adaptam ao modo claro/escuro:
- `text-foreground` → claro: `#212146`, escuro: `#F5F5F7`
- `bg-background` → claro: `#FFFFFF`, escuro: `#0F0F1A`
- `text-secondary` → claro: `#9D4B97`, escuro: `#212146`
- etc.

---

## 8. TRADUCOES - STATUS

### Strings Hardcoded Identificadas

Ainda existem muitas strings em Portugues hardcoded no codigo frontend:

| Pagina | Qtd Strings | Exemplos |
|--------|-------------|---------|
| Targets.tsx | ~15 | toast.success('E-mail alvo adicionado!'), etc |
| Tenants.tsx | ~10 | toast.success('Logo salva!'), etc |
| SystemUsers.tsx | ~5 | toast.success('Usuário adicionado!'), etc |
| Integrations.tsx | ~8 | toast.error('Erro ao carregar configurações'), etc |
| Permissions.tsx | **CORRIGIDO** | Agora usa t() |

### Traducoes Adicionadas

Adicionadas chaves em `en.json` e `es.json`:
- `permissions.*` - todas as permissoes
- `toasts.*` - mensagens de toast

### Traducoes Ainda Necessarias

Para completa internacionalizacao, todas as paginas precisam:
1. Usar `t('key')` ao inves de strings hardcoded
2. Adicionar todas as chaves aos arquivos de traducao

---

## 9. ARQUIVOS MODIFICADOS

### Frontend
- `src/app/pages/Campaigns.tsx` - Adicionado adapter, handlers de API
- `src/app/components/NewCampaignDialog.tsx` - Chamada real à API createCampaign
- `src/app/pages/Tenants.tsx` - Adapter para mapear campos Django
- `src/app/pages/Targets.tsx` - Adapter para mapear campos Django
- `src/app/pages/TargetGroups.tsx` - Adapter para mapear campos Django
- `src/app/pages/Templates.tsx` - Corrigido mapeamento de campos
- `src/app/lib/supabaseApi.ts` - Settings e Azure functions atualizados

### Backend
- `backend/matreiro/urls.py` - Adicionados endpoints: tenants_list, tenant_detail, settings_get, settings_update, azure_test_connection, azure_sync_users, azure_sync_groups
7. **Longo prazo:** Integracao de IA para analise de phishing

---

## 8. ARQUIVOS PRINCIPAIS

### Frontend
- `src/app/pages/Campaigns.tsx` - Lista de campanhas
- `src/app/components/NewCampaignDialog.tsx` - Dialog de criacao
- `src/app/pages/Settings.tsx` - Configuracoes do sistema
- `src/app/pages/Integrations.tsx` - Pagina de integracoes
- `src/app/lib/supabaseApi.ts` - Cliente API (substitui Supabase)
- `src/app/lib/apiLocal.ts` - API local (duplicado, verificar)

### Backend
- `backend/matreiro/urls.py` - URL routing da API
- `backend/campaigns/models.py` - Modelos de campanha
- `backend/campaigns/serializers.py` - Serializers
- `backend/core/management/commands/seed_data.py` - Dados de teste
