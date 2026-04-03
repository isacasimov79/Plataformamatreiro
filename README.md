# 🛡️ Plataforma Matreiro

**SaaS Multi-Tenant para Simulação de Phishing e Conscientização em Segurança da Informação**

Plataforma completa desenvolvida pela Under Protection para treinamento e conscientização de colaboradores através de campanhas simuladas de phishing, módulos educacionais e análise avançada de métricas de segurança.

> ⚠️ **Esta versão NÃO usa Supabase.** Backend completo em Django com PostgreSQL local via Docker.

---

## 📋 Índice

- [Arquitetura](#arquitetura)
- [Stack Tecnológico](#stack-tecnológico)
- [Quick Start](#quick-start)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Deploy](#deploy)
- [FAQ](#faq)

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        NGINX (Porta 80/443)                  │
│                    Reverse Proxy + Static Files             │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│   React Frontend         │     │   Django Backend        │
│   (Vite + Tailwind)     │     │   (DRF + PostgreSQL)    │
│   Porta 3000 (dev)       │     │   Porta 8000            │
│   Porta 80 (prod)        │     │                         │
└─────────────────────────┘     └─────────────────────────┘
                                               │
                              ┌────────────────┴────────────────┐
                              ▼                                 ▼
                    ┌─────────────────┐             ┌─────────────────┐
                    │   PostgreSQL    │             │     Redis       │
                    │   Porta 5432   │             │   Porta 6379   │
                    │   (Dados)       │             │  (Opcional)    │
                    └─────────────────┘             └─────────────────┘
```

### O que NÃO é Supabase
- ❌ Não usa Supabase Auth
- ❌ Não usa Supabase Database
- ❌ Não usa Supabase Edge Functions
- ✅ Backend Django + PostgreSQL local (Docker)
- ✅ Auth via Keycloak (opcional) ou modo dev

---

## 💻 Stack Tecnológico

### Frontend
- **React 18** + TypeScript
- **Vite** (build tool)
- **Tailwind CSS v4**
- **React Router v7** (hash mode)
- **shadcn/ui** (componentes)
- **Recharts** (gráficos)
- **Lucide** (ícones)

### Backend
- **Django 4.2**
- **Django REST Framework**
- **PostgreSQL 15** (banco local via Docker)
- **Redis 7** (cache, opcional)
- **Celery** (filas, opcional)
- **Keycloak** (autenticação OAuth, opcional)

### Infraestrutura
- **Docker Compose** (orquestração)
- **Nginx** (proxy reverso + static files)
- **Gunicorn** (WSGI server)

---

## 🚀 Quick Start

### Pré-requisitos
- Docker e Docker Compose instalados
- Git
- Porta 80, 443, 5432, 8000 disponíveis

### 1. Clone o repositório
```bash
git clone https://github.com/isacasimov79/Plataformamatreiro.git
cd Plataformamatreiro
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite o .env com suas configurações
```

### 3. Suba os containers
```bash
docker-compose up -d
```

### 4. Aguarde o startup e verifique
```bash
# Backend API
curl http://localhost:8000/api/v1/health/

# Frontend
curl http://localhost/

# Ver logs
docker-compose logs -f
```

### 5. Acesse a plataforma
- **URL:** http://localhost (ou seu IP/domínio)
- **Admin Django:** http://localhost:8000/admin

---

## 📁 Estrutura do Projeto

```
Plataformamatreiro/
├── backend/                 # Django API
│   ├── matreiro/            # Configurações principais
│   ├── campaigns/           # App de campanhas
│   ├── tenants/             # App de clientes/tenants
│   ├── targets/             # App de alvos
│   ├── templates/           # App de templates
│   ├── trainings/           # App de treinamentos
│   ├── api/                 # API endpoints
│   └── requirements.txt     # Dependências Python
├── frontend/                 # React App
│   ├── src/                  # Código fonte
│   │   ├── app/              # Páginas e componentes
│   │   └── styles/           # CSS e tema
│   ├── dist/                 # Build de produção
│   ├── package.json          # Dependências Node
│   └── vite.config.ts        # Configuração Vite
├── nginx.conf                # Configuração Nginx
├── docker-compose.yml        # Orquestração Docker
├── .env.example              # Exemplo de variáveis
└── README.md                 # Este arquivo
```

---

## 🔧 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `SECRET_KEY` | Chave secreta do Django | `generar-uma-chave-unica` |
| `ALLOWED_HOSTS` | Hosts permitidos | `localhost,127.0.0.1,seu-dominio.com` |
| `DB_NAME` | Nome do banco | `matreiro_db` |
| `DB_USER` | Usuário do banco | `matreiro_user` |
| `DB_PASSWORD` | Senha do banco | `senha-forte` |
| `KEYCLOAK_URL` | URL do Keycloak | `https://iam.upn.com.br/auth` |
| `KEYCLOAK_REALM` | Realm do Keycloak | `matreiro` |
| `CORS_ALLOWED_ORIGINS` | Origins permitidos para CORS | `http://localhost:5173` |

---

## 🚢 Deploy

### Desenvolvimento
```bash
# Subir tudo
docker-compose up -d

# Rebuildar backend após mudanças
docker-compose build django
docker-compose up -d django

# Ver logs
docker-compose logs -f django
```

### Produção (VPS/Server)

```bash
# 1. Clone no servidor
git clone https://github.com/isacasimov79/Plataformamatreiro.git /opt/matreiro
cd /opt/matreiro

# 2. Configure .env
cp .env.example .env
nano .env  # Preencha com dados de produção

# 3. Configure Nginx (SSL, domínio)
# Edite nginx.conf com seu domínio

# 4. Suba
docker-compose up -d

# 5. Verifique
curl https://seu-dominio.com/api/v1/health/
```

### Build do Frontend (após mudanças no React)

```bash
cd frontend
npm install
npm run build
# O build vai para dist/ e é servida pelo Nginx automaticamente
```

---

## 🔐 Segurança

### Em Produção
1. ✅ Use HTTPS (configure SSL no Nginx)
2. ✅ Altere o `SECRET_KEY`
3. ✅ Use senhas fortes para o banco
4. ✅ Configure Firewall (apenas portas 80/443)
5. ✅ Ative autenticação Keycloak se necessário
6. ✅ Faça backup regular do banco

### Variáveis Sensíveis
```bash
# NUNCA commite o .env no git!
echo ".env" >> .gitignore
```

---

## ❓ FAQ

### Preciso do Supabase?
**Não.** Esta versão usa PostgreSQL local via Docker. O Supabase foi removido na versão atual.

### Como fazer backup do banco?
```bash
docker exec matreiro_postgres pg_dump -U matreiro_user matreiro_db > backup_$(date +%Y%m%d).sql
```

### Como restaurar um backup?
```bash
cat backup_20260401.sql | docker exec -i matreiro_postgres psql -U matreiro_user matreiro_db
```

### O Redis é obrigatório?
**Não.** O Redis é opcional e pode ser desabilitado se você não precisar de cache ou filas Celery.

### Como ver os logs?
```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f django
docker-compose logs -f postgres
docker-compose logs -f nginx
```

### O frontend não carrega após rebuild?
Faça hard refresh no navegador: `Ctrl+Shift+R`

---

## 📞 Suporte

**Desenvolvido por:** Igor Jeronimo de Moura  
**Empresa:** Under Protection  
**Plataforma:** Matreiro SaaS  

---

**Problemas? Abra uma issue no GitHub.**
