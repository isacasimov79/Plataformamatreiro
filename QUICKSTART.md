# ⚡ Quick Start - Plataforma Matreiro

Guia rápido para subir a Plataforma Matreiro em **menos de 10 minutos**.

---

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

- ✅ **Docker** 24+ e **Docker Compose** 2.20+
- ✅ **Git** 2.40+

> **Nota**: Node.js e Python NÃO são necessários se você usar Docker!

---

## 🚀 Passos Rápidos

### 1️⃣ Clone o Repositório

```bash
git clone https://github.com/under-protection/matreiro-platform.git
cd matreiro-platform
```

### 2️⃣ Configure as Variáveis de Ambiente

```bash
# Copiar o arquivo de exemplo
cp .env.example .env

# Editar o .env (use seu editor preferido)
nano .env
```

**Variáveis OBRIGATÓRIAS mínimas** (para desenvolvimento local):

```bash
# Django
DJANGO_SECRET_KEY=sua-secret-key-super-secreta-aqui-mude-isso

# Database (já configurado para Docker)
DB_NAME=matreiro_db
DB_USER=matreiro_user
DB_PASSWORD=matreiro_password_2026_secure

# Keycloak
KEYCLOAK_ADMIN_PASSWORD=admin_password_2026

# Supabase (obtenha em https://supabase.com)
SUPABASE_URL=https://seu-projeto.supabase.co
SUPABASE_ANON_KEY=sua-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key-aqui
```

> 💡 **Dica**: Para gerar um Django Secret Key seguro, execute:
> ```bash
> python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"
> ```

### 3️⃣ Suba Todos os Serviços

```bash
# Sobe PostgreSQL, Redis, Django e Keycloak
docker-compose up -d
```

⏳ **Aguarde cerca de 2-3 minutos** para todos os serviços iniciarem completamente.

Verifique o status:
```bash
docker-compose ps
```

Você deve ver todos os serviços com status `Up`.

### 4️⃣ Importe o Schema e Dados Iniciais

```bash
# Importar estrutura do banco de dados
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < database/schema.sql

# Importar dados iniciais (tenants, usuários, campanhas exemplo, etc)
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < database/seed.sql
```

Você verá uma mensagem de sucesso com um resumo dos dados importados.

### 5️⃣ Crie um Superusuário Django

```bash
docker-compose exec django python manage.py createsuperuser
```

Preencha:
- **Username**: `admin`
- **Email**: `admin@underprotection.com.br`
- **Password**: (digite uma senha forte)

### 6️⃣ Configure o Keycloak

**6.1. Acesse o Keycloak Admin Console:**

```
URL: http://localhost:8080
Username: admin
Password: admin_password_2026
```

**6.2. Crie o Realm "matreiro":**

1. Clique no dropdown **"Master"** (canto superior esquerdo)
2. Clique em **"Create Realm"**
3. **Realm name**: `matreiro`
4. Clique em **"Create"**

**6.3. Crie o Client "matreiro-backend":**

1. No realm `matreiro`, vá em **Clients** → **Create client**
2. Preencha:
   - **Client ID**: `matreiro-backend`
   - **Client authentication**: `ON`
3. **Valid redirect URIs**: 
   ```
   http://localhost:8000/*
   http://localhost:3000/*
   ```
4. **Web origins**: `*`
5. Clique em **Save**
6. Vá na aba **Credentials**
7. **Copie o Client Secret** e cole no `.env`:
   ```bash
   KEYCLOAK_CLIENT_SECRET=o-secret-que-voce-copiou
   ```

**6.4. Crie o Client "matreiro-frontend":**

Repita o processo acima com:
- **Client ID**: `matreiro-frontend`
- **Client authentication**: `OFF`

**6.5. Crie um Usuário de Teste:**

1. Vá em **Users** → **Add user**
2. Preencha:
   - **Username**: `teste@underprotection.com.br`
   - **Email**: `teste@underprotection.com.br`
   - **Email verified**: `ON`
3. Clique em **Create**
4. Vá na aba **Credentials** → **Set password**
   - **Password**: `Teste@2026`
   - **Temporary**: `OFF`

### 7️⃣ Reinicie o Django (para carregar o Client Secret)

```bash
docker-compose restart django
```

---

## ✅ Verificação Final

Execute este script de verificação:

```bash
# PostgreSQL
docker-compose exec postgres psql -U matreiro_user -d matreiro_db -c "SELECT COUNT(*) FROM tenants;"

# Redis
docker-compose exec redis redis-cli ping

# Django
curl http://localhost:8000/api/health/

# Keycloak
curl http://localhost:8080/realms/matreiro
```

Se todos os comandos retornarem sucesso, **você está pronto!** 🎉

---

