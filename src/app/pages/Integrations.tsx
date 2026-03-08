import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Plug, CheckCircle, XCircle, AlertCircle, RefreshCw, Settings, Key, Link as LinkIcon } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Switch } from '../components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { toast } from 'sonner';

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

const mockIntegrations: Integration[] = [
  {
    id: 'microsoft365',
    name: 'Microsoft 365',
    description: 'Sincronize usuários do Azure AD automaticamente',
    icon: '🔷',
    status: 'disconnected',
    features: [
      'Importação automática de usuários',
      'Sincronização de grupos',
      'Single Sign-On (SSO)',
      'Atualização em tempo real'
    ],
  },
  {
    id: 'google',
    name: 'Google Workspace',
    description: 'Integração completa com Google Workspace',
    icon: '🔴',
    status: 'disconnected',
    features: [
      'Importação de usuários do Google',
      'Sincronização de grupos',
      'OAuth 2.0',
      'Webhook automático'
    ],
  },
  {
    id: 'smtp',
    name: 'Servidor SMTP',
    description: 'Configure seu próprio servidor SMTP para envio',
    icon: '📧',
    status: 'disconnected',
    features: [
      'SMTP customizado',
      'TLS/SSL',
      'Autenticação',
      'Controle de rate limiting'
    ],
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

export default function Integrations() {
  const { t } = useTranslation();
  const [integrations, setIntegrations] = useState<Integration[]>(mockIntegrations);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  const handleConnect = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    // Simular conexão
    toast.loading('Conectando...', { id: integrationId });
    
    setTimeout(() => {
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId
          ? { ...i, status: 'connected' as const, lastSync: new Date().toISOString() }
          : i
      ));
      
      toast.success(`${integration.name} conectado com sucesso!`, { id: integrationId });
    }, 1500);
  };

  const handleDisconnect = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    setIntegrations(prev => prev.map(i => 
      i.id === integrationId
        ? { ...i, status: 'disconnected' as const, lastSync: undefined }
        : i
    ));

    toast.success(`${integration.name} desconectado`);
  };

  const handleSync = (integrationId: string) => {
    const integration = integrations.find(i => i.id === integrationId);
    if (!integration) return;

    toast.loading('Sincronizando...', { id: `sync-${integrationId}` });

    setTimeout(() => {
      setIntegrations(prev => prev.map(i => 
        i.id === integrationId
          ? { ...i, lastSync: new Date().toISOString() }
          : i
      ));

      toast.success('Sincronização concluída!', { id: `sync-${integrationId}` });
    }, 2000);
  };

  const openConfig = (integration: Integration) => {
    setSelectedIntegration(integration);
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
        <AlertTitle>Em Desenvolvimento</AlertTitle>
        <AlertDescription>
          As integrações estão em fase de desenvolvimento. Algumas funcionalidades podem estar limitadas ou em modo de demonstração.
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
                      className="flex-1"
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sincronizar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openConfig(integration)}
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Config
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDisconnect(integration.id)}
                    >
                      Desconectar
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      size="sm"
                      onClick={() => openConfig(integration)}
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
            {selectedIntegration?.id === 'microsoft365' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tenant-id">Tenant ID</Label>
                  <Input
                    id="tenant-id"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-id">Client ID</Label>
                  <Input
                    id="client-id"
                    placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="client-secret">Client Secret</Label>
                  <Input
                    id="client-secret"
                    type="password"
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
                  <Switch />
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
                  <Switch />
                </div>
              </div>
            )}

            {selectedIntegration?.id === 'smtp' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smtp-host">Servidor SMTP</Label>
                  <Input
                    id="smtp-host"
                    placeholder="smtp.exemplo.com.br"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="smtp-port">Porta</Label>
                    <Input
                      id="smtp-port"
                      type="number"
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
                    placeholder="usuario@exemplo.com.br"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtp-password">Senha</Label>
                  <Input
                    id="smtp-password"
                    type="password"
                    placeholder="•••••••••••••••"
                  />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="text-sm font-medium">Usar para envio de campanhas</p>
                    <p className="text-xs text-muted-foreground">
                      Enviar e-mails de phishing através deste servidor
                    </p>
                  </div>
                  <Switch />
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
            >
              Cancelar
            </Button>
            <Button
              onClick={() => {
                if (selectedIntegration) {
                  handleConnect(selectedIntegration.id);
                  setIsConfigDialogOpen(false);
                }
              }}
              className="bg-[#834a8b] hover:bg-[#6d3d75]"
            >
              <Key className="w-4 h-4 mr-2" />
              Salvar e Conectar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
