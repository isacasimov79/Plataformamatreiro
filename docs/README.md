# 📚 Plataforma Matreiro - Documentação

**Versão:** 1.0.0  
**Última Atualização:** 09/03/2026

---

## 🎯 Visão Geral

Este diretório contém toda a documentação técnica da Plataforma Matreiro, um SaaS multi-tenant focado em simulação de phishing e conscientização em segurança da informação.

### Stack Tecnológico

```
Frontend:  React 18 + TypeScript + Tailwind CSS + Vite
Backend:   Django 5.0 + Django REST Framework + Celery
Database:  PostgreSQL 15+ + Redis
Auth:      Keycloak + JWT
Deploy:    Docker + Docker Compose
Cloud:     AWS / GCP / Azure
```

---

## 📋 Índice de Documentação

### 1. [API Documentation](./API_DOCUMENTATION.md) 📘
**Documentação completa da API REST**

Conteúdo:
- Visão geral da API
- Autenticação JWT
- Todos os endpoints documentados com exemplos
- Schemas de dados (TypeScript)
- Códigos de status HTTP
- Rate limiting e throttling
- Webhooks e eventos em tempo real
- Exemplos de integração

**Use quando:**
- Integrar com a API
- Desenvolver frontend
- Criar integrações externas
- Testar endpoints

---

### 2. [Database Migration](./DATABASE_MIGRATION.md) 🗄️
**Guia completo de migração e gestão do banco de dados**

Conteúdo:
- Schema PostgreSQL completo
- ERD (Entity Relationship Diagram)
- Scripts de migração
- Procedimentos de backup/restore
- Otimizações e índices
- Row-Level Security (RLS)
- Troubleshooting
- Performance tuning

**Use quando:**
- Configurar banco de dados
- Criar novas migrações
- Fazer backup/restore
- Otimizar queries
- Resolver problemas de performance

---

### 3. [Django Documentation](./DJANGO_DOCUMENTATION.md) 🐍
**Documentação do backend Django**

Conteúdo:
- Estrutura do projeto
- Configuração (settings.py)
- Models completos com relacionamentos
- Serializers e validações
- Views e ViewSets
- Autenticação e permissões RBAC
- Middleware customizado
- Celery tasks
- Management commands
- Testes

**Use quando:**
- Desenvolver no backend
- Adicionar novos models
- Criar novos endpoints
- Implementar permissões
- Configurar tasks assíncronas

---

### 4. [Changelog](./CHANGELOG.md) 📝
**Histórico de versões e mudanças**

Conteúdo:
- Versões lançadas
- Novas funcionalidades
- Bugs corrigidos
- Breaking changes
- Planos futuros
- Como contribuir

**Use quando:**
- Verificar o que mudou
- Planejar atualizações
- Entender evolução do projeto
- Contribuir com código

---

## 🚀 Guia de Início Rápido

### Para Desenvolvedores Backend

1. **Ler primeiro:**
   - [Django Documentation](./DJANGO_DOCUMENTATION.md)
   - [Database Migration](./DATABASE_MIGRATION.md)

