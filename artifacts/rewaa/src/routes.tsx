import React from 'react';
import { Route, Switch, Router as WouterRouter, Redirect } from 'wouter';
import { AuthProvider, useAuth } from '@/lib/auth';
import { Layout } from '@/components/layout';
import Login from '@/pages/login';

// Student Pages
import StudentDashboard from '@/pages/student/dashboard';
import StudentSchedule from '@/pages/student/schedule';
import StudentAchievements from '@/pages/student/achievements';

// Teacher Pages
import TeacherDashboard from '@/pages/teacher/dashboard';

// Admin Pages
import AdminDashboard from '@/pages/admin/dashboard';

// QueryClient is already provided in root App.tsx, but we need our router to be the main export here
// and be imported by the root App.tsx. The workspace structure expects App.tsx to export the component.

import AdminStudents from '@/pages/admin/students';
import AdminTeachers from '@/pages/admin/teachers';
import AdminAchievements from './pages/admin/achievements';
import AdminClasses from './pages/admin/classes';
import StudentCalendar from './pages/student/calendar';
import StudentNotifications from './pages/student/notifications';
import StudentProfile from './pages/student/profile';
import TeacherSchedule from './pages/teacher/schedule';
import TeacherStudentDetail from './pages/teacher/student-detail';
import TeacherStudents from './pages/teacher/students';

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 text-center bg-card rounded-xl border mt-8">
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p className="text-muted-foreground">هذه الصفحة قيد التطوير</p>
  </div>
);

function ProtectedRoute({ component: Component, role, ...rest }: any) {
  const { user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="min-h-[100dvh] flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }
  
  if (!user) {
    return <Redirect to="/login" />;
  }

  if (role && user.role !== role) {
    return <Redirect to={`/${user.role}/dashboard`} />;
  }

  return <Component {...rest} />;
}

function Routes() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-[100dvh] flex items-center justify-center bg-background"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;
  }

  return (
    <Switch>
      <Route path="/login">
        {user ? <Redirect to={`/${user.role}/dashboard`} /> : <Login />}
      </Route>
      
      <Route path="/">
        {user ? <Redirect to={`/${user.role}/dashboard`} /> : <Redirect to="/login" />}
      </Route>

      {/* Student Routes */}
      <Route path="/student/dashboard" component={() => <Layout><ProtectedRoute role="student" component={StudentDashboard} /></Layout>} />
      <Route path="/student/schedule" component={() => <Layout><ProtectedRoute role="student" component={StudentSchedule} /></Layout>} />
      <Route path="/student/achievements" component={() => <Layout><ProtectedRoute role="student" component={StudentAchievements} /></Layout>} />
      <Route path="/student/calendar" component={() => <Layout><ProtectedRoute role="student" component={StudentCalendar} /></Layout>} />
      <Route path="/student/notifications" component={() => <Layout><ProtectedRoute role="student" component={StudentNotifications} /></Layout>} />
      <Route path="/student/profile" component={() => <Layout><ProtectedRoute role="student" component={StudentProfile} /></Layout>} />

      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" component={() => <Layout><ProtectedRoute role="teacher" component={TeacherDashboard} /></Layout>} />
      <Route path="/teacher/students" component={() => <Layout><ProtectedRoute role="teacher" component={TeacherStudents} /></Layout>} />
      <Route path="/teacher/schedule" component={() => <Layout><ProtectedRoute role="teacher" component={TeacherSchedule} /></Layout>} />
      <Route path="/teacher/student/:id" component={() => <Layout><ProtectedRoute role="teacher" component={TeacherStudentDetail} /></Layout>} />
      
      {/* Admin Routes */}
      <Route path="/admin/dashboard" component={() => <Layout><ProtectedRoute role="admin" component={AdminDashboard} /></Layout>} />
      <Route path="/admin/students" component={() => <Layout><ProtectedRoute role="admin" component={AdminStudents} /></Layout>} />
      <Route path="/admin/teachers" component={() => <Layout><ProtectedRoute role="admin" component={AdminTeachers} /></Layout>} />
      <Route path="/admin/classes" component={() => <Layout><ProtectedRoute role="admin" component={AdminClasses} /></Layout>} />
      <Route path="/admin/achievements" component={() => <Layout><ProtectedRoute role="admin" component={AdminAchievements} /></Layout>} />

      <Route component={() => (
        <Layout>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h1 className="text-4xl font-bold text-primary mb-4">404</h1>
            <p className="text-lg text-muted-foreground">الصفحة غير موجودة</p>
          </div>
        </Layout>
      )} />
    </Switch>
  );
}

function MainApp() {
  return (
    <AuthProvider>
      <Routes />
    </AuthProvider>
  );
}

// Ensure the default App root handles QueryClient wrapping correctly.
// We'll update src/App.tsx directly to wrap everything properly.
export default MainApp;
