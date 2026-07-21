import React, { useState } from 'react';
import { 
  useListClasses, useCreateClass, useUpdateClass, useDeleteClass,
  useListStudents, useListTeachers
} from '@workspace/api-client-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Plus, Edit2, Trash2, Video, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useQueryClient } from '@tanstack/react-query';
import { getListClassesQueryKey } from '@workspace/api-client-react';

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

const statusMap: Record<string, { label: string, variant: 'default' | 'success' | 'destructive' | 'outline' }> = {
  'scheduled': { label: 'مجدولة', variant: 'outline' },
  'completed': { label: 'مكتملة', variant: 'success' },
  'cancelled': { label: 'ملغاة', variant: 'destructive' },
};

export default function AdminClasses() {
  const queryClient = useQueryClient();
  const { data: classes, isLoading } = useListClasses();
  const { data: students } = useListStudents();
  const { data: teachers } = useListTeachers();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    studentId: '',
    teacherId: '',
    dayOfWeek: 'Saturday',
    time: '16:00',
    isOnline: false,
    meetingLink: '',
    status: 'scheduled' as 'scheduled' | 'completed' | 'cancelled',
  });

  const createMutation = useCreateClass({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListClassesQueryKey() });
        setIsDialogOpen(false);
        resetForm();
      }
    }
  });

  const updateMutation = useUpdateClass({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListClassesQueryKey() });
        setIsDialogOpen(false);
        resetForm();
      }
    }
  });

  const deleteMutation = useDeleteClass({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListClassesQueryKey() });
      }
    }
  });

  const resetForm = () => {
    setFormData({ 
      studentId: '', teacherId: '', dayOfWeek: 'Saturday', time: '16:00', 
      isOnline: false, meetingLink: '', status: 'scheduled' 
    });
    setEditingClass(null);
  };

  const handleEdit = (cls: any) => {
    setEditingClass(cls);
    setFormData({
      studentId: cls.studentId.toString(),
      teacherId: cls.teacherId.toString(),
      dayOfWeek: cls.dayOfWeek,
      time: cls.time,
      isOnline: cls.isOnline || false,
      meetingLink: cls.meetingLink || '',
      status: cls.status || 'scheduled',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذه الحلقة؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.studentId || !formData.teacherId) return alert('الرجاء اختيار الطالب والمعلم');

    const data = {
      studentId: parseInt(formData.studentId, 10),
      teacherId: parseInt(formData.teacherId, 10),
      dayOfWeek: formData.dayOfWeek,
      time: formData.time,
      isOnline: formData.isOnline,
      meetingLink: formData.isOnline ? formData.meetingLink : undefined,
      status: formData.status
    };

    if (editingClass) {
      updateMutation.mutate({ id: editingClass.id, data });
    } else {
      createMutation.mutate({ data });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">إدارة الحلقات</h1>
          <p className="text-muted-foreground">إدارة جدول الأكاديمية وتعيين الطلاب للمعلمين</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          حلقة جديدة
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="text-right py-4 px-6">الطالب</TableHead>
                <TableHead className="text-right">المعلم</TableHead>
                <TableHead className="text-right">الموعد</TableHead>
                <TableHead className="text-right">النوع</TableHead>
                <TableHead className="text-right">الحالة</TableHead>
                <TableHead className="text-right w-24"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
              ) : classes?.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">لا توجد حلقات مسجلة</TableCell></TableRow>
              ) : (
                classes?.map((cls) => {
                  const status = statusMap[cls.status || 'scheduled'];
                  return (
                    <TableRow key={cls.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium px-6 py-4">{cls.studentName}</TableCell>
                      <TableCell>{cls.teacherName}</TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">{dayNamesMap[cls.dayOfWeek] || cls.dayOfWeek}</span>
                          <span className="text-xs text-muted-foreground" dir="ltr">{cls.time}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {cls.isOnline ? (
                          <span className="flex items-center gap-1.5 text-primary text-sm font-medium bg-primary/10 w-fit px-2 py-1 rounded">
                            <Video className="w-3.5 h-3.5" /> عن بعد
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium bg-muted w-fit px-2 py-1 rounded">
                            <MapPin className="w-3.5 h-3.5" /> حضوري
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(cls)}>
                            <Edit2 className="w-4 h-4 text-primary" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(cls.id)}>
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
            <DialogTitle>{editingClass ? 'تعديل موعد حلقة' : 'إضافة حلقة جديدة'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">الطالب</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.studentId}
                  onChange={(e) => setFormData({...formData, studentId: e.target.value})}
                  required
                >
                  <option value="">اختر الطالب...</option>
                  {students?.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">المعلم</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.teacherId}
                  onChange={(e) => setFormData({...formData, teacherId: e.target.value})}
                  required
                >
                  <option value="">اختر المعلم...</option>
                  {teachers?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">اليوم</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.dayOfWeek}
                  onChange={(e) => setFormData({...formData, dayOfWeek: e.target.value})}
                >
                  {enDayNames.map(day => <option key={day} value={day}>{dayNamesMap[day]}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">الوقت</label>
                <Input 
                  type="time" 
                  value={formData.time} 
                  onChange={e => setFormData({...formData, time: e.target.value})} 
                  required 
                  dir="ltr"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2 border-t mt-4">
              <div className="flex items-center gap-2">
                <input 
                  type="checkbox" 
                  id="isOnline" 
                  className="w-4 h-4 rounded border-input text-primary focus:ring-primary"
                  checked={formData.isOnline}
                  onChange={(e) => setFormData({...formData, isOnline: e.target.checked})}
                />
                <label htmlFor="isOnline" className="text-sm font-medium cursor-pointer">
                  حلقة عن بعد (أونلاين)
                </label>
              </div>
              
              {formData.isOnline && (
                <div className="space-y-2 pl-6">
                  <label className="text-sm font-medium">رابط اللقاء (Zoom, Meet, الخ)</label>
                  <Input 
                    type="url" 
                    value={formData.meetingLink} 
                    onChange={e => setFormData({...formData, meetingLink: e.target.value})} 
                    dir="ltr"
                    placeholder="https://..."
                  />
                </div>
              )}
            </div>

            {editingClass && (
              <div className="space-y-2 pt-2 border-t">
                <label className="text-sm font-medium">حالة الحلقة</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                >
                  <option value="scheduled">مجدولة</option>
                  <option value="completed">مكتملة</option>
                  <option value="cancelled">ملغاة</option>
                </select>
              </div>
            )}

            <DialogFooter className="mt-6 gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>إلغاء</Button>
              <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>حفظ</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
