'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { Attendance } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  present: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  absent: 'bg-red-500/10 text-red-400 border-red-500/20',
  late: 'bg-amber-500/10 text-amber-400 border-amber-500/20'
};

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getAttendance().then(r => setRecords(r.data.data.attendance)).finally(() => setLoading(false));
  }, []);

  const present = records.filter(r => r.status === 'present').length;
  const absent = records.filter(r => r.status === 'absent').length;
  const late = records.filter(r => r.status === 'late').length;
  const pct = records.length ? Math.round((present / records.length) * 100) : 100;

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Attendance</h1>
          <p className="text-sm text-muted-foreground">{records.length} sessions tracked</p>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Attendance Rate', value: `${pct}%`, color: pct >= 80 ? 'text-emerald-400' : 'text-red-400' },
            { label: 'Present', value: present, color: 'text-emerald-400' },
            { label: 'Absent', value: absent, color: 'text-red-400' },
            { label: 'Late', value: late, color: 'text-amber-400' }
          ].map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={cn('text-3xl font-extrabold mt-1 tabular-nums', stat.color)}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Date', 'Status', 'Note'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={3} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
                : records.length === 0 ? <tr><td colSpan={3} className="text-center py-12 text-muted-foreground">No attendance records yet</td></tr>
                : records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((r, i) => (
                  <motion.tr key={r._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 text-foreground">{new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</td>
                    <td className="px-5 py-4">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border capitalize', STATUS_STYLES[r.status])}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">—</td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </SMSLayout>
  );
}
