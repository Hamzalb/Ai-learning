'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Building2, Users, UserCheck, BookOpen, Activity, Clock } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import StatsCard from '@/components/sms/StatsCard';
import { superAdminAPI } from '@/services/api';
import { AuditLog } from '@/types';

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState({ schools: 0, teachers: 0, students: 0, principals: 0 });
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminAPI.getDashboard().then(r => {
      setStats(r.data.data.stats);
      setLogs(r.data.data.recentLogs || []);
    }).finally(() => setLoading(false));
  }, []);

  return (
    <SMSLayout allowedRoles={['super_admin']}>
      <div className="space-y-6 max-w-6xl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
          <h1 className="text-2xl font-extrabold text-foreground">Platform Overview</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage the entire school management system</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Total Schools" value={loading ? '...' : stats.schools} icon={Building2} color="text-blue-400" delay={0} />
          <StatsCard label="Teachers" value={loading ? '...' : stats.teachers} icon={BookOpen} color="text-emerald-400" delay={0.05} />
          <StatsCard label="Students" value={loading ? '...' : stats.students} icon={Users} color="text-violet-400" delay={0.1} />
          <StatsCard label="Principals" value={loading ? '...' : stats.principals} icon={UserCheck} color="text-amber-400" delay={0.15} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 280, damping: 24 }}
          className="glass-card p-5"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-primary" />
            <h2 className="font-bold text-foreground">Recent Activity</h2>
          </div>
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No activity yet</p>
          ) : (
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground font-medium truncate">
                      <span className="text-primary">{log.actorName}</span> — {log.action.replace(/_/g, ' ')}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </SMSLayout>
  );
}
