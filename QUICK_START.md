# 🚀 Quick Start - Plataforma Matreiro

## Início Rápido para Desenvolvedores

### 1️⃣ Clonar e Instalar

```bash
# Clonar o repositório
git clone <repo-url>
cd matreiro-platform

# Instalar dependências do frontend
npm install
# ou
pnpm install

# Instalar dependências do backend (Django)
cd backend
pip install -r requirements.txt
```

### 2️⃣ Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```bash
# API Backend URL
VITE_API_URL=http://localhost:8000/api

# Keycloak Configuration (já configurado)
VITE_KEYCLOAK_URL=https://iam.upn.com.br
VITE_KEYCLOAK_REALM=underprotection
VITE_KEYCLOAK_CLIENT_ID=Matreiro
```

### 3️⃣ Configurar Backend Django

No arquivo `backend/settings.py`, adicione:

```python
# Keycloak settings
KEYCLOAK_SERVER_URL = 'https://iam.upn.com.br'
KEYCLOAK_REALM = 'underprotection'
KEYCLOAK_CLIENT_ID = 'Matreiro'
KEYCLOAK_CLIENT_SECRET = 'tkbSnkMzHL60DIpkdIPrmGyrtqauazsM'
```

### 4️⃣ Iniciar Serviços com Docker

```bash
# Na raiz do projeto
docker-compose up -d

# Ou individualmente:
docker-compose up postgres redis -d
```

### 5️⃣ Rodar Migrações do Django

```bash
cd backend
python manage.py migrate
python manage.py createsuperuser  # Opcional
```

### 6️⃣ Iniciar Aplicação

**Frontend:**
```bash
npm run dev
# ou
pnpm dev

# Acesse: http://localhost:5173
```

**Backend:**
```bash
cd backend
python manage.py runserver 0.0.0.0:8000

# API: http://localhost:8000
```

## 🔑 Testar Autenticação

1. Acesse `http://localhost:5173`
2. Clique em **"Entrar com Keycloak"**
3. Você será redirecionado para `https://iam.upn.com.br`
4. Faça login com suas credenciais do Keycloak
5. Após autenticação, será redirecionado de volta para a plataforma

### Usuário de Teste (se configurado)
- **Email**: igor@underprotection.com.br
- **Senha**: (definida no Keycloak)
- **Role**: superadmin

## 📋 Estrutura do Projeto

```
matreiro-platform/
├── src/
│   ├── app/
│   │   ├── components/      # Componentes React
│   │   ├── contexts/        # Context API (AuthContext)
│   │   ├── lib/            # Utilitários (keycloak, api, mockData)
│   │   ├── pages/          # Páginas da aplicação
│   │   └── App.tsx         # Componente principal
│   └── imports/            # Assets importados do Figma
├── backend/
│   ├── core/              # App principal Django
│   ├── tenants/           # App de tenants
│   ├── campaigns/         # App de campanhas
│   ├── templates/         # App de templates
│   └── trainings/         # App de treinamentos
├── docker-compose.yml      # Orquestração Docker
├── .env                   # Variáveis de ambiente
└── package.json           # Dependências Node.js
```

## 🛠️ Comandos Úteis

### Docker
```bash
# Subir todos os serviços
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar serviços
docker-compose down

# Rebuild
docker-compose up -d --build
```

### Frontend
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Instalar nova dependência
npm install <package>
```

### Backend
```bash
# Criar nova migration
python manage.py makemigrations

# Aplicar migrations
python manage.py migrate

# Shell Django
python manage.py shell

