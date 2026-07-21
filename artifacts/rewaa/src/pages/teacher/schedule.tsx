import React from 'react';
import { useGetMe, useListClasses } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Video, MapPin, Clock, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

const dayNamesMap: Record<string, string> = {
  'Saturday': 'السبت',
  'Sunday': 'الأحد',
  'Monday': 'الاثنين',
  'Tuesday': 'الثلاثاء',
  'Wednesday': 'الأربعاء',
  'Thursday': 'الخميس',
  'Friday': 'الجمعة'
};

const enDayNames = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

export default function TeacherSchedule() {
  const { data: me } = useGetMe();
  const { data: classes, isLoading } = useListClasses();

  const myClasses = classes?.filter(c => c.teacherId === me?.id && c.status !== 'cancelled') || [];

  const getClassesForDay = (day: string) => {
    return myClasses.filter(c => c.dayOfWeek === day).sort((a, b) => a.time.localeCompare(b.time));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">الجدول الأسبوعي</h1>
        <p className="text-muted-foreground">عرض الحلقات المجدولة ومواعيدها</p>
      </div>

      <Card>
        <CardHeader className="border-b bg-muted/20">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            حلقات الأسبوع
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-0">
              {[1,2,3,4,5,6].map(i => <Skeleton key={i} className="h-48 w-full" />)}
            </div>
          ) : myClasses.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground flex flex-col items-center">
              <Calendar className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-xl font-medium">لا توجد حلقات مجدولة في جدولك الحالي</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4 sm:p-0 items-start">
              {enDayNames.map(day => {
                const dayClasses = getClassesForDay(day);
                if (dayClasses.length === 0) return null;

                return (
                  <div key={day} className="flex flex-col gap-3">
                    <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 font-bold text-lg border-b-2 border-primary/20 flex items-center justify-between">
                      <span>{dayNamesMap[day]}</span>
                      <Badge variant="outline" className="bg-primary/5">{dayClasses.length}</Badge>
                    </div>
                    
                    <div className="flex flex-col gap-3">
                      {dayClasses.map((cls) => (
                        <Card key={cls.id} className={cn(
                          "overflow-hidden transition-all shadow-sm hover:shadow-md",
                          cls.status === 'completed' ? "opacity-75 bg-muted/30" : "border-r-4 border-r-secondary"
                        )}>
                          <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-3">
                              <h4 className="font-bold text-foreground line-clamp-1" title={cls.studentName || 'طالب'}>
                                {cls.studentName}
                              </h4>
                              <Badge variant={cls.status === 'completed' ? 'secondary' : 'outline'} dir="ltr" className="shrink-0 flex gap-1">
                                {cls.time} <Clock className="w-3 h-3" />
                              </Badge>
                            </div>
                            
                            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
                              {cls.isOnline ? (
                                <span className="text-xs flex items-center gap-1.5 text-primary font-medium">
                                  <Video className="w-3.5 h-3.5" /> عن بعد
                                </span>
                              ) : (
                                <span className="text-xs flex items-center gap-1.5 text-muted-foreground font-medium">
                                  <MapPin className="w-3.5 h-3.5" /> حضوري
                                </span>
                              )}
                              
                              {cls.status === 'completed' && (
                                <span className="text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded font-medium">
                                  مكتملة
                                </span>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
