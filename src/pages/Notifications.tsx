import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { useNotifications, Notification } from "@/hooks/use-notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, FileText, Eye, MailOpen } from "lucide-react";
import { Button } from "@/components/Button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const NotificationItem: React.FC<{ notification: Notification; onMarkRead: (id: string) => void }> = ({ notification, onMarkRead }) => {
  const { t } = useLanguage();

  const Icon = notification.type === 'report_submission' ? FileText : Eye;
  const variantClass = notification.is_read ? "bg-muted/50 text-muted-foreground" : "bg-card shadow-md hover:bg-accent/10 transition-colors duration-300";

  return (
    <div className={cn(
      "flex items-start p-4 border-b last:border-b-0 transition-colors",
      variantClass
    )}>
      <div className={cn(
        "p-2 rounded-full mr-4",
        notification.is_read ? "bg-gray-700 text-gray-300" : "bg-primary text-primary-foreground neon-glow"
      )}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-grow">
        <p className={cn(
          "font-medium",
          notification.is_read ? "text-muted-foreground" : "text-foreground"
        )}>
          {notification.message}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
        </p>
      </div>
      {!notification.is_read && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onMarkRead(notification.id)}
          className="ml-4 flex-shrink-0 text-accent hover:text-accent/80"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          {t('read')}
        </Button>
      )}
    </div>
  );
};

const Notifications = () => {
  const {
    data: notifications,
    isLoading,
    isError,
    error,
    markAllAsRead,
    markAsReadMutation,
    unreadCount
  } = useNotifications();

  const { t } = useLanguage();

  const handleMarkRead = (id: string) => {
    markAsReadMutation.mutate([id]);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">{t('notifications')}</h1>
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">{t('notifications')}</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('error_loading_notifications')}</AlertTitle>
          <AlertDescription>
            {t('failed_to_load_notifications')}: {error?.message || t('unknown_error')}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold tracking-wider text-gradient">{t('notifications')} ({unreadCount} {t('unread')})</h1>
        {unreadCount > 0 && (
          <Button
            onClick={markAllAsRead}
            variant="outline"
            size="sm"
            disabled={markAsReadMutation.isPending}
          >
            <MailOpen className="h-4 w-4 mr-2" />
            {t('mark_all_read')}
          </Button>
        )}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{t('recent_alerts')}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notifications && notifications.length > 0 ? (
            <ScrollArea className="h-[500px]">
              <div className="divide-y divide-border">
                {notifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkRead={handleMarkRead}
                  />
                ))}
              </div>
            </ScrollArea>
          ) : (
            <p className="p-6 text-muted-foreground">{t('no_notifications')}</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Notifications;