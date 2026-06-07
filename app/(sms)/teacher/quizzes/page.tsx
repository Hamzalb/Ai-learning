'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Eye, Clock, FileQuestion } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { teacherAPI } from '@/services/api';
import { Quiz, Classroom } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function TeacherQuizzesPage() {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', classroomId: '', duration: '30', dueDate: '' });
  const [questions, setQuestions] = useState([{ question: '', type: 'multiple_choice', options: ['', '', '', ''], correctAnswer: '', points: 1 }]);

  const load = () => Promise.all([teacherAPI.getQuizzes(), teacherAPI.getClasses()])
    .then(([qr, cr]) => { setQuizzes(qr.data.data.quizzes); setClasses(cr.data.data.classrooms); })
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const addQuestion = () => setQuestions(q => [...q, { question: '', type: 'multiple_choice', options: ['', '', '', ''], correctAnswer: '', points: 1 }]);

  const updateQuestion = (i: number, field: string, val: unknown) => {
    setQuestions(qs => qs.map((q, idx) => idx === i ? { ...q, [field]: val } : q));
  };

  const handleCreate = async () => {
    try {
      await teacherAPI.createQuiz({ ...form, duration: Number(form.duration), questions });
      toast.success('Quiz created');
      setShowForm(false);
      setForm({ title: '', description: '', classroomId: '', duration: '30', dueDate: '' });
      setQuestions([{ question: '', type: 'multiple_choice', options: ['', '', '', ''], correctAnswer: '', points: 1 }]);
      load();
    } catch { toast.error('Failed to create quiz'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this quiz?')) return;
    await teacherAPI.deleteQuiz(id);
    toast.success('Quiz deleted');
    load();
  };

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Quizzes</h1>
            <p className="text-sm text-muted-foreground">{quizzes.length} quizzes created</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Create Quiz</Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-5">
            <h3 className="font-bold text-foreground">New Quiz</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Quiz Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Classroom</label>
                <select value={form.classroomId} onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                  <option value="">Select class...</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <Input label="Duration (minutes)" type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} dir="ltr" />
              <Input label="Due Date" type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} dir="ltr" />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-foreground">Questions ({questions.length})</h4>
                <button onClick={addQuestion} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="w-3 h-3" /> Add Question</button>
              </div>
              {questions.map((q, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground font-medium w-6">Q{i + 1}</span>
                    <input value={q.question} onChange={e => updateQuestion(i, 'question', e.target.value)} placeholder="Enter question..." className="flex-1 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
                  </div>
                  {q.type === 'multiple_choice' && (
                    <div className="grid grid-cols-2 gap-2 ml-8">
                      {q.options.map((opt, oi) => (
                        <input key={oi} value={opt} onChange={e => { const opts = [...q.options]; opts[oi] = e.target.value; updateQuestion(i, 'options', opts); }} placeholder={`Option ${oi + 1}`} className="px-3 py-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06] text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" />
                      ))}
                    </div>
                  )}
                  <div className="ml-8 flex items-center gap-3">
                    <input value={q.correctAnswer} onChange={e => updateQuestion(i, 'correctAnswer', e.target.value)} placeholder="Correct answer..." className="flex-1 px-3 py-1.5 rounded-lg bg-emerald-500/5 border border-emerald-500/20 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none" />
                    <span className="text-xs text-muted-foreground">{q.points} pt</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Create Quiz</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? <p className="text-muted-foreground col-span-2 text-center py-8">Loading...</p>
            : quizzes.length === 0 ? (
              <div className="col-span-2 glass-card p-12 text-center">
                <FileQuestion className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No quizzes created yet</p>
              </div>
            ) : quizzes.map((q, i) => (
              <motion.div key={q._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-bold text-foreground">{q.title}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => handleDelete(q._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{q.duration || 0} min</span>
                  <span>{q.questions?.length || 0} questions</span>
                  {q.dueDate && <span>Due: {new Date(q.dueDate).toLocaleDateString()}</span>}
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </SMSLayout>
  );
}
