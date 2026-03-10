# 🛡️ Plataforma Matreiro

**SaaS Multi-Tenant para Simulação de Phishing e Conscientização em Segurança da Informação**

A Plataforma Matreiro é uma solução completa desenvolvida pela Under Protection para treinamento e conscientização de colaboradores através de campanhas simuladas de phishing, módulos educacionais e análise avançada de métricas de segurança.

---

## 📋 Índice

- [Características Principais](#características-principais)
- [Arquitetura do Sistema](#arquitetura-do-sistema)
- [Tecnologias Utilizadas](#tecnologias-utilizadas)
- [Pré-requisitos](#pré-requisitos)
- [Instalação Rápida](#instalação-rápida)
- [Documentação Completa](#documentação-completa)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Licença](#licença)

---

## 🎯 Características Principais

### Multi-Tenancy Completo
- **Hierarquia de Tenants**: Suporte a clientes e sub-clientes
- **Isolamento de Dados**: Cada tenant possui dados completamente isolados
- **RBAC Granular**: Sistema de permissões baseado em roles (SuperAdmin, Admin, Manager, Analyst, User)

### Campanhas de Phishing
- **Engine de Templates**: Sistema avançado de criação e personalização de e-mails
- **Disparo Automatizado**: Agendamento e envio automático de campanhas
- **Tracking em Tempo Real**: Monitoramento de aberturas, cliques e submissões
- **Landing Pages Dinâmicas**: Sistema de páginas falsas integrado ao banco

### Análise e Relatórios
- **Dashboard Analítico**: Métricas em tempo real com gráficos interativos
- **Relatórios Exportáveis**: Geração de relatórios em PDF/Excel
- **Análise de Comportamento**: Identificação de usuários vulneráveis
- **Compliance**: Relatórios específicos para auditorias (LGPD, ISO 27001)

### Módulo de Treinamentos
- **Cursos Interativos**: Sistema completo de e-learning
- **Validação via IA**: Detecção de fraude em provas usando computer vision
- **Certificados Digitais**: Emissão automática após conclusão
- **Gamificação**: Sistema de pontos e rankings

### Integrações Corporativas
- **Azure Active Directory**: Importação automática de usuários e grupos
- **Microsoft 365**: Integração com Exchange/Outlook
- **Single Sign-On**: Autenticação via Keycloak (SAML/OIDC)
- **Webhooks**: Notificações para sistemas externos

### Segurança
- **Impersonation Segura**: SuperAdmins podem visualizar como outros usuários
- **Auditoria Completa**: Log de todas as ações sensíveis
- **Criptografia**: Dados sensíveis criptografados em repouso
- **Rate Limiting**: Proteção contra abusos de API

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Dashboard   │  │  Campaigns   │  │  Training    │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Targets    │  │   Reports    │  │   Settings   │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓ HTTPS/REST
┌─────────────────────────────────────────────────────────────────┐
│                    API GATEWAY (Supabase)                        │
│                    Edge Functions (Hono)                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND (Django/Python)                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Campaign    │  │   Training   │  │    Azure     │          │
│  │   Engine     │  │   Module     │  │  Integration │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Email      │  │  Analytics   │  │     IAM      │          │
│  │   Sender     │  │   Engine     │  │  (Keycloak)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    DATABASES & CACHE                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  PostgreSQL  │  │    Redis     │  │   Supabase   │          │
│  │  (Principal) │  │   (Cache)    │  │   (Edge DB)  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **React 18** - Framework principal
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **React Router** - Navegação
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones

### Backend
- **Django 4.2** - Framework web
- **Django REST Framework** - APIs RESTful
- **Celery** - Processamento assíncrono
- **Python 3.11** - Linguagem principal

### Banco de Dados
- **PostgreSQL 15** - Banco principal
- **Redis 7** - Cache e filas
- **Supabase** - Edge database e storage

### Infraestrutura
- **Docker & Docker Compose** - Containerização
- **Keycloak** - Identity & Access Management
- **Nginx** - Proxy reverso
- **Gunicorn** - WSGI server

### Integrações
- **Azure AD** - Microsoft Active Directory
- **SendGrid/AWS SES** - Envio de e-mails
- **OpenAI API** - Validação via IA

---

## ✅ Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Git** >= 2.30
- **Node.js** >= 18 (para o frontend)
- **Python** >= 3.11 (para desenvolvimento local)

### Verificar Instalação

```bash
docker --version
docker-compose --version
git --version
node --version
python --version
```

---

## 🚀 Instalação Rápida

### 1. Clone o Repositório

```bash
git clone https://github.com/underprotection/plataforma-matreiro.git
cd plataforma-matreiro
```

### 2. Configure as Variáveis de Ambiente

```bash
# Backend
cp backend/.env.example backend/.env

# Frontend
cp .env.example .env
```

**Edite os arquivos `.env` com suas credenciais.**

### 3. Suba os Containers Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

### 4. Execute as Migrações e Seed

```bash
# Entrar no container do Django
docker-compose exec django bash

# Executar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Importar dados iniciais
python manage.py loaddata seed

# Sair do container
exit
```

### 5. Acesse a Aplicação

- **Frontend**: http://localhost:3000
- **Backend Admin**: http://localhost:8000/admin
- **API Docs**: http://localhost:8000/api/docs
- **Keycloak**: http://localhost:8080

---

## 📚 Documentação Completa

A documentação completa está organizada na pasta `/docs`:

| Documento | Descrição |
|-----------|-----------|
| [QUICKSTART.md](/QUICKSTART.md) | Guia de início rápido (5 minutos) |
| [SETUP.md](/docs/SETUP.md) | Instalação detalhada passo a passo |
| [ARCHITECTURE.md](/docs/ARCHITECTURE.md) | Arquitetura e decisões técnicas |
| [DATABASE.md](/docs/DATABASE.md) | Estrutura e modelo do banco de dados |
| [API.md](/docs/API.md) | Documentação completa das APIs |
| [DEPLOYMENT.md](/docs/DEPLOYMENT.md) | Guia de deploy em produção |
| [TROUBLESHOOTING.md](/docs/TROUBLESHOOTING.md) | Resolução de problemas comuns |

### Backend

Documentação específica do backend Django:

```bash
cd backend
cat README.md
```

### Database

Scripts e estrutura do banco de dados:

```bash
cd database
cat README.md
```

---

## 🔐 Variáveis de Ambiente

### Backend (`/backend/.env`)

```env
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=matreiro_db
DB_USER=matreiro_user
DB_PASSWORD=matreiro_password
DB_HOST=postgres
DB_PORT=5432

# Redis
REDIS_URL=redis://redis:6379/0

# Keycloak
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=matreiro
KEYCLOAK_CLIENT_ID=matreiro-backend
KEYCLOAK_CLIENT_SECRET=your-client-secret

# Azure AD
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret
AZURE_TENANT_ID=your-azure-tenant-id

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Security
CORS_ALLOWED_ORIGINS=http://localhost:3000
CSRF_TRUSTED_ORIGINS=http://localhost:3000
```

### Frontend (`/.env`)

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Keycloak
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=matreiro
VITE_KEYCLOAK_CLIENT_ID=matreiro-frontend

# API
VITE_API_BASE_URL=http://localhost:8000/api

# Azure AD (Frontend)
VITE_AZURE_CLIENT_ID=your-azure-client-id
VITE_AZURE_TENANT_ID=your-azure-tenant-id
```

---

## 📁 Estrutura do Projeto

```
plataforma-matreiro/
├── backend/                    # Backend Django
│   ├── matreiro/              # Projeto principal
│   │   ├── settings.py        # Configurações
│   │   ├── urls.py            # URLs principais
│   │   └── asgi.py            # ASGI config
│   ├── api/                   # App principal da API
│   │   ├── models.py          # Modelos do banco
│   │   ├── views.py           # Views/Controllers
│   │   ├── serializers.py     # Serializers DRF
│   │   ├── urls.py            # URLs da API
│   │   └── admin.py           # Django Admin
│   ├── campaigns/             # Módulo de Campanhas
│   ├── training/              # Módulo de Treinamentos
│   ├── integrations/          # Integrações (Azure, etc)
│   ├── Dockerfile             # Dockerfile do Django
│   ├── requirements.txt       # Dependências Python
│   └── README.md              # Docs do backend
│
├── src/                       # Frontend React
│   ├── app/                   # Componentes principais
│   │   ├── App.tsx           # Componente raiz
│   │   ├── routes.ts         # Configuração de rotas
│   │   └── components/       # Componentes reutilizáveis
│   ├── pages/                # Páginas da aplicação
���   │   ├── Dashboard.tsx
│   │   ├── Campaigns.tsx
│   │   ├── Targets.tsx
│   │   └── ...
│   └── styles/               # Estilos globais
│
├── database/                  # Scripts de banco de dados
│   ├── schema.sql            # Schema completo
│   ├── seed.sql              # Dados iniciais
│   └── README.md             # Documentação do DB
│
├── docs/                      # Documentação completa
│   ├── SETUP.md              # Guia de instalação
│   ├── ARCHITECTURE.md       # Arquitetura
│   ├── DATABASE.md           # Modelo de dados
│   ├── API.md                # Documentação da API
│   ├── DEPLOYMENT.md         # Deploy
│   └── TROUBLESHOOTING.md    # Troubleshooting
│
├── supabase/                  # Supabase Edge Functions
│   └── functions/
│       └── server/           # Edge Function principal
│
├── docker-compose.yml         # Orquestração Docker
├── .env.example              # Exemplo de variáveis
├── package.json              # Dependências Node
└── README.md                 # Este arquivo
```

---

## 🎨 Design System

### Cores Oficiais Under Protection

```css
/* Cores Principais */
--navy: #242545;       /* Azul navy - Cor primária */
--purple: #834a8b;     /* Uva/Roxo - Cor secundária */
--graphite: #4a4a4a;   /* Grafite - Cor neutra */

/* Cores de Sistema */
--success: #10b981;    /* Verde - Sucesso */
--warning: #f59e0b;    /* Laranja - Aviso */
--error: #ef4444;      /* Vermelho - Erro */
--info: #3b82f6;       /* Azul - Informação */
```

### Tipografia

- **Fonte Principal**: Montserrat
- **Pesos**: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

---

## 🌍 Multi-idioma

A plataforma suporta 3 idiomas:

- 🇧🇷 **Português (BR)** - Idioma padrão
- 🇺🇸 **Inglês (EN)** - English
- 🇪🇸 **Espanhol (ES)** - Español

Todos os textos são traduzidos através do sistema i18n implementado no frontend.

---

## 🧪 Testes

### Backend

```bash
# Executar todos os testes
docker-compose exec django python manage.py test

# Executar com coverage
docker-compose exec django coverage run --source='.' manage.py test
docker-compose exec django coverage report
```

### Frontend

```bash
# Executar testes
npm test

# Coverage
npm run test:coverage
```

---

## 📦 Build para Produção

### Backend

```bash
docker build -t matreiro-backend:latest ./backend
```

### Frontend

```bash
npm run build
```

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📝 Comandos Úteis

### Docker

```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar todos os serviços
docker-compose down

# Rebuild dos containers
docker-compose up -d --build

# Limpar volumes (CUIDADO: apaga dados!)
docker-compose down -v
```

### Django

```bash
# Entrar no container
docker-compose exec django bash

# Migrações
python manage.py makemigrations
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Shell interativo
python manage.py shell

# Coletar arquivos estáticos
python manage.py collectstatic
```

### Database

```bash
# Backup do banco
docker-compose exec postgres pg_dump -U matreiro_user matreiro_db > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U matreiro_user matreiro_db < backup.sql

# Acessar PostgreSQL
docker-compose exec postgres psql -U matreiro_user -d matreiro_db
```

---

## 🔧 Troubleshooting

### Problema: Containers não sobem

```bash
# Verificar logs
docker-compose logs

# Limpar e rebuild
docker-compose down -v
docker-compose up -d --build
```

### Problema: Erro de conexão com o banco

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps

# Verificar logs do PostgreSQL
docker-compose logs postgres

# Reiniciar o serviço
docker-compose restart postgres
```

### Problema: Erro de permissão

```bash
# Ajustar permissões
sudo chown -R $USER:$USER .
```

Para mais problemas comuns, consulte [TROUBLESHOOTING.md](/docs/TROUBLESHOOTING.md).

---

## 📄 Licença

Este projeto é propriedade da **Under Protection** e está sob licença proprietária.  
Todos os direitos reservados © 2024-2026 Under Protection.

---

## 👥 Equipe

Desenvolvido com ❤️ pela equipe Under Protection:

- **Backend**: Django + Python
- **Frontend**: React + TypeScript
- **DevOps**: Docker + AWS
- **Security**: Pentesting & IAM

---

## 📞 Suporte

Para suporte técnico:

- 📧 Email: suporte@underprotection.com.br
- 🌐 Website: https://underprotection.com.br
- 📚 Docs: https://docs.underprotection.com.br

---

**🛡️ Proteja sua empresa com a Plataforma Matreiro**
