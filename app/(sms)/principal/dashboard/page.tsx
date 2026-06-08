'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, Users, AlertTriangle, CalendarDays, ArrowRight, Sparkles } from 'lucide-react';
import Link from 'next/link';
import SMSLayout from '@/components/sms/SMSLayout';
import StatsCard from '@/components/sms/StatsCard';
import { principalAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';
import { useT } from '@/lib/i18n';

export default function PrincipalDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ classrooms: 0, subjects: 0, teachers: 0, unassigned: 0 });
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    principalAPI.getDashboard()
      .then(r => setStats(r.data.data.stats))
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? t('welcomeBack') : hour < 17 ? t('welcomeBack') : t('welcomeBack');

  const QUICK_LINKS = [
    { label: t('classrooms'),  href: '/principal/classrooms', icon: Home,         color: 'from-sky-500 to-cyan-600',      desc: t('manageStudents') },
    { label: t('subjects'),    href: '/principal/subjects',   icon: BookOpen,     color: 'from-emerald-500 to-teal-600',  desc: t('noSubjects') },
    { label: t('schedules'),   href: '/principal/schedules',  icon: CalendarDays, color: 'from-violet-500 to-purple-600', desc: t('weeklySchedule') },
  ];

  return (
    <SMSLayout allowedRoles={['principal']}>
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
            <div className="absolute -top-12 -right-12 w-60 h-60 rounded-full bg-violet-500/6 blur-3xl" />
          </div>
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">{t('rolePrincipal')}</span>
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              {greeting},{' '}
              <span className="gradient-text">{user?.name?.split(' ')[0] || t('rolePrincipal')}</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1.5">
              {t('overview')} — {t('classrooms')}, {t('schedules')}, {t('subjects')}.
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label={t('classrooms')}      value={loading ? 0 : stats.classrooms}  icon={Home}          color="text-sky-400"    iconBg="from-sky-500/20 to-sky-600/10"       delay={0}    />
          <StatsCard label={t('subjects')}        value={loading ? 0 : stats.subjects}    icon={BookOpen}      color="text-emerald-400" iconBg="from-emerald-500/20 to-emerald-600/10" delay={0.06} />
          <StatsCard label={t('teachers')}        value={loading ? 0 : stats.teachers}    icon={Users}         color="text-violet-400"  iconBg="from-violet-500/20 to-violet-600/10"  delay={0.12} />
          <StatsCard
            label={t('unassignedClasses')}
            value={loading ? 0 : stats.unassigned}
            icon={AlertTriangle}
            color="text-amber-400"
            iconBg="from-amber-500/20 to-amber-600/10"
            delay={0.18}
            sub={t('unassigned')}
          />
        </div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, type: 'spring', stiffness: 260, damping: 24 }}
        >
          <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-3">
            {t('overview')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {QUICK_LINKS.map((link, i) => (
              <motion.div
                key={link.href}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.26 + i * 0.06, type: 'spring', stiffness: 280, damping: 24 }}
              >
                <Link href={link.href} className="glass-card-interactive p-5 flex flex-col gap-3 group">
                  <div className={`icon-box bg-gradient-to-br ${link.color} shadow-lg`}>
                    <link.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-foreground text-sm">{link.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{link.desc}</p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </SMSLayout>
  );
}
