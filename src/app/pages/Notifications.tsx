import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
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
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import {
  Bell,
  BellOff,
  Search,
  Trash2,
  CheckCheck,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  TrendingUp,
  Mail,
  Users,
  Shield,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Notification {
  id: string;
  type: 'success' | 'warning' | 'error' | 'info';
  category: 'campaign' | 'user' | 'system' | 'security' | 'training';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'success',
    category: 'campaign',
    title: 'Campanha "Black Friday" finalizada',
    message: 'A campanha foi concluída com sucesso. 156 de 200 alvos clicaram no link (78% taxa de clique).',
    read: false,
    createdAt: '2026-03-08T08:30:00Z',
    actionUrl: '/campaigns/cmp-123',
    metadata: { campaignId: 'cmp-123', clickRate: 78 },
  },
  {
    id: 'notif-2',
    type: 'warning',
    category: 'user',
    title: 'Alto número de capturas detectado',
    message: 'O usuário joão.silva@empresa.com.br inseriu credenciais em 3 campanhas diferentes nas últimas 24h.',
    read: false,
    createdAt: '2026-03-08T07:15:00Z',
    actionUrl: '/users/usr-456',
    metadata: { userId: 'usr-456', captureCount: 3 },
  },
  {
    id: 'notif-3',
    type: 'info',
    category: 'training',
    title: 'Novo treinamento disponível',
    message: 'O treinamento "Identificando Phishing Avançado" foi publicado e está disponível para todos os usuários.',
    read: false,
    createdAt: '2026-03-07T16:45:00Z',
    actionUrl: '/trainings/trn-789',
  },
  {
    id: 'notif-4',
    type: 'error',
    category: 'system',
    title: 'Falha na integração Microsoft 365',
    message: 'Erro ao sincronizar usuários do Azure AD. Verifique as credenciais de API.',
    read: true,
    createdAt: '2026-03-07T14:20:00Z',
    actionUrl: '/settings/integrations',
  },
  {
    id: 'notif-5',
    type: 'success',
    category: 'user',
    title: '15 novos usuários sincronizados',
    message: 'Sincronização automática do Google Workspace concluída com sucesso.',
    read: true,
    createdAt: '2026-03-07T10:00:00Z',
  },
  {
    id: 'notif-6',
    type: 'info',
    category: 'security',
    title: 'Relatório mensal de segurança',
    message: 'O relatório de março está disponível. Taxa geral de comprometimento: 42%.',
    read: true,
    createdAt: '2026-03-06T09:00:00Z',
    actionUrl: '/reports/monthly',
  },
  {
    id: 'notif-7',
    type: 'warning',
    category: 'campaign',
    title: 'Campanha com baixa taxa de abertura',
    message: 'A campanha "Atualização RH" tem apenas 12% de taxa de abertura após 48h.',
    read: true,
    createdAt: '2026-03-05T18:30:00Z',
    actionUrl: '/campaigns/cmp-999',
  },
];

