'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CalendarDays, BarChart3, ClipboardList, UserCheck,
  DollarSign, FileQuestion, ArrowRight, Sparkles, Brain,
  TrendingUp, AlertCircle, CheckCircle2
} from 'lucide-react';
import Link from 'next/link';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface DashboardData {
  attendancePercent: number;
  upcomingQuizzes:   { title: string; dueDate: string }[];
  recentGrades:      { score: number; maxScore: number; type: string; createdAt: string }[];
  pendingHomework:   { title: string; dueDate: string }[];
  overduePayments:   number;
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getDashboard()
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const statCards = [
    { label: 'Attendance',       value: `${data?.attendancePercent ?? 0}%`, icon: UserCheck,   color: 'text-emerald-400', iconBg: 'from-emerald-500/20 to-emerald-600/10', href: '/student/attendance' },
    { label: 'Upcoming Quizzes', value: data?.upcomingQuizzes.length ?? 0,  icon: FileQuestion, color: 'text-violet-400',  iconBg: 'from-violet-500/20 to-violet-600/10',  href: '/student/quizzes'  },
    { label: 'Pending Homework', value: data?.pendingHomework.length ?? 0,  icon: ClipboardList,color: 'text-amber-400',   iconBg: 'from-amber-500/20 to-amber-600/10',    href: '/student/homework' },
    { label: 'Due Payments',     value: data?.overduePayments ?? 0,         icon: DollarSign,   color: 'text-rose-400',    iconBg: 'from-rose-500/20 to-rose-600/10',      href: '/student/payments' },
  ];

  const quickLinks = [
    { label: 'AI Tutor',  desc: 'Ask your AI study buddy',   href: '/student/ai',       icon: Brain,       gradient: 'from-indigo-500 via-violet-500 to-purple-600', badge: 'AI' },
    { label: 'Calendar',  desc: 'View class schedule',        href: '/student/calendar', icon: CalendarDays, gradient: 'from-sky-500 to-cyan-600' },
    { label: 'My Grades', desc: 'See all your scores',        href: '/student/grades',   icon: BarChart3,   gradient: 'from-emerald-500 to-teal-600' },
  ];

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-7 max-w-5xl mx-auto">

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="relative glass-card p-6 overflow-hidden"
        >
          <div className="glow-line-top" />
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-indigo-500/7 blur-3xl" />
            <div className="absolute -bottom-8 left-0 w-48 h-48 rounded-full bg-violet-500/5 blur-3xl" />
          </div>
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Student Portal</span>
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                {greeting},{' '}
                <span className="gradient-text">{user?.name?.split(' ')[0] || 'Student'}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5">
                Track your academic progress and stay on top of your studies.
              </p>
            </div>

            {/* Attendance ring */}
            {!loading && data && (
              <div className="hidden sm:flex flex-col items-center shrink-0">
                <div className="relative w-16 h-16">
                  <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="hsl(240 22% 14%)" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="hsl(160 84% 39%)"
                      strokeWidth="3"
                      strokeDasharray={`${(data.attendancePercent / 100) * 100} 100`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black text-emerald-400">
                      {data.attendancePercent}%
                    </span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1 font-medium">Attendance</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.07, type: 'spring', stiffness: 260, damping: 22 }}
            >
              <Link href={card.href} className="block group">
                <div className="glass-card p-5 overflow-hidden transition-all duration-300 group-hover:border-white/[0.12] group-hover:-translate-y-1">
                  <div className="glow-line-top" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        {card.label}
                      </p>
                      <p className={cn('text-3xl font-black tabular-nums', card.color)}>
                        {loading ? '—' : card.value}
                      </p>
                    </div>
                    <div className={cn('icon-box bg-gradient-to-br', card.iconBg, card.color)}>
                      <card.icon className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-xs text-muted-foreground/60 group-hover:text-muted-foreground transition-colors">
                    <ArrowRight className="w-3 h-3" />
                    <span>View details</span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Lower grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

          {/* Upcoming Quizzes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, type: 'spring', stiffness: 260, damping: 24 }}
            className="lg:col-span-3 glass-card overflow-hidden"
          >
            <div className="glow-line-top" style={{
              background: 'linear-gradient(90deg, transparent, hsl(265 89% 66% / 0.3), transparent)'
            }} />
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <div className="icon-box bg-violet-500/10 border border-violet-500/20 text-violet-400">
                  <FileQuestion className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-foreground text-sm">Upcoming Quizzes</h2>
              </div>
              <Link href="/student/quizzes" className="text-xs text-violet-400 hover:text-violet-300 font-medium transition-colors">
                View all
              </Link>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {loading ? (
                [1,2,3].map(i => (
                  <div key={i} className="px-5 py-3.5 flex items-center gap-3">
                    <div className="skeleton h-3 w-2/3 rounded" />
                    <div className="skeleton h-3 w-1/4 rounded ml-auto" />
                  </div>
                ))
              ) : !data?.upcomingQuizzes.length ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400/40" />
                  <p className="text-sm text-muted-foreground">All clear — no upcoming quizzes</p>
                </div>
              ) : data.upcomingQuizzes.map((q, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                  <p className="text-sm font-medium text-foreground truncate flex-1">{q.title}</p>
                  <span className="badge badge-violet ml-3 shrink-0 text-[10px]">
                    {new Date(q.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Recent Grades */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.34, type: 'spring', stiffness: 260, damping: 24 }}
            className="lg:col-span-2 glass-card overflow-hidden"
          >
            <div className="glow-line-top" style={{
              background: 'linear-gradient(90deg, transparent, hsl(160 84% 39% / 0.3), transparent)'
            }} />
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-2.5">
                <div className="icon-box bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <h2 className="font-bold text-foreground text-sm">Recent Grades</h2>
              </div>
            </div>
            <div className="divide-y divide-white/[0.04]">
              {loading ? (
                [1,2,3].map(i => (
                  <div key={i} className="px-5 py-3.5 flex items-center justify-between gap-3">
                    <div className="skeleton h-3 w-1/2 rounded" />
                    <div className="skeleton h-4 w-12 rounded" />
                  </div>
                ))
              ) : !data?.recentGrades.length ? (
                <div className="flex flex-col items-center py-10 gap-2">
                  <BarChart3 className="w-8 h-8 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No grades yet</p>
                </div>
              ) : data.recentGrades.map((g, i) => {
                const pct = Math.round((g.score / g.maxScore) * 100);
                const pass = pct >= 60;
                return (
                  <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-white/[0.02] transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground capitalize truncate">{g.type}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0 ml-2">
                      {pass
                        ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        : <AlertCircle  className="w-3.5 h-3.5 text-rose-400" />}
                      <span className={cn('text-sm font-black tabular-nums', pass ? 'text-emerald-400' : 'text-rose-400')}>
                        {pct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 260, damping: 24 }}
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Study Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {quickLinks.map((link, i) => (
              <Link key={link.href} href={link.href} className="glass-card-interactive p-4 flex flex-col gap-3 group">
                <div className="flex items-start justify-between">
                  <div className={cn('icon-box bg-gradient-to-br shadow-lg', link.gradient)}>
                    <link.icon className="w-5 h-5 text-white" />
                  </div>
                  {link.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
                      {link.badge}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{link.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </SMSLayout>
  );
}
