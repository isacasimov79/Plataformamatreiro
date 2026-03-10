# 🔵 Integração Microsoft Azure AD / Graph API

## Visão Geral

A Plataforma Matreiro agora possui integração completa com Microsoft Azure Active Directory através da Microsoft Graph API, permitindo:

- ✅ **Importação automática de usuários** do Azure AD
- ✅ **Importação de grupos e membros** de grupos de segurança
- ✅ **Sincronização automática** programada (diária às 06:00)
- ✅ **Teste de conexão** antes de sincronizar
- ✅ **Configuração SMTP** via Microsoft Graph API
- ✅ **Suporte a múltiplos tenants**

## Configuração no Azure Portal

### Passo 1: Criar um App Registration

1. Acesse o [Azure Portal](https://portal.azure.com)
2. Navegue até **Azure Active Directory** → **App registrations**
3. Clique em **New registration**
4. Preencha:
   - **Nome**: `Matreiro Platform Integration`
   - **Supported account types**: `Accounts in this organizational directory only`
   - **Redirect URI**: (deixe em branco)
5. Clique em **Register**

### Passo 2: Obter as Credenciais

Após criar o App Registration, você terá:

1. **Application (Client) ID**: Na página Overview
2. **Directory (Tenant) ID**: Na página Overview
3. **Client Secret**: 
   - Vá em **Certificates & secrets** → **Client secrets**
   - Clique em **New client secret**
   - Descrição: `Matreiro Integration Secret`
   - Expires: `24 months` (recomendado)
   - Clique em **Add**
   - ⚠️ **COPIE O VALUE AGORA** (não será exibido novamente!)

### Passo 3: Configurar Permissões (API Permissions)

1. Vá em **API permissions**
2. Clique em **Add a permission**
3. Selecione **Microsoft Graph** → **Application permissions**
4. Adicione as seguintes permissões:

| Permissão | Descrição | Obrigatória |
|-----------|-----------|-------------|
| `User.Read.All` | Ler todos os perfis de usuário | ✅ Sim |
| `Group.Read.All` | Ler todos os grupos | ✅ Sim |
| `GroupMember.Read.All` | Ler membros de todos os grupos | ✅ Sim |
| `Mail.Send` | Enviar emails como qualquer usuário | ⚠️ Opcional (para SMTP) |
| `Organization.Read.All` | Ler informações da organização | 📋 Recomendado |

5. Clique em **Grant admin consent for [Your Organization]**
6. Confirme clicando em **Yes**

### Passo 4: Verificar o Status

Certifique-se de que todas as permissões mostram:
- Status: ✅ **Granted for [Your Organization]**
- Type: **Application**

## Configuração na Plataforma Matreiro

### 1. Acessar as Configurações

1. Faça login na Plataforma Matreiro
2. Vá em **Configurações** (menu lateral)
3. Clique na aba **Integrações**
4. Localize o card **Microsoft Azure Graph API**

### 2. Inserir as Credenciais

Preencha os seguintes campos:

- **Azure Tenant ID**: Cole o Directory (Tenant) ID do Azure Portal
- **Application (Client) ID**: Cole o Application (Client) ID
- **Client Secret (Value)**: Cole o valor do Client Secret (gerado no Passo 2.3)

### 3. Testar a Conexão

1. Clique no botão **Testar Conexão**
2. Aguarde a validação
3. Se bem-sucedido, você verá:
   - ✅ "Conexão com Azure AD estabelecida com sucesso!"
   - Nome da organização
   - Domínio verificado

### 4. Ativar a Integração

1. Ative o toggle **Habilitar Integração**
2. (Opcional) Ative o toggle **Sincronização Automática** para sincronizar diariamente

### 5. Importar Dados

#### Importar Usuários

1. Clique no botão **Sincronizar Usuários**
2. O sistema irá:
   - Buscar todos os usuários ativos do Azure AD
   - Importar como **Targets** (alvos) na plataforma
   - Manter informações de: nome, email, cargo, departamento, localização
3. Você verá uma notificação com o resultado: `156 usuários sincronizados com sucesso!`

#### Importar Grupos

1. Clique no botão **Sincronizar Grupos**
2. O sistema irá:
   - Buscar todos os grupos do Azure AD
   - Importar como **Target Groups** (grupos de alvos)
   - Vincular automaticamente os membros de cada grupo
3. Você verá uma notificação com o resultado: `12 grupos sincronizados com sucesso!`

### 6. Salvar as Configurações

Clique no botão **Salvar** para persistir as credenciais no banco de dados.

## Endpoints da API

Os seguintes endpoints foram implementados no backend:

### Testar Conexão
```
POST /make-server-99a65fc7/azure/test-connection
Body: { tenantId, clientId, clientSecret }
```

### Buscar Usuários
```
POST /make-server-99a65fc7/azure/users
Body: { tenantId, clientId, clientSecret, maxResults: 100 }
```

### Buscar Grupos
```
POST /make-server-99a65fc7/azure/groups
Body: { tenantId, clientId, clientSecret, maxResults: 100 }
```

### Buscar Membros de um Grupo
```
POST /make-server-99a65fc7/azure/group-members
Body: { tenantId, clientId, clientSecret, groupId }
```

### Sincronizar Usuários
```
POST /make-server-99a65fc7/azure/sync-users
Body: { tenantId, clientId, clientSecret, targetTenantId }
```

### Sincronizar Grupos
```
POST /make-server-99a65fc7/azure/sync-groups
Body: { tenantId, clientId, clientSecret, targetTenantId }
```

## Estrutura de Dados

### Usuários Sincronizados (Targets)

```typescript
{
  id: 'target-azure-{azureUserId}',
  tenantId: 'tenant-id',
  email: 'usuario@empresa.com',
  name: 'João Silva',
  department: 'TI',
  position: 'Desenvolvedor',
  group: null,
  status: 'active',
  source: 'azure-ad',
  azureId: '{azure-user-id}',
  officeLocation: 'São Paulo',
  lastSyncAt: '2026-03-09T10:30:00Z',
  createdAt: '2026-03-09T10:30:00Z',
  updatedAt: '2026-03-09T10:30:00Z'
}
```

### Grupos Sincronizados (Target Groups)

```typescript
{
  id: 'target-group-azure-{azureGroupId}',
  tenantId: 'tenant-id',
  name: 'Diretoria',
  description: 'Grupo da diretoria executiva',
  type: 'azure-ad',
  source: 'azure-ad',
  integrationProvider: 'microsoft365',
  memberCount: 5,
  targetIds: ['target-azure-user1', 'target-azure-user2', ...],
  nestedGroupIds: [],
  parentGroupId: null,
  syncEnabled: true,
  lastSyncAt: '2026-03-09T10:30:00Z',
  azureId: '{azure-group-id}',
  email: 'diretoria@empresa.com',
  mailEnabled: true,
  securityEnabled: true,
  createdAt: '2026-03-09T10:30:00Z',
  updatedAt: '2026-03-09T10:30:00Z'
}
```

## Filtros e Regras de Sincronização

### Usuários

- ✅ **Incluídos**: Usuários com `accountEnabled: true` e email válido
- ❌ **Excluídos**: Usuários inativos ou sem endereço de email

### Grupos

- ✅ **Incluídos**: Todos os grupos (Security e Mail-enabled)
- 📊 **Membros**: Automaticamente vinculados através dos `targetIds`

## Sincronização Automática

Quando a opção **Sincronização Automática** está ativada:

- 🕐 Executa **diariamente às 06:00** (fuso horário do sistema)
- 🔄 Atualiza usuários existentes e adiciona novos
- 🗑️ **NÃO remove** usuários que foram deletados do Azure AD (apenas marca como inativos)
- 📊 Atualiza contagem de membros dos grupos

## SMTP via Microsoft Graph API

A integração Azure também permite o envio de emails através do Microsoft Graph API, que é mais robusto e confiável que SMTP tradicional:

### Vantagens do Graph API para envio de emails:

1. ✅ Não precisa de senha de aplicativo
2. ✅ Suporta OAuth 2.0 (mais seguro)
3. ✅ Bypass de autenticação multifator (MFA)
4. ✅ Logs detalhados no Azure AD
5. ✅ Rate limits mais altos

### Configuração SMTP via Graph API

*(Esta funcionalidade será implementada em uma próxima atualização)*

1. Adicione a permissão `Mail.Send` no App Registration
2. Configure o remetente padrão na aba SMTP
3. Escolha "Microsoft Graph API" como método de envio

## Troubleshooting

### Erro: "Failed to get Azure access token"

**Causa**: Credenciais inválidas ou expiradas

**Solução**:
1. Verifique se o Client Secret não expirou
2. Gere um novo Client Secret no Azure Portal
3. Atualize as credenciais na plataforma

### Erro: "Insufficient privileges to complete the operation"

**Causa**: Permissões não foram concedidas no Azure AD

**Solução**:
1. Vá em **API permissions** no Azure Portal
2. Clique em **Grant admin consent**
3. Aguarde alguns minutos para as permissões propagarem

### Erro: "AADSTS700016: Application not found in the directory"

**Causa**: Tenant ID ou Client ID incorretos

**Solução**:
1. Verifique se copiou os IDs corretos do Azure Portal
2. Certifique-se de estar usando o App Registration correto
3. Verifique se não há espaços extras no início ou fim dos campos

### Nenhum usuário foi sincronizado

**Causa**: Todos os usuários estão inativos ou sem email

**Solução**:
1. Verifique no Azure AD se os usuários têm `accountEnabled: true`
2. Certifique-se de que os usuários têm emails válidos configurados
3. Verifique os logs do backend para mais detalhes

## Logs e Monitoramento

Os logs da integração Azure podem ser visualizados:

1. **Frontend**: Console do navegador (F12 → Console)
2. **Backend**: Logs do Supabase Edge Functions

### Exemplos de logs

```
🔵 Testing Azure AD connection...
✅ Synced 156 users from Azure AD (skipped 12)
🔵 Syncing groups from Azure AD to database...
✅ Synced 12 groups from Azure AD
```

## Segurança

### Boas Práticas

1. 🔒 **Client Secret**: Armazenado de forma segura no banco de dados
2. 🔐 **Tokens de acesso**: Nunca são armazenados, apenas usados temporariamente
3. 🕐 **Expiração**: Client Secrets devem ser renovados a cada 24 meses
4. 📝 **Auditoria**: Todas as ações são registradas nos logs
5. 👥 **Acesso mínimo**: Use apenas as permissões necessárias

### Recomendações

- ✅ Use um Client Secret com validade de 24 meses
- ✅ Documente quando o secret expira (crie um lembrete)
- ✅ Teste a conexão após renovar o secret
- ✅ Monitore os logs de acesso no Azure AD
- ✅ Revogue credenciais antigas após migração

## Limitações Conhecidas

1. **Rate Limits**: Microsoft Graph API tem limites de requisições por minuto
   - Usuários: ~100 requisições/minuto
   - Grupos: ~100 requisições/minuto

2. **Paginação**: Atualmente limitado a 999 itens por tipo
   - Para organizações maiores, implemente paginação adicional

3. **Sincronização**: Sincronização automática roda uma vez por dia
   - Para sync em tempo real, considere usar webhooks do Azure AD

4. **Deletar usuários**: Usuários deletados do Azure AD não são removidos automaticamente
   - Marque-os como inativos manualmente ou implemente lógica de cleanup

## Próximas Funcionalidades

- [ ] Envio de emails via Microsoft Graph API (substituindo SMTP tradicional)
- [ ] Webhooks do Azure AD para sincronização em tempo real
- [ ] Suporte a grupos aninhados (nested groups)
- [ ] Filtros avançados na importação (por departamento, localização, etc.)
- [ ] Dashboard com estatísticas de sincronização
- [ ] Histórico de sincronizações
- [ ] Suporte a atributos customizados do Azure AD

## Suporte

Se encontrar problemas ou tiver dúvidas:

1. Consulte a seção **Troubleshooting** deste documento
2. Verifique os logs do backend no Supabase
3. Entre em contato com o suporte técnico da Under Protection

---

**Última atualização**: 09 de março de 2026  
**Versão da integração**: 1.0.0  
**Autor**: Plataforma Matreiro - Under Protection
