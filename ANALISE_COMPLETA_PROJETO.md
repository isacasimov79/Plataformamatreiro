# 📊 Análise Completa - Plataforma Matreiro

**Data:** 08/03/2026  
**Versão:** 2.0.0  
**Status:** 🔴 DESENVOLVIMENTO EM ANDAMENTO

---

## 🎯 RESUMO EXECUTIVO

### ✅ O QUE ESTÁ IMPLEMENTADO:
- ✅ Autenticação via Keycloak (SSO)
- ✅ Multi-tenancy básico (clientes e sub-clientes)
- ✅ Impersonation (superadmin)
- ✅ Models básicos (User, Tenant, Campaign, Template, Training)
- ✅ Frontend React completo com todas as páginas
- ✅ Sistema de templates HTML expandido
- ✅ Gerenciador de variáveis e anexos
- ✅ Dashboard com métricas
- ✅ Audit logs

### 🔴 O QUE FALTA IMPLEMENTAR:

#### 1. RBAC GRANULAR (🔴 CRÍTICO)
- ❌ Sistema de permissões granulares
- ❌ Models: Permission, Role, RolePermission
- ❌ Decorators de permissão customizados
- ❌ Middleware de verificação de permissões
- ❌ UI de gerenciamento de permissões
- ❌ Atribuição de permissões por recurso

#### 2. MULTI-IDIOMA (🔴 CRÍTICO)
- ❌ Backend: Django i18n configurado
- ❌ Frontend: react-i18next
- ❌ Arquivos de tradução (PT, ES, EN)
- ❌ Detecção automática do idioma do browser
- ❌ Seletor de idioma na UI
- ❌ Tradução de emails e templates

#### 3. IMPORTAÇÃO DE ALVOS (🔴 CRÍTICO)
- ❌ Model: TargetImport
- ❌ Integração Microsoft Graph API
- ❌ Integração Google Workspace API
- ❌ Parser de CSV/Excel
- ❌ Validação de dados importados
- ❌ UI de importação com preview
- ❌ Sincronização automática com AD

#### 4. LANDING PAGES E CAPTURA (🟡 ALTA)
- ❌ Model: LandingPage, CapturedData
- ❌ Engine de renderização de landing pages
- ❌ Sistema de captura de dados
- ❌ Criptografia de dados capturados
- ❌ Anexos em landing pages
- ❌ Tracking de submissões

#### 5. TEMPLATES EXPANDIDOS (🟡 ALTA)
- ❌ Model: TemplateAttachment, TemplateVariable
- ❌ Sistema de variáveis dinâmicas no backend
- ❌ Engine de substituição de variáveis
- ❌ Anexos em templates
- ❌ Biblioteca de templates prontos

#### 6. INTEGRAÇÕES (🟡 ALTA)
- ❌ Microsoft 365 / Azure AD sync
- ❌ Google Workspace sync
- ❌ Webhooks para eventos
- ❌ API pública para integrações

#### 7. RELATÓRIOS AVANÇADOS (🟢 MÉDIA)
- ❌ Exportação PDF/Excel
- ❌ Dashboards customizáveis
- ❌ Comparação entre campanhas
- ❌ Análise de tendências

#### 8. TREINAMENTOS IA (🟢 MÉDIA)
- ❌ Model: TrainingQuestion, TrainingAnswer
- ❌ Detecção de fraude em provas (IA)
- ❌ Geração automática de certificados
- ❌ Tracking de progresso detalhado

#### 9. AUTOMAÇÕES (🟢 MÉDIA)
- ❌ Phishing automático para novos usuários
- ❌ Campanhas recorrentes/agendadas
- ❌ Auto-matrícula em treinamentos
- ❌ Notificações automáticas

#### 10. SEGURANÇA AVANÇADA (🟢 MÉDIA)
- ❌ 2FA para usuários
- ❌ Rate limiting
- ❌ IP whitelisting
- ❌ Detecção de anomalias

---

## 📋 ANÁLISE DETALHADA POR MÓDULO

