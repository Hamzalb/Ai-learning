'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Power, BookOpen, X, Mail, Lock, Building2 } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { superAdminAPI } from '@/services/api';
import { User, School } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const EMPTY = { name: '', email: '', password: '', schoolId: '' };

export default function SuperAdminTeachersPage() {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [schools,  setSchools]  = useState<School[]>([]);
  const [search,   setSearch]   = useState('');
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const load = () =>
    Promise.all([
      superAdminAPI.getUsers({ role: 'teacher', search }),
      superAdminAPI.getSchools(),
    ]).then(([tr, sr]) => {
      setTeachers(tr.data.data.users);
      setSchools(sr.data.data.schools);
    }).finally(() => setLoading(false));

  useEffect(() => { load(); }, [search]);

  const handleCreate = async () => {
    if (!form.name || !form.email) { toast.error('Name and email required'); return; }
    setSaving(true);
    try {
      const res = await superAdminAPI.createUser({ ...form, role: 'teacher' });
      const pwd = res.data?.data?.defaultPassword;
      toast.success(`Teacher created${pwd ? ` — default password: ${pwd}` : ''}`);
      setShowForm(false); setForm(EMPTY); load();
    } catch { toast.error('Failed to create teacher'); }
    finally { setSaving(false); }
  };

  return (
    <SMSLayout allowedRoles={['super_admin']}>
      <div className="space-y-5 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="section-header">Teachers</h1>
            <p className="section-subheader">{teachers.length} teachers across all schools</p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn-gradient gap-2">
            <Plus className="w-4 h-4" /> Add Teacher
          </button>
        </motion.div>

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0,  scale: 1    }}
              exit   ={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card p-6"
            >
              <div className="glow-line-top" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-foreground">Create Teacher Account</h3>
                <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn-icon">
                  <X className="w-4 h-4" />
                </button>
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
                    <input type="email" dir="ltr" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="teacher@school.com" className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Password <span className="normal-case font-normal text-muted-foreground/60">(default: Teacher@123)</span></label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                    <input type="password" dir="ltr" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Leave blank for default" className="input-field pl-10" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Assign to School</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                    <select
                      value={form.schoolId}
                      onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))}
                      className="input-field pl-10 appearance-none"
                    >
                      <option value="">Select school…</option>
                      {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={saving} className="btn-gradient gap-2 disabled:opacity-60">
                  {saving
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <Plus className="w-4 h-4" />}
                  {saving ? 'Creating…' : 'Create Teacher'}
                </button>
                <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn-ghost">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teachers…" className="input-field pl-10 max-w-sm" />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 24 }}
          className="glass-card overflow-hidden"
        >
          <div className="glow-line-top" />
          <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                {['Teacher', 'Email', 'School', 'Status', 'Actions'].map(h => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    {[1,2,3,4,5].map(j => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-full" /></td>)}
                  </tr>
                ))
              ) : teachers.length === 0 ? (
                <tr><td colSpan={5}>
                  <div className="flex flex-col items-center py-16 gap-3">
                    <div className="icon-box-lg bg-emerald-500/5 border border-emerald-500/10">
                      <BookOpen className="w-6 h-6 text-emerald-400/40" />
                    </div>
                    <p className="text-sm text-muted-foreground">No teachers found</p>
                  </div>
                </td></tr>
              ) : teachers.map((t, i) => {
                const school = schools.find(s => s._id === t.schoolId);
                return (
                  <motion.tr
                    key={t._id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}
                  >
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm font-black shrink-0">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{t.name}</p>
                          <p className="text-[10px] text-muted-foreground">{t.phone || 'No phone'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-muted-foreground text-sm">{t.email}</td>
                    <td className="text-muted-foreground text-sm">{school?.name || <span className="text-muted-foreground/40">—</span>}</td>
                    <td>
                      <span className={t.isActive ? 'badge-success' : 'badge-error'}>
                        <span className={cn('w-1.5 h-1.5 rounded-full', t.isActive ? 'bg-emerald-400' : 'bg-rose-400')} />
                        {t.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => superAdminAPI.toggleUser(t._id).then(load)}
                        title={t.isActive ? 'Deactivate' : 'Activate'}
                        className={cn('btn-icon', t.isActive
                          ? 'hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20'
                          : 'hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                        )}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </td>
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
