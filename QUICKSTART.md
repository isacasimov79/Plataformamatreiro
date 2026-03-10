# ⚡ Quickstart - Plataforma Matreiro

Guia rápido para subir a Plataforma Matreiro em **5 minutos**.

---

## 🎯 Pré-requisitos

Certifique-se de ter instalado:

- ✅ Docker >= 20.10
- ✅ Docker Compose >= 2.0
- ✅ Git >= 2.30

**Verificar**:
```bash
docker --version
docker-compose --version
git --version
```

---

## 🚀 Passo a Passo

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

**⚠️ IMPORTANTE**: Edite os arquivos `.env` com suas credenciais reais.

**Mínimo necessário para rodar localmente**:

**`backend/.env`**:
```env
DEBUG=True
SECRET_KEY=django-insecure-MUDE-ISSO-EM-PRODUCAO
DB_NAME=matreiro_db
DB_USER=matreiro_user
DB_PASSWORD=matreiro_password
DB_HOST=postgres
REDIS_URL=redis://redis:6379/0
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

**`.env` (raiz)**:
```env
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_API_BASE_URL=http://localhost:8000/api
```

### 3. Suba os Containers

```bash
# Subir todos os serviços
docker-compose up -d

# Verificar se subiram
docker-compose ps
```

**Você deve ver**:
```
NAME                    STATUS
matreiro_postgres       Up
matreiro_redis          Up
matreiro_django         Up
matreiro_celery         Up
matreiro_keycloak       Up
matreiro_nginx          Up
```

### 4. Execute as Migrações

```bash
# Entrar no container Django
docker-compose exec django bash

# Executar migrações (cria tabelas)
python manage.py migrate

# Importar dados iniciais (seed)
psql -h postgres -U matreiro_user -d matreiro_db -f /docker-entrypoint-initdb.d/seed.sql

# Criar superusuário (opcional - já tem no seed)
# python manage.py createsuperuser

# Sair
exit
```

**Dados de exemplo criados**:
- 4 Tenants (Under Protection, Acme Corp, etc)
- 7 Usuários com diferentes roles
- 3 Templates de e-mail prontos
- 3 Landing pages
- 2 Campanhas de exemplo
- 3 Cursos de treinamento

### 5. Acesse as Aplicações

| Serviço | URL | Credenciais |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **API** | http://localhost:8000/api | - |
| **Django Admin** | http://localhost:8000/admin | admin / Matreiro2024! |
| **Keycloak** | http://localhost:8080 | admin / admin |
| **Flower (Celery)** | http://localhost:5555 | - |
| **PgAdmin** | http://localhost:5050 | admin@matreiro.com.br / admin |

---

## 🧪 Teste Rápido

### 1. Verificar Health da API

```bash
curl http://localhost:8000/api/health
```

**Resposta esperada**:
```json
{
  "status": "ok",
  "database": "connected",
  "redis": "connected"
}
```

### 2. Listar Campanhas

```bash
curl http://localhost:8000/api/campaigns
```

### 3. Conectar ao Banco

```bash
docker-compose exec postgres psql -U matreiro_user -d matreiro_db

# Verificar tabelas
\dt

# Ver usuários
SELECT email, role FROM users;

# Sair
\q
```

---

## 📦 Instalar Frontend (Opcional)

Se quiser rodar o frontend React localmente (fora do Docker):

```bash
# Instalar dependências
npm install

# Rodar em modo dev
npm run dev

# Acesse: http://localhost:5173
```

---

## 🎨 Login no Sistema

### Usuários de Teste (seed data)

| Email | Senha | Role | Tenant |
|-------|-------|------|--------|
| admin@underprotection.com.br | Matreiro2024! | Super Admin | Under Protection |
| admin@acmecorp.com | Matreiro2024! | Tenant Admin | Acme Corp |
| admin@techstart.com.br | Matreiro2024! | Tenant Admin | TechStart |
| security.manager@acmecorp.com | Matreiro2024! | Manager | Acme Corp |

### Fluxo de Login

1. Acesse http://localhost:3000
2. Clique em "Login"
3. Use um dos emails acima
4. Senha: `Matreiro2024!`
5. Você será redirecionado para o Dashboard

---

## 🔧 Comandos Úteis

### Ver Logs

```bash
# Todos os serviços
docker-compose logs -f

# Django
docker-compose logs -f django

