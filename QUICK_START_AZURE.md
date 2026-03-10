# 🚀 Quick Start - Integração Microsoft Azure

## 5 Minutos para Integrar o Azure AD

Este guia rápido te ajudará a configurar a integração com Microsoft Azure em menos de 5 minutos.

---

## Passo 1: Azure Portal (2 minutos)

### 1.1 Criar App Registration

1. Acesse: https://portal.azure.com
2. **Azure Active Directory** → **App registrations** → **New registration**
3. Preencha:
   - Nome: `Matreiro Platform`
   - Supported account types: `Single tenant`
4. Clique em **Register**

### 1.2 Copiar Credenciais

Na página do App Registration, copie:

- ✅ **Application (client) ID**
- ✅ **Directory (tenant) ID**

### 1.3 Criar Client Secret

1. No menu lateral: **Certificates & secrets**
2. **Client secrets** → **New client secret**
3. Description: `Matreiro Secret`
4. Expires: `24 months`
5. **Add**
6. ⚠️ **COPIE O VALUE AGORA** (não será mostrado novamente!)

### 1.4 Adicionar Permissões

1. No menu lateral: **API permissions**
2. **Add a permission** → **Microsoft Graph** → **Application permissions**
3. Adicione:
   - ✅ `User.Read.All`
   - ✅ `Group.Read.All`
   - ✅ `GroupMember.Read.All`
4. **Grant admin consent** → Confirme **Yes**

✅ Pronto no Azure! Agora vamos para a plataforma.

---

## Passo 2: Plataforma Matreiro (2 minutos)

### 2.1 Acessar Configurações

1. Login na plataforma
2. Menu lateral → **Configurações**
3. Aba → **Integrações**
4. Scroll até **Microsoft Azure Graph API**

### 2.2 Inserir Credenciais

Cole os valores copiados:

```
Azure Tenant ID:         [Cole o Directory (tenant) ID]
Application (Client) ID: [Cole o Application (client) ID]
Client Secret (Value):   [Cole o Client Secret]
```

### 2.3 Testar Conexão

1. Clique em **Testar Conexão**
2. Aguarde 2-3 segundos
3. Deve aparecer: ✅ **"Conexão Azure estabelecida!"**

### 2.4 Ativar Integração

1. Ative o toggle **Habilitar Integração**
2. (Opcional) Ative **Sincronização Automática**
3. Clique em **Salvar**

✅ Configurado! Agora vamos importar os dados.

---

## Passo 3: Sincronizar Dados (1 minuto)

### 3.1 Importar Usuários

1. Clique no botão **Sincronizar Usuários**
2. Aguarde o processo (pode levar 10-30 segundos)
3. Verá: ✅ **"156 usuários sincronizados com sucesso!"**

### 3.2 Importar Grupos

1. Clique no botão **Sincronizar Grupos**
2. Aguarde o processo
3. Verá: ✅ **"12 grupos sincronizados com sucesso!"**

✅ Dados importados!

---

## Verificar Importação

### Ver Usuários Importados

1. Menu lateral → **Alvos**
2. Você verá os usuários com badge **Azure AD**
3. Campos importados:
   - ✅ Nome completo
   - ✅ Email
   - ✅ Cargo
   - ✅ Departamento

### Ver Grupos Importados

1. Menu lateral → **Grupos de Alvos**
2. Você verá os grupos com badge **Azure AD**
3. Cada grupo mostra:
   - ✅ Nome do grupo
   - ✅ Número de membros
   - ✅ Descrição

---

## Usar em Campanhas

Agora você pode usar os dados importados:

1. **Nova Campanha** → **Selecionar Alvos**
2. Escolha um **Grupo de Alvos** (ex: "Diretoria")
3. Todos os membros do grupo serão incluídos automaticamente
4. **Ou** selecione usuários individuais da lista

---

## Sincronização Automática

Para manter os dados sempre atualizados:

1. **Configurações** → **Integrações** → **Azure**
2. Ative o toggle **Sincronização Automática**
3. **Salvar**

A plataforma irá:
- 🕐 Sincronizar **diariamente às 06:00**
- 🔄 Atualizar usuários existentes
- ➕ Adicionar novos usuários/grupos
- 📊 Atualizar contagem de membros

---

## Troubleshooting Rápido

### ❌ "Falha ao conectar com Azure AD"

**Possíveis causas:**

