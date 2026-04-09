import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { getAuditLogs } from '../lib/apiLocal';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Mail,
  Shield,
  Server,
  Clock,
  Bug,
  Search,
  RefreshCw,
  Download,
  CheckCircle,
  XCircle,
  AlertCircle,
  Brain,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

// Mock data para logs de debug
const mockSMTPLogs = [
  {
    id: 'log-1',
    timestamp: '2026-03-06T14:35:22Z',
    campaign: 'Campanha Q1 2026 - Phishing Geral',
    target: 'joao.silva@banconacional.com.br',
    status: 'success',
    message: 'E-mail enviado com sucesso',
  },
  {
    id: 'log-2',
    timestamp: '2026-03-06T14:35:23Z',
    campaign: 'Campanha Q1 2026 - Phishing Geral',
    target: 'maria.santos@banconacional.com.br',
    status: 'bounced',
    message: 'Mailbox full - 552 5.2.2',
  },
  {
    id: 'log-3',
    timestamp: '2026-03-06T14:35:24Z',
    campaign: 'Campanha Q1 2026 - Phishing Geral',
    target: 'pedro.oliveira@banconacional.com.br',
    status: 'failed',
    message: 'Authentication failed - Invalid SMTP credentials',
  },
  {
    id: 'log-4',
    timestamp: '2026-03-06T14:35:25Z',
    campaign: 'Boas-vindas Automático',
    target: 'ana.costa@techcorp.com.br',
    status: 'success',
    message: 'E-mail enviado com sucesso',
  },
  {
    id: 'log-5',
    timestamp: '2026-03-06T14:35:26Z',
    campaign: 'Boas-vindas Automático',
    target: 'carlos.souza@techcorp.com.br',
    status: 'failed',
    message: 'Connection timeout - SMTP server não respondeu',
  },
];

const mockAuthLogs = [
  {
    id: 'auth-1',
    timestamp: '2026-03-06T15:20:10Z',
    user: 'igor@underprotection.com.br',
    action: 'login',
    status: 'success',
    ip: '192.168.1.10',
    message: 'Login realizado com sucesso via Microsoft Entra ID',
  },
  {
    id: 'auth-2',
    timestamp: '2026-03-06T15:18:45Z',
    user: 'admin@banconacional.com.br',
    action: 'login',
    status: 'failed',
    ip: '10.0.0.45',
    message: 'Invalid credentials - Senha incorreta',
  },
  {
    id: 'auth-3',
    timestamp: '2026-03-06T15:15:30Z',
    user: 'igor@underprotection.com.br',
    action: 'impersonate',
    status: 'success',
    ip: '192.168.1.10',
    message: 'Impersonation iniciado - Tenant: Banco Nacional S.A.',
  },
  {
    id: 'auth-4',
    timestamp: '2026-03-06T15:10:00Z',
    user: 'gestor@techcorp.com.br',
    action: 'token_refresh',
    status: 'success',
    ip: '172.16.0.20',
    message: 'Token JWT renovado com sucesso',
  },
];

const mockSystemLogs = [
  {
    id: 'sys-1',
    timestamp: '2026-03-06T14:00:00Z',
    service: 'Backend API',
    level: 'info',
    message: 'Scheduler iniciado - Próxima execução em 5 minutos',
  },
  {
    id: 'sys-2',
    timestamp: '2026-03-06T13:45:30Z',
    service: 'Redis Worker',
    level: 'warning',
    message: 'Fila smtp_queue com 250 itens pendentes - Possível gargalo',
  },
  {
    id: 'sys-3',
    timestamp: '2026-03-06T13:30:15Z',
    service: 'PostgreSQL',
    level: 'error',
    message: 'Query lenta detectada - tracking_events (2.3s)',
  },
  {
    id: 'sys-4',
    timestamp: '2026-03-06T13:15:00Z',
    service: 'Nginx',
    level: 'info',
    message: 'SSL certificate renovado - Válido até 06/06/2026',
  },
];

