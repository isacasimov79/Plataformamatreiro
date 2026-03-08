# Plataforma Matreiro - Implementação Completa

## ✅ Funcionalidades Implementadas

### 1. **Editor HTML Avançado** (`HtmlTemplateEditor`)
- 📝 **5 Abas de edição:**
  - HTML: Editor de código HTML com syntax highlighting
  - CSS: Editor de estilos customizados
  - JavaScript: Suporte completo a scripts personalizados
  - Imagens: Upload múltiplo de imagens com preview
  - Preview: Visualização em tempo real do template

- 🎨 **Variáveis Dinâmicas por Tipo:**
  - **Certificados:** `{{TRAINEE_NAME}}`, `{{TRAINING_TITLE}}`, `{{COMPLETION_DATE}}`, `{{CERTIFICATE_CODE}}`, `{{SCORE}}`, `{{CLIENT_LOGO}}`, `{{UNDERPROTECTION_LOGO}}`, `{{MATREIRO_LOGO}}`
  - **E-mails:** `{{TARGET_NAME}}`, `{{TARGET_EMAIL}}`, `{{CAMPAIGN_NAME}}`, `{{PHISHING_LINK}}`, `{{TRACKING_PIXEL}}`, `{{CLIENT_LOGO}}`
  - **Landing Pages:** `{{TARGET_NAME}}`, `{{CAMPAIGN_NAME}}`, `{{REDIRECT_URL}}`, `{{CLIENT_LOGO}}`, `{{UNDERPROTECTION_LOGO}}`

- 🖼️ **Upload de Imagens:**
  - Suporte a múltiplos formatos (PNG, JPG, GIF, SVG)
  - Preview em tempo real
  - Gerenciamento de imagens carregadas
  - Geração automática de URLs para uso nos templates

### 2. **Upload de Logo do Cliente** (`ClientLogoUpload`)
- 📤 Upload de logo corporativo do cliente
- 🎯 Preview instantâneo antes do upload
- ✂️ Suporte a recorte e ajuste de imagem
- 💾 Salvamento vinculado ao tenant (cliente)
- 🔄 Atualização dinâmica em templates e relatórios

**Integração:** Botão de upload adicionado na página de Tenants, permitindo que cada cliente tenha sua própria identidade visual.

### 3. **Logos da Plataforma** (`/src/app/lib/assets.ts`)
- 🛡️ **Logo Under Protection:** Configurada e disponível globalmente
- 🎯 **Logo Matreiro:** Referência para uso em templates
- 🎨 **Cores da marca:** 
  - Navy: `#242545`
  - Purple/Roxo: `#834a8b`
  - Graphite: `#4a4a4a`

### 4. **Integração nas Páginas**

#### **Templates (E-mail e Landing Pages)**
- ✨ Botão "Editor HTML Avançado" no header
- 🎨 Criação de templates complexos com HTML/CSS/JS
- 📧 Suporte a templates de e-mail de phishing
- 🌐 Suporte a landing pages web personalizadas
- 🖼️ Upload de imagens para use nos templates
- 🔄 Preview em tempo real

#### **Certificados**
- ✨ Botão "Editor HTML Avançado" na aba Templates
- 🏆 Criação de certificados HTML personalizados
- 📝 Variáveis dinâmicas para dados do treinamento
- 🎓 Templates pré-configurados (Clássico, Moderno Roxo, Corporativo Azul)
- ✅ Sistema de validação de certificados
- 📥 Download em PDF

#### **Tenants (Clientes)**
- 🖼️ Botão de upload de logo integrado na tabela
- 👁️ Funcionalidade de impersonation para superadmins
- ⚙️ Configuração de phishing automático
- 🔐 Gerenciamento de permissões por cliente

## 📂 Estrutura de Arquivos

```
/src/app/
├── components/
│   ├── HtmlTemplateEditor.tsx          # Editor HTML completo com 5 abas
│   ├── ClientLogoUpload.tsx            # Upload de logo do cliente
│   └── ui/                             # Componentes UI base
├── pages/
│   ├── Templates.tsx                   # Templates de e-mail e landing pages + Editor HTML
│   ├── Certificates.tsx                # Certificados + Editor HTML
│   ├── Tenants.tsx                     # Clientes + Upload de logo
│   └── ...
├── lib/
│   ├── assets.ts                       # Logos e cores da marca
│   └── mockData.ts                     # Dados de demonstração
└── contexts/
    └── AuthContext.tsx                 # Autenticação e impersonation
```

## 🎯 Variáveis Dinâmicas Disponíveis

