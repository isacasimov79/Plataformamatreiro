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
} from '../lib/apiLocal';
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
      toast.error(t('integrations.errorLoading'), {
        description: t('integrations.errorLoadingDesc'),
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
        description: t('integrations.items.azure.desc'),
        icon: '☁️',
        status: settings?.integrations?.azure?.enabled ? 'connected' : 'disconnected',
        lastSync: settings?.integrations?.azure?.lastSyncAt,
        features: [
          t('integrations.items.azure.features.0'),
          t('integrations.items.azure.features.1'),
          t('integrations.items.azure.features.2'),
          t('integrations.items.azure.features.3')
        ],
        config: settings?.integrations?.azure,
      },
      {
        id: 'microsoft365',
        name: 'Microsoft 365',
        description: t('integrations.items.ms365.desc'),
        icon: '🔷',
        status: settings?.integrations?.microsoft365?.enabled ? 'connected' : 'disconnected',
        lastSync: settings?.integrations?.microsoft365?.lastSyncAt,
        features: [
          t('integrations.items.ms365.features.0'),
          t('integrations.items.ms365.features.1'),
          t('integrations.items.ms365.features.2'),
          t('integrations.items.ms365.features.3')
        ],
        config: settings?.integrations?.microsoft365,
      },
      {
        id: 'google',
        name: 'Google Workspace',
        description: t('integrations.items.google.desc'),
        icon: '🔴',
        status: settings?.integrations?.googleWorkspace?.enabled ? 'connected' : 'disconnected',
        lastSync: settings?.integrations?.googleWorkspace?.lastSyncAt,
        features: [
          t('integrations.items.google.features.0'),
          t('integrations.items.google.features.1'),
          t('integrations.items.google.features.2'),
          t('integrations.items.google.features.3')
        ],
        config: settings?.integrations?.googleWorkspace,
      },
      {
        id: 'smtp',
        name: t('integrations.items.smtp.name'),
        description: t('integrations.items.smtp.desc'),
        icon: '📧',
        status: settings?.smtp?.host ? 'connected' : 'disconnected',
        features: [
          t('integrations.items.smtp.features.0'),
          t('integrations.items.smtp.features.1'),
          t('integrations.items.smtp.features.2'),
          t('integrations.items.smtp.features.3')
        ],
        config: settings?.smtp,
      },
      {
        id: 'webhooks',
        name: 'Webhooks',
        description: t('integrations.items.webhooks.desc'),
        icon: '🔗',
        status: 'disconnected',
        features: [
          t('integrations.items.webhooks.features.0'),
          t('integrations.items.webhooks.features.1'),
          t('integrations.items.webhooks.features.2'),
          t('integrations.items.webhooks.features.3')
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
          toast.error(testResult.error || t('integrations.errors.azureConnect'), {
            description: testResult.details || t('integrations.errors.azureVerify'),
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

      toast.success(t('integrations.success.connected', { name: selectedIntegration.name }));
      setIsConfigDialogOpen(false);
      
      // Recarregar settings para atualizar status
      await loadSettings();
    } catch (error: any) {
      console.error('❌ Error saving integration:', error);
      toast.error(t('integrations.errors.save'), {
        description: error.message || t('integrations.errors.tryAgain'),
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

      toast.success(t('integrations.success.disconnected', { name: integration.name }));
      
      // Recarregar settings
      await loadSettings();
    } catch (error: any) {
      console.error('❌ Error disconnecting integration:', error);
      toast.error(t('integrations.errors.disconnect'), {
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
    toast.loading(t('integrations.syncing'), { id: `sync-${integrationId}` });

    try {
      if (integrationId === 'azure' && integration.config) {
        const { tenantId, clientId, clientSecret, allowedDomains } = integration.config;
        const targetTenantId = impersonatedTenant?.id || 'default';
        
        console.log('🔄 Starting Azure sync (users + groups)...', {
          hasTenantId: !!tenantId,
          hasClientId: !!clientId,
          hasClientSecret: !!clientSecret,
          targetTenantId,
          allowedDomains,
        });
        
        // Sync users
        const usersResult = await azureSyncUsers(tenantId, clientId, clientSecret, targetTenantId, allowedDomains);
        console.log('📥 Azure users sync result:', usersResult);
        
        // Sync groups
        let groupsResult: any = { success: false };
        try {
          groupsResult = await azureSyncGroups(tenantId, clientId, clientSecret, targetTenantId, allowedDomains);
          console.log('📥 Azure groups sync result:', groupsResult);
        } catch (groupErr) {
          console.error('⚠️ Group sync failed (non-critical):', groupErr);
        }
        
        if (usersResult.success) {
          const groupsMsg = groupsResult.success ? t('integrations.sync.groupsMsg', { count: groupsResult.synced || 0 }) : '';
          toast.success(t('integrations.sync.successMsg', { count: usersResult.synced, groupsUrl: groupsMsg }), { id: `sync-${integrationId}` });
          
          // Atualizar lastSyncAt
          const updatedSettings = { ...settings };
          updatedSettings.integrations.azure.lastSyncAt = new Date().toISOString();
          await updateSettings(updatedSettings);
          setSettings(updatedSettings);
        } else {
          const errorDetails = usersResult.details || usersResult.error || t('common.unknownError');
          console.error('❌ Sync failed with structured error:', usersResult);
          toast.error(t('integrations.sync.error'), { 
            id: `sync-${integrationId}`,
            description: errorDetails,
          });
        }
      } else {
        // Simulação para outras integrações
        setTimeout(() => {
          toast.success(t('integrations.sync.completed'), { id: `sync-${integrationId}` });
        }, 2000);
      }
    } catch (error: any) {
      console.error('❌ Error syncing:', error);
      toast.error(t('integrations.sync.error'), { 
        id: `sync-${integrationId}`,
        description: error.message || t('common.unknownError'),
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
            {t('integrations.status.connected')}
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="destructive">
            <XCircle className="w-3 h-3 mr-1" />
            {t('integrations.status.error')}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <XCircle className="w-3 h-3 mr-1" />
            {t('integrations.status.disconnected')}
          </Badge>
        );
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('common.never');
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
            {t('integrations.title')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('integrations.subtitle')}
          </p>
        </div>
      </div>

      <Alert>
        <AlertCircle className="w-4 h-4" />
        <AlertTitle>{t('integrations.alert.title')}</AlertTitle>
        <AlertDescription>
          {t('integrations.alert.desc')}
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
                <p className="text-sm font-medium mb-2">{t('integrations.card.features')}:</p>
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
                    {t('integrations.card.lastSync')}: <strong>{formatDate(integration.lastSync)}</strong>
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
                      {t('integrations.buttons.sync')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConfig(integration)}
                      disabled={isLoading}
                    >
                      <SettingsIcon className="w-4 h-4 mr-2" />
                      {t('integrations.buttons.config')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(integration.id)}
                      disabled={isLoading}
                    >
                      {t('integrations.buttons.disconnect')}
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
                      {t('integrations.buttons.connect')}
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
              {t('integrations.dialog.title', { name: selectedIntegration?.name })}
            </DialogTitle>
            <DialogDescription>
              {t('integrations.dialog.desc')}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {selectedIntegration?.id === 'azure' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="azure-tenant-id">{t('integrations.dialog.azure.tenantId')}</Label>
                  <Input
                    id="azure-tenant-id"
                    defaultValue={formData.tenantId || ''}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azure-client-id">{t('integrations.dialog.azure.clientId')}</Label>
                  <Input
                    id="azure-client-id"
                    defaultValue={formData.clientId || ''}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azure-client-secret">{t('integrations.dialog.azure.clientSecret')}</Label>
                  <Input
                    id="azure-client-secret"
                    type="password"
                    defaultValue={formData.clientSecret || ''}
                    placeholder={t('integrations.dialog.azure.clientSecretPlaceholder')}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="azure-allowed-domains">{t('integrations.dialog.azure.allowedDomains')}</Label>
                  <Textarea
                    id="azure-allowed-domains"
                    defaultValue={formData.allowedDomains?.join('\n') || ''}
                    placeholder="exemplo.com&#10;acme.com.br&#10;empresa.com.br"
                    rows={4}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    {t('integrations.dialog.azure.domainsHelper')}
                  </p>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{t('integrations.dialog.autoSync')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('integrations.dialog.autoSyncDesc')}
                    </p>
                  </div>
                  <Switch id="azure-auto-sync" defaultChecked={formData.autoSync || false} />
                </div>
              </div>
            )}

            {selectedIntegration?.id === 'microsoft365' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ms365-tenant-id">{t('integrations.dialog.ms365.tenantId')}</Label>
                  <Input
                    id="ms365-tenant-id"
                    defaultValue={formData.tenantId || ''}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ms365-client-id">{t('integrations.dialog.ms365.clientId')}</Label>
                  <Input
                    id="ms365-client-id"
                    defaultValue={formData.clientId || ''}
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ms365-client-secret">{t('integrations.dialog.ms365.clientSecret')}</Label>
                  <Input
                    id="ms365-client-secret"
                    type="password"
                    defaultValue={formData.clientSecret || ''}
                    placeholder="•••••••••••••••"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{t('integrations.dialog.autoSync')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('integrations.dialog.autoSyncDesc')}
                    </p>
                  </div>
                  <Switch id="ms365-auto-sync" defaultChecked={formData.autoSync || false} />
                </div>
              </div>
            )}

            {selectedIntegration?.id === 'google' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="google-client-id">{t('integrations.dialog.google.clientId')}</Label>
                  <Input
                    id="google-client-id"
                    placeholder="xxxxxxxxxxxxx.apps.googleusercontent.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-client-secret">{t('integrations.dialog.google.clientSecret')}</Label>
                  <Input
                    id="google-client-secret"
                    type="password"
                    placeholder="•••••••••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="google-domain">{t('integrations.dialog.google.domain')}</Label>
                  <Input
                    id="google-domain"
                    defaultValue={formData.domain || ''}
                    placeholder="empresa.com.br"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{t('integrations.dialog.autoSync')}</p>
                    <p className="text-xs text-muted-foreground">
                      {t('integrations.dialog.autoSyncDesc')}
                    </p>
                  </div>
                  <Switch id="google-auto-sync" />
                </div>
              </div>
            )}

            {selectedIntegration?.id === 'smtp' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">{t('integrations.dialog.smtp.host')}</Label>
                  <Input
                    id="smtp-host"
                    defaultValue={formData.host || ''}
                    placeholder="smtp.exemplo.com.br"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">{t('integrations.dialog.smtp.port')}</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      defaultValue={formData.port || 587}
                      placeholder="587"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="smtp-security">{t('integrations.dialog.smtp.security')}</Label>
                    <Input
                      id="smtp-security"
                      placeholder="TLS"
                      disabled
                      value="TLS"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-username">{t('integrations.dialog.smtp.username')}</Label>
                  <Input
                    id="smtp-username"
                    defaultValue={formData.user || ''}
                    placeholder="usuario@exemplo.com.br"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">{t('integrations.dialog.smtp.password')}</Label>
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
                  <Label htmlFor="webhook-url">{t('integrations.dialog.webhooks.url')}</Label>
                  <Input
                    id="webhook-url"
                    placeholder="https://api.exemplo.com.br/webhook"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhook-secret">{t('integrations.dialog.webhooks.secret')}</Label>
                  <Input
                    id="webhook-secret"
                    type="password"
                    placeholder="•••••••••••••••"
                  />
                </div>
                <div className="space-y-3">
                  <Label>{t('integrations.dialog.webhooks.events')}</Label>
                  {[
                    { id: 'campaign.started', label: t('integrations.dialog.webhooks.eventOptions.started') },
                    { id: 'campaign.completed', label: t('integrations.dialog.webhooks.eventOptions.completed') },
                    { id: 'email.opened', label: t('integrations.dialog.webhooks.eventOptions.opened') },
                    { id: 'link.clicked', label: t('integrations.dialog.webhooks.eventOptions.clicked') },
                    { id: 'data.submitted', label: t('integrations.dialog.webhooks.eventOptions.submitted') },
                    { id: 'training.completed', label: t('integrations.dialog.webhooks.eventOptions.training') },
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
              {t('integrations.dialog.buttons.cancel')}
            </Button>
            <Button
              onClick={handleSaveAndConnect}
              disabled={isLoading}
              className="bg-[#834a8b] hover:bg-[#6d3d75]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  {t('integrations.dialog.buttons.saving')}
                </>
              ) : (
                <>
                  <Key className="w-4 h-4 mr-2" />
                  {t('integrations.dialog.buttons.saveAndConnect')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}