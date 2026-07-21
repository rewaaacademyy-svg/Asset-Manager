import React from 'react';
import { useLocation, Link } from 'wouter';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, LayoutDashboard, Calendar, Award, Bell, User, 
  Users, UsersRound, Settings, LogOut, Menu, X, Sun, Moon
} from 'lucide-react';
import { useTheme } from 'next-themes';

const navItems = {
  student: [
    { label: 'الرئيسية', path: '/student/dashboard', icon: LayoutDashboard },
    { label: 'جدول الحلقات', path: '/student/schedule', icon: Calendar },
    { label: 'الإنجازات', path: '/student/achievements', icon: Award },
    { label: 'التقويم', path: '/student/calendar', icon: Calendar },
    { label: 'الإشعارات', path: '/student/notifications', icon: Bell },
    { label: 'الملف الشخصي', path: '/student/profile', icon: User },
  ],
  teacher: [
    { label: 'الرئيسية', path: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'طلابي', path: '/teacher/students', icon: Users },
    { label: 'الجدول', path: '/teacher/schedule', icon: Calendar },
  ],
  admin: [
    { label: 'الرئيسية', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'الطلاب', path: '/admin/students', icon: Users },
    { label: 'المعلمون', path: '/admin/teachers', icon: UsersRound },
    { label: 'الحلقات', path: '/admin/classes', icon: BookOpen },
    { label: 'الإنجازات', path: '/admin/achievements', icon: Award },
  ]
};

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutUser } = useAuth();
  const [location] = useLocation();
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const { theme, setTheme } = useTheme();

  if (!user) return <>{children}</>;

  const items = navItems[user.role as keyof typeof navItems] || [];

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-sidebar islamic-pattern-sidebar text-sidebar-foreground border-l border-sidebar-border w-64 shadow-xl shrink-0">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
          <BookOpen className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight">رِواء</h2>
          <p className="text-xs text-sidebar-foreground/70">أكاديمية القرآن</p>
        </div>
      </div>
      
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {items.map((item) => {
          const isActive = location.startsWith(item.path);
          return (
            <Link key={item.path} href={item.path} onClick={() => setIsMobileOpen(false)}>
              <span className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group relative cursor-pointer",
                isActive 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground"
              )}>
                <item.icon className={cn("w-5 h-5", isActive ? "text-sidebar-primary" : "text-sidebar-foreground/50 group-hover:text-sidebar-foreground/80")} />
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-sidebar-accent flex items-center justify-center font-bold text-sidebar-accent-foreground">
              {user.name.charAt(0)}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold truncate max-w-[120px]">{user.name}</span>
              <span className="text-xs text-sidebar-foreground/60">
                {user.role === 'student' ? 'طالب' : user.role === 'teacher' ? 'معلم' : 'مشرف'}
              </span>
            </div>
          </div>
          <button onClick={toggleTheme} className="p-2 hover:bg-sidebar-accent rounded-full text-sidebar-foreground/70 transition-colors">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
        
        <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/80 hover:text-destructive hover:bg-destructive/10" onClick={logoutUser}>
          <LogOut className="w-4 h-4 ml-2" />
          تسجيل الخروج
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex h-[100dvh] overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-full z-20 relative">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <div className="relative w-64 h-full transform transition-transform">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Mobile Header */}
        <header className="md:hidden h-16 border-b bg-card flex items-center justify-between px-4 z-10 shadow-sm">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h1 className="font-bold text-primary">رِواء</h1>
          </div>
          <button onClick={() => setIsMobileOpen(true)} className="p-2 -mr-2 text-foreground">
            <Menu className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-8 islamic-pattern-bg">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
