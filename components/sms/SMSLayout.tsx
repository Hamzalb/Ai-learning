'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import SMSSidebar from './SMSSidebar';
import SMSTopbar from './SMSTopbar';
import { UserRole } from '@/types';

interface SMSLayoutProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export default function SMSLayout({ children, allowedRoles }: SMSLayoutProps) {
  const { user, isAuthenticated, fetchUser, token } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated && !token) {
      router.push('/login');
      return;
    }
    if (isAuthenticated && !user) {
      fetchUser();
    }
  }, [isAuthenticated, token, user, router, fetchUser]);

  useEffect(() => {
    if (user && allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
      router.push('/login');
    }
  }, [user, allowedRoles, router]);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <SMSSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SMSTopbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
