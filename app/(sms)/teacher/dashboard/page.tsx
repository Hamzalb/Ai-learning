'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, BarChart3, FileQuestion, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import SMSLayout from '@/components/sms/SMSLayout';
import StatsCard from '@/components/sms/StatsCard';
import { teacherAPI } from '@/services/api';

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ classes: 0, pendingGrades: 0, quizzes: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherAPI.getDashboard().then(r => setStats(r.data.data.stats)).finally(() => setLoading(false));
  }, []);

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
          <h1 className="text-2xl font-extrabold text-foreground">Teacher Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your classes, grades and quizzes</p>
        </motion.div>

        <div className="grid grid-cols-3 gap-4">
          <StatsCard label="My Classes" value={loading ? '...' : stats.classes} icon={Home} color="text-blue-400" delay={0} />
          <StatsCard label="Quizzes" value={loading ? '...' : stats.quizzes} icon={FileQuestion} color="text-violet-400" delay={0.05} />
          <StatsCard label="Pending Grades" value={loading ? '...' : stats.pendingGrades} icon={BarChart3} color="text-amber-400" delay={0.1} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Grade Entry', href: '/teacher/grades', color: 'text-emerald-400', bg: 'bg-emerald-500/10', desc: 'Enter student grades' },
            { label: 'Upload Document', href: '/teacher/documents', color: 'text-blue-400', bg: 'bg-blue-500/10', desc: 'Share class materials' },
            { label: 'Create Quiz', href: '/teacher/quizzes', color: 'text-violet-400', bg: 'bg-violet-500/10', desc: 'Build new assessment' }
          ].map((q, i) => (
            <motion.div key={q.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
              <Link href={q.href} className="glass-card-hover p-5 block group">
                <div className={`w-9 h-9 rounded-xl ${q.bg} border border-white/[0.06] flex items-center justify-center mb-3`}>
                  <LinkIcon className={`w-4 h-4 ${q.color}`} />
                </div>
                <p className="font-semibold text-foreground text-sm">{q.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{q.desc}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </SMSLayout>
  );
}
