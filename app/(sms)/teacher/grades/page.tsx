'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, BarChart3, X, CheckCircle2, AlertCircle, Users } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { teacherAPI } from '@/services/api';
import { Grade, Classroom, User } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

const GRADE_TYPES = ['quiz', 'midterm', 'final', 'homework', 'participation'];
const TYPE_BADGE: Record<string, string> = {
  quiz: 'badge-violet', midterm: 'badge-info', final: 'badge-warning',
  homework: 'badge-success', participation: 'badge-cyan',
};
const EMPTY = {
  classroomId: '', studentId: '', subjectName: '',
  type: 'quiz', score: '', maxScore: '100', term: 'term1', note: '',
};

export default function TeacherGradesPage() {
  const [grades,   setGrades]   = useState<Grade[]>([]);
  const [classes,  setClasses]  = useState<Classroom[]>([]);
  const [roster,   setRoster]   = useState<User[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [saving,   setSaving]   = useState(false);
  const [loadingRoster, setLoadingRoster] = useState(false);
  const t = useT();

  const load = () =>
    Promise.all([teacherAPI.getGrades(), teacherAPI.getClasses()])
      .then(([gr, cr]) => {
        setGrades(gr.data.data.grades);
        setClasses(cr.data.data.classrooms);
      })
      .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleClassroomChange = async (classroomId: string) => {
    setForm(f => ({ ...f, classroomId, studentId: '' }));
    setRoster([]);
    if (!classroomId) return;
    setLoadingRoster(true);
    try {
      const res = await teacherAPI.getClassRoster(classroomId);
      setRoster(res.data.data.students || []);
    } catch {
      toast.error('Failed to load students for this class');
    } finally {
      setLoadingRoster(false);
    }
  };

  const handleCreate = async () => {
    if (!form.classroomId) { toast.error(t('step1SelectClass')); return; }
    if (!form.studentId)   { toast.error(t('step2SelectStudent')); return; }
    if (!form.score)       { toast.error(t('score') + ' required'); return; }
    setSaving(true);
    try {
      await teacherAPI.createGrade({
        studentId:   form.studentId,
        classroomId: form.classroomId,
        type:        form.type,
        score:       Number(form.score),
        maxScore:    Number(form.maxScore),
        term:        form.term,
        note:        form.note || undefined,
      });
      toast.success(t('saveGrade'));
      setShowForm(false); setForm(EMPTY); setRoster([]); load();
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'Failed to save grade');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete') + '?')) return;
    await teacherAPI.deleteGrade(id);
    toast.success(t('delete')); load();
  };

  const closeForm = () => { setShowForm(false); setForm(EMPTY); setRoster([]); };

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-5 max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="section-header">{t('gradeManagement')}</h1>
            <p className="section-subheader">{grades.length} {t('grades').toLowerCase()} recorded</p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn-gradient gap-2">
            <Plus className="w-4 h-4" /> {t('recordGrade')}
          </button>
        </motion.div>

        {/* ── Create form ────────────────────────────────── */}
        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card p-6">
              <div className="glow-line-top" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-foreground">{t('recordGrade')}</h3>
                <button onClick={closeForm} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
                {/* Step 1: Classroom */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    {t('step1SelectClass')}
                  </label>
                  <select
                    value={form.classroomId}
                    onChange={e => handleClassroomChange(e.target.value)}
                    className="input-field appearance-none"
                  >
                    <option value="">{t('selectClassroom')}</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                  {classes.length === 0 && (
                    <p className="text-xs text-amber-400 mt-1.5">
                      {t('noActiveTeachers')}
                    </p>
                  )}
                </div>

                {/* Step 2: Student from roster */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    {t('step2SelectStudent')}
                  </label>
                  <div className="relative">
                    <select
                      value={form.studentId}
                      onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                      disabled={!form.classroomId || loadingRoster}
                      className="input-field appearance-none disabled:opacity-50"
                    >
                      <option value="">
                        {loadingRoster ? t('loadingStudents')
                          : !form.classroomId ? t('selectClassFirst')
                          : roster.length === 0 ? t('noStudentsEnrolled')
                          : t('step2SelectStudent')}
                      </option>
                      {roster.map(s => (
                        <option key={s._id} value={s._id}>{s.name} — {s.email}</option>
                      ))}
                    </select>
                    {loadingRoster && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                    )}
                  </div>
                  {form.classroomId && roster.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      <Users className="inline w-3 h-3 mr-1" />{roster.length} {t('studentsEnrolled')}
                    </p>
                  )}
                </div>

                {/* Grade type */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('gradeType')}</label>
                  <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))} className="input-field appearance-none">
                    {GRADE_TYPES.map(gt => <option key={gt} value={gt}>{gt.charAt(0).toUpperCase() + gt.slice(1)}</option>)}
                  </select>
                </div>

                {/* Term */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('term')}</label>
                  <select value={form.term} onChange={e => setForm(f => ({ ...f, term: e.target.value }))} className="input-field appearance-none">
                    {['term1','term2','term3'].map(tm => <option key={tm} value={tm}>{tm.toUpperCase()}</option>)}
                  </select>
                </div>

                {/* Score */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('score')}</label>
                  <input type="number" dir="ltr" min="0" value={form.score}
                    onChange={e => setForm(f => ({ ...f, score: e.target.value }))}
                    placeholder="0" className="input-field" />
                </div>

                {/* Max score */}
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('maxScore')}</label>
                  <input type="number" dir="ltr" min="1" value={form.maxScore}
                    onChange={e => setForm(f => ({ ...f, maxScore: e.target.value }))}
                    placeholder="100" className="input-field" />
                </div>

                {/* Note (optional) */}
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                    {t('note')} <span className="normal-case font-normal text-muted-foreground/60">({t('optional')})</span>
                  </label>
                  <input value={form.note} onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                    placeholder="e.g. missed question 3..." className="input-field" />
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={saving} className="btn-gradient gap-2 disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? t('saving') : t('saveGrade')}
                </button>
                <button onClick={closeForm} className="btn-ghost">{t('cancel')}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Grades table ───────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 24 }}
          className="glass-card overflow-hidden">
          <div className="glow-line-top" />
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  {[t('students'), t('classroom'), t('gradeType'), t('score'), '%', t('term'), ''].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-white/[0.03]">
                      {[1,2,3,4,5,6,7].map(j => (
                        <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>
                      ))}
                    </tr>
                  ))
                  : grades.length === 0
                  ? (
                    <tr><td colSpan={7}>
                      <div className="flex flex-col items-center py-16 gap-3">
                        <div className="icon-box-lg bg-indigo-500/5 border border-indigo-500/10">
                          <BarChart3 className="w-6 h-6 text-indigo-400/40" />
                        </div>
                        <p className="text-sm text-muted-foreground">{t('noGrades')}</p>
                        <button onClick={() => setShowForm(true)} className="btn-gradient gap-2 mt-1">
                          <Plus className="w-4 h-4" /> {t('recordFirstGrade')}
                        </button>
                      </div>
                    </td></tr>
                  )
                  : grades.map((g, i) => {
                    const pct  = Math.round((g.score / g.maxScore) * 100);
                    const pass = pct >= 60;
                    const cls  = classes.find(c => c._id === g.classroomId);
                    return (
                      <motion.tr key={g._id}
                        initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}>
                        <td className="font-mono text-xs text-muted-foreground">
                          {String(g.studentId).slice(-8)}
                        </td>
                        <td className="text-xs text-muted-foreground">{cls?.name || '—'}</td>
                        <td>
                          <span className={cn('badge text-[10px]', TYPE_BADGE[g.type] || 'badge-default')}>
                            {g.type}
                          </span>
                        </td>
                        <td>
                          <span className={cn('font-black tabular-nums text-sm', pass ? 'text-emerald-400' : 'text-rose-400')}>
                            {g.score}/{g.maxScore}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-2">
                            {pass
                              ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              : <AlertCircle  className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                            <div className="w-14 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                              <div className={cn('h-full rounded-full', pass ? 'bg-emerald-400' : 'bg-rose-400')}
                                style={{ width: `${pct}%` }} />
                            </div>
                            <span className="text-xs font-semibold text-muted-foreground tabular-nums">{pct}%</span>
                          </div>
                        </td>
                        <td className="text-muted-foreground text-xs capitalize">
                          {g.term?.replace('term', 'T')}
                        </td>
                        <td>
                          <button onClick={() => handleDelete(g._id)}
                            className="btn-icon hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20">
                            <Trash2 className="w-3.5 h-3.5" />
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
