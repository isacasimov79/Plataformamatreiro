# ⚡ Plataforma Matreiro - Referência Rápida

**Última Atualização:** 09/03/2026

> **💡 Dica:** Adicione este arquivo aos favoritos do seu editor para acesso rápido!

---

## 🚀 Comandos Mais Usados

### Backend (Django)

```bash
# Iniciar servidor
python manage.py runserver

# Migrations
python manage.py makemigrations
python manage.py migrate
python manage.py showmigrations

# Shell Django
python manage.py shell
python manage.py shell_plus  # Importa tudo automaticamente

# Criar superusuário
python manage.py createsuperuser

# Popular permissões
python manage.py populate_permissions

# Testes
python manage.py test
pytest
pytest --cov=.

# Celery
celery -A matreiro worker -l info
celery -A matreiro beat -l info

# Limpar cache Redis
python manage.py shell
>>> from django.core.cache import cache
>>> cache.clear()
```

### Frontend (React)

```bash
# Iniciar dev server
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Testes
npm test
npm run test:coverage

# Lint
npm run lint
npm run lint:fix

# Format
npm run format
```

### Docker

```bash
# Iniciar todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f [serviço]

# Parar tudo
docker-compose down

# Rebuild
docker-compose build
docker-compose up -d --force-recreate

# Executar comando em container
docker-compose exec backend python manage.py shell

# Limpar volumes (CUIDADO!)
docker-compose down -v
```

### PostgreSQL

```bash
# Conectar ao banco
psql -h localhost -U matreiro_user -d matreiro_db

# Backup
pg_dump -h localhost -U matreiro_user -Fc matreiro_db > backup.dump

# Restore
pg_restore -h localhost -U matreiro_user -d matreiro_db -c backup.dump

# Ver tabelas
\dt

# Ver schema de tabela
\d+ nome_tabela

# Sair
\q
```

### Redis

```bash
# Conectar
redis-cli

# Ver todas as keys
KEYS *

# Ver valor de key
GET key_name

# Limpar tudo (CUIDADO!)
FLUSHALL

# Ver informações
INFO

# Sair
exit
```

---

## 🔗 Links Rápidos

### Documentação
- [README Principal](./README.md)
- [API Docs](./API_DOCUMENTATION.md)
- [Database Migration](./DATABASE_MIGRATION.md)
- [Django Docs](./DJANGO_DOCUMENTATION.md)
- [Changelog](./CHANGELOG.md)

### URLs Locais
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000/api/v1/
- Django Admin: http://localhost:8000/admin/
- Swagger UI: http://localhost:8000/api/docs/
- ReDoc: http://localhost:8000/api/redoc/
- Flower (Celery): http://localhost:5555

### Produção
- App: https://app.matreiro.underprotection.com.br
- API: https://api.matreiro.underprotection.com.br
- Docs: https://docs.matreiro.underprotection.com.br
- Status: https://status.matreiro.underprotection.com.br

---

## 📊 Estrutura de Arquivos Importantes

```
/
├── backend/
│   ├── manage.py              # Django management
│   ├── requirements.txt       # Python dependencies
│   ├── matreiro/
│   │   ├── settings.py        # ⚙️ Configurações principais
│   │   ├── urls.py            # URLs raiz
│   │   └── celery.py          # Configuração Celery
│   ├── core/                  # 👤 Users, Auth, Permissions
│   ├── tenants/               # 🏢 Multi-tenancy
│   ├── campaigns/             # 📧 Campanhas de phishing
│   ├── templates/             # 📝 Templates de email
│   ├── trainings/             # 🎓 Treinamentos
│   └── reports/               # 📊 Relatórios
│
├── src/
│   ├── app/
│   │   ├── App.tsx            # Componente raiz
│   │   ├── routes.ts          # 🔀 Configuração de rotas
│   │   ├── components/        # Componentes reutilizáveis
│   │   ├── pages/             # Páginas da aplicação
│   │   ├── contexts/          # React Context (Auth)
│   │   └── lib/
│   │       ├── api.ts         # 🌐 Cliente HTTP (fetch)
│   │       └── supabaseApi.ts # Supabase client
│   ├── i18n/                  # 🌍 Traduções
│   │   ├── config.ts
│   │   └── locales/
│   │       ├── pt-BR.json     # Português Brasil
│   │       ├── en.json        # Inglês
│   │       └── es.json        # Espanhol
│   └── styles/                # CSS global
│
├── docs/                      # 📚 Documentação
│   ├── README.md              # Índice de docs
│   ├── API_DOCUMENTATION.md   # API completa
│   ├── DATABASE_MIGRATION.md  # Schema e migrations
│   ├── DJANGO_DOCUMENTATION.md # Backend Django
│   └── CHANGELOG.md           # Histórico de mudanças
│
├── docker-compose.yml         # 🐳 Serviços Docker
├── Dockerfile.frontend        # Build do frontend
├── package.json               # NPM dependencies
└── .env                       # ⚠️ Variáveis de ambiente (não comitar!)
```

---

