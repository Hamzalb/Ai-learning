'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileQuestion, Clock, CheckCircle, XCircle } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

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
  const [quizzes, setQuizzes] = useState<QuizItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeQuiz, setActiveQuiz] = useState<QuizItem | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; maxScore: number } | null>(null);

  useEffect(() => {
    studentAPI.getQuizzes().then(r => setQuizzes(r.data.data.quizzes)).finally(() => setLoading(false));
  }, []);

  const handleStart = (quiz: QuizItem) => { setActiveQuiz(quiz); setAnswers({}); setResult(null); };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const answersArr = (activeQuiz.questions || []).map((q, i) => ({
        questionIndex: i,
        selected: answers[i] || ''
      }));
      const res = await studentAPI.submitQuiz(activeQuiz._id, answersArr);
      setResult({ score: res.data.data.score, maxScore: res.data.data.maxScore });
      studentAPI.getQuizzes().then(r => setQuizzes(r.data.data.quizzes));
    } catch { toast.error('Failed to submit quiz'); }
    finally { setSubmitting(false); }
  };

  if (activeQuiz && !result) {
    return (
      <SMSLayout allowedRoles={['student']}>
        <div className="max-w-3xl space-y-5">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-foreground">{activeQuiz.title}</h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              {activeQuiz.duration} min
            </div>
          </div>
          <div className="space-y-4">
            {(activeQuiz.questions || []).map((q, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
                <p className="font-medium text-foreground mb-3">Q{i + 1}. {q.question}</p>
                {q.type === 'multiple_choice' && q.options && (
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => (
                      <label key={oi} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${answers[i] === opt ? 'border-primary/40 bg-primary/8 text-foreground' : 'border-white/[0.06] text-muted-foreground hover:border-white/[0.1]'}`}>
                        <input type="radio" name={`q${i}`} value={opt} checked={answers[i] === opt} onChange={() => setAnswers(a => ({ ...a, [i]: opt }))} className="accent-primary" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'true_false' && (
                  <div className="flex gap-3">
                    {['True', 'False'].map(opt => (
                      <label key={opt} className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${answers[i] === opt ? 'border-primary/40 bg-primary/8 text-foreground' : 'border-white/[0.06] text-muted-foreground hover:border-white/[0.1]'}`}>
                        <input type="radio" name={`q${i}`} value={opt} checked={answers[i] === opt} onChange={() => setAnswers(a => ({ ...a, [i]: opt }))} className="accent-primary" />
                        {opt}
                      </label>
                    ))}
                  </div>
                )}
                {q.type === 'short_answer' && (
                  <input value={answers[i] || ''} onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))} placeholder="Your answer..." className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
                )}
              </motion.div>
            ))}
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSubmit} isLoading={submitting} className="btn-gradient">Submit Quiz</Button>
            <Button variant="ghost" onClick={() => setActiveQuiz(null)}>Cancel</Button>
          </div>
        </div>
      </SMSLayout>
    );
  }

  if (result) {
    const pct = Math.round((result.score / result.maxScore) * 100);
    return (
      <SMSLayout allowedRoles={['student']}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-md mx-auto mt-12 glass-card p-8 text-center">
          {pct >= 60 ? <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" /> : <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />}
          <h2 className="text-2xl font-extrabold text-foreground mb-1">Quiz Complete!</h2>
          <p className="text-5xl font-extrabold my-4 tabular-nums" style={{ color: pct >= 60 ? '#34d399' : '#f87171' }}>{pct}%</p>
          <p className="text-muted-foreground">{result.score} out of {result.maxScore} correct</p>
          <Button onClick={() => { setActiveQuiz(null); setResult(null); }} className="btn-gradient mt-6 w-full">Back to Quizzes</Button>
        </motion.div>
      </SMSLayout>
    );
  }

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">My Quizzes</h1>
          <p className="text-sm text-muted-foreground">{quizzes.length} quizzes assigned</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? <p className="col-span-2 text-center py-12 text-muted-foreground">Loading...</p>
            : quizzes.length === 0 ? (
              <div className="col-span-2 glass-card p-12 text-center">
                <FileQuestion className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No quizzes assigned yet</p>
              </div>
            ) : quizzes.map((q, i) => (
              <motion.div key={q._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card-hover p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-foreground">{q.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{q.duration || 0} min</span>
                      <span>{q.questions?.length || 0} questions</span>
                    </div>
                  </div>
                  {q.status === 'completed' ? (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Done</span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-violet-500/10 text-violet-400 border border-violet-500/20">Pending</span>
                  )}
                </div>
                {q.submission && (
                  <p className="text-xs text-emerald-400 mb-3">Score: {q.submission.score}/{q.submission.maxScore} ({Math.round(q.submission.score / q.submission.maxScore * 100)}%)</p>
                )}
                {q.status === 'upcoming' && (
                  <Button onClick={() => handleStart(q)} className="w-full btn-gradient text-xs h-9">Start Quiz</Button>
                )}
              </motion.div>
            ))}
        </div>
      </div>
    </SMSLayout>
  );
}
