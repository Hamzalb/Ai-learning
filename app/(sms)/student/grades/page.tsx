'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3 } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { Grade } from '@/types';
import { cn } from '@/lib/utils';
import { useT } from '@/lib/i18n';

const TYPE_BADGE: Record<string, string> = {
  quiz:          'badge-violet',
  midterm:       'badge-info',
  final:         'badge-warning',
  homework:      'badge-success',
  participation: 'badge-cyan',
};

export default function StudentGradesPage() {
  const [grades,  setGrades]  = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useT();

  useEffect(() => {
    studentAPI.getGrades().then(r => setGrades(r.data.data.grades)).finally(() => setLoading(false));
  }, []);

  const avg = grades.length ? Math.round(grades.reduce((s, g) => s + (g.score / g.maxScore * 100), 0) / grades.length) : 0;
  const getLetterGrade = (pct: number) => pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
  const pass = avg >= 60;

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-5 max-w-4xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
          <h1 className="section-header">{t('grades')}</h1>
          <p className="section-subheader">{grades.length} {t('grades').toLowerCase()} recorded</p>
        </motion.div>

        {!loading && grades.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05, type: 'spring', stiffness: 260, damping: 24 }}
            className="glass-card p-5 overflow-hidden">
            <div className="glow-line-top" style={{ background: 'linear-gradient(90deg, transparent, hsl(160 84% 39% / 0.3), transparent)' }} />
            <div className="flex items-center gap-6 flex-wrap">
              <div className="text-center">
                <p className="text-5xl font-extrabold text-foreground tabular-nums">{avg}%</p>
                <p className="text-xs text-muted-foreground mt-1">{t('overview')}</p>
              </div>
              <div className="h-16 w-px bg-white/[0.06] hidden sm:block" />
              <div className="text-center">
                <p className={cn('text-5xl font-extrabold tabular-nums', pass ? 'text-emerald-400' : 'text-rose-400')}>{getLetterGrade(avg)}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('gradeType')}</p>
              </div>
              <div className="flex-1 min-w-[120px]">
                <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${avg}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', pass ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-rose-500 to-pink-400')}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, type: 'spring', stiffness: 260, damping: 24 }}
          className="glass-card overflow-hidden">
          <div className="glow-line-top" />
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>{[t('gradeType'), t('score'), t('maxScore'), '%', t('term'), 'Date'].map(h => <th key={h}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {loading ? Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-white/[0.03]">
                    {[1,2,3,4,5,6].map(j => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>)}
                  </tr>
                )) : grades.length === 0 ? (
                  <tr><td colSpan={6}>
                    <div className="flex flex-col items-center py-16 gap-3">
                      <div className="icon-box-lg bg-indigo-500/5 border border-indigo-500/10">
                        <BarChart3 className="w-6 h-6 text-indigo-400/40" />
                      </div>
                      <p className="text-sm text-muted-foreground">{t('noGrades')}</p>
                    </div>
                  </td></tr>
                ) : grades.map((g, i) => {
                  const pct  = Math.round((g.score / g.maxScore) * 100);
                  const pass = pct >= 60;
                  return (
                    <motion.tr key={g._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}>
                      <td>
                        <span className={cn('badge text-[10px]', TYPE_BADGE[g.type] || 'badge-default')}>{g.type}</span>
                      </td>
                      <td className="font-bold tabular-nums text-foreground">{g.score}</td>
                      <td className="text-muted-foreground">{g.maxScore}</td>
                      <td>
                        <span className={cn('font-black tabular-nums text-sm', pass ? 'text-emerald-400' : 'text-rose-400')}>{pct}%</span>
                      </td>
                      <td className="text-muted-foreground capitalize">{g.term}</td>
                      <td className="text-muted-foreground">{new Date(g.createdAt).toLocaleDateString()}</td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </SMSLayout>
  );
}
