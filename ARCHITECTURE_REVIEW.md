# 🏗️ REVISÃO ARQUITETURAL - PLATAFORMA MATREIRO

**Data:** 09 de Janeiro de 2026  
**Versão:** 1.0  
**Status:** Proposta de Melhorias

---

## 📊 ANÁLISE DO ESTADO ATUAL

### Stack Tecnológica
- ✅ **Frontend:** React + TypeScript + Tailwind CSS v4 + React Router
- ✅ **Backend:** Supabase Edge Functions (Deno + Hono)
- ✅ **Database:** PostgreSQL (Supabase) + KV Store
- ✅ **Auth:** Keycloak (IAM externo)
- ⚠️ **E-mail:** Não implementado (CRÍTICO)
- ✅ **Integrations:** Microsoft Azure AD (6 endpoints)

### Arquitetura Atual
```
┌─────────────┐
│   React     │
│  Frontend   │
└──────┬──────┘
       │
       ↓ HTTPS
┌──────────────────┐
│ Supabase Edge    │
│  Functions       │
│  (Hono Server)   │
└──────┬───────────┘
       │
       ↓
┌──────────────────┐
│   PostgreSQL     │
│   + KV Store     │
└──────────────────┘
```

---

## 🚨 PONTOS CRÍTICOS IDENTIFICADOS

### 1. **CRÍTICO: Sistema de E-mail Inexistente**
- ❌ Nenhuma infraestrutura de envio de e-mails
- ❌ Core da plataforma (phishing simulation) não funciona
- ❌ Sem tracking de opens/clicks
- ❌ Sem gestão de bounces/complaints

### 2. **Escalabilidade Limitada**
- ⚠️ KV Store é adequado para prototipação, não para produção
- ⚠️ Edge Functions têm limitações de CPU/memória
- ⚠️ Sem sistema de filas para operações pesadas
- ⚠️ Importação Azure AD pode timeout com muitos usuários

### 3. **Dados Mock no Frontend**
- ⚠️ 61 permissões mockadas
- ⚠️ 30 logs de debug mockados
- ⚠️ 8 templates mockados
- ⚠️ Múltiplos componentes com fallback para mock

### 4. **Falta de Observabilidade**
- ❌ Sem logs estruturados
- ❌ Sem métricas de performance
- ❌ Sem tracing distribuído
- ❌ Sem alertas

### 5. **Segurança**
- ⚠️ CORS aberto (`origin: "*"`)
- ⚠️ Sem rate limiting
- ⚠️ Sem validação robusta de inputs
- ⚠️ Secrets hardcoded em alguns locais

---

## 🎯 PROPOSTA: ARQUITETURA DE E-MAIL

### Opção 1: **Postfix + Docker por Cliente** (Isolamento Total)

```
┌─────────────────────────────────────────────────────┐
│                  Control Plane                       │
│         (Supabase Edge Functions)                    │
└─────────────────┬───────────────────────────────────┘
                  │
     ┌────────────┼────────────┐
     │            │            │
     ↓            ↓            ↓
┌─────────┐  ┌─────────┐  ┌─────────┐
│ Postfix │  │ Postfix │  │ Postfix │
│ Tenant A│  │ Tenant B│  │ Tenant C│
│ Docker  │  │ Docker  │  │ Docker  │
└─────────┘  └─────────┘  └─────────┘
     │            │            │
     └────────────┴────────────┘
                  │
                  ↓
          [Internet/SMTP]
```

#### ✅ Vantagens
1. **Isolamento Total:** Cada cliente tem seu próprio servidor SMTP
2. **Customização por Cliente:** IPs dedicados, configurações específicas
3. **Controle Total:** Gestão completa de reputação por tenant
4. **Segurança:** Isolamento de dados e processos
5. **Compliance:** Dados não transitam entre clientes

#### ❌ Desvantagens
1. **Custo Alto:** Um container por cliente (RAM, CPU, IP)
2. **Complexidade Operacional:** Gerenciar N containers
3. **Overhead de Rede:** Múltiplos IPs para warmup
4. **Escalabilidade Limitada:** Difícil escalar além de 50-100 clientes
5. **Manutenção:** Atualizações e patches em todos os containers

