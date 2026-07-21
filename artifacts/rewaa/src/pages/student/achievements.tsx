import React from 'react';
import { useGetMe, useListAchievements } from '@workspace/api-client-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Award, BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'framer-motion';

const gradeMap: Record<string, { label: string, variant: 'success' | 'default' | 'warning' | 'destructive' }> = {
  'excellent': { label: 'ممتاز', variant: 'success' },
  'good': { label: 'جيد', variant: 'default' },
  'acceptable': { label: 'مقبول', variant: 'warning' },
  'needs_improvement': { label: 'يحتاج تحسين', variant: 'destructive' },
};

export default function StudentAchievements() {
  const { data: me } = useGetMe();
  const { data: achievements, isLoading } = useListAchievements({ studentId: me?.id });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">سجل الإنجازات</h1>
        <p className="text-muted-foreground">توثيق رحلتك مع حفظ القرآن الكريم</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
        </div>
      ) : achievements?.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground flex flex-col items-center bg-card rounded-xl border">
          <Award className="w-20 h-20 mb-4 opacity-20" />
          <p className="text-xl font-medium">لا توجد إنجازات مسجلة بعد</p>
          <p className="text-sm mt-2">استمر في الحفظ وسيتم تسجيل إنجازاتك هنا</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {achievements?.map((achievement, index) => {
            const grade = gradeMap[achievement.grade] || gradeMap['acceptable'];
            return (
              <motion.div 
                key={achievement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border-r-4 border-r-primary overflow-hidden">
                  <CardContent className="p-0">
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-primary/10 text-primary rounded-xl">
                            <BookOpen className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold">سورة {achievement.surah}</h3>
                            <p className="text-sm text-muted-foreground">الآيات: {achievement.startAyah} إلى {achievement.endAyah}</p>
                          </div>
                        </div>
                        <Badge variant={grade.variant} className="text-sm px-3 py-1">
                          {grade.label}
                        </Badge>
                      </div>
                      
                      {achievement.notes && (
                        <div className="bg-muted/30 p-3 rounded-lg text-sm text-foreground/80 mb-4 border border-border/50">
                          {achievement.notes}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground pt-4 border-t border-border/50 mt-auto">
                        <div className="flex items-center gap-1.5">
                          <CalendarIcon className="w-3.5 h-3.5" />
                          <span>{new Date(achievement.date).toLocaleDateString('ar-SA')}</span>
                        </div>
                        {achievement.teacherName && (
                          <div className="flex items-center gap-1">
                            <span>المعلم:</span>
                            <span className="font-medium text-foreground">{achievement.teacherName}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
