import { useEffect, useState } from "react";
import { notificationsApi } from "@/integrations/api/client";
import { notificationService, Notification } from "@/integrations/api/websocketNotificationService";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertCircle,
    CheckCircle2,
    MessageSquare,
    UserPlus,
    Truck,
    Package,
    Trash2,
    X,
    Clock,
    RefreshCw,
} from "lucide-react";

interface NotificationsPageProps {
    isOpen: boolean;
    onClose: () => void;
}

export const NotificationsPage = ({ isOpen, onClose }: NotificationsPageProps) => {
    const { user } = useAuth();
    const { toast } = useToast();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    useEffect(() => {
        if (!isOpen || !user?.id) return;
        loadNotifications();

        // Subscribe to new notifications via WebSocket
        const unsubscribe = notificationService.subscribe(handleNewNotification);

        // Auto-refresh notifications every 5 seconds when dialog is open
        const refreshInterval = setInterval(() => {
            loadNotifications();
        }, 5000);

        return () => {
            unsubscribe();
            clearInterval(refreshInterval);
        };
    }, [isOpen, user?.id]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const data = await notificationsApi.getAll();
            setNotifications(data || []);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to load notifications. Please try again.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const handleNewNotification = (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
        toast({
            title: notification.title,
            description: notification.message,
        });
    };

    const handleMarkAsRead = async (notificationId: string) => {
        try {
            await notificationsApi.markAsRead(notificationId);
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === notificationId ? { ...n, read: true } : n
                )
            );
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update notification",
                variant: "destructive",
            });
        }
    };

    const handleDismiss = async (notificationId: string) => {
        try {
            await notificationsApi.dismiss(notificationId);
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to dismiss notification",
                variant: "destructive",
            });
        }
    };

    const handleDelete = async (notificationId: string) => {
        try {
            await notificationsApi.delete(notificationId);
            setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete notification",
                variant: "destructive",
            });
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await notificationsApi.markAllAsRead();
            setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update notifications",
                variant: "destructive",
            });
        }
    };

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "NEW_MESSAGE":
                return <MessageSquare className="w-4 h-4 text-blue-500" />;
            case "NEW_USER":
                return <UserPlus className="w-4 h-4 text-green-500" />;
            case "DRIVER_ASSIGNED":
            case "NEW_DELIVERY":
                return <Truck className="w-4 h-4 text-orange-500" />;
            case "DELIVERY_COMPLETED":
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "DELIVERY_CANCELLED":
                return <AlertCircle className="w-4 h-4 text-red-500" />;
            default:
                return <Package className="w-4 h-4 text-gray-500" />;
        }
    };

    const filteredNotifications = filter === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Notifications</DialogTitle>
                    <DialogDescription>
                        Manage your notifications (automatically deleted after 24 hours)
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    {/* Filter and Actions */}
                    <div className="flex justify-between items-center gap-2 border-b pb-4">
                        <div className="flex gap-2">
                            <Button
                                variant={filter === "all" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("all")}
                            >
                                All ({notifications.length})
                            </Button>
                            <Button
                                variant={filter === "unread" ? "default" : "outline"}
                                size="sm"
                                onClick={() => setFilter("unread")}
                            >
                                Unread ({notifications.filter((n) => !n.read).length})
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={loadNotifications}
                                disabled={loading}
                                title="Refresh notifications"
                            >
                                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                            </Button>
                        </div>
                        {notifications.some((n) => !n.read) && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleMarkAllAsRead}
                            >
                                Mark all as read
                            </Button>
                        )}
                    </div>

                    {/* Notifications List */}
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">
                            Loading notifications...
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            {filter === "unread"
                                ? "No unread notifications"
                                : "No notifications"}
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredNotifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 rounded-lg border transition-all ${notification.read
                                            ? "bg-gray-50 border-gray-200"
                                            : "bg-blue-50 border-blue-200"
                                        } hover:shadow-md`}
                                >
                                    <div className="flex gap-3 items-start">
                                        {/* Icon */}
                                        <div className="mt-1 flex-shrink-0">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-sm">
                                                        {notification.title}
                                                    </h4>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                                {!notification.read && (
                                                    <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-1" />
                                                )}
                                            </div>

                                            {/* Metadata */}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(notification.createdAt).toLocaleString()}
                                                </div>
                                                {notification.dismissedAt && (
                                                    <span className="text-gray-400">Dismissed</span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-2 flex-shrink-0">
                                            {!notification.read && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleMarkAsRead(notification.id)}
                                                    title="Mark as read"
                                                >
                                                    <CheckCircle2 className="w-4 h-4" />
                                                </Button>
                                            )}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDismiss(notification.id)}
                                                title="Dismiss"
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(notification.id)}
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