export function Notifications() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user, impersonatedTenant } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(mockNotifications);
  const [activeTab, setActiveTab] = useState('all');

  const filteredNotifications = notifications.filter((notif) => {
    const matchesSearch =
      notif.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notif.message.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'unread' && !notif.read) ||
      (activeTab === 'read' && notif.read) ||
      notif.category === activeTab;

    return matchesSearch && matchesTab;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleMarkAsRead = (notifId: string) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === notifId ? { ...notif, read: true } : notif
      )
    );
    toast.success(t('notifications.messages.markedAsRead'));
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
    toast.success(t('notifications.messages.allMarkedAsRead'));
  };

  const handleDelete = (notifId: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== notifId));
    toast.success(t('notifications.messages.deleted'));
  };

  const handleDeleteAll = () => {
    const readNotifications = notifications.filter((n) => n.read);
    setNotifications((prev) => prev.filter((notif) => !notif.read));
    toast.success(t('notifications.messages.allReadDeleted', { count: readNotifications.length }));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-orange-600" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'campaign':
        return <Mail className="w-4 h-4" />;
      case 'user':
        return <Users className="w-4 h-4" />;
      case 'system':
        return <Settings className="w-4 h-4" />;
      case 'security':
        return <Shield className="w-4 h-4" />;
      case 'training':
        return <TrendingUp className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getCategoryLabel = (category: string) => {
    const labels: Record<string, string> = {
      campaign: t('notifications.categories.campaign', 'Campanha'),
      user: t('notifications.categories.user', 'Usuário'),
      system: t('notifications.categories.system', 'Sistema'),
      security: t('notifications.categories.security', 'Segurança'),
      training: t('notifications.categories.training', 'Treinamento'),
    };
    return labels[category] || category;
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#242545] flex items-center gap-2">
              <Bell className="w-8 h-8" />
              {t('notifications.title', 'Notificações')}
            </h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">
              {t('notifications.subtitle', 'Central de alertas e atualizações da plataforma')}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4 mr-2" />
              {t('notifications.actions.markAllAsRead', 'Marcar Todas Como Lidas')}
            </Button>
            <Button
              variant="outline"
              onClick={handleDeleteAll}
              disabled={notifications.filter((n) => n.read).length === 0}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              {t('notifications.actions.clearRead', 'Limpar Lidas')}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('common.total', 'Total')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#242545]">
              {notifications.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('notifications.stats.unread', 'Não Lidas')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{unreadCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('notifications.stats.warnings', 'Avisos')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {notifications.filter((n) => n.type === 'warning').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-600">{t('notifications.stats.errors', 'Erros')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {notifications.filter((n) => n.type === 'error').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder={t('notifications.searchPlaceholder', 'Buscar notificações...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>{t('notifications.list.title', 'Lista de Notificações')}</CardTitle>
          <CardDescription>
            {t('notifications.list.count', { count: filteredNotifications.length })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">
                {t('notifications.tabs.all', 'Todas')}
                {notifications.length > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {notifications.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="unread">
                {t('notifications.tabs.unread', 'Não Lidas')}
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100 text-blue-700">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="campaign">
                <Mail className="w-4 h-4 mr-1" />
                {t('notifications.categories.campaign', 'Campanhas')}
              </TabsTrigger>
              <TabsTrigger value="security">
                <Shield className="w-4 h-4 mr-1" />
                {t('notifications.categories.security', 'Segurança')}
              </TabsTrigger>
              <TabsTrigger value="system">
                <Settings className="w-4 h-4 mr-1" />
                {t('notifications.categories.system', 'Sistema')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="space-y-3 mt-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12">
                  <BellOff className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">{t('notifications.list.empty', 'Nenhuma notificação encontrada')}</p>
                </div>
              ) : (
                filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-4 rounded-lg border transition-all ${
                      notif.read
                        ? 'bg-white border-gray-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">{getIcon(notif.type)}</div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-[#242545]">
                                {notif.title}
                              </h3>
                              {!notif.read && (
                                <Badge className="bg-blue-100 text-blue-700 text-xs">
                                  {t('common.new', 'Nova')}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {notif.message}
                            </p>
                            <div className="flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                {getCategoryIcon(notif.category)}
                                <span>{getCategoryLabel(notif.category)}</span>
                              </div>
                              <span>•</span>
                              <span>
                                {formatDistanceToNow(new Date(notif.createdAt), {
                                  addSuffix: true,
                                  locale: ptBR,
                                })}
                              </span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            {!notif.read && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notif.id)}
                                title={t('notifications.actions.markAsRead', 'Marcar como lida')}
                              >
                                <CheckCheck className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(notif.id)}
                              title={t('common.remove', 'Remover')}
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </div>

                        {notif.actionUrl && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => {
                              // If it's a relative internal link, navigate. Otherwise window.open
                              if (notif.actionUrl!.startsWith('/')) {
                                navigate(notif.actionUrl!);
                              } else {
                                window.open(notif.actionUrl, '_blank');
                              }
                            }}
                          >
                            {t('common.viewDetails', 'Ver Detalhes')}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
