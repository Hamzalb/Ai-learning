'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';
import { Grade } from '@/types';
import { cn } from '@/lib/utils';

const TYPE_COLORS: Record<string, string> = { quiz: 'text-violet-400', midterm: 'text-blue-400', final: 'text-amber-400', homework: 'text-emerald-400', participation: 'text-pink-400' };

export default function StudentGradesPage() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    studentAPI.getGrades().then(r => setGrades(r.data.data.grades)).finally(() => setLoading(false));
  }, []);

  const avg = grades.length ? Math.round(grades.reduce((s, g) => s + (g.score / g.maxScore * 100), 0) / grades.length) : 0;
  const getLetterGrade = (pct: number) => pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">My Grades</h1>
          <p className="text-sm text-muted-foreground">{grades.length} grades recorded</p>
        </div>

        {grades.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-5xl font-extrabold text-foreground tabular-nums">{avg}%</p>
                <p className="text-xs text-muted-foreground mt-1">Overall Average</p>
              </div>
              <div className="h-16 w-px bg-white/[0.06]" />
              <div className="text-center">
                <p className="text-5xl font-extrabold text-emerald-400">{getLetterGrade(avg)}</p>
                <p className="text-xs text-muted-foreground mt-1">Letter Grade</p>
              </div>
              <div className="flex-1">
                <div className="h-3 rounded-full bg-white/[0.04] overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${avg}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                    className={cn('h-full rounded-full', avg >= 60 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-red-500 to-rose-400')}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}

        <div className="glass-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Type', 'Score', 'Out of', 'Percentage', 'Term', 'Date'].map(h => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">Loading...</td></tr>
                : grades.length === 0 ? <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No grades yet</td></tr>
                : grades.map((g, i) => {
                  const pct = Math.round((g.score / g.maxScore) * 100);
                  return (
                    <motion.tr key={g._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="px-5 py-4"><span className={cn('text-xs font-medium capitalize', TYPE_COLORS[g.type])}>{g.type}</span></td>
                      <td className="px-5 py-4 font-bold tabular-nums text-foreground">{g.score}</td>
                      <td className="px-5 py-4 text-muted-foreground">{g.maxScore}</td>
                      <td className="px-5 py-4">
                        <span className={cn('font-bold tabular-nums', pct >= 60 ? 'text-emerald-400' : 'text-red-400')}>{pct}%</span>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground capitalize">{g.term}</td>
                      <td className="px-5 py-4 text-muted-foreground">{new Date(g.createdAt).toLocaleDateString()}</td>
                    </motion.tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </SMSLayout>
  );
}
