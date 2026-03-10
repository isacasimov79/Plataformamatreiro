# 🚀 Guia Completo de Setup - Plataforma Matreiro

## Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Instalação do Ambiente](#instalação-do-ambiente)
3. [Configuração do Banco de Dados](#configuração-do-banco-de-dados)
4. [Subindo o Django com Docker](#subindo-o-django-com-docker)
5. [Configuração do Keycloak](#configuração-do-keycloak)
6. [Configuração do Supabase](#configuração-do-supabase)
7. [Configuração do Frontend](#configuração-do-frontend)
8. [Verificação Final](#verificação-final)
9. [Troubleshooting](#troubleshooting)

---

## Pré-requisitos

### Software Necessário

| Software | Versão Mínima | Download |
|----------|---------------|----------|
| Docker | 24.0+ | https://www.docker.com/get-started |
| Docker Compose | 2.20+ | Incluído no Docker Desktop |
| Node.js | 20.0+ | https://nodejs.org/ |
| Python | 3.11+ | https://www.python.org/ |
| Git | 2.40+ | https://git-scm.com/ |
| PostgreSQL Client (psql) | 15+ | https://www.postgresql.org/ |

### Verificar Instalações

```bash
# Verificar versões instaladas
docker --version
docker-compose --version
node --version
python --version
git --version
psql --version
```

### Recursos de Sistema Recomendados

- **CPU**: 4 cores (mínimo 2)
- **RAM**: 8GB (mínimo 4GB)
- **Disco**: 20GB de espaço livre
- **SO**: Linux, macOS ou Windows 10/11 com WSL2

---

## Instalação do Ambiente

### 1. Clonar o Repositório

```bash
# Clone o repositório
git clone https://github.com/under-protection/matreiro-platform.git
cd matreiro-platform

# Verificar estrutura
ls -la
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar o arquivo de exemplo
cp .env.example .env

# Editar com seu editor preferido
nano .env
# ou
vim .env
# ou
code .env  # VSCode
```

#### Variáveis Obrigatórias no `.env`

```bash
# ==============================================
# DJANGO CONFIGURATION
# ==============================================
DJANGO_SECRET_KEY=your-super-secret-key-change-this-in-production
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,0.0.0.0
DJANGO_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000

# ==============================================
# DATABASE CONFIGURATION (PostgreSQL)
# ==============================================
DB_ENGINE=django.db.backends.postgresql
DB_NAME=matreiro_db
DB_USER=matreiro_user
DB_PASSWORD=matreiro_password_2026_secure
DB_HOST=postgres
DB_PORT=5432

# PostgreSQL Admin (para inicialização)
POSTGRES_DB=matreiro_db
POSTGRES_USER=matreiro_user
POSTGRES_PASSWORD=matreiro_password_2026_secure

# ==============================================
# REDIS CONFIGURATION
# ==============================================
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_DB=0
REDIS_PASSWORD=redis_password_2026_secure

# ==============================================
# KEYCLOAK CONFIGURATION
# ==============================================
KEYCLOAK_URL=http://localhost:8080
KEYCLOAK_REALM=matreiro
KEYCLOAK_CLIENT_ID=matreiro-backend
KEYCLOAK_CLIENT_SECRET=your-keycloak-client-secret
KEYCLOAK_ADMIN_USER=admin
KEYCLOAK_ADMIN_PASSWORD=admin_password_2026

# ==============================================
# SUPABASE CONFIGURATION
# ==============================================
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_DB_URL=postgresql://postgres:password@db.your-project-id.supabase.co:5432/postgres

# ==============================================
# MICROSOFT AZURE AD INTEGRATION
# ==============================================
AZURE_TENANT_ID=your-azure-tenant-id
AZURE_CLIENT_ID=your-azure-client-id
AZURE_CLIENT_SECRET=your-azure-client-secret

# ==============================================
# EMAIL CONFIGURATION (SMTP)
# ==============================================
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# ==============================================
# FRONTEND CONFIGURATION
# ==============================================
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:8000/api

# ==============================================
# SECURITY
# ==============================================
CSRF_TRUSTED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False

# ==============================================
# MONITORING & LOGGING
# ==============================================
LOG_LEVEL=INFO
SENTRY_DSN=  # Opcional
```

---

## Configuração do Banco de Dados

### 1. Estrutura do Banco de Dados

A Plataforma Matreiro utiliza **PostgreSQL 15** como banco de dados principal. A estrutura está completamente definida em `database/schema.sql`.

#### Tabelas Principais

| Tabela | Descrição | Registros Estimados |
|--------|-----------|---------------------|
| `tenants` | Organizações/Clientes | Centenas |
| `users` | Usuários do sistema | Milhares |
| `campaigns` | Campanhas de phishing | Milhares |
| `targets` | Alvos das campanhas | Milhões |
| `templates` | Templates de e-mail | Centenas |
| `landing_pages` | Landing pages dinâmicas | Centenas |
| `trainings` | Módulos de treinamento | Centenas |
| `results` | Resultados das campanhas | Milhões |
| `azure_integrations` | Configurações Azure AD | Centenas |

### 2. Inicializar o Banco de Dados

O banco de dados será criado automaticamente pelo Docker Compose, mas você precisa aplicar o schema e seed.

```bash
# 1. Verificar se o PostgreSQL está rodando
docker-compose ps postgres

# 2. Aplicar o schema (estrutura das tabelas)
docker-compose exec postgres psql -U matreiro_user -d matreiro_db -f /docker-entrypoint-initdb.d/schema.sql

# Ou, se estiver fora do container:
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < database/schema.sql

# 3. Importar dados iniciais (seed)
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < database/seed.sql

# 4. Verificar tabelas criadas
docker-compose exec postgres psql -U matreiro_user -d matreiro_db -c "\dt"

# 5. Verificar alguns dados
docker-compose exec postgres psql -U matreiro_user -d matreiro_db -c "SELECT * FROM tenants LIMIT 5;"
```

### 3. Backup e Restore

```bash
# Fazer backup completo
docker-compose exec -T postgres pg_dump -U matreiro_user -d matreiro_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Restaurar backup
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < backup_20260310_120000.sql
```

---

## Subindo o Django com Docker

### 1. Estrutura do Backend Django

```
backend/
├── matreiro/                # Django project
│   ├── __init__.py
│   ├── settings.py          # ⚙️ Configurações principais
│   ├── urls.py              # 🔗 Roteamento principal
│   ├── wsgi.py              # 🌐 WSGI application
│   └── asgi.py              # 🌐 ASGI application
├── api/                     # API app
│   ├── __init__.py
│   ├── models.py            # 📊 Modelos do Django
│   ├── views.py             # 👁️ Views da API
│   ├── serializers.py       # 📦 DRF Serializers
│   ├── urls.py              # 🔗 Rotas da API
│   ├── permissions.py       # 🔐 Permissões customizadas
│   └── admin.py             # 🎛️ Django Admin
├── requirements.txt         # 📚 Dependências Python
├── Dockerfile               # 🐳 Container Django
├── manage.py                # 🛠️ Django CLI
└── README.md
```

### 2. Build e Start do Django

```bash
# 1. Build da imagem Django (primeira vez)
docker-compose build django

# 2. Subir todos os serviços
docker-compose up -d

# 3. Verificar logs do Django
docker-compose logs -f django

# 4. Verificar status de todos os serviços
docker-compose ps

# Saída esperada:
# NAME                   STATUS              PORTS
# postgres               Up                  0.0.0.0:5432->5432/tcp
# redis                  Up                  0.0.0.0:6379->6379/tcp
# django                 Up                  0.0.0.0:8000->8000/tcp
# keycloak               Up                  0.0.0.0:8080->8080/tcp
```

### 3. Executar Migrações do Django

```bash
# 1. Criar migrações (se houver mudanças nos models)
docker-compose exec django python manage.py makemigrations

# 2. Aplicar migrações
docker-compose exec django python manage.py migrate

# 3. Verificar migrações aplicadas
docker-compose exec django python manage.py showmigrations

# 4. Criar superusuário Django
docker-compose exec django python manage.py createsuperuser
# Username: admin
# Email: admin@underprotection.com.br
# Password: (digite sua senha segura)
```

### 4. Coletar Arquivos Estáticos

```bash
# Coletar arquivos estáticos (CSS, JS, imagens)
docker-compose exec django python manage.py collectstatic --noinput
```

### 5. Acessar o Django Admin

```bash
# Abra o navegador em:
http://localhost:8000/admin

# Login com o superusuário criado acima
```

### 6. Comandos Úteis do Django

```bash
# Shell interativo do Django
docker-compose exec django python manage.py shell

# Shell do banco de dados
docker-compose exec django python manage.py dbshell

# Criar uma nova app Django
docker-compose exec django python manage.py startapp nova_app

# Executar testes
docker-compose exec django python manage.py test

# Verificar configurações
docker-compose exec django python manage.py check

# Limpar sessões expiradas
docker-compose exec django python manage.py clearsessions
```

---

## Configuração do Keycloak

### 1. Acessar o Keycloak Admin Console

```bash
# URL: http://localhost:8080
# Username: admin
# Password: admin_password_2026 (conforme .env)
```

### 2. Criar Realm "matreiro"

1. No Admin Console, clique em **"Master"** (dropdown superior esquerdo)
2. Clique em **"Create Realm"**
3. Preencha:
   - **Realm name**: `matreiro`
   - **Enabled**: `ON`
4. Clique em **"Create"**

### 3. Criar Client "matreiro-backend"

1. No realm `matreiro`, vá em **Clients** → **Create client**
2. **General Settings**:
   - **Client type**: `OpenID Connect`
   - **Client ID**: `matreiro-backend`
3. **Capability config**:
   - **Client authentication**: `ON`
   - **Authorization**: `ON`
   - **Standard flow**: `ON`
   - **Direct access grants**: `ON`
4. **Login settings**:
   - **Root URL**: `http://localhost:8000`
   - **Valid redirect URIs**: 
     - `http://localhost:8000/*`
     - `http://localhost:3000/*`
   - **Web origins**: `*`
5. Clique em **Save**
6. Vá na aba **Credentials** e copie o **Client Secret**
7. Cole no `.env` na variável `KEYCLOAK_CLIENT_SECRET`

### 4. Criar Client "matreiro-frontend"

Repita o processo acima com:
- **Client ID**: `matreiro-frontend`
- **Client authentication**: `OFF` (public client)

### 5. Criar Roles

1. Vá em **Realm roles** → **Create role**
2. Crie as seguintes roles:
   - `super_admin` - Acesso total ao sistema
   - `tenant_admin` - Administrador de tenant
   - `manager` - Gerente de campanhas
   - `analyst` - Analista (visualização)
   - `user` - Usuário padrão

### 6. Criar Usuário de Teste

1. Vá em **Users** → **Add user**
2. Preencha:
   - **Username**: `teste@underprotection.com.br`
   - **Email**: `teste@underprotection.com.br`
   - **First name**: `Teste`
   - **Last name**: `Under Protection`
   - **Email verified**: `ON`
3. Clique em **Create**
4. Vá na aba **Credentials**
5. Clique em **Set password**
   - **Password**: `Teste@2026`
   - **Temporary**: `OFF`
6. Vá na aba **Role mapping**
7. Clique em **Assign role** e adicione `super_admin`

---

## Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse https://supabase.com
2. Crie uma conta ou faça login
3. Crie um novo projeto:
   - **Organization**: Under Protection
   - **Project name**: matreiro-platform
   - **Database password**: (senha segura)
   - **Region**: South America (São Paulo)

### 2. Obter Credenciais

1. Vá em **Project Settings** → **API**
2. Copie:
   - **Project URL** → `.env` como `SUPABASE_URL`
   - **anon public** key → `.env` como `SUPABASE_ANON_KEY`
   - **service_role** key → `.env` como `SUPABASE_SERVICE_ROLE_KEY`
3. Vá em **Project Settings** → **Database**
4. Copie **Connection string** (URI) → `.env` como `SUPABASE_DB_URL`

### 3. Executar Schema no Supabase

```bash
# Conectar ao Supabase PostgreSQL
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-ID].supabase.co:5432/postgres"

# Ou use o SQL Editor no painel do Supabase
# Cole o conteúdo de database/schema.sql
# Execute
```

### 4. Configurar Storage Buckets

No painel do Supabase:

1. Vá em **Storage** → **Create bucket**
2. Crie os seguintes buckets:
   - `make-99a65fc7-landing-pages` (Private)
   - `make-99a65fc7-templates` (Private)
   - `make-99a65fc7-uploads` (Private)
   - `make-99a65fc7-reports` (Private)

### 5. Deploy Edge Functions

```bash
# Instalar Supabase CLI
npm install -g supabase

# Login
supabase login

# Link ao projeto
supabase link --project-ref [YOUR-PROJECT-ID]

# Deploy Edge Functions
supabase functions deploy make-server-99a65fc7

# Verificar logs
supabase functions logs make-server-99a65fc7
```

---

## Configuração do Frontend

### 1. Instalar Dependências

```bash
cd frontend

# Usando npm
npm install

# Ou usando pnpm (recomendado)
pnpm install
```

### 2. Configurar Variáveis de Ambiente

```bash
# Criar .env.local
cat > .env.local << EOF
VITE_API_URL=http://localhost:8000/api
VITE_SUPABASE_URL=${SUPABASE_URL}
VITE_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
VITE_KEYCLOAK_URL=http://localhost:8080
VITE_KEYCLOAK_REALM=matreiro
VITE_KEYCLOAK_CLIENT_ID=matreiro-frontend
EOF
```

### 3. Iniciar Servidor de Desenvolvimento

```bash
# Development mode
npm run dev

# Ou com pnpm
pnpm dev

# O frontend estará disponível em:
# http://localhost:3000
```

### 4. Build para Produção

```bash
# Build otimizado
npm run build

# Preview do build
npm run preview
```

---

## Verificação Final

### Checklist de Verificação

```bash
# ✅ 1. PostgreSQL está rodando?
docker-compose exec postgres psql -U matreiro_user -d matreiro_db -c "SELECT version();"

# ✅ 2. Redis está respondendo?
docker-compose exec redis redis-cli ping
# Resposta esperada: PONG

# ✅ 3. Django está ativo?
curl http://localhost:8000/api/health
# Resposta esperada: {"status": "ok"}

# ✅ 4. Keycloak está acessível?
curl http://localhost:8080/realms/matreiro
# Resposta esperada: JSON com configurações do realm

# ✅ 5. Frontend está rodando?
curl http://localhost:3000
# Resposta esperada: HTML da aplicação

# ✅ 6. Verificar tabelas no banco
docker-compose exec postgres psql -U matreiro_user -d matreiro_db -c "\dt"
# Deve listar todas as tabelas

# ✅ 7. Verificar dados seed
docker-compose exec postgres psql -U matreiro_user -d matreiro_db -c "SELECT COUNT(*) FROM tenants;"
# Deve retornar quantidade de tenants criados

# ✅ 8. Testar endpoint de API
curl http://localhost:8000/api/tenants/
# Deve retornar lista de tenants (pode exigir autenticação)
```

### Acessos Rápidos

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | (via Keycloak) |
| **Django API** | http://localhost:8000/api | (via token) |
| **Django Admin** | http://localhost:8000/admin | admin / (sua senha) |
| **Keycloak** | http://localhost:8080 | admin / admin_password_2026 |
| **PostgreSQL** | localhost:5432 | matreiro_user / matreiro_password_2026_secure |
| **Redis** | localhost:6379 | (sem senha em dev) |

---

## Troubleshooting

### Problema: Django não conecta ao PostgreSQL

```bash
# Verificar se o PostgreSQL está rodando
docker-compose ps postgres

# Verificar logs do PostgreSQL
docker-compose logs postgres

# Testar conexão manualmente
docker-compose exec django python -c "
from django.db import connection
connection.ensure_connection()
print('✅ Conexão com PostgreSQL OK!')
"

# Se falhar, verificar variáveis no .env:
# DB_HOST=postgres (não localhost!)
# DB_PORT=5432
```

### Problema: Erro de Permissão no PostgreSQL

```bash
# Entrar no container do PostgreSQL
docker-compose exec postgres bash

# Conectar como superusuário
psql -U postgres

# Dar permissões ao usuário
GRANT ALL PRIVILEGES ON DATABASE matreiro_db TO matreiro_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO matreiro_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO matreiro_user;
```

### Problema: Keycloak não inicia

```bash
# Verificar logs
docker-compose logs keycloak

# Se o erro for de banco de dados, recrie o container
docker-compose down keycloak
docker-compose up -d keycloak

# Verificar se a porta 8080 está livre
lsof -i :8080  # Mac/Linux
netstat -ano | findstr :8080  # Windows
```

### Problema: Edge Function retorna 546 (Timeout)

```bash
# Este erro foi corrigido otimizando o processamento em batches
# Verifique se você está usando a versão atualizada do código

# Testar manualmente o endpoint
curl -X DELETE \
  https://[PROJECT-ID].supabase.co/functions/v1/make-server-99a65fc7/targets/tenant/[TENANT-ID] \
  -H "Authorization: Bearer [ANON-KEY]"

# Verificar logs da Edge Function
supabase functions logs make-server-99a65fc7 --tail
```

### Problema: Frontend não carrega

```bash
# Verificar se o processo está rodando
ps aux | grep vite

# Limpar cache do Node
rm -rf node_modules package-lock.json
npm install

# Limpar cache do browser (Ctrl+Shift+R)

# Verificar variáveis de ambiente
cat .env.local
```

### Problema: CORS Error

```bash
# Verificar DJANGO_CORS_ALLOWED_ORIGINS no .env
# Deve incluir: http://localhost:3000

# Adicionar no Django settings.py (já deve estar):
# CORS_ALLOW_CREDENTIALS = True
# CORS_ALLOWED_ORIGINS = os.getenv('DJANGO_CORS_ALLOWED_ORIGINS', '').split(',')

# Reiniciar Django
docker-compose restart django
```

### Problema: Azure AD Integration não funciona

```bash
# 1. Verificar se as credenciais Azure estão corretas no .env
echo $AZURE_TENANT_ID
echo $AZURE_CLIENT_ID

# 2. Testar autenticação Azure manualmente
curl -X POST https://login.microsoftonline.com/[TENANT-ID]/oauth2/v2.0/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=[CLIENT-ID]" \
  -d "client_secret=[CLIENT-SECRET]" \
  -d "scope=https://graph.microsoft.com/.default" \
  -d "grant_type=client_credentials"

# 3. Verificar logs do Django
docker-compose logs -f django | grep -i azure
```

---

## Próximos Passos

Após completar o setup:

1. ✅ Explorar o Django Admin: http://localhost:8000/admin
2. ✅ Fazer login no Frontend: http://localhost:3000
3. ✅ Criar uma campanha de teste
4. ✅ Importar usuários via Azure AD
5. ✅ Configurar templates de e-mail
6. ✅ Explorar os relatórios e analytics
7. ✅ Ler a documentação completa da API: [docs/API.md](API.md)

---

## Recursos Adicionais

- 📚 **Django Documentation**: https://docs.djangoproject.com/
- 📚 **Django Rest Framework**: https://www.django-rest-framework.org/
- 📚 **Keycloak Documentation**: https://www.keycloak.org/documentation
- 📚 **Supabase Documentation**: https://supabase.com/docs
- 📚 **Docker Documentation**: https://docs.docker.com/

---

**Dúvidas?** Abra uma issue ou entre em contato: suporte@underprotection.com.br

**Última atualização:** 10 de Março de 2026
