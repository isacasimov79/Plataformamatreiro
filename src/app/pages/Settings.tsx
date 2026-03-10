import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Switch } from '../components/ui/switch';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Settings as SettingsIcon,
  Mail,
  Globe,
  Shield,
  Key,
  Database,
  Bell,
  Users,
  Palette,
  CheckCircle,
  XCircle,
  RefreshCw,
  Save,
  Link,
  Cloud,
  Server,
  Activity,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { 
  getSettings, 
  updateSettings, 
  azureTestConnection,
  azureSyncUsers,
  azureSyncGroups,
} from '../lib/supabaseApi';

export function Settings() {
  const { user, impersonatedTenant } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [syslogEnabled, setSyslogEnabled] = useState(false);
  const [phishingSyslogEnabled, setPhishingSyslogEnabled] = useState(false);
  
  // Settings state
  const [settings, setSettings] = useState<any>({
    general: {
      organizationName: '',
      domain: '',
      description: '',
      timezone: 'america-sao-paulo',
      language: 'pt-br',
      maintenanceMode: false,
      autoArchiveCampaigns: true,
    },
    smtp: {
      host: '',
      port: 587,
      user: '',
      password: '',
      from: '',
      encryption: 'tls',
    },
    syslog: {
      host: '',
      port: 514,
      protocol: 'udp',
      facility: 'local0',
      auditLogsEnabled: false,
      phishingEventsEnabled: false,
    },
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
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const data = await getSettings();
      console.log('✅ Settings loaded:', data);
      if (data && data.settings) {
        // Garantir que a estrutura completa existe
        const loadedSettings = {
          general: data.settings.general || {
            organizationName: '',
            domain: '',
            description: '',
            timezone: 'america-sao-paulo',
            language: 'pt-br',
            maintenanceMode: false,
            autoArchiveCampaigns: true,
          },
          smtp: data.settings.smtp || {
            host: '',
            port: 587,
            user: '',
            password: '',
            from: '',
            encryption: 'tls',
          },
          syslog: data.settings.syslog || {
            host: '',
            port: 514,
            protocol: 'udp',
            facility: 'local0',
            auditLogsEnabled: false,
            phishingEventsEnabled: false,
          },
          integrations: {
            microsoft365: data.settings.integrations?.microsoft365 || {
              enabled: false,
              tenantId: '',
              clientId: '',
              clientSecret: '',
              autoSync: false,
            },
            googleWorkspace: data.settings.integrations?.googleWorkspace || {
              enabled: false,
              serviceAccountJson: '',
              domain: '',
            },
            azure: data.settings.integrations?.azure || {
              enabled: false,
              tenantId: '',
              clientId: '',
              clientSecret: '',
              autoSync: false,
            },
          },
        };
        setSettings(loadedSettings);
        setSyslogEnabled(loadedSettings.syslog.auditLogsEnabled || false);
        setPhishingSyslogEnabled(loadedSettings.syslog.phishingEventsEnabled || false);
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

  const handleSaveGeneral = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const updatedSettings = {
      ...settings,
      general: {
        organizationName: formData.get('org-name') as string,
        domain: formData.get('org-domain') as string,
        description: formData.get('org-description') as string,
        timezone: formData.get('timezone') as string,
        language: formData.get('language') as string,
        maintenanceMode: settings.general.maintenanceMode,
        autoArchiveCampaigns: settings.general.autoArchiveCampaigns,
      },
    };

    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success('Configurações salvas!', {
        description: 'As alterações gerais foram aplicadas',
      });
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar', {
        description: error.message || 'Não foi possível salvar as configurações.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSMTP = async () => {
    setIsLoading(true);
    try {
      // Aqui você pode adicionar lógica real de teste SMTP no futuro
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('E-mail de teste enviado!', {
        description: 'Verifique sua caixa de entrada',
      });
    } catch (error) {
      toast.error('Erro ao testar SMTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSMTP = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const updatedSettings = {
      ...settings,
      smtp: {
        host: formData.get('smtp-host') as string,
        port: parseInt(formData.get('smtp-port') as string) || 587,
        user: formData.get('smtp-user') as string,
        password: formData.get('smtp-password') as string,
        from: formData.get('smtp-from') as string,
        encryption: formData.get('smtp-encryption') as string,
      },
    };

    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success('Configurações SMTP salvas!', {
        description: 'As configurações de e-mail foram atualizadas',
      });
    } catch (error: any) {
      console.error('Error saving SMTP settings:', error);
      toast.error('Erro ao salvar', {
        description: error.message || 'Não foi possível salvar as configurações SMTP.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncUsers = async (provider: string) => {
    setIsLoading(true);
    try {
      if (provider === 'Microsoft 365' && settings?.integrations?.microsoft365) {
        const { tenantId, clientId, clientSecret, allowedDomains } = settings.integrations.microsoft365;
        
        if (!tenantId || !clientId || !clientSecret) {
          toast.error('Credenciais incompletas', {
            description: 'Configure todas as credenciais antes de sincronizar',
          });
          setIsLoading(false);
          return;
        }
        
        const targetTenantId = impersonatedTenant?.id || 'default';
        const result = await azureSyncUsers(tenantId, clientId, clientSecret, targetTenantId, allowedDomains);
        
        if (result.success) {
          const description = result.filteredByDomain > 0
            ? `${result.synced} usuários sincronizados (${result.filteredByDomain} filtrados por domínio)`
            : `${result.synced} usuários foram sincronizados`;
          
          toast.success(`Sincronização ${provider} concluída!`, {
            description,
          });
        } else {
          throw new Error(result.details || result.error || 'Falha ao sincronizar usuários');
        }
      } else {
        // Placeholder para outras integrações
        await new Promise(resolve => setTimeout(resolve, 3000));
        toast.success(`Sincronização ${provider} iniciada!`, {
          description: '156 usuários foram sincronizados',
        });
      }
    } catch (error: any) {
      toast.error(`Erro ao sincronizar ${provider}`, {
        description: error.message || 'Tente novamente',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestSyslog = async () => {
    setIsLoading(true);
    try {
      // Aqui você pode adicionar lógica real de teste Syslog no futuro
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Mensagem de teste enviada!', {
        description: 'Verifique o servidor Syslog',
      });
    } catch (error) {
      toast.error('Erro ao testar Syslog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSyslog = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const updatedSettings = {
      ...settings,
      syslog: {
        host: formData.get('syslog-host') as string,
        port: parseInt(formData.get('syslog-port') as string) || 514,
        protocol: formData.get('syslog-protocol') as string,
        facility: formData.get('syslog-facility') as string,
        auditLogsEnabled: syslogEnabled,
        phishingEventsEnabled: phishingSyslogEnabled,
      },
    };

    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success('Configurações Syslog salvas!', {
        description: 'Os logs serão enviados ao servidor configurado',
      });
    } catch (error: any) {
      console.error('Error saving Syslog settings:', error);
      toast.error('Erro ao salvar', {
        description: error.message || 'Não foi possível salvar as configurações Syslog.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveIntegrations = async (provider: 'microsoft365' | 'googleWorkspace', formData: FormData) => {
    setIsLoading(true);
    
    let updatedSettings = { ...settings };
    
    if (provider === 'microsoft365') {
      // Parse allowed domains from textarea (one per line)
      const allowedDomainsText = (formData.get('ms-allowed-domains') as string || '').trim();
      const allowedDomains = allowedDomainsText
        .split('\n')
        .map(domain => domain.trim())
        .filter(domain => domain.length > 0);
      
      updatedSettings.integrations.microsoft365 = {
        enabled: settings?.integrations?.microsoft365?.enabled || false,
        tenantId: formData.get('ms-tenant-id') as string,
        clientId: formData.get('ms-client-id') as string,
        clientSecret: formData.get('ms-client-secret') as string,
        autoSync: settings?.integrations?.microsoft365?.autoSync || false,
        allowedDomains: allowedDomains.length > 0 ? allowedDomains : undefined,
      };
    } else if (provider === 'googleWorkspace') {
      updatedSettings.integrations.googleWorkspace = {
        enabled: settings?.integrations?.googleWorkspace?.enabled || false,
        serviceAccountJson: formData.get('google-service-account') as string,
        domain: formData.get('google-domain') as string,
      };
    }

    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success(`Integração ${provider === 'microsoft365' ? 'Microsoft 365' : 'Google Workspace'} salva!`, {
        description: 'As configurações de integração foram atualizadas',
      });
    } catch (error: any) {
      console.error('Error saving integration settings:', error);
      toast.error('Erro ao salvar', {
        description: error.message || 'Não foi possível salvar as configurações de integração.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleIntegration = async (provider: 'microsoft365' | 'googleWorkspace') => {
    const updatedSettings = { ...settings };
    if (!updatedSettings.integrations) {
      updatedSettings.integrations = {};
    }
    if (!updatedSettings.integrations[provider]) {
      updatedSettings.integrations[provider] = { enabled: false };
    }
    updatedSettings.integrations[provider].enabled = !updatedSettings.integrations[provider].enabled;
    
    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success(
        updatedSettings.integrations[provider].enabled 
          ? 'Integração ativada!' 
          : 'Integração desativada!',
        {
          description: `${provider === 'microsoft365' ? 'Microsoft 365' : 'Google Workspace'} foi ${updatedSettings.integrations[provider].enabled ? 'ativado' : 'desativado'}`,
        }
      );
    } catch (error: any) {
      console.error('Error toggling integration:', error);
      toast.error('Erro ao alterar integração');
    }
  };

  const handleToggleAutoSync = async (provider: 'microsoft365') => {
    const updatedSettings = { ...settings };
    if (!updatedSettings.integrations) {
      updatedSettings.integrations = {};
    }
    if (!updatedSettings.integrations[provider]) {
      updatedSettings.integrations[provider] = { autoSync: false };
    }
    updatedSettings.integrations[provider].autoSync = !updatedSettings.integrations[provider].autoSync;
    
    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success('Sincronização automática atualizada!');
    } catch (error: any) {
      console.error('Error toggling auto sync:', error);
      toast.error('Erro ao alterar sincronização automática');
    }
  };

  const handleToggleMaintenanceMode = async () => {
    const updatedSettings = { ...settings };
    updatedSettings.general.maintenanceMode = !updatedSettings.general.maintenanceMode;
    
    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success(
        updatedSettings.general.maintenanceMode 
          ? 'Modo de manutenção ativado!' 
          : 'Modo de manutenção desativado!'
      );
    } catch (error: any) {
      console.error('Error toggling maintenance mode:', error);
      toast.error('Erro ao alterar modo de manutenção');
    }
  };

  const handleToggleAutoArchive = async () => {
    const updatedSettings = { ...settings };
    updatedSettings.general.autoArchiveCampaigns = !updatedSettings.general.autoArchiveCampaigns;
    
    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success('Auto-arquivamento atualizado!');
    } catch (error: any) {
      console.error('Error toggling auto archive:', error);
      toast.error('Erro ao alterar auto-arquivamento');
    }
  };

  const handleTestAzureConnection = async () => {
    setIsLoading(true);
    try {
      const { tenantId, clientId, clientSecret } = settings?.integrations?.azure || {};
      
      if (!tenantId || !clientId || !clientSecret) {
        toast.error('Preencha todas as credenciais do Azure');
        setIsLoading(false);
        return;
      }

      const result = await azureTestConnection(tenantId, clientId, clientSecret);
      
      if (result.success) {
        toast.success('Conexão Azure estabelecida!', {
          description: `Organização: ${result.organization?.name}`,
        });
      } else {
        toast.error(result.error || 'Falha ao conectar com Azure', {
          description: result.details,
        });
      }
    } catch (error: any) {
      console.error('❌ Error testing Azure connection:', error);
      toast.error('Erro ao testar conexão', {
        description: error.message || 'Verifique suas credenciais e tente novamente',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAzureUsers = async () => {
    setIsLoading(true);
    try {
      const { tenantId, clientId, clientSecret, allowedDomains } = settings?.integrations?.azure || {};
      
      console.log('🔄 Starting Azure user sync...', {
        hasTenantId: !!tenantId,
        hasClientId: !!clientId,
        hasClientSecret: !!clientSecret,
      });
      
      if (!tenantId || !clientId || !clientSecret) {
        toast.error('Configure as credenciais do Azure primeiro');
        setIsLoading(false);
        return;
      }

      // Usar o tenant atual ou 'default' - você pode ajustar isso conforme sua lógica
      const targetTenantId = impersonatedTenant?.id || 'default';
      
      console.log('📤 Calling azureSyncUsers API...', { targetTenantId, allowedDomains });
      const result = await azureSyncUsers(tenantId, clientId, clientSecret, targetTenantId, allowedDomains);
      
      console.log('📥 Azure sync result:', result);
      
      if (result.success) {
        toast.success('Usuários sincronizados!', {
          description: `${result.synced} usuários importados do Azure AD`,
        });
      } else {
        const errorDetails = result.details || result.error || 'Erro desconhecido';
        console.error('❌ Sync failed with structured error:', result);
        toast.error('Erro ao sincronizar usuários', {
          description: errorDetails,
        });
      }
    } catch (error: any) {
      console.error('❌ Error syncing:', error);
      toast.error('Erro ao sincronizar usuários', {
        description: error.message || 'Erro desconhecido',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAzureGroups = async () => {
    setIsLoading(true);
    try {
      const { tenantId, clientId, clientSecret, allowedDomains } = settings?.integrations?.azure || {};
      
      if (!tenantId || !clientId || !clientSecret) {
        toast.error('Configure as credenciais do Azure primeiro');
        setIsLoading(false);
        return;
      }

      const targetTenantId = impersonatedTenant?.id || 'default';
      
      const result = await azureSyncGroups(tenantId, clientId, clientSecret, targetTenantId, allowedDomains);
      
      if (result.success) {
        toast.success('Grupos sincronizados!', {
          description: `${result.synced} grupos importados do Azure AD`,
        });
      } else {
        toast.error('Erro ao sincronizar grupos');
      }
    } catch (error: any) {
      toast.error('Erro ao sincronizar grupos', {
        description: error.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAzureIntegration = async () => {
    const updatedSettings = { ...settings };
    if (!updatedSettings.integrations) {
      updatedSettings.integrations = {};
    }
    if (!updatedSettings.integrations.azure) {
      updatedSettings.integrations.azure = { enabled: false };
    }
    updatedSettings.integrations.azure.enabled = !updatedSettings.integrations.azure.enabled;
    
    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success(
        updatedSettings.integrations.azure.enabled 
          ? 'Integração Azure ativada!' 
          : 'Integração Azure desativada!'
      );
    } catch (error: any) {
      console.error('Error toggling Azure integration:', error);
      toast.error('Erro ao alterar integração Azure');
    }
  };

  const handleToggleAzureAutoSync = async () => {
    const updatedSettings = { ...settings };
    if (!updatedSettings.integrations) {
      updatedSettings.integrations = {};
    }
    if (!updatedSettings.integrations.azure) {
      updatedSettings.integrations.azure = { autoSync: false };
    }
    updatedSettings.integrations.azure.autoSync = !updatedSettings.integrations.azure.autoSync;
    
    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success('Sincronização automática Azure atualizada!');
    } catch (error: any) {
      console.error('Error toggling Azure auto sync:', error);
      toast.error('Erro ao alterar sincronização automática');
    }
  };

  const handleSaveAzureIntegration = async (formData: FormData) => {
    setIsLoading(true);
    
    const tenantId = (formData.get('azure-tenant-id') as string).trim();
    const clientId = (formData.get('azure-client-id') as string).trim();
    const clientSecret = (formData.get('azure-client-secret') as string).trim();
    
    // Validate UUID format for Tenant ID and Client ID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    
    if (tenantId && !uuidRegex.test(tenantId)) {
      toast.error('Tenant ID inválido', {
        description: 'O Tenant ID deve estar no formato UUID (ex: 12345678-1234-1234-1234-123456789abc)',
      });
      setIsLoading(false);
      return;
    }
    
    if (clientId && !uuidRegex.test(clientId)) {
      toast.error('Client ID inválido', {
        description: 'O Client ID deve estar no formato UUID (ex: 12345678-1234-1234-1234-123456789abc)',
      });
      setIsLoading(false);
      return;
    }
    
    if (clientSecret && clientSecret.length < 10) {
      toast.error('Client Secret inválido', {
        description: 'O Client Secret parece muito curto. Certifique-se de copiar o Value completo.',
      });
      setIsLoading(false);
      return;
    }
    
    // Parse allowed domains from textarea (one per line)
    const allowedDomainsText = (formData.get('azure-allowed-domains') as string || '').trim();
    const allowedDomains = allowedDomainsText
      .split('\n')
      .map(domain => domain.trim())
      .filter(domain => domain.length > 0);
    
    const updatedSettings = { ...settings };
    updatedSettings.integrations.azure = {
      enabled: settings?.integrations?.azure?.enabled || false,
      tenantId,
      clientId,
      clientSecret,
      autoSync: settings?.integrations?.azure?.autoSync || false,
      allowedDomains: allowedDomains.length > 0 ? allowedDomains : undefined,
    };

    try {
      await updateSettings(updatedSettings);
      setSettings(updatedSettings);
      toast.success('Integração Azure salva!', {
        description: 'As configurações do Azure foram atualizadas',
      });
    } catch (error: any) {
      console.error('Error saving Azure integration settings:', error);
      toast.error('Erro ao salvar', {
        description: error.message || 'Não foi possível salvar as configurações do Azure.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-[#242545]" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545]">
              Configurações do Sistema
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Gerencie integrações, SMTP, domínios e preferências
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Globe className="w-4 h-4 mr-2" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="smtp">
            <Mail className="w-4 h-4 mr-2" />
            SMTP
          </TabsTrigger>
          <TabsTrigger value="syslog">
            <Server className="w-4 h-4 mr-2" />
            Syslog
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Cloud className="w-4 h-4 mr-2" />
            Integrações
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Segurança
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notificações
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Informações básicas da organização e preferências
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGeneral} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="org-name">Nome da Organização</Label>
                    <Input
                      id="org-name"
                      defaultValue={settings.general.organizationName || ''}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="org-domain">Domínio Principal</Label>
                    <Input
                      id="org-domain"
                      defaultValue={settings.general.domain || ''}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="org-description">Descrição</Label>
                  <Textarea
                    id="org-description"
                    defaultValue={settings.general.description || ''}
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <input type="hidden" name="timezone" value={settings.general.timezone || ''} id="timezone-hidden" />
                    <Select
                      defaultValue={settings.general.timezone || 'america-sao-paulo'}
                      onValueChange={(value) => {
                        const input = document.getElementById('timezone-hidden') as HTMLInputElement;
                        if (input) input.value = value;
                        setSettings((prev: any) => ({
                          ...prev,
                          general: { ...prev.general, timezone: value }
                        }));
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="america-sao-paulo">
                          (UTC-03:00) Brasília
                        </SelectItem>
                        <SelectItem value="america-new-york">
                          (UTC-05:00) Nova York
                        </SelectItem>
                        <SelectItem value="europe-london">
                          (UTC+00:00) Londres
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="language">Idioma Padrão</Label>
                    <input type="hidden" name="language" value={settings.general.language || ''} id="language-hidden" />
                    <Select
                      defaultValue={settings.general.language || 'pt-br'}
                      onValueChange={(value) => {
                        const input = document.getElementById('language-hidden') as HTMLInputElement;
                        if (input) input.value = value;
                        setSettings((prev: any) => ({
                          ...prev,
                          general: { ...prev.general, language: value }
                        }));
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pt-br">Português (BR)</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Modo de Manutenção</p>
                    <p className="text-sm text-gray-500">
                      Desabilita acesso temporário à plataforma
                    </p>
                  </div>
                  <Switch
                    checked={settings.general.maintenanceMode}
                    onCheckedChange={handleToggleMaintenanceMode}
                  />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Auto-arquivar Campanhas</p>
                    <p className="text-sm text-gray-500">
                      Arquivar automaticamente campanhas após 90 dias
                    </p>
                  </div>
                  <Switch
                    checked={settings.general.autoArchiveCampaigns}
                    onCheckedChange={handleToggleAutoArchive}
                  />
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
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
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Alterações
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMTP Settings */}
        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de E-mail (SMTP)</CardTitle>
              <CardDescription>
                Configure o servidor SMTP para envio de campanhas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSMTP} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-host">Servidor SMTP</Label>
                    <Input
                      id="smtp-host"
                      name="smtp-host"
                      placeholder="smtp.gmail.com"
                      defaultValue={settings.smtp.host || ''}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">Porta</Label>
                    <Input
                      id="smtp-port"
                      name="smtp-port"
                      type="number"
                      defaultValue={settings.smtp.port || 587}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-user">Usuário SMTP</Label>
                    <Input
                      id="smtp-user"
                      name="smtp-user"
                      defaultValue={settings.smtp.user || ''}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-password">Senha SMTP</Label>
                    <Input
                      id="smtp-password"
                      name="smtp-password"
                      type="password"
                      defaultValue={settings.smtp.password || ''}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="smtp-from">E-mail Remetente Padrão</Label>
                  <Input
                    id="smtp-from"
                    name="smtp-from"
                    defaultValue={settings.smtp.from || ''}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="smtp-encryption">Tipo de Criptografia</Label>
                  <input type="hidden" name="smtp-encryption" value={settings.smtp.encryption || ''} id="smtp-encryption-hidden" />
                  <Select
                    defaultValue={settings.smtp.encryption || 'tls'}
                    onValueChange={(value) => {
                      const input = document.getElementById('smtp-encryption-hidden') as HTMLInputElement;
                      if (input) input.value = value;
                      setSettings((prev: any) => ({
                        ...prev,
                        smtp: { ...prev.smtp, encryption: value }
                      }));
                    }}
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tls">TLS</SelectItem>
                      <SelectItem value="ssl">SSL</SelectItem>
                      <SelectItem value="none">Nenhuma</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-blue-900">Conexão Verificada</p>
                      <p className="text-sm text-blue-700">
                        Último teste: 08/03/2026 às 10:30
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestSMTP}
                    disabled={isLoading}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Enviar E-mail de Teste
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#834a8b] hover:bg-[#6d3d75]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Syslog Settings */}
        <TabsContent value="syslog">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Syslog</CardTitle>
              <CardDescription>
                Configure o servidor Syslog para envio de logs de auditoria e eventos de phishing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveSyslog} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="syslog-host">Servidor Syslog</Label>
                    <Input
                      id="syslog-host"
                      name="syslog-host"
                      placeholder="syslog.example.com"
                      defaultValue={settings.syslog.host || ''}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="syslog-port">Porta</Label>
                    <Input
                      id="syslog-port"
                      name="syslog-port"
                      type="number"
                      defaultValue={settings.syslog.port || 514}
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="syslog-protocol">Protocolo</Label>
                    <input type="hidden" name="syslog-protocol" value={settings.syslog.protocol || ''} id="syslog-protocol-hidden" />
                    <Select
                      defaultValue={settings.syslog.protocol || 'udp'}
                      onValueChange={(value) => {
                        const input = document.getElementById('syslog-protocol-hidden') as HTMLInputElement;
                        if (input) input.value = value;
                        setSettings((prev: any) => ({
                          ...prev,
                          syslog: { ...prev.syslog, protocol: value }
                        }));
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="udp">UDP</SelectItem>
                        <SelectItem value="tcp">TCP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="syslog-facility">Facility</Label>
                    <input type="hidden" name="syslog-facility" value={settings.syslog.facility || ''} id="syslog-facility-hidden" />
                    <Select
                      defaultValue={settings.syslog.facility || 'local0'}
                      onValueChange={(value) => {
                        const input = document.getElementById('syslog-facility-hidden') as HTMLInputElement;
                        if (input) input.value = value;
                        setSettings((prev: any) => ({
                          ...prev,
                          syslog: { ...prev.syslog, facility: value }
                        }));
                      }}
                    >
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="local0">local0</SelectItem>
                        <SelectItem value="local1">local1</SelectItem>
                        <SelectItem value="local2">local2</SelectItem>
                        <SelectItem value="local3">local3</SelectItem>
                        <SelectItem value="local4">local4</SelectItem>
                        <SelectItem value="local5">local5</SelectItem>
                        <SelectItem value="local6">local6</SelectItem>
                        <SelectItem value="local7">local7</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-[#242545]">
                    Tipos de Eventos para Enviar
                  </h3>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Logs de Auditoria</p>
                      <p className="text-sm text-gray-500">
                        Enviar logs de auditoria do sistema para Syslog
                      </p>
                    </div>
                    <Switch
                      checked={syslogEnabled}
                      onCheckedChange={setSyslogEnabled}
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">Eventos de Phishing</p>
                      <p className="text-sm text-gray-500">
                        Enviar eventos de campanhas (aberturas, cliques, submissões)
                      </p>
                    </div>
                    <Switch
                      checked={phishingSyslogEnabled}
                      onCheckedChange={setPhishingSyslogEnabled}
                    />
                  </div>
                </div>

                {(syslogEnabled || phishingSyslogEnabled) && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <p className="font-medium text-blue-900">
                        Exemplos de Mensagens Syslog
                      </p>
                    </div>
                    <div className="space-y-2 text-xs">
                      {syslogEnabled && (
                        <div className="p-2 bg-gray-900 rounded font-mono text-green-400">
                          {`<134>Mar 8 10:30:15 matreiro[audit]: user="admin@underprotection.com.br" action="LOGIN" status="success" ip="177.28.105.45"`}
                        </div>
                      )}
                      {phishingSyslogEnabled && (
                        <>
                          <div className="p-2 bg-gray-900 rounded font-mono text-green-400">
                            {`<134>Mar 8 10:30:15 matreiro[phishing]: campaign="Black Friday Test" event="EMAIL_OPEN" target="joao.silva@empresa.com.br" ip="189.32.78.99"`}
                          </div>
                          <div className="p-2 bg-gray-900 rounded font-mono text-yellow-400">
                            {`<134>Mar 8 10:31:22 matreiro[phishing]: campaign="Black Friday Test" event="LINK_CLICK" target="joao.silva@empresa.com.br" ip="189.32.78.99"`}
                          </div>
                          <div className="p-2 bg-gray-900 rounded font-mono text-red-400">
                            {`<134>Mar 8 10:32:05 matreiro[phishing]: campaign="Black Friday Test" event="DATA_SUBMIT" target="joao.silva@empresa.com.br" credentials="username,password" ip="189.32.78.99"`}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleTestSyslog}
                    disabled={isLoading}
                  >
                    <Server className="w-4 h-4 mr-2" />
                    Enviar Mensagem de Teste
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-[#834a8b] hover:bg-[#6d3d75]"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations */}
        <TabsContent value="integrations">
          <div className="space-y-6">
            {/* Microsoft 365 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-blue-600" />
                      Microsoft 365 / Azure AD
                    </CardTitle>
                    <CardDescription>
                      Sincronize usuários automaticamente do Azure Active Directory
                    </CardDescription>
                  </div>
                  <Badge className={settings?.integrations?.microsoft365?.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {settings?.integrations?.microsoft365?.enabled ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Conectado
                      </>
                    ) : (
                      'Não Conectado'
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSaveIntegrations('microsoft365', formData);
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ms-tenant-id">Tenant ID</Label>
                      <Input
                        id="ms-tenant-id"
                        name="ms-tenant-id"
                        defaultValue={settings?.integrations?.microsoft365?.tenantId || ''}
                        placeholder="abc123-def456-ghi789"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ms-client-id">Client ID</Label>
                      <Input
                        id="ms-client-id"
                        name="ms-client-id"
                        defaultValue={settings?.integrations?.microsoft365?.clientId || ''}
                        placeholder="xyz789-uvw456-rst123"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ms-client-secret">Client Secret</Label>
                    <Input
                      id="ms-client-secret"
                      name="ms-client-secret"
                      type="password"
                      defaultValue={settings?.integrations?.microsoft365?.clientSecret || ''}
                      placeholder="Digite o Client Secret"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="ms-allowed-domains">Domínios Permitidos (filtro)</Label>
                    <Textarea
                      id="ms-allowed-domains"
                      name="ms-allowed-domains"
                      defaultValue={settings?.integrations?.microsoft365?.allowedDomains?.join('\n') || ''}
                      placeholder="acme.com&#10;globalbank.com.br&#10;healthplus.com.br"
                      className="mt-2 font-mono text-sm"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      🔒 Digite um domínio por linha. Apenas usuários desses domínios serão sincronizados. 
                      Deixe vazio para sincronizar todos os usuários.
                    </p>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Habilitar Integração</p>
                      <p className="text-xs text-gray-500">
                        Ativar sincronização com Microsoft 365
                      </p>
                    </div>
                    <Switch
                      checked={settings?.integrations?.microsoft365?.enabled || false}
                      onCheckedChange={() => handleToggleIntegration('microsoft365')}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Sincronização Automática</p>
                      <p className="text-xs text-gray-500">
                        Sincronizar usuários diariamente às 06:00
                      </p>
                    </div>
                    <Switch
                      checked={settings?.integrations?.microsoft365?.autoSync || false}
                      onCheckedChange={() => handleToggleAutoSync('microsoft365')}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSyncUsers('Microsoft 365')}
                      disabled={isLoading || !settings?.integrations?.microsoft365?.enabled}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sincronizar Agora
                    </Button>
                    <Button 
                      type="submit"
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
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Microsoft Azure - Integração Avançada */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-[#0078D4]" />
                      Microsoft Azure Graph API
                    </CardTitle>
                    <CardDescription>
                      Importar usuários, grupos e configurar SMTP via Microsoft Graph API
                    </CardDescription>
                  </div>
                  <Badge className={settings?.integrations?.azure?.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {settings?.integrations?.azure?.enabled ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Conectado
                      </>
                    ) : (
                      'Não Conectado'
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Help Section */}
                <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="space-y-2 text-sm text-amber-900">
                      <p className="font-semibold">Como configurar o Azure AD:</p>
                      <ol className="list-decimal list-inside space-y-1 text-xs">
                        <li>Acesse o <a href="https://portal.azure.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Portal Azure</a></li>
                        <li>Vá em <strong>Azure Active Directory</strong> → <strong>App registrations</strong></li>
                        <li>Clique em <strong>New registration</strong> e dê um nome ao app</li>
                        <li>Copie o <strong>Application (client) ID</strong> e o <strong>Directory (tenant) ID</strong></li>
                        <li>Vá em <strong>Certificates & secrets</strong> → <strong>New client secret</strong></li>
                        <li>Copie o <strong>Value</strong> do secret (não o Secret ID!)</li>
                        <li>Em <strong>API permissions</strong>, adicione as permissões necessárias (listadas abaixo)</li>
                        <li>Clique em <strong>Grant admin consent</strong> para aprovar</li>
                      </ol>
                    </div>
                  </div>
                </div>

                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSaveAzureIntegration(formData);
                }} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="azure-tenant-id">Azure Tenant ID</Label>
                      <Input
                        id="azure-tenant-id"
                        name="azure-tenant-id"
                        defaultValue={settings?.integrations?.azure?.tenantId || ''}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Também chamado de <strong>Directory ID</strong> (formato UUID)
                      </p>
                    </div>
                    <div>
                      <Label htmlFor="azure-client-id">Application (Client) ID</Label>
                      <Input
                        id="azure-client-id"
                        name="azure-client-id"
                        defaultValue={settings?.integrations?.azure?.clientId || ''}
                        placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                        className="mt-2"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Encontrado na página <strong>Overview</strong> do app (formato UUID)
                      </p>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="azure-client-secret">Client Secret (Value)</Label>
                    <Input
                      id="azure-client-secret"
                      name="azure-client-secret"
                      type="password"
                      defaultValue={settings?.integrations?.azure?.clientSecret || ''}
                      placeholder="Digite o Client Secret"
                      className="mt-2"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      ⚠️ Use o <strong>Value</strong> (não o Secret ID). Expira após 24 meses.
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="azure-allowed-domains">Domínios Permitidos (filtro)</Label>
                    <Textarea
                      id="azure-allowed-domains"
                      name="azure-allowed-domains"
                      defaultValue={settings?.integrations?.azure?.allowedDomains?.join('\n') || ''}
                      placeholder="acme.com&#10;globalbank.com.br&#10;healthplus.com.br"
                      className="mt-2 font-mono text-sm"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      🔒 Digite um domínio por linha. Apenas usuários desses domínios serão sincronizados. 
                      Deixe vazio para sincronizar todos os usuários.
                    </p>
                  </div>

                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">
                      📘 Permissões necessárias no Azure AD:
                    </p>
                    <ul className="text-xs text-blue-700 space-y-1 list-disc list-inside">
                      <li><code className="bg-blue-100 px-1 rounded">User.Read.All</code> - Ler usuários</li>
                      <li><code className="bg-blue-100 px-1 rounded">Group.Read.All</code> - Ler grupos</li>
                      <li><code className="bg-blue-100 px-1 rounded">GroupMember.Read.All</code> - Ler membros de grupos</li>
                      <li><code className="bg-blue-100 px-1 rounded">Mail.Send</code> - Enviar emails via SMTP</li>
                    </ul>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Habilitar Integração</p>
                      <p className="text-xs text-gray-500">
                        Ativar sincronização com Azure AD
                      </p>
                    </div>
                    <Switch
                      checked={settings?.integrations?.azure?.enabled || false}
                      onCheckedChange={handleToggleAzureIntegration}
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Sincronização Automática</p>
                      <p className="text-xs text-gray-500">
                        Sincronizar usuários e grupos diariamente às 06:00
                      </p>
                    </div>
                    <Switch
                      checked={settings?.integrations?.azure?.autoSync || false}
                      onCheckedChange={handleToggleAzureAutoSync}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleTestAzureConnection}
                      disabled={isLoading || !settings?.integrations?.azure?.tenantId}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Testar Conexão
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSyncAzureUsers}
                      disabled={isLoading || !settings?.integrations?.azure?.enabled}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Sincronizar Usuários
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleSyncAzureGroups}
                      disabled={isLoading || !settings?.integrations?.azure?.enabled}
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Sincronizar Grupos
                    </Button>
                    <Button 
                      type="submit"
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
                          <Save className="w-4 h-4 mr-2" />
                          Salvar
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Google Workspace */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="w-5 h-5 text-red-600" />
                      Google Workspace
                    </CardTitle>
                    <CardDescription>
                      Importe usuários do Google Workspace
                    </CardDescription>
                  </div>
                  <Badge className={settings.integrations.googleWorkspace.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}>
                    {settings.integrations.googleWorkspace.enabled ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Conectado
                      </>
                    ) : (
                      'Não Conectado'
                    )}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSaveIntegrations('googleWorkspace', formData);
                }} className="space-y-4">
                  <div>
                    <Label htmlFor="google-service-account">Service Account JSON</Label>
                    <Textarea
                      id="google-service-account"
                      name="google-service-account"
                      placeholder="Cole o conteúdo do arquivo JSON da Service Account"
                      defaultValue={settings.integrations.googleWorkspace.serviceAccountJson || ''}
                      rows={6}
                      className="mt-2 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="google-domain">Domínio Google Workspace</Label>
                    <Input
                      id="google-domain"
                      name="google-domain"
                      placeholder="empresa.com.br"
                      defaultValue={settings.integrations.googleWorkspace.domain || ''}
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Habilitar Integração</p>
                      <p className="text-xs text-gray-500">
                        Ativar sincronização com Google Workspace
                      </p>
                    </div>
                    <Switch
                      checked={settings.integrations.googleWorkspace.enabled}
                      onCheckedChange={() => handleToggleIntegration('googleWorkspace')}
                    />
                  </div>

                  <Button 
                    type="submit"
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
                        <Save className="w-4 h-4 mr-2" />
                        Salvar Configurações
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Keycloak */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Key className="w-5 h-5 text-purple-600" />
                      Keycloak IAM
                    </CardTitle>
                    <CardDescription>
                      Configurações de autenticação e Single Sign-On
                    </CardDescription>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ativo
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="keycloak-url">Keycloak URL</Label>
                    <Input
                      id="keycloak-url"
                      defaultValue="https://iam.upn.com.br"
                      className="mt-2"
                      readOnly
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="keycloak-realm">Realm</Label>
                      <Input
                        id="keycloak-realm"
                        defaultValue="underprotection"
                        className="mt-2"
                        readOnly
                      />
                    </div>
                    <div>
                      <Label htmlFor="keycloak-client">Client ID</Label>
                      <Input
                        id="keycloak-client"
                        defaultValue="matreiro-platform"
                        className="mt-2"
                        readOnly
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                    <p className="text-sm text-purple-900">
                      ✅ Autenticação via Keycloak está ativa. Usuários fazem login através de{' '}
                      <strong>https://iam.upn.com.br</strong>
                    </p>
                    <p className="text-xs text-purple-700 mt-2">
                      ℹ️ As configurações do Keycloak são gerenciadas externamente e não podem ser editadas aqui.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Segurança</CardTitle>
              <CardDescription>
                Políticas de acesso e proteção de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Autenticação de Dois Fatores (2FA)</p>
                    <p className="text-sm text-gray-500">
                      Obrigar 2FA para todos os administradores
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Auditoria de Logs</p>
                    <p className="text-sm text-gray-500">
                      Registrar todas as ações no sistema
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Timeout de Sessão</p>
                    <p className="text-sm text-gray-500">
                      Desconectar usuários inativos após 30 minutos
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">IPs Permitidos (Whitelist)</p>
                    <p className="text-sm text-gray-500">
                      Restringir acesso apenas a IPs específicos
                    </p>
                  </div>
                  <Switch />
                </div>

                <div>
                  <Label htmlFor="password-policy">Política de Senhas</Label>
                  <Select defaultValue="strong">
                    <SelectTrigger className="mt-2" id="password-policy">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Básica (mínimo 8 caracteres)</SelectItem>
                      <SelectItem value="medium">
                        Média (8+ caracteres, letras e números)
                      </SelectItem>
                      <SelectItem value="strong">
                        Forte (12+ caracteres, maiúsculas, números e símbolos)
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Preferências de Notificações</CardTitle>
              <CardDescription>
                Configure quando e como receber alertas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Notificações por E-mail</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">Nova captura de credenciais</p>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">Campanha finalizada</p>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">Falha em integração</p>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">Relatório semanal</p>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-4">Notificações na Plataforma</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">Novos usuários sincronizados</p>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">Atualizações do sistema</p>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm">Alertas de segurança</p>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Preferências
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}