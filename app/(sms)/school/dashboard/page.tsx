'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, UserCheck, Home, ArrowRight, Building2, Sparkles } from 'lucide-react';
import Link from 'next/link';
import SMSLayout from '@/components/sms/SMSLayout';
import StatsCard from '@/components/sms/StatsCard';
import { schoolAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const QUICK_ACTIONS = [
  { label: 'Manage Teachers',  desc: 'Add or update teacher accounts',  href: '/school/teachers',   icon: BookOpen,  gradient: 'from-emerald-500 to-teal-600',  glow: 'hover:shadow-emerald-500/20' },
  { label: 'Manage Students',  desc: 'Enroll and manage student list',  href: '/school/students',   icon: Users,     gradient: 'from-violet-500 to-purple-600', glow: 'hover:shadow-violet-500/20' },
  { label: 'Manage Principals',desc: 'School leadership team',          href: '/school/principals', icon: UserCheck, gradient: 'from-amber-500 to-orange-600',  glow: 'hover:shadow-amber-500/20' },
  { label: 'School Settings',  desc: 'Update school profile & info',    href: '/school/settings',   icon: Building2, gradient: 'from-sky-500 to-cyan-600',     glow: 'hover:shadow-sky-500/20' },
];

export default function SchoolDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ teachers: 0, students: 0, principals: 0, classrooms: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    schoolAPI.getDashboard()
      .then(r => setStats(r.data.data.stats))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SMSLayout allowedRoles={['school']}>
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
            <div className="absolute -top-10 -right-10 w-56 h-56 rounded-full bg-sky-500/5 blur-3xl" />
            <div className="absolute -bottom-6 -left-6 w-40 h-40 rounded-full bg-cyan-500/5 blur-3xl" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-sky-400">School Portal</span>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              {greeting},{' '}
              <span className="gradient-text-cyan">{user?.name?.split(' ')[0] || 'Admin'}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              Manage your school staff and student community.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Teachers"   value={loading ? 0 : stats.teachers}   icon={BookOpen}  color="text-emerald-400" iconBg="from-emerald-500/20 to-emerald-600/10" delay={0}    />
          <StatsCard label="Students"   value={loading ? 0 : stats.students}   icon={Users}     color="text-violet-400"  iconBg="from-violet-500/20 to-violet-600/10"  delay={0.06} />
          <StatsCard label="Principals" value={loading ? 0 : stats.principals} icon={UserCheck} color="text-amber-400"   iconBg="from-amber-500/20 to-amber-600/10"   delay={0.12} />
          <StatsCard label="Classrooms" value={loading ? 0 : stats.classrooms} icon={Home}      color="text-sky-400"     iconBg="from-sky-500/20 to-sky-600/10"       delay={0.18} />
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, type: 'spring', stiffness: 260, damping: 24 }}
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action, i) => (
              <motion.div
                key={action.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 + i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
              >
                <Link
                  href={action.href}
                  className={cn(
                    'glass-card-interactive p-5 flex items-center gap-4 group',
                    'shadow-lg', action.glow,
                    'transition-shadow duration-300',
                  )}
                >
                  <div className={cn(
                    'icon-box-lg bg-gradient-to-br shadow-lg flex-shrink-0',
                    action.gradient,
                  )}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm">{action.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">{action.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200 shrink-0" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </SMSLayout>
  );
}
