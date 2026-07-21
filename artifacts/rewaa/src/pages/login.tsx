import React from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useLogin } from '@workspace/api-client-react';
import { BookOpen, User, GraduationCap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [, setLocation] = useLocation();
  const { loginUser } = useAuth();
  const [identifier, setIdentifier] = React.useState('');
  const [password, setPassword] = React.useState('');

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        loginUser(data.user);
        setLocation(`/${data.role}/dashboard`);
      }
    }
  });

  const handleDemoLogin = (role: 'student' | 'teacher' | 'admin') => {
    loginMutation.mutate({
      data: {
        identifier: `${role}@rewaa.com`,
        password: 'password123'
      }
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({
      data: {
        identifier,
        password
      }
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col md:flex-row islamic-pattern-bg">
      <div className="flex-1 flex flex-col justify-center px-6 py-12 md:px-12 lg:px-24">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
        >
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center p-4 bg-primary/5 rounded-full mb-4 text-primary">
              <BookOpen size={48} strokeWidth={1.5} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-primary mb-2 tracking-tight">رِواء</h1>
            <p className="text-muted-foreground text-lg">أكاديمية تحفيظ القرآن الكريم</p>
          </div>

          <Card className="border-t-4 border-t-primary shadow-xl bg-background/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">بريد إلكتروني أو رقم الهاتف</label>
                  <Input 
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="أدخل بريدك الإلكتروني" 
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">كلمة المرور</label>
                  <Input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="h-12 text-left" 
                    dir="ltr"
                  />
                </div>
                {loginMutation.isError && (
                  <p className="text-sm text-destructive">بيانات الاعتماد غير صحيحة.</p>
                )}
                <Button 
                  type="submit" 
                  className="w-full h-12 text-lg" 
                  isLoading={loginMutation.isPending}
                >
                  دخول
                </Button>
              </form>

              <div className="mt-8">
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">حسابات تجريبية للتطوير</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleDemoLogin('student')} className="flex flex-col h-auto py-3 gap-2">
                    <User className="w-5 h-5 text-secondary" />
                    <span>طالب</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDemoLogin('teacher')} className="flex flex-col h-auto py-3 gap-2">
                    <GraduationCap className="w-5 h-5 text-primary" />
                    <span>معلم</span>
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDemoLogin('admin')} className="flex flex-col h-auto py-3 gap-2">
                    <ShieldCheck className="w-5 h-5 text-destructive" />
                    <span>مشرف</span>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
      <div className="hidden md:flex flex-1 bg-primary islamic-pattern-sidebar text-primary-foreground items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/50 to-primary/90 pointer-events-none" />
        <div className="relative z-10 text-center max-w-lg">
          <h2 className="text-4xl font-bold mb-6 leading-tight">ورتل القرآن ترتيلاً</h2>
          <p className="text-primary-foreground/80 text-xl leading-relaxed">
            منصة متكاملة لإدارة حلقات التحفيظ ومتابعة إنجازات الطلاب في رحلتهم مع كتاب الله.
          </p>
        </div>
      </div>
    </div>
  );
}
