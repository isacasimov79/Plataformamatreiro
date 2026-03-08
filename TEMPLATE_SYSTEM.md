# Sistema de Templates - Plataforma Matreiro

## Visão Geral

O sistema de templates da Plataforma Matreiro foi expandido para incluir funcionalidades avançadas de visualização HTML, gerenciamento de variáveis dinâmicas e captura de dados sensíveis em campanhas de phishing simulado.

## Componentes Principais

### 1. HtmlEditor
**Localização:** `/src/app/components/HtmlEditor.tsx`

Editor HTML com visualização em tempo real que suporta:
- **3 modos de visualização:**
  - Código: Editor de HTML puro
  - Dividido: Código + Preview lado a lado
  - Preview: Visualização completa

- **Preview responsivo:**
  - Desktop (padrão)
  - Mobile (375px)

- **Substituição automática de variáveis** no preview
- **Sanitização HTML** com DOMPurify
- **Destaque visual** de variáveis (fundo amarelo)

#### Uso:
```tsx
<HtmlEditor
  value={htmlContent}
  onChange={(value) => setHtmlContent(value)}
  type="email" // ou "landing_page"
  subjectLine="Assunto do email"
/>
```

---

### 2. VariableSelector
**Localização:** `/src/app/components/VariableSelector.tsx`

Seletor de variáveis dinâmicas organizado por categorias:

#### Categorias de Variáveis:

**👤 Usuário:**
- `{{nome}}` - Nome completo
- `{{primeiro_nome}}` - Primeiro nome
- `{{sobrenome}}` - Sobrenome
- `{{email}}` - E-mail
- `{{celular}}` - Número de celular
- `{{telefone}}` - Telefone fixo
- `{{cpf}}` - CPF
- `{{rg}}` - RG
- `{{data_nascimento}}` - Data de nascimento
- `{{cargo}}` - Cargo
- `{{departamento}}` - Departamento

**🏢 Empresa:**
- `{{empresa}}` - Nome da empresa
- `{{empresa_cnpj}}` - CNPJ
- `{{empresa_endereco}}` - Endereço
- `{{empresa_cidade}}` - Cidade
- `{{empresa_estado}}` - Estado
- `{{empresa_cep}}` - CEP

**🔒 Segurança (Captura):**
- `{{senha_atual}}` - Campo para captura de senha
- `{{senha_nova}}` - Campo para nova senha
- `{{token_2fa}}` - Token de autenticação 2FA
- `{{codigo_verificacao}}` - Código de verificação

**⚙️ Sistema:**
- `{{link_phishing}}` - Link de rastreamento
- `{{data_atual}}` - Data formatada
- `{{hora_atual}}` - Hora formatada

#### Uso:
```tsx
<VariableSelector
  onInsert={(variable) => insertIntoEditor(variable)}
  customVariables={customVars}
/>
```

---

### 3. AttachmentManager
**Localização:** `/src/app/components/AttachmentManager.tsx`

Gerenciador de anexos para emails e landing pages:

#### Funcionalidades:
- Upload múltiplo de arquivos
- Preview de imagens
- Validação de tamanho (máx: 10MB por arquivo)
- Formatos aceitos: PDF, DOC, DOCX, XLS, XLSX, ZIP, JPG, PNG
- Limite configurável de arquivos
- Contexto separado para email e landing page

#### Uso:
```tsx
<AttachmentManager
  attachments={attachments}
  onChange={setAttachments}
  context="email" // ou "landing_page"
  maxFiles={5}
  maxSize={10} // em MB
/>
```

---

### 4. DataCaptureConfig
**Localização:** `/src/app/components/DataCaptureConfig.tsx`

Configurador de campos de captura para landing pages:

#### Categorias de Campos:

**📋 Informações Básicas:**
- Nome, E-mail, Celular, CPF, RG, Cargo, Departamento, Data de Nascimento

**🔐 Credenciais (Alto Risco):**
- Senha, Confirmação de Senha, Senha Atual, Token 2FA

**✨ Campos Personalizados:**
- Criação de campos customizados com tipos:
  - text, email, password, tel, number, date

#### Uso:
```tsx
<DataCaptureConfig
  selectedFields={['nome', 'email', 'senha']}
  onChange={setSelectedFields}
  customFields={customFields}
  onAddCustomField={(field) => addCustomField(field)}
/>
```

---

### 5. TemplateExamples
**Localização:** `/src/app/components/TemplateExamples.tsx`

Templates HTML prontos para uso:

#### Templates de E-mail:
- **credentialHarvest** - Coleta de credenciais com design corporativo
- **ceoFraud** - CEO Fraud simulando urgência