#### 💰 Estimativa de Custo (AWS)
- **Pequeno (< 1000 emails/dia):** $15-30/mês por tenant
- **Médio (1000-10000):** $50-80/mês por tenant
- **Grande (> 10000):** $100-200/mês por tenant

---

### Opção 2: **API Gateway + Fila + Pool SMTP** (RECOMENDADO ⭐)

```
┌─────────────────────────────────────────────────────────────┐
│                      Control Plane                           │
│              (Supabase Edge Functions)                       │
└──────────────────────────┬──────────────────────────────────┘
                           │
                           ↓
┌──────────────────────────────────────────────────────────────┐
│                    E-mail Service Layer                       │
│  ┌────────────┐   ┌────────────┐   ┌──────────────┐        │
│  │   API GW   │──→│   Redis    │──→│   Workers    │        │
│  │  (FastAPI) │   │   Queue    │   │  (Python)    │        │
│  └────────────┘   └────────────┘   └──────┬───────┘        │
│                                             │                 │
│  ┌──────────────────────────────────────────┘                │
│  │                                                            │
│  ↓                 SMTP Pool Manager                         │
│  ┌────────────────────────────────────────────────┐         │
│  │  Round-robin entre múltiplos provedores:       │         │
│  │  • Amazon SES (bulk)                           │         │
│  │  • SendGrid (transactional)                    │         │
│  │  • Mailgun (backup)                            │         │
│  │  • SMTP dedicado (high-priority)               │         │
│  └────────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────────┘
                           │
                           ↓
                    [Internet/SMTP]
```

#### ✅ Vantagens
1. **Escalabilidade Infinita:** Fila absorve picos de demanda
2. **Custo-Benefício:** Recursos compartilhados, paga-se por uso
3. **Redundância:** Múltiplos provedores (fallback automático)
4. **Rate Limiting:** Controle fino por tenant/campanha
5. **Priorização:** Fila com prioridades (urgent, normal, bulk)
6. **Observabilidade:** Métricas centralizadas
7. **Manutenção Simples:** Uma stack para todos
8. **Multi-provider:** Usa melhor preço/reputação automaticamente

#### ❌ Desvantagens
1. **Complexidade Inicial:** Mais componentes para configurar
2. **Shared Resources:** Precisa de bom isolamento lógico
3. **Dependência de Terceiros:** Se AWS SES cair, precisa failover
4. **Warmup Compartilhado:** IPs compartilhados entre clientes

#### 💰 Estimativa de Custo (AWS)
- **Infraestrutura Base:** $100-150/mês
  - API Gateway: $20/mês
  - Redis (ElastiCache): $30/mês
  - Workers (EC2 t3.medium): $30/mês
  - Load Balancer: $20/mês
- **E-mails:**
  - Amazon SES: $0.10 por 1000 emails
  - SendGrid: $19.95/mês (100k emails)
- **Total para 100 clientes enviando 50k emails/mês:** ~$250/mês

---

## 🏆 RECOMENDAÇÃO: Opção 2 (API Gateway + Fila)

### Justificativa
1. **ROI Superior:** Custo 10x menor para mesma capacidade
2. **Escalável:** Suporta 1-1000 clientes sem mudança arquitetural
3. **Profissional:** Stack usada por empresas como Mailchimp, Intercom
4. **Flexível:** Adicionar/remover provedores sem código no frontend
5. **SaaS-Ready:** Preparado para crescimento rápido

---

## 🛠️ IMPLEMENTAÇÃO DA ARQUITETURA DE E-MAIL

### Stack Recomendada

