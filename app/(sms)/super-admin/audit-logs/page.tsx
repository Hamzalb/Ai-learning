'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { superAdminAPI } from '@/services/api';
import { AuditLog } from '@/types';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    superAdminAPI.getAuditLogs({ limit: 100 }).then(r => setLogs(r.data.data.logs)).finally(() => setLoading(false));
  }, []);

  const ACTION_COLORS: Record<string, string> = {
    LOGIN: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    LOGOUT: 'text-muted-foreground bg-white/[0.04] border-white/[0.06]',
    CREATE_SCHOOL: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    DELETE_SCHOOL: 'text-red-400 bg-red-500/10 border-red-500/20',
    CREATE_TEACHER: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    CREATE_STUDENT: 'text-amber-400 bg-amber-500/10 border-amber-500/20'
  };

  return (
    <SMSLayout allowedRoles={['super_admin']}>
      <div className="space-y-5 max-w-5xl">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Audit Logs</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track all admin actions across the platform</p>
        </div>

        <div className="glass-card overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">Loading...</div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
              <Activity className="w-8 h-8 opacity-30" />
              <p>No activity recorded yet</p>
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {logs.map((log, i) => (
                <motion.div key={log._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0 mt-0.5">
                    <Activity className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-sm">{log.actorName}</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${ACTION_COLORS[log.action] || 'text-muted-foreground bg-white/[0.04] border-white/[0.06]'}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-muted-foreground capitalize">({log.actorRole.replace('_', ' ')})</span>
                    </div>
                    <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleString()}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </SMSLayout>
  );
}
