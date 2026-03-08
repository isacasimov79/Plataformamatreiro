# 🔧 Troubleshooting - Plataforma Matreiro

## ❌ Problema: Tela travada em "Conectando ao Keycloak..."

### Causa Provável
O frontend não consegue se conectar ao servidor Keycloak em `https://iam.upn.com.br`

### Soluções

#### ✅ Solução 1: Usar Modo Desenvolvimento Local
1. Aguarde 5 segundos
2. Aparecerá um botão "Usar Modo Desenvolvimento"
3. Clique no botão
4. O sistema recarregará em modo local (sem Keycloak)

**OU**

1. Abra o Console do navegador (F12)
2. Verifique se há erros relacionados a CORS ou Network
3. Aguarde 10 segundos - o sistema tem timeout automático
4. Sistema ativará modo fallback automaticamente

#### ✅ Solução 2: Verificar Conectividade com Keycloak

**Passo 1: Testar URL do Keycloak**
```bash
# No terminal
curl https://iam.upn.com.br/realms/underprotection/.well-known/openid-configuration
```

Se retornar JSON, o Keycloak está acessível ✅  
Se der erro, o Keycloak está inacessível ❌

**Passo 2: Testar no Navegador**
1. Abra uma nova aba
2. Acesse: https://iam.upn.com.br/realms/underprotection/.well-known/openid-configuration
3. Se aparecer JSON, está funcionando
4. Se der erro de certificado ou timeout, há problema de conectividade

#### ✅ Solução 3: Desabilitar Keycloak Temporariamente

Edite `/src/app/contexts/AuthContext.tsx` e comente a inicialização:

```typescript
useEffect(() => {
  // Modo de desenvolvimento forçado
  setUser(superadminUser);
  localStorage.setItem('matreiro_user', JSON.stringify(superadminUser));
  setIsLoading(false);
  
  // Comentar tudo abaixo para desabilitar Keycloak
  /*
  const initKeycloak = async () => {
    // ... código do Keycloak
  };
  initKeycloak();
  */
}, []);
```

#### ✅ Solução 4: Verificar Console do Navegador

Abra DevTools (F12) e procure por:

**Erros Comuns:**

1. **CORS Error**
   ```
   Access to XMLHttpRequest at 'https://iam.upn.com.br' from origin 'http://localhost:5173' 
   has been blocked by CORS policy
   ```
   **Solução**: Configure Web Origins no Keycloak Admin Console

2. **Network Error**
   ```
   Failed to fetch
   net::ERR_CONNECTION_REFUSED
   ```
   **Solução**: Keycloak está offline ou URL incorreta

3. **Timeout Error**
   ```
   Timeout ao conectar com Keycloak
   ```
   **Solução**: Aguarde o modo fallback ativar automaticamente (10s)

---

## ❌ Problema: Erro de CORS

### Sintoma
```
Access to XMLHttpRequest has been blocked by CORS policy
```

### Solução

**No Keycloak Admin Console:**

1. Acesse: https://iam.upn.com.br/admin
2. Selecione realm: `underprotection`
3. Vá em: Clients → Matreiro
4. Na aba **Settings**:
   - **Valid Redirect URIs**: adicione `http://localhost:5173/*`
   - **Web Origins**: adicione `http://localhost:5173` ou use `+` (permitir tudo)
5. Salvar

---

## ❌ Problema: Redirect URI Inválido

### Sintoma
```
Invalid redirect_uri
```

### Solução

**No Keycloak:**
1. Admin Console → Clients → Matreiro
2. Valid Redirect URIs deve incluir:
   - `http://localhost:5173/*`
   - `http://10.35.0.39/*`
3. Salvar e limpar cache do navegador

---

## ❌ Problema: Token Expirado

### Sintoma
- API retorna 401
- Usuário é deslogado automaticamente

### Solução

O sistema já tem refresh automático configurado. Se mesmo assim expirar:

1. Faça logout
2. Faça login novamente
3. Verifique o console: deve aparecer "Token was successfully refreshed"

