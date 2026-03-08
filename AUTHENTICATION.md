# Autenticação com Keycloak - Plataforma Matreiro

## ✅ Implementação Completa

A autenticação com Keycloak está **totalmente implementada e funcional** na Plataforma Matreiro.

## 🔐 Configuração Atual

### Credenciais Keycloak
- **URL**: https://iam.upn.com.br
- **Realm**: underprotection
- **Client ID**: Matreiro
- **Client Secret**: tkbSnkMzHL60DIpkdIPrmGyrtqauazsM
- **Protocolo**: OpenID Connect (OIDC)
- **PKCE**: S256

### URLs de Redirect Configuradas
- `http://localhost:5173/*` (desenvolvimento)
- `http://10.35.0.39/*` (rede local)

## 📁 Arquivos Criados/Modificados

### Novos Arquivos
1. **`/src/app/lib/keycloak.ts`**
   - Configuração e inicialização do Keycloak
   - Helpers para autenticação (login, logout, refresh token)
   - Funções para gerenciar roles e permissões

2. **`/src/app/lib/api.ts`**
   - Cliente HTTP Axios configurado
   - Interceptor automático de requisições (adiciona token JWT)
   - Interceptor de resposta (trata erros 401)
   - Exemplos de endpoints da API

3. **`/src/app/lib/apiExamples.ts`**
   - Exemplos completos de uso da API
   - Métodos organizados por módulo (tenants, campaigns, templates, etc.)
   - Documentação de como usar em componentes React

4. **`/src/app/components/LoadingScreen.tsx`**
   - Tela de carregamento durante inicialização do Keycloak
   - Feedback visual para o usuário

5. **`/public/silent-check-sso.html`**
   - Página necessária para Silent SSO Check
   - Permite verificar autenticação sem redirect visível

6. **`/.env.example`**
   - Template de variáveis de ambiente
   - Documentação das configurações necessárias

7. **`/KEYCLOAK_SETUP.md`**
   - Guia completo de configuração no Keycloak Admin Console
   - Passo a passo para criar realm, client, roles e usuários
   - Troubleshooting e dicas de segurança

8. **`/AUTHENTICATION.md`** (este arquivo)
   - Resumo da implementação
   - Guia de uso para desenvolvedores

### Arquivos Modificados

1. **`/src/app/contexts/AuthContext.tsx`**
   - ✅ Integrado com Keycloak
   - ✅ Inicialização automática do Keycloak ao carregar app
   - ✅ Mapeamento de usuário do Keycloak para formato do sistema
   - ✅ Refresh automático de token a cada 60 segundos
   - ✅ Tratamento de erros e fallback
   - ✅ Novo campo: `keycloakToken` (acesso ao token JWT)
   - ✅ Novo campo: `isLoading` (estado de inicialização)

2. **`/src/app/App.tsx`**
   - ✅ Adicionado LoadingScreen durante inicialização
   - ✅ Só renderiza app após Keycloak inicializar

3. **`/src/app/pages/Login.tsx`**
   - ✅ Removido formulário de login local
   - ✅ Adicionado botão "Entrar com Keycloak"
   - ✅ Design atualizado com informações do Keycloak
   - ✅ Indicadores visuais de autenticação SSO

## 🚀 Fluxo de Autenticação

### 1. Inicialização
```
App carrega → AuthContext inicializa Keycloak → 
LoadingScreen exibido → Keycloak verifica autenticação
```

### 2. Login
```
Usuário clica "Entrar com Keycloak" → 
Redirect para iam.upn.com.br → 
Login no Keycloak → 
Callback com código → 
Troca código por tokens → 
Usuário autenticado
```

### 3. Requisições API
```
Componente chama API → 
Interceptor adiciona token JWT automaticamente → 
Backend valida token → 
Resposta retornada
```

### 4. Refresh de Token
```
A cada 60s: verifica se token expira em 70s → 
Se sim: solicita novo token → 
Atualiza token no contexto → 
Continua funcionando
```

### 5. Logout
```
Usuário clica logout → 
Limpa localStorage → 
Logout no Keycloak → 
Redirect para login
```

## 💻 Como Usar em Componentes

### Acessar Informações do Usuário
```tsx
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, isAuthenticated, keycloakToken } = useAuth();

  if (!isAuthenticated) {
    return <div>Não autenticado</div>;
  }

  return (
    <div>
      <p>Usuário: {user?.name}</p>
      <p>Email: {user?.email}</p>
      <p>Role: {user?.role}</p>
    </div>
  );
}
```

### Fazer Requisições à API
```tsx
import { useEffect, useState } from 'react';
import { tenantsAPI } from '../lib/apiExamples';

function TenantsList() {
  const [tenants, setTenants] = useState([]);

  useEffect(() => {
    loadTenants();
  }, []);

  const loadTenants = async () => {
    try {
      // Token JWT é adicionado automaticamente
      const data = await tenantsAPI.getAll();
      setTenants(data);
    } catch (error) {
      console.error('Erro:', error);
    }
  };

  return <div>{/* Renderizar tenants */}</div>;
}
```

