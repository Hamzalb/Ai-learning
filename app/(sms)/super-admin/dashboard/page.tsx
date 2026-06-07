'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, UserCheck, BookOpen,
  Activity, Clock, Shield, Sparkles, TrendingUp
} from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import StatsCard from '@/components/sms/StatsCard';
import { superAdminAPI } from '@/services/api';
import { AuditLog } from '@/types';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const ACTION_BADGE: Record<string, string> = {
  CREATE_SCHOOL:      'badge-info',
  DELETE_SCHOOL:      'badge-error',
  ACTIVATE_SCHOOL:    'badge-success',
  DEACTIVATE_SCHOOL:  'badge-warning',
  CREATE_TEACHER:     'badge-success',
  CREATE_STUDENT:     'badge-cyan',
  CREATE_PRINCIPAL:   'badge-violet',
  DELETE_USER:        'badge-error',
  UPDATE_USER:        'badge-default',
  UPDATE_SCHOOL:      'badge-default',
};

export default function SuperAdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState({ schools: 0, teachers: 0, students: 0, principals: 0 });
  const [logs, setLogs]   = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminAPI.getDashboard()
      .then(r => {
        setStats(r.data.data.stats);
        setLogs(r.data.data.recentLogs || []);
      })
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SMSLayout allowedRoles={['super_admin']}>
      <div className="space-y-7 max-w-6xl mx-auto">

        {/* ── Hero Header ───────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="relative glass-card p-6 overflow-hidden"
        >
          <div className="glow-line-top" />
          {/* Background art */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
            <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-rose-500/5 blur-3xl" />
            <div className="absolute -bottom-8 -left-8 w-48 h-48 rounded-full bg-amber-500/5 blur-3xl" />
          </div>

          <div className="relative flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-amber-400">
                  Platform Overview
                </span>
              </div>
              <h1 className="text-3xl font-black text-foreground tracking-tight">
                {greeting},{' '}
                <span className="gradient-text-warm">
                  {user?.name?.split(' ')[0] || 'Admin'}
                </span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                Manage the entire EduFlow school network from one place.
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/[0.06]">
              <Shield className="w-4 h-4 text-rose-400" />
              <div className="text-right">
                <p className="text-xs font-bold text-foreground">Super Admin</p>
                <p className="text-[10px] text-muted-foreground">Full access</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ── Stats Grid ────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Total Schools"
            value={loading ? 0 : stats.schools}
            icon={Building2}
            color="text-sky-400"
            iconBg="from-sky-500/20 to-sky-600/10"
            
            delay={0}
            trend={8}
          />
          <StatsCard
            label="Teachers"
            value={loading ? 0 : stats.teachers}
            icon={BookOpen}
            color="text-emerald-400"
            iconBg="from-emerald-500/20 to-emerald-600/10"
            
            delay={0.06}
            trend={12}
          />
          <StatsCard
            label="Students"
            value={loading ? 0 : stats.students}
            icon={Users}
            color="text-violet-400"
            iconBg="from-violet-500/20 to-violet-600/10"
            
            delay={0.12}
            trend={5}
          />
          <StatsCard
            label="Principals"
            value={loading ? 0 : stats.principals}
            icon={UserCheck}
            color="text-amber-400"
            iconBg="from-amber-500/20 to-amber-600/10"
            
            delay={0.18}
          />
        </div>

        {/* ── Recent Activity ───────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, type: 'spring', stiffness: 260, damping: 24 }}
          className="glass-card overflow-hidden"
        >
          <div className="glow-line-top" />

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.05]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Recent Activity</h2>
                <p className="text-xs text-muted-foreground">Last {logs.length} system events</p>
              </div>
            </div>
            <span className="badge badge-info text-[10px]">
              <TrendingUp className="w-2.5 h-2.5" /> Live
            </span>
          </div>

          {/* Log list */}
          <div className="divide-y divide-white/[0.03]">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-6 py-4">
                  <div className="skeleton w-8 h-8 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-3/4 rounded" />
                    <div className="skeleton h-2.5 w-1/3 rounded" />
                  </div>
                </div>
              ))
            ) : logs.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
                  <Activity className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">No activity yet</p>
              </div>
            ) : logs.map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.28 + i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}
                className="flex items-start gap-4 px-6 py-4 hover:bg-white/[0.02] transition-colors"
              >
                {/* Actor avatar */}
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-black text-indigo-400">
                    {log.actorName?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                      {log.actorName}
                    </span>
                    <span className={cn('badge', ACTION_BADGE[log.action] || 'badge-default', 'text-[10px]')}>
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {new Date(log.createdAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </SMSLayout>
  );
}
