import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
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
  details: Record<string, any> | string;
  category: 'auth' | 'user' | 'campaign' | 'system' | 'security' | string;
}

// Mock data removed in favor of real API connection

export function AuditLogs() {
  const { t } = useTranslation();
  const { user, impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/api/v1/audit/logs/');
        setAuditLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch audit logs:', error);
        toast.error('Erro ao carregar os registros de auditoria');
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, [impersonatedTenant]);

  const filteredLogs = auditLogs.filter((log) => {
    const detailsStr = typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || '');
    const matchesSearch =
      (log.userName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.userEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.action || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      detailsStr.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'all' || log.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || log.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleExport = () => {
    toast.success(t('audit.exportSuccessTitle'), {
      description: t('audit.exportSuccessDesc'),
    });
  };

  const handleSendToSyslog = () => {
    toast.success(t('audit.syslogSuccessTitle'), {
      description: t('audit.syslogSuccessDesc', { count: filteredLogs.length }),
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
      auth: t('audit.categories.auth'),
      user: t('audit.categories.user'),
      campaign: t('audit.categories.campaign'),
      system: t('audit.categories.system'),
      security: t('audit.categories.security'),
    };
    return labels[category] || category;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge className="bg-green-100 text-green-700">
            {t('audit.status.success')}
          </Badge>
        );
      case 'failure':
        return (
          <Badge className="bg-red-100 text-red-700">
            {t('audit.status.failure')}
          </Badge>
        );
      case 'warning':
        return (
          <Badge className="bg-orange-100 text-orange-700">
            {t('audit.status.warning')}
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
              {t('audit.title')}
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {t('audit.subtitle')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSendToSyslog}
              variant="outline"
              className="border-[#242545] text-[#242545] hover:bg-[#242545] hover:text-white"
            >
              <Server className="w-4 h-4 mr-2" />
              {t('audit.btnSyslog')}
            </Button>
            <Button onClick={handleExport} className="bg-[#834a8b] hover:bg-[#6d3d75]">
              <Download className="w-4 h-4 mr-2" />
              {t('audit.btnExport')}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('audit.stats.total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">
              {auditLogs.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('audit.stats.success')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {auditLogs.filter((l) => l.status === 'success').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('audit.stats.failures')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {auditLogs.filter((l) => l.status === 'failure').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('audit.stats.warnings')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {auditLogs.filter((l) => l.status === 'warning').length}
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
                placeholder={t('audit.filters.search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder={t('audit.filters.category')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('audit.filters.allCategories')}</SelectItem>
                <SelectItem value="auth">{t('audit.categories.auth')}</SelectItem>
                <SelectItem value="user">{t('audit.categories.user')}</SelectItem>
                <SelectItem value="campaign">{t('audit.categories.campaign')}</SelectItem>
                <SelectItem value="system">{t('audit.categories.system')}</SelectItem>
                <SelectItem value="security">{t('audit.categories.security')}</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder={t('audit.filters.status')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('audit.filters.allStatus')}</SelectItem>
                <SelectItem value="success">{t('audit.status.success')}</SelectItem>
                <SelectItem value="failure">{t('audit.status.failure')}</SelectItem>
                <SelectItem value="warning">{t('audit.status.warning')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>{t('audit.table.title')}</CardTitle>
          <CardDescription>
            {t('audit.table.desc', { count: filteredLogs.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('audit.table.colDate')}</TableHead>
                <TableHead>{t('audit.table.colUser')}</TableHead>
                <TableHead>{t('audit.table.colAction')}</TableHead>
                <TableHead>{t('audit.table.colCategory')}</TableHead>
                <TableHead>{t('audit.table.colDetails')}</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>{t('audit.table.colStatus')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-t-[#834a8b] border-gray-200 rounded-full animate-spin"></div>
                      <p className="text-gray-500">Carregando...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500">{t('audit.table.noLogsData')}</p>
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
                          <div className="font-medium text-sm">{log.userName || log.userEmail || 'Sistema'}</div>
                          <div className="text-xs text-gray-500">{log.userEmail || '-'}</div>
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
                      <div className="text-sm max-w-xs truncate" title={typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}>
                        {typeof log.details === 'object' && log.details ? (log.details?.endpoint || log.details?.provider || JSON.stringify(log.details).substring(0, 80)) : (log.details || '-')}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-gray-600">
                      {log.ipAddress || '127.0.0.1'}
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