```python
# Email Service (Python FastAPI)
# /email-service/main.py

from fastapi import FastAPI, BackgroundTasks, HTTPException
from redis import Redis
from rq import Queue
import boto3  # AWS SES
import sendgrid  # SendGrid
import mailgun  # Mailgun

app = FastAPI()
redis_conn = Redis(host='redis', port=6379)
email_queue = Queue('emails', connection=redis_conn)

# Configuração multi-provider
PROVIDERS = {
    'ses': {
        'client': boto3.client('ses', region_name='us-east-1'),
        'limit': 14,  # emails/second
        'priority': 1
    },
    'sendgrid': {
        'client': sendgrid.SendGridAPIClient(api_key=os.getenv('SENDGRID_API_KEY')),
        'limit': 10,
        'priority': 2
    },
    'mailgun': {
        'client': mailgun.Client(api_key=os.getenv('MAILGUN_API_KEY')),
        'limit': 8,
        'priority': 3
    }
}

@app.post("/v1/campaigns/{campaign_id}/send")
async def send_campaign(
    campaign_id: str,
    targets: List[str],
    template: EmailTemplate,
    tenant_id: str,
    priority: str = "normal"
):
    """
    Enfileira campanha de e-mails
    """
    # Validação de tenant e rate limits
    if not validate_tenant_limits(tenant_id):
        raise HTTPException(429, "Rate limit exceeded for tenant")
    
    # Enfileirar cada e-mail
    for target_email in targets:
        job = email_queue.enqueue(
            send_email_worker,
            args=(campaign_id, target_email, template, tenant_id),
            priority=priority,
            retry=Retry(max=3, interval=60)
        )
        
        # Salvar job_id para tracking
        await save_email_job(campaign_id, target_email, job.id)
    
    return {
        "campaign_id": campaign_id,
        "queued": len(targets),
        "status": "queued"
    }

def send_email_worker(campaign_id, target_email, template, tenant_id):
    """
    Worker que processa o envio
    """
    # Selecionar provider baseado em disponibilidade e rate limits
    provider = select_best_provider(tenant_id)
    
    # Personalizar e-mail
    email_content = personalize_template(template, target_email)
    
    # Adicionar tracking pixels
    email_content = add_tracking(email_content, campaign_id, target_email)
    
    # Enviar
    try:
        result = provider['client'].send(
            from_email=get_tenant_sender(tenant_id),
            to_email=target_email,
            subject=email_content.subject,
            html=email_content.html
        )
        
        # Log success
        log_email_sent(campaign_id, target_email, provider['name'], result)
        
        return {"status": "sent", "provider": provider['name']}
        
    except Exception as e:
        # Fallback para próximo provider
        log_email_error(campaign_id, target_email, provider['name'], str(e))
        return retry_with_fallback(campaign_id, target_email, template, tenant_id)

@app.get("/v1/tracking/open/{campaign_id}/{target_id}")
async def track_open(campaign_id: str, target_id: str):
    """
    Tracking de abertura (pixel transparente)
    """
    await record_event(campaign_id, target_id, 'open')
    return Response(content=TRACKING_PIXEL, media_type="image/gif")

@app.get("/v1/tracking/click/{campaign_id}/{target_id}/{link_id}")
async def track_click(campaign_id: str, target_id: str, link_id: str):
    """
    Tracking de clique (redirect)
    """
    await record_event(campaign_id, target_id, 'click', {'link_id': link_id})
    original_url = await get_original_url(link_id)
    return RedirectResponse(url=original_url)
```

### Docker Compose Setup

```yaml
# docker-compose.yml
version: '3.8'

services:
  # API Gateway
  email-api:
    build: ./email-service
    ports:
      - "8000:8000"
    environment:
      - REDIS_URL=redis://redis:6379
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - SENDGRID_API_KEY=${SENDGRID_API_KEY}
      - MAILGUN_API_KEY=${MAILGUN_API_KEY}
    depends_on:
      - redis
      - postgres
    restart: unless-stopped

  # Redis para filas
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

  # Workers (escalar horizontalmente)
  email-worker:
    build: ./email-service
    command: rq worker emails
    environment:
      - REDIS_URL=redis://redis:6379
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
    depends_on:
      - redis
    restart: unless-stopped
    deploy:
      replicas: 3  # 3 workers para processar fila

  # PostgreSQL para persistência
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: matreiro
      POSTGRES_USER: matreiro
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres-data:/var/lib/postgresql/data
    restart: unless-stopped

  # Monitoring (opcional)
  redis-commander:
    image: rediscommander/redis-commander
    environment:
      - REDIS_HOSTS=local:redis:6379
    ports:
      - "8081:8081"

volumes:
  redis-data:
  postgres-data:
```

---

## 📈 MELHORIAS DE BACKEND

