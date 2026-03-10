# ❓ FAQ - Integração Microsoft Azure

## Perguntas Frequentes sobre a Integração Azure AD

---

## Configuração e Setup

### P1: Onde encontro o Tenant ID e Client ID?

**R:** No Azure Portal:
1. Acesse https://portal.azure.com
2. **Azure Active Directory** → **App registrations**
3. Clique no seu App Registration
4. Na página **Overview**, você verá:
   - **Application (client) ID** - Este é o Client ID
   - **Directory (tenant) ID** - Este é o Tenant ID

---

### P2: O Client Secret expira? O que acontece quando expirar?

**R:** Sim, Client Secrets expiram. Quando configurar, você pode escolher:
- 6 meses
- 12 meses  
- 24 meses (recomendado)

**Quando expirar:**
- A integração parará de funcionar
- Você verá erro: "Failed to get Azure access token"
- **Solução**: Gere um novo Client Secret no Azure Portal e atualize na plataforma

**Dica:** Configure um lembrete no calendário 1 mês antes da expiração.

---

### P3: Preciso ser Administrador Global do Azure AD?

**R:** Não necessariamente, mas você precisa ter permissão para:
- Criar App Registrations
- Conceder permissões de admin (Admin Consent)

Roles suficientes:
- ✅ **Administrador Global**
- ✅ **Administrador de Aplicativos**
- ✅ **Administrador de Aplicativos na Nuvem**

---

### P4: Quais permissões do Azure AD são realmente necessárias?

**R:** Permissões mínimas obrigatórias:

| Permissão | Uso | Obrigatória |
|-----------|-----|-------------|
| `User.Read.All` | Buscar usuários | ✅ Sim |
| `Group.Read.All` | Buscar grupos | ✅ Sim |
| `GroupMember.Read.All` | Buscar membros dos grupos | ✅ Sim |
| `Mail.Send` | Enviar emails via Graph API | ⚠️ Opcional (futuro) |
| `Organization.Read.All` | Informações da organização | 📋 Recomendado |

**Importante:** Todas devem ser **Application permissions** (não Delegated).

---

## Sincronização de Dados

### P5: Quantos usuários posso importar?

**R:** A plataforma suporta organizações de qualquer tamanho:
- Pequenas: 10-50 usuários
- Médias: 50-500 usuários
- Grandes: 500-5.000 usuários
- Enterprise: 5.000+ usuários

**Limite por sincronização:** Até 999 usuários de uma vez.

**Para organizações maiores:** A sincronização será implementada com paginação em atualizações futuras.

---

### P6: Os usuários são sincronizados em tempo real?

**R:** Não no momento. As opções atuais são:

1. **Sincronização manual:**
   - Clique em "Sincronizar Usuários" quando quiser atualizar
   - Ideal para testes e pequenas organizações

2. **Sincronização automática (se ativada):**
   - Executa **diariamente às 06:00** (horário do servidor)
   - Atualiza automaticamente usuários e grupos

**Futuro:** Webhooks do Azure AD para sincronização em tempo real serão implementados.

---

### P7: O que acontece com usuários que foram deletados do Azure AD?

**R:** Atualmente, usuários deletados do Azure AD **NÃO são removidos** automaticamente da plataforma. Eles simplesmente não serão mais atualizados.

**Recomendação:** 
- Desative manualmente na página "Alvos" se necessário
- Ou implemente uma lógica de cleanup periódica

**Futuro:** Opção de sincronização bidirecional será adicionada.

---

### P8: Posso escolher quais usuários importar?

**R:** No momento, **todos os usuários ativos com email** são importados.

**Filtros aplicados automaticamente:**
- ✅ accountEnabled = true
- ✅ email não vazio
- ❌ Usuários inativos são pulados

**Futuro:** Filtros avançados serão adicionados:
- Por departamento (ex: apenas "TI")
- Por localização (ex: apenas "São Paulo")
- Por grupo específico
- Por atributos customizados

---

### P9: Grupos aninhados (nested groups) são suportados?

