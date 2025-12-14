import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNotifications, Notification } from "@/hooks/use-notifications";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle, FileText, Eye, MailOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

const NotificationItem: React.FC<{ notification: Notification; onMarkRead: (id: string) => void }> = ({ notification, onMarkRead }) => {
    const Icon = notification.type === 'report_submission' ? FileText : Eye;
    const variantClass = notification.is_read ? "bg-muted/50 text-muted-foreground" : "bg-card shadow-md hover:bg-accent/50";

    return (
        <div 
            className={cn(
                "flex items-start p-4 border-b last:border-b-0 transition-colors",
                variantClass
            )}
        >
            <div className={cn("p-2 rounded-full mr-4", notification.is_read ? "bg-gray-200" : "bg-primary text-primary-foreground")}>
                <Icon className="h-5 w-5" />
            </div>
            <div className="flex-grow">
                <p className={cn("font-medium", notification.is_read ? "text-muted-foreground" : "text-foreground")}>
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
                    className="ml-4 flex-shrink-0 text-primary hover:text-primary/80"
                >
                    <CheckCircle className="h-4 w-4 mr-1" /> Read
                </Button>
            )}
        </div>
    );
};

const Notifications = () => {
  const { data: notifications, isLoading, isError, error, markAllAsRead, markAsReadMutation, unreadCount } = useNotifications();

  const handleMarkRead = (id: string) => {
    markAsReadMutation.mutate([id]);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        <Card><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6">Notifications</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Notifications</AlertTitle>
          <AlertDescription>
            Failed to load notifications: {error?.message || "Unknown error."}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Notifications ({unreadCount} Unread)</h1>
        {unreadCount > 0 && (
            <Button 
                onClick={markAllAsRead} 
                variant="outline" 
                size="sm"
                disabled={markAsReadMutation.isPending}
            >
                <MailOpen className="h-4 w-4 mr-2" /> Mark All as Read
            </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Alerts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {notifications && notifications.length > 0 ? (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkRead={handleMarkRead}
                />
              ))}
            </div>
          ) : (
            <p className="p-6 text-muted-foreground">You have no notifications.</p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Notifications;