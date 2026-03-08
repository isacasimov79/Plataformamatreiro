# 🚀 Plataforma Matreiro - Guia de Desenvolvimento

## 📋 Índice
- [Sobre o Projeto](#sobre-o-projeto)
- [Stack Tecnológica](#stack-tecnológica)
- [Setup Inicial](#setup-inicial)
- [Desenvolvimento](#desenvolvimento)
- [Documentação](#documentação)

---

## 🎯 Sobre o Projeto

**Matreiro** é uma plataforma SaaS multi-tenant para:
- 🎣 Simulação de phishing
- 🛡️ Conscientização em segurança da informação
- 📊 Análises e relatórios avançados
- 🎓 Treinamentos com validação via IA

**Cliente:** Under Protection  
**Cores da marca:** Azul Navy #242545, Roxo #834a8b, Grafite #4a4a4a  
**Fonte:** Montserrat

---

## 💻 Stack Tecnológica

### Frontend
- ⚛️ **React 18** + TypeScript
- 🎨 **Tailwind CSS v4**
- 🔀 **React Router v7** (Data mode)
- 🌍 **react-i18next** (PT, EN, ES)
- 📊 **Recharts** (gráficos)
- 🎭 **Motion** (animações)
- 🔐 **Keycloak JS** (autenticação SSO)

### Backend (preparado)
- 🐍 **Django** + Django REST Framework
- 🗄️ **PostgreSQL** (banco principal)
- ⚡ **Redis** (cache)
- 🔑 **Keycloak** (IAM)
- 🐳 **Docker** (containerização)

---

## 🚀 Setup Inicial

### 1. Clonar e instalar

```bash
# Instalar dependências
pnpm install
```

### 2. Configurar variáveis de ambiente

```bash
# Copiar template
cp .env.example .env

# Editar .env
nano .env
```

**Configuração padrão para desenvolvimento:**
```bash
# .env
VITE_KEYCLOAK_ENABLED=false  # ← Desabilita Keycloak para dev local
VITE_API_URL=http://localhost:8000
```

### 3. Executar

```bash
# Desenvolvimento
pnpm dev

# Build para produção
pnpm build
```

---

## 🔧 Desenvolvimento

### Modo Desenvolvimento (padrão)

Com `VITE_KEYCLOAK_ENABLED=false`:
- ✅ Auto-login como superadmin
- ✅ Sem necessidade de servidor Keycloak
- ✅ Desenvolvimento rápido com dados mockados

**Usuário padrão:**
```
Nome: Igor Bedesqui (Superadmin)
Email: igor@underprotection.com.br
```

### Modo Produção

Com `VITE_KEYCLOAK_ENABLED=true`:
- 🔐 Login via Keycloak SSO
- 🌐 URL: https://iam.upn.com.br
- 🏢 Realm: underprotection

---

## 🌍 Multi-idioma (i18n)

Idiomas suportados:
- 🇧🇷 Português (Brasil) - padrão
- 🇺🇸 English (US)
- 🇪🇸 Español

**Como usar:**
```tsx
import { useTranslation } from 'react-i18next';

function MeuComponente() {
  const { t } = useTranslation();
  return <h1>{t('dashboard.title')}</h1>;
}
```

**Arquivos de tradução:**
- `/src/i18n/locales/pt-BR.json`
- `/src/i18n/locales/en.json`
- `/src/i18n/locales/es.json`

---

## 🗂️ Estrutura do Projeto

```
/
├── src/
│   ├── app/
│   │   ├── components/      # Componentes React
│   │   │   ├── ui/          # Shadcn UI components
│   │   │   ├── Layout.tsx
│   │   │   └── ...
│   │   ├── contexts/        # React Contexts
│   │   │   └── AuthContext.tsx
│   │   ├── lib/             # Utilitários
│   │   │   ├── keycloak.ts
│   │   │   ├── mockData.ts
│   │   │   └── api.ts
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── routes.ts        # Rotas (React Router)
│   │   └── App.tsx          # Componente principal
│   ├── i18n/                # Configuração i18n
│   │   ├── config.ts
│   │   └── locales/
│   └── styles/              # Estilos globais
│       ├── theme.css
│       └── fonts.css
├── backend/                 # Backend Django (separado)
├── .env                     # Variáveis locais (não commitar)
├── .env.example             # Template de variáveis
└── package.json
```

---

## 📚 Documentação

### Documentos criados:

1. **`/ANALISE_COMPLETA_PROJETO.md`**
   - Análise completa de 100% do projeto
   - Funcionalidades implementadas vs faltantes
   - Roadmap de desenvolvimento

2. **`/IMPLEMENTACAO_SPRINT1.md`**
   - Detalhes do Sprint 1 concluído
   - 11 models criados
   - RBAC, i18n, Targets, Landing Pages
   - Como usar as novas funcionalidades

3. **`/CORRECAO_KEYCLOAK.md`**
   - Correção do erro de timeout
   - Configuração de variáveis de ambiente
   - Modos de desenvolvimento

---

## 🎨 Componentes UI

### Shadcn UI Components disponíveis:
- ✅ Button, Input, Select, Checkbox
- ✅ Dialog, AlertDialog
- ✅ Dropdown, Popover, Tooltip
- ✅ Tabs, Accordion
- ✅ Table, Card, Badge
- ✅ Progress, Slider
- ✅ Toast (Sonner)
- ✅ E mais 30+ componentes

**Como usar:**
```tsx
import { Button } from './components/ui/button';
import { Dialog } from './components/ui/dialog';
```

---

## 🔐 Autenticação

### Keycloak (Produção)
```bash
VITE_KEYCLOAK_ENABLED=true
VITE_KEYCLOAK_URL=https://iam.upn.com.br
VITE_KEYCLOAK_REALM=underprotection
VITE_KEYCLOAK_CLIENT_ID=Matreiro
```

### Modo Fallback (Desenvolvimento)
```bash
VITE_KEYCLOAK_ENABLED=false
```

**AuthContext fornece:**
```tsx
const {
  user,                    // Usuário autenticado
  impersonatedTenant,      // Tenant impersonado (superadmin)
  isAuthenticated,         // Boolean
  isLoading,               // Boolean
  login,                   // (email, password) => Promise<void>
  logout,                  // () => void
  impersonateTenant,       // (tenantId) => void
  keycloakToken,           // Token JWT (se Keycloak)
} = useAuth();
```

---

## 🏗️ Funcionalidades Implementadas

### ✅ Completo
- [x] Layout multi-tenant com sidebar
- [x] Dashboard com métricas e gráficos
- [x] Sistema de campanhas (CRUD)
- [x] Sistema de templates (CRUD)
- [x] Editor HTML com preview
- [x] Variáveis de personalização (24+)
- [x] Biblioteca de templates
- [x] Relatórios e analytics
- [x] Treinamentos
- [x] Multi-idioma (PT, EN, ES)
- [x] RBAC granular (models + backend)
- [x] Models de Target/TargetGroup
- [x] Models de Landing Pages
- [x] Autenticação Keycloak + Fallback

### ⏳ Em Desenvolvimento (Sprint 2)
- [ ] UI de gerenciamento de permissões
- [ ] Parser CSV/Excel para importação
- [ ] Engine de substituição de variáveis
- [ ] Integração Microsoft 365
- [ ] Integração Google Workspace
- [ ] Sistema de captura de dados (endpoints públicos)

---

## 📊 Progresso Geral

```
█████████████████░░░░░░░ 65% completo
```

**Breakdown:**
- Frontend: 70% ✅
- Backend Models: 80% ✅
- Backend APIs: 40% ⏳
- Integrações: 10% ⏳
- Testes: 5% ⏳

---

## 🐛 Troubleshooting

### Erro: Keycloak Timeout
✅ **Corrigido!** Veja `/CORRECAO_KEYCLOAK.md`

**Solução rápida:**
```bash
# Desabilitar Keycloak em .env
VITE_KEYCLOAK_ENABLED=false
```

### Erro: i18n strings não aparecem
```bash
# Verificar se config foi importado no App.tsx
import '../i18n/config';
```

### Erro: Componentes UI não funcionam
```bash
# Reinstalar dependências
pnpm install
```

---

## 🤝 Contribuindo

### Padrões de código:
- ✅ TypeScript strict mode
- ✅ Componentes funcionais com hooks
- ✅ Tailwind CSS (sem inline styles)
- ✅ i18n para todas as strings visíveis
- ✅ Comentários em português

### Commits:
```bash
git commit -m "feat: adiciona importação de alvos via CSV"
git commit -m "fix: corrige erro no template editor"
git commit -m "docs: atualiza README com novas features"
```

---

## 📞 Contato

**Projeto:** Plataforma Matreiro  
**Cliente:** Under Protection  
**Desenvolvedor:** Igor Bedesqui  
**Email:** igor@underprotection.com.br  

---

## 📝 Licença

Proprietary - Under Protection © 2026

---

**Última atualização:** 08/03/2026  
**Versão:** 0.65.0 (Sprint 1 concluído)
