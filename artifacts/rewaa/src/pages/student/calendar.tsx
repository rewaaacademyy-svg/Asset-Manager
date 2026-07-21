import React, { useState } from 'react';
import { useGetMe, useListClasses } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, ChevronRight, ChevronLeft, Clock, Video, MapPin } from 'lucide-react';
import { 
  startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, 
  format, addMonths, subMonths, isSameMonth, isToday, isSameDay, parse
} from 'date-fns';
import { ar } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

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

export default function StudentCalendar() {
  const { data: me } = useGetMe();
  const { data: classes } = useListClasses();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const studentClasses = classes?.filter(c => c.studentId === me?.id && c.status === 'scheduled') || [];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 6 }); // Start on Saturday
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 6 });
  const dateFormat = "MMMM yyyy";
  
  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  // Get classes for a specific day
  const getClassesForDay = (date: Date) => {
    const dayName = format(date, 'EEEE');
    return studentClasses.filter(c => c.dayOfWeek === dayName);
  };

  const selectedDayClasses = getClassesForDay(selectedDate);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">التقويم الدراسي</h1>
        <p className="text-muted-foreground">عرض مواعيد الحلقات حسب التقويم الشهري</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              {format(currentDate, dateFormat, { locale: ar })}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1 text-center mb-2">
              {enDayNames.map(day => (
                <div key={day} className="font-semibold text-sm py-2 text-muted-foreground">
                  {dayNamesMap[day].slice(0, 3)}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const dayClasses = getClassesForDay(day);
                const isSelected = isSameDay(day, selectedDate);
                return (
                  <div 
                    key={day.toISOString()} 
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "min-h-[80px] p-2 border rounded-md cursor-pointer transition-colors relative flex flex-col items-center",
                      !isSameMonth(day, monthStart) && "opacity-30 bg-muted/30",
                      isToday(day) && "border-primary bg-primary/5",
                      isSelected && "ring-2 ring-primary border-transparent",
                      "hover:border-primary/50 hover:bg-primary/5"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-1",
                      isToday(day) && "bg-primary text-primary-foreground",
                      isSelected && !isToday(day) && "bg-primary/20 text-primary"
                    )}>
                      {format(day, 'd')}
                    </span>
                    
                    {dayClasses.length > 0 && (
                      <div className="flex gap-1 flex-wrap justify-center mt-1">
                        {dayClasses.map((c, idx) => (
                          <div key={idx} className="w-2 h-2 rounded-full bg-secondary" title={c.time} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>
              حلقات {format(selectedDate, 'EEEE d MMMM', { locale: ar })}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayClasses.length > 0 ? (
              <div className="space-y-4">
                {selectedDayClasses.map(cls => (
                  <div key={cls.id} className="p-4 border rounded-lg hover:border-primary/50 transition-colors bg-card relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-1 h-full bg-secondary" />
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold">حلقة التسميع</h4>
                      <Badge variant="outline" className="flex items-center gap-1 font-mono" dir="ltr">
                        {cls.time}
                        <Clock className="w-3 h-3 ml-1" />
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">المعلم: {cls.teacherName}</p>
                    
                    {cls.isOnline ? (
                      <div className="flex items-center justify-between">
                        <span className="text-xs flex items-center gap-1 text-primary">
                          <Video className="w-3.5 h-3.5" /> عن بعد
                        </span>
                        {cls.meetingLink && (
                          <a href={cls.meetingLink} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline font-medium bg-primary/10 px-2 py-1 rounded">
                            رابط اللقاء
                          </a>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3.5 h-3.5" /> حضوري
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground flex flex-col items-center border border-dashed rounded-lg bg-muted/20">
                <CalendarIcon className="w-12 h-12 mb-3 opacity-20" />
                <p>لا توجد حلقات مجدولة في هذا اليوم</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