2. **Configurar ambiente:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # ou
   venv\Scripts\activate  # Windows
   
   pip install -r requirements.txt
   python manage.py migrate
   python manage.py populate_permissions
   python manage.py createsuperuser
   python manage.py runserver
   ```

3. **Testar API:**
   - Acesse: http://localhost:8000/api/v1/
   - Swagger UI: http://localhost:8000/api/docs/
   - ReDoc: http://localhost:8000/api/redoc/

---

### Para Desenvolvedores Frontend

1. **Ler primeiro:**
   - [API Documentation](./API_DOCUMENTATION.md)
   - [Changelog](./CHANGELOG.md) (features implementadas)

2. **Configurar ambiente:**
   ```bash
   npm install
   npm run dev
   ```

3. **Estrutura importante:**
   ```
   src/
   ├── app/
   │   ├── components/     # Componentes reutilizáveis
   │   ├── pages/          # Páginas da aplicação
   │   ├── contexts/       # Context API (Auth, etc)
   │   ├── lib/            # Utilitários e API client
   │   └── routes.ts       # Configuração de rotas
   ├── i18n/              # Sistema multi-idioma
   └── styles/            # Estilos globais
   ```

---

### Para DevOps

1. **Ler primeiro:**
   - [Database Migration](./DATABASE_MIGRATION.md) (configuração de DB)
   - Dockerfile e docker-compose.yml

2. **Deploy com Docker:**
   ```bash
   # Desenvolvimento
   docker-compose up -d
   
   # Produção
   docker-compose -f docker-compose.prod.yml up -d
   ```

3. **Variáveis de ambiente necessárias:**
   ```bash
   # Backend
   SECRET_KEY=your-secret-key
   DATABASE_URL=postgresql://user:pass@host:5432/db
   REDIS_URL=redis://redis:6379/0
   
   # Email
   EMAIL_HOST=smtp.gmail.com
   EMAIL_HOST_USER=your@email.com
   EMAIL_HOST_PASSWORD=your-password
   
   # Storage (AWS S3)
   AWS_ACCESS_KEY_ID=your-key
   AWS_SECRET_ACCESS_KEY=your-secret
   AWS_STORAGE_BUCKET_NAME=your-bucket
   ```

---

## 🏗️ Arquitetura do Sistema

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐         │
│  │Dashboard │  │Campaigns │  │Templates │   ...   │
│  └──────────┘  └──────────┘  └──────────┘         │
└─────────────────────┬───────────────────────────────┘
                      │ REST API (JSON)
┌─────────────────────▼───────────────────────────────┐
│              Django REST Framework                  │
│  ┌────────────────────────────────────────────┐    │
│  │  Authentication & Authorization (JWT)       │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  ViewSets & Serializers                    │    │
│  └────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────┐    │
│  │  Tenant Middleware (Multi-tenancy)         │    │
│  └────────────────────────────────────────────┘    │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              Django ORM + Models                    │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │Users │ │Tenant│ │Campg │ │Target│ │Train │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│          PostgreSQL + Redis + Celery                │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │ PostgreSQL │  │   Redis    │  │   Celery   │   │
│  │  (Data)    │  │  (Cache)   │  │  (Tasks)   │   │
│  └────────────┘  └────────────┘  └────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## 📊 Fluxo de Dados Principal

### 1. Autenticação
```
User → Login Form → POST /api/v1/auth/login
     ← JWT Token (access + refresh)
     → Armazena token no localStorage
     → Próximas requests incluem: Authorization: Bearer {token}
```

### 2. Criação de Campanha
```
User → Nova Campanha Form
     → Seleciona Template
     → Seleciona Grupos de Targets
     → Configura Agendamento
     → POST /api/v1/campaigns/
     ← Campaign criada (status: draft)
     → POST /api/v1/campaigns/{id}/start
     ← Campaign iniciada (status: active)
     → Celery Task: send_campaign_emails.delay(campaign_id)
     → Emails enviados + tracking links
```

### 3. Tracking de Eventos
```
Target abre email
  → GET /track/{campaign_id}/{target_id}/open.gif
  → CampaignEvent criado (event_type: opened)
  → Campaign.emails_opened += 1

Target clica no link
  → GET /track/{campaign_id}/{target_id}/click
  → CampaignEvent criado (event_type: clicked)
  → Campaign.links_clicked += 1
  → Redireciona para landing page

Target submete dados
  → POST /landing/{tracking_code}
  → CapturedData criado (dados encriptados)
  → CampaignEvent criado (event_type: submitted)
  → Campaign.credentials_submitted += 1
  → Notificação enviada ao admin
```

---

## 🔒 Segurança

### Implementado

✅ **Autenticação**
- JWT com access token (1h) e refresh token (7 dias)
- Rotação automática de tokens
- Blacklist de tokens após refresh

✅ **Autorização**
- RBAC (Role-Based Access Control)
- Permissões granulares por módulo
- Object-level permissions com django-guardian
- Row-Level Security no PostgreSQL

✅ **Proteção de Dados**
- HTTPS obrigatório em produção
- Encriptação de dados sensíveis (captured_data)
- CORS configurado corretamente
- CSRF protection
- XSS protection
- SQL Injection protection (ORM)

✅ **Audit**
- Logs completos de todas as ações
- Rastreamento de IP e User Agent
- Impersonation logging

✅ **Rate Limiting**
- Limites por endpoint
- Proteção contra brute force
- Throttling configurável

### Boas Práticas

```python
# ❌ Nunca faça isso
password = "senha123"  # Plain text
query = f"SELECT * FROM users WHERE email = '{email}'"  # SQL Injection

# ✅ Sempre faça isso
from django.contrib.auth.hashers import make_password
password = make_password("senha123")
User.objects.filter(email=email)  # ORM protege contra injection
```

---

## 🧪 Testes

### Backend (Django)

```bash
# Rodar todos os testes
python manage.py test

# Teste específico
python manage.py test campaigns.tests.CampaignViewSetTestCase

# Com coverage
pytest --cov=. --cov-report=html

# Ver coverage
open htmlcov/index.html
```

### Frontend (React)

```bash
# Rodar testes
npm test

# Coverage
npm run test:coverage