export function Debug() {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('smtp');
  const [aiLogs, setAiLogs] = useState<any[]>([]);
  const [smtpLogs, setSmtpLogs] = useState<any[]>([]);
  const [authLogs, setAuthLogs] = useState<any[]>([]);
  const [systemLogs, setSystemLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchLogsForTab(selectedTab);
  }, [selectedTab]);

  const fetchLogsForTab = async (tab: string) => {
    setIsLoading(true);
    try {
      if (tab === 'ai') {
        const data = await getAuditLogs({ action: 'ai_generation' });
        setAiLogs(data || []);
      } else if (tab === 'smtp') {
        const data = await getAuditLogs({ action: 'create' });
        // Filter for campaign-related events
        setSmtpLogs((data || []).filter((l: any) => 
          l.category === 'campaign_event' || l.action === 'create'
        ).map((l: any) => ({
          id: l.id,
          timestamp: l.timestamp,
          campaign: l.details?.campaign_name || l.resource_type || '-',
          target: l.details?.target_email || '-',
          status: l.status || 'success',
          message: typeof l.details === 'object' ? (l.details?.message || l.details?.error || 'Operação registrada') : (l.details || '-'),
        })));
      } else if (tab === 'auth') {
        const data = await getAuditLogs({ action: 'login' });
        setAuthLogs((data || []).map((l: any) => ({
          id: l.id,
          timestamp: l.timestamp,
          user: l.userEmail || l.userName || '-',
          action: l.action || 'login',
          status: l.status || 'success',
          ip: l.ipAddress || '127.0.0.1',
          message: typeof l.details === 'object' ? JSON.stringify(l.details).substring(0, 100) : (l.details || '-'),
        })));
      } else if (tab === 'system') {
        const data = await getAuditLogs({});
        setSystemLogs((data || []).slice(0, 20).map((l: any) => ({
          id: l.id,
          timestamp: l.timestamp,
          service: l.category || l.resource_type || 'Backend API',
          level: l.status === 'failure' ? 'error' : (l.status === 'warning' ? 'warning' : 'info'),
          message: typeof l.details === 'object' ? JSON.stringify(l.details).substring(0, 150) : (l.details || '-'),
        })));
      }
    } catch (error) {
      console.error(`Failed to fetch ${tab} logs:`, error);
      toast.error(t('debug.fetchError', 'Erro ao carregar logs'));
    } finally {
      setIsLoading(false);
    }
  };

  const scrollToTab = (tab: string) => {
    setSelectedTab(tab);
    // Scroll suave para a seção de tabs
    setTimeout(() => {
      const tabsElement = document.getElementById('debug-tabs');
      if (tabsElement) {
        tabsElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            {t('common.success', 'Sucesso')}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            {t('common.failed', 'Falha')}
          </Badge>
        );
      case 'bounced':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            <AlertCircle className="w-3 h-3 mr-1" />
            Bounced
          </Badge>
        );
      default:
        return null;
    }
  };

  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'info':
        return (
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            Info
          </Badge>
        );
      case 'warning':
        return (
          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
            Warning
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Error
          </Badge>
        );
      default:
        return null;
    }
  };

  const exportLogs = () => {
    const allLogs = {
      exportDate: new Date().toISOString(),
      smtp: smtpLogs,
      auth: authLogs,
      system: systemLogs,
      metadata: {
        totalLogs: smtpLogs.length + authLogs.length + systemLogs.length,
        searchQuery: searchQuery || 'none',
      }
    };

    const dataStr = JSON.stringify(allLogs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `matreiro-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success(t('debug.messages.exportSuccess', 'Logs exportados com sucesso!'), {
      description: t('debug.messages.exportDescJSON', { count: allLogs.metadata.totalLogs, defaultValue: `${allLogs.metadata.totalLogs} registros exportados em JSON` }),
    });
  };

  const exportLogsCSV = () => {
    // Criar CSV combinado de todos os logs
    let csvContent = 'Tipo,Timestamp,Campo1,Campo2,Campo3,Campo4,Status,Mensagem\n';
    
    // SMTP Logs
    smtpLogs.forEach(log => {
      const row = [
        'SMTP',
        format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss'),
        log.campaign,
        log.target,
        '',
        '',
        log.status,
        log.message
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      csvContent += row + '\n';
    });

    // Auth Logs
    authLogs.forEach(log => {
      const row = [
        'AUTH',
        format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss'),
        log.user,
        log.action,
        log.ip,
        '',
        log.status,
        log.message
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      csvContent += row + '\n';
    });

    // System Logs
    systemLogs.forEach(log => {
      const row = [
        'SYSTEM',
        format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss'),
        log.service,
        log.level,
        '',
        '',
        log.level,
        log.message
      ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
      csvContent += row + '\n';
    });

    const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `matreiro-logs-${format(new Date(), 'yyyy-MM-dd-HHmmss')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    const totalLogs = smtpLogs.length + authLogs.length + systemLogs.length;
    toast.success(t('debug.messages.exportSuccess', 'Logs exportados com sucesso!'), {
      description: t('debug.messages.exportDescCSV', { count: totalLogs, defaultValue: `${totalLogs} registros exportados em CSV` }),
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t('debug.title', 'Modo Debug')}</h1>
            <p className="text-gray-500 mt-1">
              {t('debug.subtitle', 'Logs operacionais, falhas de SMTP e auditoria de autenticação')}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              {t('common.refresh', 'Atualizar')}
            </Button>
            <Button variant="outline" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" />
              {t('debug.actions.exportJson', 'Exportar JSON')}
            </Button>
            <Button variant="outline" onClick={exportLogsCSV}>
              <Download className="w-4 h-4 mr-2" />
              {t('debug.actions.exportCsv', 'Exportar CSV')}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('debug.stats.smtpErrors', 'Erros SMTP (24h)')}
              </CardTitle>
              <Mail className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">23</div>
            <p className="text-xs text-gray-500 mt-1">{t('debug.stats.smtpErrorsDesc', '3 autenticação, 20 bounce')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('debug.stats.loginFailures', 'Falhas de Login')}
              </CardTitle>
              <Shield className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">8</div>
            <p className="text-xs text-gray-500 mt-1">{t('debug.stats.last24h', 'Últimas 24 horas')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                {t('debug.stats.systemErrors', 'Erros de Sistema')}
              </CardTitle>
              <Server className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">5</div>
            <p className="text-xs text-gray-500 mt-1">{t('debug.stats.systemErrorsDesc', '2 críticos, 3 warnings')}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">{t('debug.stats.uptime', 'Uptime')}</CardTitle>
              <Clock className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.8%</div>
            <p className="text-xs text-gray-500 mt-1">{t('debug.stats.last30days', 'Últimos 30 dias')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={t('debug.searchPlaceholder', 'Buscar logs por campanha, usuário ou mensagem...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Debug Tabs */}
      <Tabs defaultValue="smtp" className="space-y-4" id="debug-tabs">
        <TabsList>
          <TabsTrigger value="smtp" onClick={() => scrollToTab('smtp')}>
            <Mail className="w-4 h-4 mr-2" />
            {t('debug.tabs.smtp', 'SMTP Logs')}
          </TabsTrigger>
          <TabsTrigger value="auth" onClick={() => scrollToTab('auth')}>
            <Shield className="w-4 h-4 mr-2" />
            {t('debug.tabs.auth', 'Autenticação')}
          </TabsTrigger>
          <TabsTrigger value="system" onClick={() => scrollToTab('system')}>
            <Server className="w-4 h-4 mr-2" />
            {t('debug.tabs.system', 'Sistema')}
          </TabsTrigger>
          <TabsTrigger value="ai" onClick={() => scrollToTab('ai')}>
            <Brain className="w-4 h-4 mr-2" />
            AI Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="smtp">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Entrega SMTP</CardTitle>
              <CardDescription>
                Registro detalhado de todos os disparos de e-mail e seus status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Campanha</TableHead>
                    <TableHead>Destinatário</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mensagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {smtpLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs font-mono">
                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell className="text-sm">{log.campaign}</TableCell>
                      <TableCell className="text-sm font-mono">{log.target}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">{log.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="auth">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Autenticação</CardTitle>
              <CardDescription>
                Histórico de logins, impersonations e renovações de token via Entra ID
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>IP</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Mensagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {authLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs font-mono">
                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell className="text-sm">{log.user}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-xs">
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs font-mono">{log.ip}</TableCell>
                      <TableCell>{getStatusBadge(log.status)}</TableCell>
                      <TableCell className="text-sm text-gray-600">{log.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Sistema</CardTitle>
              <CardDescription>
                Eventos operacionais de todos os serviços da plataforma
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Serviço</TableHead>
                    <TableHead>Nível</TableHead>
                    <TableHead>Mensagem</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {systemLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-xs font-mono">
                        {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Bug className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium">{log.service}</span>
                        </div>
                      </TableCell>
                      <TableCell>{getLevelBadge(log.level)}</TableCell>
                      <TableCell className="text-sm text-gray-600">{log.message}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Logs da API de IA (LLMs)</CardTitle>
                  <CardDescription>
                    Registre as requisições enviadas ao provedor de IA e a resposta crua recebida
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => fetchLogsForTab('ai')} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Provedor</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Raw Output</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {aiLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-4 text-gray-500">
                        {isLoading ? 'Carregando logs de IA...' : 'Nenhum log de IA encontrado. Gere um template com IA para ver os logs aqui.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    aiLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-xs font-mono">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                            {log.details?.provider || 'Unknown'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Success
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <details className="cursor-pointer">
                            <summary className="text-xs text-blue-600 font-medium">Ver JSON Retornado</summary>
                            <pre className="mt-2 p-2 bg-gray-50 rounded text-[10px] w-full max-w-[400px] max-h-[150px] overflow-auto whitespace-pre-wrap">
                              {log.details?.raw_response || 'No response recorded'}
                            </pre>
                          </details>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-base">{t('debug.quickActions.criticalErrors', 'Erros Críticos')}</CardTitle>
            <CardDescription className="text-gray-700">{t('debug.quickActions.criticalDesc', 'Requerem atenção imediata')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 mb-2">2</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                scrollToTab('system');
                toast.info(t('debug.messages.filterCritical', 'Filtrado por erros críticos'), {
                  description: t('debug.messages.filterCriticalDesc', 'Visualizando logs de sistema com nível "error"')
                });
              }}
            >
              {t('common.viewDetails', 'Ver Detalhes')}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-base">{t('debug.quickActions.warnings', 'Avisos')}</CardTitle>
            <CardDescription className="text-gray-700">{t('debug.quickActions.warningsDesc', 'Situações a monitorar')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">8</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                scrollToTab('system');
                toast.info(t('debug.messages.filterWarnings', 'Filtrado por avisos'), {
                  description: t('debug.messages.filterWarningsDesc', 'Visualizando logs de sistema com nível "warning"')
                });
              }}
            >
              {t('common.viewDetails', 'Ver Detalhes')}
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">{t('debug.quickActions.performance', 'Performance')}</CardTitle>
            <CardDescription className="text-gray-700">{t('debug.quickActions.performanceDesc', 'Métricas de resposta')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">145ms</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                toast.success(t('debug.messages.performanceMetrics', 'Métricas de Performance'), {
                  description: t('debug.messages.performanceMetricsDesc', 'Tempo médio de resposta da API: 145ms')
                });
              }}
            >
              {t('common.viewDetails', 'Ver Detalhes')}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}