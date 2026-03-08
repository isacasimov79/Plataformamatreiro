# 🗺️ ROADMAP - O QUE AINDA FALTA NA PLATAFORMA MATREIRO

**Data:** 08/03/2026  
**Status Atual:** 95% Frontend Completo | 73% Backend Completo  
**Cliente:** Under Protection  
**Desenvolvedor:** Igor Moura  

---

## 📊 STATUS GERAL

### ✅ **O QUE ESTÁ 100% PRONTO:**

#### **Frontend (95% Completo):**
- ✅ 14 páginas funcionais
- ✅ Design system completo
- ✅ UI/UX totalmente implementada
- ✅ Mock data para todos os módulos
- ✅ Navegação completa
- ✅ Multi-idioma (PT, EN, ES)
- ✅ Responsivo (Mobile + Desktop)
- ✅ RBAC completo (45+ permissões)
- ✅ Importação avançada CSV/Excel
- ✅ Grupos de alvos hierárquicos
- ✅ Automações de phishing
- ✅ Exportação PDF (com correção oklch)

#### **Infraestrutura:**
- ✅ React + TypeScript + Vite
- ✅ Tailwind CSS v4
- ✅ React Router v7
- ✅ Keycloak configurado
- ✅ i18next multi-idioma
- ✅ Shadcn UI (40+ componentes)
- ✅ Recharts (gráficos)

---

## ❌ **O QUE AINDA FALTA (Priorizado)**

---

## 🔴 **PRIORIDADE ALTA (Crítico para Produção)**

### **1. Backend Real (APIs)**
**Status:** 30% | **Impacto:** 🔴 Crítico

**Faltando:**
- ❌ Substituir todos os mock data por APIs reais
- ❌ Endpoints REST para CRUD de todas entidades
- ❌ Autenticação JWT com Keycloak
- ❌ Autorização RBAC no backend
- ❌ Validação de dados no servidor
- ❌ Tratamento de erros padronizado

**Stack Sugerida:**
```
Node.js + Express + TypeScript
Python + FastAPI (para IA)
PostgreSQL (banco principal)
Redis (cache e filas)
```

**Endpoints Necessários:**
```
/api/v1/auth/*           - Autenticação
/api/v1/tenants/*        - Multi-tenancy
/api/v1/campaigns/*      - Campanhas
/api/v1/templates/*      - Templates
/api/v1/targets/*        - Alvos
/api/v1/target-groups/*  - Grupos de alvos
/api/v1/automations/*    - Automações
/api/v1/trainings/*      - Treinamentos
/api/v1/reports/*        - Relatórios
/api/v1/integrations/*   - Integrações
/api/v1/permissions/*    - RBAC
/api/v1/users/*          - Usuários
```

---

### **2. Tracking de Campanhas em Tempo Real**
**Status:** 20% | **Impacto:** 🔴 Crítico

**Faltando:**
- ❌ Engine de tracking de abertura de emails (pixel tracking)
- ❌ Tracking de cliques em links
- ❌ Tracking de submissão de dados (landing pages)
- ❌ Identificação de quem caiu no phishing
- ❌ Webhook para receber eventos
- ❌ Dashboard em tempo real (WebSocket)

**Componentes:**
```
Pixel transparente 1x1 para tracking de abertura
URL shortener com tracking de cliques
Landing page com captura de dados
Webhook receiver para eventos
WebSocket server para updates em tempo real
```

**Exemplo de Tracking URL:**
```
https://matreiro.com/t/{{campaign_id}}/{{target_id}}/open.gif
https://matreiro.com/t/{{campaign_id}}/{{target_id}}/click?url=...
https://matreiro.com/l/{{campaign_id}}/{{target_id}}
```

---

### **3. Engine de Envio de Emails (SMTP Real)**
**Status:** 15% | **Impacto:** 🔴 Crítico

