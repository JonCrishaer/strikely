import React, { useState, useEffect } from 'react';
import { Notification } from '@/entities/Notification';
import { User } from '@/entities/User';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Bell, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

const NotificationItem = ({ notification, onMarkAsRead, onDelete }) => (
  <div className={`p-3 border-b border-slate-200 last:border-b-0 ${!notification.is_read ? 'bg-blue-50' : ''}`}>
    <div className="flex justify-between items-start gap-3">
      <div className="flex-1">
        <h4 className="font-semibold text-slate-900 text-sm">{notification.title}</h4>
        <p className="text-slate-600 text-sm mt-1">{notification.message}</p>
        <p className="text-xs text-slate-500 mt-2">
          {formatDistanceToNow(new Date(notification.created_date), { addSuffix: true })}
        </p>
      </div>
      <div className="flex gap-1">
        {!notification.is_read && (
          <Button
            variant="ghost" 
            size="icon"
            onClick={() => onMarkAsRead(notification.id)}
            className="h-6 w-6"
          >
            <Check className="w-3 h-3" />
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon" 
          onClick={() => onDelete(notification.id)}
          className="h-6 w-6"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  </div>
);

export default function NotificationBell() {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadUserAndNotifications();
  }, []);

  const loadUserAndNotifications = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
      
      const userNotifications = await Notification.filter(
        { user_email: currentUser.email },
        '-created_date',
        50
      );
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Error loading notifications:", error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await Notification.update(notificationId, { is_read: true });
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
      toast.error("Could not mark notification as read");
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      await Notification.delete(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error("Error deleting notification:", error);
      toast.error("Could not delete notification");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
      await Promise.all(unreadIds.map(id => Notification.update(id, { is_read: true })));
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error("Error marking all as read:", error);
      toast.error("Could not mark all notifications as read");
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (!user) return null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Notifications</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 max-h-80 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkAsRead={markAsRead}
                  onDelete={deleteNotification}
                />
              ))
            ) : (
              <div className="p-6 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}