---

## ❌ Problema: Usuário Não Consegue Logar no Keycloak

### Verificar no Keycloak Admin

1. Acesse: https://iam.upn.com.br/admin
2. Realm: underprotection
3. Users → procure o usuário
4. Verifique:
   - ✅ **Enabled**: deve estar ON
   - ✅ **Email Verified**: deve estar ON
   - ✅ **Credentials**: senha não temporária

---

## ❌ Problema: API Retorna 401 (Unauthorized)

### Verificações

**1. Token está sendo enviado?**
```javascript
// Console do navegador
console.log('Token:', localStorage.getItem('matreiro_user'));
```

**2. Interceptor está funcionando?**
Abra DevTools → Network → faça uma requisição → verifique Headers:
```
Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCI...
```

**3. Backend está validando?**
- Certifique-se que o backend Django está configurado para aceitar JWT
- Veja `KEYCLOAK_SETUP.md` seção "Backend Django"

---

## ❌ Problema: "Modo desenvolvimento" não funciona

### Solução

Limpe o localStorage:

```javascript
// Console do navegador (F12)
localStorage.clear();
location.reload();
```

---

## 🐛 Debug Avançado

### Ver todas as configurações do Keycloak

```javascript
// Console do navegador
console.log('Keycloak Instance:', keycloak);
console.log('Authenticated:', keycloak.authenticated);
console.log('Token:', keycloak.token);
console.log('Token Parsed:', keycloak.tokenParsed);
console.log('Realm Access:', keycloak.realmAccess);
```

### Verificar Inicialização

```javascript
// O sistema já loga isso automaticamente
// Procure no console:
🔐 Keycloak Config: {url: '...', realm: '...', clientId: '...'}
```

### Forçar Modo Desenvolvimento

```javascript
// Console do navegador
localStorage.setItem('matreiro_user', JSON.stringify({
  id: '1',
  name: 'Superadmin Dev',
  email: 'dev@test.com',
  role: 'superadmin'
}));
location.reload();
```

---

## 📋 Checklist de Troubleshooting

Antes de reportar um problema, verifique:

- [ ] Keycloak está acessível? (teste a URL)
- [ ] Console do navegador tem erros?
- [ ] Aguardou os 10 segundos de timeout?
- [ ] Tentou o modo desenvolvimento?
- [ ] CORS está configurado no Keycloak?
- [ ] Redirect URIs estão corretos?
- [ ] LocalStorage foi limpo?
- [ ] Versão do Node.js é 18+?

---

## 🆘 Ainda com Problemas?

### Logs Importantes

Envie os seguintes logs para análise:

```javascript
// Console do navegador (F12)
console.log({
  keycloakConfig: {
    url: 'https://iam.upn.com.br',
    realm: 'underprotection',
    clientId: 'Matreiro'
  },
  authenticated: keycloak?.authenticated,
  hasToken: !!keycloak?.token,
  userFromStorage: localStorage.getItem('matreiro_user'),
  consoleErrors: 'copie os erros do console aqui'
});
```

### Contato

- **Email**: igor@underprotection.com.br
- **Keycloak Admin**: https://iam.upn.com.br/admin

---

## 🎯 Modo de Desenvolvimento Permanente

Se você quer sempre usar modo desenvolvimento (sem Keycloak), crie um arquivo `.env.local`:

```bash
# .env.local
VITE_SKIP_KEYCLOAK=true
```

E modifique `AuthContext.tsx`:

```typescript
useEffect(() => {
  // Pular Keycloak em desenvolvimento
  if (import.meta.env.VITE_SKIP_KEYCLOAK === 'true') {
    setUser(superadminUser);
    localStorage.setItem('matreiro_user', JSON.stringify(superadminUser));
    setIsLoading(false);
    toast.info('Modo desenvolvimento (Keycloak desabilitado)');
    return;
  }
  
  // ... resto do código
}, []);
```

---

**Última atualização**: 08/03/2026