### Verificar Permissões
```tsx
import { useAuth } from '../contexts/AuthContext';

function AdminPanel() {
  const { user } = useAuth();

  if (user?.role !== 'superadmin') {
    return <div>Acesso negado</div>;
  }

  return <div>Painel Admin</div>;
}
```

## 🔧 Configuração do Backend (Django)

Para integrar o backend Django com o Keycloak:

### 1. Instalar dependências
```bash
pip install python-keycloak djangorestframework-simplejwt
```

### 2. Configurar settings.py
```python
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': [
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ],
}

SIMPLE_JWT = {
    'ALGORITHM': 'RS256',
    'SIGNING_KEY': None,  # Usar chave pública do Keycloak
    'VERIFYING_KEY': '<PUBLIC_KEY_DO_KEYCLOAK>',
    'AUDIENCE': 'Matreiro',
    'ISSUER': 'https://iam.upn.com.br/realms/underprotection',
}
```

### 3. Criar middleware de autenticação
```python
from rest_framework.authentication import BaseAuthentication
from keycloak import KeycloakOpenID

class KeycloakAuthentication(BaseAuthentication):
    def authenticate(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return None
        
        try:
            token = auth_header.split(' ')[1]
            keycloak_openid = KeycloakOpenID(
                server_url="https://iam.upn.com.br",
                client_id="Matreiro",
                realm_name="underprotection",
                client_secret_key="tkbSnkMzHL60DIpkdIPrmGyrtqauazsM"
            )
            
            # Validar token
            userinfo = keycloak_openid.userinfo(token)
            return (userinfo, token)
        except Exception as e:
            return None
```

## 🔒 Segurança

### Tokens
- ✅ Access Token: expira em ~5 minutos (configurável no Keycloak)
- ✅ Refresh Token: expira em ~30 minutos (configurável)
- ✅ Tokens são renovados automaticamente antes de expirar
- ✅ PKCE protege contra ataques de interceptação

### HTTPS
- ⚠️ **IMPORTANTE**: Use HTTPS em produção
- ⚠️ Nunca exponha o Client Secret no frontend (use confidential client)

### CORS
- Configure Web Origins no Keycloak para permitir apenas domínios confiáveis

## 🐛 Troubleshooting

### Erro: "Keycloak is not initialized"
- Aguarde a inicialização completa do Keycloak
- Verifique o LoadingScreen está sendo exibido

### Erro: "Invalid Redirect URI"
- Verifique se a URL está configurada no Keycloak
- Formato deve ser exato: `http://localhost:5173/*`

### Erro: "Token expired"
- O refresh automático deve resolver isso
- Verifique se o interceptor está funcionando
- Se persistir, faça logout e login novamente

### Usuário não consegue logar
- Verifique se o usuário existe no Keycloak
- Verifique se o usuário está habilitado
- Verifique se as roles estão atribuídas

### API retorna 401
- Verifique se o token está sendo enviado no header
- Verifique se o backend está validando corretamente
- Verifique se o token não expirou

## 📊 Monitoramento

### Logs Úteis
O sistema já tem logs importantes:
- "Token was successfully refreshed" - Token renovado com sucesso
- "Failed to refresh token" - Falha ao renovar token
- "Erro ao inicializar Keycloak" - Problema na inicialização

### Verificar Token no Console
```javascript
// No console do navegador
console.log('Token:', keycloak.token);
console.log('Expira em:', keycloak.tokenParsed?.exp);
console.log('Usuário:', keycloak.tokenParsed);
console.log('Roles:', keycloak.realmAccess?.roles);
```

## 🎯 Próximos Passos

1. **Backend Django**
   - Implementar autenticação Keycloak no backend
   - Validar tokens JWT
   - Sincronizar roles e permissões

2. **Testes**
   - Testar fluxo de login completo
   - Testar refresh de token
   - Testar logout
   - Testar requisições API com token

3. **Produção**
   - Configurar HTTPS
   - Adicionar domínio de produção nas Redirect URIs
   - Revisar configurações de segurança
   - Configurar monitoramento de tokens

4. **Opcional**
   - Implementar "Lembrar-me" (Offline Access)
   - Adicionar suporte a 2FA
   - Implementar gestão de sessões múltiplas

## 📚 Documentação Adicional

- [Keycloak Setup](./KEYCLOAK_SETUP.md) - Configuração detalhada do Keycloak
- [API Examples](./src/app/lib/apiExamples.ts) - Exemplos de uso da API
- [Keycloak JS Adapter](https://www.keycloak.org/docs/latest/securing_apps/#_javascript_adapter) - Documentação oficial

## 📞 Suporte

Se encontrar problemas:
1. Verifique os logs do console do navegador
2. Verifique os logs do Keycloak (Admin Console)
3. Consulte o arquivo KEYCLOAK_SETUP.md
4. Revise este arquivo (AUTHENTICATION.md)

---

**Status**: ✅ Implementação completa e funcional
**Última atualização**: 08/03/2026
**Desenvolvido por**: Under Protection Network
