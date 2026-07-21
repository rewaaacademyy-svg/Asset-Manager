import React from 'react';
import { useGetDashboardStats } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BookOpen, GraduationCap, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

const gradeNames: Record<string, string> = {
  'excellent': 'ممتاز',
  'good': 'جيد',
  'acceptable': 'مقبول',
  'needs_improvement': 'يحتاج تحسين'
};

export default function AdminDashboard() {
  const { data: stats, isLoading } = useGetDashboardStats();

  const chartData = stats?.achievementsByGrade?.map(item => ({
    name: gradeNames[item.grade] || item.grade,
    count: item.count
  })) || [];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">نظرة عامة</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-r-4 border-r-primary">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-primary/10 text-primary rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">الطلاب</p>
              <h3 className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : stats?.totalStudents || 0}
              </h3>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-r-4 border-r-secondary">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-secondary/10 text-secondary rounded-xl">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">المعلمون</p>
              <h3 className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : stats?.totalTeachers || 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-emerald-500">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-emerald-500/10 text-emerald-600 rounded-xl">
              <BookOpen className="w-8 h-8" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">الحلقات</p>
              <h3 className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : stats?.totalClasses || 0}
              </h3>
            </div>
          </CardContent>
        </Card>

        <Card className="border-r-4 border-r-amber-500">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-amber-500/10 text-amber-600 rounded-xl">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <p className="text-muted-foreground text-sm font-medium">الإنجازات</p>
              <h3 className="text-2xl font-bold">
                {isLoading ? <Skeleton className="h-8 w-16 mt-1" /> : stats?.totalAchievements || 0}
              </h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <Card>
          <CardHeader>
            <CardTitle>الإنجازات حسب التقييم</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : chartData.length > 0 ? (
              <div className="h-[300px] w-full" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <YAxis axisLine={false} tickLine={false} />
                    <Tooltip cursor={{ fill: 'var(--color-muted)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                    <Bar dataKey="count" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                لا توجد بيانات كافية
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أحدث الإنجازات</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                 {[1,2,3,4].map(i => <Skeleton key={i} className="h-14 w-full" />)}
              </div>
            ) : stats?.recentAchievements && stats.recentAchievements.length > 0 ? (
              <div className="space-y-4">
                {stats.recentAchievements.map((ach) => (
                  <div key={ach.id} className="flex justify-between items-center p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full text-primary">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{ach.studentName}</p>
                        <p className="text-xs text-muted-foreground">سورة {ach.surah}</p>
                      </div>
                    </div>
                    <span className="text-xs bg-secondary/20 text-secondary-foreground px-2 py-1 rounded font-medium">
                      {gradeNames[ach.grade] || ach.grade}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                لا توجد إنجازات حديثة
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
