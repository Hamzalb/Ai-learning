'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare, FileText, Brain, Trophy, Zap,
  TrendingUp, Clock, ArrowLeft, Flame, Award,
  Sparkles, Target
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { userAPI } from '@/services/api';
import { DashboardData } from '@/types';
import { formatDate, getDifficultyColor } from '@/lib/utils';

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } }
};

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } }
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    userAPI.getDashboard()
      .then(res => setData(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    {
      title: 'المحادثات',
      value: data?.stats.totalChats || 0,
      icon: MessageSquare,
      gradient: 'from-blue-500 to-cyan-400',
      shadow: 'shadow-blue-500/15',
      bg: 'bg-blue-500/8',
      href: '/chat'
    },
    {
      title: 'المستندات',
      value: data?.stats.totalDocuments || 0,
      icon: FileText,
      gradient: 'from-violet-500 to-purple-400',
      shadow: 'shadow-violet-500/15',
      bg: 'bg-violet-500/8',
      href: '/pdf'
    },
    {
      title: 'الاختبارات',
      value: data?.stats.totalQuizzes || 0,
      icon: Brain,
      gradient: 'from-emerald-500 to-green-400',
      shadow: 'shadow-emerald-500/15',
      bg: 'bg-emerald-500/8',
      href: '/quiz'
    },
    {
      title: 'متوسط الدرجات',
      value: `${data?.stats.averageScore || 0}%`,
      icon: Target,
      gradient: 'from-amber-500 to-orange-400',
      shadow: 'shadow-amber-500/15',
      bg: 'bg-amber-500/8',
      href: '/quiz'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-36" />)}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const xpProgress = Math.min(100, ((data?.user.xp || 0) % ((data?.user.level || 1) * 100)) / ((data?.user.level || 1) * 100) * 100);

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8" dir="rtl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
                أهلاً، {data?.user.name?.split(' ')[0]}
              </h1>
              <p className="text-muted-foreground mt-1">استمر في رحلتك التعليمية</p>
            </div>

            <div className="flex items-center gap-3">
              {data?.user.streak && data.user.streak > 0 && (
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/8 border border-orange-500/15">
                  <Flame className="w-4 h-4 text-orange-400" />
                  <span className="font-bold text-sm text-orange-400">{data.user.streak} يوم</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500/8 border border-amber-500/15">
                <Zap className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-sm text-amber-400">{data?.user.xp || 0} XP</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* XP Progress */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, type: 'spring', stiffness: 300, damping: 24 }}
        >
          <div className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-md shadow-amber-500/20">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-sm font-semibold text-foreground">المستوى {data?.user.level || 1}</span>
              </div>
              <span className="text-xs text-muted-foreground font-medium tabular-nums">{data?.user.xp || 0} / {(data?.user.level || 1) * 100} XP</span>
            </div>
            <div className="h-2.5 bg-white/[0.04] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, hsl(217 91% 60%), hsl(262 83% 65%), hsl(330 81% 60%))'
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Stat Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {statCards.map((card, i) => (
            <motion.div key={i} variants={item}>
              <Link href={card.href}>
                <div className={`glass-card-hover p-5 cursor-pointer group`}>
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-lg ${card.shadow} group-hover:scale-110 transition-transform duration-300`}>
                    <card.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-2xl font-extrabold text-foreground tabular-nums">{card.value}</div>
                  <div className="text-sm text-muted-foreground mt-1">{card.title}</div>
                </div>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Chats */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, type: 'spring', stiffness: 300, damping: 24 }}
          >
            <div className="glass-card overflow-hidden">
              <div className="p-5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-foreground text-[15px]">آخر المحادثات</h3>
                </div>
                <Link href="/chat" className="text-primary text-xs font-medium flex items-center gap-1 hover:underline">
                  عرض الكل <ArrowLeft className="w-3 h-3" />
                </Link>
              </div>
              <div className="px-5 pb-5 space-y-2">
                {data?.recentChats?.length ? (
                  data.recentChats.map((chat) => (
                    <Link key={chat._id} href={`/chat?id=${chat._id}`}>
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] hover:border-white/[0.06] transition-all cursor-pointer group">
                        <p className="font-medium text-sm text-foreground truncate">{chat.title || 'محادثة جديدة'}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{formatDate(chat.updatedAt!)}</span>
                          {chat.messageCount && (
                            <span className="text-xs text-muted-foreground">· {chat.messageCount} رسالة</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/8 flex items-center justify-center mx-auto mb-3">
                      <MessageSquare className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">لا توجد محادثات بعد</p>
                    <Link href="/chat" className="text-primary text-sm font-medium hover:underline">ابدأ محادثة الآن</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Recent Quizzes */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 24 }}
          >
            <div className="glass-card overflow-hidden">
              <div className="p-5 pb-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                    <Brain className="w-4 h-4 text-emerald-400" />
                  </div>
                  <h3 className="font-bold text-foreground text-[15px]">آخر الاختبارات</h3>
                </div>
                <Link href="/quiz" className="text-primary text-xs font-medium flex items-center gap-1 hover:underline">
                  عرض الكل <ArrowLeft className="w-3 h-3" />
                </Link>
              </div>
              <div className="px-5 pb-5 space-y-2">
                {data?.recentQuizzes?.length ? (
                  data.recentQuizzes.map((quiz) => (
                    <Link key={quiz._id} href={`/quiz/${quiz._id}`}>
                      <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.03] hover:bg-white/[0.04] hover:border-white/[0.06] transition-all cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm text-foreground truncate flex-1">{quiz.title}</p>
                          {quiz.difficulty && (
                            <span className={`text-[11px] px-2 py-0.5 rounded-full border flex-shrink-0 font-medium ${getDifficultyColor(quiz.difficulty)}`}>
                              {quiz.difficulty === 'easy' ? 'سهل' : quiz.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                            </span>
                          )}
                        </div>
                        {quiz.lastScore !== null && quiz.lastScore !== undefined && (
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <TrendingUp className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">آخر درجة: <span className="font-medium text-foreground">{quiz.lastScore}%</span></span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-10">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/8 flex items-center justify-center mx-auto mb-3">
                      <Brain className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-1">لا توجد اختبارات بعد</p>
                    <Link href="/quiz" className="text-primary text-sm font-medium hover:underline">إنشاء اختبار الآن</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Badges - with proper SVG icons instead of emoji */}
        {data?.badges && data.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 24 }}
          >
            <div className="glass-card overflow-hidden">
              <div className="p-5 pb-3 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-amber-400" />
                </div>
                <h3 className="font-bold text-foreground text-[15px]">الإنجازات</h3>
              </div>
              <div className="px-5 pb-5">
                <div className="flex flex-wrap gap-2.5">
                  {data.badges.map((badge, i) => (
                    <div key={i} className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500/6 border border-amber-500/12 hover:border-amber-500/20 transition-colors">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-medium text-amber-300">{badge}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
