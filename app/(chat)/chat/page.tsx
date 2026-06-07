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
        <div className="w-72 border-l border-border bg-card/50 flex flex-col">
          <div className="p-4 border-b border-border">
            <Button
              onClick={() => setActiveChat(null)}
              className="w-full gap-2"
              size="sm"
            >
              <Plus className="w-4 h-4" />
              محادثة جديدة
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            {isLoading ? (
              [...Array(5)].map((_, i) => (
                <div key={i} className="h-14 rounded-xl bg-secondary/50 animate-pulse" />
              ))
            ) : chats.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground text-xs">لا توجد محادثات</p>
              </div>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => fetchChatById(chat._id)}
                  className={cn(
                    'group p-3 rounded-xl cursor-pointer transition-all',
                    activeChat?._id === chat._id
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-secondary/50'
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground truncate flex-1">
                      {chat.title || 'محادثة جديدة'}
                    </p>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleDelete(chat._id); }}
                      className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {chat.messageCount || 0} رسالة • {formatDate(chat.updatedAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border bg-card/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground">المساعد الذكي</h2>
                <p className="text-xs text-muted-foreground">مدعوم بـ GPT-4</p>
              </div>
            </div>

            {/* Language & Subject selectors */}
            <div className="flex items-center gap-2">
              <select
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="text-xs bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {SUBJECTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
              <select
                value={language}
                onChange={e => setLanguage(e.target.value as Language)}
                className="text-xs bg-secondary border border-border rounded-lg px-3 py-1.5 text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {!activeChat || activeChat.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">كيف يمكنني مساعدتك؟</h3>
                  <p className="text-muted-foreground text-sm">اسأل أي سؤال عن دروسك</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-xl">
                  {SUGGESTED_PROMPTS.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => setInput(prompt)}
                      className="text-right p-3 rounded-xl bg-secondary/50 hover:bg-secondary border border-border/50 text-sm text-muted-foreground hover:text-foreground transition-all"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {activeChat.messages.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn('flex gap-3', msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
                  >
                    <div className={cn(
                      'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-1',
                      msg.role === 'user'
                        ? 'bg-primary/20 text-primary'
                        : 'bg-gradient-to-br from-blue-500 to-purple-600'
                    )}>
                      {msg.role === 'user'
                        ? <User className="w-4 h-4" />
                        : <Bot className="w-4 h-4 text-white" />
                      }
                    </div>
                    <div className={cn(
                      'max-w-[75%] rounded-2xl px-4 py-3',
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                        : 'bg-card border border-border text-foreground rounded-tl-sm'
                    )}>
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert prose-sm max-w-none text-foreground">
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
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-5 py-4">
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
          <div className="p-4 border-t border-border bg-card/30">
            <div className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="اكتب سؤالك هنا... (Enter للإرسال، Shift+Enter لسطر جديد)"
                  rows={1}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all resize-none text-sm"
                  style={{ maxHeight: '120px' }}
                />
              </div>
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                size="icon"
                className="h-11 w-11 flex-shrink-0"
                isLoading={isSending}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-2 text-center">
              الذكاء الاصطناعي قد يخطئ. تحقق من المعلومات المهمة.
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
