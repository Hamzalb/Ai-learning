'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, BarChart3, X, CheckCircle2, AlertCircle } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { teacherAPI } from '@/services/api';
import { Grade, Classroom } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const GRADE_TYPES = ['quiz', 'midterm', 'final', 'homework', 'participation'];
const TYPE_BADGE: Record<string, string> = {
  quiz:          'badge-violet',
  midterm:       'badge-info',
  final:         'badge-warning',
  homework:      'badge-success',
  participation: 'badge-cyan',
};

const EMPTY = { studentId: '', subjectId: '', classroomId: '', type: 'quiz', score: '', maxScore: '100', term: 'term1', note: '' };

export default function TeacherGradesPage() {
  const [grades,   setGrades]   = useState<Grade[]>([]);
  const [classes,  setClasses]  = useState<Classroom[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);

  const load = () =>
    Promise.all([teacherAPI.getGrades(), teacherAPI.getClasses()])
      .then(([gr, cr]) => { setGrades(gr.data.data.grades); setClasses(cr.data.data.classrooms); })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.studentId || !form.score) { toast.error('Student ID and score required'); return; }
    setSaving(true);
    try {
      await teacherAPI.createGrade({ ...form, score: Number(form.score), maxScore: Number(form.maxScore) });
      toast.success('Grade recorded');
      setShowForm(false); setForm(EMPTY); load();
    } catch { toast.error('Failed to save grade'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this grade?')) return;
    await teacherAPI.deleteGrade(id);
    toast.success('Grade deleted'); load();
  };

  const selectCls = 'input-field appearance-none';

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-5 max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }} className="flex items-center justify-between">
          <div>
            <h1 className="section-header">Grade Management</h1>
            <p className="section-subheader">{grades.length} grades recorded</p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn-gradient gap-2">
            <Plus className="w-4 h-4" /> Record Grade
          </button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }} className="glass-card p-6">
              <div className="glow-line-top" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-foreground">Record Grade</h3>
                <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Student ID</label>
                  <input dir="ltr" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} placeholder="Student's user ID" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Classroom</label>
                  <select value={form.classroomId} onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))} className={selectCls}>
                    <option value="">Select classroom…</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Type</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className={selectCls}>
                    {GRADE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Score</label>
                  <input type="number" dir="ltr" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} placeholder="0" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Max Score</label>
                  <input type="number" dir="ltr" value={form.maxScore} onChange={e => setForm(f => ({ ...f, maxScore: e.target.value }))} placeholder="100" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Term</label>
                  <select value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))} className={selectCls}>
                    {['term1','term2','term3'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={saving} className="btn-gradient gap-2 disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Saving…' : 'Save Grade'}
                </button>
                <button onClick={() => { setShowForm(false); setForm(EMPTY); }} className="btn-ghost">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 24 }} className="glass-card overflow-hidden">
          <div className="glow-line-top" />
          <table className="data-table">
            <thead><tr>{['Student', 'Type', 'Score', 'Pct', 'Term', 'Date', ''].map(h => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {loading ? Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-white/[0.03]">{[1,2,3,4,5,6,7].map(j => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>)}</tr>
              )) : grades.length === 0 ? (
                <tr><td colSpan={7}><div className="flex flex-col items-center py-16 gap-3">
                  <div className="icon-box-lg bg-indigo-500/5 border border-indigo-500/10"><BarChart3 className="w-6 h-6 text-indigo-400/40" /></div>
                  <p className="text-sm text-muted-foreground">No grades recorded yet</p>
                  <button onClick={() => setShowForm(true)} className="btn-gradient gap-2 mt-1"><Plus className="w-4 h-4" /> Record first grade</button>
                </div></td></tr>
              ) : grades.map((g, i) => {
                const pct = Math.round((g.score / g.maxScore) * 100);
                const pass = pct >= 60;
                return (
                  <motion.tr key={g._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}>
                    <td className="font-mono text-xs text-muted-foreground">{String(g.studentId).slice(-8)}</td>
                    <td><span className={cn('badge text-[10px]', TYPE_BADGE[g.type] || 'badge-default')}>{g.type}</span></td>
                    <td><span className={cn('font-black tabular-nums text-sm', pass ? 'text-emerald-400' : 'text-rose-400')}>{g.score}/{g.maxScore}</span></td>
                    <td>
                      <div className="flex items-center gap-2">
                        {pass ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                        <div className="w-16 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                          <div className={cn('h-full rounded-full transition-all', pass ? 'bg-emerald-400' : 'bg-rose-400')} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-muted-foreground">{pct}%</span>
                      </div>
                    </td>
                    <td className="text-muted-foreground text-xs capitalize">{g.term?.replace('term', 'T')}</td>
                    <td className="text-muted-foreground text-xs">{new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</td>
                    <td>
                      <button onClick={() => handleDelete(g._id)} className="btn-icon hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </motion.div>
      </div>
    </SMSLayout>
  );
}
