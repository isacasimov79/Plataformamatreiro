# 🐍 Backend Django - Plataforma Matreiro

Backend da Plataforma Matreiro desenvolvido em Django 4.2 com Python 3.11.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Pré-requisitos](#pré-requisitos)
- [Instalação com Docker](#instalação-com-docker)
- [Instalação Manual](#instalação-manual)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Configuração](#configuração)
- [Migrações e Seed](#migrações-e-seed)
- [Comandos Úteis](#comandos-úteis)
- [APIs Disponíveis](#apis-disponíveis)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Visão Geral

O backend Django é responsável por:

- **Gestão Multi-Tenant**: Isolamento completo de dados por tenant
- **Engine de Campanhas**: Criação, agendamento e disparo de campanhas de phishing
- **Módulo de Treinamentos**: Sistema de e-learning com validação via IA
- **Integrações**: Azure AD, Microsoft 365, SendGrid
- **Analytics**: Processamento de métricas e geração de relatórios
- **Autenticação**: Integração com Keycloak (SSO)

### Tecnologias

- Django 4.2
- Django REST Framework 3.14
- PostgreSQL 15
- Redis 7
- Celery 5.3
- Python 3.11

---

## ✅ Pré-requisitos

### Com Docker (Recomendado)

- Docker >= 20.10
- Docker Compose >= 2.0

### Sem Docker (Desenvolvimento Local)

- Python >= 3.11
- PostgreSQL >= 15
- Redis >= 7
- pip >= 23.0

---

## 🐳 Instalação com Docker

### 1. Clone o Repositório

```bash
git clone https://github.com/underprotection/plataforma-matreiro.git
cd plataforma-matreiro/backend
```

### 2. Configure as Variáveis de Ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas credenciais (veja seção [Configuração](#configuração)).

### 3. Suba os Containers

```bash
# A partir da raiz do projeto
cd ..
docker-compose up -d

# Ou apenas os serviços do backend
docker-compose up -d postgres redis django celery
```

### 4. Execute as Migrações

```bash
# Entrar no container
docker-compose exec django bash

# Executar migrações
python manage.py migrate

# Criar superusuário
python manage.py createsuperuser

# Importar dados iniciais
python manage.py loaddata seed
```

### 5. Verifique a Instalação

```bash
# Verificar logs
docker-compose logs -f django

# Acessar a aplicação
curl http://localhost:8000/api/health
```

**Pronto! O backend está rodando em http://localhost:8000** 🎉

---

## 💻 Instalação Manual

### 1. Instale o Python 3.11

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3.11 python3.11-venv python3-pip

# macOS (Homebrew)
brew install python@3.11

# Windows
# Baixe de https://www.python.org/downloads/
```

### 2. Crie um Ambiente Virtual

```bash
cd backend
python3.11 -m venv venv

# Linux/macOS
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 3. Instale as Dependências

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### 4. Configure o PostgreSQL

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Criar banco e usuário
sudo -u postgres psql

postgres=# CREATE DATABASE matreiro_db;
postgres=# CREATE USER matreiro_user WITH PASSWORD 'matreiro_password';
postgres=# ALTER ROLE matreiro_user SET client_encoding TO 'utf8';
postgres=# ALTER ROLE matreiro_user SET default_transaction_isolation TO 'read committed';
postgres=# ALTER ROLE matreiro_user SET timezone TO 'UTC';
postgres=# GRANT ALL PRIVILEGES ON DATABASE matreiro_db TO matreiro_user;
postgres=# \q
```

### 5. Configure o Redis

```bash
# Instalar Redis
sudo apt install redis-server

# Iniciar Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verificar
redis-cli ping
# Deve retornar: PONG
```

### 6. Configure as Variáveis de Ambiente

```bash
cp .env.example .env
nano .env
```

### 7. Execute as Migrações

```bash
python manage.py migrate
python manage.py createsuperuser
```

### 8. Importe os Dados Iniciais

```bash
# Importar schema SQL (se necessário)
psql -U matreiro_user -d matreiro_db -f ../database/schema.sql

# Importar seed data
psql -U matreiro_user -d matreiro_db -f ../database/seed.sql

# Ou usar fixtures Django
python manage.py loaddata seed
```

### 9. Inicie o Servidor

```bash
# Desenvolvimento
python manage.py runserver 0.0.0.0:8000

# Produção (com Gunicorn)
gunicorn matreiro.wsgi:application --bind 0.0.0.0:8000 --workers 4
```

### 10. Inicie o Celery (em outro terminal)

```bash
# Worker
celery -A matreiro worker -l info

# Beat (agendador)
celery -A matreiro beat -l info
```

---

## 📁 Estrutura do Projeto

```
backend/
├── matreiro/                   # Projeto Django principal
│   ├── __init__.py
│   ├── settings.py            # Configurações globais
│   ├── urls.py                # URLs principais
│   ├── wsgi.py                # WSGI config
│   ├── asgi.py                # ASGI config
│   └── celery.py              # Configuração Celery
│
├── api/                       # App principal da API
│   ├── migrations/            # Migrações do banco
│   ├── __init__.py
│   ├── models.py              # Modelos de dados
│   ├── views.py               # Views/Controllers
│   ├── serializers.py         # Serializers DRF
│   ├── urls.py                # URLs da API
│   ├── admin.py               # Django Admin
│   ├── apps.py                # Config do app
│   ├── exceptions.py          # Exceções customizadas
│   ├── permissions.py         # Permissões RBAC
│   ├── filters.py             # Filtros de queries
│   └── tests.py               # Testes unitários
│
├── campaigns/                 # Módulo de Campanhas
│   ├── models.py              # Campaign, Template, Email
│   ├── views.py               # APIs de campanhas
│   ├── serializers.py         # Serializers de campanhas
│   ├── tasks.py               # Tarefas Celery (envio)
│   └── utils.py               # Utilitários
│
├── training/                  # Módulo de Treinamentos
│   ├── models.py              # Course, Lesson, Quiz
│   ├── views.py               # APIs de treinamentos
│   ├── serializers.py         # Serializers de training
│   ├── ai_validator.py        # Validação via IA
│   └── certificate.py         # Geração de certificados
│
├── integrations/              # Integrações Externas
│   ├── azure_ad.py            # Azure Active Directory
│   ├── microsoft365.py        # Microsoft 365
│   ├── sendgrid.py            # SendGrid (e-mail)
│   └── keycloak.py            # Keycloak (SSO)
│
├── analytics/                 # Módulo de Analytics
│   ├── models.py              # Event, Metric
│   ├── views.py               # APIs de analytics
│   ├── aggregators.py         # Agregação de dados
│   └── exporters.py           # Exportação de relatórios
│
├── core/                      # Utilitários Core
│   ├── middleware.py          # Middlewares customizados
│   ├── authentication.py      # Auth customizada
│   ├── pagination.py          # Paginação
│   └── utils.py               # Funções auxiliares
│
├── static/                    # Arquivos estáticos
├── media/                     # Uploads de usuários
├── templates/                 # Templates Django
│
├── Dockerfile                 # Dockerfile
├── docker-compose.yml         # Docker Compose (se local)
├── requirements.txt           # Dependências Python
├── .env.example               # Exemplo de variáveis
├── manage.py                  # CLI do Django
└── README.md                  # Este arquivo
```

---

## ⚙️ Configuração

### Arquivo `.env`

Crie o arquivo `.env` na pasta `backend/`:

```env
# ==============================================
# DJANGO SETTINGS
# ==============================================
DEBUG=True
SECRET_KEY=django-insecure-change-this-in-production-!@#$%^&*
ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://localhost:5173

# ==============================================
# DATABASE (PostgreSQL)
# ==============================================
DB_ENGINE=django.db.backends.postgresql
DB_NAME=matreiro_db
DB_USER=matreiro_user
DB_PASSWORD=matreiro_password
DB_HOST=postgres
DB_PORT=5432

# Se estiver rodando localmente sem Docker:
# DB_HOST=localhost

# ==============================================
# REDIS
# ==============================================
REDIS_URL=redis://redis:6379/0

# Se estiver rodando localmente sem Docker:
# REDIS_URL=redis://localhost:6379/0

# ==============================================
# CELERY
# ==============================================
CELERY_BROKER_URL=redis://redis:6379/0
CELERY_RESULT_BACKEND=redis://redis:6379/0
CELERY_ACCEPT_CONTENT=application/json
CELERY_TASK_SERIALIZER=json
CELERY_RESULT_SERIALIZER=json
CELERY_TIMEZONE=America/Sao_Paulo

# ==============================================
# KEYCLOAK (SSO)
# ==============================================
KEYCLOAK_URL=http://keycloak:8080
KEYCLOAK_REALM=matreiro
KEYCLOAK_CLIENT_ID=matreiro-backend
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret-here
KEYCLOAK_ADMIN_USERNAME=admin
KEYCLOAK_ADMIN_PASSWORD=admin

# ==============================================
# AZURE ACTIVE DIRECTORY
# ==============================================
AZURE_CLIENT_ID=your-azure-app-client-id
AZURE_CLIENT_SECRET=your-azure-app-client-secret
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_REDIRECT_URI=http://localhost:8000/api/azure/callback
AZURE_GRAPH_API_ENDPOINT=https://graph.microsoft.com/v1.0

# ==============================================
# EMAIL (SendGrid)
# ==============================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=apikey
EMAIL_HOST_PASSWORD=your-sendgrid-api-key-here
DEFAULT_FROM_EMAIL=noreply@matreiro.com.br

# Alternativa: AWS SES
# EMAIL_BACKEND=django_ses.SESBackend
# AWS_ACCESS_KEY_ID=your-aws-access-key
# AWS_SECRET_ACCESS_KEY=your-aws-secret-key
# AWS_SES_REGION_NAME=us-east-1

# ==============================================
# SUPABASE
# ==============================================
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_KEY=your-supabase-service-role-key

# ==============================================
# OPENAI (Para validação via IA)
# ==============================================
OPENAI_API_KEY=sk-your-openai-api-key-here
OPENAI_MODEL=gpt-4o

# ==============================================
# SECURITY
# ==============================================
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False

# Em produção, altere para True:
# SECURE_SSL_REDIRECT=True
# SESSION_COOKIE_SECURE=True
# CSRF_COOKIE_SECURE=True

# ==============================================
# STORAGE (Para uploads)
# ==============================================
# Local (desenvolvimento)
STORAGE_TYPE=local
MEDIA_ROOT=/app/media

# AWS S3 (produção)
# STORAGE_TYPE=s3
# AWS_STORAGE_BUCKET_NAME=matreiro-uploads
# AWS_S3_REGION_NAME=us-east-1

# ==============================================
# LOGGING
# ==============================================
LOG_LEVEL=INFO
LOG_FILE=/var/log/matreiro/django.log

# ==============================================
# MULTI-TENANT
# ==============================================
DEFAULT_TENANT_ID=1
ENABLE_TENANT_ISOLATION=True

# ==============================================
# RATE LIMITING
# ==============================================
RATE_LIMIT_ENABLED=True
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_PERIOD=3600

# ==============================================
# MISC
# ==============================================
LANGUAGE_CODE=pt-br
TIME_ZONE=America/Sao_Paulo
USE_TZ=True
```

---

## 🗄️ Migrações e Seed

### Criar Migrações

```bash
# Gerar arquivos de migração
python manage.py makemigrations

# Aplicar migrações
python manage.py migrate

# Ver migrações aplicadas
python manage.py showmigrations
```

### Importar Schema SQL

Se você tem um arquivo `schema.sql` completo:

```bash
# Via container Docker
docker-compose exec postgres psql -U matreiro_user -d matreiro_db -f /docker-entrypoint-initdb.d/schema.sql

# Localmente
psql -U matreiro_user -d matreiro_db -f ../database/schema.sql
```

### Importar Dados Iniciais (Seed)

```bash
# Via SQL
docker-compose exec postgres psql -U matreiro_user -d matreiro_db -f /docker-entrypoint-initdb.d/seed.sql

# Ou via fixtures Django
python manage.py loaddata seed
```

### O que o Seed Inclui

O arquivo `seed.sql` contém:

1. **Tenant Padrão** (Under Protection)
2. **Usuários de Teste** (SuperAdmin, Admin, Manager, etc)
3. **Roles e Permissões** (RBAC)
4. **Templates de E-mail** (5 templates prontos)
5. **Landing Pages** (3 páginas de exemplo)
6. **Campanhas de Exemplo** (2 campanhas)
7. **Cursos de Treinamento** (3 cursos)
8. **Configurações de Integração** (Azure AD)

---

## 🛠️ Comandos Úteis

### Django Management

```bash
# Criar superusuário
python manage.py createsuperuser

# Shell interativo
python manage.py shell

# Shell com IPython
python manage.py shell -i ipython

# Verificar problemas
python manage.py check

# Coletar arquivos estáticos
python manage.py collectstatic --no-input

# Limpar sessões expiradas
python manage.py clearsessions
```

### Banco de Dados

```bash
# Executar SQL direto
python manage.py dbshell

# Dump do banco
python manage.py dumpdata > backup.json

# Carregar dump
python manage.py loaddata backup.json

# Resetar banco (CUIDADO!)
python manage.py flush
```

### Celery

```bash
# Worker (processar tarefas)
celery -A matreiro worker -l info

# Beat (agendador)
celery -A matreiro beat -l info

# Flower (monitor web)
celery -A matreiro flower

# Ver tarefas agendadas
celery -A matreiro inspect scheduled

# Purgar todas as tarefas
celery -A matreiro purge
```

### Testes

```bash
# Executar todos os testes
python manage.py test

# Testar app específico
python manage.py test api

# Com coverage
coverage run --source='.' manage.py test
coverage report
coverage html
```

### Docker

```bash
# Entrar no container
docker-compose exec django bash

# Ver logs
docker-compose logs -f django

# Reiniciar serviço
docker-compose restart django

# Rebuild
docker-compose up -d --build django
```

---

## 🔌 APIs Disponíveis

### Base URL

- **Desenvolvimento**: http://localhost:8000/api
- **Produção**: https://api.matreiro.com.br/api

### Autenticação

Todas as APIs requerem autenticação via Bearer Token (Keycloak):

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/campaigns
```

### Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/health` | Health check |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/logout` | Logout |
| GET | `/api/tenants` | Listar tenants |
| POST | `/api/tenants` | Criar tenant |
| GET | `/api/campaigns` | Listar campanhas |
| POST | `/api/campaigns` | Criar campanha |
| GET | `/api/targets` | Listar alvos |
| POST | `/api/targets/import` | Importar alvos (CSV) |
| DELETE | `/api/targets/tenant/:id` | Limpar alvos por tenant |
| GET | `/api/templates` | Listar templates de e-mail |
| POST | `/api/templates` | Criar template |
| GET | `/api/landing-pages` | Listar landing pages |
| POST | `/api/landing-pages` | Criar landing page |
| GET | `/api/trainings` | Listar treinamentos |
| POST | `/api/trainings` | Criar treinamento |
| GET | `/api/analytics/dashboard` | Dados do dashboard |
| GET | `/api/analytics/reports` | Relatórios |
| POST | `/api/azure/sync-users` | Sincronizar usuários Azure AD |
| POST | `/api/azure/sync-groups` | Sincronizar grupos Azure AD |

**Documentação completa**: Veja [/docs/API.md](/docs/API.md)

---

## 🔍 Troubleshooting

### Erro: `django.db.utils.OperationalError: could not connect to server`

**Solução**:

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres

# Verificar variáveis de ambiente
cat .env | grep DB_
```

### Erro: `redis.exceptions.ConnectionError: Error 111 connecting to redis:6379`

**Solução**:

```bash
# Verificar se o Redis está rodando
docker-compose ps redis

# Reiniciar
docker-compose restart redis

# Testar conexão
docker-compose exec redis redis-cli ping
```

### Erro: `ModuleNotFoundError: No module named 'X'`

**Solução**:

```bash
# Reinstalar dependências
pip install -r requirements.txt

# Ou rebuild do container
docker-compose up -d --build django
```

### Erro: `django.core.exceptions.ImproperlyConfigured: The SECRET_KEY setting must not be empty`

**Solução**:

```bash
# Verificar arquivo .env
cat .env | grep SECRET_KEY

# Gerar nova SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Adicionar ao .env
echo "SECRET_KEY=nova-secret-key-aqui" >> .env
```

### Erro: `django.db.migrations.exceptions.InconsistentMigrationHistory`

**Solução**:

```bash
# Resetar migrações (CUIDADO: apaga dados!)
python manage.py migrate --fake-initial

# Ou limpar banco e refazer
docker-compose down -v
docker-compose up -d
python manage.py migrate
```

### Performance: Queries lentas

**Solução**:

```bash
# Habilitar debug toolbar (desenvolvimento)
pip install django-debug-toolbar

# Criar índices no banco
python manage.py makemigrations
python manage.py migrate

# Monitorar queries
docker-compose exec postgres psql -U matreiro_user -d matreiro_db
postgres=# SELECT * FROM pg_stat_activity;
```

### Container não sobe

**Solução**:

```bash
# Limpar containers e volumes
docker-compose down -v

# Rebuild completo
docker-compose build --no-cache

# Subir novamente
docker-compose up -d

# Verificar logs
docker-compose logs -f
```

---

## 📊 Monitoramento

### Logs

```bash
# Django logs
docker-compose logs -f django

# PostgreSQL logs
docker-compose logs -f postgres

# Redis logs
docker-compose logs -f redis

# Celery logs
docker-compose logs -f celery
```

### Métricas

- **Django Admin**: http://localhost:8000/admin
- **Celery Flower**: http://localhost:5555
- **Redis Commander**: http://localhost:8081

---

## 🚀 Deploy em Produção

### Pré-Deploy Checklist

- [ ] `DEBUG=False`
- [ ] `SECRET_KEY` forte e única
- [ ] `ALLOWED_HOSTS` configurado
- [ ] `SECURE_SSL_REDIRECT=True`
- [ ] Banco de dados backup configurado
- [ ] Variáveis de ambiente seguras
- [ ] Logs configurados
- [ ] Monitoramento ativo
- [ ] HTTPS configurado
- [ ] Firewall configurado

### Build para Produção

```bash
# Build da imagem
docker build -t matreiro-backend:v1.0.0 .

# Tag para registry
docker tag matreiro-backend:v1.0.0 registry.example.com/matreiro-backend:v1.0.0

# Push para registry
docker push registry.example.com/matreiro-backend:v1.0.0
```

**Guia completo**: Veja [/docs/DEPLOYMENT.md](/docs/DEPLOYMENT.md)

---

## 📝 Notas Importantes

1. **NUNCA commite o arquivo `.env`** - Ele contém credenciais sensíveis
2. **Use `.env.example`** como template e crie seu próprio `.env`
3. **Em produção**: Use `DEBUG=False` e variáveis seguras
4. **Backups**: Configure backups automáticos do PostgreSQL
5. **Logs**: Monitore os logs regularmente
6. **Updates**: Mantenha as dependências atualizadas

---

## 📞 Suporte

Para suporte técnico:

- 📧 Email: dev@underprotection.com.br
- 📚 Docs: [/docs](/docs)
- 🐛 Issues: GitHub Issues

---

**Desenvolvido com ❤️ pela equipe Under Protection**
