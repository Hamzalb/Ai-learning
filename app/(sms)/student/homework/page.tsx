'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Send } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { Homework } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const STATUS_BADGE: Record<string, string> = {
  pending:   'badge-warning',
  submitted: 'badge-info',
  graded:    'badge-success',
};

export default function StudentHomeworkPage() {
  const [homework,   setHomework]   = useState<Homework[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [texts,      setTexts]      = useState<Record<string, string>>({});

  const load = () => studentAPI.getHomework().then(r => setHomework(r.data.data.homework)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleSubmit = async (id: string) => {
    setSubmitting(id);
    try {
      await studentAPI.submitHomework(id, { text: texts[id] || '' });
      toast.success('Homework submitted');
      load();
    } catch { toast.error('Submission failed'); }
    finally { setSubmitting(null); }
  };

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-5 max-w-4xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
          <h1 className="section-header">Homework</h1>
          <p className="section-subheader">{homework.filter(h => h.status === 'pending').length} pending assignments</p>
        </motion.div>

        <div className="space-y-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="flex items-start justify-between">
                <div className="skeleton h-5 w-1/2 rounded" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
              <div className="skeleton h-3 w-3/4 rounded" />
              <div className="skeleton h-3 w-1/3 rounded" />
            </div>
          )) : homework.length === 0 ? (
            <div className="glass-card p-16 text-center">
              <div className="glow-line-top" />
              <div className="icon-box-lg bg-amber-500/5 border border-amber-500/10 mx-auto mb-4">
                <ClipboardList className="w-6 h-6 text-amber-400/40" />
              </div>
              <p className="text-sm text-muted-foreground">No homework assigned yet</p>
            </div>
          ) : homework.map((h, i) => (
            <motion.div key={h._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}
              className="glass-card-hover p-5">
              <div className="glow-line-top" style={{ background: 'linear-gradient(90deg, transparent, hsl(43 96% 56% / 0.18), transparent)' }} />
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-foreground">{h.title}</h3>
                  {h.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{h.description}</p>}
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Due: {h.dueDate ? new Date(h.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                  </p>
                </div>
                <span className={cn('badge text-[10px] shrink-0 ml-3 capitalize', STATUS_BADGE[h.status || 'pending'])}>
                  {h.status || 'pending'}
                </span>
              </div>
              {h.status === 'pending' && (
                <div className="space-y-3 mt-3 pt-3 border-t border-white/[0.04]">
                  <textarea value={texts[h._id] || ''} onChange={e => setTexts(t => ({ ...t, [h._id]: e.target.value }))}
                    rows={3} placeholder="Type your answer here..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none" />
                  <button onClick={() => handleSubmit(h._id)} disabled={submitting === h._id}
                    className="btn-gradient gap-2 h-9 text-xs disabled:opacity-60">
                    {submitting === h._id
                      ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      : <Send className="w-3.5 h-3.5" />}
                    {submitting === h._id ? 'Submitting…' : 'Submit'}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </SMSLayout>
  );
}
