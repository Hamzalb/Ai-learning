'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CreditCard } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { Payment } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_BADGE: Record<string, string> = {
  paid:    'badge-success',
  pending: 'badge-warning',
  overdue: 'badge-error',
};

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    studentAPI.getPayments().then(r => setPayments(r.data.data.payments)).finally(() => setLoading(false));
  }, []);

  const total   = payments.reduce((s, p) => s + p.amount, 0);
  const paid    = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-5 max-w-4xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
          <h1 className="section-header">Fees &amp; Payments</h1>
          <p className="section-subheader">{payments.length} payment records</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Fees', value: total,   color: 'text-foreground',   icon: CreditCard,  glow: undefined },
            { label: 'Paid',       value: paid,     color: 'text-emerald-400',  icon: DollarSign,  glow: 'hsl(160 84% 39% / 0.25)' },
            { label: 'Pending',    value: pending,  color: 'text-amber-400',    icon: DollarSign,  glow: 'hsl(43 96% 56% / 0.25)' },
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
              className="glass-card p-5">
              <div className="glow-line-top" style={s.glow ? { background: `linear-gradient(90deg, transparent, ${s.glow}, transparent)` } : undefined} />
              <div className="flex items-center gap-2 mb-2">
                <s.icon className={cn('w-4 h-4', s.color)} />
                <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">{s.label}</p>
              </div>
              <p className={cn('text-2xl font-extrabold tabular-nums', s.color)}>${s.value.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 24 }}
          className="glass-card overflow-hidden">
          <div className="glow-line-top" />
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>{['Description', 'Amount', 'Due Date', 'Status', 'Paid On'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    {[1,2,3,4,5].map(j => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>)}
                  </tr>
                )) : payments.length === 0 ? (
                  <tr><td colSpan={5}>
                    <div className="flex flex-col items-center py-16 gap-3">
                      <div className="icon-box-lg bg-emerald-500/5 border border-emerald-500/10">
                        <CreditCard className="w-6 h-6 text-emerald-400/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">No payment records yet</p>
                    </div>
                  </td></tr>
                ) : payments.map((p, i) => (
                  <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td className="font-medium text-foreground">{p.description}</td>
                    <td className="font-bold text-foreground tabular-nums">${p.amount} {p.currency}</td>
                    <td className="text-muted-foreground">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '—'}</td>
                    <td>
                      <span className={cn('badge text-[10px] capitalize', STATUS_BADGE[p.status] || 'badge-default')}>
                        {p.status}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </SMSLayout>
  );
}