# PostgreSQL
docker-compose logs -f postgres
```

### Reiniciar Serviço

```bash
docker-compose restart django
docker-compose restart postgres
```

### Parar Todos os Serviços

```bash
docker-compose down
```

### Limpar Tudo (CUIDADO!)

```bash
# Remove containers e volumes (apaga dados!)
docker-compose down -v
```

### Rebuild

```bash
# Rebuild todos os containers
docker-compose up -d --build

# Rebuild apenas Django
docker-compose up -d --build django
```

---

## 🐛 Problemas Comuns

### Porta já em uso

**Erro**: `port is already allocated`

**Solução**:
```bash
# Ver processos usando a porta
sudo lsof -i :8000

# Matar processo
sudo kill -9 [PID]

# Ou alterar porta no docker-compose.yml
```

### Containers não sobem

**Solução**:
```bash
# Ver logs
docker-compose logs

# Limpar e rebuild
docker-compose down -v
docker-compose up -d --build
```

### Erro de conexão com banco

**Solução**:
```bash
# Verificar se PostgreSQL está rodando
docker-compose ps postgres

# Reiniciar
docker-compose restart postgres

# Verificar variáveis
cat backend/.env | grep DB_
```

**Mais problemas?** Veja [TROUBLESHOOTING.md](/docs/TROUBLESHOOTING.md)

---

## 📚 Próximos Passos

Agora que você tem o sistema rodando:

1. **Explore a UI**: Navegue pelas páginas
2. **Crie uma Campanha**: Dashboard > Campaigns > New Campaign
3. **Configure Azure AD**: Settings > Integrations > Azure AD
4. **Veja a Documentação Completa**: [/docs](/docs)

### Documentação Importante

- 📖 [README.md](/README.md) - Visão geral completa
- 🏗️ [ARCHITECTURE.md](/docs/ARCHITECTURE.md) - Arquitetura do sistema
- 🗄️ [DATABASE.md](/docs/DATABASE.md) - Estrutura do banco
- 🔌 [API.md](/docs/API.md) - Documentação da API
- 🔧 [TROUBLESHOOTING.md](/docs/TROUBLESHOOTING.md) - Resolução de problemas
- 🚀 [DEPLOYMENT.md](/docs/DEPLOYMENT.md) - Deploy em produção

---

## 🎯 Estrutura do Projeto

```
plataforma-matreiro/
├── backend/              # Django backend
│   ├── matreiro/        # Projeto principal
│   ├── api/             # App da API
│   ├── Dockerfile       # Docker do Django
│   └── requirements.txt # Dependências Python
│
├── src/                 # Frontend React
│   ├── app/            # Componentes
│   └── pages/          # Páginas
│
├── database/            # Scripts SQL
│   ├── schema.sql      # Schema completo
│   └── seed.sql        # Dados iniciais
│
├── docs/                # Documentação
├── nginx/               # Configuração Nginx
├── docker-compose.yml   # Orquestração Docker
└── README.md            # Este arquivo
```

---

## 💡 Dicas

### Desenvolvimento

- Use **Docker** para consistência entre ambientes
- Habilite **DEBUG=True** em desenvolvimento
- Monitore **logs** constantemente
- Use **shell** do Django para testar models

### Produção

- Configure **HTTPS/SSL**
- Use **DEBUG=False**
- Configure **backups automáticos**
- Monitore **performance**
- Configure **rate limiting**

---

## ⚡ Atalhos de Teclado (Frontend)

| Atalho | Ação |
|--------|------|
| `Ctrl + K` | Busca global |
| `Ctrl + /` | Toggle sidebar |
| `Ctrl + .` | Abrir configurações |

---

## 🆘 Precisa de Ajuda?

1. **Verifique a documentação**: [/docs](/docs)
2. **Procure no troubleshooting**: [TROUBLESHOOTING.md](/docs/TROUBLESHOOTING.md)
3. **Verifique os logs**: `docker-compose logs -f`
4. **Entre em contato**: dev@underprotection.com.br

---

## ✅ Checklist de Instalação

- [ ] Docker e Docker Compose instalados
- [ ] Repositório clonado
- [ ] Variáveis de ambiente configuradas (`.env` files)
- [ ] Containers rodando (`docker-compose ps`)
- [ ] Migrações executadas
- [ ] Seed data importado
- [ ] API respondendo (`/api/health`)
- [ ] Frontend acessível
- [ ] Login funcionando

**Tudo OK?** Parabéns! 🎉 Você está pronto para usar a Plataforma Matreiro!

---

**🛡️ Plataforma Matreiro - Under Protection © 2024-2026**

**Tempo estimado**: 5-10 minutos ⏱️