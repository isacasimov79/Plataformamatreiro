# 🚀 COMO RODAR A PLATAFORMA MATREIRO

## ⚡ SOLUÇÃO IMEDIATA - Site Não Abre

### Se o site não carregar ou aparecer erro:

```bash
# PRESSIONE NO NAVEGADOR:
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

**Isso resolve 99% dos problemas!**

---

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou pnpm
- Navegador moderno (Chrome, Firefox, Edge)

---

## 🏃 Início Rápido

### 1. Instalar Dependências (se necessário)
```bash
npm install
# ou
pnpm install
```

### 2. Iniciar o Servidor de Desenvolvimento
```bash
npm run dev
# ou
pnpm dev
```

### 3. Abrir no Navegador
```
http://localhost:5173
```

### 4. Login Padrão (Desenvolvimento)
```
Email: igor@underprotection.com.br
Senha: qualquer coisa (modo dev)
```

**OU** o sistema faz auto-login como superadmin em modo dev.

---

## 🔧 Troubleshooting Rápido

### Problema: Site em branco ou erro
```bash
# Solução 1: Hard Reload
Ctrl + Shift + R

# Solução 2: Limpar cache
# DevTools (F12) > Application > Clear Storage > Clear site data

# Solução 3: Aba anônima
Ctrl + Shift + N (Chrome)
Ctrl + Shift + P (Firefox)
```

### Problema: Mudanças não aparecem
```bash
# 1. Verificar se Vite recarregou automaticamente
# 2. Se não, fazer hard reload:
Ctrl + Shift + R

# 3. Se ainda não funcionar, reiniciar servidor:
# Ctrl + C para parar
npm run dev
```

### Problema: Erro de módulo não encontrado
```bash
# Reinstalar dependências
rm -rf node_modules
npm install
npm run dev
```

---

## 📂 Estrutura do Projeto

```
matreiro/
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── HtmlTemplateEditor.tsx    ⭐ Editor HTML
│   │   │   ├── ClientLogoUpload.tsx      ⭐ Upload logo
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Templates.tsx             ✏️ Templates
│   │   │   ├── Certificates.tsx          ✏️ Certificados
│   │   │   ├── Tenants.tsx               Clientes
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx           Auth
│   │   └── lib/
│   │       ├── assets.ts                 ⭐ Logos/cores
│   │       └── ...
│   └── ...
├── public/
├── package.json
└── vite.config.ts
```

---

## 🎯 Testar Funcionalidades Implementadas

### 1. Editor HTML de Templates
```
1. Fazer login
2. Ir para menu "Templates"
3. Clicar em "Editor HTML Avançado"
4. Testar as 5 abas:
   - HTML
   - CSS  
   - JavaScript
   - Imagens (fazer upload)
   - Preview
5. Salvar template
```

### 2. Editor HTML de Certificados
```
1. Ir para menu "Certificados"
2. Clicar na aba "Templates"
3. Clicar em "Editor HTML Avançado"
4. Criar certificado com variáveis:
   - {{TRAINEE_NAME}}
   - {{TRAINING_TITLE}}
   - etc.
