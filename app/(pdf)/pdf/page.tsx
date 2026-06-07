'use client';
import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Trash2, Eye, Zap, CheckCircle,
  AlertCircle, Clock, FileSearch, Languages, Plus
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { pdfAPI } from '@/services/api';
import type { Document } from '@/types';
import { formatDate, formatFileSize, truncate } from '@/lib/utils';

const STATUS_CONFIG = {
  pending: { label: 'في الانتظار', color: 'warning', icon: Clock },
  processing: { label: 'يعالج...', color: 'info', icon: Clock },
  completed: { label: 'مكتمل', color: 'success', icon: CheckCircle },
  failed: { label: 'فشل', color: 'danger', icon: AlertCircle }
} as const;

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function PDFPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryLang, setSummaryLang] = useState<'arabic' | 'lebanese' | 'english'>('lebanese');

  const fetchDocs = async () => {
    try {
      const res = await pdfAPI.getDocuments();
      setDocuments(res.data.data.documents);
    } catch {
      toast.error('فشل تحميل المستندات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, []);

  const onDrop = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    const file = files[0];

    if (file.size > 10 * 1024 * 1024) {
      toast.error('الملف كبير جداً. الحد الأقصى 10MB');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ''));

    setUploading(true);
    setUploadProgress(0);

    try {
      const res = await pdfAPI.upload(formData, setUploadProgress);
      setDocuments(prev => [res.data.data.document, ...prev]);
      toast.success('تم رفع الملف بنجاح! يعالج الآن...');

      const docId = res.data.data.document._id;
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        if (attempts > 30) { clearInterval(poll); return; }
        try {
          const r = await pdfAPI.getDocumentById(docId);
          const updated = r.data.data.document;
          if (updated.processingStatus === 'completed' || updated.processingStatus === 'failed') {
            clearInterval(poll);
            setDocuments(prev => prev.map(d => d._id === docId ? updated : d));
            if (updated.processingStatus === 'completed') {
              toast.success('تم استخراج النص بنجاح!');
            }
          }
        } catch {}
      }, 3000);
    } catch {
      toast.error('فشل رفع الملف');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'image/*': ['.jpg', '.jpeg', '.png'] },
    maxFiles: 1,
    disabled: uploading
  });

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذا المستند؟')) return;
    try {
      await pdfAPI.deleteDocument(id);
      setDocuments(prev => prev.filter(d => d._id !== id));
      if (selectedDoc?._id === id) setSelectedDoc(null);
      toast.success('تم حذف المستند');
    } catch {
      toast.error('فشل حذف المستند');
    }
  };

  const handleSummarize = async () => {
    if (!selectedDoc || selectedDoc.processingStatus !== 'completed') return;
    setSummarizing(true);
    try {
      const res = await pdfAPI.generateSummary(selectedDoc._id, summaryLang);
      const summary = res.data.data.summary;
      setSelectedDoc(prev => prev ? { ...prev, summary } : null);
      setDocuments(prev => prev.map(d => d._id === selectedDoc._id ? { ...d, summary } : d));
      toast.success('تم إنشاء الملخص!');
    } catch {
      toast.error('فشل إنشاء الملخص');
    } finally {
      setSummarizing(false);
    }
  };

  const handleViewDoc = async (id: string) => {
    try {
      const res = await pdfAPI.getDocumentById(id);
      setSelectedDoc(res.data.data.document);
    } catch {
      toast.error('فشل تحميل المستند');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">مستنداتي</h1>
          <p className="text-muted-foreground mt-1 text-sm">ارفع كتبك ومذكراتك للمعالجة بالذكاء الاصطناعي</p>
        </motion.div>

        {/* Upload Zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 300, damping: 24 }}
        >
          <div
            {...getRootProps()}
            className={`glass-card border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-primary/50 bg-primary/[0.04]'
                : 'border-white/[0.06] hover:border-primary/30 hover:bg-white/[0.02]'
            } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDragActive ? 'bg-primary/15 scale-110' : 'bg-white/[0.04]'
              }`}>
                {uploading ? (
                  <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5"
                        strokeDasharray={`${uploadProgress} 100`} strokeLinecap="round" className="transition-all" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary tabular-nums">
                      {uploadProgress}%
                    </span>
                  </div>
                ) : (
                  <Upload className={`w-7 h-7 transition-colors ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                )}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {uploading ? 'جاري الرفع...' : isDragActive ? 'أفلت الملف هنا' : 'اسحب وأفلت ملفك هنا'}
                </p>
                <p className="text-muted-foreground text-sm mt-1">
                  PDF أو صور (JPG, PNG) - الحد الأقصى 10MB
                </p>
              </div>
              {!uploading && (
                <Button variant="outline" size="sm" className="border-white/[0.08] hover:bg-white/[0.04]">
                  <Plus className="w-4 h-4" />
                  اختر ملفاً
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Documents List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">المستندات ({documents.length})</h2>

            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)
            ) : documents.length === 0 ? (
              <div className="glass-card">
                <div className="py-14 text-center">
                  <div className="w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">لا توجد مستندات بعد</p>
                  <p className="text-muted-foreground text-sm mt-1">ارفع أول ملف لك</p>
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {documents.map((doc) => {
                  const status = STATUS_CONFIG[doc.processingStatus];
                  const StatusIcon = status.icon;
                  return (
                    <motion.div
                      key={doc._id}
                      variants={item}
                      initial="hidden"
                      animate="show"
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <div
                        onClick={() => handleViewDoc(doc._id)}
                        className={`glass-card cursor-pointer hover:border-white/[0.08] transition-all duration-200 ${
                          selectedDoc?._id === doc._id ? 'border-primary/20 bg-primary/[0.03]' : ''
                        }`}
                      >
                        <div className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-violet-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground text-sm truncate">{doc.title}</p>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                                <span className="text-xs text-muted-foreground/40">·</span>
                                <Badge variant={status.color as 'warning' | 'info' | 'success' | 'danger'} className="text-[11px]">
                                  <StatusIcon className="w-3 h-3 ml-1" />
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-[11px] text-muted-foreground mt-1">{formatDate(doc.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleViewDoc(doc._id); }}
                                className="p-2 rounded-lg hover:bg-white/[0.04] text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(doc._id); }}
                                className="p-2 rounded-lg hover:bg-red-500/8 text-muted-foreground hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Document Viewer */}
          <div>
            {selectedDoc ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <div className="glass-card sticky top-6 overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
                  <div className="p-6 space-y-5">
                    <div>
                      <h3 className="font-bold text-lg text-foreground">{selectedDoc.title}</h3>
                      <p className="text-muted-foreground text-sm mt-0.5">{selectedDoc.pageCount} صفحة · {formatFileSize(selectedDoc.fileSize)}</p>
                    </div>

                    {selectedDoc.processingStatus === 'completed' && (
                      <div className="space-y-4">
                        <div className="h-px bg-gradient-to-l from-transparent via-border to-transparent" />
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                              <Zap className="w-4 h-4 text-amber-400" />
                              ملخص ذكي
                            </h4>
                            <div className="flex items-center gap-2">
                              <select
                                value={summaryLang}
                                onChange={e => setSummaryLang(e.target.value as 'arabic' | 'lebanese' | 'english')}
                                className="text-xs bg-white/[0.04] border border-white/[0.06] rounded-lg px-2 py-1.5 text-foreground focus:outline-none transition-all"
                              >
                                <option value="lebanese">عامية لبنانية</option>
                                <option value="arabic">عربي فصيح</option>
                                <option value="english">English</option>
                              </select>
                              <Button size="sm" onClick={handleSummarize} isLoading={summarizing} className="shadow-sm">
                                <Languages className="w-3.5 h-3.5" />
                                لخّص
                              </Button>
                            </div>
                          </div>

                          {selectedDoc.summary ? (
                            <div className="bg-white/[0.03] border border-white/[0.04] rounded-xl p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                              {selectedDoc.summary}
                            </div>
                          ) : (
                            <p className="text-muted-foreground text-sm">اضغط على &quot;لخّص&quot; لإنشاء ملخص بالذكاء الاصطناعي</p>
                          )}
                        </div>

                        {selectedDoc.extractedText && (
                          <>
                            <div className="h-px bg-gradient-to-l from-transparent via-border to-transparent" />
                            <div>
                              <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2 text-sm">
                                <FileSearch className="w-4 h-4 text-blue-400" />
                                النص المستخرج
                              </h4>
                              <div className="bg-white/[0.02] border border-white/[0.04] rounded-xl p-3 text-xs text-muted-foreground leading-relaxed max-h-40 overflow-y-auto">
                                {truncate(selectedDoc.extractedText, 500)}
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}

                    {selectedDoc.processingStatus === 'processing' && (
                      <div className="flex flex-col items-center py-10 gap-3">
                        <div className="w-12 h-12 rounded-full border-[3px] border-primary/20 border-t-primary animate-spin" />
                        <p className="text-muted-foreground text-sm">يتم استخراج النص...</p>
                      </div>
                    )}

                    {selectedDoc.processingStatus === 'failed' && (
                      <div className="flex flex-col items-center py-10 gap-3 text-center">
                        <div className="w-12 h-12 rounded-xl bg-red-500/8 flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-red-400" />
                        </div>
                        <p className="text-red-400 text-sm">فشل استخراج النص. يرجى المحاولة مرة أخرى.</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ) : (
              <div className="glass-card">
                <div className="py-20 text-center">
                  <div className="w-14 h-14 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-3">
                    <FileText className="w-7 h-7 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground">اختر مستنداً لعرض تفاصيله</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
