import React from 'react';
import { useRoute, Link } from 'wouter';
import { useGetStudent, useListAchievements, useListAttendance } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, Award, BookOpen, CalendarCheck, CalendarX, User } from 'lucide-react';
import { getGetStudentQueryKey, getListAchievementsQueryKey, getListAttendanceQueryKey } from '@workspace/api-client-react';

const gradeMap: Record<string, { label: string, variant: 'success' | 'default' | 'warning' | 'destructive' }> = {
  'excellent': { label: 'ممتاز', variant: 'success' },
  'good': { label: 'جيد', variant: 'default' },
  'acceptable': { label: 'مقبول', variant: 'warning' },
  'needs_improvement': { label: 'يحتاج تحسين', variant: 'destructive' },
};

export default function TeacherStudentDetail() {
  const [match, params] = useRoute('/teacher/student/:id');
  const studentId = parseInt(params?.id || '0', 10);

  const { data: student, isLoading: isLoadingStudent } = useGetStudent(studentId, { 
    query: { enabled: !!studentId, queryKey: getGetStudentQueryKey(studentId) } 
  });
  
  const { data: achievements, isLoading: isLoadingAch } = useListAchievements({ studentId }, {
    query: { enabled: !!studentId, queryKey: getListAchievementsQueryKey({ studentId }) }
  });

  const { data: attendance, isLoading: isLoadingAtt } = useListAttendance({ studentId }, {
    query: { enabled: !!studentId, queryKey: getListAttendanceQueryKey({ studentId }) }
  });

  if (isLoadingStudent) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!student) {
    return <div className="text-center py-20 text-muted-foreground">لم يتم العثور على بيانات الطالب</div>;
  }

  const presentCount = attendance?.filter(a => a.present).length || 0;
  const totalAtt = attendance?.length || 0;
  const attRate = totalAtt > 0 ? Math.round((presentCount / totalAtt) * 100) : 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-4">
        <Link href="/teacher/students">
          <Button variant="outline" size="icon" className="shrink-0">
            <ChevronRight className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-1">ملف الطالب</h1>
          <p className="text-muted-foreground">عرض التقييمات وسجل الحضور</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1 border-t-4 border-t-primary">
          <CardContent className="p-6 flex flex-col items-center text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold mb-4">
              {student.name.charAt(0)}
            </div>
            <h2 className="text-xl font-bold">{student.name}</h2>
            <Badge variant="outline" className="mt-2 mb-6">{student.level || 'غير محدد'}</Badge>
            
            <div className="w-full space-y-4 text-sm text-right">
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">العمر</span>
                <span className="font-medium">{student.age || '-'}</span>
              </div>
              <div className="flex items-center justify-between border-b pb-2">
                <span className="text-muted-foreground">نسبة الحضور</span>
                <span className="font-medium text-primary">{attRate}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">إجمالي الإنجازات</span>
                <span className="font-medium text-secondary">{achievements?.length || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <Award className="w-5 h-5 text-secondary" />
                سجل الإنجازات
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingAch ? (
                <div className="p-6"><Skeleton className="h-32 w-full" /></div>
              ) : achievements?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لا توجد إنجازات مسجلة بعد</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right py-3 px-4">السورة</TableHead>
                      <TableHead className="text-right">الآيات</TableHead>
                      <TableHead className="text-right">التقييم</TableHead>
                      <TableHead className="text-right">التاريخ</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {achievements?.map((ach) => {
                      const grade = gradeMap[ach.grade] || gradeMap['acceptable'];
                      return (
                        <TableRow key={ach.id}>
                          <TableCell className="font-medium px-4">{ach.surah}</TableCell>
                          <TableCell dir="ltr" className="text-right">{ach.startAyah} - {ach.endAyah}</TableCell>
                          <TableCell>
                            <Badge variant={grade.variant}>{grade.label}</Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {new Date(ach.date).toLocaleDateString('ar-SA')}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 border-b bg-muted/10">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-primary" />
                سجل الحضور الأخير
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoadingAtt ? (
                <div className="p-6"><Skeleton className="h-32 w-full" /></div>
              ) : attendance?.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">لا يوجد سجل حضور</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-right py-3 px-4">التاريخ</TableHead>
                      <TableHead className="text-right">الحالة</TableHead>
                      <TableHead className="text-right">ملاحظات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {attendance?.slice(0, 5).map((att) => (
                      <TableRow key={att.id}>
                        <TableCell className="px-4 font-medium" dir="ltr" align="right">
                          {new Date(att.date).toLocaleDateString('ar-SA')}
                        </TableCell>
                        <TableCell>
                          {att.present ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 font-medium text-sm">
                              <CalendarCheck className="w-4 h-4" /> حاضر
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-destructive font-medium text-sm">
                              <CalendarX className="w-4 h-4" /> غائب
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {att.notes || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