# E2E (Playwright)
npm run test:e2e
```

---

## 📈 Performance

### Métricas Alvo

| Métrica | Alvo | Atual |
|---------|------|-------|
| API Response Time | < 200ms | ~150ms |
| Database Queries | < 10 per request | ~8 |
| Page Load Time | < 2s | ~1.5s |
| Lighthouse Score | > 90 | 92 |

### Otimizações Implementadas

✅ **Backend**
- Índices otimizados no PostgreSQL
- Cache com Redis (queries frequentes)
- Select related / Prefetch related (N+1 queries)
- Connection pooling
- Celery para tarefas longas

✅ **Frontend**
- Code splitting
- Lazy loading de rotas
- Memoização de componentes (React.memo)
- Debounce em buscas
- Virtual scrolling em listas grandes

✅ **Database**
- Particionamento de tabelas grandes (audit_logs)
- Vacuum automático configurado
- Prepared statements
- Connection pooling

---

## 🐛 Troubleshooting Comum

### Backend não conecta ao PostgreSQL

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Testar conexão manual
psql -h localhost -U matreiro_user -d matreiro_db

# Verificar pg_hba.conf
sudo nano /etc/postgresql/15/main/pg_hba.conf
# Adicionar: host matreiro_db matreiro_user 0.0.0.0/0 md5
```

### Migrations falham

```bash
# Ver status
python manage.py showmigrations

# Fazer fake migration
python manage.py migrate --fake campaigns 0001

# Resetar migrations (CUIDADO!)
python manage.py migrate campaigns zero
python manage.py migrate campaigns
```

### Celery não processa tasks

```bash
# Verificar Redis
redis-cli ping  # Deve retornar PONG

# Ver logs do Celery
celery -A matreiro worker -l debug

# Verificar tasks pendentes
celery -A matreiro inspect active
```

### Frontend não carrega dados

```bash
# Verificar console do browser (F12)
# Verificar network tab
# Verificar token JWT no localStorage

# Limpar cache
localStorage.clear()
```

---

## 🤝 Como Contribuir

1. **Fork o projeto**
2. **Crie uma branch** (`git checkout -b feature/nova-funcionalidade`)
3. **Faça suas alterações**
4. **Atualize a documentação relevante**
5. **Atualize o CHANGELOG.md**
6. **Commit** (`git commit -m 'feat: adiciona nova funcionalidade'`)
7. **Push** (`git push origin feature/nova-funcionalidade`)
8. **Abra um Pull Request**

### Checklist antes de PR

- [ ] Código está funcionando
- [ ] Testes foram adicionados
- [ ] Testes estão passando
- [ ] Documentação foi atualizada
- [ ] CHANGELOG.md foi atualizado
- [ ] Código segue style guide
- [ ] Não há warnings ou erros no console

---

## 📞 Suporte e Contato

### Documentação
- **Online:** https://docs.matreiro.underprotection.com.br
- **Local:** Este diretório `/docs`

### Suporte Técnico
- **Email:** suporte@underprotection.com.br
- **Issues:** https://github.com/underprotection/matreiro-platform/issues
- **Slack:** #matreiro-dev

### Status da Plataforma
- **Status Page:** https://status.matreiro.underprotection.com.br
- **API Health:** https://api.matreiro.com/health

---

## 📅 Roadmap

### Q2 2026
- [ ] Sistema de notificações push
- [ ] Dashboard personalizável
- [ ] Mobile app (React Native)
- [ ] Modo escuro

### Q3 2026
- [ ] IA para detecção de fraude
- [ ] Marketplace de templates
- [ ] Gamificação
- [ ] Integração com LMS

### Q4 2026
- [ ] Analytics avançado
- [ ] Relatórios preditivos
- [ ] Multi-language email templates
- [ ] White-label solution

---

## 📜 Licença

Copyright © 2026 Under Protection. Todos os direitos reservados.

Este software é proprietário e confidencial. Não é permitido copiar, modificar, distribuir ou usar sem autorização expressa.

---

## 🎨 Brand Guidelines

### Cores Oficiais

```css
/* Under Protection Colors */
--navy-blue: #242545;      /* Primary */
--grape-purple: #834a8b;   /* Secondary */
--graphite: #4a4a4a;       /* Text */
--white: #ffffff;          /* Background */
```

### Typography

```css
font-family: 'Montserrat', sans-serif;
```

### Logo

- **Positiva:** `/src/imports/Logo_Positiva_-_Vetor-01.svg`
- **Negativa:** (solicitar ao design)

---

**Última Atualização:** 09/03/2026  
**Versão da Documentação:** 1.0.0  
**Mantido por:** Under Protection Team
