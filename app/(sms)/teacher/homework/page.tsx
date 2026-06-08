'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, ClipboardList, X } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { teacherAPI } from '@/services/api';
import { Homework, Classroom } from '@/types';
import toast from 'react-hot-toast';
import { useT } from '@/lib/i18n';

const EMPTY = { title: '', description: '', classroomId: '', subjectId: '', dueDate: '' };

export default function TeacherHomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [classes,  setClasses]  = useState<Classroom[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const t = useT();

  const load = () =>
    Promise.all([teacherAPI.getHomework(), teacherAPI.getClasses()])
      .then(([hr, cr]) => { setHomework(hr.data.data.homework); setClasses(cr.data.data.classrooms); })
      .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.title) { toast.error(t('homeworkTitle') + ' required'); return; }
    setSaving(true);
    try {
      await teacherAPI.createHomework(form);
      toast.success(t('assignHomework'));
      setShowForm(false); setForm(EMPTY); load();
    } catch { toast.error('Failed to assign homework'); }
    finally { setSaving(false); }
  };

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-5 max-w-4xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="section-header">{t('homework')}</h1>
            <p className="section-subheader">{homework.length} {t('submissions').toLowerCase()} created</p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn-gradient gap-2">
            <Plus className="w-4 h-4" /> {t('newHomework')}
          </button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card p-6 space-y-4">
              <div className="glow-line-top" />
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t('assignHomework')}</h3>
                <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('homeworkTitle')}</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Chapter 5 Problems" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('classroom')}</label>
                  <select value={form.classroomId} onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))} className="input-field appearance-none">
                    <option value="">{t('allMyClasses')}</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  {classes.length === 0 && (
                    <p className="text-[11px] text-amber-400 mt-1">{t('noActiveTeachers')}</p>
                  )}
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('dueDate')}</label>
                  <input type="datetime-local" dir="ltr" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('description')}</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
                    placeholder="Describe the assignment..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={saving} className="btn-gradient gap-2 disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? t('assigningHomework') : t('assignHomework')}
                </button>
                <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn-ghost">{t('cancel')}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-3">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-2">
              <div className="skeleton h-5 w-1/3 rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/4 rounded" />
            </div>
          )) : homework.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="glow-line-top" />
              <div className="icon-box-lg bg-amber-500/5 border border-amber-500/10 mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-amber-400/40" />
              </div>
              <p className="text-sm text-muted-foreground">{t('noHomework')}</p>
              <button onClick={() => setShowForm(true)} className="btn-gradient gap-2 mt-4">
                <Plus className="w-4 h-4" /> {t('assignFirst')}
              </button>
            </div>
          ) : homework.map((h, i) => (
            <motion.div key={h._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}
              className="glass-card-hover p-5">
              <div className="glow-line-top" style={{ background: 'linear-gradient(90deg, transparent, hsl(43 96% 56% / 0.2), transparent)' }} />
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground">{h.title}</h3>
                  {h.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{h.description}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span>{t('due')}: {h.dueDate ? new Date(h.dueDate).toLocaleDateString() : '—'}</span>
                    <span>{h.submissions?.length || 0} {t('submissions')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SMSLayout>
  );
}
