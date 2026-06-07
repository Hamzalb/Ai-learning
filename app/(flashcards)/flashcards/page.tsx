'use client';
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, RotateCcw, ChevronRight, ChevronLeft, Sparkles, Check, X, Minus, BookOpen, Filter } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { flashcardAPI } from '@/services/api';
import { Flashcard } from '@/types';
import { cn } from '@/lib/utils';

const CONFIDENCE_LABELS = ['لا أعرف', 'صعب', 'متوسط', 'سهل', 'أتقنته'];
const CONFIDENCE_COLORS = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400', 'text-blue-400'];

const SUBJECTS = ['all', 'general', 'math', 'physics', 'chemistry', 'biology', 'history', 'arabic', 'english'];
const SUBJECT_LABELS: Record<string, string> = { all: 'الكل', general: 'عام', math: 'رياضيات', physics: 'فيزياء', chemistry: 'كيمياء', biology: 'أحياء', history: 'تاريخ', arabic: 'عربي', english: 'إنجليزي' };

type Mode = 'list' | 'study' | 'create' | 'generate';

export default function FlashcardsPage() {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('list');
  const [subject, setSubject] = useState('all');
  const [dueOnly, setDueOnly] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [newCard, setNewCard] = useState({ front: '', back: '', subject: 'general' });
  const [genForm, setGenForm] = useState({ text: '', subject: 'general', count: 10, language: 'arabic' });
  const [generating, setGenerating] = useState(false);

  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const res = await flashcardAPI.getFlashcards({ subject: subject === 'all' ? undefined : subject, due: dueOnly || undefined });
      setFlashcards(res.data.data.flashcards);
    } catch { toast.error('فشل تحميل البطاقات'); }
    finally { setLoading(false); }
  }, [subject, dueOnly]);

  useEffect(() => { loadCards(); }, [loadCards]);

  const handleCreate = async () => {
    if (!newCard.front || !newCard.back) return toast.error('أدخل السؤال والجواب');
    try {
      await flashcardAPI.createFlashcard(newCard);
      toast.success('تمت إضافة البطاقة');
      setNewCard({ front: '', back: '', subject: 'general' });
      setMode('list');
      loadCards();
    } catch { toast.error('فشل إنشاء البطاقة'); }
  };

  const handleGenerate = async () => {
    if (!genForm.text || genForm.text.length < 50) return toast.error('أدخل نصاً أطول من 50 حرف');
    setGenerating(true);
    try {
      const res = await flashcardAPI.generateFlashcards(genForm);
      toast.success(`تم إنشاء ${res.data.data.count} بطاقة`);
      setMode('list');
      loadCards();
    } catch { toast.error('فشل توليد البطاقات'); }
    finally { setGenerating(false); }
  };

  const handleReview = async (confidence: 0 | 1 | 2 | 3 | 4) => {
    const card = flashcards[studyIndex];
    try {
      await flashcardAPI.reviewFlashcard(card._id, confidence);
      setFlipped(false);
      if (studyIndex + 1 >= flashcards.length) {
        toast.success('انتهيت من جميع البطاقات! 🎉');
        setMode('list');
        loadCards();
      } else {
        setTimeout(() => setStudyIndex(i => i + 1), 300);
      }
    } catch { toast.error('فشل تسجيل المراجعة'); }
  };

  const handleDelete = async (id: string) => {
    try {
      await flashcardAPI.deleteFlashcard(id);
      toast.success('تم حذف البطاقة');
      loadCards();
    } catch { toast.error('فشل الحذف'); }
  };

  const startStudy = () => { setStudyIndex(0); setFlipped(false); setMode('study'); };

  if (mode === 'study' && flashcards.length > 0) {
    const card = flashcards[studyIndex];
    return (
      <DashboardLayout>
        <div className="p-4 md:p-8 max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Button variant="ghost" onClick={() => setMode('list')}><ChevronRight className="w-4 h-4 ml-1" /> رجوع</Button>
            <span className="text-muted-foreground text-sm">{studyIndex + 1} / {flashcards.length}</span>
          </div>

          <div className="relative h-64 cursor-pointer mb-8" onClick={() => setFlipped(f => !f)}>
            <AnimatePresence mode="wait">
              <motion.div
                key={flipped ? 'back' : 'front'}
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className={cn('glass-card p-8 h-full flex flex-col items-center justify-center text-center', flipped ? 'border-green-500/30 bg-green-500/5' : '')}
              >
                <p className="text-xs text-muted-foreground mb-4">{flipped ? 'الجواب' : 'السؤال — اضغط للقلب'}</p>
                <p className="text-xl font-semibold text-foreground leading-relaxed">{flipped ? card.back : card.front}</p>
              </motion.div>
            </AnimatePresence>
          </div>

          {flipped ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {([0, 1, 2, 3] as const).map(c => (
                <button key={c} onClick={() => handleReview(c)}
                  className={cn('p-3 rounded-xl border text-sm font-medium transition-all hover:scale-105', {
                    0: 'border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20',
                    1: 'border-orange-500/30 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20',
                    2: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20',
                    3: 'border-green-500/30 bg-green-500/10 text-green-400 hover:bg-green-500/20',
                  }[c])}>
                  {CONFIDENCE_LABELS[c]}
                </button>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground text-sm">اضغط على البطاقة لرؤية الجواب</p>
          )}
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-4 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-foreground">البطاقات التعليمية</h1>
            <p className="text-muted-foreground text-sm mt-1">ادرس بطريقة التكرار المتباعد</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={() => setMode('generate')}><Sparkles className="w-4 h-4 ml-1" /> توليد تلقائي</Button>
            <Button variant="outline" size="sm" onClick={() => setMode('create')}><Plus className="w-4 h-4 ml-1" /> بطاقة جديدة</Button>
            {flashcards.length > 0 && (
              <Button size="sm" onClick={startStudy}><RotateCcw className="w-4 h-4 ml-1" /> ابدأ الدراسة</Button>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-6 flex-wrap items-center">
          <div className="flex items-center gap-2 flex-wrap">
            {SUBJECTS.map(s => (
              <button key={s} onClick={() => setSubject(s)}
                className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all', subject === s ? 'bg-primary/10 border-primary/30 text-primary' : 'border-border text-muted-foreground hover:border-border/80')}>
                {SUBJECT_LABELS[s]}
              </button>
            ))}
          </div>
          <button onClick={() => setDueOnly(d => !d)}
            className={cn('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all flex items-center gap-1', dueOnly ? 'bg-orange-500/10 border-orange-500/30 text-orange-400' : 'border-border text-muted-foreground')}>
            <Filter className="w-3 h-3" /> المستحقة فقط
          </button>
        </div>

        {/* Create Form */}
        {mode === 'create' && (
          <Card className="mb-6 border-primary/20">
            <CardHeader><CardTitle className="text-base">بطاقة جديدة</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <textarea className="input-field w-full h-20 resize-none text-sm" placeholder="السؤال / المصطلح" value={newCard.front} onChange={e => setNewCard(f => ({ ...f, front: e.target.value }))} />
              <textarea className="input-field w-full h-20 resize-none text-sm" placeholder="الجواب / التعريف" value={newCard.back} onChange={e => setNewCard(f => ({ ...f, back: e.target.value }))} />
              <select className="input-field w-full text-sm" value={newCard.subject} onChange={e => setNewCard(f => ({ ...f, subject: e.target.value }))}>
                {SUBJECTS.filter(s => s !== 'all').map(s => <option key={s} value={s}>{SUBJECT_LABELS[s]}</option>)}
              </select>
              <div className="flex gap-2">
                <Button onClick={handleCreate} size="sm">حفظ</Button>
                <Button variant="ghost" size="sm" onClick={() => setMode('list')}>إلغاء</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate Form */}
        {mode === 'generate' && (
          <Card className="mb-6 border-purple-500/20">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-purple-400" /> توليد بطاقات بالذكاء الاصطناعي</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <textarea className="input-field w-full h-32 resize-none text-sm" placeholder="الصق النص الذي تريد إنشاء بطاقات منه..." value={genForm.text} onChange={e => setGenForm(f => ({ ...f, text: e.target.value }))} />
              <div className="grid grid-cols-3 gap-3">
                <select className="input-field text-sm" value={genForm.subject} onChange={e => setGenForm(f => ({ ...f, subject: e.target.value }))}>
                  {SUBJECTS.filter(s => s !== 'all').map(s => <option key={s} value={s}>{SUBJECT_LABELS[s]}</option>)}
                </select>
                <select className="input-field text-sm" value={genForm.language} onChange={e => setGenForm(f => ({ ...f, language: e.target.value }))}>
                  <option value="arabic">عربي</option>
                  <option value="lebanese">عامية</option>
                  <option value="english">English</option>
                </select>
                <input type="number" min={3} max={30} className="input-field text-sm" value={genForm.count} onChange={e => setGenForm(f => ({ ...f, count: Number(e.target.value) }))} placeholder="العدد" />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleGenerate} isLoading={generating} size="sm"><Sparkles className="w-4 h-4 ml-1" /> توليد</Button>
                <Button variant="ghost" size="sm" onClick={() => setMode('list')}>إلغاء</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="glass-card h-32 animate-pulse" />)}
          </div>
        ) : flashcards.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-secondary mx-auto mb-4 flex items-center justify-center">
              <BookOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">لا توجد بطاقات. أنشئ بطاقة جديدة أو ولّد من نص.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {flashcards.map(card => (
              <motion.div key={card._id} layout initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className="glass-card p-5 group hover:border-primary/30 transition-all cursor-pointer"
                onClick={() => { const idx = flashcards.indexOf(card); setStudyIndex(idx); setFlipped(false); setMode('study'); }}>
                <div className="flex items-start justify-between mb-3">
                  <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full bg-secondary', CONFIDENCE_COLORS[card.confidence])}>
                    {CONFIDENCE_LABELS[card.confidence]}
                  </span>
                  <button onClick={e => { e.stopPropagation(); handleDelete(card._id); }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-destructive text-muted-foreground transition-all">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm font-medium text-foreground line-clamp-2 mb-2">{card.front}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{card.back}</p>
                {card.nextReview && new Date(card.nextReview) <= new Date() && (
                  <div className="mt-3 text-xs text-orange-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                    مستحقة للمراجعة
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