### 1. **Migrar de KV Store para PostgreSQL Real**

**Problema Atual:**
```typescript
// Tudo em KV Store (chave-valor simples)
await kv.set(`tenant:${id}`, tenant);
await kv.set(`campaign:${id}`, campaign);
// Sem relações, sem joins, sem índices
```

**Solução:**
```sql
-- Schema SQL adequado
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    document VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'inactive'))
);

CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_parent ON tenants(parent_id);

CREATE TABLE campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    template_id UUID REFERENCES templates(id),
    status VARCHAR(20) DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    CONSTRAINT valid_campaign_status CHECK (status IN ('draft', 'scheduled', 'running', 'completed', 'paused'))
);

CREATE TABLE campaign_events (
    id BIGSERIAL PRIMARY KEY,
    campaign_id UUID REFERENCES campaigns(id) ON DELETE CASCADE,
    target_email VARCHAR(255) NOT NULL,
    event_type VARCHAR(20) NOT NULL,
    occurred_at TIMESTAMP DEFAULT NOW(),
    metadata JSONB,
    CONSTRAINT valid_event_type CHECK (event_type IN ('sent', 'opened', 'clicked', 'submitted', 'bounced'))
);

-- Índices para performance
CREATE INDEX idx_campaign_events_campaign ON campaign_events(campaign_id);
CREATE INDEX idx_campaign_events_type ON campaign_events(event_type);
CREATE INDEX idx_campaign_events_time ON campaign_events(occurred_at DESC);

-- View materializada para stats
CREATE MATERIALIZED VIEW campaign_stats AS
SELECT 
    campaign_id,
    COUNT(*) FILTER (WHERE event_type = 'sent') as sent,
    COUNT(*) FILTER (WHERE event_type = 'opened') as opened,
    COUNT(*) FILTER (WHERE event_type = 'clicked') as clicked,
    COUNT(*) FILTER (WHERE event_type = 'submitted') as submitted,
    COUNT(DISTINCT target_email) as unique_targets
FROM campaign_events
GROUP BY campaign_id;

CREATE UNIQUE INDEX idx_campaign_stats_id ON campaign_stats(campaign_id);
```

### 2. **Sistema de Permissões Real (RBAC)**

**Implementar em PostgreSQL:**
```sql
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    tenant_id UUID REFERENCES tenants(id),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    codename VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT
);

CREATE TABLE role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id),
    granted_at TIMESTAMP DEFAULT NOW(),
    granted_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id, tenant_id)
);

-- Função para verificar permissão
CREATE OR REPLACE FUNCTION user_has_permission(
    p_user_id UUID,
    p_permission_codename VARCHAR,
    p_tenant_id UUID
) RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN role_permissions rp ON ur.role_id = rp.role_id
        JOIN permissions p ON rp.permission_id = p.id
        WHERE ur.user_id = p_user_id
        AND p.codename = p_permission_codename
        AND (ur.tenant_id = p_tenant_id OR ur.tenant_id IS NULL)
    );
END;
$$ LANGUAGE plpgsql;
```

### 3. **API Rate Limiting e Throttling**

```typescript
// middleware/rateLimiter.ts
import { redis } from './redis';

export async function rateLimiter(
  c: Context,
  next: Next
) {
  const tenantId = c.req.header('X-Tenant-ID');
  const endpoint = c.req.path;
  
  // Chave para rate limit
  const key = `ratelimit:${tenantId}:${endpoint}`;
  
  // Usar Redis sliding window
  const now = Date.now();
  const windowMs = 60000; // 1 minuto
  const maxRequests = 100;
  
  // Adicionar timestamp atual
  await redis.zadd(key, now, `${now}-${Math.random()}`);
  
  // Remover entradas antigas
  await redis.zremrangebyscore(key, 0, now - windowMs);
  
  // Contar requisições na janela
  const count = await redis.zcard(key);
  
  // Expirar chave após janela
  await redis.expire(key, Math.ceil(windowMs / 1000));
  
  if (count > maxRequests) {
    return c.json({
      error: 'Rate limit exceeded',
      limit: maxRequests,
      window: '1 minute',
      retry_after: Math.ceil((windowMs - (now - count[0])) / 1000)
    }, 429);
  }
  
  // Headers informativos
  c.header('X-RateLimit-Limit', maxRequests.toString());
  c.header('X-RateLimit-Remaining', (maxRequests - count).toString());
  c.header('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
  
  await next();
}
```