### 1. 🔐 RBAC GRANULAR - SISTEMA DE PERMISSÕES

#### Status Atual:
- ✅ Roles básicos existem (superadmin, tenant_admin, etc.)
- ✅ Guardian instalado (django-guardian)
- ❌ Permissões granulares não implementadas
- ❌ Sem UI para gerenciar permissões

#### O que está no DB:
```python
# core/models.py - User tem role, mas sem permissões granulares
role = models.CharField(max_length=20, choices=ROLE_CHOICES)
```

#### O que FALTA no Backend:

**Models necessários:**
```python
# core/models.py - ADICIONAR

class Permission(models.Model):
    """Permissão granular do sistema"""
    code = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=200)
    description = models.TextField()
    module = models.CharField(max_length=50)  # campaigns, users, etc
    resource = models.CharField(max_length=50)  # campaign, user, etc
    action = models.CharField(max_length=50)  # create, read, update, delete
    
class Role(models.Model):
    """Papéis customizáveis"""
    name = models.CharField(max_length=100)
    description = models.TextField()
    tenant = models.ForeignKey(Tenant, null=True)  # null = global role
    permissions = models.ManyToManyField(Permission)
    is_system_role = models.BooleanField(default=False)

class UserPermission(models.Model):
    """Permissões específicas de usuário"""
    user = models.ForeignKey(User)
    permission = models.ForeignKey(Permission)
    tenant = models.ForeignKey(Tenant, null=True)
    resource_id = models.CharField(max_length=100, null=True)  # Permissão em recurso específico
```

**Decorators necessários:**
```python
# core/permissions.py - CRIAR

from functools import wraps
from rest_framework.exceptions import PermissionDenied

def require_permission(permission_code):
    def decorator(view_func):
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            if not request.user.has_permission(permission_code):
                raise PermissionDenied("You don't have permission to perform this action")
            return view_func(request, *args, **kwargs)
        return wrapper
    return decorator

def require_any_permission(*permission_codes):
    # Check if user has ANY of the permissions
    pass

def require_all_permissions(*permission_codes):
    # Check if user has ALL of the permissions
    pass
```

**Permissões do sistema:**
```python
PERMISSIONS = {
    # Campanhas
    'campaigns.create': 'Criar campanhas',
    'campaigns.read': 'Visualizar campanhas',
    'campaigns.update': 'Editar campanhas',
    'campaigns.delete': 'Deletar campanhas',
    'campaigns.start': 'Iniciar campanhas',
    'campaigns.pause': 'Pausar campanhas',
    'campaigns.view_results': 'Ver resultados',
    
    # Alvos
    'targets.create': 'Criar alvos',
    'targets.import': 'Importar alvos',
    'targets.export': 'Exportar alvos',
    'targets.delete': 'Deletar alvos',
    
    # Templates
    'templates.create': 'Criar templates',
    'templates.read': 'Visualizar templates',
    'templates.update': 'Editar templates',
    'templates.delete': 'Deletar templates',
    
    # Usuários
    'users.create': 'Criar usuários',
    'users.read': 'Visualizar usuários',
    'users.update': 'Editar usuários',
    'users.delete': 'Deletar usuários',
    'users.impersonate': 'Personificar usuários',
    
    # Clientes (Tenants)
    'tenants.create': 'Criar clientes',
    'tenants.read': 'Visualizar clientes',
    'tenants.update': 'Editar clientes',
    'tenants.delete': 'Deletar clientes',
    'tenants.configure': 'Configurar integrações',
    
    # Treinamentos
    'trainings.create': 'Criar treinamentos',
    'trainings.assign': 'Atribuir treinamentos',
    'trainings.view_results': 'Ver resultados',
    
    # Relatórios
    'reports.view': 'Visualizar relatórios',
    'reports.export': 'Exportar relatórios',
    'reports.global': 'Ver relatórios globais',
    
    # Sistema
    'system.audit_logs': 'Ver logs de auditoria',
    'system.settings': 'Configurações do sistema',
}
```

#### O que FALTA no Frontend:

**Componentes necessários:**
- `PermissionsManager.tsx` - Gerenciador de permissões
- `RoleEditor.tsx` - Editor de papéis
- `PermissionSelector.tsx` - Seletor de permissões
- `usePermissions` hook - Verificar permissões no frontend

**Páginas necessárias:**
- `/system/roles` - Gerenciamento de papéis
- `/system/permissions` - Visualização de permissões
- `/users/[id]/permissions` - Permissões do usuário

---

### 2. 🌍 MULTI-IDIOMA (i18n)

#### Status Atual:
- ✅ Backend: USE_I18N = True configurado
- ✅ Backend: gettext_lazy importado em alguns models
- ❌ Sem arquivos de tradução (.po)
- ❌ Frontend sem i18n
- ❌ Sem detecção de idioma do browser

#### O que FALTA no Backend:

**Settings:**
```python
# settings.py - ATUALIZAR

LANGUAGE_CODE = 'pt-br'
LANGUAGES = [
    ('pt-br', 'Português (Brasil)'),
    ('en', 'English'),
    ('es', 'Español'),
]

LOCALE_PATHS = [
    os.path.join(BASE_DIR, 'locale'),
]

MIDDLEWARE = [
    ...
    'django.middleware.locale.LocaleMiddleware',  # ADICIONAR
    ...
]
```

**Comandos necessários:**
```bash
# Criar arquivos de tradução
python manage.py makemessages -l pt_BR
python manage.py makemessages -l en
python manage.py makemessages -l es

# Compilar traduções
python manage.py compilemessages
```

**Estrutura de pastas:**
```
backend/
  locale/
    pt_BR/
      LC_MESSAGES/
        django.po
        django.mo
    en/
      LC_MESSAGES/
        django.po
        django.mo
    es/
      LC_MESSAGES/
        django.po
        django.mo
```

#### O que FALTA no Frontend:

**Pacotes necessários:**
```bash
npm install react-i18next i18next i18next-browser-languagedetector i18next-http-backend
```

**Estrutura de arquivos:**
```
src/
  i18n/
    config.ts
    locales/
      pt-BR/
        common.json
        campaigns.json
        templates.json
        users.json
      en/
        common.json
        campaigns.json
        templates.json
        users.json
      es/
        common.json
        campaigns.json
        templates.json
        users.json
```

**Componentes necessários:**
```tsx
// LanguageSelector.tsx - CRIAR
import { useTranslation } from 'react-i18next';

export function LanguageSelector() {
  const { i18n } = useTranslation();
  
  return (
    <Select value={i18n.language} onValueChange={i18n.changeLanguage}>
      <SelectItem value="pt-BR">🇧🇷 Português</SelectItem>
      <SelectItem value="en">🇺🇸 English</SelectItem>
      <SelectItem value="es">🇪🇸 Español</SelectItem>
    </Select>
  );
}
```

**Exemplo de uso:**
```tsx
// Antes
<h1>Nova Campanha</h1>

// Depois
const { t } = useTranslation('campaigns');
<h1>{t('newCampaign')}</h1>
```

---

### 3. 📥 IMPORTAÇÃO DE ALVOS

#### Status Atual:
- ❌ Sem models de importação
- ❌ Sem integração com Microsoft/Google
- ❌ Sem parser de CSV/Excel
- ❌ Sem UI de importação

#### O que FALTA no Backend:

**Models necessários:**
```python
# campaigns/models.py - ADICIONAR

class Target(models.Model):
    """Alvo individual"""
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    email = models.EmailField()
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    department = models.CharField(max_length=100, blank=True)
    position = models.CharField(max_length=100, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    cpf = models.CharField(max_length=14, blank=True)
    employee_id = models.CharField(max_length=50, blank=True)
    
    # Dados customizados
    custom_fields = models.JSONField(default=dict)
    
    # Origem
    source = models.CharField(max_length=50)  # manual, azure_ad, google, csv
    source_id = models.CharField(max_length=200, blank=True)  # ID externo
    
    # Status
    status = models.CharField(max_length=20, default='active')
    opted_out = models.BooleanField(default=False)
    bounced = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['tenant', 'email']


class TargetGroup(models.Model):
    """Grupo de alvos"""
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    targets = models.ManyToManyField(Target)
    
    # Sincronização automática
    sync_source = models.CharField(max_length=50, blank=True)  # azure_ad, google
    sync_enabled = models.BooleanField(default=False)
    last_sync_at = models.DateTimeField(null=True, blank=True)
    sync_config = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)


class TargetImport(models.Model):
    """Histórico de importações"""
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE)
    source = models.CharField(max_length=50)
    file = models.FileField(upload_to='imports/', null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    
    # Estatísticas
    total_records = models.IntegerField(default=0)
    imported_count = models.IntegerField(default=0)
    updated_count = models.IntegerField(default=0)
    failed_count = models.IntegerField(default=0)
    errors = models.JSONField(default=list)
    
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
```

**Views necessárias:**
```python
# campaigns/views.py - ADICIONAR

class TargetViewSet(viewsets.ModelViewSet):
    queryset = Target.objects.all()
    serializer_class = TargetSerializer
    
    @action(detail=False, methods=['post'])
    def import_csv(self, request):
        """Importar alvos via CSV"""
        file = request.FILES.get('file')
        # Processar CSV
        pass
    
    @action(detail=False, methods=['post'])
    def import_azure_ad(self, request):
        """Importar do Azure AD"""
        # Chamar Microsoft Graph API
        pass
    
    @action(detail=False, methods=['post'])
    def import_google(self, request):
        """Importar do Google Workspace"""
        # Chamar Google Directory API
        pass

class TargetGroupViewSet(viewsets.ModelViewSet):
    queryset = TargetGroup.objects.all()
    serializer_class = TargetGroupSerializer
    
    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """Sincronizar grupo com fonte externa"""
        group = self.get_object()
        # Executar sincronização
        pass
```

**Integrações necessárias:**
```python
# integrations/microsoft.py - CRIAR
from msgraph.core import GraphClient
from azure.identity import ClientSecretCredential

class MicrosoftGraphIntegration:
    def __init__(self, tenant_id, client_id, client_secret):
        self.credential = ClientSecretCredential(tenant_id, client_id, client_secret)
        self.client = GraphClient(credential=self.credential)
    
    def get_users(self):
        """Listar usuários do Azure AD"""
        result = self.client.get('/users')
        return result.json()['value']
    
    def get_groups(self):
        """Listar grupos do Azure AD"""
        result = self.client.get('/groups')
        return result.json()['value']

# integrations/google.py - CRIAR
from googleapiclient.discovery import build
from google.oauth2 import service_account

class GoogleWorkspaceIntegration:
    def __init__(self, credentials_file, domain):
        self.credentials = service_account.Credentials.from_service_account_file(
            credentials_file,
            scopes=['https://www.googleapis.com/auth/admin.directory.user.readonly']
        )
        self.service = build('admin', 'directory_v1', credentials=self.credentials)
        self.domain = domain
    
    def get_users(self):
        """Listar usuários do Google Workspace"""
        result = self.service.users().list(domain=self.domain).execute()
        return result.get('users', [])
```

**Pacotes necessários (adicionar ao requirements.txt):**
```txt
# Integrações Microsoft
msgraph-core==1.0.0
azure-identity==1.15.0
msal==1.26.0

# Integrações Google
google-api-python-client==2.111.0
google-auth==2.26.2
google-auth-oauthlib==1.2.0
google-auth-httplib2==0.2.0

# CSV/Excel
pandas==2.1.4
openpyxl==3.1.2
xlrd==2.0.1
```

#### O que FALTA no Frontend:

**Componentes necessários:**
```tsx
// ImportTargetsDialog.tsx - CRIAR
interface ImportTargetsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImportTargetsDialog({ open, onOpenChange }: ImportTargetsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <Tabs>
        <TabsList>
          <TabsTrigger value="csv">CSV/Excel</TabsTrigger>
          <TabsTrigger value="microsoft">Microsoft 365</TabsTrigger>
          <TabsTrigger value="google">Google Workspace</TabsTrigger>
        </TabsList>
        
        <TabsContent value="csv">
          {/* Upload de arquivo CSV */}
          <FileUploader />
          <CsvPreview />
          <FieldMapper />
        </TabsContent>
        
        <TabsContent value="microsoft">
          {/* Integração Microsoft */}
          <MicrosoftConnect />
          <GroupSelector />
        </TabsContent>
        
        <TabsContent value="google">
          {/* Integração Google */}
          <GoogleConnect />
          <OrgUnitSelector />
        </TabsContent>
      </Tabs>
    </Dialog>
  );
}
```

**Página necessária:**
- `/targets` - Página de gerenciamento de alvos (CRIAR)

---

### 4. 🎨 LANDING PAGES E CAPTURA

#### Status Atual:
- ✅ Frontend: HtmlEditor, DataCaptureConfig criados
- ✅ Models: EmailTemplate tem landing_page_html
- ❌ Sem model CapturedData
- ❌ Sem engine de renderização
- ❌ Sem sistema de captura

#### O que FALTA no Backend:

**Models necessários:**
```python
# campaigns/models.py - ADICIONAR

class LandingPage(models.Model):
    """Landing page de captura"""
    template = models.OneToOneField(EmailTemplate, on_delete=models.CASCADE)
    html_content = models.TextField()
    capture_fields = models.JSONField(default=list)  # ['nome', 'email', 'senha']
    success_redirect_url = models.URLField(blank=True)
    
    # Anexos disponíveis para download
    attachments = models.ManyToManyField('LandingPageAttachment')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

class LandingPageAttachment(models.Model):
    """Anexo disponível na landing page"""
    name = models.CharField(max_length=255)
    file = models.FileField(upload_to='landing_attachments/')
    mimetype = models.CharField(max_length=100)
    size = models.IntegerField()
    download_count = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)

class CapturedData(models.Model):
    """Dados capturados em landing pages"""
    campaign = models.ForeignKey(Campaign, on_delete=models.CASCADE)
    target = models.ForeignKey(Target, on_delete=models.SET_NULL, null=True)
    target_email = models.EmailField()
    
    # Dados capturados (CRIPTOGRAFADOS!)
    captured_data = models.BinaryField()  # JSON criptografado
    
    # Contexto
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    referer = models.URLField(blank=True)
    
    # Metadados
    fields_captured = models.JSONField(default=list)  # Lista de campos enviados
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'captured_data'
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['campaign', '-timestamp']),
            models.Index(fields=['target_email']),
        ]
    
    def set_data(self, data_dict):
        """Criptografar e armazenar dados"""
        from cryptography.fernet import Fernet
        import json
        
        key = settings.ENCRYPTION_KEY
        f = Fernet(key)
        json_data = json.dumps(data_dict)
        self.captured_data = f.encrypt(json_data.encode())
    
    def get_data(self):
        """Descriptografar e retornar dados"""
        from cryptography.fernet import Fernet
        import json
        
        key = settings.ENCRYPTION_KEY
        f = Fernet(key)
        decrypted = f.decrypt(self.captured_data)
        return json.loads(decrypted.decode())
```