**Faltando:**
- ❌ Integração com provedores SMTP reais
- ❌ Fila de envio de emails (BullMQ/Celery)
- ❌ Retry automático em falhas
- ❌ Rate limiting por provider
- ❌ Bounce handling
- ❌ Unsubscribe (opt-out)
- ❌ SPF/DKIM/DMARC configuração

**Providers Sugeridos:**
```
SendGrid
Amazon SES
Mailgun
SMTP Customizado
```

**Features:**
```
Fila de prioridade (VIP primeiro)
Throttling (max X emails/hora)
Warmup de IPs (aumentar volume gradualmente)
Rotação de IPs/domínios
Logs detalhados de envio
```

---

### **4. Integrações Reais (Microsoft 365 / Google Workspace)**
**Status:** 30% (UI pronta) | **Impacto:** 🔴 Crítico

**Faltando:**

#### **Microsoft 365:**
- ❌ OAuth 2.0 flow completo
- ❌ Listar usuários do Azure AD
- ❌ Listar grupos de segurança
- ❌ Sincronização automática (24h)
- ❌ Webhook para novos usuários
- ❌ Permissões corretas no Azure

**Scopes Necessários:**
```
User.Read.All
Group.Read.All
Directory.Read.All
```

#### **Google Workspace:**
- ❌ OAuth 2.0 flow completo
- ❌ Google Directory API
- ❌ Listar usuários
- ❌ Listar grupos
- ❌ Sincronização automática
- ❌ Webhook (Push Notifications)

**Scopes Necessários:**
```
https://www.googleapis.com/auth/admin.directory.user.readonly
https://www.googleapis.com/auth/admin.directory.group.readonly
```

---

### **5. Landing Pages Dinâmicas**
**Status:** 60% | **Impacto:** 🟠 Alto

**Faltando:**
- ❌ Editor visual de landing pages
- ❌ Templates pré-prontos de landing pages
- ❌ Captura de credenciais (login falso)
- ❌ Captura de arquivos (upload falso)
- ❌ Customização por template
- ❌ Preview em tempo real
- ❌ Responsive design das landing pages

**Features Necessárias:**
```
Drag & drop editor (GrapeJS ou similar)
Templates: Login Office365, Gmail, Portal RH, etc.
Captura de: username, password, OTP, arquivos
Alert ao usuário após submissão
Tracking de todas interações
```

**Exemplo de Landing Page:**
```html
<!-- Página falsa de login Office365 -->
https://matreiro.com/l/campaign-123/target-456

Form de login → Captura credenciais → Alert "Isto foi um teste!"
```

---

### **6. Sistema de Filas e Jobs**
**Status:** 0% | **Impacto:** 🔴 Crítico

**Faltando:**
- ❌ Fila de envio de campanhas
- ❌ Fila de sincronização de integrações
- ❌ Fila de geração de relatórios
- ❌ Agendamento de jobs (cron)
- ❌ Retry automático
- ❌ Dead letter queue
- ❌ Dashboard de monitoramento

**Stack Sugerida:**
```
Node.js: BullMQ + Redis
Python: Celery + Redis
Monitoring: Bull Board / Flower
```

**Jobs Necessários:**
```
SendCampaignJob - Enviar emails da campanha
SyncIntegrationJob - Sincronizar AD/Google (diário)
ProcessAutomationJob - Verificar triggers de automação
GenerateReportJob - Gerar relatórios pesados
CleanupJob - Limpeza de dados antigos
```

---

## 🟠 **PRIORIDADE MÉDIA (Importante mas não Bloqueante)**

### **7. IA para Detecção de Fraude em Provas**
**Status:** 5% | **Impacto:** 🟠 Alto

**Requisito Original:** Sistema de IA para validar treinamentos e detectar fraude

**Faltando:**
- ❌ Detecção de troca de abas (tab switching)
- ❌ Detecção de copy/paste
- ❌ Análise de tempo de resposta suspeito
- ❌ Comparação de padrões de resposta
- ❌ Score de confiabilidade
- ❌ Webcam monitoring (opcional)
- ❌ Proctoring básico

