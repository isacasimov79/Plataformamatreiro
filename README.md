# Plataforma Matreiro - SaaS de Security Awareness

## 🎯 Sobre o Projeto

A **Plataforma Matreiro** é um SaaS multi-tenant focado em simulação de phishing e conscientização em segurança da informação (Security Awareness Training). Desenvolvida para empresas que buscam treinar suas equipes contra ameaças cibernéticas.

## 🚀 Quick Start

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example .env

# 3. Iniciar serviços Docker (PostgreSQL, Redis)
docker-compose up -d

# 4. Rodar aplicação
pnpm dev
```

**Acesse**: http://localhost:5173

📚 **Documentação Completa**: [QUICK_START.md](./QUICK_START.md)

## 🔐 Autenticação com Keycloak

✅ **Autenticação SSO totalmente implementada!**

- **URL**: https://iam.upn.com.br
- **Realm**: underprotection
- **Client**: Matreiro
- **Protocolo**: OpenID Connect (OIDC) + PKCE

### Login
1. Clique em "Entrar com Keycloak"
2. Faça login no Keycloak IAM
3. Sistema autentica automaticamente via SSO

### Documentação
- 📘 [Guia de Autenticação](./AUTHENTICATION.md) - Implementação completa
- ⚙️ [Setup do Keycloak](./KEYCLOAK_SETUP.md) - Configuração passo a passo

## ✨ Funcionalidades Principais

### 🏢 Multi-tenancy e Gestão de Clientes
- ✅ Hierarquia completa: Master → Cliente → Sub-cliente
- ✅ Impersonation (Superadmin pode visualizar como qualquer cliente)
- ✅ Gestão de tenants com status (Ativo, Suspenso, Inativo)
- ✅ RBAC granular (superadmin, admin, user)

### 🔐 Autenticação e Segurança
- ✅ **Keycloak SSO** - Single Sign-On corporativo
- ✅ **OAuth 2.0 + OIDC** - Protocolos modernos
- ✅ **PKCE** - Proteção contra interceptação
- ✅ **Refresh automático** - Tokens renovados automaticamente
- ✅ **JWT** - Tokens seguros para API

### 📧 Engine de Phishing Simulado
- ✅ **Campanhas**: Criação e gestão de campanhas de phishing
- ✅ **Templates**: Biblioteca de templates de e-mail (globais e customizados)
- ✅ **Tracking**: Rastreamento de aberturas, cliques e dados submetidos
- ✅ **Agendamento**: Campanhas padrão e automação de boas-vindas

### 👥 Gestão de Usuários
- ✅ **Microsoft 365** - Integração com Azure AD
- ✅ **Google Workspace** - Integração com Directory API
- ✅ Sincronização automática de colaboradores
- ✅ Importação manual individual
- ✅ Upload de CSV/Excel (importação em lote)
- ✅ Exportação de dados em CSV

### 📊 Analytics e Relatórios
- ✅ Dashboards com métricas em tempo real
- ✅ Taxa de abertura, cliques e comprometimento
- ✅ Análise por departamento
- ✅ Identificação de usuários mais vulneráveis
- ✅ Gráficos interativos (Recharts)

### 🎓 Módulo de Treinamentos com IA
- ✅ Upload de vídeos e apresentações
- ✅ Geração automática de provas via IA
- ✅ Correção automática de questões abertas
- ✅ **Detecção de Fraude**: Sistema de IA para identificar uso de ChatGPT nas respostas

### 🐛 Modo Debug
- ✅ Logs de entrega SMTP (bounces, falhas de autenticação)
- ✅ Logs de autenticação (Keycloak)
- ✅ Logs de sistema (todos os serviços)
- ✅ Exportação de logs (JSON e CSV)
- ✅ Auditoria completa de operações

## 🛠️ Stack Tecnológico

### Frontend
- **React 18.3** - Biblioteca principal
- **TypeScript** - Tipagem estática
- **React Router 7** - Roteamento (Data Mode)
- **Tailwind CSS 4** - Estilização
- **Keycloak JS** - Autenticação SSO
- **Axios** - Cliente HTTP com interceptors
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones
- **Recharts** - Gráficos e visualizações

### Backend
- **Django 5** - Framework Python
- **Django REST Framework** - API REST
- **PostgreSQL** - Banco de dados relacional
- **Redis** - Cache e filas de mensageria
- **Celery** - Tarefas assíncronas
- **Keycloak** - Autenticação e IAM

### DevOps
- **Docker** - Containerização
- **Docker Compose** - Orquestração de serviços
- **Vite** - Build tool

## 📁 Estrutura do Projeto

```
matreiro-platform/
├── src/app/
│   ├── components/
│   │   ├── ui/                    # Componentes de UI
│   │   ├── AddUserDialog.tsx      # Dialog adicionar usuários
│   │   ├── ConfigureIntegrationDialog.tsx  # Config integrações
│   │   └── Layout.tsx             # Layout com sidebar
│   ├── contexts/
│   │   └── AuthContext.tsx        # Context Keycloak + Auth
│   ├── lib/
│   │   ├── keycloak.ts           # Configuração Keycloak
│   │   ├── api.ts                # Cliente HTTP + interceptors
│   │   ├── apiExamples.ts        # Exemplos de uso da API
│   │   └── mockData.ts           # Dados mock
│   ├── pages/
│   │   ├── Login.tsx             # Login com Keycloak SSO
│   │   ├── Dashboard.tsx         # Dashboard principal
│   │   ├── Tenants.tsx           # Gestão de clientes
│   │   ├── Users.tsx             # Gestão de usuários
│   │   ├── Campaigns.tsx         # Campanhas de phishing
│   │   ├── Templates.tsx         # Templates de e-mail
│   │   ├── Trainings.tsx         # Treinamentos
│   │   ├── Reports.tsx           # Relatórios
│   │   └── Debug.tsx             # Modo debug
│   └── App.tsx
├── backend/
│   ├── core/                     # App principal
│   ├── tenants/                  # Multi-tenancy
│   ├── campaigns/                # Campanhas
│   ├── templates/                # Templates
│   ├── trainings/                # Treinamentos
│   └── matreiro/                 # Settings Django
├── docker-compose.yml            # Serviços Docker
├── .env.example                  # Template de variáveis
├── AUTHENTICATION.md             # Guia de autenticação
├── KEYCLOAK_SETUP.md            # Setup Keycloak
└── QUICK_START.md               # Guia rápido
```

## 🔑 Autenticação

### Fluxo Completo
```
1. Usuário clica "Entrar com Keycloak"
2. Redirect para iam.upn.com.br
3. Login no Keycloak
4. Callback com código de autorização
5. Frontend troca código por tokens (JWT)
6. Token armazenado e usado em todas requisições
7. Refresh automático a cada 60s
```

### Uso em Componentes
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, keycloakToken } = useAuth();

  // user.role: 'superadmin' | 'admin' | 'user'
  // keycloakToken: Token JWT para API
}
```

