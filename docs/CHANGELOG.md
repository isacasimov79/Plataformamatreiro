# 📝 Plataforma Matreiro - Changelog

**Última Atualização:** 09/03/2026

---

## Como Manter Este Documento Atualizado

Sempre que houver alterações no projeto, atualize este arquivo seguindo o formato:

```markdown
## [Versão] - YYYY-MM-DD

### ✨ Adicionado
- Novas funcionalidades

### 🔧 Modificado
- Alterações em funcionalidades existentes

### 🐛 Corrigido
- Bugs corrigidos

### 🗑️ Removido
- Funcionalidades removidas

### 📚 Documentação
- Atualizações na documentação

### 🔒 Segurança
- Correções de segurança
```

---

## [1.0.0] - 09/03/2026

### ✨ Adicionado

#### Backend
- **API RESTful completa** com Django REST Framework
  - Endpoints para Tenants, Users, Campaigns, Templates, Targets, Trainings
  - Autenticação JWT com django-simplejwt
  - Sistema de permissões granulares (RBAC)
  - Paginação, filtros e busca em todos os endpoints
  
- **Multi-tenancy** com isolamento de dados
  - Middleware de tenant
  - Row-Level Security (RLS) no PostgreSQL
  - Suporte a hierarquia de tenants (clientes e sub-clientes)
  
- **Sistema de Campanhas**
  - CRUD completo de campanhas de phishing
  - Agendamento de campanhas
  - Tracking de eventos (sent, opened, clicked, submitted, reported)
  - Landing pages com captura de dados
  - Suporte a anexos em e-mails e landing pages
  
- **Sistema de Templates**
  - Editor de templates HTML
  - Variáveis dinâmicas ({{nome}}, {{email}}, etc.)
  - Categorização (credential-harvest, social-engineering, etc.)
  - Templates globais e por tenant
  
- **Gestão de Targets (Alvos)**
  - CRUD de targets
  - Importação via CSV
  - Grupos de targets
  - Sincronização com Active Directory e Google Workspace
  - Cálculo automático de risk score
  
- **Sistema de Treinamentos**
  - Múltiplos tipos (vídeo, quiz, SCORM, interativo)
  - Atribuição de treinamentos
  - Tracking de progresso
  - Quizzes com pontuação
  - Emissão de certificados
  
- **Automações**
  - Engine de automações baseado em eventos
  - Triggers: campaign_click, campaign_submit, training_fail, schedule
  - Actions: assign_training, create_campaign, send_notification
  - Logs de execução
  
- **Integrações**
  - Microsoft Active Directory / Azure AD
  - Google Workspace
  - Slack (notificações)
  - Webhooks personalizados
  
- **Audit Logs**
  - Registro de todas as ações dos usuários
  - Rastreamento de impersonation
  - Logs com IP, User Agent e detalhes
  
- **Celery Tasks**
  - Envio assíncrono de e-mails
  - Cálculo de risk scores
  - Sincronização de integrações
  - Geração de relatórios

#### Frontend
- **Sistema Multi-idioma** (PT-BR, EN, ES)
  - 200+ chaves de tradução
  - Seletor de idioma no header
  - Persistência da preferência
  
- **Autenticação Robusta**
  - Login/Logout
  - AuthBoundary para proteção de rotas
  - Integração com Keycloak
  - Suporte a JWT
  
- **Dashboard Completo**
  - Overview de campanhas, targets, treinamentos
  - Gráficos interativos (Recharts)
  - Métricas em tempo real
  - Filtros por período e tenant
  
- **Advanced Dashboard**
  - Análise de risco por departamento
  - Tendências temporais
  - Comparação de campanhas
  - Exportação de dados
  
- **Gestão de Campanhas**
  - Criação wizard-style
  - Edição inline
  - Visualização detalhada
  - Controle de status (start, pause, cancel)
  
- **Editor de Templates**
  - Editor HTML visual
  - Preview em tempo real
  - Gerenciamento de variáveis
  - Upload de anexos
  - Configuração de landing pages
  
- **Importação de Targets**
  - Upload de CSV
  - Mapeamento de colunas
  - Preview antes de importar
  - Validação de dados
  
- **Sistema de Notificações**
  - Notificações em tempo real
  - Badge de contador
  - Histórico de notificações
  
- **Seeding de Dados**
  - Botão "Popular Banco de Dados" no Dashboard
  - Criação de dados de exemplo para testes

#### Banco de Dados
- **Schema PostgreSQL completo**
  - 20+ tabelas
  - Índices otimizados
  - Full-text search
  - Triggers para updated_at
  - Views para estatísticas
  - Funções de utilidade
  
- **Particionamento**
  - Audit logs particionados por mês
  - Melhor performance em tabelas grandes
  
- **Row-Level Security (RLS)**
  - Isolamento de dados por tenant
  - Políticas de acesso granulares

#### Documentação
- **API Documentation** (API_DOCUMENTATION.md)
  - Todos os endpoints documentados
  - Exemplos de requisições e respostas
  - Schemas TypeScript
  - Rate limiting
  - Webhooks
  
- **Database Migration Guide** (DATABASE_MIGRATION.md)
  - Schema SQL completo
  - Scripts de migração
  - Procedimentos de backup/restore
  - Otimizações e índices
  - Troubleshooting
  
