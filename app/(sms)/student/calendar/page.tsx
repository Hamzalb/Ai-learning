'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { studentAPI } from '@/services/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'];

interface ScheduleSlot { day: string; period: string; subjectId: string }
interface SubjectInfo { _id: string; name: string; color: string }

export default function StudentCalendarPage() {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [subjects, setSubjects] = useState<SubjectInfo[]>([]);
  const [loading, setLoading] = useState(true);

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
      <div className="space-y-5 max-w-5xl">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">Weekly Schedule</h1>
          <p className="text-sm text-muted-foreground">Your class timetable</p>
        </div>

        {loading ? <p className="text-muted-foreground text-center py-12">Loading...</p>
          : slots.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <CalendarDays className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No schedule set yet. Contact your principal.</p>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/[0.06]">
                      <th className="px-4 py-3.5 text-left text-xs text-muted-foreground font-semibold uppercase">Period</th>
                      {DAYS.map(d => <th key={d} className="px-4 py-3.5 text-center text-xs text-muted-foreground font-semibold uppercase">{d}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {PERIODS.map(period => (
                      <tr key={period} className="border-b border-white/[0.03]">
                        <td className="px-4 py-3 text-xs font-medium text-muted-foreground">{period}</td>
                        {DAYS.map(day => {
                          const subject = getSlot(day, period);
                          return (
                            <td key={day} className="px-2 py-2">
                              {subject ? (
                                <div className="rounded-lg px-3 py-2 text-center text-xs font-medium"
                                  style={{ backgroundColor: `${subject.color}15`, color: subject.color, border: `1px solid ${subject.color}30` }}>
                                  {subject.name}
                                </div>
                              ) : (
                                <div className="rounded-lg px-3 py-2 text-center text-xs text-muted-foreground/30">—</div>
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