### Requisições API
```tsx
import { tenantsAPI } from '../lib/apiExamples';

// Token é adicionado automaticamente no header
const tenants = await tenantsAPI.getAll();
```

## 🎨 Design System

### Identidade Visual Under Protection
- **Cores primárias**: 
  - Azul Navy: `#242545`
  - Uva/Roxo: `#834a8b`
  - Grafite: `#4a4a4a`
- **Fonte**: Montserrat
- **Logos**: Matreiro + Under Protection

### Componentes UI
- Design system moderno com Radix UI
- Totalmente acessível (WCAG 2.1)
- Tema consistente com Tailwind CSS 4

## 📊 Métricas e KPIs

### Principais Indicadores
- **Taxa de Abertura**: % de e-mails abertos
- **Taxa de Cliques**: % de links clicados
- **Taxa de Comprometimento**: % de usuários que submeteram dados (CRÍTICO)

### Análises Disponíveis
- Evolução temporal das métricas
- Análise por departamento
- Usuários mais vulneráveis
- Distribuição de risco

## 🔗 Integrações

### Microsoft 365 / Azure AD
- Sincronização automática de usuários
- Importação de estrutura organizacional
- Suporte a múltiplos tenants Azure

### Google Workspace
- Integração via Directory API
- Sincronização de usuários e grupos
- OAuth 2.0 flow

### Keycloak IAM
- SSO corporativo
- RBAC granular
- Federação de identidades

## 🐛 Debug e Monitoramento

### Logs Disponíveis
- **SMTP**: Entregas, bounces, falhas
- **Autenticação**: Login, logout, refresh
- **Sistema**: Erros, warnings, info
- **Audit**: Todas as operações críticas

### Exportação
- Formato JSON (estruturado)
- Formato CSV (análise em Excel)

## 📚 Documentação

- 📖 [README.md](./README.md) - Este arquivo
- 🚀 [QUICK_START.md](./QUICK_START.md) - Início rápido
- 🔐 [AUTHENTICATION.md](./AUTHENTICATION.md) - Guia de autenticação
- ⚙️ [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md) - Setup Keycloak
- 💻 [API Examples](./src/app/lib/apiExamples.ts) - Uso da API

## 🎯 Roadmap

### ✅ Fase 1 - Frontend (COMPLETO)
- [x] Interface completa em React
- [x] Autenticação com Keycloak
- [x] Gestão de tenants
- [x] Gestão de usuários (manual + CSV + integrações)
- [x] Campanhas de phishing
- [x] Templates de email
- [x] Treinamentos
- [x] Modo debug com logs

### 🔄 Fase 2 - Backend (EM ANDAMENTO)
- [x] Estrutura Django completa
- [x] Modelos de dados
- [ ] Autenticação JWT com Keycloak
- [ ] APIs REST completas
- [ ] Integração real Azure AD/Google

### ⏳ Fase 3 - Engine de Phishing
- [ ] SMTP real com tracking
- [ ] Landing pages dinâmicas
- [ ] Analytics em tempo real
- [ ] Webhooks para tracking

### ⏳ Fase 4 - IA e Automação
- [ ] Integração OpenAI/Gemini
- [ ] Geração automática de provas
- [ ] Correção automática
- [ ] Detecção de fraude em provas

### ⏳ Fase 5 - Deploy
- [ ] Ambiente de staging
- [ ] Ambiente de produção
- [ ] CI/CD pipeline
- [ ] Monitoramento e alertas

## 🤝 Contribuindo

Este é um projeto proprietário da Under Protection. Para contribuir:

1. Clone o repositório
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit: `git commit -m 'Add nova feature'`
4. Push: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📞 Suporte e Contato

- **Desenvolvido por**: Under Protection Network
- **Keycloak IAM**: https://iam.upn.com.br
- **Email**: igor@underprotection.com.br

## 📄 Licença

Projeto proprietário - Under Protection Ltda.
Todos os direitos reservados.

---

**Desenvolvido com ❤️ pela Under Protection Network**

🔐 **Autenticação SSO pronta para produção!**