### 4. **Background Jobs com Bull**

```typescript
// jobs/emailJobs.ts
import Bull from 'bull';

export const emailQueue = new Bull('email-jobs', {
  redis: {
    host: process.env.REDIS_HOST,
    port: 6379,
  },
});

// Job: Enviar campanha
emailQueue.process('send-campaign', async (job) => {
  const { campaignId, targets, templateId } = job.data;
  
  for (const target of targets) {
    // Enfileirar envio individual com delay
    await emailQueue.add(
      'send-single-email',
      { campaignId, target, templateId },
      {
        delay: Math.random() * 5000, // Random delay para parecer humano
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 60000,
        },
      }
    );
  }
  
  job.progress(100);
});

// Job: Enviar e-mail individual
emailQueue.process('send-single-email', async (job) => {
  const { campaignId, target, templateId } = job.data;
  
  // Chamar Email Service
  const response = await fetch('http://email-service:8000/v1/send', {
    method: 'POST',
    body: JSON.stringify({
      campaign_id: campaignId,
      to: target.email,
      template_id: templateId,
      variables: {
        name: target.name,
        department: target.department,
      },
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Failed to send email: ${response.statusText}`);
  }
  
  // Registrar evento
  await recordCampaignEvent(campaignId, target.email, 'sent');
  
  job.progress(100);
});

// Job: Importação Azure AD
emailQueue.process('import-azure-ad', async (job) => {
  const { tenantId, groupId } = job.data;
  
  let page = 0;
  let hasMore = true;
  let totalImported = 0;
  
  while (hasMore) {
    const users = await fetchAzureADUsers(tenantId, groupId, page);
    
    if (users.length === 0) {
      hasMore = false;
      break;
    }
    
    // Salvar batch no banco
    await saveBatchTargets(tenantId, users);
    
    totalImported += users.length;
    job.progress((page * 100) / 10); // Estimativa
    
    page++;
  }
  
  return { imported: totalImported };
});
```

---

## 🎨 MELHORIAS DE FRONTEND

### 1. **Remover Dados Mock**

**Criar hooks customizados para dados reais:**

```typescript
// hooks/useTenants.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useTenants() {
  const queryClient = useQueryClient();
  
  const { data: tenants, isLoading, error } = useQuery({
    queryKey: ['tenants'],
    queryFn: async () => {
      const response = await api.get('/tenants');
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // Cache por 5 minutos
  });
  
  const createTenant = useMutation({
    mutationFn: async (data: CreateTenantDto) => {
      return api.post('/tenants', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenants'] });
      toast.success('Tenant criado com sucesso!');
    },
  });
  
  return {
    tenants,
    isLoading,
    error,
    createTenant: createTenant.mutate,
    isCreating: createTenant.isPending,
  };
}

// Uso no componente
function TenantsPage() {
  const { tenants, isLoading, createTenant } = useTenants();
  
  if (isLoading) return <LoadingSkeleton />;
  
  return (
    <div>
      {tenants?.map(tenant => (
        <TenantCard key={tenant.id} tenant={tenant} />
      ))}
    </div>
  );
}
```

### 2. **Implementar React Query para Cache**

```bash
pnpm add @tanstack/react-query @tanstack/react-query-devtools
```

```typescript
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      cacheTime: 10 * 60 * 1000, // 10 minutos
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
```

### 3. **Optimistic Updates**

```typescript
// hooks/useCampaigns.ts
export function useCampaigns() {
  const queryClient = useQueryClient();
  
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.put(`/campaigns/${id}/status`, { status });
    },
    // Optimistic update
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['campaigns'] });
      
      const previousCampaigns = queryClient.getQueryData(['campaigns']);
      
      queryClient.setQueryData(['campaigns'], (old: Campaign[]) =>
        old.map(c => c.id === id ? { ...c, status } : c)
      );
      
      return { previousCampaigns };
    },
    onError: (err, variables, context) => {
      // Rollback em caso de erro
      queryClient.setQueryData(['campaigns'], context?.previousCampaigns);
      toast.error('Erro ao atualizar campanha');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
    },
  });
  
  return { updateStatus: updateStatus.mutate };
}
```

### 4. **Skeleton Loading States**

```typescript
// components/LoadingSkeleton.tsx
export function CampaignListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-white rounded-lg p-6 animate-pulse">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
          <div className="mt-4 grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((j) => (
              <div key={j} className="h-20 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## 🔒 MELHORIAS DE SEGURANÇA

