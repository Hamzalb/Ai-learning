'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { Attendance } from '@/types';
import StatsCard from '@/components/sms/StatsCard';
import { cn } from '@/lib/utils';

const STATUS_CFG: Record<string, { badge: string; icon: React.ElementType; dot: string }> = {
  present: { badge: 'badge-success', icon: CheckCircle2, dot: 'bg-emerald-400' },
  absent:  { badge: 'badge-error',   icon: XCircle,      dot: 'bg-rose-400' },
  late:    { badge: 'badge-warning', icon: Clock,         dot: 'bg-amber-400' },
};

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getAttendance()
      .then(r => setRecords(r.data.data.attendance))
      .finally(() => setLoading(false));
  }, []);

  const present = records.filter(r => r.status === 'present').length;
  const absent  = records.filter(r => r.status === 'absent').length;
  const late    = records.filter(r => r.status === 'late').length;
  const pct     = records.length ? Math.round((present / records.length) * 100) : 100;

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-6 max-w-4xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
          <h1 className="section-header">Attendance</h1>
          <p className="section-subheader">{records.length} sessions tracked</p>
        </motion.div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatsCard
            label="Rate"
            value={loading ? 0 : pct}
            icon={TrendingUp}
            color={pct >= 80 ? 'text-emerald-400' : 'text-rose-400'}
            iconBg={pct >= 80 ? 'from-emerald-500/20 to-emerald-600/10' : 'from-rose-500/20 to-rose-600/10'}
            delay={0}
            sub="Overall %"
          />
          <StatsCard label="Present" value={loading ? 0 : present} icon={CheckCircle2} color="text-emerald-400" iconBg="from-emerald-500/20 to-emerald-600/10" delay={0.06} />
          <StatsCard label="Absent"  value={loading ? 0 : absent}  icon={XCircle}      color="text-rose-400"    iconBg="from-rose-500/20 to-rose-600/10"       delay={0.12} />
          <StatsCard label="Late"    value={loading ? 0 : late}    icon={Clock}        color="text-amber-400"   iconBg="from-amber-500/20 to-amber-600/10"     delay={0.18} />
        </div>

        {/* Progress bar */}
        {!loading && records.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.22, type: 'spring', stiffness: 260, damping: 24 }}
            className="glass-card p-5"
          >
            <div className="glow-line-top" />
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-semibold text-foreground">Attendance Overview</span>
              <span className={cn('text-sm font-black tabular-nums', pct >= 80 ? 'text-emerald-400' : 'text-rose-400')}>{pct}%</span>
            </div>
            <div className="h-3 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ delay: 0.4, duration: 0.8, ease: 'easeOut' }}
                className={cn('h-full rounded-full', pct >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-pink-400')}
              />
            </div>
            <div className="flex gap-6 mt-4">
              {[
                { label: 'Present', count: present, pct: records.length ? Math.round((present/records.length)*100) : 0, dot: 'bg-emerald-400' },
                { label: 'Absent',  count: absent,  pct: records.length ? Math.round((absent/records.length)*100)  : 0, dot: 'bg-rose-400'    },
                { label: 'Late',    count: late,    pct: records.length ? Math.round((late/records.length)*100)    : 0, dot: 'bg-amber-400'   },
              ].map(s => (
                <div key={s.label} className="flex items-center gap-2">
                  <span className={cn('w-2 h-2 rounded-full shrink-0', s.dot)} />
                  <span className="text-xs text-muted-foreground">{s.label}: <strong className="text-foreground">{s.count}</strong> ({s.pct}%)</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, type: 'spring', stiffness: 260, damping: 24 }}
          className="glass-card overflow-hidden"
        >
          <div className="glow-line-top" />
          <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>{['Date', 'Day', 'Status', 'Note'].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.03]">{[1,2,3,4].map(j => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>)}</tr>
              )) : records.length === 0 ? (
                <tr><td colSpan={4}><div className="flex flex-col items-center py-16 gap-3">
                  <div className="icon-box-lg bg-emerald-500/5 border border-emerald-500/10"><UserCheck className="w-6 h-6 text-emerald-400/40" /></div>
                  <p className="text-sm text-muted-foreground">No attendance records yet</p>
                </div></td></tr>
              ) : records.map((rec, i) => {
                const cfg = STATUS_CFG[rec.status] || STATUS_CFG.present;
                const date = new Date(rec.date || rec.createdAt);
                return (
                  <motion.tr key={rec._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}>
                    <td className="font-medium text-foreground text-sm">
                      {date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </td>
                    <td className="text-muted-foreground text-sm">
                      {date.toLocaleDateString('en-US', { weekday: 'long' })}
                    </td>
                    <td>
                      <span className={cn('badge text-[10px]', cfg.badge)}>
                        <cfg.icon className="w-3 h-3" />
                        {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-muted-foreground text-sm">{rec.note || '—'}</td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </motion.div>
      </div>
    </SMSLayout>
  );
}
