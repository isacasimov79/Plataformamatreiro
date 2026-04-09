import { useEffect, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Info, XCircle, Target, Check } from 'lucide-react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from './ui/sheet';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { toast } from 'sonner';
import { getNotifications, markNotificationRead, markAllNotificationsRead } from '../lib/apiLocal';
import { useTranslation } from 'react-i18next';

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'phishing_alert';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  created_at: string;
  read_at?: string;
}

export function NotificationCenter() {
  const { t } = useTranslation();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data: any = await getNotifications();
      const notifs = Array.isArray(data) ? data : (data?.results || []);
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: Notification) => !n.read).length);
    } catch (error) {
      // Silently handle - notifications are not critical
      console.log('Notifications not available');
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      await markNotificationRead(notificationId);
    } catch (error) {
      console.log('Could not sync read status to server');
    }
  };

  const handleMarkAllAsRead = async () => {
    setLoading(true);
    try {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
      await markAllNotificationsRead();
      toast.success('Todas as notificações foram marcadas como lidas');
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
                onClick={handleMarkAllAsRead}
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
                  onClick={() => !notification.read && handleMarkAsRead(String(notification.id))}
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
                        {formatTime(notification.created_at)}
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