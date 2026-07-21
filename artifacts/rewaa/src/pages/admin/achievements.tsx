import React, { useState } from 'react';
import { 
  useListAchievements, useCreateAchievement, useUpdateAchievement, useDeleteAchievement,
  useListStudents
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Award } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { getListAchievementsQueryKey } from '@workspace/api-client-react';

const gradeMap: Record<string, { label: string, variant: 'success' | 'default' | 'warning' | 'destructive' }> = {
  'excellent': { label: 'ممتاز', variant: 'success' },
  'good': { label: 'جيد', variant: 'default' },
  'acceptable': { label: 'مقبول', variant: 'warning' },
  'needs_improvement': { label: 'يحتاج تحسين', variant: 'destructive' },
};

export default function AdminAchievements() {
  const queryClient = useQueryClient();
  // Call useListAchievements with empty object for all, or match API expectations
  const { data: achievements, isLoading } = useListAchievements({});
  const { data: students } = useListStudents();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    studentId: '',
    surah: '',
    startAyah: '',
    endAyah: '',
    grade: 'excellent' as 'excellent'|'good'|'acceptable'|'needs_improvement',
    notes: '',
    date: new Date().toISOString().split('T')[0],
  });

  const createMutation = useCreateAchievement({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAchievementsQueryKey({}) });
        setIsDialogOpen(false);
        resetForm();
      }
    }
  });

  const updateMutation = useUpdateAchievement({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAchievementsQueryKey({}) });
        setIsDialogOpen(false);
        resetForm();
      }
    }
  });

  const deleteMutation = useDeleteAchievement({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListAchievementsQueryKey({}) });
      }
    }
  });

  const resetForm = () => {
    setFormData({ 
      studentId: '', surah: '', startAyah: '', endAyah: '', 
      grade: 'excellent', notes: '', date: new Date().toISOString().split('T')[0] 
    });
    setEditingAchievement(null);
  };

  const handleEdit = (ach: any) => {
    setEditingAchievement(ach);
    setFormData({
      studentId: ach.studentId.toString(),
      surah: ach.surah,
      startAyah: ach.startAyah.toString(),
      endAyah: ach.endAyah.toString(),
      grade: ach.grade,
      notes: ach.notes || '',
      date: new Date(ach.date).toISOString().split('T')[0],
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الإنجاز؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId) return alert('الرجاء اختيار الطالب');

    const data = {
      studentId: parseInt(formData.studentId, 10),
      surah: formData.surah,
      startAyah: parseInt(formData.startAyah, 10),
      endAyah: parseInt(formData.endAyah, 10),
      grade: formData.grade,
      notes: formData.notes || undefined,
      date: new Date(formData.date).toISOString()
    };

    if (editingAchievement) {
      updateMutation.mutate({ id: editingAchievement.id, data });
    } else {
      createMutation.mutate({ data });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">سجل الإنجازات</h1>
          <p className="text-muted-foreground">توثيق الحفظ وتقييم الطلاب</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gap-2 bg-secondary text-secondary-foreground hover:bg-secondary/90">
          <Award className="w-4 h-4" />
          تسجيل إنجاز جديد
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-right py-4 px-6">الطالب</TableHead>
                <TableHead className="text-right">السورة / المقطع</TableHead>
                <TableHead className="text-right">التقييم</TableHead>
                <TableHead className="text-right">التاريخ</TableHead>
                <TableHead className="text-right">المعلم</TableHead>
                <TableHead className="text-right w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
              ) : achievements?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">لا توجد إنجازات مسجلة</TableCell></TableRow>
              ) : (
                achievements?.map((ach) => {
                  const grade = gradeMap[ach.grade] || gradeMap['acceptable'];
                  return (
                    <TableRow key={ach.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium px-6 py-4">{ach.studentName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold text-primary">سورة {ach.surah}</span>
                          <span className="text-xs text-muted-foreground">الآيات: {ach.startAyah} - {ach.endAyah}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={grade.variant}>{grade.label}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm font-medium">
                        {new Date(ach.date).toLocaleDateString('ar-SA')}
                      </TableCell>
                      <TableCell className="text-sm">{ach.teacherName || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(ach)}>
                            <Edit2 className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(ach.id)}>
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAchievement ? 'تعديل التقييم' : 'تسجيل إنجاز جديد'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الطالب</label>
              <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                value={formData.studentId}
                onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                required
                disabled={!!editingAchievement} // Can't change student after creation usually
              >
                <option value="">اختر الطالب...</option>
                {students?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2 sm:col-span-1">
                <label className="text-sm font-medium">اسم السورة</label>
                <Input 
                  value={formData.surah} 
                  onChange={e => setFormData({...formData, surah: e.target.value})} 
                  required 
                  placeholder="مثال: البقرة"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">من آية</label>
                <Input 
                  type="number" 
                  value={formData.startAyah} 
                  onChange={e => setFormData({...formData, startAyah: e.target.value})} 
                  required 
                  min="1"
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">إلى آية</label>
                <Input 
                  type="number" 
                  value={formData.endAyah} 
                  onChange={e => setFormData({...formData, endAyah: e.target.value})} 
                  required 
                  min="1"
                  dir="ltr"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">التقييم</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.grade}
                  onChange={(e) => setFormData({...formData, grade: e.target.value as any})}
                  required
                >
                  <option value="excellent">ممتاز</option>
                  <option value="good">جيد</option>
                  <option value="acceptable">مقبول</option>
                  <option value="needs_improvement">يحتاج تحسين</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">تاريخ التسميع</label>
                <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({...formData, date: e.target.value})} 
                  required 
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">ملاحظات (اختياري)</label>
              <Input 
                value={formData.notes} 
                onChange={e => setFormData({...formData, notes: e.target.value})} 
                placeholder="نقاط القوة أو الضعف لتركيز الطالب عليها..."
              />
            </div>

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>حفظ التقييم</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
