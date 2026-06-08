'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, LayoutDashboard, Building2, Users, UserCheck, Shield, FileText,
  ChevronLeft, ChevronRight, LogOut, BookOpen, CalendarDays, ClipboardList,
  BarChart3, FileQuestion, Home, DollarSign, Brain, Settings, Sparkles,
  ClipboardCheck, X,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard',   href: '/super-admin/dashboard',   icon: LayoutDashboard },
    { label: 'Schools',     href: '/super-admin/schools',     icon: Building2 },
    { label: 'Teachers',    href: '/super-admin/teachers',    icon: BookOpen },
    { label: 'Students',    href: '/super-admin/students',    icon: Users },
    { label: 'Principals',  href: '/super-admin/principals',  icon: UserCheck },
    { label: 'Permissions', href: '/super-admin/permissions', icon: Shield },
    { label: 'Audit Logs',  href: '/super-admin/audit-logs',  icon: FileText },
  ],
  school: [
    { label: 'Dashboard',  href: '/school/dashboard',  icon: LayoutDashboard },
    { label: 'Teachers',   href: '/school/teachers',   icon: BookOpen },
    { label: 'Students',   href: '/school/students',   icon: Users },
    { label: 'Principals', href: '/school/principals', icon: UserCheck },
    { label: 'Settings',   href: '/school/settings',   icon: Settings },
  ],
  principal: [
    { label: 'Dashboard',   href: '/principal/dashboard',  icon: LayoutDashboard },
    { label: 'Classrooms',  href: '/principal/classrooms', icon: Home },
    { label: 'Subjects',    href: '/principal/subjects',   icon: BookOpen },
    { label: 'Schedules',   href: '/principal/schedules',  icon: CalendarDays },
    { label: 'Payslips',    href: '/principal/payslips',   icon: DollarSign },
  ],
  teacher: [
    { label: 'Dashboard',   href: '/teacher/dashboard',  icon: LayoutDashboard },
    { label: 'My Classes',  href: '/teacher/classes',    icon: Home },
    { label: 'Grades',      href: '/teacher/grades',     icon: BarChart3 },
    { label: 'Documents',   href: '/teacher/documents',  icon: FileText },
    { label: 'Quizzes',     href: '/teacher/quizzes',    icon: FileQuestion },
    { label: 'Homework',    href: '/teacher/homework',   icon: ClipboardList },
    { label: 'Payslips',    href: '/teacher/payslips',   icon: DollarSign },
  ],
  student: [
    { label: 'Dashboard',  href: '/student/dashboard',  icon: LayoutDashboard },
    { label: 'Documents',  href: '/student/documents',  icon: FileText },
    { label: 'Quizzes',    href: '/student/quizzes',    icon: FileQuestion },
    { label: 'Grades',     href: '/student/grades',     icon: BarChart3 },
    { label: 'Attendance', href: '/student/attendance', icon: ClipboardCheck },
    { label: 'Calendar',   href: '/student/calendar',   icon: CalendarDays },
    { label: 'Homework',   href: '/student/homework',   icon: ClipboardList },
    { label: 'Payments',   href: '/student/payments',   icon: DollarSign },
    { label: 'AI Tutor',   href: '/student/ai',         icon: Brain, badge: 'AI' },
  ],
};

const ROLE_CONFIG: Record<UserRole, {
  label: string;
  gradient: string;
  glow: string;
  accent: string;
}> = {
  super_admin: {
    label: 'Super Admin',
    gradient: 'from-rose-500 via-orange-500 to-amber-500',
    glow: 'shadow-rose-500/30',
    accent: 'text-rose-400',
  },
  school: {
    label: 'School Admin',
    gradient: 'from-sky-500 via-cyan-500 to-teal-500',
    glow: 'shadow-sky-500/30',
    accent: 'text-sky-400',
  },
  principal: {
    label: 'Principal',
    gradient: 'from-violet-500 via-purple-500 to-indigo-500',
    glow: 'shadow-violet-500/30',
    accent: 'text-violet-400',
  },
  teacher: {
    label: 'Teacher',
    gradient: 'from-emerald-500 via-green-500 to-teal-500',
    glow: 'shadow-emerald-500/30',
    accent: 'text-emerald-400',
  },
  student: {
    label: 'Student',
    gradient: 'from-indigo-500 via-violet-500 to-purple-500',
    glow: 'shadow-indigo-500/30',
    accent: 'text-indigo-400',
  },
};

const SIDEBAR_STYLE = {
  background: 'linear-gradient(180deg, hsl(240 42% 5.5%) 0%, hsl(240 38% 5%) 100%)',
  borderRight: '1px solid hsl(240 22% 14%)',
};

