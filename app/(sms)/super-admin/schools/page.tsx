'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Power, Trash2, Eye, Building2 } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { superAdminAPI } from '@/services/api';
import { School } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', address: '', contactEmail: '', phone: '' });

  const load = () => superAdminAPI.getSchools({ search }).then(r => setSchools(r.data.data.schools)).finally(() => setLoading(false));
  useEffect(() => { load(); }, [search]);

  const handleCreate = async () => {
    try {
      await superAdminAPI.createSchool(form);
      toast.success('School created successfully');
      setShowForm(false);
      setForm({ name: '', address: '', contactEmail: '', phone: '' });
      load();
    } catch { toast.error('Failed to create school'); }
  };

  const handleToggle = async (id: string) => {
    await superAdminAPI.toggleSchool(id);
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will remove all users in this school.`)) return;
    await superAdminAPI.deleteSchool(id);
    toast.success('School deleted');
    load();
  };

  return (
    <SMSLayout allowedRoles={['super_admin']}>
      <div className="space-y-5 max-w-6xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Schools</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{schools.length} schools registered</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="gap-2 btn-gradient">
            <Plus className="w-4 h-4" /> New School
          </Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-foreground">Create School</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="School Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Beirut International School" />
              <Input label="Address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Beirut, Lebanon" />
              <Input label="Contact Email" type="email" value={form.contactEmail} onChange={e => setForm(f => ({ ...f, contactEmail: e.target.value }))} placeholder="info@school.com" dir="ltr" />
              <Input label="Phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+961 1 000 000" dir="ltr" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Create</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search schools..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
        </div>

        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['School', 'Contact', 'Phone', 'Status', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
              ) : schools.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No schools found</td></tr>
              ) : schools.map((school, i) => (
                <motion.tr key={school._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Building2 className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="font-medium text-foreground">{school.name}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-muted-foreground">{school.contactEmail}</td>
                  <td className="px-5 py-4 text-muted-foreground">{school.phone || '—'}</td>
                  <td className="px-5 py-4">
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium', school.isActive ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20')}>
                      {school.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggle(school._id)} title="Toggle active" className="p-1.5 rounded-lg hover:bg-white/[0.04] text-muted-foreground hover:text-foreground transition-colors">
                        <Power className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(school._id, school.name)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </SMSLayout>
  );
}
