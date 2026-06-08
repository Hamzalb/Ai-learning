'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, BookMarked, X } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { principalAPI } from '@/services/api';
import { Subject, Classroom, User } from '@/types';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];
const EMPTY = { name: '', classroomId: '', teacherId: '', color: '#6366f1' };

export default function SubjectsPage() {
  const [subjects,   setSubjects]   = useState<Subject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers,   setTeachers]   = useState<User[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY);
  const [saving,     setSaving]     = useState(false);

  const load = async () => {
    const [sr, cr, tr] = await Promise.all([principalAPI.getSubjects(), principalAPI.getClassrooms(), principalAPI.getTeachers()]);
    setSubjects(sr.data.data.subjects);
    setClassrooms(cr.data.data.classrooms);
    setTeachers(tr.data.data.teachers);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name) { toast.error('Subject name required'); return; }
    setSaving(true);
    try {
      await principalAPI.createSubject(form);
      toast.success('Subject created');
      setShowForm(false); setForm(EMPTY); load();
    } catch { toast.error('Failed to create subject'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this subject?')) return;
    await principalAPI.deleteSubject(id);
    toast.success('Subject deleted'); load();
  };

  return (
    <SMSLayout allowedRoles={['principal']}>
      <div className="space-y-5 max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="section-header">Subjects</h1>
            <p className="section-subheader">{subjects.length} subjects defined</p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn-gradient gap-2">
            <Plus className="w-4 h-4" /> New Subject
          </button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card p-6">
              <div className="glow-line-top" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-foreground">Create Subject</h3>
                <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Subject Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Mathematics" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Classroom</label>
                  <select value={form.classroomId} onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))} className="input-field appearance-none">
                    <option value="">Select classroom...</option>
                    {classrooms.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Teacher</label>
                  <select value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))} className="input-field appearance-none">
                    <option value="">Select teacher...</option>
                    {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Accent Color</label>
                  <div className="flex gap-2 flex-wrap pt-1">
                    {COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setForm(f => ({ ...f, color: c }))}
                        className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                        style={{ backgroundColor: c, borderColor: form.color === c ? 'white' : 'transparent' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={saving} className="btn-gradient gap-2 disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Creating…' : 'Create Subject'}
                </button>
                <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn-ghost">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="glass-card p-5 overflow-hidden">
              <div className="skeleton h-1 w-full rounded-full mb-3" />
              <div className="skeleton h-5 w-1/2 rounded mb-2" />
              <div className="skeleton h-3 w-3/4 rounded mb-1" />
              <div className="skeleton h-3 w-2/3 rounded" />
            </div>
          )) : subjects.length === 0 ? (
            <div className="col-span-3 glass-card p-16 text-center">
              <div className="glow-line-top" />
              <div className="icon-box-lg bg-indigo-500/5 border border-indigo-500/10 mx-auto mb-4">
                <BookMarked className="w-6 h-6 text-indigo-400/40" />
              </div>
              <p className="text-sm text-muted-foreground">No subjects defined yet</p>
              <button onClick={() => setShowForm(true)} className="btn-gradient gap-2 mt-4">
                <Plus className="w-4 h-4" /> Create First Subject
              </button>
            </div>
          ) : subjects.map((s, i) => {
            const classroom = classrooms.find(c => c._id === s.classroomId);
            const teacher   = teachers.find(t => t._id === s.teacherId);
            return (
              <motion.div key={s._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
                className="glass-card-hover p-5 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl" style={{ backgroundColor: s.color }} />
                <div className="flex items-start justify-between mt-1">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-foreground">{s.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{classroom?.name || '—'}</p>
                    <p className="text-xs text-muted-foreground truncate">{teacher?.name || 'No teacher assigned'}</p>
                  </div>
                  <button onClick={() => handleDelete(s._id)} className="btn-icon hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 shrink-0 ml-2">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="mt-3 pt-3 border-t border-white/[0.04] flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                  <span className="text-xs font-medium" style={{ color: s.color }}>Color tag</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SMSLayout>
  );
}
