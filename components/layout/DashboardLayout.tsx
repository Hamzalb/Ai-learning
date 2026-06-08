'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from './Sidebar';
import { useAuthStore } from '@/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, fetchUser, token } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  // Wait for Zustand persist to hydrate before running any auth checks.
  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated && !token) {
      fetchUser().catch(() => router.push('/login'));
    }
  }, [hydrated, isAuthenticated, token, fetchUser, router]);

  if (!hydrated || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse" />
          <p className="text-muted-foreground text-sm">Loading…</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-dvh bg-background flex">
      <Sidebar />
      {/* mr-64 on desktop where sidebar is visible; full width on mobile */}
      <main className="flex-1 min-h-dvh overflow-y-auto lg:ml-64">
        {children}
      </main>
    </div>
  );
}
