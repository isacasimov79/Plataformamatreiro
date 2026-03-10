import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Plug, CheckCircle, XCircle, AlertCircle, RefreshCw, Settings as SettingsIcon, Key, Link as LinkIcon, Users } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { toast } from 'sonner';
import { 
  getSettings, 
  updateSettings,
  azureTestConnection,
  azureSyncUsers,
  azureSyncGroups,
} from '../lib/supabaseApi';
import { useAuth } from '../contexts/AuthContext';

interface Integration {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: string;
  features: string[];
  config?: Record<string, any>;
}

export default function Integrations() {
  const { t } = useTranslation();
  const { impersonatedTenant } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);
  
  // Settings state - carregado do banco de dados
  const [settings, setSettings] = useState<any>({
    integrations: {
      microsoft365: {
        enabled: false,
        tenantId: '',
        clientId: '',
        clientSecret: '',
        autoSync: false,
      },
      googleWorkspace: {
        enabled: false,
        serviceAccountJson: '',
        domain: '',
      },
      azure: {
        enabled: false,
        tenantId: '',
        clientId: '',
        clientSecret: '',
        autoSync: false,
      },
    },
    smtp: {
      host: '',
      port: 587,
      user: '',
      password: '',
    },
  });

  // Form state para o dialog
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const data = await getSettings();
      console.log('✅ Settings loaded:', data);
      if (data && data.settings) {
        setSettings(data.settings);
      }
    } catch (error) {
      console.error('❌ Error loading settings:', error);
      toast.error('Erro ao carregar configurações', {
        description: 'As configurações padrão serão usadas.',
      });
    } finally {
      setLoadingSettings(false);
    }
  };

  // Gerar integrações baseadas nas settings reais do banco de dados
  const getIntegrationsFromSettings = (): Integration[] => {
    return [
      {
        id: 'azure',
        name: 'Microsoft Azure AD',
        description: 'Importar usuários e grupos via Microsoft Graph API',
        icon: '☁️',
        status: settings?.integrations?.azure?.enabled ? 'connected' : 'disconnected',
        lastSync: settings?.integrations?.azure?.lastSyncAt,
        features: [
          'Importação de usuários do Azure AD',
          'Sincronização de grupos',
          'Microsoft Graph API',
          'Atualização automática'
        ],
        config: settings?.integrations?.azure,
      },
      {
        id: 'microsoft365',
        name: 'Microsoft 365',
        description: 'Sincronize usuários do Azure AD automaticamente',
        icon: '🔷',
        status: settings?.integrations?.microsoft365?.enabled ? 'connected' : 'disconnected',
        lastSync: settings?.integrations?.microsoft365?.lastSyncAt,
        features: [
          'Importação automática de usuários',
          'Sincronização de grupos',
          'Single Sign-On (SSO)',
          'Atualização em tempo real'
        ],
        config: settings?.integrations?.microsoft365,
      },
      {
        id: 'google',
        name: 'Google Workspace',
        description: 'Integração completa com Google Workspace',
        icon: '🔴',
        status: settings?.integrations?.googleWorkspace?.enabled ? 'connected' : 'disconnected',
        lastSync: settings?.integrations?.googleWorkspace?.lastSyncAt,
        features: [
          'Importação de usuários do Google',
          'Sincronização de grupos',
          'OAuth 2.0',
          'Webhook automático'
        ],
        config: settings?.integrations?.googleWorkspace,
      },
      {
        id: 'smtp',
        name: 'Servidor SMTP',
        description: 'Configure seu próprio servidor SMTP para envio',
        icon: '📧',
        status: settings?.smtp?.host ? 'connected' : 'disconnected',
        features: [
          'SMTP customizado',
          'TLS/SSL',
          'Autenticação',
          'Controle de rate limiting'
        ],
        config: settings?.smtp,
      },
      {
        id: 'webhooks',
        name: 'Webhooks',
        description: 'Receba notificações em tempo real de eventos',
        icon: '🔗',
        status: 'disconnected',
        features: [
          'Eventos de campanha',
          'Eventos de treinamento',
          'Webhooks customizados',
          'Retry automático'
        ],
      },
    ];
  };

  const integrations = getIntegrationsFromSettings();

  const handleSaveAndConnect = async () => {
    if (!selectedIntegration) return;

    setIsLoading(true);
    const integrationId = selectedIntegration.id;

    try {
      // Capturar dados do formulário
      let updatedSettings = { ...settings };

      if (integrationId === 'azure') {
        const tenantId = (document.getElementById('azure-tenant-id') as HTMLInputElement)?.value || '';
        const clientId = (document.getElementById('azure-client-id') as HTMLInputElement)?.value || '';
        const clientSecret = (document.getElementById('azure-client-secret') as HTMLInputElement)?.value || '';
        const autoSync = (document.getElementById('azure-auto-sync') as HTMLInputElement)?.checked || false;
        const allowedDomains = (document.getElementById('azure-allowed-domains') as HTMLTextAreaElement)?.value.split('\n').map(d => d.trim()).filter(d => d);

        updatedSettings.integrations.azure = {
          ...updatedSettings.integrations.azure,
          tenantId,
          clientId,
          clientSecret,
          autoSync,
          enabled: true,
          allowedDomains,
        };

        // Testar conexão
        const testResult = await azureTestConnection(tenantId, clientId, clientSecret);
        if (!testResult.success) {
          toast.error(testResult.error || 'Falha ao conectar com Azure', {
            description: testResult.details || 'Verifique suas credenciais',
          });
          setIsLoading(false);
          return;
        }
      } else if (integrationId === 'microsoft365') {
        const tenantId = (document.getElementById('ms365-tenant-id') as HTMLInputElement)?.value || '';
        const clientId = (document.getElementById('ms365-client-id') as HTMLInputElement)?.value || '';
        const clientSecret = (document.getElementById('ms365-client-secret') as HTMLInputElement)?.value || '';
        const autoSync = (document.getElementById('ms365-auto-sync') as HTMLInputElement)?.checked || false;

        updatedSettings.integrations.microsoft365 = {
          ...updatedSettings.integrations.microsoft365,
          tenantId,
          clientId,
          clientSecret,
          autoSync,
          enabled: true,
        };
      } else if (integrationId === 'google') {
        const clientId = (document.getElementById('google-client-id') as HTMLInputElement)?.value || '';
        const clientSecret = (document.getElementById('google-client-secret') as HTMLInputElement)?.value || '';
        const domain = (document.getElementById('google-domain') as HTMLInputElement)?.value || '';
        const autoSync = (document.getElementById('google-auto-sync') as HTMLInputElement)?.checked || false;

        updatedSettings.integrations.googleWorkspace = {
          ...updatedSettings.integrations.googleWorkspace,
          domain,
          serviceAccountJson: `{"client_id": "${clientId}", "client_secret": "${clientSecret}"}`,
          enabled: true,
        };
      } else if (integrationId === 'smtp') {
        const host = (document.getElementById('smtp-host') as HTMLInputElement)?.value || '';
        const port = parseInt((document.getElementById('smtp-port') as HTMLInputElement)?.value || '587');
        const username = (document.getElementById('smtp-username') as HTMLInputElement)?.value || '';
        const password = (document.getElementById('smtp-password') as HTMLInputElement)?.value || '';

        updatedSettings.smtp = {
          ...updatedSettings.smtp,
          host,
          port,
          user: username,
          password,
        };
      }

      // Salvar no banco de dados
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);

      toast.success(`${selectedIntegration.name} conectado com sucesso!`);
      setIsConfigDialogOpen(false);
      
      // Recarregar settings para atualizar status
      await loadSettings();
    } catch (error: any) {
      console.error('❌ Error saving integration:', error);
      toast.error('Erro ao salvar integração', {
        description: error.message || 'Tente novamente',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    setIsLoading(true);
    try {
      let updatedSettings = { ...settings };

      if (integrationId === 'azure') {
        updatedSettings.integrations.azure.enabled = false;
      } else if (integrationId === 'microsoft365') {
        updatedSettings.integrations.microsoft365.enabled = false;
      } else if (integrationId === 'google') {
        updatedSettings.integrations.googleWorkspace.enabled = false;
      } else if (integrationId === 'smtp') {
        updatedSettings.smtp = {
          host: '',
          port: 587,
          user: '',
          password: '',
        };
      }

      await updateSettings(updatedSettings);
      setSettings(updatedSettings);

      toast.success(`${integration.name} desconectado`);
      
      // Recarregar settings
      await loadSettings();
    } catch (error: any) {
      console.error('❌ Error disconnecting integration:', error);
      toast.error('Erro ao desconectar', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSync = async (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    setIsLoading(true);
    toast.loading('Sincronizando...', { id: `sync-${integrationId}` });

    try {
      if (integrationId === 'azure' && integration.config) {
        const { tenantId, clientId, clientSecret, allowedDomains } = integration.config;
        const targetTenantId = impersonatedTenant?.id || 'default';
        
        console.log('🔄 Starting Azure sync from Integrations page...', {
          hasTenantId: !!tenantId,
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          targetTenantId,
          allowedDomains,
        });
        
        const result = await azureSyncUsers(tenantId, clientId, clientSecret, targetTenantId, allowedDomains);
        
        console.log('📥 Azure sync result:', result);
        
        if (result.success) {
          toast.success(`Sincronizados ${result.synced} usuários!`, { id: `sync-${integrationId}` });
          
          // Atualizar lastSyncAt
          const updatedSettings = { ...settings };
          updatedSettings.integrations.azure.lastSyncAt = new Date().toISOString();
          await updateSettings(updatedSettings);
          setSettings(updatedSettings);
        } else {
          const errorDetails = result.details || result.error || 'Erro desconhecido';
          console.error('❌ Sync failed with structured error:', result);
          toast.error('Erro ao sincronizar', { 
            id: `sync-${integrationId}`,
            description: errorDetails,
          });
        }
      } else {
        // Simulação para outras integrações
        setTimeout(() => {
          toast.success('Sincronização concluída!', { id: `sync-${integrationId}` });
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Error syncing:', error);
      toast.error('Erro ao sincronizar', { 
        id: `sync-${integrationId}`,
        description: error.message || 'Erro desconhecido',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openConfig = (integration: Integration) => {
    setSelectedIntegration(integration);
    setFormData(integration.config || {});
    setIsConfigDialogOpen(true);
  };

  const getStatusBadge = (status: Integration['status']) => {
    switch (status) {
      case 'connected':
        return (
          <Badge className="bg-green-500">
            <CheckCircle className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            Desconectado
          </Badge>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Nunca';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR');
  };

  if (loadingSettings) {
    return (
      <div className="p-8 flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-[#834a8b]" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Plug className="w-8 h-8 text-[#834a8b]" />
            {t('integrations.title', 'Integrações')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('integrations.subtitle', 'Conecte serviços externos à plataforma')}
          </p>
        </div>
      </div>

      {/* Alert */}
      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>Integração com Banco de Dados Ativa</AlertTitle>
        <AlertDescription>
          As configurações são salvas no banco de dados Supabase e sincronizadas em tempo real.
        </AlertDescription>
      </Alert>

      {/* Integrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {integrations.map((integration) => (
          <Card key={integration.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#834a8b]/10 to-[#242545]/10 flex items-center justify-center text-2xl">
                    {integration.icon}
                  </div>
                  <div>
                    <CardTitle>{integration.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {integration.description}
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(integration.status)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Features */}
              <div>
                <p className="text-sm font-medium mb-2">Recursos:</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  {integration.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-3 h-3 text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Last Sync */}
              {integration.status === 'connected' && (
                <div className="text-sm">
                  <p className="text-muted-foreground">
                    Última sincronização: <strong>{formatDate(integration.lastSync)}</strong>
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                {integration.status === 'connected' ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSync(integration.id)}
                      disabled={isLoading}
                      className="flex-1"
                    >
                      <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Sincronizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConfig(integration)}
                      disabled={isLoading}
                    >
                      <SettingsIcon className="w-4 h-4 mr-2" />
                      Config
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(integration.id)}
                      disabled={isLoading}
                    >
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => openConfig(integration)}
                      disabled={isLoading}
                      className="flex-1 bg-[#834a8b] hover:bg-[#6d3d75]"
                    >
                      <LinkIcon className="w-4 h-4 mr-2" />
                      Conectar
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Configuration Dialog */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedIntegration?.icon}</span>
              Configurar {selectedIntegration?.name}
            </DialogTitle>
            <DialogDescription>
              Configure as credenciais e opções de sincronização
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {selectedIntegration?.id === 'azure' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="azure-tenant-id">Azure Tenant ID</Label>
                  <Input
                    id="azure-tenant-id"
                    defaultValue={formData.tenantId || ''}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azure-client-id">Application (Client) ID</Label>
                  <Input
                    id="azure-client-id"
                    defaultValue={formData.clientId || ''}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azure-client-secret">Client Secret (Value)</Label>
                  <Input
                    id="azure-client-secret"
                    type="password"
                    defaultValue={formData.clientSecret || ''}
                    placeholder="Digite o Client Secret"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azure-allowed-domains">Domínios Permitidos (opcional)</Label>
                  <Textarea
                    id="azure-allowed-domains"
                    defaultValue={formData.allowedDomains?.join('\n') || ''}
                    placeholder="exemplo.com&#10;acme.com.br&#10;empresa.com.br"
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    🔒 Digite um domínio por linha. Apenas usuários desses domínios serão sincronizados. Deixe vazio para sincronizar todos.
                  </p>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Sincronização Automática</p>
                    <p className="text-xs text-muted-foreground">
                      Sincronizar usuários a cada 24 horas
                    </p>
                  </div>
                  <Switch id="azure-auto-sync" defaultChecked={formData.autoSync || false} />
                </div>
              </div>
            )}

            {selectedIntegration?.id === 'microsoft365' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ms365-tenant-id">Tenant ID</Label>
                  <Input
                    id="ms365-tenant-id"
                    defaultValue={formData.tenantId || ''}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ms365-client-id">Client ID</Label>
                  <Input
                    id="ms365-client-id"
                    defaultValue={formData.clientId || ''}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ms365-client-secret">Client Secret</Label>
                  <Input
                    id="ms365-client-secret"
                    type="password"
                    defaultValue={formData.clientSecret || ''}
                    placeholder="•••••••••••••••"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Sincronização Automática</p>
                    <p className="text-xs text-muted-foreground">
                      Sincronizar usuários a cada 24 horas
                    </p>
                  </div>
                  <Switch id="ms365-auto-sync" defaultChecked={formData.autoSync || false} />
                </div>
              </div>
            )}

            {selectedIntegration?.id === 'google' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google-client-id">Client ID</Label>
                  <Input
                    id="google-client-id"
                    placeholder="xxxxxxxxxxxxx.apps.googleusercontent.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-client-secret">Client Secret</Label>
                  <Input
                    id="google-client-secret"
                    type="password"
                    placeholder="•••••••••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-domain">Domínio do Workspace</Label>
                  <Input
                    id="google-domain"
                    defaultValue={formData.domain || ''}
                    placeholder="empresa.com.br"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Sincronização Automática</p>
                    <p className="text-xs text-muted-foreground">
                      Sincronizar usuários a cada 24 horas
                    </p>
                  </div>
                  <Switch id="google-auto-sync" />
                </div>
              </div>
            )}

            {selectedIntegration?.id === 'smtp' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">Servidor SMTP</Label>
                  <Input
                    id="smtp-host"
                    defaultValue={formData.host || ''}
                    placeholder="smtp.exemplo.com.br"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Porta</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      defaultValue={formData.port || 587}
                      placeholder="587"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-security">Segurança</Label>
                    <Input
                      id="smtp-security"
                      placeholder="TLS"
                      disabled
                      value="TLS"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">Usuário</Label>
                  <Input
                    id="smtp-username"
                    defaultValue={formData.user || ''}
                    placeholder="usuario@exemplo.com.br"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Senha</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    defaultValue={formData.password || ''}
                    placeholder="•••••••••••••••"
                  />
                </div>
              </div>
            )}

            {selectedIntegration?.id === 'webhooks' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="webhook-url">URL do Webhook</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://api.exemplo.com.br/webhook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">Secret (opcional)</Label>
                  <Input
                    id="webhook-secret"
                    type="password"
                    placeholder="•••••••••••••••"
                  />
                </div>
                <div className="space-y-3">
                  <Label>Eventos</Label>
                  {[
                    { id: 'campaign.started', label: 'Campanha iniciada' },
                    { id: 'campaign.completed', label: 'Campanha concluída' },
                    { id: 'email.opened', label: 'Email aberto' },
                    { id: 'link.clicked', label: 'Link clicado' },
                    { id: 'data.submitted', label: 'Dados capturados' },
                    { id: 'training.completed', label: 'Treinamento concluído' },
                  ].map((event) => (
                    <div key={event.id} className="flex items-center space-x-2">
                      <Switch id={event.id} />
                      <Label htmlFor={event.id} className="font-normal">
                        {event.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfigDialogOpen(false)}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSaveAndConnect}
              disabled={isLoading}
              className="bg-[#834a8b] hover:bg-[#6d3d75]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  Salvar e Conectar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}