'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Power, X, Mail, Phone, Lock, UserCog } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { schoolAPI } from '@/services/api';
import { User } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const EMPTY = { name: '', email: '', phone: '', password: '' };

export default function SchoolPrincipalsPage() {
  const [principals, setPrincipals] = useState<User[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const load = () =>
    schoolAPI.getPrincipals()
      .then(r => setPrincipals(r.data.data.principals))
      .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return; }
    setSaving(true);
    try {
      await schoolAPI.createPrincipal(form);
      toast.success('Principal account created');
      setShowForm(false); setForm(EMPTY); load();
    } catch { toast.error('Failed to create principal'); }
    finally { setSaving(false); }
  };

  return (
    <SMSLayout allowedRoles={['school']}>
      <div className="space-y-5 max-w-4xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="section-header">Principals</h1>
            <p className="section-subheader">{principals.length} principals appointed</p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn-gradient gap-2">
            <Plus className="w-4 h-4" /> Appoint Principal
          </button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card p-6"
            >
              <div className="glow-line-top" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-foreground">Appoint Principal</h3>
                <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Full Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ahmad Khalil" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                    <input type="email" dir="ltr" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="principal@school.com" className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Phone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                    <input dir="ltr" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+961 1 000 000" className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    Password <span className="normal-case font-normal text-muted-foreground/60">(default: Principal@123)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                    <input type="password" dir="ltr" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave blank for default" className="input-field pl-10" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={saving} className="btn-gradient gap-2 disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Creating…' : 'Appoint'}
                </button>
                <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn-ghost">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-center gap-4">
                <div className="skeleton w-12 h-12 rounded-2xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-1/2 rounded" />
                  <div className="skeleton h-3 w-3/4 rounded" />
                  <div className="skeleton h-4 w-16 rounded-full" />
                </div>
              </div>
            </div>
          )) : principals.length === 0 ? (
            <div className="col-span-2 glass-card p-16 text-center">
              <div className="glow-line-top" />
              <div className="icon-box-lg bg-amber-500/5 border border-amber-500/10 mx-auto mb-4">
                <UserCog className="w-6 h-6 text-amber-400/40" />
              </div>
              <p className="text-sm text-muted-foreground">No principals appointed yet</p>
              <button onClick={() => setShowForm(true)} className="btn-gradient gap-2 mt-4">
                <Plus className="w-4 h-4" /> Appoint First Principal
              </button>
            </div>
          ) : principals.map((p, i) => (
            <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
              className="glass-card-hover p-5">
              <div className="glow-line-top" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-600/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg font-black shrink-0">
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground">{p.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                  <span className={cn('mt-1.5 inline-flex items-center gap-1 badge text-[10px]', p.isActive ? 'badge-success' : 'badge-error')}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', p.isActive ? 'bg-emerald-400' : 'bg-rose-400')} />
                    {p.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <button onClick={() => schoolAPI.togglePrincipal(p._id).then(load)}
                  className={cn('btn-icon shrink-0', p.isActive
                    ? 'hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20'
                    : 'hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20')}>
                  <Power className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SMSLayout>
  );
}