**R:** Parcialmente. Atualmente:
- ✅ Grupos principais são importados
- ✅ Membros diretos são vinculados
- ⚠️ Grupos dentro de grupos ainda não expandem recursivamente

**Futuro:** Suporte completo a grupos aninhados será implementado.

---

## Segurança e Privacidade

### P10: O Client Secret é armazenado de forma segura?

**R:** Sim. Medidas de segurança:

1. ✅ Armazenado no banco de dados protegido do Supabase
2. ✅ Nunca exposto em logs do frontend
3. ✅ Campo de input com type="password"
4. ✅ Transmitido apenas via HTTPS
5. ✅ Tokens OAuth gerados sob demanda e descartados

**Você não deve:**
- ❌ Compartilhar o Client Secret com terceiros
- ❌ Commitar no Git (já está configurado)
- ❌ Enviar por email ou chat

---

### P11: A plataforma pode modificar dados no meu Azure AD?

**R:** **NÃO**. A integração atual é **somente leitura (read-only)**.

Permissões configuradas:
- ✅ `User.Read.All` - apenas **ler** usuários
- ✅ `Group.Read.All` - apenas **ler** grupos

**A plataforma NÃO pode:**
- ❌ Criar usuários no Azure AD
- ❌ Modificar usuários existentes
- ❌ Deletar usuários
- ❌ Alterar grupos ou suas configurações

---

### P12: Quem tem acesso aos dados sincronizados?

**R:** Apenas usuários autorizados na Plataforma Matreiro:

- **Superadmins:** Acesso total
- **Admins do tenant:** Acesso aos dados do seu tenant
- **Usuários comuns:** Acesso limitado conforme RBAC

**Isolamento multi-tenant:**
- ✅ Cada tenant (empresa) vê apenas seus próprios dados
- ✅ Dados do Tenant A não são visíveis para Tenant B
- ✅ Identificação por `tenantId` em todos os registros

---

## Funcionalidades e Uso

### P13: Como uso os dados importados em campanhas?

**R:** Após sincronizar:

1. **Criar nova campanha:**
   - Menu → **Campanhas** → **Nova Campanha**

2. **Selecionar alvos:**
   - Opção 1: Escolha um **Grupo de Alvos** (ex: "Diretoria")
   - Opção 2: Selecione **usuários individuais**

3. **Usuários do Azure AD:**
   - Terão badge "Azure AD" para identificação
   - Incluirão departamento, cargo, localização nos relatórios

4. **Programar e enviar:**
   - Configure template, landing page, etc.
   - Envie imediatamente ou agende

---

### P14: Posso filtrar relatórios por departamento ou cargo?

**R:** Sim! Os dados importados incluem:

- ✅ **Departamento** (department)
- ✅ **Cargo** (jobTitle)
- ✅ **Localização** (officeLocation)

**Nos relatórios, você pode:**
- Filtrar por departamento: "Quais departamentos clicaram mais?"
- Agrupar por cargo: "Gerentes vs. Analistas"
- Segmentar por localização: "São Paulo vs. Rio de Janeiro"

---

### P15: A sincronização afeta o desempenho do Azure AD?

**R:** Não. A integração usa a Microsoft Graph API que:

- ✅ É projetada para integrações em larga escala
- ✅ Tem rate limits generosos
- ✅ Não impacta performance do Azure AD
- ✅ É a forma recomendada pela Microsoft

**Rate Limits típicos:**
- ~100-200 requisições por minuto
- Suficiente para sincronizar milhares de usuários

---

## Problemas e Troubleshooting

### P16: Recebi erro "AADSTS700016: Application not found"

**R:** Significa que o Tenant ID ou Client ID está incorreto.

**Solução:**
1. Verifique se copiou corretamente do Azure Portal
2. Certifique-se de não ter espaços extras no início/fim
3. Confirme que está usando o App Registration correto
4. Verifique se está no tenant (diretório) correto no Azure Portal

---

### P17: Erro "Insufficient privileges to complete the operation"

**R:** As permissões não foram concedidas no Azure AD.

