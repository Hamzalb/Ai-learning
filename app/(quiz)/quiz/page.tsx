'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Plus, Trash2, Trophy, Clock, CheckCircle,
  XCircle, BarChart3, Zap, ChevronRight, Target, ArrowRight, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { quizAPI, pdfAPI } from '@/services/api';
import type { Quiz, QuizQuestion, QuizResult, Document } from '@/types';
import { formatDate, getDifficultyColor, getGradeColor, truncate } from '@/lib/utils';

type View = 'list' | 'generate' | 'taking' | 'results';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function QuizPage() {
  const [view, setView] = useState<View>('list');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [startTime, setStartTime] = useState(0);

  const [genForm, setGenForm] = useState({
    documentId: '',
    text: '',
    difficulty: 'medium',
    questionCount: 10,
    language: 'arabic',
    subject: 'general',
    title: ''
  });

  useEffect(() => {
    Promise.all([
      quizAPI.getQuizzes().then(r => setQuizzes(r.data.data.quizzes)),
      pdfAPI.getDocuments().then(r => setDocuments(r.data.data.documents.filter((d: Document) => d.processingStatus === 'completed')))
    ]).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (view !== 'taking' || !activeQuiz) return;
    setTimeLeft(activeQuiz.timeLimit * 60);
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timer); handleSubmit(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [view, activeQuiz]);

  const handleGenerate = async () => {
    if (!genForm.documentId && !genForm.text.trim()) {
      toast.error('اختر مستنداً أو أدخل نصاً');
      return;
    }
    setGenerating(true);
    try {
      const res = await quizAPI.generateQuiz(genForm);
      const quiz = res.data.data.quiz;
      setQuizzes(prev => [quiz, ...prev]);
      toast.success('تم إنشاء الاختبار!');
      setView('list');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'فشل إنشاء الاختبار';
      toast.error(msg);
    } finally {
      setGenerating(false);
    }
  };

  const handleStartQuiz = async (quiz: Quiz) => {
    try {
      const res = await quizAPI.getQuizById(quiz._id);
      const fullQuiz = res.data.data.quiz;
      setActiveQuiz(fullQuiz);
      setAnswers(new Array(fullQuiz.questions.length).fill(''));
      setCurrentQ(0);
      setStartTime(Date.now());
      setView('taking');
    } catch {
      toast.error('فشل تحميل الاختبار');
    }
  };

  const handleSubmit = async () => {
    if (!activeQuiz) return;
    setSubmitting(true);
    try {
      const timeTaken = Math.floor((Date.now() - startTime) / 1000);
      const res = await quizAPI.submitQuiz(activeQuiz._id, { answers, timeTaken });
      setResult(res.data.data);
      setView('results');
    } catch {
      toast.error('فشل إرسال الإجابات');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا الاختبار؟')) return;
    await quizAPI.deleteQuiz(id);
    setQuizzes(prev => prev.filter(q => q._id !== id));
    toast.success('تم حذف الاختبار');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  // ── Quiz Taking View ──
  if (view === 'taking' && activeQuiz) {
    const q = activeQuiz.questions[currentQ] as QuizQuestion;
    const progress = ((currentQ + 1) / activeQuiz.questions.length) * 100;

    return (
      <DashboardLayout>
        <div className="min-h-screen p-6 flex flex-col items-center relative" dir="rtl">
          <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />
          <div className="w-full max-w-2xl space-y-6 relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-foreground">{activeQuiz.title}</h2>
                <p className="text-muted-foreground text-sm">
                  السؤال {currentQ + 1} من {activeQuiz.questions.length}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-mono font-bold text-lg tabular-nums ${
                timeLeft < 60 ? 'bg-red-500/8 text-red-400 border border-red-500/15' : 'bg-white/[0.04] border border-white/[0.06] text-foreground'
              }`}>
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
            </div>

            <div className="h-2 bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, hsl(217 91% 60%), hsl(262 83% 65%))' }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <div className="glass-card p-8 space-y-6 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                  <p className="text-xl font-semibold text-foreground leading-relaxed">{q.question}</p>

                  {q.type === 'mcq' && q.options && (
                    <div className="space-y-3">
                      {q.options.map((opt, i) => (
                        <motion.button
                          key={i}
                          whileTap={{ scale: 0.99 }}
                          onClick={() => {
                            const newAnswers = [...answers];
                            newAnswers[currentQ] = opt;
                            setAnswers(newAnswers);
                          }}
                          className={`w-full text-right p-4 rounded-xl border transition-all duration-200 ${
                            answers[currentQ] === opt
                              ? 'border-primary/40 bg-primary/8 text-primary'
                              : 'border-white/[0.06] hover:border-white/[0.1] hover:bg-white/[0.02] text-foreground'
                          }`}
                        >
                          {opt}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {q.type === 'true_false' && (
                    <div className="grid grid-cols-2 gap-4">
                      {['صح', 'خطأ'].map((opt) => (
                        <motion.button
                          key={opt}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            const newAnswers = [...answers];
                            newAnswers[currentQ] = opt;
                            setAnswers(newAnswers);
                          }}
                          className={`p-4 rounded-xl border font-semibold transition-all duration-200 ${
                            answers[currentQ] === opt
                              ? 'border-primary/40 bg-primary/8 text-primary'
                              : 'border-white/[0.06] hover:border-white/[0.1] text-foreground'
                          }`}
                        >
                          {opt}
                        </motion.button>
                      ))}
                    </div>
                  )}

                  {(q.type === 'fill_blank' || q.type === 'essay') && (
                    <textarea
                      value={answers[currentQ] || ''}
                      onChange={e => {
                        const newAnswers = [...answers];
                        newAnswers[currentQ] = e.target.value;
                        setAnswers(newAnswers);
                      }}
                      placeholder="اكتب إجابتك هنا..."
                      className="w-full h-32 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
                className="border-white/[0.08]"
              >
                السابق
              </Button>

              {currentQ < activeQuiz.questions.length - 1 ? (
                <Button onClick={() => setCurrentQ(currentQ + 1)} className="shadow-lg shadow-primary/15">
                  التالي
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} isLoading={submitting} variant="success" className="shadow-lg shadow-emerald-500/15">
                  <CheckCircle className="w-4 h-4" />
                  إرسال الإجابات
                </Button>
              )}
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {activeQuiz.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all duration-200 ${
                    i === currentQ ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20'
                    : answers[i] ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                    : 'bg-white/[0.04] text-muted-foreground hover:bg-white/[0.06]'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Results View ──
  if (view === 'results' && result) {
    return (
      <DashboardLayout>
        <div className="min-h-screen p-6 flex flex-col items-center relative" dir="rtl">
          <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />
          <div className="w-full max-w-2xl space-y-6 relative">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 18 }}
            >
              <div className="glass-card text-center overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
                <div className="py-12 px-6">
                  <div className={`text-7xl font-black mb-2 ${getGradeColor(result.percentage)}`}>
                    {result.grade}
                  </div>
                  <div className="text-4xl font-extrabold text-foreground mb-1 tabular-nums">{result.percentage}%</div>
                  <p className="text-muted-foreground">{result.score} / {result.totalPoints} نقطة</p>
                  <div className="flex items-center justify-center gap-3 mt-5">
                    <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500/8 border border-amber-500/12">
                      <Zap className="w-4 h-4 text-amber-400" />
                      <span className="text-amber-400 font-semibold text-sm">+{result.xpGained} XP</span>
                    </div>
                    <Badge variant={result.passed ? 'success' : 'danger'}>
                      {result.passed ? (
                        <><CheckCircle className="w-3 h-3 ml-1" /> ناجح</>
                      ) : (
                        <><XCircle className="w-3 h-3 ml-1" /> راسب</>
                      )}
                    </Badge>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 24 }}
            >
              <div className="glass-card overflow-hidden">
                <div className="p-5 pb-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <BarChart3 className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-foreground text-[15px]">نتائج مفصّلة</h3>
                </div>
                <div className="px-5 pb-5 space-y-3">
                  {result.results.map((r, i) => (
                    <div key={i} className={`p-4 rounded-xl border ${r.isCorrect ? 'border-emerald-500/15 bg-emerald-500/[0.03]' : 'border-red-500/15 bg-red-500/[0.03]'}`}>
                      <div className="flex items-start gap-3">
                        {r.isCorrect
                          ? <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                          : <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        }
                        <div className="flex-1">
                          <p className="font-medium text-foreground text-sm">{r.question}</p>
                          {!r.isCorrect && (
                            <p className="text-xs text-muted-foreground mt-1">
                              إجابتك: <span className="text-red-400">{r.yourAnswer || 'لم تجب'}</span>
                            </p>
                          )}
                          <p className="text-xs text-foreground mt-0.5">
                            الإجابة الصحيحة: <span className="text-emerald-400 font-medium">{r.correctAnswer}</span>
                          </p>
                          {r.explanation && (
                            <p className="text-xs text-muted-foreground mt-1.5 pt-1.5 border-t border-white/[0.04]">{r.explanation}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <div className="flex gap-3">
              <Button onClick={() => setView('list')} variant="outline" className="flex-1 border-white/[0.08]">
                العودة للاختبارات
              </Button>
              {activeQuiz && (
                <Button onClick={() => handleStartQuiz(activeQuiz)} className="flex-1 shadow-lg shadow-primary/15">
                  إعادة الاختبار
                </Button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Generate View ──
  if (view === 'generate') {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-2xl mx-auto space-y-8 relative" dir="rtl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView('list')} className="gap-1">
              <ArrowRight className="w-4 h-4" />
              رجوع
            </Button>
            <div>
              <h1 className="text-2xl font-extrabold text-foreground tracking-tight">إنشاء اختبار جديد</h1>
              <p className="text-muted-foreground text-sm">بالذكاء الاصطناعي</p>
            </div>
          </div>

          <div className="glass-card overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <div className="p-6 space-y-5">
              <div>
                <p className="text-sm font-medium text-foreground mb-2">مصدر المحتوى</p>
                {documents.length > 0 && (
                  <select
                    value={genForm.documentId}
                    onChange={e => setGenForm(f => ({ ...f, documentId: e.target.value, text: '' }))}
                    className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 mb-2 transition-all"
                  >
                    <option value="">اختر من مستنداتي</option>
                    {documents.map(d => (
                      <option key={d._id} value={d._id}>{d.title}</option>
                    ))}
                  </select>
                )}
                <p className="text-xs text-muted-foreground mb-2">أو أدخل نصاً مباشرة:</p>
                <textarea
                  value={genForm.text}
                  onChange={e => setGenForm(f => ({ ...f, text: e.target.value, documentId: '' }))}
                  placeholder="الصق نص الدرس هنا..."
                  className="w-full h-32 bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-sm transition-all"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'عدد الأسئلة', value: genForm.questionCount, key: 'questionCount', options: [5, 10, 15, 20].map(n => ({ v: n, l: `${n} أسئلة` })) },
                  { label: 'المستوى', value: genForm.difficulty, key: 'difficulty', options: [{ v: 'easy', l: 'سهل' }, { v: 'medium', l: 'متوسط' }, { v: 'hard', l: 'صعب' }] },
                  { label: 'لغة الاختبار', value: genForm.language, key: 'language', options: [{ v: 'arabic', l: 'عربي' }, { v: 'lebanese', l: 'عامية لبنانية' }, { v: 'english', l: 'English' }] },
                  { label: 'المادة', value: genForm.subject, key: 'subject', options: [
                    { v: 'general', l: 'عام' }, { v: 'math', l: 'رياضيات' }, { v: 'physics', l: 'فيزياء' },
                    { v: 'chemistry', l: 'كيمياء' }, { v: 'biology', l: 'أحياء' }, { v: 'history', l: 'تاريخ' },
                    { v: 'arabic', l: 'عربي' }, { v: 'english', l: 'إنجليزي' }
                  ] }
                ].map(field => (
                  <div key={field.key}>
                    <label className="text-sm font-medium text-foreground block mb-1.5">{field.label}</label>
                    <select
                      value={field.value}
                      onChange={e => setGenForm(f => ({ ...f, [field.key]: field.key === 'questionCount' ? Number(e.target.value) : e.target.value }))}
                      className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm transition-all"
                    >
                      {field.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              <Button onClick={handleGenerate} isLoading={generating} className="w-full shadow-lg shadow-primary/15" size="lg">
                <Brain className="w-5 h-5" />
                {generating ? 'ينشئ الاختبار...' : 'إنشاء الاختبار'}
              </Button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── List View ──
  return (
    <DashboardLayout>
      <div className="p-8 space-y-8" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-extrabold text-foreground tracking-tight">الاختبارات</h1>
            <p className="text-muted-foreground mt-1 text-sm">اختبر معلوماتك بالذكاء الاصطناعي</p>
          </div>
          <Button onClick={() => setView('generate')} size="lg" className="gap-2 shadow-lg shadow-primary/15">
            <Plus className="w-5 h-5" />
            إنشاء اختبار
          </Button>
        </motion.div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-52" />)}
          </div>
        ) : quizzes.length === 0 ? (
          <div className="glass-card">
            <div className="py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/8 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">لا توجد اختبارات</h3>
              <p className="text-muted-foreground mb-6">أنشئ اختبارك الأول من دروسك</p>
              <Button onClick={() => setView('generate')} className="shadow-lg shadow-primary/15">
                <Plus className="w-4 h-4" />
                إنشاء اختبار الآن
              </Button>
            </div>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {quizzes.map((quiz) => {
              const lastAttempt = quiz.attempts?.[quiz.attempts.length - 1];
              return (
                <motion.div key={quiz._id} variants={item}>
                  <div className="glass-card-hover p-5 space-y-4 group">
                    <div className="flex items-start justify-between">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-green-400 flex items-center justify-center shadow-lg shadow-emerald-500/15">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <button
                        onClick={() => handleDelete(quiz._id)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-500/8 text-muted-foreground hover:text-red-400 transition-all"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h3 className="font-bold text-foreground truncate">{quiz.title}</h3>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                          {quiz.difficulty === 'easy' ? 'سهل' : quiz.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                        </span>
                        <span className="text-xs text-muted-foreground">{quiz.questions?.length || 0} أسئلة</span>
                      </div>
                    </div>

                    {lastAttempt && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.04]">
                        <Trophy className="w-4 h-4 text-amber-400" />
                        <span className={`text-sm font-bold ${getGradeColor(lastAttempt.percentage)}`}>
                          {lastAttempt.percentage}%
                        </span>
                        <span className="text-xs text-muted-foreground">{quiz.attempts?.length} محاولة</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => handleStartQuiz(quiz)}
                        size="sm"
                        className="flex-1 gap-1 shadow-sm"
                      >
                        <Target className="w-3.5 h-3.5" />
                        {lastAttempt ? 'إعادة' : 'ابدأ'}
                      </Button>
                      <span className="text-xs text-muted-foreground">
                        {quiz.timeLimit} دقيقة
                      </span>
                    </div>

                    <p className="text-[11px] text-muted-foreground">{formatDate(quiz.createdAt)}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
