# 🚀 Início Rápido - Desenvolvedor

**Para:** Desenvolvedores que querem rodar a plataforma imediatamente  
**Tempo estimado:** 2 minutos

---

## ⚡ TL;DR - Como Rodar AGORA

```bash
# Apenas isso! 
npm run dev
# ou
npm start
```

**Pronto!** 🎉

- Aplicação abre em: http://localhost:5173
- Auto-login como: **igor@underprotection.com.br** (superadmin)
- Sem necessidade de senha
- Sem necessidade de configurar Keycloak
- Sem necessidade de backend rodando

---

## ✅ O que JÁ está Funcionando

### 1. **Autenticação** 🔐
- ✅ Auto-login automático em modo desenvolvimento
- ✅ Sessão persistida no localStorage
- ✅ Usuário: Igor (Superadmin)
- ✅ Impersonation de clientes habilitado

### 2. **Interface Completa** 🎨
- ✅ **19 páginas** totalmente funcionais
- ✅ **Sistema multi-idioma**: PT-BR (padrão), EN, ES
- ✅ **200+ traduções** implementadas
- ✅ Troca de idioma em tempo real

### 3. **Páginas Principais** 📱
| Rota | Página | Status |
|------|--------|--------|
| `/` | Dashboard | ✅ Funcionando |
| `/analytics` | Analytics Avançado | ✅ Funcionando |
| `/tenants` | Gerenciar Clientes | ✅ Funcionando |
| `/campaigns` | Campanhas de Phishing | ✅ Funcionando |
| `/templates` | Templates de Email | ✅ Funcionando |
| `/landing-pages` | Landing Pages | ✅ Funcionando |
| `/reports` | Relatórios | ✅ Funcionando |
| `/trainings` | Treinamentos | ✅ Funcionando |
| `/certificates` | Certificados | ✅ Funcionando |
| `/targets` | Alvos | ✅ Funcionando |
| `/target-groups` | Grupos de Alvos | ✅ Funcionando |
| `/automations` | Automações | ✅ Funcionando |
| `/system-users` | Usuários do Sistema | ✅ Funcionando |
| `/permissions` | Permissões | ✅ Funcionando |
| `/integrations` | Integrações | ✅ Funcionando |
| `/notifications` | Notificações | ✅ Funcionando |
| `/audit-logs` | Logs de Auditoria | ✅ Funcionando |
| `/settings` | Configurações | ✅ Funcionando |
| `/debug` | Debug (Dev only) | ✅ Funcionando |

### 4. **Funcionalidades Especiais** ⭐
- ✅ **Gráficos interativos** (Recharts)
- ✅ **Editor WYSIWYG** para templates
- ✅ **Upload de arquivos** (UI pronta)
- ✅ **Filtros avançados** em todas as listas
- ✅ **Exportação** para CSV/PDF
- ✅ **Impersonation** de clientes

---

## 🎯 Como Usar

### Navegação Principal

A sidebar esquerda contém todas as seções:

```
🏠 Dashboard         - Métricas gerais
📊 Analytics         - Análises avançadas
🏢 Tenants          - Gestão de clientes (Superadmin)
📧 Campanhas        - Phishing simulado
📄 Templates        - Templates de email
🌐 Landing Pages    - Páginas de captura
📈 Relatórios       - Reports detalhados
🎓 Treinamentos     - Módulos educacionais
🏆 Certificados     - Certificados digitais
🎯 Alvos            - Usuários alvo
📁 Grupos           - Segmentação
⚡ Automações       - Fluxos automáticos
👥 Usuários         - Sistema
🛡️ Permissões      - RBAC (Superadmin)
🔌 Integrações      - AD/Azure/Google
🔔 Notificações     - Central
📋 Audit Logs       - Auditoria
⚙️ Configurações    - Sistema
🐛 Debug            - Dev tools (Superadmin)
```

### Impersonation (Superadmin)

Como Igor (superadmin), você pode visualizar como qualquer cliente:

1. Clique no **select no topo da página** (mostra "Visualização Master")
2. Selecione um cliente
3. A interface muda para a visão daquele cliente
4. Para voltar, selecione "Master (Visão Geral)"

### Trocar Idioma

1. Clique no **ícone de globo** no canto superior direito
2. Selecione PT-BR, EN ou ES
3. Interface traduz instantaneamente

---

## 🔧 Backend e Dados

### Backend Supabase

O backend está configurado em `/supabase/functions/server/index.tsx`, mas pode não estar rodando no Figma Make.