**Views necessárias:**
```python
# campaigns/views.py - ADICIONAR

@api_view(['POST'])
@permission_classes([AllowAny])
def capture_data(request, tracking_id):
    """Endpoint para capturar dados da landing page"""
    
    # Validar tracking_id
    try:
        event = CampaignEvent.objects.get(tracking_id=tracking_id)
    except CampaignEvent.DoesNotExist:
        return Response({'error': 'Invalid tracking ID'}, status=404)
    
    # Capturar dados
    captured = CapturedData.objects.create(
        campaign=event.campaign,
        target_email=event.target_email,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        referer=request.META.get('HTTP_REFERER', ''),
        fields_captured=list(request.data.keys())
    )
    
    # Criptografar e salvar
    captured.set_data(request.data)
    captured.save()
    
    # Registrar evento
    CampaignEvent.objects.create(
        campaign=event.campaign,
        event_type='submitted',
        target_email=event.target_email,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', ''),
        details={'fields': list(request.data.keys())}
    )
    
    # Atualizar métricas
    event.campaign.credentials_submitted += 1
    event.campaign.save()
    
    return Response({'success': True})

@api_view(['GET'])
@permission_classes([AllowAny])
def render_landing_page(request, tracking_id):
    """Renderizar landing page com variáveis substituídas"""
    
    try:
        event = CampaignEvent.objects.get(tracking_id=tracking_id)
    except CampaignEvent.DoesNotExist:
        return HttpResponse('Invalid link', status=404)
    
    # Buscar target
    target = Target.objects.filter(email=event.target_email).first()
    
    # Buscar landing page
    landing_page = event.campaign.template.landingpage
    
    # Substituir variáveis
    html = replace_variables(landing_page.html_content, target, event.campaign)
    
    # Registrar abertura
    CampaignEvent.objects.create(
        campaign=event.campaign,
        event_type='clicked',
        target_email=event.target_email,
        ip_address=get_client_ip(request),
        user_agent=request.META.get('HTTP_USER_AGENT', '')
    )
    
    return HttpResponse(html)
```

**Utils necessários:**
```python
# campaigns/utils.py - CRIAR

def replace_variables(template_html, target, campaign):
    """Substituir variáveis no template"""
    
    variables = {
        'nome': target.first_name + ' ' + target.last_name if target else '',
        'primeiro_nome': target.first_name if target else '',
        'sobrenome': target.last_name if target else '',
        'email': target.email if target else '',
        'celular': target.phone if target else '',
        'cpf': target.cpf if target else '',
        'departamento': target.department if target else '',
        'cargo': target.position if target else '',
        'empresa': campaign.tenant.name,
        'empresa_cnpj': campaign.tenant.settings.get('cnpj', ''),
        'data_atual': datetime.now().strftime('%d/%m/%Y'),
        'hora_atual': datetime.now().strftime('%H:%M'),
        'link_phishing': f'https://phishing.matreiro.com/landing/{event.tracking_id}',
    }
    
    html = template_html
    for key, value in variables.items():
        html = html.replace(f'{{{{{key}}}}}', value)
    
    return html
```

**Pacotes necessários:**
```txt
# Adicionar ao requirements.txt
cryptography==41.0.7
```

---

### 5. 📊 RELATÓRIOS AVANÇADOS

#### Status Atual:
- ✅ Frontend: Página de Reports básica
- ❌ Sem exportação PDF/Excel
- ❌ Sem dashboards customizáveis

#### O que FALTA:

**Pacotes necessários:**
```txt
# Adicionar ao requirements.txt
reportlab==4.0.9  # PDF
xlsxwriter==3.1.9  # Excel
matplotlib==3.8.2  # Gráficos
seaborn==0.13.1  # Visualizações
```

**Views necessárias:**
```python
# campaigns/views.py - ADICIONAR

@action(detail=True, methods=['get'])
def export_pdf(self, request, pk=None):
    """Exportar relatório em PDF"""
    campaign = self.get_object()
    
    # Gerar PDF
    from reportlab.pdfgen import canvas
    from reportlab.lib.pagesizes import letter
    
    buffer = BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    
    # Adicionar conteúdo
    p.drawString(100, 750, f"Relatório: {campaign.name}")
    # ... mais conteúdo
    
    p.showPage()
    p.save()
    
    buffer.seek(0)
    return HttpResponse(buffer, content_type='application/pdf')

@action(detail=True, methods=['get'])
def export_excel(self, request, pk=None):
    """Exportar relatório em Excel"""
    campaign = self.get_object()
    
    # Gerar Excel
    import xlsxwriter
    
    buffer = BytesIO()
    workbook = xlsxwriter.Workbook(buffer)
    worksheet = workbook.add_worksheet()
    
    # Adicionar dados
    worksheet.write('A1', 'Campaign')
    worksheet.write('B1', campaign.name)
    # ... mais dados
    
    workbook.close()
    buffer.seek(0)
    
    return HttpResponse(
        buffer,
        content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
```

