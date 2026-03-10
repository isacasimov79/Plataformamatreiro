# 📘 Exemplos de Uso - Integração Microsoft Azure

## Exemplos de Código Frontend

### 1. Testar Conexão com Azure AD

```typescript
import { azureTestConnection } from '../lib/supabaseApi';
import { toast } from 'sonner';

async function testAzureConnection() {
  try {
    const result = await azureTestConnection(
      'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', // Tenant ID
      'yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy', // Client ID
      'your-client-secret-value'              // Client Secret
    );
    
    if (result.success) {
      console.log('Organização:', result.organization.name);
      console.log('Domínio:', result.organization.domain);
      toast.success('Conexão estabelecida!');
    }
  } catch (error) {
    console.error('Erro:', error);
    toast.error('Falha na conexão');
  }
}
```

### 2. Buscar Usuários do Azure AD

```typescript
import { azureGetUsers } from '../lib/supabaseApi';

async function listAzureUsers() {
  try {
    const result = await azureGetUsers(
      tenantId,
      clientId,
      clientSecret,
      100 // Máximo de resultados
    );
    
    console.log(`${result.count} usuários encontrados`);
    
    result.users.forEach(user => {
      console.log('---');
      console.log('Nome:', user.displayName);
      console.log('Email:', user.email);
      console.log('Cargo:', user.jobTitle);
      console.log('Departamento:', user.department);
      console.log('Ativo:', user.accountEnabled);
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
  }
}
```

### 3. Buscar Grupos do Azure AD

```typescript
import { azureGetGroups } from '../lib/supabaseApi';

async function listAzureGroups() {
  try {
    const result = await azureGetGroups(
      tenantId,
      clientId,
      clientSecret,
      50 // Máximo de resultados
    );
    
    console.log(`${result.count} grupos encontrados`);
    
    result.groups.forEach(group => {
      console.log('---');
      console.log('Nome:', group.displayName);
      console.log('Descrição:', group.description);
      console.log('Email:', group.email);
      console.log('Mail Enabled:', group.mailEnabled);
      console.log('Security Enabled:', group.securityEnabled);
    });
  } catch (error) {
    console.error('Erro ao buscar grupos:', error);
  }
}
```

### 4. Buscar Membros de um Grupo

```typescript
import { azureGetGroupMembers } from '../lib/supabaseApi';

async function listGroupMembers(groupId: string) {
  try {
    const result = await azureGetGroupMembers(
      tenantId,
      clientId,
      clientSecret,
      groupId // ID do grupo no Azure AD
    );
    
    console.log(`${result.count} membros no grupo`);
    
    result.members.forEach(member => {
      console.log('---');
      console.log('Nome:', member.displayName);
      console.log('Email:', member.email);
      console.log('Cargo:', member.jobTitle);
    });
  } catch (error) {
    console.error('Erro ao buscar membros:', error);
  }
}
```

### 5. Sincronizar Usuários para o Banco

```typescript
import { azureSyncUsers } from '../lib/supabaseApi';
import { toast } from 'sonner';

async function syncUsersFromAzure() {
  try {
    const result = await azureSyncUsers(
      tenantId,
      clientId,
      clientSecret,
      'tenant-acme-corp' // ID do tenant na plataforma
    );
    
    if (result.success) {
      console.log(`${result.synced} usuários sincronizados`);
      console.log(`${result.skipped} usuários pulados`);
      console.log(`${result.total} usuários no total`);
      
      toast.success('Usuários sincronizados!', {
        description: `${result.synced} usuários importados do Azure AD`
      });
    }
  } catch (error) {
    console.error('Erro ao sincronizar usuários:', error);
    toast.error('Falha na sincronização');
  }
}
```

### 6. Sincronizar Grupos para o Banco

```typescript
import { azureSyncGroups } from '../lib/supabaseApi';
import { toast } from 'sonner';

async function syncGroupsFromAzure() {
  try {
    const result = await azureSyncGroups(
      tenantId,
      clientId,
      clientSecret,
      'tenant-acme-corp' // ID do tenant na plataforma
    );
    
    if (result.success) {
      console.log(`${result.synced} grupos sincronizados`);
      
      toast.success('Grupos sincronizados!', {
        description: `${result.synced} grupos importados do Azure AD`
      });
    }
  } catch (error) {
    console.error('Erro ao sincronizar grupos:', error);
    toast.error('Falha na sincronização');
  }
}
```

### 7. Fluxo Completo de Sincronização

