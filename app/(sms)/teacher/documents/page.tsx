'use client';
import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, Trash2, FileText, Lock } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { teacherAPI } from '@/services/api';
import { SchoolDocument, Classroom } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const CATEGORIES = ['lecture', 'assignment', 'resource', 'exam'] as const;
const CAT_COLORS: Record<string, string> = { lecture: 'text-blue-400 bg-blue-500/10 border-blue-500/20', assignment: 'text-amber-400 bg-amber-500/10 border-amber-500/20', resource: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20', exam: 'text-red-400 bg-red-500/10 border-red-500/20' };

export default function TeacherDocumentsPage() {
  const [documents, setDocuments] = useState<SchoolDocument[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', classroomId: '', visibility: 'all', category: 'lecture' });
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = () => Promise.all([teacherAPI.getDocuments(), teacherAPI.getClasses()])
    .then(([dr, cr]) => { setDocuments(dr.data.data.documents); setClasses(cr.data.data.classrooms); })
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleUpload = async () => {
    if (!file || !form.title) return toast.error('Title and file required');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', form.title);
      fd.append('classroomId', form.classroomId);
      fd.append('visibility', form.visibility);
      fd.append('category', form.category);
      await teacherAPI.uploadDocument(fd);
      toast.success('Document uploaded');
      setShowForm(false);
      setFile(null);
      setForm({ title: '', classroomId: '', visibility: 'all', category: 'lecture' });
      load();
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    await teacherAPI.deleteDocument(id);
    toast.success('Document deleted');
    load();
  };

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Class Documents</h1>
            <p className="text-sm text-muted-foreground">{documents.length} documents uploaded</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-gradient gap-2"><Upload className="w-4 h-4" /> Upload</Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-foreground">Upload Document</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Document Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Classroom</label>
                <select value={form.classroomId} onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                  <option value="">All my classes</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">File</label>
                <div onClick={() => fileRef.current?.click()} className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-dashed border-white/[0.10] text-sm text-muted-foreground hover:border-primary/40 cursor-pointer transition-colors flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  {file ? file.name : 'Click to select file...'}
                </div>
                <input ref={fileRef} type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png" onChange={e => setFile(e.target.files?.[0] || null)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleUpload} isLoading={uploading} className="btn-gradient gap-2"><Upload className="w-4 h-4" /> Upload</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? <p className="text-muted-foreground col-span-2 text-center py-8">Loading...</p>
            : documents.length === 0 ? <p className="text-muted-foreground col-span-2 text-center py-8">No documents uploaded yet</p>
            : documents.map((d, i) => (
              <motion.div key={d._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card-hover p-5">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground text-sm truncate">{d.title}</h3>
                      {d.isProtected && <Lock className="w-3 h-3 text-muted-foreground shrink-0" />}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${CAT_COLORS[d.category]}`}>{d.category}</span>
                      <span className="text-xs text-muted-foreground">{d.originalName}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{new Date(d.createdAt).toLocaleDateString()}</p>
                  </div>
                  <button onClick={() => handleDelete(d._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors shrink-0">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </SMSLayout>
  );
}
