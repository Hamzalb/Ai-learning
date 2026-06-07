'use client';
import { useEffect, useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Trash2, Eye, Zap, CheckCircle,
  AlertCircle, Clock, FileSearch, Languages, Plus, Link2, Sparkles
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { pdfAPI, aiAPI } from '@/services/api';
import type { Document } from '@/types';
import { formatDate, formatFileSize, truncate } from '@/lib/utils';

const STATUS_CONFIG = {
  pending: { label: 'في الانتظار', color: 'warning', icon: Clock },
  processing: { label: 'يعالج...', color: 'info', icon: Clock },
  completed: { label: 'مكتمل', color: 'success', icon: CheckCircle },
  failed: { label: 'فشل', color: 'danger', icon: AlertCircle }
} as const;

export default function PDFPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [summarizing, setSummarizing] = useState(false);
  const [summaryLang, setSummaryLang] = useState<'arabic' | 'lebanese' | 'english'>('lebanese');
  const [tab, setTab] = useState<'documents' | 'url'>('documents');
  const [urlInput, setUrlInput] = useState('');
  const [urlLang, setUrlLang] = useState<'arabic' | 'lebanese' | 'english'>('arabic');
  const [urlSummary, setUrlSummary] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);

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

      // Poll for completion
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

  const handleUrlSummarize = async () => {
    if (!urlInput.trim()) return toast.error('أدخل رابطاً صحيحاً');
    setUrlLoading(true);
    setUrlSummary('');
    try {
      const res = await aiAPI.summarizeUrl({ url: urlInput.trim(), language: urlLang });
      setUrlSummary(res.data.data.summary);
    } catch {
      toast.error('فشل تلخيص الرابط');
    } finally {
      setUrlLoading(false);
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
      <div className="p-4 md:p-8 space-y-6" dir="rtl">
        <div>
          <h1 className="text-2xl font-bold text-foreground">مستنداتي</h1>
          <p className="text-muted-foreground mt-1 text-sm">ارفع ملفاتك أو لخّص أي رابط بالذكاء الاصطناعي</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-secondary rounded-xl w-fit">
          <button
            onClick={() => setTab('documents')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${tab === 'documents' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <FileText className="w-4 h-4" /> المستندات
          </button>
          <button
            onClick={() => setTab('url')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-1.5 ${tab === 'url' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            <Link2 className="w-4 h-4" /> تلخيص رابط
          </button>
        </div>

        {/* URL Summarizer */}
        {tab === 'url' && (
          <div className="space-y-4 max-w-2xl">
            <p className="text-sm text-muted-foreground">الصق رابط أي موقع أو مقال أو فيديو يوتيوب وسنلخصه لك</p>
            <div className="flex gap-3">
              <input
                type="url"
                value={urlInput}
                onChange={e => setUrlInput(e.target.value)}
                placeholder="https://..."
                className="flex-1 input-field text-sm"
                dir="ltr"
              />
              <select
                value={urlLang}
                onChange={e => setUrlLang(e.target.value as 'arabic' | 'lebanese' | 'english')}
                className="input-field text-sm w-36"
              >
                <option value="arabic">عربي فصيح</option>
                <option value="lebanese">عامية لبنانية</option>
                <option value="english">English</option>
              </select>
            </div>
            <Button onClick={handleUrlSummarize} isLoading={urlLoading}>
              <Sparkles className="w-4 h-4 ml-1" /> لخّص الرابط
            </Button>
            {urlSummary && (
              <div className="glass-card p-5 space-y-2">
                <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-yellow-400" /> الملخص
                </h3>
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{urlSummary}</p>
              </div>
            )}
          </div>
        )}

        {tab === 'documents' && <>
        {/* Upload Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
            isDragActive
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50 hover:bg-secondary/30'
          } ${uploading ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center gap-4">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${
              isDragActive ? 'bg-primary/20' : 'bg-secondary'
            }`}>
              {uploading ? (
                <div className="relative w-10 h-10">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--border))" strokeWidth="3" />
                    <circle cx="18" cy="18" r="16" fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                      strokeDasharray={`${uploadProgress} 100`} strokeLinecap="round" />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
                    {uploadProgress}%
                  </span>
                </div>
              ) : (
                <Upload className={`w-8 h-8 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
              )}
            </div>
            <div>
              <p className="text-lg font-semibold text-foreground">
                {uploading ? 'جاري الرفع...' : isDragActive ? 'أفلت الملف هنا' : 'اسحب وأفلت ملفك هنا'}
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                PDF أو صور (JPG, PNG) • الحد الأقصى 10MB
              </p>
            </div>
            {!uploading && (
              <Button variant="outline" size="sm">
                <Plus className="w-4 h-4" />
                اختر ملفاً
              </Button>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Documents List */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-foreground">المستندات ({documents.length})</h2>

            {loading ? (
              [...Array(3)].map((_, i) => <Skeleton key={i} className="h-24" />)
            ) : documents.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">لا توجد مستندات بعد</p>
                  <p className="text-muted-foreground text-sm mt-1">ارفع أول ملف لك</p>
                </CardContent>
              </Card>
            ) : (
              <AnimatePresence>
                {documents.map((doc) => {
                  const status = STATUS_CONFIG[doc.processingStatus];
                  const StatusIcon = status.icon;
                  return (
                    <motion.div
                      key={doc._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                    >
                      <Card className={`cursor-pointer hover:border-primary/30 transition-all ${selectedDoc?._id === doc._id ? 'border-primary/50 bg-primary/5' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-foreground truncate">{doc.title}</p>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <span className="text-xs text-muted-foreground">{formatFileSize(doc.fileSize)}</span>
                                <span className="text-xs text-muted-foreground">•</span>
                                <Badge variant={status.color as 'warning' | 'info' | 'success' | 'danger'} className="text-xs">
                                  <StatusIcon className="w-3 h-3 ml-1" />
                                  {status.label}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5">{formatDate(doc.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleViewDoc(doc._id)}
                                className="p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(doc._id)}
                                className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            )}
          </div>

          {/* Document Viewer */}
          <div>
            {selectedDoc ? (
              <Card className="sticky top-6">
                <CardContent className="p-6 space-y-4">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{selectedDoc.title}</h3>
                    <p className="text-muted-foreground text-sm">{selectedDoc.pageCount} صفحة • {formatFileSize(selectedDoc.fileSize)}</p>
                  </div>

                  {selectedDoc.processingStatus === 'completed' && (
                    <div className="space-y-3">
                      {/* Summary Section */}
                      <div className="border-t border-border pt-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-foreground flex items-center gap-2">
                            <Zap className="w-4 h-4 text-yellow-400" />
                            ملخص ذكي
                          </h4>
                          <div className="flex items-center gap-2">
                            <select
                              value={summaryLang}
                              onChange={e => setSummaryLang(e.target.value as 'arabic' | 'lebanese' | 'english')}
                              className="text-xs bg-secondary border border-border rounded-lg px-2 py-1 text-foreground focus:outline-none"
                            >
                              <option value="lebanese">عامية لبنانية</option>
                              <option value="arabic">عربي فصيح</option>
                              <option value="english">English</option>
                            </select>
                            <Button size="sm" onClick={handleSummarize} isLoading={summarizing}>
                              <Languages className="w-3.5 h-3.5" />
                              لخّص
                            </Button>
                          </div>
                        </div>

                        {selectedDoc.summary ? (
                          <div className="bg-secondary/50 rounded-xl p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap max-h-64 overflow-y-auto">
                            {selectedDoc.summary}
                          </div>
                        ) : (
                          <p className="text-muted-foreground text-sm">اضغط على "لخّص" لإنشاء ملخص بالذكاء الاصطناعي</p>
                        )}
                      </div>

                      {/* Extracted Text Preview */}
                      {selectedDoc.extractedText && (
                        <div className="border-t border-border pt-4">
                          <h4 className="font-semibold text-foreground flex items-center gap-2 mb-2">
                            <FileSearch className="w-4 h-4 text-blue-400" />
                            النص المستخرج
                          </h4>
                          <div className="bg-secondary/30 rounded-xl p-3 text-xs text-muted-foreground leading-relaxed max-h-40 overflow-y-auto">
                            {truncate(selectedDoc.extractedText, 500)}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedDoc.processingStatus === 'processing' && (
                    <div className="flex flex-col items-center py-8 gap-3">
                      <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                      <p className="text-muted-foreground text-sm">يتم استخراج النص...</p>
                    </div>
                  )}

                  {selectedDoc.processingStatus === 'failed' && (
                    <div className="flex flex-col items-center py-8 gap-3 text-center">
                      <AlertCircle className="w-12 h-12 text-destructive" />
                      <p className="text-destructive text-sm">فشل استخراج النص. يرجى المحاولة مرة أخرى.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-16 text-center">
                  <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">اختر مستنداً لعرض تفاصيله</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
        </>}
      </div>
    </DashboardLayout>
  );
}
