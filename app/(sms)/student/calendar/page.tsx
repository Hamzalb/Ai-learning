'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';

const DAYS    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'];

interface ScheduleSlot { day: string; period: string; subjectId: string }
interface SubjectInfo  { _id: string; name: string; color: string }

export default function StudentCalendarPage() {
  const [slots,    setSlots]    = useState<ScheduleSlot[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    studentAPI.getSchedule().then(r => {
      setSlots(r.data.data.schedule || []);
      setSubjects(r.data.data.subjects || []);
    }).finally(() => setLoading(false));
  }, []);

  const getSlot = (day: string, period: string) => {
    const slot = slots.find(s => s.day === day && s.period === period);
    if (!slot) return null;
    return subjects.find(s => s._id === slot.subjectId) || null;
  };

  return (
    <SMSLayout allowedRoles={['student']}>
      <div className="space-y-5 max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
          <h1 className="section-header">Weekly Schedule</h1>
          <p className="section-subheader">Your class timetable</p>
        </motion.div>

        {loading ? (
          <div className="glass-card overflow-hidden">
            <div className="glow-line-top" />
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Period</th>
                    {DAYS.map(d => <th key={d} className="text-center">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(p => (
                    <tr key={p} className="border-b border-white/[0.03]">
                      <td className="px-4 py-3"><div className="skeleton h-4 w-16 rounded" /></td>
                      {DAYS.map(d => (
                        <td key={d} className="px-2 py-2">
                          <div className="skeleton h-9 rounded-lg" />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : slots.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="glow-line-top" />
            <div className="icon-box-lg bg-sky-500/5 border border-sky-500/10 mx-auto mb-4">
              <CalendarDays className="w-6 h-6 text-sky-400/40" />
            </div>
            <p className="text-muted-foreground text-sm">No schedule set yet. Contact your principal.</p>
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 24 }}
            className="glass-card overflow-hidden">
            <div className="glow-line-top" style={{ background: 'linear-gradient(90deg, transparent, hsl(212 89% 66% / 0.25), transparent)' }} />
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-3.5 text-left text-xs text-muted-foreground font-semibold uppercase tracking-wide">Period</th>
                    {DAYS.map(d => (
                      <th key={d} className="px-4 py-3.5 text-center text-xs text-muted-foreground font-semibold uppercase tracking-wide">{d}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(period => (
                    <tr key={period} className="border-b border-white/[0.03]">
                      <td className="px-4 py-3 text-xs font-semibold text-muted-foreground">{period}</td>
                      {DAYS.map(day => {
                        const subject = getSlot(day, period);
                        return (
                          <td key={day} className="px-2 py-2">
                            {subject ? (
                              <div className="rounded-lg px-3 py-2 text-center text-xs font-semibold transition-all hover:brightness-110"
                                style={{ backgroundColor: `${subject.color}18`, color: subject.color, border: `1px solid ${subject.color}35` }}>
                                {subject.name}
                              </div>
                            ) : (
                              <div className="rounded-lg px-3 py-2 text-center text-xs text-muted-foreground/25">—</div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </SMSLayout>
  );
}
