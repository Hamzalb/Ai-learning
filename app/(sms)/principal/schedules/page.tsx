'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { principalAPI } from '@/services/api';
import { Classroom, Subject } from '@/types';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'];

export default function SchedulesPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState('');
  const [grid, setGrid] = useState<Record<string, string>>({}); // "day-period" -> subjectId

  useEffect(() => {
    Promise.all([principalAPI.getClassrooms(), principalAPI.getSubjects()]).then(([cr, sr]) => {
      setClassrooms(cr.data.data.classrooms);
      setSubjects(sr.data.data.subjects);
    });
  }, []);

  useEffect(() => {
    if (!selectedClassroom) return;
    principalAPI.getSchedule(selectedClassroom).then(r => {
      const slots = r.data.data.schedules?.[0]?.slots || [];
      const newGrid: Record<string, string> = {};
      slots.forEach((s: { day: string; period: string; subjectId: string }) => {
        newGrid[`${s.day}-${s.period}`] = s.subjectId;
      });
      setGrid(newGrid);
    });
  }, [selectedClassroom]);

  const handleSave = async () => {
    const slots = Object.entries(grid).filter(([, sid]) => sid).map(([key, subjectId]) => {
      const [day, ...rest] = key.split('-');
      return { day, period: rest.join('-'), subjectId };
    });
    try {
      await principalAPI.upsertSchedule({ classroomId: selectedClassroom, slots });
      toast.success('Schedule saved');
    } catch { toast.error('Failed to save schedule'); }
  };

  const classroomSubjects = subjects.filter(s => !selectedClassroom || s.classroomId === selectedClassroom);

  return (
    <SMSLayout allowedRoles={['principal']}>
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Weekly Schedule</h1>
            <p className="text-sm text-muted-foreground">Build timetables per classroom</p>
          </div>
          {selectedClassroom && (
            <Button onClick={handleSave} className="btn-gradient gap-2"><Save className="w-4 h-4" /> Save Schedule</Button>
          )}
        </div>

        <select value={selectedClassroom} onChange={e => setSelectedClassroom(e.target.value)}
          className="w-full max-w-xs px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
        >
          <option value="">Select a classroom...</option>
          {classrooms.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
        </select>

        {selectedClassroom && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="px-4 py-3 text-left text-xs text-muted-foreground font-semibold uppercase">Period</th>
                    {DAYS.map(d => <th key={d} className="px-4 py-3 text-center text-xs text-muted-foreground font-semibold uppercase">{d}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {PERIODS.map(period => (
                    <tr key={period} className="border-b border-white/[0.03]">
                      <td className="px-4 py-3 font-medium text-foreground text-xs">{period}</td>
                      {DAYS.map(day => {
                        const key = `${day}-${period}`;
                        const value = grid[key] || '';
                        const subject = subjects.find(s => s._id === value);
                        return (
                          <td key={day} className="px-2 py-2">
                            <select value={value} onChange={e => setGrid(g => ({ ...g, [key]: e.target.value }))}
                              className="w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 transition-colors"
                              style={{ backgroundColor: subject ? `${subject.color}15` : 'rgba(255,255,255,0.03)', borderColor: subject ? `${subject.color}40` : 'rgba(255,255,255,0.06)', border: '1px solid', color: subject ? subject.color : 'var(--muted-foreground)' }}
                            >
                              <option value="">Free</option>
                              {classroomSubjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
                            </select>
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