```typescript
import { 
  azureTestConnection,
  azureSyncUsers,
  azureSyncGroups 
} from '../lib/supabaseApi';
import { toast } from 'sonner';

async function fullAzureSync(
  tenantId: string,
  clientId: string,
  clientSecret: string,
  targetTenantId: string
) {
  // Passo 1: Testar conexão
  console.log('🔵 Testando conexão...');
  try {
    const testResult = await azureTestConnection(tenantId, clientId, clientSecret);
    if (!testResult.success) {
      throw new Error('Falha no teste de conexão');
    }
    console.log('✅ Conexão OK');
  } catch (error) {
    toast.error('Erro na conexão', { description: error.message });
    return;
  }
  
  // Passo 2: Sincronizar usuários
  console.log('🔵 Sincronizando usuários...');
  try {
    const usersResult = await azureSyncUsers(
      tenantId,
      clientId,
      clientSecret,
      targetTenantId
    );
    console.log(`✅ ${usersResult.synced} usuários sincronizados`);
  } catch (error) {
    toast.error('Erro ao sincronizar usuários', { description: error.message });
    return;
  }
  
  // Passo 3: Sincronizar grupos
  console.log('🔵 Sincronizando grupos...');
  try {
    const groupsResult = await azureSyncGroups(
      tenantId,
      clientId,
      clientSecret,
      targetTenantId
    );
    console.log(`✅ ${groupsResult.synced} grupos sincronizados`);
  } catch (error) {
    toast.error('Erro ao sincronizar grupos', { description: error.message });
    return;
  }
  
  // Sucesso!
  toast.success('Sincronização completa!', {
    description: 'Todos os dados foram importados do Azure AD'
  });
}
```

### 8. Componente React com Estado

```typescript
import { useState, useEffect } from 'react';
import { azureGetUsers } from '../lib/supabaseApi';

function AzureUsersTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    loadUsers();
  }, []);
  
  async function loadUsers() {
    setLoading(true);
    try {
      const result = await azureGetUsers(
        'tenant-id',
        'client-id',
        'client-secret',
        100
      );
      setUsers(result.users);
    } catch (error) {
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  }
  
  if (loading) return <div>Carregando...</div>;
  
  return (
    <div>
      <h2>Usuários do Azure AD ({users.length})</h2>
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Email</th>
            <th>Cargo</th>
            <th>Departamento</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.displayName}</td>
              <td>{user.email}</td>
              <td>{user.jobTitle || '-'}</td>
              <td>{user.department || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Exemplos de Requisições HTTP Diretas

### 1. Testar Conexão (cURL)

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-99a65fc7/azure/test-connection \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "clientId": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
    "clientSecret": "your-client-secret-value"
  }'
```

**Resposta de Sucesso:**

```json
{
  "success": true,
  "message": "Conexão com Azure AD estabelecida com sucesso!",
  "organization": {
    "name": "Acme Corporation",
    "domain": "acme.com",
    "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
  }
}
```

### 2. Buscar Usuários (cURL)

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-99a65fc7/azure/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "clientId": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
    "clientSecret": "your-client-secret-value",
    "maxResults": 100
  }'
```

**Resposta:**

```json
{
  "success": true,
  "users": [
    {
      "id": "user-123-abc",
      "displayName": "João Silva",
      "email": "joao.silva@acme.com",
      "jobTitle": "Desenvolvedor",
      "department": "TI",
      "officeLocation": "São Paulo",
      "accountEnabled": true
    },
    ...
  ],
  "count": 156,
  "hasMore": false
}
```

### 3. Buscar Grupos (cURL)

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-99a65fc7/azure/groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "clientId": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
    "clientSecret": "your-client-secret-value",
    "maxResults": 50
  }'
```

**Resposta:**

```json
{
  "success": true,
  "groups": [
    {
      "id": "group-456-def",
      "displayName": "Diretoria",
      "description": "Grupo da diretoria executiva",
      "email": "diretoria@acme.com",
      "mailEnabled": true,
      "securityEnabled": true
    },
    ...
  ],
  "count": 12,
  "hasMore": false
}
```

### 4. Sincronizar Usuários (cURL)

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-99a65fc7/azure/sync-users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "clientId": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
    "clientSecret": "your-client-secret-value",
    "targetTenantId": "tenant-acme-corp"
  }'
```

**Resposta:**

```json
{
  "success": true,
  "synced": 156,
  "skipped": 12,
  "total": 168,
  "message": "156 usuários sincronizados com sucesso!"
}
```

### 5. Sincronizar Grupos (cURL)

```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-99a65fc7/azure/sync-groups \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -d '{
    "tenantId": "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
    "clientId": "yyyyyyyy-yyyy-yyyy-yyyy-yyyyyyyyyyyy",
    "clientSecret": "your-client-secret-value",
    "targetTenantId": "tenant-acme-corp"
  }'
```

**Resposta:**

```json
{
  "success": true,
  "synced": 12,
  "total": 12,
  "message": "12 grupos sincronizados com sucesso!"
}
```

## Exemplos de Dados Retornados

### Usuário do Azure AD

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "displayName": "João Silva",
  "email": "joao.silva@acme.com",
  "jobTitle": "Desenvolvedor Sênior",
  "department": "Tecnologia da Informação",
  "officeLocation": "São Paulo - Brasil",
  "accountEnabled": true
}
```

### Grupo do Azure AD

