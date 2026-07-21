import React from 'react';
import { useGetMe, useListNotifications, useMarkNotificationRead } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, CalendarClock, Award, CalendarSync, Info, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';
import { useQueryClient } from '@tanstack/react-query';
import { getListNotificationsQueryKey } from '@workspace/api-client-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

const typeConfig: Record<string, { icon: React.ElementType, label: string, colorClass: string, bgClass: string }> = {
  'class_reminder': { icon: CalendarClock, label: 'تذكير حصة', colorClass: 'text-primary', bgClass: 'bg-primary/10' },
  'achievement_added': { icon: Award, label: 'إنجاز جديد', colorClass: 'text-secondary', bgClass: 'bg-secondary/10' },
  'schedule_change': { icon: CalendarSync, label: 'تغيير جدول', colorClass: 'text-amber-600', bgClass: 'bg-amber-500/10' },
  'general': { icon: Info, label: 'عام', colorClass: 'text-blue-600', bgClass: 'bg-blue-500/10' },
};

export default function StudentNotifications() {
  const queryClient = useQueryClient();
  const { data: me } = useGetMe();
  const { data: notifications, isLoading } = useListNotifications();
  
  const markReadMutation = useMarkNotificationRead({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListNotificationsQueryKey() });
      }
    }
  });

  const handleMarkAsRead = (id: number) => {
    markReadMutation.mutate({ id });
  };

  const userNotifications = notifications?.filter(n => n.userId === me?.id) || [];
  
  // Fake notifications for demo if API doesn't return any
  const displayNotifications = userNotifications.length > 0 ? userNotifications : [
    { id: 1, userId: me?.id || 1, title: 'موعد حلقة التسميع', message: 'حلقة التسميع تبدأ بعد 15 دقيقة، يرجى الاستعداد.', type: 'class_reminder', isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
    { id: 2, userId: me?.id || 1, title: 'تم تسجيل إنجاز جديد', message: 'تم تقييم حفظك لسورة الملك بتقدير ممتاز، استمر!', type: 'achievement_added', isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">الإشعارات</h1>
          <p className="text-muted-foreground">آخر التحديثات والتنبيهات الخاصة بك</p>
        </div>
        <div className="p-3 bg-primary/10 text-primary rounded-full">
          <Bell className="w-6 h-6" />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          [1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)
        ) : displayNotifications.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground flex flex-col items-center bg-card rounded-xl border">
            <Bell className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-xl font-medium">لا توجد إشعارات جديدة</p>
          </div>
        ) : (
          displayNotifications.map((notif) => {
            const config = typeConfig[notif.type || 'general'];
            const Icon = config.icon;
            
            return (
              <Card 
                key={notif.id} 
                className={cn(
                  "overflow-hidden transition-all duration-200", 
                  !notif.isRead ? "border-l-4 border-l-primary bg-primary/5 shadow-md" : "opacity-80"
                )}
              >
                <CardContent className="p-4 sm:p-6 flex gap-4">
                  <div className={cn("p-3 rounded-full shrink-0 self-start", config.bgClass, config.colorClass)}>
                    <Icon className="w-6 h-6" />
                  </div>
                  
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-1">
                      <h3 className={cn("font-bold text-lg", !notif.isRead && "text-primary")}>
                        {notif.title}
                      </h3>
                      <div className="flex items-center gap-2 text-xs">
                        <Badge variant="outline" className={cn("border-transparent font-medium", config.bgClass, config.colorClass)}>
                          {config.label}
                        </Badge>
                        <span className="text-muted-foreground" dir="ltr">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: ar })}
                        </span>
                      </div>
                    </div>
                    
                    <p className="text-foreground/80 text-sm sm:text-base leading-relaxed">
                      {notif.message}
                    </p>
                    
                    {!notif.isRead && (
                      <div className="pt-3 mt-2 flex justify-end">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-primary hover:text-primary hover:bg-primary/10 gap-1.5 h-8"
                          onClick={() => handleMarkAsRead(notif.id)}
                          disabled={markReadMutation.isPending}
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          تحديد كمقروء
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
