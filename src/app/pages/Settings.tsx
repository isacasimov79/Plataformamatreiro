import { useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

export function Settings() {
  const { user, impersonatedTenant } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [syslogEnabled, setSyslogEnabled] = useState(false);
  const [phishingSyslogEnabled, setPhishingSyslogEnabled] = useState(false);

  const handleSaveGeneral = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Configurações salvas!', {
        description: 'As alterações gerais foram aplicadas',
      });
    }, 1000);
  };

  const handleTestSMTP = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('E-mail de teste enviado!', {
        description: 'Verifique sua caixa de entrada',
      });
    }, 2000);
  };

  const handleSyncUsers = (provider: string) => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`Sincronização ${provider} iniciada!`, {
        description: '156 usuários foram sincronizados',
      });
    }, 3000);
  };

  const handleTestSyslog = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Mensagem de teste enviada!', {
        description: 'Verifique o servidor Syslog',
      });
    }, 2000);
  };

  const handleSaveSyslog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Configurações Syslog salvas!', {
        description: 'Os logs serão enviados ao servidor configurado',
      });
    }, 1000);
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
                      defaultValue="Empresa XYZ Ltda"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="org-domain">Domínio Principal</Label>
                    <Input
                      id="org-domain"
                      defaultValue="empresa.com.br"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="org-description">Descrição</Label>
                  <Textarea
                    id="org-description"
                    defaultValue="Empresa de tecnologia focada em inovação"
                    rows={3}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="timezone">Fuso Horário</Label>
                    <Select defaultValue="america-sao-paulo">
                      <SelectTrigger className="mt-2" id="timezone">
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
                    <Select defaultValue="pt-br">
                      <SelectTrigger className="mt-2" id="language">
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
                  <Switch />
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Auto-arquivar Campanhas</p>
                    <p className="text-sm text-gray-500">
                      Arquivar automaticamente campanhas após 90 dias
                    </p>
                  </div>
                  <Switch defaultChecked />
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
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-host">Servidor SMTP</Label>
                    <Input
                      id="smtp-host"
                      placeholder="smtp.gmail.com"
                      defaultValue="smtp.empresa.com.br"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-port">Porta</Label>
                    <Input
                      id="smtp-port"
                      type="number"
                      defaultValue="587"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="smtp-user">Usuário SMTP</Label>
                    <Input
                      id="smtp-user"
                      defaultValue="noreply@empresa.com.br"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="smtp-password">Senha SMTP</Label>
                    <Input
                      id="smtp-password"
                      type="password"
                      defaultValue="••••••••••••"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="smtp-from">E-mail Remetente Padrão</Label>
                  <Input
                    id="smtp-from"
                    defaultValue="noreply@empresa.com.br"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="smtp-encryption">Tipo de Criptografia</Label>
                  <Select defaultValue="tls">
                    <SelectTrigger className="mt-2" id="smtp-encryption">
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
                      placeholder="syslog.example.com"
                      defaultValue="syslog.empresa.com.br"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="syslog-port">Porta</Label>
                    <Input
                      id="syslog-port"
                      type="number"
                      defaultValue="514"
                      className="mt-2"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="syslog-protocol">Protocolo</Label>
                    <Select defaultValue="udp">
                      <SelectTrigger className="mt-2" id="syslog-protocol">
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
                    <Select defaultValue="local0">
                      <SelectTrigger className="mt-2" id="syslog-facility">
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
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Conectado
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="ms365-tenant">Tenant ID</Label>
                      <Input
                        id="ms365-tenant"
                        defaultValue="abc123-def456-ghi789"
                        className="mt-2"
                      />
                    </div>
                    <div>
                      <Label htmlFor="ms365-client">Client ID</Label>
                      <Input
                        id="ms365-client"
                        defaultValue="xyz789-uvw456-rst123"
                        className="mt-2"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="ms365-secret">Client Secret</Label>
                    <Input
                      id="ms365-secret"
                      type="password"
                      defaultValue="••••••••••••••••••••"
                      className="mt-2"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Sincronização Automática</p>
                      <p className="text-xs text-gray-500">
                        Última sincronização: 08/03/2026 às 06:00 (156 usuários)
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleSyncUsers('Microsoft 365')}
                      disabled={isLoading}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Sincronizar Agora
                    </Button>
                    <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </div>
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
                  <Badge variant="outline">Não Conectado</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="google-json">Service Account JSON</Label>
                    <Textarea
                      id="google-json"
                      placeholder="Cole o conteúdo do arquivo JSON da Service Account"
                      rows={6}
                      className="mt-2 font-mono text-xs"
                    />
                  </div>

                  <div>
                    <Label htmlFor="google-domain">Domínio Google Workspace</Label>
                    <Input
                      id="google-domain"
                      placeholder="empresa.com.br"
                      className="mt-2"
                    />
                  </div>

                  <Button className="bg-[#834a8b] hover:bg-[#6d3d75]">
                    <Link className="w-4 h-4 mr-2" />
                    Conectar Google Workspace
                  </Button>
                </div>
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