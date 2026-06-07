'use client';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Plus, Trash2, MessageSquare, Bot, User, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { useChatStore } from '@/store/chatStore';
import { useAuthStore } from '@/store/authStore';
import { cn, formatDate } from '@/lib/utils';
import type { Language } from '@/types';

const SUBJECTS = [
  { value: 'general', label: 'عام' },
  { value: 'math', label: 'رياضيات' },
  { value: 'physics', label: 'فيزياء' },
  { value: 'chemistry', label: 'كيمياء' },
  { value: 'biology', label: 'أحياء' },
  { value: 'history', label: 'تاريخ' },
  { value: 'arabic', label: 'عربي' },
  { value: 'english', label: 'إنجليزي' },
  { value: 'french', label: 'فرنسي' }
];

const LANGUAGES = [
  { value: 'arabic', label: 'عربي فصيح' },
  { value: 'lebanese', label: 'عامية لبنانية' },
  { value: 'english', label: 'English' }
];

const SUGGESTED_PROMPTS = [
  'اشرحلي الميتوكندريا بطريقة بسيطة',
  'شو هي معادلة الفيزياء للحركة المنتظمة؟',
  'ساعدني افهم الثورة الفرنسية',
  'كيف بحل هالمعادلة الرياضية؟',
  'لخصلي درس التركيب الضوئي'
];

function ChatContent() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get('id');
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState<Language>('arabic');
  const [subject, setSubject] = useState('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { chats, activeChat, isLoading, isSending, fetchChats, fetchChatById, sendMessage, deleteChat, setActiveChat } = useChatStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchChats();
    if (chatId) fetchChatById(chatId);
  }, [chatId, fetchChats, fetchChatById]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeChat?.messages]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const msg = input.trim();
    setInput('');
    try {
      await sendMessage(msg, language, subject);
    } catch {
      toast.error('حدث خطأ. تأكد من إعدادات API.');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('هل تريد حذف هذه المحادثة؟')) return;
    await deleteChat(id);
    toast.success('تم حذف المحادثة');
  };

  return (
    <DashboardLayout>
      <div className="h-screen flex overflow-hidden" dir="rtl">
        {/* Chat List Sidebar */}
        <div className="w-72 border-l border-white/[0.04] bg-card/30 backdrop-blur-sm flex flex-col">
          <div className="p-4">
            <Button
              onClick={() => setActiveChat(null)}
              className="w-full gap-2 shadow-lg shadow-primary/15"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              محادثة جديدة
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto px-3 pb-3 space-y-0.5">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-white/[0.03] animate-pulse" />
              ))
            ) : chats.length === 0 ? (
              <div className="text-center py-10">
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] flex items-center justify-center mx-auto mb-2">
                  <MessageSquare className="w-5 h-5 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground text-xs">لا توجد محادثات</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => fetchChatById(chat._id)}
                  className={cn(
                    'group p-3 rounded-xl cursor-pointer transition-all duration-200',
                    activeChat?._id === chat._id
                      ? 'bg-primary/8 border border-primary/15'
                      : 'hover:bg-white/[0.03] border border-transparent'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate flex-1">
                      {chat.title || 'محادثة جديدة'}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(chat._id); }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-red-400 transition-all p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">
                    {chat.messageCount || 0} رسالة · {formatDate(chat.updatedAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col relative">
          <div className="absolute inset-0 mesh-gradient opacity-30 pointer-events-none" />

          {/* Header */}
          <div className="relative p-4 border-b border-white/[0.04] bg-card/20 backdrop-blur-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground text-sm">المساعد الذكي</h2>
                <p className="text-[11px] text-muted-foreground">مدعوم بـ GPT-4</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="text-xs bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              >
                {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                className="text-xs bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all"
              >
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 relative">
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-8">
                <div className="text-center">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                    className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center mx-auto mb-5 shadow-xl shadow-violet-500/25"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-foreground mb-2">كيف يمكنني مساعدتك؟</h3>
                  <p className="text-muted-foreground text-sm">اسأل أي سؤال عن دروسك</p>
                </div>
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl"
                >
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <motion.button
                      key={i}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={() => setInput(prompt)}
                      className="text-right p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/[0.05] hover:border-white/[0.08] text-sm text-muted-foreground hover:text-foreground transition-all duration-200"
                    >
                      {prompt}
                    </motion.button>
                  ))}
                </motion.div>
              </div>
            ) : (
              <AnimatePresence>
                {activeChat.messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                    className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1',
                      msg.role === 'user'
                        ? 'bg-primary/15'
                        : 'bg-gradient-to-br from-blue-500 to-violet-500 shadow-md shadow-violet-500/15'
                    )}>
                      {msg.role === 'user'
                        ? <User className="w-4 h-4 text-primary" />
                        : <Bot className="w-4 h-4 text-white" />
                      }
                    </div>
                    <div className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-3',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-md shadow-lg shadow-primary/15'
                        : 'bg-white/[0.04] border border-white/[0.06] text-foreground rounded-tl-md'
                    )}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none text-foreground [&_strong]:text-foreground [&_code]:text-primary [&_code]:bg-primary/10 [&_code]:px-1 [&_code]:rounded">
                          <ReactMarkdown>{msg.content}</ReactMarkdown>
                        </div>
                      ) : (
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}

            {isSending && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center flex-shrink-0 shadow-md shadow-violet-500/15">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl rounded-tl-md px-5 py-4">
                  <div className="flex gap-1.5">
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                    <div className="typing-dot" />
                  </div>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="relative p-4 border-t border-white/[0.04] bg-card/20 backdrop-blur-sm">
            <div className="flex gap-3 items-end max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب سؤالك هنا..."
                  rows={1}
                  className="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30 transition-all resize-none text-sm"
                  style={{ maxHeight: '120px' }}
                />
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}
                  size="icon"
                  className="h-11 w-11 flex-shrink-0 shadow-lg shadow-primary/20 rounded-xl"
                  isLoading={isSending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </motion.div>
            </div>
            <p className="text-[11px] text-muted-foreground/60 mt-2 text-center">
              الذكاء الاصطناعي قد يخطئ · تحقق من المعلومات المهمة
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default function ChatPage() {
  return (
    <Suspense>
      <ChatContent />
    </Suspense>
  );
}
