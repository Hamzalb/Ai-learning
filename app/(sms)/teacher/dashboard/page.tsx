'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Home, BarChart3, FileQuestion, FileText, ClipboardList,
  ArrowRight, Sparkles, BookOpen, DollarSign
} from 'lucide-react';
import Link from 'next/link';
import SMSLayout from '@/components/sms/SMSLayout';
import StatsCard from '@/components/sms/StatsCard';
import { teacherAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  { label: 'Enter Grades',     desc: 'Record student scores',    href: '/teacher/grades',    icon: BarChart3,    gradient: 'from-emerald-500 to-teal-600' },
  { label: 'Upload Document',  desc: 'Share class materials',    href: '/teacher/documents', icon: FileText,     gradient: 'from-sky-500 to-cyan-600' },
  { label: 'Create Quiz',      desc: 'Build new assessment',     href: '/teacher/quizzes',   icon: FileQuestion, gradient: 'from-violet-500 to-purple-600' },
  { label: 'Assign Homework',  desc: 'Set homework for class',   href: '/teacher/homework',  icon: ClipboardList, gradient: 'from-amber-500 to-orange-600' },
  { label: 'My Classes',       desc: 'View assigned classrooms', href: '/teacher/classes',   icon: Home,          gradient: 'from-rose-500 to-pink-600' },
  { label: 'Payslips',         desc: 'View salary history',      href: '/teacher/payslips',  icon: DollarSign,    gradient: 'from-indigo-500 to-blue-600' },
];

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ classes: 0, pendingGrades: 0, quizzes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherAPI.getDashboard()
      .then(r => setStats(r.data.data.stats))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SMSLayout allowedRoles={['teacher']}>
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
            <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full bg-emerald-500/6 blur-3xl" />
            <div className="absolute -bottom-8 left-10 w-44 h-44 rounded-full bg-teal-500/4 blur-3xl" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Teacher Panel</span>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              {greeting},{' '}
              <span className="gradient-text">{user?.name?.split(' ')[0] || 'Teacher'}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Manage your classes, grades, quizzes, and homework.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatsCard label="My Classes"    value={loading ? 0 : stats.classes}      icon={BookOpen}     color="text-sky-400"    iconBg="from-sky-500/20 to-sky-600/10"    delay={0} />
          <StatsCard label="Quizzes"       value={loading ? 0 : stats.quizzes}      icon={FileQuestion} color="text-violet-400"  iconBg="from-violet-500/20 to-violet-600/10" delay={0.06} />
          <StatsCard label="Pending Grades" value={loading ? 0 : stats.pendingGrades} icon={BarChart3}  color="text-amber-400"   iconBg="from-amber-500/20 to-amber-600/10"   delay={0.12} />
        </div>

        {/* Quick Actions grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 24 }}
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.24 + i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
              >
                <Link href={action.href} className="glass-card-interactive p-4 flex flex-col gap-3 group h-full">
                  <div className={cn('icon-box bg-gradient-to-br shadow-lg', action.gradient)}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground/60 group-hover:text-foreground group-hover:translate-x-0.5 transition-all duration-200" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </SMSLayout>
  );
}
