import React, { useState } from 'react';
import { useListStudents, useCreateStudent, useUpdateStudent, useDeleteStudent } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Search, Plus, Edit2, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { getListStudentsQueryKey } from '@workspace/api-client-react';

export default function AdminStudents() {
  const queryClient = useQueryClient();
  const { data: students, isLoading } = useListStudents();
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    level: '',
  });

  const createMutation = useCreateStudent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        setIsDialogOpen(false);
        resetForm();
      }
    }
  });

  const updateMutation = useUpdateStudent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
        setIsDialogOpen(false);
        resetForm();
      }
    }
  });

  const deleteMutation = useDeleteStudent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStudentsQueryKey() });
      }
    }
  });

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', password: '', level: '' });
    setEditingStudent(null);
  };

  const handleEdit = (student: any) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      email: student.email || '',
      phone: student.phone || '',
      password: '', // Leave blank when editing
      level: student.level || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
      deleteMutation.mutate({ id });
    }
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateMutation.mutate({
        id: editingStudent.id,
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          level: formData.level
        }
      });
    } else {
      createMutation.mutate({
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password || '123456',
          level: formData.level
        }
      });
    }
  };

  const filteredStudents = students?.filter(s => 
    s.name.includes(searchTerm) || 
    (s.email && s.email.includes(searchTerm)) ||
    (s.phone && s.phone.includes(searchTerm))
  ) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight mb-2">إدارة الطلاب</h1>
          <p className="text-muted-foreground">عرض وإدارة جميع طلاب الأكاديمية</p>
        </div>
        <Button onClick={() => { resetForm(); setIsDialogOpen(true); }} className="gap-2">
          <Plus className="w-4 h-4" />
          إضافة طالب جديد
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
                <TableHead className="text-right">المستوى</TableHead>
                <TableHead className="text-right">المعلم</TableHead>
                <TableHead className="text-right w-24">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">جاري التحميل...</TableCell></TableRow>
              ) : filteredStudents.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">لا يوجد طلاب مطابقين للبحث</TableCell></TableRow>
              ) : (
                filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell dir="ltr" className="text-right">{student.email || '-'}</TableCell>
                    <TableCell>{student.level || '-'}</TableCell>
                    <TableCell>{student.teacherName || 'غير محدد'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(student)}>
                          <Edit2 className="w-4 h-4 text-primary" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id)}>
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
            <DialogTitle>{editingStudent ? 'تعديل بيانات طالب' : 'إضافة طالب جديد'}</DialogTitle>
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
            {!editingStudent && (
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
              <label className="text-sm font-medium">مستوى الحفظ</label>
              <Input 
                value={formData.level} 
                placeholder="مثال: جزء عمّ، نصف القرآن..."
                onChange={e => setFormData({...formData, level: e.target.value})} 
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