### 1. **Input Validation com Zod**

```bash
pnpm add zod
```

```typescript
// schemas/tenant.schema.ts
import { z } from 'zod';

export const createTenantSchema = z.object({
  name: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-Z0-9\s]+$/, 'Nome contém caracteres inválidos'),
  
  document: z.string()
    .regex(/^\d{14}$/, 'CNPJ inválido (deve ter 14 dígitos)'),
  
  adminEmail: z.string()
    .email('E-mail inválido')
    .endsWith('@example.com', 'Deve ser e-mail corporativo'),
  
  parentId: z.string().uuid().optional(),
});

// Uso no backend
app.post('/tenants', async (c) => {
  const body = await c.req.json();
  
  try {
    const validated = createTenantSchema.parse(body);
    
    // Criar tenant com dados validados
    const tenant = await createTenant(validated);
    return c.json(tenant, 201);
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return c.json({
        error: 'Validation failed',
        details: error.errors
      }, 400);
    }
    throw error;
  }
});
```

### 2. **CORS Adequado**

```typescript
// Substituir CORS aberto
app.use(
  "/*",
  cors({
    origin: [
      'https://matreiro.underprotection.com.br',
      'https://app.matreiro.io',
      process.env.NODE_ENV === 'development' && 'http://localhost:5173'
    ].filter(Boolean),
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'X-Tenant-ID'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  })
);
```

### 3. **Sanitização de HTML**

```typescript
import DOMPurify from 'dompurify';

// Ao salvar templates
function sanitizeTemplate(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'img', 'div', 'span'],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'style', 'class'],
    ALLOW_DATA_ATTR: false,
  });
}
```

### 4. **Helmet para Headers de Segurança**

```typescript
import helmet from 'helmet';

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.matreiro.io"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
}));
```

---

## 📊 MONITORAMENTO E OBSERVABILIDADE

### 1. **Logging Estruturado (Winston)**

```typescript
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  defaultMeta: { service: 'matreiro-api' },
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
  ],
});

// Em desenvolvimento, log no console
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple(),
  }));
}

// Uso
logger.info('Campaign created', {
  campaignId: campaign.id,
  tenantId: tenant.id,
  targetCount: targets.length,
});

logger.error('Email sending failed', {
  campaignId: campaign.id,
  targetEmail: target.email,
  error: error.message,
  stack: error.stack,
});
```

### 2. **Métricas com Prometheus**

```typescript
import promClient from 'prom-client';

// Registrar métricas padrão
promClient.collectDefaultMetrics();

// Métricas customizadas
const emailsSent = new promClient.Counter({
  name: 'matreiro_emails_sent_total',
  help: 'Total de e-mails enviados',
  labelNames: ['tenant_id', 'campaign_id', 'provider'],
});

const emailsSentDuration = new promClient.Histogram({
  name: 'matreiro_email_send_duration_seconds',
  help: 'Duração do envio de e-mail',
  buckets: [0.1, 0.5, 1, 2, 5, 10],
  labelNames: ['provider', 'status'],
});

const campaignsActive = new promClient.Gauge({
  name: 'matreiro_campaigns_active',
  help: 'Número de campanhas ativas',
  labelNames: ['tenant_id'],
});

// Endpoint de métricas
app.get('/metrics', async (c) => {
  const metrics = await promClient.register.metrics();
  return c.text(metrics);
});
```

### 3. **Distributed Tracing (OpenTelemetry)**