---

## 📦 ESTRUTURA DE BANCO DE DADOS

### ✅ Models que EXISTEM e estão COMPLETOS:
1. ✅ **User** - /backend/core/models.py
2. ✅ **AuditLog** - /backend/core/models.py
3. ✅ **Tenant** - /backend/tenants/models.py
4. ✅ **Campaign** - /backend/campaigns/models.py
5. ✅ **CampaignEvent** - /backend/campaigns/models.py
6. ✅ **EmailTemplate** - /backend/templates/models.py (básico)
7. ✅ **Training** - /backend/trainings/models.py
8. ✅ **TrainingEnrollment** - /backend/trainings/models.py

### ❌ Models que FALTAM:
1. ❌ **Permission** - Sistema de permissões
2. ❌ **Role** - Papéis customizáveis
3. ❌ **UserPermission** - Permissões de usuário
4. ❌ **Target** - Alvos individuais
5. ❌ **TargetGroup** - Grupos de alvos
6. ❌ **TargetImport** - Histórico de importações
7. ❌ **LandingPage** - Landing pages de captura
8. ❌ **LandingPageAttachment** - Anexos da landing
9. ❌ **CapturedData** - Dados capturados (CRÍTICO)
10. ❌ **TemplateVariable** - Variáveis de templates
11. ❌ **TemplateAttachment** - Anexos de templates
12. ❌ **TrainingQuestion** - Questões de treinamento
13. ❌ **TrainingAnswer** - Respostas de provas
14. ❌ **IntegrationConfig** - Configurações de integrações
15. ❌ **Webhook** - Webhooks para integrações

---

## 🎨 FRONTEND - ANÁLISE DE PÁGINAS

### ✅ Páginas IMPLEMENTADAS:
1. ✅ `/login` - Login.tsx
2. ✅ `/dashboard` - Dashboard.tsx
3. ✅ `/campaigns` - Campaigns.tsx
4. ✅ `/templates` - Templates.tsx
5. ✅ `/tenants` - Tenants.tsx
6. ✅ `/targets` - Targets.tsx
7. ✅ `/trainings` - Trainings.tsx
8. ✅ `/reports` - Reports.tsx
9. ✅ `/system/users` - SystemUsers.tsx
10. ✅ `/debug` - Debug.tsx

### ❌ Páginas que FALTAM:
1. ❌ `/system/roles` - Gerenciamento de papéis
2. ❌ `/system/permissions` - Gerenciamento de permissões
3. ❌ `/system/integrations` - Configuração de integrações
4. ❌ `/system/settings` - Configurações globais
5. ❌ `/targets/import` - Importação de alvos
6. ❌ `/landing-pages` - Gerenciamento de landing pages
7. ❌ `/webhooks` - Gerenciamento de webhooks
8. ❌ `/campaigns/[id]/results` - Resultados detalhados
9. ❌ `/campaigns/[id]/captured-data` - Dados capturados
10. ❌ `/profile` - Perfil do usuário

### ✅ Componentes IMPLEMENTADOS:
- ✅ Layout, ProtectedRoute, LoadingScreen
- ✅ Todos os dialogs (New/Edit/View)
- ✅ HtmlEditor, VariableSelector
- ✅ AttachmentManager, DataCaptureConfig
- ✅ UI components (shadcn/ui)

### ❌ Componentes que FALTAM:
- ❌ PermissionsManager
- ❌ RoleEditor
- ❌ ImportTargetsDialog
- ❌ IntegrationConfigDialog
- ❌ CapturedDataViewer
- ❌ LanguageSelector
- ❌ WebhookManager

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO PRIORITÁRIA