**Features:**
```
Monitor de foco na janela
Tempo médio por questão
Detecção de respostas idênticas (entre usuários)
ML para detectar padrões anormais
Relatório de suspeitas
```

**Stack Sugerida:**
```
Python + TensorFlow/PyTorch (ML)
JavaScript para monitoring no browser
OpenCV para webcam (opcional)
```

---

### **8. Geração Automática de Certificados**
**Status:** 10% | **Impacto:** 🟡 Médio

**Faltando:**
- ❌ Template de certificado customizável
- ❌ Geração em PDF de alta qualidade
- ❌ Assinatura digital do certificado
- ❌ QR Code para validação
- ❌ Envio automático por email
- ❌ Galeria de certificados do usuário

**Features:**
```
Template com variáveis: {{user_name}}, {{course_name}}, {{date}}
Logos da empresa no certificado
QR Code para validar autenticidade
Download em PDF de alta resolução
Histórico de certificados emitidos
```

---

### **9. Dashboard Avançado com Análises**
**Status:** 70% (básico pronto) | **Impacto:** 🟡 Médio

**Faltando:**
- ❌ Análise por departamento/cargo
- ❌ Ranking de alvos mais vulneráveis
- ❌ Comparativo entre campanhas
- ❌ Evolução temporal
- ❌ Previsões com ML
- ❌ Heatmap de vulnerabilidades
- ❌ Dashboard por grupo de alvos

**Features Avançadas:**
```
Heatmap: Quais departamentos são mais vulneráveis?
Timeline: Evolução do awareness ao longo do tempo
Comparativo: Esta campanha vs média histórica
Previsão: ML para prever taxa de cliques
Ranking: Top 10 usuários mais clicadores
Benchmark: Comparar com outras empresas (anônimo)
```

---

### **10. Sistema de Notificações**
**Status:** 20% (apenas toasts) | **Impacto:** 🟡 Médio

**Faltando:**
- ❌ Centro de notificações (Notification Center)
- ❌ Notificações por email
- ❌ Notificações push (browser)
- ❌ Notificações no Slack/Teams
- ❌ Preferências de notificação por usuário
- ❌ Histórico de notificações

**Tipos de Notificação:**
```
Campanha finalizada
Alvo caiu no phishing
Novo usuário no AD (para automação)
Integração falhou
Relatório pronto
Limite de envios atingido
```

---

### **11. Logs de Auditoria Completos**
**Status:** 0% | **Impacto:** 🟡 Médio

**Faltando:**
- ❌ Página de Logs de Auditoria
- ❌ Tracking de todas ações
- ❌ Quem fez o que, quando
- ❌ Filtros avançados
- ❌ Exportação de logs
- ❌ Retenção configurável

**Eventos para Auditar:**
```
Login/Logout
Criação/edição/exclusão de entidades
Impersonation (quem impersonou quem)
Mudanças em permissões
Envio de campanhas
Importação de dados
Exportação de relatórios
```

**Formato de Log:**
```json
{
  "timestamp": "2026-03-08T14:30:00Z",
  "user_id": "user-123",
  "user_name": "Igor Bedesqui",
  "action": "campaign.created",
  "entity_type": "campaign",
  "entity_id": "campaign-456",
  "changes": { "name": "Campanha de Teste" },
  "ip_address": "192.168.1.1",
  "user_agent": "Chrome 120"
}
```

---

### **12. Configurações de Sistema (Settings)**
**Status:** 0% | **Impacto:** 🟡 Médio

**Faltando:**
- ❌ Página de configurações gerais
- ❌ Configuração de SMTP global
- ❌ Limites de envio por tenant
- ❌ Retenção de dados
- ❌ Modo manutenção
- ❌ Feature flags
- ❌ Webhooks globais

**Configurações Necessárias:**
```
SMTP Padrão (host, porta, credenciais)
Limites: max campanhas/mês, max alvos/campanha
Retenção: excluir dados após X meses
Manutenção: mensagem customizada
Feature Flags: habilitar/desabilitar módulos
Webhooks: URL para eventos globais
Branding: Logo, cores (white-label)
```

