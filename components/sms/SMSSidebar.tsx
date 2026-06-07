'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap, LayoutDashboard, Building2, Users, UserCheck, Shield, FileText,
  ChevronLeft, ChevronRight, LogOut, BookOpen, CalendarDays, ClipboardList,
  BarChart3, FileQuestion, Home, DollarSign, Bell, Settings
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { UserRole } from '@/types';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  super_admin: [
    { label: 'Dashboard', href: '/super-admin/dashboard', icon: LayoutDashboard },
    { label: 'Schools', href: '/super-admin/schools', icon: Building2 },
    { label: 'Teachers', href: '/super-admin/teachers', icon: BookOpen },
    { label: 'Students', href: '/super-admin/students', icon: Users },
    { label: 'Principals', href: '/super-admin/principals', icon: UserCheck },
    { label: 'Permissions', href: '/super-admin/permissions', icon: Shield },
    { label: 'Audit Logs', href: '/super-admin/audit-logs', icon: FileText }
  ],
  school: [
    { label: 'Dashboard', href: '/school/dashboard', icon: LayoutDashboard },
    { label: 'Teachers', href: '/school/teachers', icon: BookOpen },
    { label: 'Students', href: '/school/students', icon: Users },
    { label: 'Principals', href: '/school/principals', icon: UserCheck },
    { label: 'Settings', href: '/school/settings', icon: Settings }
  ],
  principal: [
    { label: 'Dashboard', href: '/principal/dashboard', icon: LayoutDashboard },
    { label: 'Classrooms', href: '/principal/classrooms', icon: Home },
    { label: 'Subjects', href: '/principal/subjects', icon: BookOpen },
    { label: 'Schedules', href: '/principal/schedules', icon: CalendarDays }
  ],
  teacher: [
    { label: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
    { label: 'My Classes', href: '/teacher/classes', icon: Home },
    { label: 'Grades', href: '/teacher/grades', icon: BarChart3 },
    { label: 'Documents', href: '/teacher/documents', icon: FileText },
    { label: 'Quizzes', href: '/teacher/quizzes', icon: FileQuestion },
    { label: 'Homework', href: '/teacher/homework', icon: ClipboardList }
  ],
  student: [
    { label: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
    { label: 'Documents', href: '/student/documents', icon: FileText },
    { label: 'Quizzes', href: '/student/quizzes', icon: FileQuestion },
    { label: 'Grades', href: '/student/grades', icon: BarChart3 },
    { label: 'Attendance', href: '/student/attendance', icon: UserCheck },
    { label: 'Calendar', href: '/student/calendar', icon: CalendarDays },
    { label: 'Homework', href: '/student/homework', icon: ClipboardList },
    { label: 'Payments', href: '/student/payments', icon: DollarSign },
    { label: 'AI Tutor', href: '/student/ai', icon: Bell }
  ]
};

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  school: 'School',
  principal: 'Principal',
  teacher: 'Teacher',
  student: 'Student'
};

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'from-red-500 via-orange-500 to-amber-500',
  school: 'from-blue-500 via-cyan-500 to-teal-500',
  principal: 'from-violet-500 via-purple-500 to-indigo-500',
  teacher: 'from-emerald-500 via-green-500 to-lime-500',
  student: 'from-primary via-violet-500 to-purple-600'
};

export default function SMSSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const role = user?.role as UserRole;
  const items = NAV_ITEMS[role] || [];

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="relative h-screen flex flex-col shrink-0 border-r border-white/[0.06] bg-background/80 backdrop-blur-xl z-30"
    >
      {/* Toggle button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-card border border-white/[0.08] flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10 shadow-lg"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo */}
      <div className="p-4 flex items-center gap-3 min-h-[64px]">
        <div className={cn('w-9 h-9 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 shadow-lg', ROLE_COLORS[role] || 'from-primary to-violet-600')}>
          <GraduationCap className="w-5 h-5 text-white" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              className="overflow-hidden"
            >
              <p className="text-sm font-bold text-foreground leading-tight">School Portal</p>
              <p className="text-[10px] text-muted-foreground">{ROLE_LABELS[role] || 'User'}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="h-px bg-white/[0.04] mx-4" />

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 mt-2">
        {items.map((item) => {
          const active = pathname === item.href || (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                active
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.03]'
              )}
            >
              {active && (
                <motion.div
                  layoutId="sms-sidebar-active"
                  className="absolute inset-0 bg-white/[0.06] border border-white/[0.06] rounded-xl"
                  transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                />
              )}
              <item.icon className={cn('w-4.5 h-4.5 shrink-0 relative z-10 transition-colors', active ? 'text-primary' : 'group-hover:text-foreground')} style={{ width: '18px', height: '18px' }} />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="relative z-10 truncate"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      <div className="h-px bg-white/[0.04] mx-4" />

      {/* User + Logout */}
      <div className="p-3 space-y-1">
        <div className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl', !collapsed && 'bg-white/[0.02]')}>
          <div className={cn('w-8 h-8 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0 text-white text-sm font-bold', ROLE_COLORS[role] || 'from-primary to-violet-600')}>
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="min-w-0 flex-1"
              >
                <p className="text-xs font-semibold text-foreground truncate">{user?.name}</p>
                <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/5 transition-all duration-200"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  );
}
