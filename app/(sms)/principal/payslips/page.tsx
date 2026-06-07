'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { principalAPI } from '@/services/api';
import { cn } from '@/lib/utils';

interface Payslip { _id: string; month: string; amount: number; currency: string; status: string; paidAt?: string; description?: string }

export default function PrincipalPayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    principalAPI.getPayslips().then(r => setPayslips(r.data.data.payslips || [])).finally(() => setLoading(false));
  }, []);

  const total = payslips.reduce((s, p) => s + p.amount, 0);

  return (
    <SMSLayout allowedRoles={['principal']}>
      <div className="space-y-5 max-w-3xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Wallet className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">My Payslips</h1>
            <p className="text-sm text-muted-foreground">Salary & pension history</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
            <p className="text-xs text-muted-foreground">Total Earned</p>
            <p className="text-3xl font-extrabold text-violet-400 mt-1 tabular-nums">${total.toLocaleString()}</p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="glass-card p-5">
            <p className="text-xs text-muted-foreground">Payslip Count</p>
            <p className="text-3xl font-extrabold text-foreground mt-1 tabular-nums">{payslips.length}</p>
          </motion.div>
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Month', 'Description', 'Amount', 'Status', 'Paid On'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
                : payslips.length === 0 ? <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No payslips available yet</td></tr>
                : payslips.map((p, i) => (
                  <motion.tr key={p._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-foreground">{p.month}</td>
                    <td className="px-5 py-4 text-muted-foreground">{p.description || 'Monthly Salary'}</td>
                    <td className="px-5 py-4 font-bold text-violet-400 tabular-nums">${p.amount.toLocaleString()} {p.currency}</td>
                    <td className="px-5 py-4">
                      <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border capitalize',
                        p.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      )}>{p.status}</span>
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
