import React from 'react';
import { useGetDashboardStats, useListStudents, useListClasses } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, Clock, UsersRound } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { motion } from 'framer-motion';

export default function TeacherDashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: students, isLoading: studentsLoading } = useListStudents();
  const { data: classes, isLoading: classesLoading } = useListClasses();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">رئيسية المعلم</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-primary text-primary-foreground border-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary-foreground/80 mb-1">طلابي</p>
                  <h3 className="text-4xl font-bold">
                    {studentsLoading ? <Skeleton className="h-10 w-16 bg-primary-foreground/20" /> : students?.length || 0}
                  </h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-secondary text-secondary-foreground border-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-secondary-foreground/80 mb-1">حلقات اليوم</p>
                  <h3 className="text-4xl font-bold">
                    {statsLoading ? <Skeleton className="h-10 w-16 bg-white/20" /> : stats?.classesToday || 0}
                  </h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-emerald-600 text-white border-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 mb-1">حلقات هذا الأسبوع</p>
                  <h3 className="text-4xl font-bold">
                    {statsLoading ? <Skeleton className="h-10 w-16 bg-white/20" /> : stats?.classesThisWeek || 0}
                  </h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersRound className="w-5 h-5 text-primary" />
              أحدث الطلاب
            </CardTitle>
          </CardHeader>
          <CardContent>
            {studentsLoading ? (
               <div className="space-y-4">
                 {[1,2,3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
               </div>
            ) : students?.slice(0, 5).map(student => (
              <div key={student.id} className="flex justify-between items-center p-3 border-b last:border-0 hover:bg-muted/50 rounded-lg transition-colors">
                <div>
                  <p className="font-medium">{student.name}</p>
                  <p className="text-xs text-muted-foreground">المستوى: {student.level || 'غير محدد'}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