## 🔑 Variáveis de Ambiente Essenciais

### Backend (.env)

```bash
# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,api.matreiro.com

# Database
DATABASE_URL=postgresql://user:pass@postgres:5432/matreiro_db

# Redis
REDIS_URL=redis://redis:6379/0

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,https://app.matreiro.com

# JWT
JWT_SECRET_KEY=your-jwt-secret

# Storage (AWS S3)
USE_S3=False
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_STORAGE_BUCKET_NAME=matreiro-storage
AWS_S3_REGION_NAME=us-east-1

# Keycloak (opcional)
KEYCLOAK_SERVER_URL=http://localhost:8080
KEYCLOAK_REALM=matreiro
KEYCLOAK_CLIENT_ID=matreiro-client
KEYCLOAK_CLIENT_SECRET=your-secret
```

### Frontend (.env)

```bash
# API
VITE_API_URL=http://localhost:8000/api/v1
VITE_API_WS_URL=ws://localhost:8000/ws

# Supabase (se usar)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Features flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG=true

# Environment
VITE_ENV=development
```

---

## 📝 Snippets Úteis

### Python (Django)

#### Criar novo endpoint

```python
from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

class MyViewSet(viewsets.ModelViewSet):
    @action(detail=True, methods=['post'])
    def custom_action(self, request, pk=None):
        obj = self.get_object()
        # Lógica aqui
        return Response({'message': 'Success'})
```

#### Query com filtros

```python
# Filtro simples
campaigns = Campaign.objects.filter(status='active')

# Filtro complexo
campaigns = Campaign.objects.filter(
    status='active',
    tenant=user.tenant,
    created_at__gte=date_from
).select_related('template', 'tenant').prefetch_related('events')

# Agregação
from django.db.models import Count, Avg
stats = Campaign.objects.aggregate(
    total=Count('id'),
    avg_open_rate=Avg('emails_opened') / Avg('emails_sent')
)
```

#### Serializer com validação

```python
from rest_framework import serializers

class MySerializer(serializers.ModelSerializer):
    class Meta:
        model = MyModel
        fields = '__all__'
    
    def validate_field(self, value):
        if len(value) < 3:
            raise serializers.ValidationError("Too short")
        return value
    
    def validate(self, attrs):
        if attrs['field1'] == attrs['field2']:
            raise serializers.ValidationError("Fields must be different")
        return attrs
```

### TypeScript (React)

#### Fazer requisição à API

```typescript
import { api } from '@/lib/api';

// GET
const campaigns = await api.get('/campaigns');

// POST
const newCampaign = await api.post('/campaigns', {
  name: 'Nova Campanha',
  template_id: templateId,
});

// PUT
await api.put(`/campaigns/${id}`, { status: 'active' });

// DELETE
await api.delete(`/campaigns/${id}`);
```

#### Componente com useState e useEffect

```typescript
import { useState, useEffect } from 'react';

function MyCampaign({ id }: { id: string }) {
  const [campaign, setCampaign] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchCampaign() {
      try {
        const data = await api.get(`/campaigns/${id}`);
        setCampaign(data);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchCampaign();
  }, [id]);
  
  if (loading) return <div>Loading...</div>;
  
  return <div>{campaign?.name}</div>;
}
```

#### Hook customizado

```typescript
function useCampaigns(tenantId: string) {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetch() {
      const data = await api.get(`/campaigns?tenant_id=${tenantId}`);
      setCampaigns(data);
      setLoading(false);
    }
    fetch();
  }, [tenantId]);
  
  return { campaigns, loading };
}

// Usar:
const { campaigns, loading } = useCampaigns(tenantId);
```

### SQL (PostgreSQL)

#### Queries úteis

```sql
-- Ver tamanho das tabelas
SELECT 
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'matreiro'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Ver queries lentas
SELECT 
    query,
    calls,
    total_time,
    mean_time
FROM pg_stat_statements
ORDER BY mean_time DESC
LIMIT 20;

-- Ver conexões ativas
SELECT * FROM pg_stat_activity WHERE state = 'active';

-- Matar conexão
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid = 12345;

-- Recriar índice
REINDEX INDEX idx_name;

-- Vacuum
VACUUM ANALYZE table_name;

-- Ver locks
SELECT * FROM pg_locks WHERE granted = false;
```

---

## 🐛 Troubleshooting Rápido

### Problema: Frontend não conecta à API

```bash
# 1. Verificar se backend está rodando
curl http://localhost:8000/api/v1/health

# 2. Verificar variável de ambiente
echo $VITE_API_URL

# 3. Verificar CORS no backend
# backend/matreiro/settings.py
# CORS_ALLOWED_ORIGINS deve incluir origem do frontend
```

### Problema: Migrations falham

```bash
# Ver status
python manage.py showmigrations

# Fazer fake se já aplicou no banco
python manage.py migrate --fake app_name migration_name

# Reverter
python manage.py migrate app_name zero
python manage.py migrate app_name
```

### Problema: Celery não processa tasks

