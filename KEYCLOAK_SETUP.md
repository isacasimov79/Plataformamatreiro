# Configuração do Keycloak - Plataforma Matreiro

## Informações de Conexão

- **URL do Keycloak**: https://iam.upn.com.br
- **Realm**: underprotection
- **Client ID**: Matreiro
- **Client Secret**: tkbSnkMzHL60DIpkdIPrmGyrtqauazsM

## URLs de Redirect Configuradas

- `http://localhost:5173/*` (desenvolvimento local)
- `http://10.35.0.39/*` (rede local)

## Configurações do Cliente

### Fluxos Habilitados
- ✅ Standard Flow (Authorization Code Flow)
- ✅ Direct Access Grants (Resource Owner Password Credentials)
- ✅ Service Accounts
- ✅ Authorization Services
- ✅ Device Authorization Grant

### Protocolos e Segurança
- **Protocolo**: OpenID Connect (OIDC)
- **PKCE**: Habilitado (S256)
- **Public Client**: Não (confidential client)
- **Front-channel Logout**: Habilitado
- **Back-channel Logout**: Habilitado

### Scopes Padrão
- service_account
- web-origins
- acr
- roles
- profile
- basic
- email

### Scopes Opcionais
- address
- phone
- offline_access
- organization
- microprofile-jwt

## Roles Esperadas

A plataforma Matreiro espera as seguintes roles no Keycloak:

### Realm Roles
- `superadmin` - Super administrador com acesso total ao sistema
- `admin` - Administrador de tenant
- `user` - Usuário regular

### Client Roles (opcional)
Você pode criar roles específicas do cliente Matreiro para controle de acesso granular.

## Atributos Customizados do Token

O sistema espera os seguintes atributos no token JWT:

```json
{
  "sub": "user-id",
  "name": "Nome Completo",
  "preferred_username": "username",
  "email": "usuario@email.com",
  "tenant_id": "tenant-uuid",
  "picture": "url-da-foto",
  "roles": ["superadmin", "admin", "user"]
}
```

## Configuração no Keycloak Admin Console

### 1. Criar Realm (se não existir)
```
1. Acesse https://iam.upn.com.br/admin
2. Clique em "Add Realm"
3. Nome: underprotection
4. Habilitar: Yes
5. Salvar
```

### 2. Criar Client
```
1. No realm "underprotection", vá em Clients > Create
2. Client ID: Matreiro
3. Client Protocol: openid-connect
4. Salvar
```

### 3. Configurar Client
```
Na aba Settings:
- Access Type: confidential
- Standard Flow Enabled: ON
- Direct Access Grants Enabled: ON
- Service Accounts Enabled: ON
- Authorization Enabled: ON
- Valid Redirect URIs: 
  - http://localhost:5173/*
  - http://10.35.0.39/*
- Web Origins: +
- Salvar

Na aba Credentials:
- Client Authenticator: Client Id and Secret
- Copiar o Secret: tkbSnkMzHL60DIpkdIPrmGyrtqauazsM
```

### 4. Criar Roles
```
1. No realm, vá em Roles > Add Role
2. Criar as seguintes roles:
   - superadmin (descrição: Super administrador da plataforma)
   - admin (descrição: Administrador de tenant)
   - user (descrição: Usuário regular)
```

### 5. Criar Usuário de Teste
```
1. Vá em Users > Add User
2. Username: igor@underprotection.com.br
3. Email: igor@underprotection.com.br
4. First Name: Igor
5. Last Name: Under Protection
6. Email Verified: ON
7. Enabled: ON
8. Salvar

Na aba Credentials:
- Definir senha temporária
- Temporary: OFF (para não pedir troca)

Na aba Role Mappings:
- Atribuir role "superadmin"
```

### 6. Configurar Token JWT
```
Na aba Client Scopes > Matreiro-dedicated:
1. Adicionar Mapper para tenant_id:
   - Name: tenant_id
   - Mapper Type: User Attribute
   - User Attribute: tenant_id
   - Token Claim Name: tenant_id
   - Claim JSON Type: String
   - Add to ID token: ON
   - Add to access token: ON
   - Add to userinfo: ON
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# API Backend URL
VITE_API_URL=http://localhost:8000/api

# Keycloak Configuration
VITE_KEYCLOAK_URL=https://iam.upn.com.br
VITE_KEYCLOAK_REALM=underprotection
VITE_KEYCLOAK_CLIENT_ID=Matreiro
```

## Fluxo de Autenticação

1. Usuário clica em "Entrar com Keycloak"
2. Sistema redireciona para: `https://iam.upn.com.br/realms/underprotection/protocol/openid-connect/auth`
3. Usuário faz login no Keycloak
4. Keycloak retorna código de autorização
5. Frontend troca código por tokens (access_token + refresh_token)
6. Sistema armazena tokens e usa access_token em todas as requisições API
7. Token é automaticamente renovado a cada 60 segundos se necessário

## Segurança

### PKCE (Proof Key for Code Exchange)
O sistema usa PKCE com SHA-256 para proteger o Authorization Code Flow contra ataques de interceptação.

### Token Refresh
- Tokens são atualizados automaticamente 30 segundos antes de expirar
- Refresh automático a cada 60 segundos
- Se refresh falhar, usuário é redirecionado para login

### Logout
O logout limpa:
- Sessão local (localStorage)
- Sessão do Keycloak (servidor)
- Tokens armazenados

## Troubleshooting

### Erro: CORS
Adicione as origens permitidas no Keycloak:
```
Client Settings > Web Origins: +
```

### Erro: Invalid Redirect URI
Verifique se a URL está exatamente como configurada no Valid Redirect URIs do client.

### Erro: Token inválido
1. Verifique se o realm está correto
2. Verifique se o client ID está correto
3. Verifique se as roles estão atribuídas ao usuário

### Usuário não consegue logar
1. Verifique se o usuário está habilitado
2. Verifique se o email está verificado
3. Verifique se a senha não é temporária
4. Verifique os logs do Keycloak

## Documentação Oficial

- [Keycloak Documentation](https://www.keycloak.org/documentation)
- [Securing Applications](https://www.keycloak.org/docs/latest/securing_apps/)
- [OIDC Flow](https://openid.net/specs/openid-connect-core-1_0.html)