### 🔴 SPRINT 1 - CRÍTICO (2 semanas)
- [ ] 1. Implementar sistema de RBAC granular
  - [ ] Models: Permission, Role, UserPermission
  - [ ] Decorators de permissão
  - [ ] Middleware de verificação
  - [ ] UI de gerenciamento

- [ ] 2. Implementar Multi-idioma
  - [ ] Configurar Django i18n
  - [ ] Criar arquivos de tradução (PT, ES, EN)
  - [ ] Instalar react-i18next no frontend
  - [ ] Traduzir todas as strings
  - [ ] Detector de idioma do browser

- [ ] 3. Importação de Alvos
  - [ ] Models: Target, TargetGroup, TargetImport
  - [ ] Parser de CSV/Excel
  - [ ] UI de importação
  - [ ] Preview e validação

### 🟡 SPRINT 2 - ALTA (2 semanas)
- [ ] 4. Sistema de Captura de Dados
  - [ ] Models: LandingPage, CapturedData
  - [ ] Engine de substituição de variáveis
  - [ ] Criptografia de dados
  - [ ] Endpoints de captura

- [ ] 5. Integrações Microsoft/Google
  - [ ] Microsoft Graph API
  - [ ] Google Workspace API
  - [ ] Sincronização automática
  - [ ] UI de configuração

- [ ] 6. Templates Expandidos
  - [ ] Model: TemplateAttachment
  - [ ] Sistema de anexos
  - [ ] Biblioteca de templates

### 🟢 SPRINT 3 - MÉDIA (2 semanas)
- [ ] 7. Relatórios Avançados
  - [ ] Exportação PDF/Excel
  - [ ] Dashboards customizáveis
  - [ ] Gráficos avançados

- [ ] 8. Automações
  - [ ] Phishing automático
  - [ ] Campanhas recorrentes
  - [ ] Celery tasks

- [ ] 9. Treinamentos IA
  - [ ] Detecção de fraude
  - [ ] Certificados
  - [ ] Analytics

---

## 🚀 COMANDOS PARA COMEÇAR

### Backend:
```bash
# Criar models faltantes
python manage.py makemigrations
python manage.py migrate

# Popular permissões
python manage.py shell
>>> from core.models import Permission
>>> # Criar permissões do sistema
>>> Permission.objects.create(code='campaigns.create', name='Criar Campanhas', ...)

# Criar arquivos de tradução
python manage.py makemessages -l pt_BR -l en -l es
python manage.py compilemessages
```

### Frontend:
```bash
# Instalar pacotes de i18n
npm install react-i18next i18next i18next-browser-languagedetector

# Criar estrutura de traduções
mkdir -p src/i18n/locales/{pt-BR,en,es}
```

---

## 📊 ESTATÍSTICAS DO PROJETO

### Backend:
- **Models implementados:** 8 / 23 (35%)
- **Views implementadas:** 6 / 15 módulos (40%)
- **Integrações:** 0 / 2 (0%)
- **Testes:** 0 / 100 (0%)

### Frontend:
- **Páginas:** 10 / 20 (50%)
- **Componentes principais:** 15 / 25 (60%)
- **Traduções:** 0% (nenhuma string traduzida)
- **Testes:** 0%

### Funcionalidades:
- **RBAC:** 10% (apenas roles básicos)
- **Multi-idioma:** 5% (apenas estrutura)
- **Importação:** 0%
- **Landing Pages:** 30% (apenas frontend)
- **Relatórios:** 40%
- **Integrações:** 0%

---

## 💰 ESTIMATIVA DE TEMPO

### Total estimado: **12-16 semanas** para completar todas as features

- RBAC Granular: 2 semanas
- Multi-idioma: 1-2 semanas
- Importação de Alvos: 2-3 semanas
- Landing Pages + Captura: 2 semanas
- Integrações (MS/Google): 3-4 semanas
- Relatórios Avançados: 1-2 semanas
- Treinamentos IA: 2-3 semanas
- Automações: 1-2 semanas
- Testes e QA: 2 semanas

---

**Próximo passo recomendado:** Implementar RBAC + Multi-idioma + Importação (Sprint 1)