5. Salvar
```

### 3. Upload de Logo do Cliente
```
1. Ir para menu "Tenants"
2. Na tabela, localizar um cliente
3. Clicar no ícone de imagem 🖼️
4. Selecionar uma imagem
5. Ver preview
6. Salvar
```

---

## 🎨 Variáveis Dinâmicas Disponíveis

### Certificados:
- `{{TRAINEE_NAME}}` - Nome do treinado
- `{{TRAINING_TITLE}}` - Título do treinamento
- `{{COMPLETION_DATE}}` - Data de conclusão
- `{{CERTIFICATE_CODE}}` - Código do certificado
- `{{SCORE}}` - Nota obtida
- `{{CLIENT_LOGO}}` - Logo do cliente
- `{{UNDERPROTECTION_LOGO}}` - Logo Under Protection
- `{{MATREIRO_LOGO}}` - Logo Matreiro
- `{{CURRENT_DATE}}` - Data atual

### E-mails:
- `{{TARGET_NAME}}` - Nome do destinatário
- `{{TARGET_EMAIL}}` - E-mail do destinatário
- `{{CAMPAIGN_NAME}}` - Nome da campanha
- `{{PHISHING_LINK}}` - Link de phishing
- `{{SENDER_NAME}}` - Nome do remetente
- `{{SENDER_EMAIL}}` - E-mail do remetente
- `{{TRACKING_PIXEL}}` - Pixel de tracking
- `{{CLIENT_LOGO}}` - Logo do cliente
- `{{CURRENT_DATE}}` - Data atual

### Landing Pages:
- `{{TARGET_NAME}}` - Nome do alvo
- `{{CAMPAIGN_NAME}}` - Nome da campanha
- `{{REDIRECT_URL}}` - URL de redirecionamento
- `{{CLIENT_LOGO}}` - Logo do cliente
- `{{UNDERPROTECTION_LOGO}}` - Logo Under Protection
- `{{CURRENT_DATE}}` - Data atual

---

## 📚 Documentação Disponível

1. **IMPLEMENTACAO_COMPLETA.md**
   - Guia completo de todas as funcionalidades
   - Como usar cada componente
   - Estrutura detalhada

2. **TEMPLATES_EXEMPLOS.md**
   - 3 templates HTML prontos para usar
   - Certificado completo
   - E-mail de phishing
   - Landing page Microsoft 365

3. **TROUBLESHOOTING_SITE.md**
   - Soluções para problemas comuns
   - Debug step-by-step

4. **CHECKLIST_FINAL.md**
   - Checklist rápido do que foi feito
   - Testes rápidos

---

## 🔐 Autenticação

### Modo Desenvolvimento (padrão):
- Auto-login como superadmin
- Não precisa de Keycloak
- Usuário: `igor@underprotection.com.br`

### Modo Produção (Keycloak):
- Configurar variáveis de ambiente
- `.env`:
  ```
  VITE_KEYCLOAK_URL=http://seu-keycloak:8080
  VITE_KEYCLOAK_REALM=matreiro
  VITE_KEYCLOAK_CLIENT_ID=matreiro-frontend
  VITE_KEYCLOAK_ENABLED=true
  ```

---

## 🌐 Navegação da Plataforma

### Menu Principal:

1. **Dashboard** - Visão geral e métricas
2. **Analytics** - Dashboards avançados
3. **Tenants** - Gerenciar clientes 🖼️ (upload logo)
4. **Campanhas** - Campanhas de phishing
5. **Templates** - Templates de email/web ⭐ (editor HTML)
6. **Landing Pages** - Páginas de captura
7. **Relatórios** - Análises e reports
8. **Treinamentos** - Módulos educacionais
9. **Certificados** - Certificados de conclusão ⭐ (editor HTML)
10. **Alvos** - Gerenciar destinatários
11. **Grupos de Alvos** - Segmentação
12. **Automações** - Fluxos automatizados
13. **Usuários do Sistema** - Gerenciar usuários
14. **Permissões** - RBAC
15. **Integrações** - M365, Google Workspace
16. **Notificações** - Alertas do sistema
17. **Logs de Auditoria** - Rastreabilidade
18. **Configurações** - Configurações gerais

---

## ⚙️ Configurações do Projeto

### Vite
- Hot Module Replacement (HMR) ativo
- Recarregamento automático ao salvar

### React
- React 18
- TypeScript
- React Router v7

### UI
- Tailwind CSS v4
- Shadcn/ui components
- Lucide icons

### Cores da Marca
```css
--navy: #242545
--purple: #834a8b
--graphite: #4a4a4a
```

---

## 🐛 Debug

### Console do Navegador (F12):

1. **Console** - Ver erros JavaScript
2. **Network** - Ver requisições HTTP
3. **Application** - Ver cache e storage
4. **Elements** - Inspecionar HTML/CSS

### Logs do Vite:

Observe o terminal onde rodou `npm run dev`
- Verde: Sucesso
- Amarelo: Avisos
- Vermelho: Erros

---

## 📦 Build de Produção

```bash
# Build
npm run build

# Preview do build
npm run preview

# Testar build local
http://localhost:4173
```

---

## ✅ Checklist de Verificação

Antes de reportar problema, verificar:

- [ ] Node.js instalado (node --version)
- [ ] Dependências instaladas (node_modules existe)
- [ ] Servidor rodando (npm run dev)
- [ ] Navegador atualizado
- [ ] Cache limpo (Ctrl+Shift+R)
- [ ] Console sem erros críticos
- [ ] URL correta (localhost:5173)

---

## 🆘 Suporte

### Problema persiste?

1. **Verificar console de erros:**
   - F12 > Console
   - Copiar erros vermelhos

2. **Verificar network:**
   - F12 > Network
   - Ver se há requisições falhando

3. **Verificar versões:**
   ```bash
   node --version
   npm --version
   ```

4. **Reinstalar tudo:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   npm run dev
   ```

---

## 🎉 Tudo Funcionando?

Se conseguir:
- ✅ Fazer login
- ✅ Ver o dashboard
- ✅ Navegar pelo menu
- ✅ Abrir o Editor HTML
- ✅ Fazer upload de imagem

**Parabéns! A plataforma está funcionando perfeitamente!** 🎊

---

## 📞 Contato

**Desenvolvedor:** Igor  
**Empresa:** Under Protection  
**Plataforma:** Matreiro  
**Status:** ✅ Implementação Completa

---

**🚀 Boa sorte com a Plataforma Matreiro!**

*Desenvolvido com ❤️ para simular ataques de phishing e treinar segurança da informação*

---

*Última atualização: 08/03/2026*

---

## ⚠️ APRENDIZADOS DE REBUILD (04/2026)

_Seções adicionadas após o rebuild de UX ter destruído o frontend em produção._

### 1. Arquitetura Real do Frontend

O frontend é servido pelo **Nginx a partir do-host** (`/var/www/matreiro`), NÃO do volume Docker. O container `matreiro_nginx` faz bind mount desse diretório.

```
npm run build  →  /root/.openclaw/workspace/Plataformamatreirosaas/dist/
                                    ↓ cp
                            /var/www/matreiro/    ← nginx lê daqui
```

