'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, FileText, Brain,
  BookOpen, Settings, LogOut, Zap, Flame
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { href: '/chat', icon: MessageSquare, label: 'المساعد الذكي' },
  { href: '/pdf', icon: FileText, label: 'مستنداتي' },
  { href: '/quiz', icon: Brain, label: 'الاختبارات' }
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();

  return (
    <motion.aside
      initial={{ x: 80, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="w-[260px] h-screen bg-card/40 backdrop-blur-xl border-l border-white/[0.04] flex flex-col fixed right-0 top-0 z-40"
    >
      {/* Logo */}
      <div className="p-5 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/30 transition-shadow">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-[15px] tracking-tight">LearnAI</h1>
            <p className="text-[11px] text-muted-foreground">منصة التعلم الذكية</p>
          </div>
        </Link>
      </div>

      {/* User card */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-md shadow-blue-500/15">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="font-semibold text-sm text-foreground truncate">{user?.name || 'المستخدم'}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center gap-1">
                <Zap className="w-3 h-3 text-amber-400" />
                <span className="text-[11px] text-muted-foreground font-medium">{user?.xp || 0}</span>
              </div>
              <div className="w-px h-3 bg-border" />
              <div className="flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-400" />
                <span className="text-[11px] text-muted-foreground font-medium">{user?.streak || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 mb-2">
        <div className="h-px bg-gradient-to-l from-transparent via-border to-transparent" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'relative flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer group',
                isActive
                  ? 'text-primary'
                  : 'hover:bg-white/[0.03]'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl"
                  style={{
                    background: 'linear-gradient(135deg, hsl(217 91% 60% / 0.08), hsl(262 83% 65% / 0.04))',
                    boxShadow: 'inset 0 0 0 1px hsl(217 91% 60% / 0.12)'
                  }}
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <Icon className="w-[18px] h-[18px] flex-shrink-0 relative z-10" />
              <span className="font-medium text-sm relative z-10">{label}</span>
              {isActive && (
                <motion.div
                  layoutId="sidebar-dot"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-l-full bg-gradient-to-b from-primary to-accent"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 pb-4 space-y-0.5">
        <div className="h-px bg-gradient-to-l from-transparent via-border to-transparent mb-2" />
        <Link
          href="/settings"
          className={cn(
            'relative flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/[0.03] transition-all duration-200 cursor-pointer',
            pathname === '/settings' && 'text-primary bg-primary/[0.06]'
          )}
        >
          <Settings className="w-[18px] h-[18px] flex-shrink-0" />
          <span className="font-medium text-sm">الإعدادات</span>
        </Link>
        <button
          onClick={logout}
          className="flex items-center gap-3 px-4 py-3 rounded-xl w-full text-muted-foreground hover:text-red-400 hover:bg-red-500/[0.06] transition-all duration-200 cursor-pointer"
        >
          <LogOut className="w-[18px] h-[18px] flex-shrink-0" />
          <span className="font-medium text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </motion.aside>
  );
}
