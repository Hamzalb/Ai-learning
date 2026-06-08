'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ChevronRight, Home } from 'lucide-react';
import Link from 'next/link';
import SMSLayout from '@/components/sms/SMSLayout';
import { teacherAPI } from '@/services/api';
import { useT } from '@/lib/i18n';

interface ClassWithCount {
  _id: string;
  name: string;
  gradeLevel: string;
  studentCount: number;
  capacity: number;
}

export default function TeacherClassesPage() {
  const [classes,  setClasses]  = useState<ClassWithCount[]>([]);
  const [loading,  setLoading]  = useState(true);
  const t = useT();

  useEffect(() => {
    teacherAPI.getClasses()
      .then(r => setClasses(r.data.data.classrooms))
      .finally(() => setLoading(false));
  }, []);

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-5 max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
        >
          <h1 className="section-header">{t('myClasses')}</h1>
          <p className="section-subheader">
            {loading ? t('loading') : `${classes.length} ${t('classrooms').toLowerCase()} assigned`}
          </p>
        </motion.div>

        {/* Skeleton loading */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-5">
                <div className="glow-line-top" />
                <div className="flex items-start justify-between mb-4">
                  <div className="space-y-2 flex-1">
                    <div className="skeleton h-5 w-2/3 rounded" />
                    <div className="skeleton h-3.5 w-1/3 rounded" />
                  </div>
                  <div className="skeleton w-12 h-12 rounded-2xl shrink-0" />
                </div>
                <div className="skeleton h-4 w-1/2 rounded mb-3" />
                <div className="skeleton h-1.5 rounded-full" />
              </div>
            ))}
          </div>
        ) : classes.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 24 }}
            className="glass-card p-16 text-center"
          >
            <div className="glow-line-top" />
            <div className="icon-box-lg bg-emerald-500/5 border border-emerald-500/10 mx-auto mb-4">
              <Home className="w-6 h-6 text-emerald-400/40" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">{t('noClassrooms')}</p>
            <p className="text-xs text-muted-foreground">{t('noActiveTeachers')}</p>
          </motion.div>
        ) : (
          /* Class grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {classes.map((c, i) => {
              const pct = Math.min(Math.round((c.studentCount / (c.capacity || 1)) * 100), 100);
              const barColor = pct >= 90 ? 'from-rose-500 to-red-600' : pct >= 70 ? 'from-amber-500 to-orange-500' : 'from-emerald-500 to-teal-500';

              return (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 24 }}
                  className="glass-card-hover p-5"
                >
                  <div className="glow-line-top" />

                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground text-base leading-tight truncate">{c.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.gradeLevel}</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-600/10 border border-emerald-500/20 flex items-center justify-center shrink-0 ml-3">
                      <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm">
                      <span className="text-2xl font-extrabold text-foreground tabular-nums">{c.studentCount}</span>
                      <span className="text-muted-foreground ml-1 text-xs">/ {c.capacity} {t('students').toLowerCase()}</span>
                    </div>
                    <Link
                      href={`/teacher/classes/${c._id}`}
                      className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-semibold transition-colors group"
                    >
                      {t('manage')}
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>

                  {/* Capacity bar */}
                  <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ delay: 0.2 + i * 0.06, duration: 0.6, ease: 'easeOut' }}
                      className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1.5">{pct}% {t('capacity').toLowerCase()}</p>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </SMSLayout>
  );
}
