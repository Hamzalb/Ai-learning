'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays, BarChart3, ClipboardList, UserCheck, DollarSign, FileQuestion } from 'lucide-react';
import Link from 'next/link';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { useAuthStore } from '@/store/authStore';

interface DashboardData {
  attendancePercent: number;
  upcomingQuizzes: { title: string; dueDate: string }[];
  recentGrades: { score: number; maxScore: number; type: string; createdAt: string }[];
  pendingHomework: { title: string; dueDate: string }[];
  overduePayments: number;
}

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getDashboard().then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
          <h1 className="text-2xl font-extrabold text-foreground">Welcome, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Here's your academic overview</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Attendance', value: loading ? '...' : `${data?.attendancePercent ?? 0}%`, icon: UserCheck, color: 'text-emerald-400', href: '/student/attendance' },
            { label: 'Upcoming Quizzes', value: loading ? '...' : data?.upcomingQuizzes.length ?? 0, icon: FileQuestion, color: 'text-violet-400', href: '/student/quizzes' },
            { label: 'Pending Homework', value: loading ? '...' : data?.pendingHomework.length ?? 0, icon: ClipboardList, color: 'text-amber-400', href: '/student/homework' },
            { label: 'Overdue Payments', value: loading ? '...' : data?.overduePayments ?? 0, icon: DollarSign, color: 'text-red-400', href: '/student/payments' }
          ].map((card, i) => (
            <motion.div key={card.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}>
              <Link href={card.href} className="glass-card-hover p-5 block overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{card.label}</p>
                    <p className={`text-3xl font-extrabold mt-1 tabular-nums ${card.color}`}>{card.value}</p>
                  </div>
                  <div className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Upcoming Quizzes */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="glass-card p-5">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
            <div className="flex items-center gap-2 mb-4">
              <FileQuestion className="w-4 h-4 text-violet-400" />
              <h2 className="font-bold text-foreground text-sm">Upcoming Quizzes</h2>
            </div>
            {!data?.upcomingQuizzes.length
              ? <p className="text-xs text-muted-foreground">No upcoming quizzes</p>
              : data.upcomingQuizzes.map((q, i) => (
                <div key={i} className="py-2.5 border-b border-white/[0.04] last:border-0">
                  <p className="text-sm font-medium text-foreground">{q.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Due: {new Date(q.dueDate).toLocaleDateString()}</p>
                </div>
              ))
            }
          </motion.div>

          {/* Recent Grades */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-foreground text-sm">Recent Grades</h2>
            </div>
            {!data?.recentGrades.length
              ? <p className="text-xs text-muted-foreground">No grades yet</p>
              : data.recentGrades.map((g, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/[0.04] last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{g.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(g.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-bold tabular-nums ${(g.score / g.maxScore) >= 0.6 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {g.score}/{g.maxScore}
                  </span>
                </div>
              ))
            }
          </motion.div>
        </div>
      </div>
    </SMSLayout>
  );
}
