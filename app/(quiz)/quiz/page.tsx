'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Plus, Trash2, Trophy, Clock, CheckCircle,
  XCircle, BarChart3, Zap, ChevronRight, Target
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
      toast.success('تم إنشاء الاختبار! 🎉');
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

  if (view === 'taking' && activeQuiz) {
    const q = activeQuiz.questions[currentQ] as QuizQuestion;
    const progress = ((currentQ + 1) / activeQuiz.questions.length) * 100;

    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background p-6 flex flex-col items-center" dir="rtl">
          <div className="w-full max-w-2xl space-y-6">
            {/* Quiz Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-foreground">{activeQuiz.title}</h2>
                <p className="text-muted-foreground text-sm">
                  السؤال {currentQ + 1} من {activeQuiz.questions.length}
                </p>
              </div>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg ${
                timeLeft < 60 ? 'bg-red-500/10 text-red-400' : 'bg-secondary text-foreground'
              }`}>
                <Clock className="w-5 h-5" />
                {formatTime(timeLeft)}
              </div>
            </div>

            {/* Progress */}
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <motion.div
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                transition={{ duration: 0.3 }}
              />
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
              <motion.div
                key={currentQ}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <Card>
                  <CardContent className="p-8 space-y-6">
                    <p className="text-xl font-semibold text-foreground leading-relaxed">{q.question}</p>

                    {q.type === 'mcq' && q.options && (
                      <div className="space-y-3">
                        {q.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              const newAnswers = [...answers];
                              newAnswers[currentQ] = opt;
                              setAnswers(newAnswers);
                            }}
                            className={`w-full text-right p-4 rounded-xl border transition-all ${
                              answers[currentQ] === opt
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-border/80 hover:bg-secondary/50 text-foreground'
                            }`}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}

                    {q.type === 'true_false' && (
                      <div className="grid grid-cols-2 gap-4">
                        {['صح', 'خطأ'].map((opt) => (
                          <button
                            key={opt}
                            onClick={() => {
                              const newAnswers = [...answers];
                              newAnswers[currentQ] = opt;
                              setAnswers(newAnswers);
                            }}
                            className={`p-4 rounded-xl border font-semibold transition-all ${
                              answers[currentQ] === opt
                                ? 'border-primary bg-primary/10 text-primary'
                                : 'border-border hover:border-border/80 text-foreground'
                            }`}
                          >
                            {opt}
                          </button>
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
                        className="w-full h-32 bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                      />
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentQ(Math.max(0, currentQ - 1))}
                disabled={currentQ === 0}
              >
                السابق
              </Button>

              {currentQ < activeQuiz.questions.length - 1 ? (
                <Button onClick={() => setCurrentQ(currentQ + 1)}>
                  التالي
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} isLoading={submitting} variant="success">
                  <CheckCircle className="w-4 h-4" />
                  إرسال الإجابات
                </Button>
              )}
            </div>

            {/* Question dots */}
            <div className="flex flex-wrap gap-2 justify-center">
              {activeQuiz.questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                    i === currentQ ? 'bg-primary text-primary-foreground'
                    : answers[i] ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-secondary text-muted-foreground'
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

  if (view === 'results' && result) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-background p-6 flex flex-col items-center" dir="rtl">
          <div className="w-full max-w-2xl space-y-6">
            {/* Score Card */}
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
              <Card className="text-center">
                <CardContent className="py-10">
                  <div className={`text-7xl font-black mb-2 ${getGradeColor(result.percentage)}`}>
                    {result.grade}
                  </div>
                  <div className="text-4xl font-bold text-foreground mb-1">{result.percentage}%</div>
                  <p className="text-muted-foreground">{result.score} / {result.totalPoints} نقطة</p>
                  <div className="flex items-center justify-center gap-3 mt-4">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-500/10">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-400 font-semibold">+{result.xpGained} XP</span>
                    </div>
                    <Badge variant={result.passed ? 'success' : 'danger'}>
                      {result.passed ? '✅ ناجح' : '❌ راسب'}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Results Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-blue-400" />
                  نتائج مفصّلة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.results.map((r, i) => (
                  <div key={i} className={`p-4 rounded-xl border ${r.isCorrect ? 'border-green-500/20 bg-green-500/5' : 'border-red-500/20 bg-red-500/5'}`}>
                    <div className="flex items-start gap-3">
                      {r.isCorrect
                        ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
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
                          الإجابة الصحيحة: <span className="text-green-400 font-medium">{r.correctAnswer}</span>
                        </p>
                        {r.explanation && (
                          <p className="text-xs text-muted-foreground mt-1 border-t border-border/50 pt-1">{r.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="flex gap-3">
              <Button onClick={() => setView('list')} variant="outline" className="flex-1">
                العودة للاختبارات
              </Button>
              {activeQuiz && (
                <Button onClick={() => handleStartQuiz(activeQuiz)} className="flex-1">
                  إعادة الاختبار
                </Button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (view === 'generate') {
    return (
      <DashboardLayout>
        <div className="p-8 max-w-2xl mx-auto space-y-8" dir="rtl">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setView('list')}>→ رجوع</Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">إنشاء اختبار جديد</h1>
              <p className="text-muted-foreground text-sm">بالذكاء الاصطناعي</p>
            </div>
          </div>

          <Card>
            <CardContent className="p-6 space-y-5">
              {/* Source */}
              <div>
                <p className="text-sm font-medium text-foreground mb-2">مصدر المحتوى</p>
                {documents.length > 0 && (
                  <select
                    value={genForm.documentId}
                    onChange={e => setGenForm(f => ({ ...f, documentId: e.target.value, text: '' }))}
                    className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring mb-2"
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
                  className="w-full h-32 bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">عدد الأسئلة</label>
                  <select
                    value={genForm.questionCount}
                    onChange={e => setGenForm(f => ({ ...f, questionCount: Number(e.target.value) }))}
                    className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {[5, 10, 15, 20].map(n => <option key={n} value={n}>{n} أسئلة</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">المستوى</label>
                  <select
                    value={genForm.difficulty}
                    onChange={e => setGenForm(f => ({ ...f, difficulty: e.target.value }))}
                    className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="easy">سهل</option>
                    <option value="medium">متوسط</option>
                    <option value="hard">صعب</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">لغة الاختبار</label>
                  <select
                    value={genForm.language}
                    onChange={e => setGenForm(f => ({ ...f, language: e.target.value }))}
                    className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="arabic">عربي</option>
                    <option value="lebanese">عامية لبنانية</option>
                    <option value="english">English</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground block mb-1">المادة</label>
                  <select
                    value={genForm.subject}
                    onChange={e => setGenForm(f => ({ ...f, subject: e.target.value }))}
                    className="w-full bg-input border border-border rounded-xl px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {['general', 'math', 'physics', 'chemistry', 'biology', 'history', 'arabic', 'english'].map(s => (
                      <option key={s} value={s}>{s === 'general' ? 'عام' : s === 'math' ? 'رياضيات' : s === 'physics' ? 'فيزياء' : s === 'chemistry' ? 'كيمياء' : s === 'biology' ? 'أحياء' : s === 'history' ? 'تاريخ' : s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <Button onClick={handleGenerate} isLoading={generating} className="w-full" size="lg">
                <Brain className="w-5 h-5" />
                {generating ? 'ينشئ الاختبار...' : 'إنشاء الاختبار'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8" dir="rtl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">الاختبارات</h1>
            <p className="text-muted-foreground mt-1">اختبر معلوماتك بالذكاء الاصطناعي</p>
          </div>
          <Button onClick={() => setView('generate')} size="lg" className="gap-2">
            <Plus className="w-5 h-5" />
            إنشاء اختبار
          </Button>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : quizzes.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Brain className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-bold text-foreground mb-2">لا توجد اختبارات</h3>
              <p className="text-muted-foreground mb-6">أنشئ اختبارك الأول من دروسك</p>
              <Button onClick={() => setView('generate')}>
                <Plus className="w-4 h-4" />
                إنشاء اختبار الآن
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {quizzes.map((quiz, i) => {
              const lastAttempt = quiz.attempts?.[quiz.attempts.length - 1];
              return (
                <motion.div
                  key={quiz._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="hover:border-primary/30 transition-all group">
                    <CardContent className="p-5 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-700 flex items-center justify-center">
                          <Brain className="w-5 h-5 text-white" />
                        </div>
                        <button
                          onClick={() => handleDelete(quiz._id)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div>
                        <h3 className="font-bold text-foreground truncate">{quiz.title}</h3>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${getDifficultyColor(quiz.difficulty)}`}>
                            {quiz.difficulty === 'easy' ? 'سهل' : quiz.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                          </span>
                          <span className="text-xs text-muted-foreground">{quiz.questions?.length || 0} أسئلة</span>
                        </div>
                      </div>

                      {lastAttempt && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
                          <Trophy className="w-4 h-4 text-yellow-400" />
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
                          className="flex-1 gap-1"
                        >
                          <Target className="w-3.5 h-3.5" />
                          {lastAttempt ? 'إعادة' : 'ابدأ'}
                        </Button>
                        <span className="text-xs text-muted-foreground">
                          {quiz.timeLimit} دقيقة
                        </span>
                      </div>

                      <p className="text-xs text-muted-foreground">{formatDate(quiz.createdAt)}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