# Criar superuser
python manage.py createsuperuser
```

## 🎯 Funcionalidades Principais

### ✅ Implementadas
- [x] Autenticação completa com Keycloak (SSO)
- [x] Dashboard com métricas
- [x] Gestão de Tenants (clientes)
- [x] Gestão de Usuários (manual, CSV, integrações)
- [x] Templates de email
- [x] Campanhas de phishing
- [x] Treinamentos
- [x] Logs e debug
- [x] Impersonation de tenants
- [x] RBAC (roles: superadmin, admin, user)

### 🔜 Próximas Features
- [ ] Integração real Azure AD/M365
- [ ] Integração real Google Workspace
- [ ] Engine de tracking de emails
- [ ] Detecção de fraude em provas (IA)
- [ ] Relatórios avançados
- [ ] Notificações em tempo real

## 🔐 Autenticação

### Como Funciona
1. Frontend usa **keycloak-js** para gerenciar autenticação
2. Token JWT é obtido após login no Keycloak
3. Token é automaticamente incluído em todas as requisições API
4. Token é renovado automaticamente antes de expirar
5. Backend Django valida token JWT

### Arquivos Importantes
- `/src/app/lib/keycloak.ts` - Configuração Keycloak
- `/src/app/lib/api.ts` - Cliente HTTP com interceptor
- `/src/app/contexts/AuthContext.tsx` - Context de autenticação

### Documentação Completa
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Guia completo de autenticação
- [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md) - Setup do Keycloak

## 🧪 Testar API

### Com cURL
```bash
# 1. Obter token do Keycloak
TOKEN=$(curl -X POST 'https://iam.upn.com.br/realms/underprotection/protocol/openid-connect/token' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'client_id=Matreiro' \
  -d 'client_secret=tkbSnkMzHL60DIpkdIPrmGyrtqauazsM' \
  -d 'grant_type=client_credentials' | jq -r '.access_token')

# 2. Usar token na API
curl -X GET 'http://localhost:8000/api/tenants/' \
  -H "Authorization: Bearer $TOKEN"
```

### No Frontend
```tsx
import { tenantsAPI } from './lib/apiExamples';

// Token é adicionado automaticamente
const tenants = await tenantsAPI.getAll();
```

## 📊 URLs Importantes

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api
- **Django Admin**: http://localhost:8000/admin
- **Keycloak**: https://iam.upn.com.br
- **Keycloak Admin**: https://iam.upn.com.br/admin

## 🐛 Debug

### Ativar Logs
```tsx
// No AuthContext, já existem logs:
console.log('Token was successfully refreshed');
console.error('Failed to refresh token');
```

### Ver Token no Console
```javascript
// Abra o console do navegador (F12)
console.log(keycloak.token);
console.log(keycloak.tokenParsed);
```

### Verificar Requisições
1. Abra DevTools (F12)
2. Aba Network
3. Faça uma requisição
4. Verifique header `Authorization: Bearer <token>`

## 🆘 Problemas Comuns

### Keycloak não conecta
- ✅ Verifique se a URL está correta: `https://iam.upn.com.br`
- ✅ Verifique se o realm existe: `underprotection`
- ✅ Verifique se o client está configurado: `Matreiro`

### API retorna 401
- ✅ Verifique se está autenticado
- ✅ Verifique se o token está sendo enviado
- ✅ Verifique se o backend está validando corretamente

### Erro de CORS
- ✅ Configure Web Origins no Keycloak: `http://localhost:5173`
- ✅ Configure CORS no Django backend

### Token expira
- ✅ O refresh é automático, aguarde
- ✅ Se persistir, faça logout e login novamente

## 📚 Documentação Adicional

- [README.md](./README.md) - Visão geral do projeto
- [AUTHENTICATION.md](./AUTHENTICATION.md) - Guia de autenticação
- [KEYCLOAK_SETUP.md](./KEYCLOAK_SETUP.md) - Setup Keycloak
- [API Examples](./src/app/lib/apiExamples.ts) - Exemplos de API

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/nova-feature`
2. Commit: `git commit -m 'Add nova feature'`
3. Push: `git push origin feature/nova-feature`
4. Abra um Pull Request

## 📞 Suporte

- **Desenvolvido por**: Under Protection Network
- **Contato**: igor@underprotection.com.br
- **Keycloak Admin**: https://iam.upn.com.br/admin

---

**Pronto para começar! 🚀**

Qualquer dúvida, consulte os arquivos de documentação ou abra uma issue.