### Certificados
| Variável | Descrição |
|----------|-----------|
| `{{TRAINEE_NAME}}` | Nome do treinado |
| `{{TRAINING_TITLE}}` | Título do treinamento |
| `{{COMPLETION_DATE}}` | Data de conclusão |
| `{{CERTIFICATE_CODE}}` | Código único do certificado |
| `{{SCORE}}` | Nota obtida |
| `{{CLIENT_LOGO}}` | Logo do cliente (uploaded) |
| `{{UNDERPROTECTION_LOGO}}` | Logo da Under Protection |
| `{{MATREIRO_LOGO}}` | Logo da Matreiro |
| `{{CURRENT_DATE}}` | Data atual |

### E-mails de Phishing
| Variável | Descrição |
|----------|-----------|
| `{{TARGET_NAME}}` | Nome do destinatário |
| `{{TARGET_EMAIL}}` | E-mail do destinatário |
| `{{CAMPAIGN_NAME}}` | Nome da campanha |
| `{{PHISHING_LINK}}` | Link da página de phishing |
| `{{SENDER_NAME}}` | Nome do remetente |
| `{{SENDER_EMAIL}}` | E-mail do remetente |
| `{{TRACKING_PIXEL}}` | Pixel de rastreamento |
| `{{CLIENT_LOGO}}` | Logo do cliente |

### Landing Pages
| Variável | Descrição |
|----------|-----------|
| `{{TARGET_NAME}}` | Nome do alvo |
| `{{CAMPAIGN_NAME}}` | Nome da campanha |
| `{{REDIRECT_URL}}` | URL de redirecionamento |
| `{{CLIENT_LOGO}}` | Logo do cliente |
| `{{UNDERPROTECTION_LOGO}}` | Logo da Under Protection |

## 🎨 Identidade Visual

### Cores Under Protection
```css
--navy: #242545;
--purple: #834a8b;
--graphite: #4a4a4a;
```

### Tipografia
- **Fonte principal:** Montserrat (definida no manual da marca)
- Weights disponíveis: 400, 500, 600, 700

## 🚀 Como Usar

### 1. Criar Template HTML de E-mail
1. Navegue para **Templates**
2. Clique em **"Editor HTML Avançado"**
3. Adicione seu HTML, CSS e JavaScript nas respectivas abas
4. Faça upload das imagens necessárias
5. Use variáveis dinâmicas (ex: `{{TARGET_NAME}}`)
6. Visualize no Preview
7. Salve o template

### 2. Criar Certificado Personalizado
1. Navegue para **Certificados**
2. Vá para a aba **"Templates"**
3. Clique em **"Editor HTML Avançado"**
4. Crie o design do certificado com HTML/CSS
5. Use variáveis como `{{TRAINEE_NAME}}` e `{{TRAINING_TITLE}}`
6. Adicione logos (`{{CLIENT_LOGO}}`, `{{UNDERPROTECTION_LOGO}}`)
7. Salve o template

### 3. Fazer Upload de Logo do Cliente
1. Navegue para **Tenants**
2. Localize o cliente na tabela
3. Clique no botão com ícone de imagem
4. Selecione o arquivo da logo
5. Ajuste a imagem se necessário
6. Salve

## 🔐 Permissões e Segurança

- **Superadmin:** Acesso completo, incluindo impersonation
- **Admin:** Gerenciamento de templates e certificados do próprio tenant
- **User:** Visualização de certificados próprios

## 📝 Próximos Passos Sugeridos

1. **Backend Integration:**
   - API para salvar templates HTML no PostgreSQL
   - Endpoint de upload de imagens para S3/Storage
   - API de geração de PDF a partir de HTML (ex: Puppeteer)

2. **Validação de Templates:**
   - Sanitização de HTML para prevenir XSS
   - Validação de variáveis dinâmicas
   - Testes de compatibilidade de e-mail (Litmus/Email on Acid)

3. **Melhorias no Editor:**
   - Autocomplete para variáveis dinâmicas
   - Syntax highlighting melhorado
   - Biblioteca de snippets pré-prontos
   - Versionamento de templates

4. **Analytics:**
   - Tracking de uso de templates
   - Métricas de efetividade por template
   - A/B testing de templates

## 🐛 Resolução de Problemas

### Site não abre / Erro "useAuth is not defined"
**Causa:** Cache do navegador com código antigo

**Solução:**
1. Pressione `Ctrl + Shift + R` (Windows/Linux) ou `Cmd + Shift + R` (Mac) para hard reload
2. Limpe o cache do navegador
3. Abra em aba anônima para testar

### Upload de imagem não funciona
**Causa:** Falta implementação do backend

**Solução Temporária:** As imagens são convertidas em Base64 e armazenadas localmente. Em produção, integre com S3 ou similar.

## 📞 Suporte

Para dúvidas ou problemas:
- **Desenvolvedor:** Igor @ Under Protection
- **Documentação:** Este arquivo
- **Código:** Totalmente comentado e documentado

---

**Desenvolvido com ❤️ para a Plataforma Matreiro**
*Under Protection - Segurança da Informação*
