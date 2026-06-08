'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Lock } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { SchoolDocument } from '@/types';
import { useT } from '@/lib/i18n';

const CATEGORIES = ['all', 'lecture', 'assignment', 'resource', 'exam'];
const CAT_BADGE: Record<string, string> = {
  lecture:    'badge-info',
  assignment: 'badge-warning',
  resource:   'badge-success',
  exam:       'badge-error',
};

export default function StudentDocumentsPage() {
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [search,    setSearch]    = useState('');
  const [category,  setCategory]  = useState('all');
  const [loading,   setLoading]   = useState(true);
  const t = useT();

  useEffect(() => {
    setLoading(true);
    studentAPI.getDocuments({ search, category: category === 'all' ? undefined : category })
      .then(r => setDocuments(r.data.data.documents))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-5 max-w-4xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
          <h1 className="section-header">{t('documents')}</h1>
          <p className="section-subheader">{t('classDocuments')}</p>
        </motion.div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('search')} className="input-field pl-10" />
          </div>
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04] flex-wrap">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${category === c ? 'bg-white/[0.08] text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-start gap-3">
                <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
                  <div className="skeleton h-3 w-1/4 rounded" />
                </div>
              </div>
            </div>
          )) : documents.length === 0 ? (
            <div className="col-span-2 glass-card p-16 text-center">
              <div className="glow-line-top" />
              <div className="icon-box-lg bg-sky-500/5 border border-sky-500/10 mx-auto mb-4">
                <FileText className="w-6 h-6 text-sky-400/40" />
              </div>
              <p className="text-sm text-muted-foreground">{t('noDocuments')}</p>
            </div>
          ) : documents.map((d, i) => (
            <motion.div key={d._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}
              className="glass-card-hover p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-semibold text-foreground text-sm truncate">{d.title}</h3>
                    {d.isProtected && <Lock className="w-3 h-3 text-muted-foreground/60 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge text-[10px] ${CAT_BADGE[d.category] || 'badge-default'}`}>{d.category}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(d.createdAt).toLocaleDateString()}</p>
                  {d.isProtected && (
                    <p className="text-xs text-amber-400/70 mt-1 flex items-center gap-1">
                      <Lock className="w-3 h-3" /> View only — download disabled
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SMSLayout>
  );
}
