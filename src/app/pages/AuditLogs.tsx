import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
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
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import {
  FileText,
  Search,
  Download,
  Filter,
  User,
  Settings,
  Shield,
  Mail,
  Trash2,
  Edit,
  Eye,
  LogIn,
  LogOut,
  AlertCircle,
  Server,
  Send,
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId: string;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure' | 'warning';
  details: string;
  category: 'auth' | 'user' | 'campaign' | 'system' | 'security';
}

const mockAuditLogs: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: '2026-03-08T10:30:15Z',
    userId: 'usr-admin',
    userName: 'Admin Master',
    userEmail: 'admin@underprotection.com.br',
    action: 'LOGIN',
    resource: 'auth',
    resourceId: 'session-abc123',
    ipAddress: '177.28.105.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    details: 'Login realizado via Keycloak SSO',
    category: 'auth',
  },
  {
    id: 'log-2',
    timestamp: '2026-03-08T10:28:42Z',
    userId: 'usr-admin',
    userName: 'Admin Master',
    userEmail: 'admin@underprotection.com.br',
    action: 'CREATE_CAMPAIGN',
    resource: 'campaign',
    resourceId: 'cmp-789',
    ipAddress: '177.28.105.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    details: 'Campanha "Black Friday Test" criada com 200 alvos',
    category: 'campaign',
  },
  {
    id: 'log-3',
    timestamp: '2026-03-08T10:25:18Z',
    userId: 'usr-123',
    userName: 'João Silva',
    userEmail: 'joao.silva@empresa.com.br',
    action: 'UPDATE_USER',
    resource: 'user',
    resourceId: 'usr-456',
    ipAddress: '189.32.78.99',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    details: 'Perfil do usuário atualizado: telefone e cargo',
    category: 'user',
  },
  {
    id: 'log-4',
    timestamp: '2026-03-08T10:22:05Z',
    userId: 'usr-admin',
    userName: 'Admin Master',
    userEmail: 'admin@underprotection.com.br',
    action: 'DELETE_TEMPLATE',
    resource: 'template',
    resourceId: 'tpl-555',
    ipAddress: '177.28.105.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    details: 'Template "Promo Falsa" removido permanentemente',
    category: 'campaign',
  },
  {
    id: 'log-5',
    timestamp: '2026-03-08T10:18:33Z',
    userId: 'usr-999',
    userName: 'Usuário Desconhecido',
    userEmail: 'suspicious@hacker.com',
    action: 'LOGIN_ATTEMPT',
    resource: 'auth',
    resourceId: 'session-failed',
    ipAddress: '103.45.88.21',
    userAgent: 'curl/7.68.0',
    status: 'failure',
    details: 'Tentativa de login com credenciais inválidas (3ª tentativa)',
    category: 'security',
  },
  {
    id: 'log-6',
    timestamp: '2026-03-08T10:15:48Z',
    userId: 'usr-admin',
    userName: 'Admin Master',
    userEmail: 'admin@underprotection.com.br',
    action: 'UPDATE_SETTINGS',
    resource: 'system',
    resourceId: 'settings-smtp',
    ipAddress: '177.28.105.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    details: 'Configurações SMTP atualizadas',
    category: 'system',
  },
  {
    id: 'log-7',
    timestamp: '2026-03-08T10:12:20Z',
    userId: 'usr-222',
    userName: 'Maria Santos',
    userEmail: 'maria.santos@empresa.com.br',
    action: 'VIEW_REPORT',
    resource: 'report',
    resourceId: 'rpt-monthly',
    ipAddress: '200.155.32.44',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    details: 'Relatório mensal de março visualizado',
    category: 'campaign',
  },
  {
    id: 'log-8',
    timestamp: '2026-03-08T10:08:55Z',
    userId: 'usr-admin',
    userName: 'Admin Master',
    userEmail: 'admin@underprotection.com.br',
    action: 'EXPORT_DATA',
    resource: 'data',
    resourceId: 'export-users',
    ipAddress: '177.28.105.45',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'warning',
    details: 'Exportação de 500 registros de usuários (arquivo 2.5MB)',
    category: 'security',
  },
];