/* ── Shared inner sidebar content ─────────────────────── */
function SidebarContent({
  collapsed,
  onCollapse,
  onClose,
  layoutPrefix,
}: {
  collapsed: boolean;
  onCollapse?: () => void;
  onClose?: () => void;
  layoutPrefix: string;
}) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const role = user?.role as UserRole;
  const items = NAV_ITEMS[role] || [];
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.student;

  return (
    <>
      {/* Top glow line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent pointer-events-none" />

      {/* Desktop collapse button */}
      {onCollapse && (
        <button
          onClick={onCollapse}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'absolute -right-3 top-8 z-20',
            'w-6 h-6 rounded-full flex items-center justify-center',
            'bg-card border border-white/[0.10] text-muted-foreground',
            'hover:text-foreground hover:border-white/[0.18]',
            'shadow-lg shadow-black/30 transition-all duration-200',
          )}
        >
          {collapsed
            ? <ChevronRight className="w-3.5 h-3.5" />
            : <ChevronLeft  className="w-3.5 h-3.5" />}
        </button>
      )}

      {/* Mobile close button */}
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close navigation"
          className={cn(
            'absolute right-3 top-4 z-20',
            'w-8 h-8 rounded-xl flex items-center justify-center',
            'text-muted-foreground hover:text-foreground hover:bg-white/[0.05]',
            'transition-all duration-200',
          )}
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* ── Header / Logo ─────────────────────────────────── */}
      <div className="flex items-center gap-3 px-4 py-5 min-h-[72px]">
        <div className={cn(
          'w-10 h-10 rounded-2xl bg-gradient-to-br flex items-center justify-center shrink-0',
          `shadow-lg ${config.glow}`,
          config.gradient,
        )}>
          <GraduationCap className="w-5 h-5 text-white drop-shadow" />
        </div>

        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden min-w-0"
            >
              <p className="text-sm font-bold text-foreground leading-tight tracking-tight">
                EduFlow
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Sparkles className={cn('w-2.5 h-2.5', config.accent)} />
                <p className={cn('text-[10px] font-semibold uppercase tracking-wider', config.accent)}>
                  {config.label}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Divider */}
      <div className="h-px mx-4 bg-white/[0.05]" />

      {/* ── Navigation ────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-2.5 py-3 space-y-0.5">
        {items.map((item) => {
          const active = pathname === item.href ||
            (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href));

          return (
            <div
              key={item.href}
              className="relative"
              onMouseEnter={() => setHoveredItem(item.href)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <Link
                href={item.href}
                onClick={onClose}
                className={cn(
                  'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                  'transition-all duration-200 group outline-none',
                  active
                    ? 'text-foreground'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {/* Active background */}
                {active && (
                  <motion.div
                    layoutId={`sms-nav-active-${layoutPrefix}`}
                    className={cn(
                      'absolute inset-0 rounded-xl',
                      'bg-gradient-to-r from-white/[0.07] to-white/[0.04]',
                      'border border-white/[0.08]',
                    )}
                    style={{
                      boxShadow: `inset 0 0 0 1px hsl(var(--primary) / 0.12)`,
                    }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}

                {/* Hover background */}
                {!active && hoveredItem === item.href && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 rounded-xl bg-white/[0.03]"
                  />
                )}

                {/* Icon */}
                <item.icon
                  className={cn(
                    'shrink-0 relative z-10 transition-colors duration-200',
                    active ? config.accent : 'text-muted-foreground group-hover:text-foreground',
                  )}
                  style={{ width: 18, height: 18 }}
                />

                {/* Label */}
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="relative z-10 truncate flex-1"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {/* Badge */}
                {item.badge && !collapsed && (
                  <span className={cn(
                    'relative z-10 text-[9px] font-bold px-1.5 py-0.5 rounded-full',
                    'bg-gradient-to-r from-indigo-500 to-violet-500 text-white',
                  )}>
                    {item.badge}
                  </span>
                )}

                {/* Active dot (collapsed) */}
                {active && collapsed && (
                  <div className={cn(
                    'absolute right-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full',
                    config.accent.replace('text-', 'bg-'),
                  )} />
                )}
              </Link>

              {/* Tooltip when collapsed */}
              {collapsed && hoveredItem === item.href && (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="tooltip"
                >
                  {item.label}
                  {item.badge && (
                    <span className="ml-1.5 text-[9px] font-bold px-1 py-0.5 rounded bg-indigo-500/20 text-indigo-400">
                      {item.badge}
                    </span>
                  )}
                </motion.div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Divider */}
      <div className="h-px mx-4 bg-white/[0.05]" />

      {/* ── User Section ──────────────────────────────────── */}
      <div className="p-2.5 space-y-1">
        {/* User info */}
        <div className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl',
          !collapsed && 'bg-white/[0.02] border border-white/[0.04]',
        )}>
          <div className="relative shrink-0">
            <div className={cn(
              'w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center',
              'text-white text-sm font-black shadow-lg',
              config.gradient,
            )}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            {/* Online indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[hsl(240_42%_5.5%)]" />
          </div>

          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="min-w-0 flex-1"
              >
                <p className="text-xs font-bold text-foreground truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.email}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Sign out */}
        <button
          onClick={logout}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-muted-foreground hover:text-rose-400',
            'hover:bg-rose-500/[0.08] transition-all duration-200',
            'group',
          )}
        >
          <LogOut
            className="shrink-0 transition-transform duration-200 group-hover:-translate-x-0.5"
            style={{ width: 18, height: 18 }}
          />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </>
  );
}

/* ── Props ──────────────────────────────────────────────── */
interface SMSSidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

/* ── Main export ────────────────────────────────────────── */
export default function SMSSidebar({ mobileOpen = false, onMobileClose }: SMSSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  // Auto-close mobile drawer on route change
  useEffect(() => {
    if (mobileOpen) onMobileClose?.();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* ── Desktop sidebar (hidden below lg breakpoint) ── */}
      <motion.aside
        animate={{ width: collapsed ? 68 : 232 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30 }}
        className="hidden lg:flex relative h-full flex-col shrink-0 z-30"
        style={SIDEBAR_STYLE}
      >
        <SidebarContent
          collapsed={collapsed}
          onCollapse={() => setCollapsed(c => !c)}
          layoutPrefix="desktop"
        />
      </motion.aside>

      {/* ── Mobile sidebar drawer (fixed overlay, lg:hidden) ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -240 }}
            animate={{ x: 0 }}
            exit={{ x: -240 }}
            transition={{ type: 'spring', stiffness: 320, damping: 30 }}
            className="lg:hidden fixed top-0 left-0 bottom-0 w-[232px] flex flex-col z-50"
            style={SIDEBAR_STYLE}
          >
            <SidebarContent
              collapsed={false}
              onClose={onMobileClose}
              layoutPrefix="mobile"
            />
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