```typescript
import { trace } from '@opentelemetry/api';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';

const provider = new NodeTracerProvider();
provider.addSpanProcessor(
  new BatchSpanProcessor(
    new JaegerExporter({
      endpoint: 'http://jaeger:14268/api/traces',
    })
  )
);
provider.register();

const tracer = trace.getTracer('matreiro-api');

// Uso
async function sendCampaign(campaignId: string) {
  const span = tracer.startSpan('send-campaign');
  span.setAttribute('campaign.id', campaignId);
  
  try {
    // ... lógica de envio
    span.setStatus({ code: SpanStatusCode.OK });
  } catch (error) {
    span.setStatus({
      code: SpanStatusCode.ERROR,
      message: error.message,
    });
    throw error;
  } finally {
    span.end();
  }
}
```

### 4. **Health Checks Robustos**

```typescript
app.get('/make-server-99a65fc7/health', async (c) => {
  const checks = {
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    status: 'healthy',
    checks: {
      database: await checkDatabase(),
      redis: await checkRedis(),
      emailService: await checkEmailService(),
      keycloak: await checkKeycloak(),
    },
  };
  
  const allHealthy = Object.values(checks.checks).every(c => c.status === 'ok');
  
  return c.json(checks, allHealthy ? 200 : 503);
});

async function checkDatabase() {
  try {
    await db.raw('SELECT 1');
    return { status: 'ok', latency: 5 };
  } catch (error) {
    return { status: 'error', message: error.message };
  }
}
```

---

## 🚀 DEVOPS E INFRAESTRUTURA

### 1. **GitHub Actions CI/CD**

```yaml
# .github/workflows/deploy.yml
name: Deploy Matreiro

on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          
      - name: Install dependencies
        run: pnpm install
        
      - name: Lint
        run: pnpm run lint
        
      - name: Type check
        run: pnpm run type-check
        
      - name: Run tests
        run: pnpm run test

  build-frontend:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker image
        run: |
          docker build -t matreiro-frontend:${{ github.sha }} .
          docker tag matreiro-frontend:${{ github.sha }} matreiro-frontend:latest
          
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push matreiro-frontend:${{ github.sha }}
          docker push matreiro-frontend:latest

  deploy-production:
    needs: build-frontend
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to AWS
        uses: aws-actions/aws-codedeploy@v1
        with:
          application-name: matreiro
          deployment-group: production
          s3-bucket: matreiro-deployments
```

### 2. **Infrastructure as Code (Terraform)**

```hcl
# terraform/main.tf
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# ECS Cluster para Email Service
resource "aws_ecs_cluster" "email_service" {
  name = "matreiro-email-service"
  
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

# Redis para filas
resource "aws_elasticache_cluster" "redis" {
  cluster_id           = "matreiro-redis"
  engine               = "redis"
  node_type            = "cache.t3.micro"
  num_cache_nodes      = 1
  parameter_group_name = "default.redis7"
  port                 = 6379
  
  subnet_group_name = aws_elasticache_subnet_group.redis.name
}

# RDS PostgreSQL
resource "aws_db_instance" "postgres" {
  identifier        = "matreiro-db"
  engine            = "postgres"
  engine_version    = "15.4"
  instance_class    = "db.t3.micro"
  allocated_storage = 20
  
  db_name  = "matreiro"
  username = var.db_username
  password = var.db_password
  
  backup_retention_period = 7
  multi_az               = true
  
  tags = {
    Environment = "production"
  }
}

# SES para envio de e-mails
resource "aws_ses_domain_identity" "main" {
  domain = "matreiro.io"
}

resource "aws_ses_domain_dkim" "main" {
  domain = aws_ses_domain_identity.main.domain
}
```

### 3. **Docker Multi-Stage Build**

