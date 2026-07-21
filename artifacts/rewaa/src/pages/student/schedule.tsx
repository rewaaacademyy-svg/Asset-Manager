import React from 'react';
import { useGetMe, useListClasses } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Video, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const dayNamesMap: Record<string, string> = {
  'Saturday': 'السبت',
  'Sunday': 'الأحد',
  'Monday': 'الاثنين',
  'Tuesday': 'الثلاثاء',
  'Wednesday': 'الأربعاء',
  'Thursday': 'الخميس',
  'Friday': 'الجمعة'
};

const statusMap: Record<string, { label: string, variant: 'default' | 'success' | 'destructive' | 'outline' }> = {
  'scheduled': { label: 'مجدولة', variant: 'outline' },
  'completed': { label: 'مكتملة', variant: 'success' },
  'cancelled': { label: 'ملغاة', variant: 'destructive' },
};

export default function StudentSchedule() {
  const { data: me } = useGetMe();
  const { data: classes, isLoading } = useListClasses();

  const studentClasses = classes?.filter(c => c.studentId === me?.id) || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">جدول الحلقات</h1>
        <p className="text-muted-foreground">تابع مواعيد حلقاتك ومساراتها</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5" />
            الحلقات المجدولة
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : studentClasses.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground flex flex-col items-center">
              <CalendarIcon className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-lg">لا يوجد لديك حلقات مجدولة حالياً</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">اليوم</TableHead>
                  <TableHead className="text-right">الوقت</TableHead>
                  <TableHead className="text-right">المعلم</TableHead>
                  <TableHead className="text-right">المكان</TableHead>
                  <TableHead className="text-right">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentClasses.map((cls) => {
                  const status = statusMap[cls.status || 'scheduled'];
                  return (
                    <TableRow key={cls.id}>
                      <TableCell className="font-medium">{dayNamesMap[cls.dayOfWeek] || cls.dayOfWeek}</TableCell>
                      <TableCell dir="ltr" className="text-right">{cls.time}</TableCell>
                      <TableCell>{cls.teacherName}</TableCell>
                      <TableCell>
                        {cls.isOnline ? (
                          <div className="flex items-center gap-1 text-primary">
                            <Video className="w-4 h-4" />
                            {cls.meetingLink ? (
                              <a href={cls.meetingLink} target="_blank" rel="noreferrer" className="underline hover:no-underline">رابط اللقاء</a>
                            ) : (
                              <span>عن بعد</span>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>حضوري</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
