'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MessageSquare, FileText, Brain, Trophy, Zap,
  TrendingUp, Clock, Star, ArrowLeft, Flame
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { userAPI } from '@/services/api';
import { DashboardData } from '@/types';
import { formatDate, getDifficultyColor, truncate } from '@/lib/utils';
import {
  RadialBarChart, RadialBar, ResponsiveContainer, Tooltip
} from 'recharts';

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
      color: 'from-blue-500 to-blue-700',
      href: '/chat'
    },
    {
      title: 'المستندات',
      value: data?.stats.totalDocuments || 0,
      icon: FileText,
      color: 'from-purple-500 to-purple-700',
      href: '/pdf'
    },
    {
      title: 'الاختبارات',
      value: data?.stats.totalQuizzes || 0,
      icon: Brain,
      color: 'from-green-500 to-green-700',
      href: '/quiz'
    },
    {
      title: 'متوسط الدرجات',
      value: `${data?.stats.averageScore || 0}%`,
      icon: Trophy,
      color: 'from-orange-500 to-orange-700',
      href: '/quiz'
    }
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-8 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8" dir="rtl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                أهلاً، {data?.user.name?.split(' ')[0]} 👋
              </h1>
              <p className="text-muted-foreground mt-1">استمر في رحلتك التعليمية</p>
            </div>

            <div className="flex items-center gap-4">
              {data?.user.streak && data.user.streak > 0 && (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20">
                  <Flame className="w-5 h-5 text-orange-400" />
                  <span className="font-bold text-orange-400">{data.user.streak} يوم</span>
                </div>
              )}
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <Zap className="w-5 h-5 text-yellow-400" />
                <span className="font-bold text-yellow-400">{data?.user.xp || 0} XP</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* XP Progress */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardContent className="py-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-medium">المستوى {data?.user.level || 1}</span>
                </div>
                <span className="text-xs text-muted-foreground">{data?.user.xp || 0} / {(data?.user.level || 1) * 100} XP</span>
              </div>
              <div className="h-2 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(100, ((data?.user.xp || 0) % ((data?.user.level || 1) * 100)) / ((data?.user.level || 1) * 100) * 100)}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link href={card.href}>
                <Card className="hover:border-primary/30 transition-all cursor-pointer group hover:scale-[1.02]">
                  <CardContent className="p-5">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                      <card.icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-2xl font-bold text-foreground">{card.value}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{card.title}</div>
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Chats */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    آخر المحادثات
                  </CardTitle>
                  <Link href="/chat" className="text-primary text-sm flex items-center gap-1 hover:underline">
                    عرض الكل <ArrowLeft className="w-3 h-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.recentChats?.length ? (
                  data.recentChats.map((chat) => (
                    <Link key={chat._id} href={`/chat?id=${chat._id}`}>
                      <div className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                        <p className="font-medium text-sm text-foreground truncate">{chat.title || 'محادثة جديدة'}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Clock className="w-3 h-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{formatDate(chat.updatedAt!)}</span>
                          {chat.messageCount && (
                            <span className="text-xs text-muted-foreground">• {chat.messageCount} رسالة</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageSquare className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">لا توجد محادثات بعد</p>
                    <Link href="/chat" className="text-primary text-sm hover:underline">ابدأ محادثة الآن</Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Recent Quizzes */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}>
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-green-400" />
                    آخر الاختبارات
                  </CardTitle>
                  <Link href="/quiz" className="text-primary text-sm flex items-center gap-1 hover:underline">
                    عرض الكل <ArrowLeft className="w-3 h-3" />
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {data?.recentQuizzes?.length ? (
                  data.recentQuizzes.map((quiz) => (
                    <Link key={quiz._id} href={`/quiz/${quiz._id}`}>
                      <div className="p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium text-sm text-foreground truncate flex-1">{quiz.title}</p>
                          {quiz.difficulty && (
                            <span className={`text-xs px-2 py-0.5 rounded-full border flex-shrink-0 ${getDifficultyColor(quiz.difficulty)}`}>
                              {quiz.difficulty === 'easy' ? 'سهل' : quiz.difficulty === 'medium' ? 'متوسط' : 'صعب'}
                            </span>
                          )}
                        </div>
                        {quiz.lastScore !== null && quiz.lastScore !== undefined && (
                          <div className="flex items-center gap-1 mt-1">
                            <TrendingUp className="w-3 h-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">آخر درجة: {quiz.lastScore}%</span>
                          </div>
                        )}
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Brain className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">لا توجد اختبارات بعد</p>
                    <Link href="/quiz" className="text-primary text-sm hover:underline">إنشاء اختبار الآن</Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Badges */}
        {data?.badges && data.badges.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  الإنجازات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {data.badges.map((badge, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                      <span className="text-lg">🏆</span>
                      <span className="text-sm font-medium text-yellow-400">{badge}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
