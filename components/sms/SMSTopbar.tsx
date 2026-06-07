'use client';
import { usePathname } from 'next/navigation';
import { Bell } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export default function SMSTopbar() {
  const { user } = useAuthStore();
  const pathname = usePathname();

  const breadcrumb = pathname
    .split('/')
    .filter(Boolean)
    .map(s => s.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()))
    .join(' › ');

  return (
    <header className="h-16 border-b border-white/[0.06] bg-background/60 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      <p className="text-sm text-muted-foreground">{breadcrumb}</p>
      <div className="flex items-center gap-3">
        <button className="relative w-9 h-9 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] flex items-center justify-center text-muted-foreground hover:text-foreground transition-all">
          <Bell className="w-4 h-4" />
        </button>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary via-violet-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-violet-500/20">
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