1. **Credenciais incorretas**
   - Verifique se copiou corretamente os IDs
   - Certifique-se de não ter espaços extras

2. **Client Secret expirado**
   - Gere um novo no Azure Portal
   - Atualize na plataforma

3. **Permissões não concedidas**
   - No Azure Portal: **API permissions** → **Grant admin consent**
   - Aguarde 1-2 minutos para propagar

### ❌ "Insufficient privileges to complete the operation"

**Solução:**

1. Azure Portal → seu App Registration
2. **API permissions**
3. Verifique se as 3 permissões estão com status **Granted**
4. Se não, clique em **Grant admin consent**

### ❌ "Nenhum usuário foi sincronizado"

**Possíveis causas:**

1. Todos os usuários estão inativos (accountEnabled: false)
2. Usuários sem email configurado
3. Verifique os logs do console (F12) para mais detalhes

---

## Comandos Úteis

### Resincronizar Tudo

Se precisar reimportar todos os dados:

1. **Sincronizar Usuários** (novamente)
2. **Sincronizar Grupos** (novamente)

Os dados existentes serão **atualizados**, não duplicados.

### Desativar Integração

Para desativar temporariamente:

1. **Configurações** → **Integrações** → **Azure**
2. Desative o toggle **Habilitar Integração**
3. **Salvar**

Os dados já sincronizados **permanecerão** no banco.

---

## Próximos Passos

Agora que você já configurou a integração, explore:

### 1. Criar Campanhas Segmentadas

Use os grupos do Azure para criar campanhas direcionadas:

- "Diretoria" → Template de phishing sofisticado
- "TI" → Simulação de vulnerabilidades técnicas
- "RH" → Phishing de dados pessoais

### 2. Relatórios por Departamento

Analise resultados agrupados por:
- Departamento (ex: TI, RH, Vendas)
- Localização (ex: São Paulo, Rio de Janeiro)
- Cargo (ex: Gerentes, Analistas)

### 3. Automações

Configure automações para:
- Enviar campanhas automaticamente a novos usuários
- Treinar usuários que clicaram em phishing
- Alertar gestores sobre departamentos vulneráveis

---

## Recursos Adicionais

### 📚 Documentação Completa

- [`/INTEGRACAO_AZURE_AD.md`](./INTEGRACAO_AZURE_AD.md) - Guia completo
- [`/EXEMPLOS_USO_AZURE.md`](./EXEMPLOS_USO_AZURE.md) - Exemplos de código
- [`/RESUMO_INTEGRACAO_AZURE.md`](./RESUMO_INTEGRACAO_AZURE.md) - Resumo técnico

### 🔐 Segurança

- Client Secret é armazenado de forma segura
- Tokens OAuth não são persistidos
- Comunicação via HTTPS obrigatória
- Logs de auditoria para todas as ações

### 🆘 Suporte

Se precisar de ajuda:

1. Consulte a seção **Troubleshooting** na documentação completa
2. Verifique os logs do backend no Supabase
3. Entre em contato com suporte@underprotection.com.br

---

## Checklist Rápido

Use este checklist para verificar se tudo está correto:

### Azure Portal
- [ ] App Registration criado
- [ ] Tenant ID copiado
- [ ] Client ID copiado
- [ ] Client Secret gerado e copiado
- [ ] Permissões adicionadas (3):
  - [ ] User.Read.All
  - [ ] Group.Read.All
  - [ ] GroupMember.Read.All
- [ ] Admin consent concedido (✅ Granted for...)

### Plataforma Matreiro
- [ ] Credenciais coladas nos campos
- [ ] Botão "Testar Conexão" clicado (✅ sucesso)
- [ ] Toggle "Habilitar Integração" ativado
- [ ] Botão "Salvar" clicado
- [ ] Botão "Sincronizar Usuários" clicado (✅ sucesso)
- [ ] Botão "Sincronizar Grupos" clicado (✅ sucesso)

### Verificação
- [ ] Usuários visíveis na página "Alvos"
- [ ] Grupos visíveis na página "Grupos de Alvos"
- [ ] Badge "Azure AD" aparecendo nos itens
- [ ] Possível criar campanha com grupo do Azure

✅ **Tudo certo!** Sua integração está funcionando perfeitamente.

---

**Tempo total**: ~5 minutos  
**Última atualização**: 09 de março de 2026  
**Versão**: 1.0.0
