'use client';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, Sparkles } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { useAuthStore } from '@/store/authStore';
import { aiAPI } from '@/services/api';

interface Message { role: 'user' | 'assistant'; content: string }

export default function StudentAIPage() {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: `Hi ${user?.name?.split(' ')[0] || 'there'}! I'm your AI tutor. Ask me anything about your subjects and I'll help you understand the material.` }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg: Message = { role: 'user', content: input };
    setMessages(m => [...m, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const res = await aiAPI.sendMessage({ message: input, language: user?.preferences?.language || 'arabic' });
      const reply = res.data.data?.message || res.data.data?.content || 'I could not process your request.';
      setMessages(m => [...m, { role: 'assistant', content: reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally { setLoading(false); }
  };

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="flex flex-col h-[calc(100vh-128px)] max-w-3xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/25">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">AI Tutor</h1>
            <p className="text-xs text-muted-foreground">Ask anything about your subjects</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-400">
            <Sparkles className="w-3 h-3" /> Claude Powered
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-4 py-2 pr-1">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? 'bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg shadow-violet-500/20' : 'bg-primary/10 border border-primary/20'}`}>
                  {msg.role === 'assistant' ? <Bot className="w-4 h-4 text-white" /> : <User className="w-4 h-4 text-primary" />}
                </div>
                <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === 'assistant' ? 'bg-white/[0.04] border border-white/[0.06] text-foreground' : 'bg-primary/15 border border-primary/20 text-foreground'}`}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white/[0.04] border border-white/[0.06] rounded-2xl px-4 py-3 flex gap-1.5">
                {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        <div className="flex gap-3 pt-4 border-t border-white/[0.06]">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Ask your AI tutor..."
            className="flex-1 px-4 py-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
          />
          <button onClick={send} disabled={loading || !input.trim()} className="w-11 h-11 rounded-2xl bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all disabled:opacity-40 shrink-0">
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </SMSLayout>
  );
}
