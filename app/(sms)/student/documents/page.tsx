'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Search, Lock } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { SchoolDocument } from '@/types';

const CATEGORIES = ['all', 'lecture', 'assignment', 'resource', 'exam'];
const CAT_COLORS: Record<string, string> = { lecture: 'text-blue-400 bg-blue-500/10 border-blue-500/20', assignment: 'text-amber-400 bg-amber-500/10 border-amber-500/20', resource: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', exam: 'text-red-400 bg-red-500/10 border-red-500/20' };

export default function StudentDocumentsPage() {
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getDocuments({ search, category: category === 'all' ? undefined : category })
      .then(r => setDocuments(r.data.data.documents))
      .finally(() => setLoading(false));
  }, [search, category]);

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">My Documents</h1>
          <p className="text-sm text-muted-foreground">Class materials shared by your teachers</p>
        </div>

        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search documents..." className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
          </div>
          <div className="flex gap-1.5 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04]">
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setCategory(c)} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all capitalize ${category === c ? 'bg-white/[0.06] text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>{c}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? <p className="col-span-2 text-center py-12 text-muted-foreground">Loading...</p>
            : documents.length === 0 ? (
              <div className="col-span-2 glass-card p-12 text-center">
                <FileText className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No documents available yet</p>
              </div>
            ) : documents.map((d, i) => (
              <motion.div key={d._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card-hover p-5">
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
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${CAT_COLORS[d.category] || ''}`}>{d.category}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(d.createdAt).toLocaleDateString()}</p>
                    {d.isProtected && (
                      <p className="text-xs text-amber-400/70 mt-1 flex items-center gap-1"><Lock className="w-3 h-3" /> View only — download disabled</p>
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
