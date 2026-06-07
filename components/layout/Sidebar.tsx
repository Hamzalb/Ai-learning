'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, MessageSquare, FileText, Brain,
  BookOpen, Settings, LogOut, Zap, Star, CreditCard,
  BarChart2, GraduationCap, X
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'لوحة التحكم' },
  { href: '/chat', icon: MessageSquare, label: 'المساعد الذكي' },
  { href: '/pdf', icon: FileText, label: 'مستنداتي' },
  { href: '/quiz', icon: Brain, label: 'الاختبارات' },
  { href: '/flashcards', icon: CreditCard, label: 'البطاقات' },
  { href: '/progress', icon: BarChart2, label: 'التقدم' }
];

const bottomItems = [
  { href: '/settings', icon: Settings, label: 'الإعدادات' }
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const isTeacher = user?.role === 'teacher' || user?.role === 'admin';

  const allNavItems = isTeacher
    ? [...navItems, { href: '/teacher', icon: GraduationCap, label: 'لوحة الأستاذ' }]
    : navItems;

  const sidebarContent = (
    <div className="w-64 h-full bg-card border-l border-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-3" onClick={onClose}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-foreground text-sm">منصة التعلم</h1>
            <p className="text-xs text-muted-foreground">Lebanese AI</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-secondary text-muted-foreground lg:hidden">
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="font-semibold text-sm text-foreground truncate">{user?.name || 'المستخدم'}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Zap className="w-3 h-3 text-yellow-400" />
              <span className="text-xs text-muted-foreground">{user?.xp || 0} XP</span>
              <span className="text-xs text-muted-foreground">•</span>
              <Star className="w-3 h-3 text-orange-400" />
              <span className="text-xs text-muted-foreground">{user?.streak || 0} يوم</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {allNavItems.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={cn('sidebar-item', isActive && 'active')}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="font-medium text-sm">{label}</span>
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-l-full"
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="p-4 border-t border-border space-y-1">
        {bottomItems.map(({ href, icon: Icon, label }) => (
          <Link key={href} href={href} onClick={onClose}
            className={cn('sidebar-item', pathname === href && 'active')}>
            <Icon className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium text-sm">{label}</span>
          </Link>
        ))}
        <button onClick={logout}
          className="sidebar-item w-full text-destructive hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className="font-medium text-sm">تسجيل الخروج</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex w-64 h-screen fixed right-0 top-0 z-40"
      >
        {sidebarContent}
      </motion.aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full z-50 lg:hidden"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
