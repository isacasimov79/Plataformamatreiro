import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, Target, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  userId: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'phishing_alert';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: string;
  readAt?: string;
}

// Mock notifications para desenvolvimento
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'success',
    title: 'Campanha concluída',
    message: 'Sua campanha "Q1 Security Awareness" foi concluída com sucesso.',
    read: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'phishing_alert',
    title: 'Nova tentativa de phishing detectada',
    message: '3 colaboradores clicaram no link da última campanha.',
    read: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'notif-3',
    userId: 'user-1',
    type: 'warning',
    title: 'Treinamento pendente',
    message: '15 colaboradores ainda não completaram o treinamento obrigatório.',
    read: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
];

export function NotificationCenter() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [useMockData, setUseMockData] = useState(true); // Flag para usar dados mock

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-99a65fc7`;

  useEffect(() => {
    // Calcular unread count dos dados mock
    setUnreadCount(notifications.filter(n => !n.read).length);
    
    // Tentar buscar dados reais apenas se não estiver usando mock
    if (!useMockData) {
      fetchNotifications();
      // Poll for new notifications every 30 seconds
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [useMockData]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch(`${API_URL}/notifications/user-1`, {
        headers: { 'Authorization': `Bearer ${publicAnonKey}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      const notifs = data.notifications || [];
      
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
      setUseMockData(false); // Se conseguiu buscar, desativa mock
    } catch (error) {
      // Silenciosamente usar mock data se a API falhar
      // Isso evita logs de erro no console em desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        console.log('Using mock notifications (API not available)');
      }
      setUseMockData(true);
    }
  };

  const markAsRead = async (notificationId: string) => {
    // Atualizar localmente primeiro (otimistic update)
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    // Se não estiver usando mock, tentar atualizar no backend
    if (!useMockData) {
      try {
        await fetch(`${API_URL}/notifications/${notificationId}/read`, {
          method: 'PUT',
          headers: { 'Authorization': `Bearer ${publicAnonKey}` },
        });
      } catch (error) {
        console.log('Could not sync read status to server');
      }
    }
  };

  const markAllAsRead = async () => {
    setLoading(true);
    try {
      // Atualizar localmente
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      
      toast.success('Todas as notificações foram marcadas como lidas');
      
      // Se não estiver usando mock, tentar atualizar no backend
      if (!useMockData) {
        const unreadNotifs = notifications.filter(n => !n.read);
        for (const notif of unreadNotifs) {
          await fetch(`${API_URL}/notifications/${notif.id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${publicAnonKey}` },
          }).catch(() => {}); // Ignora erros
        }
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
      toast.error('Erro ao marcar notificações como lidas');
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'phishing_alert':
        return <Target className="h-5 w-5 text-orange-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900';
      case 'warning':
        return 'bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-900';
      case 'error':
        return 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900';
      case 'phishing_alert':
        return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900';
      default:
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m atrás`;
    if (hours < 24) return `${hours}h atrás`;
    if (days < 7) return `${days}d atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-600 text-white text-xs flex items-center justify-center font-bold">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center justify-between">
            <span>Notificações</span>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                disabled={loading}
              >
                <Check className="h-4 w-4 mr-1" />
                Marcar todas como lidas
              </Button>
            )}
          </SheetTitle>
          <SheetDescription>
            {unreadCount > 0 ? (
              `Você tem ${unreadCount} ${unreadCount === 1 ? 'notificação não lida' : 'notificações não lidas'}`
            ) : (
              'Você está em dia com suas notificações'
            )}
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-180px)] mt-6 pr-4">
          <div className="space-y-3">
            {notifications.length === 0 ? (
              <div className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-50 mb-4" />
                <p className="text-muted-foreground">Nenhuma notificação</p>
              </div>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    notification.read
                      ? 'bg-muted/30 border-muted opacity-70'
                      : getNotificationColor(notification.type)
                  }`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-semibold text-sm">
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <Badge variant="secondary" className="flex-shrink-0">
                            Novo
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatTime(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}