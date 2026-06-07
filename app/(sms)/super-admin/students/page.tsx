'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Power } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { superAdminAPI } from '@/services/api';
import { User, School } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function SuperAdminStudentsPage() {
  const [students, setStudents] = useState<User[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', schoolId: '' });

  const load = () => {
    Promise.all([superAdminAPI.getUsers({ role: 'student', search }), superAdminAPI.getSchools()])
      .then(([sr, scr]) => { setStudents(sr.data.data.users); setSchools(scr.data.data.schools); })
      .finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [search]);

  const handleCreate = async () => {
    try {
      await superAdminAPI.createUser({ ...form, role: 'student' });
      toast.success('Student account created');
      setShowForm(false);
      setForm({ name: '', email: '', password: '', schoolId: '' });
      load();
    } catch { toast.error('Failed to create student'); }
  };

  return (
    <SMSLayout allowedRoles={['super_admin']}>
      <div className="space-y-5 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Students</h1>
            <p className="text-sm text-muted-foreground">{students.length} students across all schools</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Add Student</Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-foreground">Create Student Account</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              <Input label="Email" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} dir="ltr" />
              <Input label="Password" type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} placeholder="Student@123" dir="ltr" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Assign to School</label>
                <select value={form.schoolId} onChange={e => setForm(f => ({ ...f, schoolId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                  <option value="">Select school...</option>
                  {schools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Create</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search students..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Student', 'Email', 'School', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
                : students.map((s, i) => {
                  const school = schools.find(sc => sc._id === s.schoolId);
                  return (
                    <motion.tr key={s._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 text-xs font-bold">{s.name.charAt(0)}</div>
                          <span className="font-medium text-foreground">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{s.email}</td>
                      <td className="px-5 py-4 text-muted-foreground">{school?.name || '—'}</td>
                      <td className="px-5 py-4">
                        <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', s.isActive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20')}>
                          {s.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <button onClick={() => { superAdminAPI.toggleUser(s._id).then(load); }} className="p-1.5 rounded-lg hover:bg-white/[0.04] text-muted-foreground hover:text-foreground transition-colors">
                          <Power className="w-4 h-4" />
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </SMSLayout>
  );
}
