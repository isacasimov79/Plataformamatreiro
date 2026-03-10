# 🔧 Troubleshooting - Plataforma Matreiro

Guia completo de resolução de problemas comuns.

---

## 📋 Índice

- [Problemas de Instalação](#problemas-de-instalação)
- [Problemas com Docker](#problemas-com-docker)
- [Problemas com Banco de Dados](#problemas-com-banco-de-dados)
- [Problemas com Backend](#problemas-com-backend)
- [Problemas com Frontend](#problemas-com-frontend)
- [Problemas com Autenticação](#problemas-com-autenticação)
- [Problemas com Integrações](#problemas-com-integrações)
- [Problemas de Performance](#problemas-de-performance)
- [Logs e Debugging](#logs-e-debugging)

---

## 🚀 Problemas de Instalação

### Erro: `docker: command not found`

**Causa**: Docker não está instalado.

**Solução**:
```bash
# Ubuntu/Debian
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# macOS
brew install --cask docker

# Verificar
docker --version
```

### Erro: `docker-compose: command not found`

**Causa**: Docker Compose não está instalado.

**Solução**:
```bash
# Linux
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# macOS (já vem com Docker Desktop)
# Verificar
docker-compose --version
```

### Erro: `Permission denied` ao executar Docker

**Causa**: Usuário não está no grupo `docker`.

**Solução**:
```bash
sudo usermod -aG docker $USER
newgrp docker

# Ou reiniciar a sessão
logout
# Login novamente
```

---

## 🐳 Problemas com Docker

### Container não sobe

**Verificar logs**:
```bash
docker-compose logs -f [service_name]

# Exemplos:
docker-compose logs -f django
docker-compose logs -f postgres
docker-compose logs -f redis
```

**Verificar status**:
```bash
docker-compose ps
```

**Rebuild forçado**:
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Erro: `port is already allocated`

**Causa**: Porta já está em uso.

**Solução**:
```bash
# Verificar qual processo está usando a porta
sudo lsof -i :8000
sudo lsof -i :5432

# Matar processo
sudo kill -9 [PID]

# Ou alterar porta no docker-compose.yml
ports:
  - "8001:8000"  # Usar porta 8001 ao invés de 8000
```

### Container reiniciando constantemente

**Verificar logs**:
```bash
docker-compose logs --tail=100 [service_name]
```

**Problemas comuns**:

1. **Variáveis de ambiente faltando**:
```bash
# Verificar se .env existe
ls -la backend/.env

# Copiar do exemplo
cp backend/.env.example backend/.env
```

2. **Dependências não instaladas**:
```bash
docker-compose exec django pip install -r requirements.txt
```

3. **Permissões incorretas**:
```bash
sudo chown -R $USER:$USER .
chmod -R 755 .
```

### Erro: `no space left on device`

**Limpar recursos não utilizados**:
```bash
# Limpar tudo (CUIDADO!)
docker system prune -a --volumes

# Apenas containers parados
docker container prune

# Apenas imagens não utilizadas
docker image prune

# Apenas volumes não utilizados
docker volume prune
```

---

## 🗄️ Problemas com Banco de Dados

### Erro: `could not connect to server`

**Verificar se PostgreSQL está rodando**:
```bash
docker-compose ps postgres
docker-compose logs postgres
```

**Reiniciar serviço**:
```bash
docker-compose restart postgres
```

**Verificar variáveis de ambiente**:
```bash
cat backend/.env | grep DB_
```

**Testar conexão manualmente**:
```bash
docker-compose exec postgres psql -U matreiro_user -d matreiro_db -c "SELECT 1;"
```

### Erro: `password authentication failed`

**Causa**: Credenciais incorretas no `.env`.

**Solução**:
```bash
# Verificar variáveis
cat backend/.env | grep -E "DB_USER|DB_PASSWORD"

# Resetar banco (CUIDADO: apaga dados!)
docker-compose down -v
docker-compose up -d
```

### Erro: `database "matreiro_db" does not exist`

**Criar banco manualmente**:
```bash
docker-compose exec postgres psql -U matreiro_user -c "CREATE DATABASE matreiro_db;"
```

**Executar migrações**:
```bash
docker-compose exec django python manage.py migrate
```

### Erro: `relation "table_name" does not exist`

**Causa**: Migrações não foram executadas.

**Solução**:
```bash
# Entrar no container
docker-compose exec django bash

# Executar migrações
python manage.py migrate

# Verificar
python manage.py showmigrations
```

### Performance lenta do PostgreSQL

**Criar índices**:
```sql
-- Conectar ao banco
docker-compose exec postgres psql -U matreiro_user -d matreiro_db

-- Verificar queries lentas
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Criar índices faltantes
CREATE INDEX idx_custom ON table_name(column_name);

-- Analisar tabelas
ANALYZE;
VACUUM;
```

**Verificar conexões**:
```sql
SELECT count(*) FROM pg_stat_activity;
```

Se muito alto (>100), configurar connection pooling com PgBouncer.

---

## 🐍 Problemas com Backend

### Erro: `ModuleNotFoundError: No module named 'X'`

**Causa**: Dependência não instalada.

**Solução**:
```bash
# Reinstalar dependências
docker-compose exec django pip install -r requirements.txt

# Ou rebuild container
docker-compose up -d --build django
```

### Erro: `SECRET_KEY setting must not be empty`

**Solução**:
```bash
# Gerar nova SECRET_KEY
python -c "from django.core.management.utils import get_random_secret_key; print(get_random_secret_key())"

# Adicionar ao .env
echo "SECRET_KEY=sua-nova-secret-key-aqui" >> backend/.env

# Reiniciar
docker-compose restart django
```

### Erro: `django.db.migrations.exceptions.InconsistentMigrationHistory`

**Solução 1 - Fake initial**:
```bash
docker-compose exec django python manage.py migrate --fake-initial
```

**Solução 2 - Reset completo (CUIDADO!)**:
```bash
# Backup primeiro!
docker-compose exec postgres pg_dump -U matreiro_user matreiro_db > backup.sql

# Limpar e refazer
docker-compose down -v
docker-compose up -d
docker-compose exec django python manage.py migrate
```

### Erro 500: Internal Server Error

**Verificar logs**:
```bash
docker-compose logs -f django
```

**Habilitar DEBUG temporariamente**:
```bash
# backend/.env
DEBUG=True

# Reiniciar
docker-compose restart django
```

**Verificar Sentry** (se configurado):
```bash
echo $SENTRY_DSN
```

### Celery não processa tarefas

**Verificar workers**:
```bash
docker-compose logs -f celery

# Verificar fila
docker-compose exec redis redis-cli
> LLEN celery
```

**Reiniciar workers**:
```bash
docker-compose restart celery celery-beat
```

**Purgar fila**:
```bash
docker-compose exec django celery -A matreiro purge
```

### Erro de importação circular

**Causa**: Import circular entre módulos.

**Solução**:
```python
# Mover imports para dentro da função
def my_function():
    from .models import MyModel  # Import local
    ...
```

---

## ⚛️ Problemas com Frontend

### Erro: `npm: command not found`

**Instalar Node.js**:
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS
brew install node

# Verificar
node --version
npm --version
```

### Erro: `Module not found`

**Limpar e reinstalar**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Página em branco

**Verificar console do navegador**:
- Abra DevTools (F12)
- Tab Console
- Procure por erros

**Verificar se variáveis de ambiente estão configuradas**:
```bash
cat .env | grep VITE_
```

**Rebuild**:
```bash
npm run build
```

### Erro de CORS

**Causa**: Backend não permite origem do frontend.

**Solução**:
```bash
# backend/.env
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Reiniciar backend
docker-compose restart django
```

### Hot reload não funciona

**Solução**:
```bash
# Aumentar limite de watchers (Linux)
echo fs.inotify.max_user_watches=524288 | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

## 🔐 Problemas com Autenticação

### Erro: `Invalid token`

**Verificar se token expirou**:
```bash
# Token JWT tem validade de 1 hora por padrão
# Renovar token com refresh_token
```

**Verificar configuração Keycloak**:
```bash
# Acessar admin console
http://localhost:8080

# Verificar:
# - Realm "matreiro" existe
# - Client "matreiro-backend" existe
# - Client secret está correto no .env
```

### Erro: `CORS error` ao fazer login

**Solução**:
```bash
# Keycloak precisa permitir origem do frontend
# Admin Console > Realm > Clients > matreiro-frontend
# Valid Redirect URIs: http://localhost:3000/*
# Web Origins: http://localhost:3000
```

### Usuário não consegue fazer login

**Verificar no Keycloak**:
```bash
# Admin Console > Users > buscar usuário
# Verificar:
# - Email Verified: Yes
# - Enabled: On
# - Credentials: Temporary: Off
```

**Reset senha**:
```bash
# Admin Console > Users > [usuário] > Credentials
# Reset Password
```

### Permissões incorretas

**Verificar role do usuário**:
```bash
docker-compose exec django python manage.py shell

from api.models import User
user = User.objects.get(email='user@example.com')
print(user.role)
print(user.permissions)
```

**Atualizar role**:
```sql
UPDATE users SET role = 'tenant_admin' WHERE email = 'user@example.com';
```

---

## 🔌 Problemas com Integrações

### Azure AD: `invalid_client`

**Causa**: Client ID ou Secret incorretos.

**Solução**:
```bash
# Verificar credenciais no Azure Portal
# Azure AD > App registrations > [seu app]
# - Application (client) ID
# - Certificates & secrets

# Atualizar .env
AZURE_CLIENT_ID=seu-client-id
AZURE_CLIENT_SECRET=seu-client-secret
AZURE_TENANT_ID=seu-tenant-id

# Reiniciar
docker-compose restart django
```

### Azure AD: `insufficient_privileges`

**Causa**: Faltam permissões no Azure AD.

**Solução**:
```bash
# Azure Portal > Azure AD > App registrations > [seu app]
# API permissions > Add permission
# Microsoft Graph:
# - User.Read.All
# - Group.Read.All
# - Directory.Read.All
#
# Grant admin consent
```

### SendGrid: E-mails não chegam

**Verificar API key**:
```bash
cat backend/.env | grep EMAIL_HOST_PASSWORD
```

**Testar envio**:
```bash
docker-compose exec django python manage.py shell

from django.core.mail import send_mail
send_mail(
    'Test',
    'Test message',
    'from@example.com',
    ['to@example.com'],
)
```

**Verificar logs SendGrid**:
- SendGrid Dashboard > Activity

### OpenAI: `invalid_api_key`

**Solução**:
```bash
# Verificar chave
cat backend/.env | grep OPENAI_API_KEY

# Testar
curl https://api.openai.com/v1/models \
  -H "Authorization: Bearer $OPENAI_API_KEY"
```

---

## ⚡ Problemas de Performance

### API lenta

**Habilitar query logging**:
```python
# backend/matreiro/settings.py
LOGGING = {
    'loggers': {
        'django.db.backends': {
            'level': 'DEBUG',
        }
    }
}
```

**Identificar queries N+1**:
```python
# Usar select_related() e prefetch_related()
campaigns = Campaign.objects.select_related('created_by').all()
```

**Adicionar índices**:
```sql
CREATE INDEX idx_custom ON table_name(column_name);
```

### Frontend lento

**Usar React DevTools Profiler**:
- Chrome Extension: React Developer Tools
- Tab Profiler
- Record e interagir com a app
- Analisar componentes lentos

**Otimizações**:
```tsx
// Memoização
import { memo, useMemo, useCallback } from 'react';

const MyComponent = memo(({ data }) => {
  const processed = useMemo(() => processData(data), [data]);
  return <div>{processed}</div>;
});
```

### Banco de dados lento

**Analisar queries**:
```sql
-- Top queries lentas
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

**Vacuum e Analyze**:
```bash
docker-compose exec postgres psql -U matreiro_user -d matreiro_db

VACUUM ANALYZE;
```

---

## 📊 Logs e Debugging

### Ver logs em tempo real

```bash
# Todos os serviços
docker-compose logs -f

# Serviço específico
docker-compose logs -f django
docker-compose logs -f postgres
docker-compose logs -f redis
docker-compose logs -f celery

# Últimas 100 linhas
docker-compose logs --tail=100 django
```

### Logs do Django

```bash
# Logs do container
docker-compose logs -f django

# Logs do arquivo (se configurado)
docker-compose exec django tail -f /var/log/matreiro/django.log
```

### Logs do PostgreSQL

```bash
docker-compose logs -f postgres

# Ou entrar no container
docker-compose exec postgres tail -f /var/log/postgresql/postgresql.log
```

### Debug interativo

**Django Shell**:
```bash
docker-compose exec django python manage.py shell

# Com IPython
docker-compose exec django python manage.py shell -i ipython
```

**PostgreSQL**:
```bash
docker-compose exec postgres psql -U matreiro_user -d matreiro_db

# Queries úteis
\dt               # Listar tabelas
\d table_name     # Descrever tabela
SELECT * FROM users LIMIT 10;
```

**Redis**:
```bash
docker-compose exec redis redis-cli

# Comandos úteis
PING              # Testar conexão
KEYS *            # Listar chaves
GET key           # Obter valor
```

### Debugging com breakpoints

```python
# Adicionar breakpoint
import pdb; pdb.set_trace()

# Comandos no debugger
# n - next line
# s - step into
# c - continue
# p variable - print variable
# l - list code
# q - quit
```

---

## 🆘 Comandos de Emergência

### Reset completo (CUIDADO!)

```bash
# Backup primeiro!
docker-compose exec postgres pg_dump -U matreiro_user matreiro_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Reset
docker-compose down -v
rm -rf backend/__pycache__ backend/*/__pycache__
docker-compose build --no-cache
docker-compose up -d
docker-compose exec django python manage.py migrate
docker-compose exec django python manage.py createsuperuser
```

### Restaurar backup

```bash
# Restaurar PostgreSQL
docker-compose exec -T postgres psql -U matreiro_user -d matreiro_db < backup.sql
```

### Health check rápido

```bash
# Verificar todos os serviços
docker-compose ps

# Testar API
curl http://localhost:8000/api/health

# Testar PostgreSQL
docker-compose exec postgres pg_isready

# Testar Redis
docker-compose exec redis redis-cli ping
```

---

## 📞 Suporte

Se o problema persistir:

1. **Documente o erro**:
   - Mensagem de erro completa
   - Logs relevantes
   - Passos para reproduzir

2. **Verifique**:
   - Versões (Docker, Python, Node, etc)
   - Sistema operacional
   - Variáveis de ambiente

3. **Contate suporte**:
   - 📧 Email: dev@underprotection.com.br
   - 🐛 GitHub Issues
   - 📚 Documentação: /docs

---

**🛡️ Plataforma Matreiro - Under Protection © 2024-2026**
