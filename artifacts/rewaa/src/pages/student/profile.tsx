import React, { useState, useEffect } from 'react';
import { useGetMe, useUpdateStudent } from '@workspace/api-client-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useQueryClient } from '@tanstack/react-query';
import { getGetMeQueryKey } from '@workspace/api-client-react';
import { User, Mail, Phone, Lock, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function StudentProfile() {
  const queryClient = useQueryClient();
  // We'll simulate useToast since we generated a stub earlier
  const toast = { title: '', description: '' }; // Mock

  const { data: me } = useGetMe();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    age: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    if (me) {
      setFormData({
        name: me.name || '',
        email: me.email || '',
        phone: me.phone || '',
        age: me.age?.toString() || '',
      });
    }
  }, [me]);

  const updateMutation = useUpdateStudent({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        alert('تم تحديث البيانات بنجاح');
      }
    }
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (me?.id) {
      updateMutation.mutate({
        id: me.id,
        data: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          age: formData.age ? parseInt(formData.age, 10) : undefined,
        }
      });
    }
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('كلمات المرور الجديدة غير متطابقة');
      return;
    }
    // Just a UI simulation since password update isn't explicitly in API schema for students
    alert('تم تحديث كلمة المرور بنجاح (محاكاة)');
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  if (!me) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight mb-2">الملف الشخصي</h1>
        <p className="text-muted-foreground">إدارة معلوماتك الشخصية وإعدادات الحساب</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-full bg-primary/10 text-primary flex items-center justify-center text-3xl font-bold mb-4 border-4 border-background shadow-md">
                {me.name.charAt(0)}
              </div>
              <h2 className="text-xl font-bold">{me.name}</h2>
              <p className="text-muted-foreground text-sm mb-4">طالب</p>
              
              <div className="w-full space-y-3 mt-4 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground bg-muted/30 p-2 rounded-md">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="truncate" dir="ltr">{me.email || 'لا يوجد بريد'}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground bg-muted/30 p-2 rounded-md">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="truncate" dir="ltr">{me.phone || 'لا يوجد رقم هاتف'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                المعلومات الأساسية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">الاسم الكامل</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

                <div className="space-y-2 sm:w-1/2">
                  <label className="text-sm font-medium">العمر</label>
                  <Input 
                    type="number" 
                    value={formData.age} 
                    onChange={e => setFormData({...formData, age: e.target.value})} 
                    dir="ltr"
                    min="5"
                    max="100"
                  />
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" isLoading={updateMutation.isPending} className="gap-2">
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Lock className="w-5 h-5 text-primary" />
                تغيير كلمة المرور
              </CardTitle>
              <CardDescription>
                تحديث كلمة المرور الخاصة بحسابك
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">كلمة المرور الحالية</label>
                  <Input 
                    type="password" 
                    value={passwordData.currentPassword} 
                    onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                    required 
                    dir="ltr"
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">كلمة المرور الجديدة</label>
                    <Input 
                      type="password" 
                      value={passwordData.newPassword} 
                      onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})} 
                      required 
                      dir="ltr"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">تأكيد كلمة المرور</label>
                    <Input 
                      type="password" 
                      value={passwordData.confirmPassword} 
                      onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                      required 
                      dir="ltr"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <Button type="submit" variant="secondary" className="gap-2">
                    <Lock className="w-4 h-4" />
                    تحديث كلمة المرور
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
