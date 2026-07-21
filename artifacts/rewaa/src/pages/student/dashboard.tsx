import React from 'react';
import { useGetMe, useListClasses, useListAchievements, useGetStudentStats } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BookOpen, Calendar, Award, ArrowUpRight, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

export default function StudentDashboard() {
  const { data: me } = useGetMe();
  const { data: stats } = useGetStudentStats(me?.id || 0, { query: { enabled: !!me?.id } });
  const { data: classes } = useListClasses();
  
  const upcomingClasses = classes?.filter(c => c.studentId === me?.id && c.status === 'scheduled').slice(0, 3) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">مرحباً يا {me?.name?.split(' ')[0]} 👋</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary-foreground/80 mb-1">الإنجازات</p>
                  <h3 className="text-4xl font-bold">{stats?.totalAchievements || 0}</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <Award className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="bg-gradient-to-br from-secondary to-secondary/80 text-secondary-foreground border-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-secondary-foreground/80 mb-1">نسبة الحضور</p>
                  <h3 className="text-4xl font-bold">{Math.round(stats?.completionRate || 0)}%</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="bg-gradient-to-br from-emerald-600 to-emerald-500 text-white border-none">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/80 mb-1">إجمالي الحلقات</p>
                  <h3 className="text-4xl font-bold">{stats?.totalClasses || 0}</h3>
                </div>
                <div className="p-3 bg-white/20 rounded-xl">
                  <BookOpen className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>مستوى الحفظ الحالي</CardTitle>
                <CardDescription>تقدمك في البرنامج الدراسي</CardDescription>
              </div>
              <Award className="w-5 h-5 text-secondary" />
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-foreground">الجزء عمّ</span>
                  <span className="text-muted-foreground">{Math.round((stats?.totalAchievements || 0) * 5)}%</span>
                </div>
                <Progress value={Math.min(100, (stats?.totalAchievements || 0) * 5)} className="h-3" />
              </div>
              
              {stats?.lastAchievement && (
                <div className="bg-muted/50 p-4 rounded-lg border">
                  <p className="text-sm font-medium mb-1">آخر إنجاز</p>
                  <div className="flex items-center justify-between">
                    <span className="text-primary font-bold">سورة {stats.lastAchievement.surah}</span>
                    <span className="text-xs text-muted-foreground">{new Date(stats.lastAchievement.date).toLocaleDateString('ar-SA')}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">الآيات: {stats.lastAchievement.startAyah} - {stats.lastAchievement.endAyah}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle>الحلقات القادمة</CardTitle>
                <CardDescription>الجدول الدراسي القريب</CardDescription>
              </div>
              <Calendar className="w-5 h-5 text-primary" />
            </CardHeader>
            <CardContent className="pt-4">
              {upcomingClasses.length > 0 ? (
                <div className="space-y-4">
                  {upcomingClasses.map((cls) => (
                    <div key={cls.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors">
                      <div className="bg-primary/10 text-primary w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0">
                        <span className="text-xs font-medium">{cls.dayOfWeek.slice(0, 3)}</span>
                        <span className="text-sm font-bold">{cls.time.split(':')[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground truncate">حلقة التسميع</p>
                        <p className="text-xs text-muted-foreground truncate">المعلم: {cls.teacherName}</p>
                      </div>
                      {cls.isOnline && cls.meetingLink && (
                        <a href={cls.meetingLink} target="_blank" rel="noreferrer" className="text-primary hover:text-primary/80 p-2 bg-primary/5 rounded-full">
                          <ArrowUpRight className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground flex flex-col items-center">
                  <Calendar className="w-12 h-12 mb-3 opacity-20" />
                  <p>لا توجد حلقات مجدولة قريباً</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