**Não há problema!** A aplicação foi configurada para funcionar com fallback:

- ✅ Dashboard carrega com arrays vazios
- ✅ Sem mensagens de erro irritantes
- ✅ Logs de warning no console (apenas para debug)
- ✅ Interface totalmente navegável

### Popular com Dados

Se o backend estiver rodando, você pode popular o banco:

1. Vá para o **Dashboard** (`/`)
2. Procure o componente **"DatabaseSeeder"** no topo
3. Clique em **"Popular Banco de Dados"**
4. Dados de exemplo serão inseridos

**Dados incluídos:**
- 5 tenants (clientes)
- 10 templates de email
- 8 campanhas simuladas
- 50 targets (usuários)

---

## 🎨 Design System

### Cores Oficiais Under Protection

```css
Navy Blue:   #242545  /* Cor principal */
Uva/Roxo:    #834a8b  /* Destaque */
Grafite:     #4a4a4a  /* Secundário */
```

### Tipografia

```css
Font-family: Montserrat
```

### Componentes UI

Todos os componentes seguem o padrão Radix UI + shadcn/ui:

```tsx
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { Dialog } from './components/ui/dialog';
// ... e mais 40+ componentes
```

---

## 🐛 Debug e Logs

### Console do Navegador

Abra o DevTools (F12) e veja logs úteis:

```
🔑 AuthProvider - Inicializando...
🔧 Keycloak desabilitado - usando modo desenvolvimento
🔧 Auto-login como superadmin
🔑 AuthProvider - Inicialização completa. User: true
📊 Dashboard data loaded: { tenants: 0, ... }
```

### Página de Debug

Vá para `/debug` (superadmin only) para:
- Ver informações técnicas
- Estado da aplicação
- Logs do sistema
- Testar APIs

---

## 📁 Estrutura de Código

### Importante para Desenvolvimento

```
src/app/
├── components/        # Componentes reutilizáveis
│   ├── ui/           # Componentes base (Button, Card, etc.)
│   ├── Layout.tsx    # Layout principal com sidebar
│   └── ...           # Diálogos específicos
├── contexts/         
│   └── AuthContext.tsx  # ⚠️ Autenticação (NÃO MODIFICAR sem motivo)
├── pages/            # Páginas da aplicação
│   ├── Dashboard.tsx # Dashboard principal
│   └── ...
├── lib/
│   ├── api.ts        # Cliente HTTP
│   ├── keycloak.ts   # Config Keycloak
│   └── mockData.ts   # Dados mock
└── routes.ts         # ⚠️ Rotas (NÃO MODIFICAR estrutura)
```

### Arquivos Protegidos (NÃO MODIFICAR)

```
⚠️ /src/app/contexts/AuthContext.tsx
⚠️ /src/app/routes.ts
⚠️ /src/app/components/AuthBoundary.tsx
⚠️ /supabase/functions/server/kv_store.tsx
⚠️ /utils/supabase/info.tsx
```

---

## 🚨 Problemas Comuns

### Tela Branca / Não Carrega

**Já foi resolvido!** Mas se acontecer novamente:

1. Abra o console (F12)
2. Veja se há erros vermelhos
3. Tente recarregar (Ctrl+R ou Cmd+R)
4. Em último caso: limpe o cache e localStorage

```javascript
// Console do navegador
localStorage.clear();
window.location.reload();
```

### Backend não responde

**Normal!** A aplicação funciona sem backend. Mas se quiser ativar:

1. Verifique se Supabase Edge Functions está rodando
2. Veja logs no console
3. Use o DatabaseSeeder para popular dados

### Keycloak demora muito

**Não deveria acontecer!** Keycloak está desabilitado por padrão.

Se aparecer tela "Conectando ao Keycloak...":

```bash
# Garanta que não há arquivo .env com VITE_KEYCLOAK_ENABLED=true
# Se houver, remova ou altere para:
VITE_KEYCLOAK_ENABLED=false
```

---

## 🎓 Aprendendo o Código

### Como Criar uma Nova Página

```tsx
// 1. Criar arquivo: src/app/pages/MinhaPage.tsx
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export function MinhaPage() {
  const { user } = useAuth();
  const { t } = useTranslation();
  
  return (
    <div className="p-8">
      <h1>{t('minhaPage.titulo')}</h1>
      <p>Olá, {user?.name}!</p>
    </div>
  );
}

// 2. Adicionar rota em src/app/routes.ts
import { MinhaPage } from './pages/MinhaPage';

// Dentro do array de children:
{ path: 'minha-page', Component: MinhaPage },

// 3. Adicionar no menu (Layout.tsx)
{ nameKey: 'nav.minhaPage', href: '/minha-page', icon: Star },

// 4. Adicionar tradução (src/i18n/locales/pt-BR.json)
"nav": {
  "minhaPage": "Minha Página"
},
"minhaPage": {
  "titulo": "Minha Nova Página"
}
```