- **Django Documentation** (DJANGO_DOCUMENTATION.md)
  - Estrutura do projeto
  - Models, Serializers, Views
  - Autenticação e Permissões
  - Middleware e Celery
  - Testes
  
- **Changelog** (CHANGELOG.md)
  - Histórico de versões
  - Guia de atualização

### 🔧 Modificado
- **AuthBoundary** substituiu ProtectedRoute obsoleto
- **Sistema de seeding** migrado do frontend para backend
- **Keys dos componentes Recharts** removidas (gerenciadas internamente)

### 🐛 Corrigido
- **Warnings de keys duplicadas** nos gráficos do Recharts
- **Erro de autenticação** com RouterProvider resolvido
- **Importações circulares** em módulos do Django
- **Performance de queries** com índices otimizados

### 📚 Documentação
- Criada documentação completa da API
- Criado guia de migração de banco de dados
- Criada documentação do Django
- Adicionado changelog para tracking de mudanças

### 🔒 Segurança
- Implementado JWT com refresh tokens
- Row-Level Security no PostgreSQL
- Validação de entrada em todos os endpoints
- Proteção contra SQL injection
- CORS configurado corretamente
- Rate limiting em endpoints críticos
- Audit logs completos

---

## Próximas Versões

### [1.1.0] - Planejado para Q2 2026

#### 🎯 Planejado

**Backend**
- [ ] Sistema de notificações push
- [ ] Geração de relatórios PDF avançados
- [ ] API de webhooks para eventos
- [ ] Suporte a SAML 2.0
- [ ] Integração com Okta
- [ ] Sistema de tags para campanhas

**Frontend**
- [ ] Dashboard personalizável (drag-and-drop)
- [ ] Editor de templates visual (WYSIWYG avançado)
- [ ] Modo escuro
- [ ] PWA (Progressive Web App)
- [ ] Mobile app (React Native)

**Performance**
- [ ] Cache de queries com Redis
- [ ] Otimização de bundle size
- [ ] Lazy loading de componentes
- [ ] Server-side rendering (SSR)

**IA/ML**
- [ ] Detecção de fraude em provas com IA
- [ ] Recomendação de templates baseada em histórico
- [ ] Predição de risk score
- [ ] Análise de sentimento em feedbacks

### [1.2.0] - Planejado para Q3 2026

#### 🎯 Planejado

**Features**
- [ ] Marketplace de templates
- [ ] Sistema de gamificação
- [ ] Badges e conquistas
- [ ] Leaderboards
- [ ] Certificações
- [ ] Integração com LMS (Moodle, Canvas)

**Analytics**
- [ ] Google Analytics integration
- [ ] Heatmaps de interação
- [ ] Análise comportamental
- [ ] Relatórios preditivos

---

## Como Atualizar

### Para Desenvolvedores

Sempre que fizer alterações no projeto:

1. **Atualize o CHANGELOG.md**
   - Adicione uma nova seção com a data
   - Categorize as mudanças (Adicionado, Modificado, etc.)
   - Seja específico e claro

2. **Atualize a documentação relevante**
   - Se adicionar endpoints: atualize API_DOCUMENTATION.md
   - Se modificar models: atualize DJANGO_DOCUMENTATION.md
   - Se alterar schema: atualize DATABASE_MIGRATION.md

3. **Incremente a versão**
   - Semântico: MAJOR.MINOR.PATCH
   - MAJOR: mudanças incompatíveis
   - MINOR: novas funcionalidades
   - PATCH: correções de bugs

4. **Commit com mensagem descritiva**
   ```bash
   git add .
   git commit -m "feat: adiciona sistema de notificações push"
   git push origin main
   ```

### Convenção de Commits

Use commits semânticos:

- `feat:` nova funcionalidade
- `fix:` correção de bug
- `docs:` alterações na documentação
- `style:` formatação, ponto e vírgula, etc.
- `refactor:` refatoração de código
- `test:` adição ou modificação de testes
- `chore:` tarefas de manutenção

### Exemplo de Atualização

```bash
# 1. Fazer alterações
vim backend/campaigns/models.py

# 2. Atualizar documentação
vim docs/DJANGO_DOCUMENTATION.md
vim docs/CHANGELOG.md

# 3. Commit
git add .
git commit -m "feat(campaigns): adiciona campo 'priority' em Campaign model

- Adiciona campo priority (low, medium, high) em Campaign
- Atualiza serializer e migration
- Adiciona filtro por priority na API
- Atualiza documentação

Closes #123"

# 4. Push
git push origin feature/campaign-priority
```

---

## Histórico de Releases

| Versão | Data       | Highlights |
|--------|-----------|------------|
| 1.0.0  | 09/03/2026 | Release inicial completo com todas as funcionalidades core |

---

## Contribuidores

- **Under Protection Team** - Desenvolvimento inicial
- **Equipe Backend** - Django/PostgreSQL implementation
- **Equipe Frontend** - React implementation
- **DevOps** - Infrastructure e CI/CD

---

## Suporte

- **Documentação:** https://docs.matreiro.underprotection.com.br
- **Issues:** https://github.com/underprotection/matreiro-platform/issues
- **Email:** suporte@underprotection.com.br

---

**Última Atualização:** 09/03/2026  
**Versão Atual:** 1.0.0