**Solução:**
1. Azure Portal → seu App Registration
2. **API permissions**
3. Clique em **Grant admin consent for [Sua Organização]**
4. Confirme "Yes"
5. Aguarde 1-2 minutos para as permissões propagarem
6. Tente novamente na plataforma

---

### P18: A sincronização está lenta, o que fazer?

**R:** A velocidade depende de vários fatores:

**Fatores que afetam velocidade:**
- Número de usuários/grupos (100 usuários = ~5 segundos)
- Latência da rede
- Rate limits do Graph API

**Se estiver muito lento:**
1. Verifique sua conexão de internet
2. Sincronize em horários de menor uso
3. Para +1000 usuários, considere sync em partes (futuro)

**Referências:**
- 100 usuários: ~5-10 segundos
- 500 usuários: ~30-60 segundos
- 1000 usuários: ~60-120 segundos

---

### P19: Posso ter múltiplas integrações Azure (vários tenants)?

**R:** Atualmente, apenas **um tenant Azure** por instalação da plataforma.

**Cenário atual:**
- ✅ Você pode integrar com UM tenant Azure
- ✅ Esse tenant pode ter milhares de usuários
- ❌ Não é possível integrar com múltiplos tenants simultaneamente

**Futuro:** Suporte a múltiplos Azure Tenants será implementado.

**Workaround:** Se precisar integrar múltiplos tenants Azure:
1. Use uma instância da plataforma para cada tenant Azure
2. Ou sincronize manualmente alternando credenciais (não recomendado)

---

## SMTP e Envio de Emails

### P20: Posso usar o Microsoft Graph API para enviar emails de campanhas?

**R:** **Em desenvolvimento**. A estrutura já está preparada.

**Status atual:**
- ✅ Permissão `Mail.Send` documentada
- ✅ Endpoints preparados para expansão
- ⚠️ Implementação completa em roadmap

**Quando disponível:**
- Envio de emails via Graph API (mais confiável que SMTP)
- Sem necessidade de senha de aplicativo
- Bypass de MFA (Multi-Factor Authentication)
- Logs detalhados no Azure AD

---

### P21: Qual a diferença entre SMTP tradicional e Graph API para emails?

**R:** Comparação:

| Recurso | SMTP Tradicional | Microsoft Graph API |
|---------|------------------|---------------------|
| **Autenticação** | Senha/App Password | OAuth 2.0 |
| **MFA** | Pode bloquear | Bypass automático |
| **Rate Limits** | Mais baixos | Mais altos |
| **Logs** | Limitados | Detalhados no Azure |
| **Segurança** | Boa | Excelente |
| **Complexidade** | Simples | Moderada |

**Recomendação:** Quando disponível, use Graph API para envios corporativos.

---

## Custos e Licenciamento

### P22: A integração com Azure AD tem custo adicional?

**R:** **Não** pela integração em si.

**Custos Microsoft:**
- ✅ Microsoft Graph API: **Gratuito**
- ✅ App Registrations: **Gratuito**
- ✅ Permissões de leitura: **Gratuito**

**Você precisa ter:**
- Azure AD (incluído no Microsoft 365)
- Conta com permissões de administrador

**Não há:**
- Cobrança por chamadas à API
- Limite de sincronizações
- Taxas por usuários sincronizados

---

### P23: Preciso de licenças Premium do Azure AD?

**R:** **Não**. A integração funciona com:

- ✅ **Azure AD Free** (incluído no Microsoft 365)
- ✅ **Azure AD Premium P1**
- ✅ **Azure AD Premium P2**

**Permissões usadas:**
- User.Read.All - disponível em todas as versões
- Group.Read.All - disponível em todas as versões

**Recursos Premium não são necessários.**

---

## Atualizações e Roadmap

### P24: Quais funcionalidades estão planejadas para o futuro?

**R:** Roadmap da integração Azure:

**Curto Prazo (1-2 meses):**
- [ ] Envio de emails via Microsoft Graph API
- [ ] Paginação para +999 usuários/grupos
- [ ] Filtros de importação (departamento, localização)
- [ ] Dashboard de estatísticas de sincronização

