'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Send } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { Homework } from '@/types';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  submitted: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  graded: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
};

export default function StudentHomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [texts, setTexts] = useState<Record<string, string>>({});

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
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Homework</h1>
          <p className="text-sm text-muted-foreground">{homework.filter(h => h.status === 'pending').length} pending assignments</p>
        </div>

        {loading ? <p className="text-muted-foreground text-center py-12">Loading...</p>
          : homework.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No homework assigned yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {homework.map((h, i) => (
                <motion.div key={h._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card-hover p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-foreground">{h.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{h.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">Due: {h.dueDate ? new Date(h.dueDate).toLocaleDateString() : '—'}</p>
                    </div>
                    <span className={cn('px-2.5 py-1 rounded-full text-xs font-medium border', STATUS_STYLES[h.status || 'pending'])}>
                      {h.status || 'pending'}
                    </span>
                  </div>
                  {h.status === 'pending' && (
                    <div className="space-y-3 mt-3 pt-3 border-t border-white/[0.04]">
                      <textarea value={texts[h._id] || ''} onChange={e => setTexts(t => ({ ...t, [h._id]: e.target.value }))} rows={3}
                        placeholder="Type your answer here..." className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none" />
                      <Button onClick={() => handleSubmit(h._id)} isLoading={submitting === h._id} className="btn-gradient gap-2 h-9 text-xs">
                        <Send className="w-3.5 h-3.5" /> Submit
                      </Button>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          )}
      </div>
    </SMSLayout>
  );
}
