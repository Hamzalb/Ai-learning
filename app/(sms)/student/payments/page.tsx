'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { Payment } from '@/types';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  paid: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  overdue: 'bg-red-500/10 text-red-400 border-red-500/20'
};

export default function StudentPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getPayments().then(r => setPayments(r.data.data.payments)).finally(() => setLoading(false));
  }, []);

  const total = payments.reduce((s, p) => s + p.amount, 0);
  const paid = payments.filter(p => p.status === 'paid').reduce((s, p) => s + p.amount, 0);
  const pending = payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0);

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Fees & Payments</h1>
          <p className="text-sm text-muted-foreground">{payments.length} payment records</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Fees', value: total, color: 'text-foreground' },
            { label: 'Paid', value: paid, color: 'text-emerald-400' },
            { label: 'Pending', value: pending, color: 'text-amber-400' }
          ].map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className={cn('text-2xl font-extrabold mt-1 tabular-nums', s.color)}>${s.value.toLocaleString()}</p>
            </motion.div>
          ))}
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Description', 'Amount', 'Due Date', 'Status', 'Paid On'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
                : payments.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No payment records yet</td></tr>
                : payments.map((p, i) => (
                  <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-foreground">{p.description}</td>
                    <td className="px-5 py-4 font-bold text-foreground tabular-nums">${p.amount} {p.currency}</td>
                    <td className="px-5 py-4 text-muted-foreground">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : '—'}</td>
                    <td className="px-5 py-4">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border capitalize', STATUS_STYLES[p.status])}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground">{p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '—'}</td>
                  </motion.tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </SMSLayout>
  );
}
