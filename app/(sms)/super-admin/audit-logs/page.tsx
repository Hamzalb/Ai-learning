'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, Search, Filter } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { superAdminAPI } from '@/services/api';
import { AuditLog } from '@/types';
import { cn } from '@/lib/utils';

const ACTION_CONFIG: Record<string, { badge: string; dot: string }> = {
  LOGIN:              { badge: 'badge-success', dot: 'bg-emerald-400' },
  LOGOUT:             { badge: 'badge-default',  dot: 'bg-muted-foreground' },
  CREATE_SCHOOL:      { badge: 'badge-info',     dot: 'bg-sky-400' },
  DELETE_SCHOOL:      { badge: 'badge-error',    dot: 'bg-rose-400' },
  ACTIVATE_SCHOOL:    { badge: 'badge-success',  dot: 'bg-emerald-400' },
  DEACTIVATE_SCHOOL:  { badge: 'badge-warning',  dot: 'bg-amber-400' },
  UPDATE_SCHOOL:      { badge: 'badge-default',  dot: 'bg-muted-foreground' },
  CREATE_TEACHER:     { badge: 'badge-violet',   dot: 'bg-violet-400' },
  CREATE_STUDENT:     { badge: 'badge-cyan',     dot: 'bg-cyan-400' },
  CREATE_PRINCIPAL:   { badge: 'badge-info',     dot: 'bg-sky-400' },
  DELETE_USER:        { badge: 'badge-error',    dot: 'bg-rose-400' },
  UPDATE_USER:        { badge: 'badge-default',  dot: 'bg-muted-foreground' },
  ACTIVATE_USER:      { badge: 'badge-success',  dot: 'bg-emerald-400' },
  DEACTIVATE_USER:    { badge: 'badge-warning',  dot: 'bg-amber-400' },
};

export default function AuditLogsPage() {
  const [logs,    setLogs]    = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState('');

  useEffect(() => {
    superAdminAPI.getAuditLogs({ limit: 100 })
      .then(r => setLogs(r.data.data.logs))
      .finally(() => setLoading(false));
  }, []);

  const filtered = search
    ? logs.filter(l =>
        l.actorName.toLowerCase().includes(search.toLowerCase()) ||
        l.action.toLowerCase().includes(search.toLowerCase())
      )
    : logs;

  return (
    <SMSLayout allowedRoles={['super_admin']}>
      <div className="space-y-5 max-w-5xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-start justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="section-header">Audit Logs</h1>
            <p className="section-subheader">
              {filtered.length} system event{filtered.length !== 1 ? 's' : ''} recorded
            </p>
          </div>
          <div className="badge badge-info gap-1.5 px-3 py-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-ping-slow" />
            Live tracking
          </div>
        </motion.div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by actor or action…"
            className="input-field pl-10 max-w-sm"
          />
        </div>

        {/* Log list */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 24 }}
          className="glass-card overflow-hidden"
        >
          <div className="glow-line-top" />
          <div className="overflow-x-auto">

          {/* Table header */}
          <div className="grid grid-cols-[auto,1fr,auto,auto] items-center gap-4 px-5 py-3.5 border-b border-white/[0.05] min-w-[560px]">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Actor</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Action</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Role</span>
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">Time</span>
          </div>

          <div className="divide-y divide-white/[0.03] min-w-[560px]">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="skeleton w-9 h-9 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-3 w-2/3 rounded" />
                    <div className="skeleton h-2.5 w-1/3 rounded" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="flex flex-col items-center py-16 gap-3">
                <div className="icon-box-lg bg-white/[0.03] border border-white/[0.06]">
                  <Activity className="w-6 h-6 text-muted-foreground/30" />
                </div>
                <p className="text-sm text-muted-foreground">No logs match your filter</p>
              </div>
            ) : filtered.map((log, i) => {
              const cfg = ACTION_CONFIG[log.action] || { badge: 'badge-default', dot: 'bg-muted-foreground' };
              return (
                <motion.div
                  key={log._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.025, type: 'spring', stiffness: 280, damping: 24 }}
                  className="grid grid-cols-[auto,1fr,auto,auto] items-center gap-4 px-5 py-3.5 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Actor */}
                  <div className="flex items-center gap-2.5">
                    <div className="relative">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/15 to-violet-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm font-black shrink-0">
                        {log.actorName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                      <span className={cn('absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-card', cfg.dot)} />
                    </div>
                    <p className="text-sm font-semibold text-foreground whitespace-nowrap">{log.actorName}</p>
                  </div>

                  {/* Action */}
                  <span className={cn('badge w-fit text-[10px]', cfg.badge)}>
                    {log.action.replace(/_/g, ' ')}
                  </span>

                  {/* Role */}
                  <span className="badge-default text-[10px] capitalize whitespace-nowrap">
                    {log.actorRole.replace('_', ' ')}
                  </span>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {new Date(log.createdAt).toLocaleString('en-US', {
                      month: 'short', day: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
          </div>
        </motion.div>
      </div>
    </SMSLayout>
  );
}