### Como Usar Componentes UI

```tsx
import { Button } from './components/ui/button';
import { Card, CardHeader, CardContent } from './components/ui/card';
import { Dialog, DialogTrigger, DialogContent } from './components/ui/dialog';

function ExemploComponentes() {
  return (
    <Card>
      <CardHeader>
        <h2>Título</h2>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Abrir Dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <p>Conteúdo do dialog</p>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
```

### Como Fazer Requisições API

```tsx
import { getTenants, createTenant } from '../lib/supabaseApi';

async function carregarDados() {
  try {
    const tenants = await getTenants();
    console.log('Tenants:', tenants);
  } catch (error) {
    console.error('Erro:', error);
  }
}
```

---

## 📖 Documentação Adicional

### Para Entender o Projeto

1. **[STATUS_ATUAL_PLATAFORMA.md](./STATUS_ATUAL_PLATAFORMA.md)** - Visão geral completa
2. **[CORRECAO_CARREGAMENTO.md](./CORRECAO_CARREGAMENTO.md)** - Problema recente resolvido
3. **[README.md](./README.md)** - Documentação principal

### Para Aprofundar

4. **[AUTHENTICATION.md](./AUTHENTICATION.md)** - Como funciona a autenticação
5. **[/docs/API_DOCUMENTATION.md](/docs/API_DOCUMENTATION.md)** - API completa (63 endpoints)
6. **[/docs/DATABASE_MIGRATION.md](/docs/DATABASE_MIGRATION.md)** - Schema do banco

---

## 🎯 Próximos Passos Sugeridos

### Se você é novo no projeto:

1. ✅ **Rodar a aplicação** (você já fez!)
2. ✅ **Explorar todas as páginas** (navegue pelo menu lateral)
3. ✅ **Testar o impersonation** (select no topo)
4. ✅ **Trocar idiomas** (ícone de globo)
5. ✅ **Abrir o console** (F12) para ver logs
6. ✅ **Ler STATUS_ATUAL_PLATAFORMA.md** para entender o contexto

### Se você vai desenvolver:

1. ✅ **Ler estrutura de pastas** (acima)
2. ✅ **Entender o AuthContext** (autenticação)
3. ✅ **Ver componentes UI** (src/app/components/ui/)
4. ✅ **Estudar rotas** (src/app/routes.ts)
5. ✅ **Criar uma página de teste** (seguir tutorial acima)

### Se você vai fazer deploy:

1. 📖 **Ler KEYCLOAK_SETUP.md** (autenticação produção)
2. 📖 **Configurar variáveis de ambiente**
3. 📖 **Verificar backend Supabase**
4. 📖 **Testar integração com Keycloak**

---

## 💡 Dicas Profissionais

### Performance

- ✅ **Code splitting** já está configurado (por rota)
- ✅ **Lazy loading** para componentes pesados
- ✅ **Memoização** em componentes críticos

### Debugging

```tsx
// Use React DevTools
// Instale: https://chrome.google.com/webstore/detail/react-developer-tools/

// Veja o estado do AuthContext:
import { useAuth } from './contexts/AuthContext';
console.log('Auth State:', useAuth());
```

### Estilização

```tsx
// Use Tailwind CSS classes
<div className="p-4 bg-[#242545] text-white rounded-lg">
  Conteúdo
</div>

// Para cores customizadas Under Protection:
className="bg-[#242545]"  // Navy
className="bg-[#834a8b]"  // Uva
className="bg-[#4a4a4a]"  // Grafite
```

---

## 🚀 Comandos Úteis

```bash
# Rodar aplicação
npm run dev
npm start

# Build para produção
npm run build

# Preview do build
npm run preview

# Instalar pacote
npm install nome-do-pacote

# Remover node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 Pronto para Começar!

Agora você tem tudo que precisa para:
- ✅ Rodar a aplicação
- ✅ Navegar pela interface
- ✅ Entender a estrutura
- ✅ Começar a desenvolver

**Divirta-se codando! 🚀**

---

**Desenvolvido com ❤️ para a Plataforma Matreiro - Under Protection**  
**Sistema de Conscientização em Segurança da Informação**