---

### **13. Webhooks Funcionais**
**Status:** 20% (UI pronta) | **Impacto:** 🟡 Médio

**Faltando:**
- ❌ Engine de disparo de webhooks
- ❌ Retry em falhas
- ❌ Logs de webhooks
- ❌ Teste de webhook (ping)
- ❌ Assinatura de payloads (HMAC)
- ❌ Filtros de eventos

**Eventos para Webhook:**
```
campaign.started
campaign.completed
target.clicked
target.submitted
training.completed
integration.synced
automation.executed
```

**Formato de Payload:**
```json
{
  "event": "target.clicked",
  "timestamp": "2026-03-08T14:30:00Z",
  "tenant_id": "tenant-123",
  "data": {
    "campaign_id": "campaign-456",
    "target_id": "target-789",
    "target_email": "user@empresa.com",
    "link_clicked": "https://..."
  }
}
```

---

## 🟡 **PRIORIDADE BAIXA (Nice to Have)**

### **14. Campanhas Recorrentes**
**Status:** 0% | **Impacto:** 🟢 Baixo

**Faltando:**
- ❌ Agendar campanhas recorrentes (semanal, mensal)
- ❌ Cron expression para agendamento
- ❌ Rotação de templates
- ❌ Rotação de alvos
- ❌ Pausa/resume de campanhas recorrentes

**Exemplo:**
```
Campanha "Sexta-feira Segura"
Frequência: Toda sexta às 9h
Templates: Rotacionar entre 5 templates
Alvos: Todos os novos usuários do mês
```

---

### **15. 2FA (Two-Factor Authentication)**
**Status:** 0% | **Impacto:** 🟢 Baixo

**Faltando:**
- ❌ Habilitar 2FA para usuários
- ❌ TOTP (Google Authenticator)
- ❌ SMS (opcional)
- ❌ Códigos de backup
- ❌ Forçar 2FA para superadmins

---

### **16. White-label / Personalização de Marca**
**Status:** 0% | **Impacto:** 🟢 Baixo

**Faltando:**
- ❌ Upload de logo customizada por tenant
- ❌ Customização de cores
- ❌ Domínio customizado
- ❌ Emails com branding do tenant
- ❌ Landing pages com branding

---

### **17. API Documentation (Swagger/OpenAPI)**
**Status:** 0% | **Impacto:** 🟢 Baixo

**Faltando:**
- ❌ Documentação Swagger/OpenAPI
- ❌ API Explorer interativo
- ❌ Exemplos de código
- ❌ Rate limits documentados
- ❌ Changelog de versões

---

### **18. Monitoramento e Observabilidade**
**Status:** 0% | **Impacto:** 🟢 Baixo

**Faltando:**
- ❌ Sentry para error tracking
- ❌ Datadog/New Relic para APM
- ❌ Prometheus + Grafana para métricas
- ❌ Logs centralizados (ELK/Loki)
- ❌ Alertas automáticos
- ❌ Health checks

---

### **19. Testes Automatizados**
**Status:** 0% | **Impacto:** 🟢 Baixo

**Faltando:**
- ❌ Testes unitários (Jest/Vitest)
- ❌ Testes de integração
- ❌ Testes E2E (Playwright/Cypress)
- ❌ CI/CD com testes
- ❌ Code coverage > 80%

---

### **20. Performance e Otimizações**
**Status:** 60% | **Impacto:** 🟢 Baixo

**Melhorias Possíveis:**
- ⏳ Code splitting avançado
- ⏳ Lazy loading de componentes
- ⏳ Cache de API responses
- ⏳ Otimização de imagens
- ⏳ Service Worker (PWA)
- ⏳ SSR (Server-Side Rendering)

---

## 📅 **ROADMAP SUGERIDO (Cronograma)**

### **Sprint 1-2 (2 semanas) - Backend Básico**
```
✅ Criar APIs REST básicas
✅ Conectar PostgreSQL
✅ Autenticação JWT
✅ CRUD de entidades principais
```

