'use client';
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, FileText, Lock, X, Download } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { teacherAPI } from '@/services/api';
import { SchoolDocument, Classroom } from '@/types';
import toast from 'react-hot-toast';
import { useT } from '@/lib/i18n';

const CATEGORIES = ['lecture', 'assignment', 'resource', 'exam'] as const;
const CAT_BADGE: Record<string, string> = {
  lecture:    'badge-info',
  assignment: 'badge-warning',
  resource:   'badge-success',
  exam:       'badge-error',
};

const EMPTY_FORM = { title: '', classroomId: '', visibility: 'all', category: 'lecture' };

export default function TeacherDocumentsPage() {
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [classes,   setClasses]   = useState<Classroom[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [file,      setFile]      = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const t = useT();

  const load = () =>
    Promise.all([teacherAPI.getDocuments(), teacherAPI.getClasses()])
      .then(([dr, cr]) => { setDocuments(dr.data.data.documents); setClasses(cr.data.data.classrooms); })
      .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleUpload = async () => {
    if (!file || !form.title) { toast.error(t('documentTitle') + ' & file required'); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', form.title);
      fd.append('classroomId', form.classroomId);
      fd.append('visibility', form.visibility);
      fd.append('category', form.category);
      await teacherAPI.uploadDocument(fd);
      toast.success(t('uploadDocument'));
      setShowForm(false); setFile(null); setForm(EMPTY_FORM); load();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await teacherAPI.deleteDocument(id);
    toast.success('Document deleted'); load();
  };

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-5 max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="section-header">{t('classDocuments')}</h1>
            <p className="section-subheader">{documents.length} {t('documentsUploaded')}</p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn-gradient gap-2">
            <Upload className="w-4 h-4" /> {t('upload')}
          </button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card p-6 space-y-4">
              <div className="glow-line-top" />
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-foreground">{t('uploadDocument')}</h3>
                <button onClick={() => { setShowForm(false); setFile(null); setForm(EMPTY_FORM); }} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('documentTitle')}</label>
                  <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Lecture Notes — Week 3" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('classroom')}</label>
                  <select value={form.classroomId} onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))} className="input-field appearance-none">
                    <option value="">{t('allMyClasses')}</option>
                    {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('category')}</label>
                  <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="input-field appearance-none">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{t('upload')}</label>
                  <div onClick={() => fileRef.current?.click()}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.10] text-sm text-muted-foreground hover:border-primary/40 cursor-pointer transition-colors flex items-center gap-2 min-h-[44px]">
                    <Upload className="w-4 h-4 shrink-0" />
                    <span className="truncate">{file ? file.name : t('clickToSelectFile')}</span>
                  </div>
                  <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={e => setFile(e.target.files?.[0] || null)} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleUpload} disabled={uploading} className="btn-gradient gap-2 disabled:opacity-60">
                  {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? t('uploading') : t('uploadDocument')}
                </button>
                <button onClick={() => { setShowForm(false); setFile(null); setForm(EMPTY_FORM); }} className="btn-ghost">{t('cancel')}</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5">
              <div className="flex items-start gap-3">
                <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="skeleton h-4 w-2/3 rounded" />
                  <div className="skeleton h-3 w-1/3 rounded" />
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
              <button onClick={() => setShowForm(true)} className="btn-gradient gap-2 mt-4">
                <Upload className="w-4 h-4" /> {t('uploadFirstDoc')}
              </button>
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-semibold text-foreground text-sm truncate">{d.title}</h3>
                    {d.isProtected && <Lock className="w-3 h-3 text-muted-foreground/60 shrink-0" />}
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className={`badge text-[10px] ${CAT_BADGE[d.category] || 'badge-default'}`}>{d.category}</span>
                    <span className="text-xs text-muted-foreground truncate">{d.originalName}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(d.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <a
                    href={d.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={d.originalName}
                    className="btn-icon hover:bg-sky-500/10 hover:text-sky-400 hover:border-sky-500/20"
                    title={t('download')}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                  <button onClick={() => handleDelete(d._id)}
                    className="btn-icon hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20"
                    title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </SMSLayout>
  );
}
