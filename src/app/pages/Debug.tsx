import React, { useState } from 'react';
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
    message: 'Login realizado com sucesso via Keycloak',
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('smtp');

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
            Sucesso
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Falha
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
      smtp: mockSMTPLogs,
      auth: mockAuthLogs,
      system: mockSystemLogs,
      metadata: {
        totalLogs: mockSMTPLogs.length + mockAuthLogs.length + mockSystemLogs.length,
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

    toast.success('Logs exportados com sucesso!', {
      description: `${allLogs.metadata.totalLogs} registros exportados em JSON`,
    });
  };

  const exportLogsCSV = () => {
    // Criar CSV combinado de todos os logs
    let csvContent = 'Tipo,Timestamp,Campo1,Campo2,Campo3,Campo4,Status,Mensagem\n';
    
    // SMTP Logs
    mockSMTPLogs.forEach(log => {
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
    mockAuthLogs.forEach(log => {
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
    mockSystemLogs.forEach(log => {
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

    const totalLogs = mockSMTPLogs.length + mockAuthLogs.length + mockSystemLogs.length;
    toast.success('Logs exportados com sucesso!', {
      description: `${totalLogs} registros exportados em CSV`,
    });
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Modo Debug</h1>
            <p className="text-gray-500 mt-1">
              Logs operacionais, falhas de SMTP e auditoria de autenticação
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Atualizar
            </Button>
            <Button variant="outline" onClick={exportLogs}>
              <Download className="w-4 h-4 mr-2" />
              Exportar JSON
            </Button>
            <Button variant="outline" onClick={exportLogsCSV}>
              <Download className="w-4 h-4 mr-2" />
              Exportar CSV
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
                Erros SMTP (24h)
              </CardTitle>
              <Mail className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">23</div>
            <p className="text-xs text-gray-500 mt-1">3 autenticação, 20 bounce</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Falhas de Login
              </CardTitle>
              <Shield className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">8</div>
            <p className="text-xs text-gray-500 mt-1">Últimas 24 horas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">
                Erros de Sistema
              </CardTitle>
              <Server className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">5</div>
            <p className="text-xs text-gray-500 mt-1">2 críticos, 3 warnings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-gray-600">Uptime</CardTitle>
              <Clock className="w-4 h-4 text-gray-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">99.8%</div>
            <p className="text-xs text-gray-500 mt-1">Últimos 30 dias</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Buscar logs por campanha, usuário ou mensagem..."
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
            SMTP Logs
          </TabsTrigger>
          <TabsTrigger value="auth" onClick={() => scrollToTab('auth')}>
            <Shield className="w-4 h-4 mr-2" />
            Autenticação
          </TabsTrigger>
          <TabsTrigger value="system" onClick={() => scrollToTab('system')}>
            <Server className="w-4 h-4 mr-2" />
            Sistema
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
                  {mockSMTPLogs.map((log) => (
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
                Histórico de logins, impersonations e renovações de token via Keycloak
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
                  {mockAuthLogs.map((log) => (
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
                  {mockSystemLogs.map((log) => (
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
      </Tabs>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <Card className="bg-red-50 border-red-200">
          <CardHeader>
            <CardTitle className="text-base">Erros Críticos</CardTitle>
            <CardDescription className="text-gray-700">Requerem atenção imediata</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600 mb-2">2</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                scrollToTab('system');
                toast.info('Filtrado por erros críticos', {
                  description: 'Visualizando logs de sistema com nível "error"'
                });
              }}
            >
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-orange-50 border-orange-200">
          <CardHeader>
            <CardTitle className="text-base">Avisos</CardTitle>
            <CardDescription className="text-gray-700">Situações a monitorar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600 mb-2">8</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                scrollToTab('system');
                toast.info('Filtrado por avisos', {
                  description: 'Visualizando logs de sistema com nível "warning"'
                });
              }}
            >
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base">Performance</CardTitle>
            <CardDescription className="text-gray-700">Métricas de resposta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 mb-2">145ms</div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full"
              onClick={() => {
                toast.success('Métricas de Performance', {
                  description: 'Tempo médio de resposta da API: 145ms'
                });
              }}
            >
              Ver Detalhes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}