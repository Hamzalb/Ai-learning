'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, Bell, Zap, Flame } from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, fetchUser, user } = useAuthStore();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      fetchUser().catch(() => router.push('/login'));
    }
  }, [isAuthenticated, fetchUser, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse" />
          <p className="text-muted-foreground text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:mr-64 min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-card/80 backdrop-blur border-b border-border px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl hover:bg-secondary transition-colors"
          >
            <Menu className="w-5 h-5 text-foreground" />
          </button>

          <div className="flex items-center gap-1.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">AI</span>
            </div>
            <span className="font-bold text-sm text-foreground">منصة التعلم</span>
          </div>

          <div className="flex items-center gap-2">
            {(user?.streak ?? 0) > 0 && (
              <div className="flex items-center gap-1 bg-orange-500/10 px-2 py-1 rounded-lg">
                <Flame className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-semibold text-orange-400">{user?.streak ?? 0}</span>
              </div>
            )}
            <div className="flex items-center gap-1 bg-yellow-500/10 px-2 py-1 rounded-lg">
              <Zap className="w-3.5 h-3.5 text-yellow-400" />
              <span className="text-xs font-semibold text-yellow-400">{user?.xp ?? 0}</span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
