'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

interface QuizItem {
  _id: string;
  title: string;
  duration?: number;
  questions?: { question: string; type: string; options?: string[]; correctAnswer?: string }[];
  dueDate?: string;
  status: 'upcoming' | 'completed';
  submission?: { score: number; maxScore: number };
}

export default function StudentQuizzesPage() {
  const [quizzes,    setQuizzes]    = useState<QuizItem[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [answers,    setAnswers]    = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result,     setResult]     = useState<{ score: number; maxScore: number } | null>(null);

  useEffect(() => {
    studentAPI.getQuizzes().then(r => setQuizzes(r.data.data.quizzes)).finally(() => setLoading(false));
  }, []);

  const handleStart = (quiz: QuizItem) => { setActiveQuiz(quiz); setAnswers({}); setResult(null); };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const answersArr = (activeQuiz.questions || []).map((q, i) => ({ questionIndex: i, selected: answers[i] || '' }));
      const res = await studentAPI.submitQuiz(activeQuiz._id, answersArr);
      setResult({ score: res.data.data.score, maxScore: res.data.data.maxScore });
      studentAPI.getQuizzes().then(r => setQuizzes(r.data.data.quizzes));
    } catch { toast.error('Failed to submit quiz'); }
    finally { setSubmitting(false); }
  };

  // Active quiz view
  if (activeQuiz && !result) {
    return (
      <SMSLayout allowedRoles={['student']}>
        <div className="max-w-3xl space-y-5 mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="section-header">{activeQuiz.title}</h1>
              <p className="section-subheader">Answer all questions carefully</p>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/[0.06] text-sm text-muted-foreground">
              <Clock className="w-4 h-4" /> {activeQuiz.duration} min
            </div>
          </div>
          <div className="space-y-4">
            {(activeQuiz.questions || []).map((q, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
                className="glass-card p-5">
                <div className="glow-line-top" />
                <p className="font-semibold text-foreground mb-4">
                  <span className="text-muted-foreground text-xs mr-2">Q{i + 1}.</span>{q.question}
                </p>
                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className={cn(
                        'flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all',
                        answers[i] === opt ? 'border-primary/40 bg-primary/8 text-foreground' : 'border-white/[0.06] text-muted-foreground hover:border-white/[0.12] hover:bg-white/[0.02]'
                      )}>
                        <input type="radio" name={`q${i}`} value={opt} checked={answers[i] === opt}
                          onChange={() => setAnswers(a => ({ ...a, [i]: opt }))} className="accent-primary" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'true_false' && (
                  <div className="flex gap-3">
                    {['True', 'False'].map(opt => (
                      <label key={opt} className={cn(
                        'flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all font-medium',
                        answers[i] === opt ? 'border-primary/40 bg-primary/8 text-foreground' : 'border-white/[0.06] text-muted-foreground hover:border-white/[0.12]'
                      )}>
                        <input type="radio" name={`q${i}`} value={opt} checked={answers[i] === opt}
                          onChange={() => setAnswers(a => ({ ...a, [i]: opt }))} className="accent-primary" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'short_answer' && (
                  <input value={answers[i] || ''} onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))}
                    placeholder="Your answer..." className="input-field" />
                )}
              </motion.div>
            ))}
          </div>
          <div className="flex gap-3">
            <button onClick={handleSubmit} disabled={submitting} className="btn-gradient gap-2 disabled:opacity-60">
              {submitting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ChevronRight className="w-4 h-4" />}
              {submitting ? 'Submitting…' : 'Submit Quiz'}
            </button>
            <button onClick={() => setActiveQuiz(null)} className="btn-ghost">Cancel</button>
          </div>
        </div>
      </SMSLayout>
    );
  }

  // Result view
  if (result) {
    const pct  = Math.round((result.score / result.maxScore) * 100);
    const pass = pct >= 60;
    return (
      <SMSLayout allowedRoles={['student']}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="max-w-md mx-auto mt-12 glass-card p-8 text-center">
          <div className="glow-line-top" />
          <div className={cn('icon-box-lg mx-auto mb-5', pass ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-rose-500/10 border border-rose-500/20')}>
            {pass
              ? <CheckCircle className="w-7 h-7 text-emerald-400" />
              : <XCircle    className="w-7 h-7 text-rose-400" />}
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Quiz Complete!</h2>
          <p className="text-6xl font-black my-5 tabular-nums" style={{ color: pass ? '#34d399' : '#f87171' }}>{pct}%</p>
          <p className="text-sm text-muted-foreground">{result.score} out of {result.maxScore} correct</p>
          <button onClick={() => { setActiveQuiz(null); setResult(null); }} className="btn-gradient mt-6 w-full">
            Back to Quizzes
          </button>
        </motion.div>
      </SMSLayout>
    );
  }

  // List view
  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-5 max-w-4xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
          <h1 className="section-header">My Quizzes</h1>
          <p className="section-subheader">{quizzes.length} quizzes assigned</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="skeleton h-5 w-1/2 rounded" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-9 w-full rounded-xl" />
            </div>
          )) : quizzes.length === 0 ? (
            <div className="col-span-2 glass-card p-16 text-center">
              <div className="glow-line-top" />
              <div className="icon-box-lg bg-violet-500/5 border border-violet-500/10 mx-auto mb-4">
                <FileQuestion className="w-6 h-6 text-violet-400/40" />
              </div>
              <p className="text-sm text-muted-foreground">No quizzes assigned yet</p>
            </div>
          ) : quizzes.map((q, i) => (
            <motion.div key={q._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}
              className="glass-card-hover p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground truncate">{q.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{q.duration || 0} min</span>
                    <span>{q.questions?.length || 0} questions</span>
                  </div>
                </div>
                {q.status === 'completed'
                  ? <span className="badge badge-success text-[10px] shrink-0 ml-3">Done</span>
                  : <span className="badge badge-violet text-[10px] shrink-0 ml-3">Pending</span>}
              </div>
              {q.submission && (
                <p className="text-xs text-emerald-400 mb-3 font-semibold">
                  Score: {q.submission.score}/{q.submission.maxScore} ({Math.round(q.submission.score / q.submission.maxScore * 100)}%)
                </p>
              )}
              {q.status === 'upcoming' && (
                <button onClick={() => handleStart(q)} className="w-full btn-gradient text-xs h-9 gap-1.5">
                  <ChevronRight className="w-3.5 h-3.5" /> Start Quiz
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </SMSLayout>
  );
}