#### Templates de Landing Page:
- **credentialHarvest** - Página de redefinição de senha
- **loginPortal** - Portal de login corporativo

---

## Fluxo de Criação de Template

### 1. Informações Básicas
```
Nome: "Phishing - Reset de Senha Microsoft"
Categoria: "Coleta de Credenciais"
Assunto: "Ação Urgente: Sua conta será bloqueada"
```

### 2. Template de E-mail
- Cole ou escreva HTML
- Insira variáveis usando o botão "Inserir Variável"
- Visualize em tempo real
- Adicione anexos (opcional)

### 3. Landing Page (Opcional)
- Ative "Incluir Landing Page"
- Configure o HTML da página
- Selecione campos de captura
- Adicione anexos para download

### 4. Configurações Finais
- Template Global: Disponível para todos os clientes
- Revisar e criar

---

## Exemplo Completo de Template HTML

### E-mail com Variáveis:
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Redefinição de Senha</title>
</head>
<body style="font-family: Arial, sans-serif; padding: 20px;">
    <h2>Olá, {{primeiro_nome}}!</h2>
    
    <p>Detectamos atividade suspeita em sua conta <strong>{{email}}</strong>.</p>
    
    <p>Por favor, clique no link abaixo para redefinir sua senha:</p>
    
    <a href="{{link_phishing}}" style="background: #0066cc; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
        Redefinir Senha
    </a>
    
    <p style="margin-top: 30px;">
        Atenciosamente,<br>
        Equipe de TI - {{empresa}}<br>
        {{data_atual}}
    </p>
</body>
</html>
```

---

## Segurança e Boas Práticas

### ⚠️ Dados Sensíveis
- Todos os dados capturados são criptografados
- Use campos de senha apenas para treinamento
- Informe os participantes sobre a natureza educacional

### 🔒 Sanitização
- Todo HTML é sanitizado com DOMPurify
- Scripts maliciosos são bloqueados
- Apenas HTML seguro é renderizado

### 📊 Rastreamento
- Variável `{{link_phishing}}` gera URL única
- Cada clique é rastreado individualmente
- Dados de captura vinculados ao alvo

---

## Integração com Backend Django

### Endpoints Esperados:

#### 1. Criar Template
```
POST /api/templates/
{
  "name": "Template Name",
  "subject": "Email Subject",
  "category": "credential-harvest",
  "html_content": "<html>...</html>",
  "landing_page_html": "<html>...</html>",
  "capture_fields": ["nome", "email", "senha"],
  "is_global": false,
  "attachments": [...]
}
```

#### 2. Captura de Dados
```
POST /api/campaigns/{id}/capture/
{
  "target_id": "uuid",
  "captured_data": {
    "nome": "João Silva",
    "email": "joao@empresa.com",
    "senha": "********",
    ...
  },
  "timestamp": "2026-03-08T14:30:00Z"
}
```

#### 3. Substituição de Variáveis
No backend, ao enviar e-mails:
```python
def replace_variables(template_html, target_data):
    html = template_html
    for key, value in target_data.items():
        html = html.replace(f"{{{{{key}}}}}", value)
    return html
```

---

## Métricas e Análise

### Dados Capturados:
- **Taxa de Abertura:** Quantos abriram o e-mail
- **Taxa de Clique:** Quantos clicaram no link
- **Taxa de Captura:** Quantos enviaram dados
- **Campos Comprometidos:** Quais dados foram enviados

### Relatórios:
- Tempo médio até captura
- Campos mais comprometidos
- Dispositivos utilizados
- Localização geográfica

---

## Próximos Passos

### Backend (Django):
1. ✅ Criar models para templates expandidos
2. ✅ Implementar endpoints de captura
3. ✅ Sistema de variáveis dinâmicas
4. ✅ Armazenamento criptografado de dados
5. ✅ Engine de substituição de variáveis

### Frontend:
1. ✅ Editor HTML com preview
2. ✅ Sistema de variáveis
3. ✅ Gerenciador de anexos
4. ✅ Configuração de captura
5. 🔄 Biblioteca de templates prontos
6. 🔄 Estatísticas de captura em tempo real

---

## Suporte

Para dúvidas ou problemas:
- **Documentação completa:** `/guidelines/Guidelines.md`
- **Autenticação:** `/AUTHENTICATION.md`
- **Keycloak:** `/KEYCLOAK_SETUP.md`
- **Troubleshooting:** `/TROUBLESHOOTING.md`

---

**Última atualização:** 08/03/2026  
**Versão:** 2.0.0  
**Plataforma:** Matreiro - Under Protection
