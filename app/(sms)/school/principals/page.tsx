'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Power } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { schoolAPI } from '@/services/api';
import { User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function SchoolPrincipalsPage() {
  const [principals, setPrincipals] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });

  const load = () => schoolAPI.getPrincipals().then(r => setPrincipals(r.data.data.principals)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await schoolAPI.createPrincipal(form);
      toast.success('Principal account created');
      setShowForm(false);
      setForm({ name: '', email: '', phone: '', password: '' });
      load();
    } catch { toast.error('Failed to create principal'); }
  };

  return (
    <SMSLayout allowedRoles={['school']}>
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Principals</h1>
            <p className="text-sm text-muted-foreground">{principals.length} principals appointed</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Appoint Principal</Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-foreground">New Principal Account</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} dir="ltr" />
              <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} dir="ltr" />
              <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Principal@123" dir="ltr" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Appoint</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? <p className="text-muted-foreground col-span-2 text-center py-8">Loading...</p>
            : principals.length === 0 ? <p className="text-muted-foreground col-span-2 text-center py-8">No principals yet</p>
            : principals.map((p, i) => (
              <motion.div key={p._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="glass-card-hover p-5"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-lg font-bold">{p.name.charAt(0)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{p.email}</p>
                    <span className={cn('mt-1 inline-block px-2 py-0.5 rounded-full text-xs font-medium border', p.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>
                      {p.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button onClick={() => { schoolAPI.togglePrincipal(p._id).then(load); }} className="p-2 rounded-xl hover:bg-white/[0.04] text-muted-foreground hover:text-foreground transition-colors">
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </SMSLayout>
  );
}
