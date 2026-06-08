'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Clock, FileQuestion, X } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { teacherAPI } from '@/services/api';
import { Quiz, Classroom } from '@/types';
import toast from 'react-hot-toast';
import { useT } from '@/lib/i18n';

const EMPTY_FORM = { title: '', description: '', classroomId: '', duration: '30', dueDate: '' };
const EMPTY_Q    = { text: '', type: 'multiple_choice', options: ['', '', '', ''], correctAnswer: '', points: 1 };

export default function TeacherQuizzesPage() {
  const [quizzes,   setQuizzes]   = useState<Quiz[]>([]);
  const [classes,   setClasses]   = useState<Classroom[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [questions, setQuestions] = useState([{ ...EMPTY_Q, options: ['', '', '', ''] }]);
  const [saving,    setSaving]    = useState(false);
  const t = useT();

  const load = () =>
    Promise.all([teacherAPI.getQuizzes(), teacherAPI.getClasses()])
      .then(([qr, cr]) => { setQuizzes(qr.data.data.quizzes); setClasses(cr.data.data.classrooms); })
      .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const addQuestion = () => setQuestions(q => [...q, { ...EMPTY_Q, options: ['', '', '', ''] }]);

  const updateQuestion = (i: number, field: string, val: unknown) =>
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: val } : q));

  const handleCreate = async () => {
    if (!form.title || !form.classroomId) { toast.error(t('quizTitle') + ' & ' + t('classroom') + ' required'); return; }
    setSaving(true);
    try {
      await teacherAPI.createQuiz({ ...form, duration: Number(form.duration), questions });
      toast.success(t('createQuiz'));
      setShowForm(false);
      setForm(EMPTY_FORM);
      setQuestions([{ ...EMPTY_Q, options: ['', '', '', ''] }]);
      load();
    } catch { toast.error('Failed to create quiz'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t('delete') + '?')) return;
    await teacherAPI.deleteQuiz(id);
    toast.success(t('delete')); load();
  };

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-5 max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="section-header">{t('quizzes')}</h1>
            <p className="section-subheader">{quizzes.length} {t('quizzes').toLowerCase()} created</p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn-gradient gap-2">
            <Plus className="w-4 h-4" /> {t('createQuiz')}
          </button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card p-6 space-y-5">
              <div className="glow-line-top" />
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t('newQuiz')}</h3>
                <button onClick={() => setShowForm(false)} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('quizTitle')}</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Chapter 3 Review" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('classroom')}</label>
                  <select value={form.classroomId} onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))} className="input-field appearance-none">
                    <option value="">{t('selectClassroom')}</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('durationMin')}</label>
                  <input type="number" dir="ltr" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('dueDate')}</label>
                  <input type="datetime-local" dir="ltr" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} className="input-field" />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-foreground">{t('questions')} ({questions.length})</h4>
                  <button onClick={addQuestion} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                    <Plus className="w-3 h-3" /> {t('addQuestion')}
                  </button>
                </div>
                {questions.map((q, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground font-semibold w-6 shrink-0">Q{i + 1}</span>
                      <input value={q.text} onChange={e => updateQuestion(i, 'text', e.target.value)}
                        placeholder={t('enterQuestion')} className="input-field flex-1" />
                    </div>
                    {q.type === 'multiple_choice' && (
                      <div className="grid grid-cols-2 gap-2 ml-8">
                        {q.options.map((opt, oi) => (
                          <input key={oi} value={opt}
                            onChange={e => { const opts = [...q.options]; opts[oi] = e.target.value; updateQuestion(i, 'options', opts); }}
                            placeholder={`Option ${oi + 1}`} className="input-field text-xs py-2" />
                        ))}
                      </div>
                    )}
                    <div className="ml-8 flex items-center gap-3">
                      <input value={q.correctAnswer} onChange={e => updateQuestion(i, 'correctAnswer', e.target.value)}
                        placeholder={t('correctAnswer')}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-emerald-500/40" />
                      <span className="text-xs text-muted-foreground shrink-0">{q.points} pt</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={saving} className="btn-gradient gap-2 disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? t('creating') : t('createQuiz')}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-ghost">{t('cancel')}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="skeleton h-5 w-1/2 rounded" />
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
          )) : quizzes.length === 0 ? (
            <div className="col-span-2 glass-card p-16 text-center">
              <div className="glow-line-top" />
              <div className="icon-box-lg bg-violet-500/5 border border-violet-500/10 mx-auto mb-4">
                <FileQuestion className="w-6 h-6 text-violet-400/40" />
              </div>
              <p className="text-sm text-muted-foreground">{t('noQuizzes')}</p>
              <button onClick={() => setShowForm(true)} className="btn-gradient gap-2 mt-4">
                <Plus className="w-4 h-4" /> {t('createFirstQuiz')}
              </button>
            </div>
          ) : quizzes.map((q, i) => (
            <motion.div key={q._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}
              className="glass-card-hover p-5">
              <div className="glow-line-top" style={{ background: 'linear-gradient(90deg, transparent, hsl(265 89% 66% / 0.25), transparent)' }} />
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-foreground">{q.title}</h3>
                <button onClick={() => handleDelete(q._id)} className="btn-icon hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{q.duration || 0} min</span>
                <span>{q.questions?.length || 0} {t('questions').toLowerCase()}</span>
                {q.dueDate && <span>{t('due')}: {new Date(q.dueDate).toLocaleDateString()}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SMSLayout>
  );
}
