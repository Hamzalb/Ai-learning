'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Power, Trash2, Building2, X, MapPin, Mail, Phone } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { superAdminAPI } from '@/services/api';
import { School } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const EMPTY_FORM = { name: '', address: '', contactEmail: '', phone: '' };

export default function SchoolsPage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [search,  setSearch]  = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  const load = () =>
    superAdminAPI.getSchools({ search })
      .then(r => setSchools(r.data.data.schools))
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, [search]);

  const handleCreate = async () => {
    if (!form.name || !form.contactEmail) {
      toast.error('Name and email are required');
      return;
    }
    setSaving(true);
    try {
      await superAdminAPI.createSchool(form);
      toast.success('School created');
      setShowForm(false);
      setForm(EMPTY_FORM);
      load();
    } catch { toast.error('Failed to create school'); }
    finally { setSaving(false); }
  };

  const handleToggle = async (id: string) => {
    await superAdminAPI.toggleSchool(id);
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This removes all users in this school.`)) return;
    try {
      await superAdminAPI.deleteSchool(id);
      toast.success('School deleted');
      load();
    } catch { toast.error('Failed to delete school'); }
  };

  return (
    <SMSLayout allowedRoles={['super_admin']}>
      <div className="space-y-5 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="section-header">Schools</h1>
            <p className="section-subheader">
              {schools.length} school{schools.length !== 1 ? 's' : ''} registered
            </p>
          </div>
          <button
            onClick={() => setShowForm(s => !s)}
            className="btn-gradient gap-2"
          >
            <Plus className="w-4 h-4" />
            New School
          </button>
        </motion.div>

        {/* Create form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card p-6"
            >
              <div className="glow-line-top" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-foreground">Create New School</h3>
                <button
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="btn-icon"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {[
                  { field: 'name',         label: 'School Name',    placeholder: 'Beirut International School', icon: Building2 },
                  { field: 'address',      label: 'Address',        placeholder: 'Beirut, Lebanon',             icon: MapPin },
                  { field: 'contactEmail', label: 'Contact Email',  placeholder: 'info@school.com',             icon: Mail, type: 'email' },
                  { field: 'phone',        label: 'Phone',          placeholder: '+961 1 000 000',              icon: Phone },
                ].map(({ field, label, placeholder, icon: Icon, type = 'text' }) => (
                  <div key={field}>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                      {label}
                    </label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                      <input
                        type={type}
                        dir="ltr"
                        value={form[field as keyof typeof EMPTY_FORM]}
                        onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                        placeholder={placeholder}
                        className="input-field pl-10"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCreate}
                  disabled={saving}
                  className="btn-gradient gap-2 disabled:opacity-60"
                >
                  {saving ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4" />
                  )}
                  {saving ? 'Creating…' : 'Create School'}
                </button>
                <button
                  onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }}
                  className="btn-ghost"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search schools by name…"
            className="input-field pl-10 max-w-sm"
          />
        </div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 24 }}
          className="glass-card overflow-hidden"
        >
          <div className="glow-line-top" />
          <table className="data-table">
            <thead>
              <tr>
                {['School', 'Contact Email', 'Phone', 'Status', 'Actions'].map(h => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    {[1,2,3,4,5].map(j => (
                      <td key={j} className="px-5 py-4">
                        <div className="skeleton h-4 rounded w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : schools.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <div className="flex flex-col items-center py-16 gap-3">
                      <div className="icon-box-lg bg-white/[0.03] border border-white/[0.06]">
                        <Building2 className="w-6 h-6 text-muted-foreground/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {search ? 'No schools match your search' : 'No schools yet'}
                      </p>
                      {!search && (
                        <button onClick={() => setShowForm(true)} className="btn-gradient gap-2 mt-1">
                          <Plus className="w-4 h-4" /> Create first school
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : schools.map((school, i) => (
                <motion.tr
                  key={school._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="icon-box bg-sky-500/10 border border-sky-500/20 text-sky-400 shrink-0">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground text-sm">{school.name}</p>
                        {school.address && (
                          <p className="text-xs text-muted-foreground truncate max-w-[160px]">{school.address}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="text-muted-foreground text-sm">{school.contactEmail}</td>
                  <td className="text-muted-foreground text-sm">{school.phone || '—'}</td>
                  <td>
                    <span className={school.isActive ? 'badge-success' : 'badge-error'}>
                      <span className={cn(
                        'w-1.5 h-1.5 rounded-full',
                        school.isActive ? 'bg-emerald-400' : 'bg-rose-400'
                      )} />
                      {school.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleToggle(school._id)}
                        title={school.isActive ? 'Deactivate' : 'Activate'}
                        className={cn(
                          'btn-icon text-xs',
                          school.isActive
                            ? 'hover:bg-amber-500/10 hover:text-amber-400 hover:border-amber-500/20'
                            : 'hover:bg-emerald-500/10 hover:text-emerald-400 hover:border-emerald-500/20'
                        )}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(school._id, school.name)}
                        title="Delete school"
                        className="btn-icon hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </SMSLayout>
  );
}
