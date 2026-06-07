'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, BarChart3 } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { teacherAPI } from '@/services/api';
import { Grade, Classroom } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const GRADE_TYPES = ['quiz', 'midterm', 'final', 'homework', 'participation'];
const GRADE_COLORS: Record<string, string> = { quiz: 'text-violet-400', midterm: 'text-blue-400', final: 'text-amber-400', homework: 'text-emerald-400', participation: 'text-pink-400' };

export default function TeacherGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ studentId: '', subjectId: '', classroomId: '', type: 'quiz', score: '', maxScore: '100', term: 'term1', note: '' });

  const load = () => Promise.all([teacherAPI.getGrades(), teacherAPI.getClasses()])
    .then(([gr, cr]) => { setGrades(gr.data.data.grades); setClasses(cr.data.data.classrooms); })
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await teacherAPI.createGrade({ ...form, score: Number(form.score), maxScore: Number(form.maxScore) });
      toast.success('Grade recorded');
      setShowForm(false);
      setForm({ studentId: '', subjectId: '', classroomId: '', type: 'quiz', score: '', maxScore: '100', term: 'term1', note: '' });
      load();
    } catch { toast.error('Failed to save grade'); }
  };

  const handleDelete = async (id: string) => {
    await teacherAPI.deleteGrade(id);
    toast.success('Grade deleted');
    load();
  };

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Grade Management</h1>
            <p className="text-sm text-muted-foreground">{grades.length} grades recorded</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Add Grade</Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-foreground">Record Grade</h3>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Student ID" value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))} placeholder="Student's ID" dir="ltr" />
              <Input label="Subject ID" value={form.subjectId} onChange={e => setForm(f => ({ ...f, subjectId: e.target.value }))} dir="ltr" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Classroom</label>
                <select value={form.classroomId} onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                  <option value="">Select class...</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Type</label>
                <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                  {GRADE_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                </select>
              </div>
              <Input label="Score" type="number" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} dir="ltr" />
              <Input label="Max Score" type="number" value={form.maxScore} onChange={e => setForm(f => ({ ...f, maxScore: e.target.value }))} dir="ltr" />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Save</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Student', 'Type', 'Score', 'Term', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
                : grades.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No grades recorded yet</td></tr>
                : grades.map((g, i) => (
                  <motion.tr key={g._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 font-medium text-foreground text-xs">{g.studentId}</td>
                    <td className="px-5 py-4">
                      <span className={cn('text-xs font-medium capitalize', GRADE_COLORS[g.type])}>{g.type}</span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={cn('font-bold tabular-nums', (g.score / g.maxScore) >= 0.6 ? 'text-emerald-400' : 'text-red-400')}>
                        {g.score}/{g.maxScore}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground capitalize">{g.term}</td>
                    <td className="px-5 py-4 text-muted-foreground">{new Date(g.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => handleDelete(g._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
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