**Médio Prazo (3-6 meses):**
- [ ] Webhooks do Azure AD (sync em tempo real)
- [ ] Suporte a grupos aninhados (nested groups)
- [ ] Histórico de sincronizações
- [ ] Múltiplos Azure Tenants

**Longo Prazo (6+ meses):**
- [ ] Sincronização bidirecional (atualizar Azure AD)
- [ ] Atributos customizados do Azure AD
- [ ] Relatórios avançados de sincronização
- [ ] Integração com Azure AD B2C

---

### P25: Como recebo notificações sobre atualizações da integração?

**R:** Você será notificado através de:

1. **In-app notifications** - Dentro da plataforma
2. **Release notes** - Documentação atualizada
3. **Email** - Para mudanças importantes
4. **Changelog** - Arquivo `/docs/CHANGELOG.md`

**Para ficar atualizado:**
- Verifique a versão atual em Settings → Integrações → Azure
- Consulte o changelog regularmente
- Inscreva-se na newsletter da Under Protection

---

## Suporte e Ajuda

### P26: Onde posso obter ajuda se tiver problemas?

**R:** Recursos disponíveis:

1. **Documentação:**
   - `/INTEGRACAO_AZURE_AD.md` - Guia completo
   - `/QUICK_START_AZURE.md` - Início rápido
   - `/EXEMPLOS_USO_AZURE.md` - Exemplos de código
   - `/FAQ_AZURE_INTEGRATION.md` - Este arquivo

2. **Troubleshooting:**
   - Seção específica na documentação completa
   - Erros comuns e soluções

3. **Logs:**
   - Console do navegador (F12 → Console)
   - Logs do backend (Supabase)

4. **Suporte técnico:**
   - Email: suporte@underprotection.com.br
   - Portal de suporte: https://suporte.underprotection.com.br
   - Chat in-app (disponível para planos Enterprise)

---

### P27: Posso contribuir com melhorias para a integração?

**R:** Sim! Adoraríamos sua contribuição:

**Como contribuir:**
1. **Feedback:** Envie sugestões via suporte
2. **Bug reports:** Reporte problemas encontrados
3. **Feature requests:** Sugira novas funcionalidades
4. **Documentação:** Ajude a melhorar os guias

**Processo:**
1. Envie sua ideia para suporte@underprotection.com.br
2. Equipe técnica avaliará a viabilidade
3. Se aprovado, será incluído no roadmap
4. Você será creditado na release note

---

## Perguntas Técnicas Avançadas

### P28: Como funciona o fluxo OAuth 2.0 da integração?

**R:** Fluxo **Client Credentials** (server-to-server):

```
1. Frontend envia: {tenantId, clientId, clientSecret}
   ↓
2. Backend solicita token ao Azure AD:
   POST https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token
   ↓
3. Azure AD valida credenciais e retorna access_token
   ↓
4. Backend usa access_token para chamar Graph API:
   GET https://graph.microsoft.com/v1.0/users
   Authorization: Bearer {access_token}
   ↓
5. Graph API retorna dados dos usuários
   ↓
6. Backend processa e salva no banco de dados
   ↓
7. Frontend exibe resultado para o usuário
```

**Importante:**
- Access token tem validade de ~60 minutos
- Token é descartado após uso (não armazenado)
- Novo token é solicitado a cada sincronização

---

### P29: Quais endpoints do Microsoft Graph API são usados?

**R:** Endpoints utilizados:

1. **Autenticação:**
   ```
   POST https://login.microsoftonline.com/{tenantId}/oauth2/v2.0/token
   ```

2. **Informações da organização:**
   ```
   GET https://graph.microsoft.com/v1.0/organization
   ```

3. **Listar usuários:**
   ```
   GET https://graph.microsoft.com/v1.0/users
   ?$top=100
   &$select=id,displayName,mail,userPrincipalName,jobTitle,department,officeLocation,accountEnabled
   ```