```dockerfile
# Dockerfile (Frontend)
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

---

## 📅 ROADMAP DE IMPLEMENTAÇÃO

### Fase 1: Fundação (Semanas 1-2) 🟢 URGENTE
- [ ] **Migrar KV Store → PostgreSQL**
  - Criar schema completo
  - Migration scripts
  - Testes de integridade
- [ ] **Implementar Email Service (API Gateway + Redis)**
  - Setup básico FastAPI
  - Integração com Amazon SES
  - Tracking de opens/clicks
- [ ] **Remover dados mock críticos**
  - Templates
  - Campaigns
  - Tenants

### Fase 2: Segurança e Estabilidade (Semanas 3-4) 🟡 IMPORTANTE
- [ ] **RBAC real (permissões no banco)**
- [ ] **Rate limiting (Redis)**
- [ ] **Input validation (Zod)**
- [ ] **CORS adequado**
- [ ] **Logging estruturado**

### Fase 3: Escalabilidade (Semanas 5-6) 🟠 MÉDIO
- [ ] **Background jobs (Bull)**
- [ ] **React Query (cache frontend)**
- [ ] **Optimistic updates**
- [ ] **Skeleton loading states**

### Fase 4: Observabilidade (Semanas 7-8) 🔵 BAIXO
- [ ] **Prometheus + Grafana**
- [ ] **Distributed tracing (Jaeger)**
- [ ] **Alertas (PagerDuty)**
- [ ] **Dashboards de negócio**

### Fase 5: DevOps (Semanas 9-10) 🟣 MELHORIA
- [ ] **CI/CD completo (GitHub Actions)**
- [ ] **Infrastructure as Code (Terraform)**
- [ ] **Blue-Green deployments**
- [ ] **Auto-scaling**

---

## 💰 ESTIMATIVA DE CUSTOS (AWS)

### Infraestrutura Inicial
| Serviço | Configuração | Custo/Mês |
|---------|-------------|-----------|
| **EC2** (Email Service) | t3.medium (2 vCPU, 4GB) | $30 |
| **RDS PostgreSQL** | db.t3.micro (Multi-AZ) | $40 |
| **ElastiCache Redis** | cache.t3.micro | $15 |
| **Application Load Balancer** | - | $20 |
| **S3** (backups, assets) | 100GB | $2 |
| **CloudWatch** (logs, metrics) | 10GB/mês | $5 |
| **Route 53** (DNS) | 1 hosted zone | $1 |
| **Amazon SES** | 50k emails/mês | $5 |
| **Total Base** | - | **~$118/mês** |

### Escala (100 clientes ativos)
| Serviço | Configuração | Custo/Mês |
|---------|-------------|-----------|
| **EC2** (3x workers) | 3x t3.medium | $90 |
| **RDS PostgreSQL** | db.t3.small (Multi-AZ) | $80 |
| **ElastiCache Redis** | cache.t3.small | $30 |
| **Amazon SES** | 500k emails/mês | $50 |
| **CloudFront** (CDN) | 1TB transfer | $85 |
| **Total Escala** | - | **~$453/mês** |

**ROI:**
- Receita estimada (100 clientes × $100/mês): **$10,000/mês**
- Custo infraestrutura: **$453/mês**
- **Margem bruta: ~95%**

---

## 🎯 MÉTRICAS DE SUCESSO

### Performance
- ✅ API response time < 200ms (p95)
- ✅ Email delivery rate > 98%
- ✅ Page load time < 2s
- ✅ Background job processing < 1min (p95)

### Confiabilidade
- ✅ Uptime > 99.9%
- ✅ Zero data loss
- ✅ RTO < 15 minutos
- ✅ RPO < 5 minutos

### Escalabilidade
- ✅ Suportar 1000 tenants simultâneos
- ✅ Processar 100k emails/hora
- ✅ Importar 10k targets em < 5 minutos

---

## ✅ CONCLUSÃO E PRÓXIMOS PASSOS

### Prioridades Imediatas (Próximas 2 semanas)
1. ✅ **Implementar Email Service** (sem isso, a plataforma não funciona)
2. ✅ **Migrar para PostgreSQL** (KV Store não escala)
3. ✅ **Remover dados mock** (profissionalizar a aplicação)

### Arquitetura Recomendada
- ✅ **API Gateway + Redis Queue + Multi-provider SMTP**
- ✅ Custo 10x menor que Postfix por cliente
- ✅ Escalável até 1000+ clientes
- ✅ Redundância e alta disponibilidade

### ROI Esperado
- **Investimento inicial:** ~$10k (desenvolvimento + infra primeiro mês)
- **Breakeven:** 20-30 clientes pagantes
- **Margem:** 95% após escala

---

**Documentado por:** Claude AI  
**Revisado por:** Time de Arquitetura  
**Próxima revisão:** Após Fase 1 (2 semanas)
