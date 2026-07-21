import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useGetMe, useListStudents, useListClasses } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Search, ChevronLeft, Users, Calendar as CalendarIcon } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function TeacherStudents() {
  const [, setLocation] = useLocation();
  const { data: me } = useGetMe();
  const { data: students, isLoading: isLoadingStudents } = useListStudents();
  const { data: classes, isLoading: isLoadingClasses } = useListClasses();
  
  const [searchTerm, setSearchTerm] = useState('');

  // Filter students belonging to this teacher
  const myStudents = students?.filter(s => s.teacherId === me?.id) || [];
  
  // Apply search
  const filteredStudents = myStudents.filter(s => 
    s.name.includes(searchTerm) || 
    (s.email && s.email.includes(searchTerm))
  );

  // Helper to get next class for a student
  const getNextClass = (studentId: number) => {
    const studentClasses = classes?.filter(c => c.studentId === studentId && c.status === 'scheduled') || [];
    if (studentClasses.length === 0) return null;
    // Just returning the first one for display purposes in this view
    return studentClasses[0];
  };

  const isLoading = isLoadingStudents || isLoadingClasses;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">طلابي</h1>
        <p className="text-muted-foreground">قائمة الطلاب المسجلين لديك ومتابعة مستوياتهم</p>
      </div>

      <Card>
        <CardHeader className="pb-3 border-b">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative max-w-md w-full">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="ابحث باسم الطالب..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-9 h-11"
              />
            </div>
            <div className="text-sm font-medium bg-primary/10 text-primary px-4 py-2 rounded-lg flex items-center gap-2">
              <Users className="w-4 h-4" />
              إجمالي الطلاب: {myStudents.length}
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-right py-4 px-6">اسم الطالب</TableHead>
                <TableHead className="text-right py-4">المستوى</TableHead>
                <TableHead className="text-right py-4">الحلقة القادمة</TableHead>
                <TableHead className="text-right py-4 w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                [1,2,3,4,5].map(i => (
                  <TableRow key={i}>
                    <TableCell className="px-6 py-4"><Skeleton className="h-6 w-48" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                ))
              ) : filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    لا يوجد طلاب مطابقين للبحث
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student) => {
                  const nextClass = getNextClass(student.id);
                  return (
                    <TableRow 
                      key={student.id} 
                      className="cursor-pointer hover:bg-muted/50 transition-colors group"
                      onClick={() => setLocation(`/teacher/student/${student.id}`)}
                    >
                      <TableCell className="font-medium px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-secondary/20 text-secondary-foreground flex items-center justify-center font-bold text-xs">
                            {student.name.charAt(0)}
                          </div>
                          {student.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-normal text-foreground/80 bg-background">
                          {student.level || 'غير محدد'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {nextClass ? (
                          <div className="flex items-center gap-2 text-sm text-foreground/80">
                            <CalendarIcon className="w-4 h-4 text-primary" />
                            <span>{dayNamesMap[nextClass.dayOfWeek] || nextClass.dayOfWeek}</span>
                            <span dir="ltr" className="text-muted-foreground ml-1">{nextClass.time}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">لا توجد حلقات</span>
                        )}
                      </TableCell>
                      <TableCell className="text-left px-6">
                        <ChevronLeft className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