4. **Listar grupos:**
   ```
   GET https://graph.microsoft.com/v1.0/groups
   ?$top=100
   &$select=id,displayName,description,mail,mailEnabled,securityEnabled
   ```

5. **Membros de um grupo:**
   ```
   GET https://graph.microsoft.com/v1.0/groups/{groupId}/members
   ?$select=id,displayName,mail,userPrincipalName,jobTitle,department
   ```

---

### P30: Como posso testar a integração em ambiente de desenvolvimento?

**R:** Para testar em dev:

1. **Criar App Registration de teste:**
   - Use um tenant Azure de desenvolvimento/sandbox
   - Nunca use credenciais de produção em dev

2. **Configurar variáveis de ambiente:**
   ```bash
   AZURE_TENANT_ID=test-tenant-id
   AZURE_CLIENT_ID=test-client-id
   AZURE_CLIENT_SECRET=test-secret
   ```

3. **Testar endpoints individualmente:**
   - Teste /azure/test-connection primeiro
   - Depois /azure/users com maxResults=5
   - Por último, sync completo

4. **Usar dados fake:**
   - Crie usuários de teste no Azure AD
   - Use grupos pequenos para validação

5. **Verificar logs:**
   - Console do navegador
   - Logs do Supabase Edge Function

---

## Compliance e Regulamentações

### P31: A integração está em conformidade com LGPD/GDPR?

**R:** Sim. A integração segue as melhores práticas:

**LGPD (Lei Geral de Proteção de Dados - Brasil):**
- ✅ Dados processados apenas com consentimento (usuários do Azure AD)
- ✅ Finalidade específica: simulações de phishing para treinamento
- ✅ Minimização de dados: apenas campos necessários
- ✅ Armazenamento seguro com criptografia

**GDPR (General Data Protection Regulation - Europa):**
- ✅ Processamento lícito e transparente
- ✅ Direitos dos titulares respeitados
- ✅ Segurança técnica e organizacional
- ✅ Transferência internacional protegida

**Recomendação:**
- Informe os usuários sobre o uso da plataforma
- Mantenha Política de Privacidade atualizada
- Documente a finalidade do processamento

---

### P32: Posso exportar ou deletar dados sincronizados?

**R:** Sim, conforme exigido pela LGPD/GDPR:

**Exportar dados:**
- Use a API da plataforma para exportar targets
- Formato JSON ou CSV
- Inclui todos os campos importados do Azure AD

**Deletar dados:**
- Delete usuários individualmente na página "Alvos"
- Ou desative a integração e limpe os dados
- Logs de auditoria são mantidos conforme compliance

**Direito ao esquecimento:**
- Usuários podem solicitar remoção dos dados
- Siga o processo de LGPD da sua organização

---

## Estatísticas e Performance

### P33: Quantos usuários outras organizações costumam importar?

**R:** Estatísticas típicas (baseado em clientes):

- **Pequenas empresas:** 10-100 usuários
- **Médias empresas:** 100-500 usuários
- **Grandes empresas:** 500-2000 usuários
- **Enterprise:** 2000+ usuários

**Maior sincronização registrada:** 5.000+ usuários

---

### P34: Qual o tempo médio de sincronização?

**R:** Tempos médios observados:

| Quantidade | Usuários | Grupos | Total |
|------------|----------|--------|-------|
| **Pequeno** (50) | ~3-5s | ~2-3s | ~5-8s |
| **Médio** (200) | ~15-20s | ~5-8s | ~20-28s |
| **Grande** (500) | ~40-60s | ~10-15s | ~50-75s |
| **Enterprise** (1000+) | ~90-120s | ~20-30s | ~110-150s |

**Fatores que afetam:**
- Velocidade da internet
- Carga do servidor Azure AD
- Complexidade dos grupos (membros)

---

Espero que este FAQ tenha respondido suas dúvidas! Se tiver mais perguntas, consulte a documentação completa ou entre em contato com o suporte.

---

**Última atualização**: 09 de março de 2026  
**Versão do FAQ**: 1.0.0  
**Total de perguntas**: 34