```json
{
  "id": "group-abc123-def456",
  "displayName": "Diretoria Executiva",
  "description": "Grupo com membros da diretoria da empresa",
  "email": "diretoria@acme.com",
  "mailEnabled": true,
  "securityEnabled": true
}
```

### Target Sincronizado (no banco)

```json
{
  "id": "target-azure-a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "tenantId": "tenant-acme-corp",
  "email": "joao.silva@acme.com",
  "name": "João Silva",
  "department": "Tecnologia da Informação",
  "position": "Desenvolvedor Sênior",
  "group": null,
  "status": "active",
  "source": "azure-ad",
  "azureId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "officeLocation": "São Paulo - Brasil",
  "lastSyncAt": "2026-03-09T14:30:00Z",
  "createdAt": "2026-03-09T10:00:00Z",
  "updatedAt": "2026-03-09T14:30:00Z"
}
```

### Target Group Sincronizado (no banco)

```json
{
  "id": "target-group-azure-group-abc123-def456",
  "tenantId": "tenant-acme-corp",
  "name": "Diretoria Executiva",
  "description": "Grupo com membros da diretoria da empresa",
  "type": "azure-ad",
  "source": "azure-ad",
  "integrationProvider": "microsoft365",
  "memberCount": 5,
  "targetIds": [
    "target-azure-user1",
    "target-azure-user2",
    "target-azure-user3",
    "target-azure-user4",
    "target-azure-user5"
  ],
  "nestedGroupIds": [],
  "parentGroupId": null,
  "syncEnabled": true,
  "lastSyncAt": "2026-03-09T14:30:00Z",
  "azureId": "group-abc123-def456",
  "email": "diretoria@acme.com",
  "mailEnabled": true,
  "securityEnabled": true,
  "createdAt": "2026-03-09T10:00:00Z",
  "updatedAt": "2026-03-09T14:30:00Z"
}
```

## Tratamento de Erros

### Erro de Autenticação

```typescript
try {
  await azureTestConnection(tenantId, clientId, clientSecret);
} catch (error) {
  if (error.message.includes('Failed to get Azure access token')) {
    console.error('❌ Credenciais inválidas');
    // Exibir mensagem para o usuário verificar as credenciais
  }
}
```

### Erro de Permissões

```typescript
try {
  await azureGetUsers(tenantId, clientId, clientSecret);
} catch (error) {
  if (error.message.includes('Insufficient privileges')) {
    console.error('❌ Permissões insuficientes no Azure AD');
    // Exibir mensagem para o administrador conceder permissões
  }
}
```

### Erro de Rede

```typescript
try {
  await azureSyncUsers(tenantId, clientId, clientSecret, targetTenantId);
} catch (error) {
  if (error.message.includes('Failed to fetch')) {
    console.error('❌ Erro de conexão com o servidor');
    // Exibir mensagem de erro de rede
  }
}
```

## Boas Práticas

### 1. Armazenar Credenciais de Forma Segura

```typescript
// ❌ NUNCA faça isso
const credentials = {
  tenantId: 'hardcoded-tenant-id',
  clientId: 'hardcoded-client-id',
  clientSecret: 'hardcoded-secret'
};

// ✅ Faça isso
const credentials = {
  tenantId: settings.integrations.azure.tenantId,
  clientId: settings.integrations.azure.clientId,
  clientSecret: settings.integrations.azure.clientSecret
};
```

### 2. Verificar Credenciais Antes de Usar

```typescript
async function syncUsers() {
  const { tenantId, clientId, clientSecret } = settings.integrations.azure;
  
  if (!tenantId || !clientId || !clientSecret) {
    toast.error('Configure as credenciais do Azure primeiro');
    return;
  }
  
  // Prosseguir com a sincronização...
}
```

### 3. Loading States

```typescript
const [loading, setLoading] = useState(false);

async function handleSync() {
  setLoading(true);
  try {
    await azureSyncUsers(tenantId, clientId, clientSecret, targetTenantId);
    toast.success('Sincronização concluída!');
  } catch (error) {
    toast.error('Erro na sincronização');
  } finally {
    setLoading(false);
  }
}

return (
  <Button onClick={handleSync} disabled={loading}>
    {loading ? 'Sincronizando...' : 'Sincronizar'}
  </Button>
);
```

### 4. Logs Detalhados

```typescript
async function syncUsersWithLogs() {
  console.log('🔵 Iniciando sincronização de usuários...');
  
  try {
    const result = await azureSyncUsers(
      tenantId,
      clientId,
      clientSecret,
      targetTenantId
    );
    
    console.log('✅ Sincronização concluída');
    console.log(`   - Sincronizados: ${result.synced}`);
    console.log(`   - Pulados: ${result.skipped}`);
    console.log(`   - Total: ${result.total}`);
  } catch (error) {
    console.error('❌ Erro na sincronização:', error);
    console.error('   Stack:', error.stack);
  }
}
```

---

**Última atualização**: 09 de março de 2026  
**Versão**: 1.0.0