### **Sprint 3-4 (2 semanas) - Tracking e Envio**
```
✅ Engine de envio de emails (SMTP)
✅ Fila de envio (BullMQ)
✅ Tracking de abertura/clique
✅ Landing pages básicas
```

### **Sprint 5-6 (2 semanas) - Integrações**
```
✅ OAuth Microsoft 365
✅ OAuth Google Workspace
✅ Sincronização de usuários/grupos
✅ Webhooks de novos usuários
```

### **Sprint 7-8 (2 semanas) - Automações e Jobs**
```
✅ Engine de automações
✅ Sistema de filas completo
✅ Jobs de sincronização
✅ Agendamento de campanhas
```

### **Sprint 9-10 (2 semanas) - Features Avançadas**
```
✅ IA para detecção de fraude
✅ Geração de certificados
✅ Logs de auditoria
✅ Notificações avançadas
```

### **Sprint 11-12 (2 semanas) - Polimento**
```
✅ Testes automatizados
✅ Documentação API
✅ Monitoramento
✅ Deploy em produção
```

---

## 📝 **RESUMO EXECUTIVO**

### **✅ O QUE JÁ TEMOS (95% Frontend):**
- Interface completa (14 páginas)
- Design system implementado
- RBAC granular
- Multi-idioma
- Importação avançada
- Grupos hierárquicos
- Automações (UI)
- Exportação PDF/CSV

### **❌ O QUE AINDA FALTA (Prioritário):**

**Crítico (Sem isso não vai para produção):**
1. ❌ Backend real (APIs REST)
2. ❌ Tracking de campanhas
3. ❌ Engine de envio de emails
4. ❌ Integrações M365/Google
5. ❌ Landing pages dinâmicas
6. ❌ Sistema de filas/jobs

**Importante (Pode ir depois):**
7. ⏳ IA detecção de fraude
8. ⏳ Certificados automáticos
9. ⏳ Dashboard avançado
10. ⏳ Sistema de notificações
11. ⏳ Logs de auditoria
12. ⏳ Webhooks funcionais

**Nice to Have (Futuro):**
13. 💡 Campanhas recorrentes
14. 💡 2FA
15. 💡 White-label
16. 💡 API Docs
17. 💡 Monitoring
18. 💡 Testes automatizados

---

## 🎯 **DECISÃO ESTRATÉGICA**

Igor, você tem **2 caminhos**:

### **Opção A: Lançar MVP Rápido (4-6 semanas)**
```
Focar apenas nos 6 itens críticos
Ir para produção com funcionalidades básicas
Iterar baseado em feedback real
```

**Pros:** Validação rápida, revenue mais cedo, feedback real  
**Cons:** Features limitadas, pode perder alguns clientes

### **Opção B: Produto Completo (12-16 semanas)**
```
Implementar tudo (crítico + importante)
Lançar com todas as features prometidas
Posicionamento premium
```

**Pros:** Produto robusto, diferencial competitivo, menos churn  
**Cons:** Demora mais, custo maior, risco de over-engineering

---

## 💬 **RECOMENDAÇÃO**

**Sugestão:** **Opção A (MVP Rápido)**

**Motivo:**
1. Frontend já está 95% pronto
2. Backend pode ser incremental
3. Validar demanda real antes de investir em features complexas
4. Feedback dos primeiros clientes vai guiar roadmap
5. Revenue mais cedo para sustentar desenvolvimento

**Próximos Passos Imediatos:**
1. ✅ Implementar backend básico (2 semanas)
2. ✅ Engine de envio + tracking (2 semanas)
3. ✅ Integrações M365/Google (2 semanas)
4. ✅ Deploy beta para 3-5 clientes piloto
5. ✅ Iterar baseado em feedback

---

**🚀 A plataforma está 95% pronta no frontend, agora é hora de focar no backend crítico para ir para produção!**

---

**Desenvolvido por:** Igor Moura  
**Cliente:** Under Protection  
**Data:** 08/03/2026  
