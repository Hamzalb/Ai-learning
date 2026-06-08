'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet, DollarSign } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { principalAPI } from '@/services/api';
import { cn } from '@/lib/utils';

interface Payslip { _id: string; month: string; amount: number; currency: string; status: string; paidAt?: string; description?: string }

export default function PrincipalPayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    principalAPI.getPayslips().then(r => setPayslips(r.data.data.payslips || [])).finally(() => setLoading(false));
  }, []);

  const total = payslips.reduce((s, p) => s + p.amount, 0);

  return (
    <SMSLayout allowedRoles={['principal']}>
      <div className="space-y-5 max-w-3xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="section-header">My Payslips</h1>
            <p className="section-subheader">Salary &amp; pension history</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <div className="glow-line-top" />
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-4 h-4 text-violet-400" />
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Total Earned</p>
            </div>
            <p className="text-3xl font-extrabold text-violet-400 tabular-nums">${total.toLocaleString()}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
            <div className="glow-line-top" />
            <div className="flex items-center gap-2 mb-1">
              <Wallet className="w-4 h-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase font-semibold tracking-wide">Payslip Count</p>
            </div>
            <p className="text-3xl font-extrabold text-foreground tabular-nums">{payslips.length}</p>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 24 }}
          className="glass-card overflow-hidden">
          <div className="glow-line-top" />
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>{['Month', 'Description', 'Amount', 'Status', 'Paid On'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 4 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    {[1,2,3,4,5].map(j => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>)}
                  </tr>
                )) : payslips.length === 0 ? (
                  <tr><td colSpan={5}>
                    <div className="flex flex-col items-center py-16 gap-3">
                      <div className="icon-box-lg bg-violet-500/5 border border-violet-500/10">
                        <Wallet className="w-6 h-6 text-violet-400/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">No payslips available yet</p>
                    </div>
                  </td></tr>
                ) : payslips.map((p, i) => (
                  <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                    <td className="font-medium text-foreground">{p.month}</td>
                    <td className="text-muted-foreground">{p.description || 'Monthly Salary'}</td>
                    <td className="font-bold text-violet-400 tabular-nums">${p.amount.toLocaleString()} {p.currency}</td>
                    <td>
                      <span className={cn('badge text-[10px]', p.status === 'paid' ? 'badge-success' : 'badge-warning')}>
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