**Se você rebuildar sem copiar, o site continua servindo o build antigo.**

### 2. O Problema dos Imports "figma:asset"

O projeto usa um plugin Figma (`@figma/my-make-file`) que gera imports assim:
```tsx
import logoMatreiro from 'figma:asset/a30d3ade4a75c608bfa9c14ebe020b7e956f0655.png';
```

Esses imports **não existem no filesystem** e quebram o Rollup em produção. Para rebuildar:

```bash
# Substituir TODOS os imports figma:asset por uma string vazia ANTES do build
find src -type f -name "*.tsx" -exec sed -i "s|import logoMatreiro from [^;]*;|const logoMatreiro = '';|g" {} +
npm run build
```

⚠️ **Isso significa que os logos NÃO aparecem após rebuildar localmente.** 
Para restaurar os logos, é preciso reverter o sed e usar o plugin Figma no ambiente original.

### 3. Ordem Correta de Rebuild (Sem Destruir)

```bash
# 1. Build local
cd /root/.openclaw/workspace/Plataformamatreirosaas
npm run build

# 2. Copiar para o diretório do Nginx (NO HOST, não no container)
cp -r dist/* /var/www/matreiro/

# 3. Reiniciar SOMENTE o Nginx e Django (NÃO usar docker-compose up -d completo)
docker restart matreiro_nginx matreiro_django

# 4. Verificar que está no ar
curl -s http://10.35.0.39/ | grep "index-"
```

**⚠️ NÃO USE `docker-compose up -d` durante o trabalho!** 
O compose tenta recriar todos os containers e entra em loop de dependências com postgres/redis.

### 4. Containers Estão Rodando Manualmente

Os containers do deploy atual foram subir manualmente (`docker run`), não via `docker-compose`. O compose tem issues com "container is marked for removal" e "dependency failed to start".

Se precisar restartar:
```bash
docker restart matreiro_nginx matreiro_postgres matreiro_redis matreiro_django
```

Se algum não subir, suba manualmente:
```bash
# Redis e Postgres primeiro
docker start matreiro_redis matreiro_postgres

# Depois Django
docker run -d --network plataformamatreirosaas_network --name matreiro_django -p 8000:8000 \
  -e "DATABASE_URL=postgresql://matreiro_user:matreiro_password@postgres:5432/matreiro_db" \
  -e "REDIS_URL=redis://redis:6379/0" \
  -e DJANGO_SETTINGS_MODULE=matreiro.settings \
  -e PYTHONUNBUFFERED=1 \
  plataformamatreirosaas-django:latest \
  gunicorn matreiro.wsgi:application --bind 0.0.0.0:8000 --workers 2 --threads 2 --timeout 120

# Nginx por último
docker run -d --network plataformamatreirosaas_network --name matreiro_nginx \
  -p 80:80 \
  -v /tmp/nginx.conf:/etc/nginx/conf.d/default.conf:ro \
  -v /var/www/matreiro:/usr/share/nginx/html:ro \
  nginx:alpine
```

### 5. Configuração do Nginx (Produção)

O Nginx no host usa `/tmp/nginx.conf` com referência a `matreiro_django` (não só `django`). O arquivo do compose está em `./nginx.conf` mas a versão corrigida que funciona está em `/tmp/nginx.conf`.

Para verificar qual está ativo:
```bash
docker exec matreiro_nginx cat /etc/nginx/conf.d/default.conf | grep upstream
```

### 6. Django Settings e DATABASE_URL

O Django **SÓ funciona** se a variável `DATABASE_URL` estiver setada. O `settings.py` tem um default hardcoded com senha errada:
```python
default='postgresql://matreiro_user:matreiro_password_dev@postgres:5432/matreiro_db'
#                                                            ^^^^^^^^ senha errada
```

Se o Django logar `password authentication failed`, é porque a variável não chegou. Verifique:
```bash
docker exec matreiro_django env | grep DATABASE
```

### 7. Se o npm install Morre (SIGKILL)

O servidor tem RAM limitada. Use:
```bash
# Reduzir workers e threads
NODE_OPTIONS="--max-old-space-size=2048" npm install --prefer-offline

# Ou instalar em partes
npm install --no-optional --legacy-peer-deps
```

### 8. Health Check do Sistema

```bash
# Backend
curl http://10.35.0.39:8000/api/health/

# Frontend
curl http://10.35.0.39/

# Nginx
curl -I http://10.35.0.39/

# Postgres (via container)
docker exec matreiro_postgres pg_isready -U matreiro_user -d matreiro_db
```

---

**Resumo: Rebuildar o frontend sem derrubar o sistema**

```bash
# Fluxo seguro (não destrói containers rodando)
cd /root/.openclaw/workspace/Plataformamatreirosaas
find src -type f -name "*.tsx" -exec sed -i "s|import logoMatreiro from [^;]*;|const logoMatreiro = '';|g" {} +
npm run build
cp -r dist/* /var/www/matreiro/
docker restart matreiro_nginx
# Django não precisa restartar se não mudou o backend
```