export function AuditLogs() {
  const { user, impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const filteredLogs = mockAuditLogs.filter((log) => {
    const matchesSearch =
      log.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.details.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExport = () => {
    toast.success('Logs exportados!', {
      description: 'O arquivo CSV foi baixado com sucesso',
    });
  };

  const handleSendToSyslog = () => {
    toast.success('Logs enviados via Syslog!', {
      description: `${filteredLogs.length} eventos foram enviados ao servidor Syslog`,
    });
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return <LogIn className="w-4 h-4" />;
    if (action.includes('LOGOUT')) return <LogOut className="w-4 h-4" />;
    if (action.includes('CREATE')) return <Edit className="w-4 h-4" />;
    if (action.includes('DELETE')) return <Trash2 className="w-4 h-4" />;
    if (action.includes('UPDATE')) return <Settings className="w-4 h-4" />;
    if (action.includes('VIEW')) return <Eye className="w-4 h-4" />;
    return <FileText className="w-4 h-4" />;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      auth: 'bg-blue-100 text-blue-700',
      user: 'bg-green-100 text-green-700',
      campaign: 'bg-purple-100 text-purple-700',
      system: 'bg-gray-100 text-gray-700',
      security: 'bg-red-100 text-red-700',
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      auth: 'Autenticação',
      user: 'Usuário',
      campaign: 'Campanha',
      system: 'Sistema',
      security: 'Segurança',
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-700">
            Sucesso
          </Badge>
        );
      case 'failure':
        return (
          <Badge className="bg-red-100 text-red-700">
            Falha
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-orange-100 text-orange-700">
            Aviso
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545] flex items-center gap-2">
              <FileText className="w-8 h-8" />
              Logs de Auditoria
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              Rastreamento completo de todas as ações na plataforma
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSendToSyslog}
              variant="outline"
              className="border-[#242545] text-[#242545] hover:bg-[#242545] hover:text-white"
            >
              <Server className="w-4 h-4 mr-2" />
              Enviar via Syslog
            </Button>
            <Button onClick={handleExport} className="bg-[#834a8b] hover:bg-[#6d3d75]">
              <Download className="w-4 h-4 mr-2" />
              Exportar Logs
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Total de Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">
              {mockAuditLogs.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Sucessos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {mockAuditLogs.filter((l) => l.status === 'success').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Falhas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {mockAuditLogs.filter((l) => l.status === 'failure').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">Avisos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {mockAuditLogs.filter((l) => l.status === 'warning').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Buscar logs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Categorias</SelectItem>
                <SelectItem value="auth">Autenticação</SelectItem>
                <SelectItem value="user">Usuário</SelectItem>
                <SelectItem value="campaign">Campanha</SelectItem>
                <SelectItem value="system">Sistema</SelectItem>
                <SelectItem value="security">Segurança</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="success">Sucesso</SelectItem>
                <SelectItem value="failure">Falha</SelectItem>
                <SelectItem value="warning">Aviso</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Registro de Atividades</CardTitle>
          <CardDescription>
            {filteredLogs.length} eventos registrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Ação</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Detalhes</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">Nenhum log encontrado</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs">
                      <div>
                        <div className="font-medium">
                          {format(new Date(log.timestamp), 'dd/MM/yyyy')}
                        </div>
                        <div className="text-gray-500">
                          {format(new Date(log.timestamp), 'HH:mm:ss')}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium text-sm">{log.userName}</div>
                          <div className="text-xs text-gray-500">{log.userEmail}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getActionIcon(log.action)}
                        <span className="font-mono text-xs">{log.action}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getCategoryColor(log.category)}>
                        {getCategoryLabel(log.category)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm max-w-xs truncate" title={log.details}>
                        {log.details}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-600">
                      {log.ipAddress}
                    </TableCell>
                    <TableCell>{getStatusBadge(log.status)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}