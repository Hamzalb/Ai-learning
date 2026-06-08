'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap } from 'lucide-react';
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
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  // Wait for Zustand persist to hydrate from localStorage before checking auth.
  // On the very first render the store shows its initial defaults (not yet loaded),
  // so we must defer the redirect logic until the client has mounted.
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Zustand persist reads localStorage synchronously; by the time any useEffect
    // fires, the store already has the persisted values — so we can safely gate on this.
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated && !token) { router.push('/login'); return; }
    if (isAuthenticated && !user) fetchUser();
  }, [hydrated, isAuthenticated, token, user, router, fetchUser]);

  useEffect(() => {
    if (!hydrated) return;
    if (user && allowedRoles && !allowedRoles.includes(user.role as UserRole)) {
      router.push('/login');
    }
  }, [hydrated, user, allowedRoles, router]);

  /* ── Loading splash (before hydration OR while user loads) ── */
  if (!hydrated || !user) {
    return (
      <div className="min-h-dvh flex flex-col items-center justify-center gap-4 bg-background aurora-bg">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.2, ease: 'linear', repeat: Infinity }}
          className="relative w-12 h-12"
        >
          <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary" />
          <div className="absolute inset-2 rounded-full bg-primary/10 flex items-center justify-center">
            <GraduationCap className="w-3.5 h-3.5 text-primary" />
          </div>
        </motion.div>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-xs font-medium text-muted-foreground tracking-widest uppercase"
        >
          Loading portal…
        </motion.p>
      </div>
    );
  }

  return (
    <div className="flex h-dvh overflow-hidden bg-background">
      {/* Ambient mesh background */}
      <div className="fixed inset-0 mesh-gradient pointer-events-none opacity-50 z-0" />

      {/* Mobile sidebar backdrop */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <SMSSidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <SMSTopbar onMenuToggle={() => setMobileSidebarOpen(o => !o)} />

        {/* Page content — overflow-x hidden prevents any child causing horizontal scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <motion.div
            key="sms-page"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            className="p-3 sm:p-5 lg:p-6 pb-10 safe-bottom"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