## 🌐 Acessos

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Django API** | http://localhost:8000/api | (via token) |
| **Django Admin** | http://localhost:8000/admin | admin / (sua senha) |
| **API Docs (Swagger)** | http://localhost:8000/api/docs | - |
| **Keycloak Admin** | http://localhost:8080 | admin / admin_password_2026 |
| **PostgreSQL** | localhost:5432 | matreiro_user / matreiro_password_2026_secure |

---

## 🎯 Próximos Passos

### Testar a API

```bash
# Obter token de acesso (via Keycloak)
curl -X POST http://localhost:8080/realms/matreiro/protocol/openid-connect/token \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "client_id=matreiro-backend" \
  -d "client_secret=SEU_CLIENT_SECRET" \
  -d "grant_type=password" \
  -d "username=teste@underprotection.com.br" \
  -d "password=Teste@2026"

# Copie o access_token da resposta

# Listar tenants
curl http://localhost:8000/api/tenants/ \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"

# Listar campanhas
curl http://localhost:8000/api/campaigns/ \
  -H "Authorization: Bearer SEU_ACCESS_TOKEN"
```

### Explorar o Django Admin

1. Acesse http://localhost:8000/admin
2. Login com o superusuário criado
3. Explore as tabelas: Tenants, Users, Campaigns, etc.

### Integrar com Azure AD (Opcional)

1. Registre uma aplicação no Azure Portal
2. Obtenha `AZURE_TENANT_ID`, `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`
3. Adicione ao `.env`
4. Reinicie o Django: `docker-compose restart django`
5. Use os endpoints de Azure AD sync

---

## 📊 Dados de Exemplo Incluídos

O arquivo `seed.sql` já importou:

### Tenants (5)
- **Under Protection** (super admin)
- **Acme Corporation** (cliente exemplo)
- **TechStart Brasil** (cliente exemplo)
- **Global Finance Inc** (cliente exemplo)
- **Acme Corp - Filial Rio** (sub-tenant exemplo)

### Usuários (7)
- 1 Super Admin
- 3 Tenant Admins
- 1 Manager
- 1 Analyst
- 1 Regular User

### Campanhas (3)
- 1 Completada
- 1 Em execução
- 1 Agendada

### Templates de Email (3)
- Microsoft 365 Password Reset
- Payroll Document
- Package Delivery

### Landing Pages (2)
- Microsoft 365 Login
- Payroll Portal

### Treinamentos (4)
- Phishing Awareness 101
- Creating Strong Passwords
- Social Engineering Tactics
- Advanced Email Security (com AI)

---

## 🐛 Troubleshooting Rápido

### Erro: "Connection refused" ao PostgreSQL

```bash
# Verificar se está rodando
docker-compose ps postgres

# Ver logs
docker-compose logs postgres

# Reiniciar
docker-compose restart postgres
```

### Erro: "No module named 'psycopg2'"

```bash
# Rebuild do container Django
docker-compose build django
docker-compose up -d django
```

### Keycloak não inicia

```bash
# Keycloak demora ~1 minuto para iniciar
# Aguarde e verifique os logs
docker-compose logs -f keycloak

# Se necessário, restart
docker-compose restart keycloak
```

### Schema não foi aplicado

```bash
# Reaplique o schema
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < database/schema.sql

# Verifique as tabelas
docker-compose exec postgres psql -U matreiro_user -d matreiro_db -c "\dt"
```

---

## 🛑 Parar os Serviços

```bash
# Parar todos os containers (dados preservados)
docker-compose stop

# Parar e remover containers (dados preservados nos volumes)
docker-compose down

# Remover TUDO incluindo volumes (⚠️ CUIDADO: apaga dados!)
docker-compose down -v
```

---

## 🔄 Reiniciar do Zero

```bash
# Parar e remover tudo
docker-compose down -v

# Recriar volumes e containers
docker-compose up -d

# Reaplicar schema e seed
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < database/schema.sql
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < database/seed.sql
```

---

## 📚 Documentação Completa

Para informações detalhadas, consulte:

- **[README.md](README.md)** - Overview da plataforma
- **[docs/SETUP.md](docs/SETUP.md)** - Guia completo de instalação
- **[docs/API.md](docs/API.md)** - Documentação da API
- **[database/README.md](database/README.md)** - Documentação do banco de dados

---

## 💬 Suporte

Problemas? Abra uma issue ou entre em contato:

📧 **Email**: suporte@underprotection.com.br  
🌐 **Website**: https://underprotection.com.br

---

**Pronto!** 🚀 Você acabou de subir a Plataforma Matreiro completa!

Divirta-se explorando e desenvolvendo! 💜

---

**Última atualização:** 10 de Março de 2026  
**Versão:** 1.0.0
