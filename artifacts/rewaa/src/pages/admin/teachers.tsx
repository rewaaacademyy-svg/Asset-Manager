import React, { useState } from 'react';
import { useListTeachers, useCreateTeacher, useUpdateTeacher, useDeleteTeacher } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getListTeachersQueryKey } from '@workspace/api-client-react';

export default function AdminTeachers() {
  const queryClient = useQueryClient();
  const { data: teachers, isLoading } = useListTeachers();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    specialization: '',
  });

  const createMutation = useCreateTeacher({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTeachersQueryKey() });
        setIsDialogOpen(false);
        resetForm();
      }
    }
  });

  const updateMutation = useUpdateTeacher({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTeachersQueryKey() });
        setIsDialogOpen(false);
        resetForm();
      }
    }
  });

  const deleteMutation = useDeleteTeacher({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListTeachersQueryKey() });
      }
    }
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', password: '', specialization: '' });
    setEditingTeacher(null);
  };

  const handleEdit = (teacher: any) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email || '',
      phone: teacher.phone || '',
      password: '', // Leave blank when editing
      specialization: teacher.specialization || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا المعلم؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      updateMutation.mutate({
        id: editingTeacher.id,
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          specialization: formData.specialization
        }
      });
    } else {
      createMutation.mutate({
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password || '123456',
          specialization: formData.specialization
        }
      });
    }
  };

  const filteredTeachers = teachers?.filter(t => 
    t.name.includes(searchTerm) || 
    (t.email && t.email.includes(searchTerm)) ||
    (t.phone && t.phone.includes(searchTerm))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">إدارة المعلمين</h1>
          <p className="text-muted-foreground">عرض وإدارة طاقم التدريس</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة معلم جديد
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-sm">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="البحث بالاسم، البريد، أو الهاتف..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9"
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="text-right">الاسم</TableHead>
                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                <TableHead className="text-right">التخصص / الإجازة</TableHead>
                <TableHead className="text-right">عدد الطلاب</TableHead>
                <TableHead className="text-right w-24">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
              ) : filteredTeachers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">لا يوجد معلمين مطابقين للبحث</TableCell></TableRow>
              ) : (
                filteredTeachers.map((teacher) => (
                  <TableRow key={teacher.id}>
                    <TableCell className="font-medium">{teacher.name}</TableCell>
                    <TableCell dir="ltr" className="text-right">{teacher.email || '-'}</TableCell>
                    <TableCell>{teacher.specialization || '-'}</TableCell>
                    <TableCell>{teacher.studentCount || 0}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(teacher)}>
                          <Edit2 className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(teacher.id)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingTeacher ? 'تعديل بيانات معلم' : 'إضافة معلم جديد'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">الاسم الرباعي</label>
              <Input 
                required 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">البريد الإلكتروني</label>
                <Input 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                  dir="ltr"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">رقم الهاتف</label>
                <Input 
                  value={formData.phone} 
                  onChange={e => setFormData({...formData, phone: e.target.value})} 
                  dir="ltr"
                />
              </div>
            </div>
            {!editingTeacher && (
              <div className="space-y-2">
                <label className="text-sm font-medium">كلمة المرور الابتدائية</label>
                <Input 
                  required 
                  type="password"
                  value={formData.password} 
                  onChange={e => setFormData({...formData, password: e.target.value})} 
                  dir="ltr"
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium">التخصص / الإجازات</label>
              <Input 
                value={formData.specialization} 
                placeholder="مثال: إجازة برواية حفص..."
                onChange={e => setFormData({...formData, specialization: e.target.value})} 
              />
            </div>
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