```bash
# 1. Verificar Redis
redis-cli ping  # Deve retornar PONG

# 2. Ver logs
celery -A matreiro worker -l debug

# 3. Ver tasks pendentes
celery -A matreiro inspect active

# 4. Limpar Redis
redis-cli FLUSHALL
```

### Problema: PostgreSQL não conecta

```bash
# Verificar se está rodando
sudo systemctl status postgresql

# Reiniciar
sudo systemctl restart postgresql

# Verificar porta
sudo netstat -plnt | grep 5432

# Testar conexão
psql -h localhost -U matreiro_user -d matreiro_db
```

### Problema: Docker containers com erro

```bash
# Ver logs
docker-compose logs -f [serviço]

# Rebuild completo
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d

# Limpar tudo (CUIDADO!)
docker system prune -a --volumes
```

---

## 📊 Queries SQL Prontas

### Estatísticas de Campanhas

```sql
-- Campanhas por status
SELECT status, COUNT(*) 
FROM campaigns 
GROUP BY status;

-- Top 10 campanhas por open rate
SELECT 
    c.name,
    c.emails_sent,
    c.emails_opened,
    ROUND(c.emails_opened::DECIMAL / c.emails_sent * 100, 2) AS open_rate
FROM campaigns c
WHERE c.emails_sent > 0
ORDER BY open_rate DESC
LIMIT 10;

-- Eventos por tipo e data
SELECT 
    DATE(timestamp) AS date,
    event_type,
    COUNT(*) AS count
FROM campaign_events
WHERE timestamp >= NOW() - INTERVAL '30 days'
GROUP BY date, event_type
ORDER BY date DESC, event_type;
```

### Análise de Targets

```sql
-- Targets por departamento com risco médio
SELECT 
    department,
    COUNT(*) AS total,
    ROUND(AVG(risk_score), 2) AS avg_risk,
    COUNT(CASE WHEN risk_score >= 0.7 THEN 1 END) AS high_risk
FROM targets
WHERE status = 'active'
GROUP BY department
ORDER BY avg_risk DESC;

-- Top 10 targets mais vulneráveis
SELECT 
    t.name,
    t.email,
    t.department,
    t.risk_score,
    COUNT(DISTINCT ce.campaign_id) AS campaigns_received,
    COUNT(CASE WHEN ce.event_type = 'clicked' THEN 1 END) AS clicks,
    COUNT(CASE WHEN ce.event_type = 'submitted' THEN 1 END) AS submissions
FROM targets t
LEFT JOIN campaign_events ce ON t.email = ce.target_email
GROUP BY t.id, t.name, t.email, t.department, t.risk_score
ORDER BY t.risk_score DESC
LIMIT 10;
```

---

## 🔐 Credenciais de Desenvolvimento

### PostgreSQL
- **Host:** localhost
- **Port:** 5432
- **Database:** matreiro_db
- **User:** matreiro_user
- **Password:** matreiro_password_dev

### Redis
- **Host:** localhost
- **Port:** 6379
- **Password:** (none)

### Django Superuser (após criação)
- **Email:** admin@matreiro.com
- **Username:** admin
- **Password:** (definido por você)

### Keycloak (se configurado)
- **URL:** http://localhost:8080
- **Realm:** matreiro
- **Admin User:** admin
- **Admin Password:** admin

---

## 📞 Quem Contactar

| Problema | Contato |
|----------|---------|
| API não funciona | Backend Team (#backend-dev) |
| UI/UX issues | Frontend Team (#frontend-dev) |
| Banco de dados | DBA (#database) |
| Deploy/Infra | DevOps (#devops) |
| Dúvidas gerais | #dev-general |
| Bugs críticos | Tech Lead (direct message) |

---

## 🎯 Checklist de PR

Antes de abrir Pull Request:

- [ ] Código funciona localmente
- [ ] Testes passando
- [ ] Sem warnings no console
- [ ] Documentação atualizada
- [ ] CHANGELOG.md atualizado
- [ ] Branch atualizada com main
- [ ] Commit messages descritivas
- [ ] Code review solicitado

---

## 🏆 Atalhos do VSCode

Adicione ao seu `keybindings.json`:

```json
[
  {
    "key": "ctrl+alt+d",
    "command": "workbench.action.tasks.runTask",
    "args": "Run Django Server"
  },
  {
    "key": "ctrl+alt+r",
    "command": "workbench.action.tasks.runTask",
    "args": "Run React Dev Server"
  },
  {
    "key": "ctrl+alt+t",
    "command": "workbench.action.tasks.runTask",
    "args": "Run Tests"
  }
]
```

---

## 📚 Recursos Externos Úteis

- [Django Docs](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Docs](https://react.dev/)
- [PostgreSQL Docs](https://www.postgresql.org/docs/)
- [Celery Docs](https://docs.celeryq.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)

---

**💡 Dica Final:** Adicione esta página aos favoritos do seu navegador para acesso rápido durante o desenvolvimento!

**Última Atualização:** 09/03/2026  
**Mantido por:** Under Protection Dev Team
