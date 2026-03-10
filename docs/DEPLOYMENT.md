# 🚀 Deployment Guide - Plataforma Matreiro

Guia completo para deploy em produção.

---

## 📋 Índice

- [Pré-requisitos](#pré-requisitos)
- [Infraestrutura](#infraestrutura)
- [Preparação](#preparação)
- [Deploy do Backend](#deploy-do-backend)
- [Deploy do Frontend](#deploy-do-frontend)
- [Deploy do Banco de Dados](#deploy-do-banco-de-dados)
- [Configuração de DNS](#configuração-de-dns)
- [SSL/HTTPS](#sslhttps)
- [Monitoramento](#monitoramento)
- [Backup](#backup)
- [Checklist Final](#checklist-final)

---

## ✅ Pré-requisitos

### Servidor

- **VPS/Cloud**: AWS EC2, DigitalOcean, Azure VM, Google Cloud
- **CPU**: Mínimo 4 vCPUs
- **RAM**: Mínimo 8 GB (recomendado 16 GB)
- **Disco**: Mínimo 50 GB SSD
- **OS**: Ubuntu 22.04 LTS ou Debian 11

### Domínio

- Domínio próprio (ex: matreiro.com.br)
- Acesso ao DNS

### Serviços Externos

- SendGrid ou AWS SES (email)
- Azure AD configurado (se usar integração)
- OpenAI API key (se usar validação IA)
- Supabase projeto criado

---

## 🏗️ Infraestrutura

### Arquitetura Recomendada (Produção)

```
Internet
    │
    ↓
[Cloudflare / CDN]
    │
    ↓
[Load Balancer]
    │
    ├──→ [Frontend Server 1]
    ├──→ [Frontend Server 2]
    │
    ├──→ [Backend Server 1]
    ├──→ [Backend Server 2]
    │
    ↓
[Database Cluster]
    ├──→ [PostgreSQL Primary]
    └──→ [PostgreSQL Replica]
    
[Redis Cluster]
    ├──→ [Redis Master]
    └──→ [Redis Slave]
```

### Opções de Infraestrutura

**Opção 1: Single Server (Pequeno porte)**
- 1 servidor com todos os componentes
- Backup em S3/Wasabi
- **Custo**: ~$50-100/mês

**Opção 2: Multi-Server (Médio porte)**
- 2 servidores de aplicação
- 1 servidor de banco de dados
- Load balancer
- **Custo**: ~$200-400/mês

**Opção 3: Cloud Managed (Grande porte)**
- AWS ECS/Fargate ou Kubernetes
- RDS PostgreSQL
- ElastiCache Redis
- CloudFront CDN
- **Custo**: ~$500-1500/mês

---

## 🔧 Preparação

### 1. Servidor Inicial

```bash
# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y \
    git \
    curl \
    wget \
    vim \
    htop \
    ufw \
    fail2ban \
    certbot \
    python3-certbot-nginx

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verificar
docker --version
docker-compose --version
```

### 2. Configurar Firewall

```bash
# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Habilitar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

### 3. Configurar Fail2Ban

```bash
# Copiar configuração padrão
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Editar configuração
sudo vim /etc/fail2ban/jail.local

# Reiniciar
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban
```

---

## 🐍 Deploy do Backend

### 1. Clone o Repositório

```bash
cd /opt
sudo git clone https://github.com/underprotection/plataforma-matreiro.git
cd plataforma-matreiro
sudo chown -R $USER:$USER .
```

### 2. Configurar Variáveis de Ambiente

```bash
cp backend/.env.example backend/.env
vim backend/.env
```

**Configurações de Produção**:

```env
# Django
DEBUG=False
SECRET_KEY=GERE-UMA-CHAVE-FORTE-AQUI
ALLOWED_HOSTS=api.matreiro.com.br,matreiro.com.br
CORS_ALLOWED_ORIGINS=https://app.matreiro.com.br
CSRF_TRUSTED_ORIGINS=https://app.matreiro.com.br

# Database
DB_HOST=postgres.internal  # ou IP do servidor de banco
DB_NAME=matreiro_prod
DB_USER=matreiro_prod_user
DB_PASSWORD=SENHA-FORTE-AQUI

# Redis
REDIS_URL=redis://redis.internal:6379/0

# Email
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.sendgrid.net
EMAIL_HOST_PASSWORD=SUA-SENDGRID-API-KEY

# Security
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SECURE_HSTS_SECONDS=31536000

# Storage (AWS S3)
STORAGE_TYPE=s3
AWS_STORAGE_BUCKET_NAME=matreiro-uploads
AWS_S3_REGION_NAME=us-east-1

# Sentry (Monitoring)
SENTRY_DSN=https://your-sentry-dsn
```

### 3. Build e Deploy

```bash
# Build imagens
docker-compose -f docker-compose.prod.yml build

# Subir serviços
docker-compose -f docker-compose.prod.yml up -d

# Executar migrações
docker-compose exec django python manage.py migrate

# Coletar arquivos estáticos
docker-compose exec django python manage.py collectstatic --no-input

# Criar superusuário
docker-compose exec django python manage.py createsuperuser
```

### 4. Docker Compose para Produção

**`docker-compose.prod.yml`**:

```yaml
version: '3.9'

services:
  django:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    env_file:
      - ./backend/.env
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      - postgres
      - redis
    networks:
      - matreiro_network

  celery:
    build:
      context: ./backend
      dockerfile: Dockerfile.prod
    restart: always
    command: celery -A matreiro worker -l info --concurrency=8
    env_file:
      - ./backend/.env
    depends_on:
      - django
      - redis
    networks:
      - matreiro_network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf:ro
      - ./nginx/conf.d:/etc/nginx/conf.d:ro
      - static_volume:/app/staticfiles:ro
      - media_volume:/app/media:ro
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    depends_on:
      - django
    networks:
      - matreiro_network

volumes:
  static_volume:
  media_volume:

networks:
  matreiro_network:
    driver: bridge
```

---

## ⚛️ Deploy do Frontend

### Opção 1: Deploy Estático (Recomendado)

**Build local e upload**:

```bash
# Build de produção
npm run build

# Upload para S3
aws s3 sync dist/ s3://app.matreiro.com.br --delete

# Invalidar CloudFront cache
aws cloudfront create-invalidation --distribution-id XXXX --paths "/*"
```

**Ou via CI/CD (GitHub Actions)**:

```yaml
# .github/workflows/deploy-frontend.yml
name: Deploy Frontend

on:
  push:
    branches: [ main ]
    paths:
      - 'src/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
        env:
          VITE_API_BASE_URL: ${{ secrets.API_BASE_URL }}
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
      
      - name: Deploy to S3
        uses: jakejarvis/s3-sync-action@master
        with:
          args: --delete
        env:
          AWS_S3_BUCKET: ${{ secrets.AWS_S3_BUCKET }}
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          SOURCE_DIR: 'dist'
```

### Opção 2: Deploy com Nginx

```bash
# Build
npm run build

# Copiar para servidor
scp -r dist/* user@server:/var/www/matreiro/

# Configurar Nginx (já configurado no docker-compose)
```

---

## 🗄️ Deploy do Banco de Dados

### Opção 1: PostgreSQL Standalone

```bash
# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Configurar PostgreSQL
sudo -u postgres psql

postgres=# CREATE DATABASE matreiro_prod;
postgres=# CREATE USER matreiro_prod_user WITH PASSWORD 'SENHA-FORTE';
postgres=# GRANT ALL PRIVILEGES ON DATABASE matreiro_prod TO matreiro_prod_user;
postgres=# \q

# Configurar para aceitar conexões externas
sudo vim /etc/postgresql/14/main/postgresql.conf
# Alterar: listen_addresses = '*'

sudo vim /etc/postgresql/14/main/pg_hba.conf
# Adicionar: host all all 0.0.0.0/0 md5

# Reiniciar
sudo systemctl restart postgresql
```

### Opção 2: RDS (AWS)

1. **Criar RDS PostgreSQL**:
   - Console AWS > RDS > Create database
   - Engine: PostgreSQL 15
   - Template: Production
   - DB instance size: db.t3.medium (ou maior)
   - Storage: 100 GB SSD
   - Multi-AZ: Yes (alta disponibilidade)
   - VPC: Mesma VPC dos servidores

2. **Configurar Security Group**:
   - Permitir acesso apenas dos servidores de aplicação
   - Porta 5432

3. **Backup Automático**:
   - Retention period: 7 days
   - Backup window: 02:00-03:00 UTC

### Executar Schema

```bash
# Copiar arquivos SQL
scp database/schema.sql user@server:/tmp/
scp database/seed.sql user@server:/tmp/

# Executar no banco
psql -h database-host -U matreiro_prod_user -d matreiro_prod -f /tmp/schema.sql
```

---

## 🌐 Configuração de DNS

### Registros DNS

```
A     matreiro.com.br           →  YOUR_SERVER_IP
A     www.matreiro.com.br       →  YOUR_SERVER_IP
A     api.matreiro.com.br       →  YOUR_SERVER_IP
A     app.matreiro.com.br       →  CDN_IP (ou S3)
CNAME sso.matreiro.com.br       →  keycloak-server
```

### Configurar no DNS Provider

**Cloudflare** (Recomendado):
1. Adicionar domínio
2. Configurar nameservers
3. Adicionar registros A/CNAME
4. Habilitar proxy (nuvem laranja)
5. SSL/TLS: Full (strict)
6. Sempre usar HTTPS: On

---

## 🔒 SSL/HTTPS

### Opção 1: Let's Encrypt (Gratuito)

```bash
# Obter certificado
sudo certbot --nginx -d matreiro.com.br -d www.matreiro.com.br -d api.matreiro.com.br

# Renovar automaticamente
sudo certbot renew --dry-run

# Adicionar ao cron
sudo crontab -e
# 0 0 * * * certbot renew --quiet
```

### Opção 2: Cloudflare (Recomendado)

- SSL automático
- DDoS protection
- CDN global
- Cache automático

**Configuração**:
1. Dashboard Cloudflare > SSL/TLS
2. Mode: Full (strict)
3. Edge Certificates: On
4. Always Use HTTPS: On
5. Automatic HTTPS Rewrites: On

---

## 📊 Monitoramento

### 1. Logs

**Centralizar logs com ELK Stack**:

```yaml
# docker-compose.monitoring.yml
services:
  elasticsearch:
    image: elasticsearch:8.11.0
    environment:
      - discovery.type=single-node
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data

  logstash:
    image: logstash:8.11.0
    volumes:
      - ./logstash/pipeline:/usr/share/logstash/pipeline

  kibana:
    image: kibana:8.11.0
    ports:
      - "5601:5601"
    depends_on:
      - elasticsearch
```

### 2. Métricas

**Prometheus + Grafana**:

```yaml
# docker-compose.monitoring.yml
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    volumes:
      - grafana_data:/var/lib/grafana
    depends_on:
      - prometheus
```

### 3. Uptime Monitoring

**UptimeRobot**:
- https://uptimerobot.com
- Monitore: https://matreiro.com.br/health
- Alertas: Email, SMS, Slack

### 4. Error Tracking

**Sentry**:

```python
# backend/matreiro/settings.py
import sentry_sdk

sentry_sdk.init(
    dsn=os.getenv('SENTRY_DSN'),
    environment=os.getenv('SENTRY_ENVIRONMENT', 'production'),
    traces_sample_rate=1.0,
)
```

---

## 💾 Backup

### Backup Automatizado do PostgreSQL

```bash
#!/bin/bash
# /opt/scripts/backup_db.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
FILENAME="matreiro_backup_$DATE.sql.gz"

mkdir -p $BACKUP_DIR

# Backup
pg_dump -h localhost -U matreiro_prod_user matreiro_prod | gzip > "$BACKUP_DIR/$FILENAME"

# Upload para S3
aws s3 cp "$BACKUP_DIR/$FILENAME" s3://matreiro-backups/database/

# Manter apenas últimos 30 dias localmente
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup concluído: $FILENAME"
```

**Agendar com cron**:

```bash
sudo crontab -e

# Backup diário às 2h da manhã
0 2 * * * /opt/scripts/backup_db.sh >> /var/log/backup.log 2>&1
```

### Backup de Mídia/Uploads

```bash
#!/bin/bash
# /opt/scripts/backup_media.sh

aws s3 sync /opt/matreiro/media/ s3://matreiro-backups/media/ --delete
```

---

## ✅ Checklist Final

### Pré-Deploy

- [ ] Código testado em staging
- [ ] Variáveis de ambiente configuradas
- [ ] Secrets seguros e criptografados
- [ ] DNS configurado
- [ ] SSL/HTTPS ativo
- [ ] Firewall configurado
- [ ] Backup configurado

### Configuração

- [ ] `DEBUG=False`
- [ ] `SECRET_KEY` forte e única
- [ ] `ALLOWED_HOSTS` correto
- [ ] `CORS_ALLOWED_ORIGINS` correto
- [ ] Database credentials seguros
- [ ] Email configurado e testado
- [ ] Storage (S3) configurado

### Segurança

- [ ] Firewall (ufw) ativo
- [ ] Fail2ban configurado
- [ ] SSL/HTTPS com A+ rating
- [ ] Headers de segurança configurados
- [ ] Rate limiting ativo
- [ ] Logs de auditoria ativos

### Monitoramento

- [ ] Logs centralizados
- [ ] Métricas (Prometheus/Grafana)
- [ ] Uptime monitoring
- [ ] Error tracking (Sentry)
- [ ] Alertas configurados

### Performance

- [ ] Cache (Redis) ativo
- [ ] CDN configurado
- [ ] Gzip compression ativo
- [ ] Static files servidos corretamente
- [ ] Database com índices otimizados

### Backup

- [ ] Backup automático do banco
- [ ] Backup de media/uploads
- [ ] Teste de restore realizado
- [ ] Retenção de 30 dias

---

## 🔄 Processo de Deploy

### Deploy Padrão

```bash
# 1. Pull do código
cd /opt/plataforma-matreiro
git pull origin main

# 2. Rebuild containers
docker-compose -f docker-compose.prod.yml build

# 3. Executar migrações
docker-compose exec django python manage.py migrate

# 4. Coletar static files
docker-compose exec django python manage.py collectstatic --no-input

# 5. Restart serviços
docker-compose -f docker-compose.prod.yml restart

# 6. Verificar logs
docker-compose logs -f --tail=100
```

### Rollback

```bash
# 1. Reverter código
git reset --hard COMMIT_HASH

# 2. Rebuild
docker-compose -f docker-compose.prod.yml build

# 3. Reverter migrações (se necessário)
docker-compose exec django python manage.py migrate app_name migration_name

# 4. Restart
docker-compose -f docker-compose.prod.yml restart
```

---

## 📞 Suporte Pós-Deploy

- 📧 Email: ops@underprotection.com.br
- 🚨 Emergências: +55 11 98765-4321
- 📚 Docs: https://docs.matreiro.com.br

---

**🛡️ Plataforma Matreiro - Under Protection © 2024-2026**
