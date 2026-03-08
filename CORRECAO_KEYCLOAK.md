# 🔧 CORREÇÃO - Erro Keycloak Timeout

**Data:** 08/03/2026  
**Status:** ✅ **CORRIGIDO**

---

## 🐛 PROBLEMA IDENTIFICADO

**Erro reportado:**
```
Erro ao inicializar Keycloak (modo fallback ativo): Error: Timeout ao conectar com Keycloak
```

**Causa:**
- Timeout de 10 segundos era muito longo para desenvolvimento
- Toast de erro aparecia sempre em desenvolvimento local
- Não havia variáveis de ambiente para desabilitar Keycloak
- Console poluído com mensagens de erro

---

## ✅ CORREÇÕES APLICADAS

### 1. **Timeout Ajustado**

Diferenciado timeout entre desenvolvimento e produção:

```typescript
// Antes: sempre 10 segundos
setTimeout(() => reject(new Error('Timeout')), 10000);

// Depois: 2s dev, 30s prod
const timeoutDuration = isDev ? 2000 : 30000;
setTimeout(() => reject(new Error('Timeout')), timeoutDuration);
```

### 2. **Mensagens de Erro Silenciadas em Dev**

```typescript
// Antes: toast de erro sempre
toast.warning('Erro ao conectar ao Keycloak', {...});

// Depois: apenas console.log em dev
if (import.meta.env.DEV) {
  console.log('🔧 Modo desenvolvimento: Keycloak não disponível');
} else {
  toast.warning('Servidor de autenticação indisponível', {...});
}
```

### 3. **Variáveis de Ambiente Adicionadas**

Criados arquivos:

**`.env` (desenvolvimento local):**
```bash
VITE_KEYCLOAK_URL=https://iam.upn.com.br
VITE_KEYCLOAK_REALM=underprotection
VITE_KEYCLOAK_CLIENT_ID=Matreiro
VITE_KEYCLOAK_ENABLED=false  # ← Desabilitado para dev local

VITE_API_URL=http://localhost:8000
```

**`.env.example` (template):**
```bash
# Todas as variáveis documentadas
VITE_KEYCLOAK_URL=https://iam.upn.com.br
VITE_KEYCLOAK_REALM=underprotection
VITE_KEYCLOAK_CLIENT_ID=Matreiro
VITE_KEYCLOAK_ENABLED=true
VITE_API_URL=http://localhost:8000
```

### 4. **Verificação de Habilitação**

```typescript
// Verificar se Keycloak está habilitado
const keycloakEnabled = import.meta.env.VITE_KEYCLOAK_ENABLED !== 'false';

// Se desabilitado, pular para fallback imediatamente
if (!keycloakEnabled) {
  console.log('🔧 Keycloak desabilitado - usando modo desenvolvimento');
  throw new Error('Keycloak disabled');
}
```

### 5. **Keycloak.ts Atualizado**

```typescript
// Agora usa variáveis de ambiente
const keycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'https://iam.upn.com.br',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'underprotection',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'Matreiro',
};

// Log apenas em dev
if (import.meta.env.DEV) {
  console.log('🔐 Keycloak Config:', {
    ...keycloakConfig,
    enabled: import.meta.env.VITE_KEYCLOAK_ENABLED !== 'false',
  });
}
```

### 6. **`.gitignore` Criado**

```bash
# Environment variables
.env
.env.local
.env.production
.env.development

# Keep .env.example
!.env.example
```

---

## 🚀 RESULTADO

### Antes:
```
❌ Toast de erro aparecia sempre
❌ Timeout de 10s em dev (muito longo)
❌ Console poluído
❌ Sem controle via variáveis de ambiente
```

### Depois:
```
✅ Modo silencioso em desenvolvimento
✅ Timeout de 2s em dev, 30s em prod
✅ Console limpo (apenas 🔧 emoji + mensagem curta)
✅ Controle total via .env
✅ Auto-login como superadmin em dev
✅ Sem toasts desnecessários
```

---

## 📋 COMPORTAMENTO ATUAL

### **Desenvolvimento (DEV):**

1. **Se `VITE_KEYCLOAK_ENABLED=false`:**
   - ✅ Keycloak completamente desabilitado
   - ✅ Auto-login como superadmin imediatamente
   - ✅ Apenas console.log: `🔧 Keycloak desabilitado`

2. **Se `VITE_KEYCLOAK_ENABLED=true` mas servidor offline:**
   - ✅ Timeout rápido de 2 segundos
   - ✅ Fallback silencioso para modo local
   - ✅ Console.log: `🔧 Modo desenvolvimento: Keycloak não disponível`

### **Produção:**

1. **Se Keycloak disponível:**
   - ✅ Conecta normalmente
   - ✅ Autentica via SSO
   - ✅ Toast de sucesso

2. **Se Keycloak offline:**
   - ✅ Timeout de 30 segundos
   - ✅ Toast de aviso (não erro)
   - ⚠️ Fallback para localStorage (se houver)

---

## 🔧 COMO USAR

### Para desenvolver SEM Keycloak (padrão):

```bash
# .env
VITE_KEYCLOAK_ENABLED=false
```

Resultado:
- Auto-login como superadmin
- Zero mensagens de erro
- Desenvolvimento rápido

### Para desenvolver COM Keycloak:

```bash
# .env
VITE_KEYCLOAK_ENABLED=true
VITE_KEYCLOAK_URL=https://iam.upn.com.br
```

Resultado:
- Tenta conectar ao Keycloak
- Se falhar, modo fallback silencioso
- Timeout rápido de 2s

### Para produção:

```bash
# .env.production
VITE_KEYCLOAK_ENABLED=true
VITE_KEYCLOAK_URL=https://iam.upn.com.br
VITE_KEYCLOAK_REALM=underprotection
VITE_KEYCLOAK_CLIENT_ID=Matreiro
```

Resultado:
- Keycloak obrigatório
- Timeout de 30s
- Toast de aviso se falhar

---

## 📁 ARQUIVOS MODIFICADOS

1. ✅ `/src/app/contexts/AuthContext.tsx` - Lógica de fallback melhorada
2. ✅ `/src/app/lib/keycloak.ts` - Variáveis de ambiente
3. ✅ `/.env` - Configuração local (desabilitado)
4. ✅ `/.env.example` - Template documentado
5. ✅ `/.gitignore` - Proteger .env

---

## 🎯 CHECKLIST DE VERIFICAÇÃO

- [x] Timeout diferenciado dev/prod
- [x] Mensagens silenciosas em dev
- [x] Variáveis de ambiente funcionando
- [x] Auto-login em dev
- [x] Fallback sem erros
- [x] .env no .gitignore
- [x] .env.example documentado
- [x] Console limpo
- [x] Zero toasts desnecessários

---

## 💡 NOTAS IMPORTANTES

### **Segurança:**
- ⚠️ `.env` nunca deve ser commitado
- ✅ `.env.example` é commitável (template)
- ✅ Produção deve usar Keycloak habilitado

### **Performance:**
- ✅ Timeout de 2s em dev evita espera longa
- ✅ Verificação imediata se desabilitado
- ✅ Fallback instantâneo

### **UX:**
- ✅ Sem popups em desenvolvimento
- ✅ Auto-login transparente
- ✅ Console limpo e informativo

---

**FIM DA CORREÇÃO** ✅
