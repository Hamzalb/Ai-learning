'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, CalendarDays } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { principalAPI } from '@/services/api';
import { Classroom, Subject } from '@/types';
import toast from 'react-hot-toast';

const DAYS    = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const PERIODS = ['Period 1', 'Period 2', 'Period 3', 'Period 4', 'Period 5', 'Period 6'];

export default function SchedulesPage() {
  const [classrooms,         setClassrooms]         = useState<Classroom[]>([]);
  const [subjects,           setSubjects]           = useState<Subject[]>([]);
  const [selectedClassroom,  setSelectedClassroom]  = useState('');
  const [grid,               setGrid]               = useState<Record<string, string>>({});
  const [saving,             setSaving]             = useState(false);

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
    setSaving(true);
    try {
      await principalAPI.upsertSchedule({ classroomId: selectedClassroom, slots });
      toast.success('Schedule saved');
    } catch { toast.error('Failed to save schedule'); }
    finally { setSaving(false); }
  };

  // Show all school subjects in the schedule dropdown.
  // If subjects were created linked to this classroom, those appear too;
  // if not, all subjects remain available so the schedule is never empty.
  const classroomSubjects = selectedClassroom && subjects.some(s => s.classroomId === selectedClassroom)
    ? subjects.filter(s => s.classroomId === selectedClassroom)
    : subjects;

  return (
    <SMSLayout allowedRoles={['principal']}>
      <div className="space-y-5 max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="section-header">Weekly Schedule</h1>
            <p className="section-subheader">Build timetables per classroom</p>
          </div>
          {selectedClassroom && (
            <button onClick={handleSave} disabled={saving} className="btn-gradient gap-2 disabled:opacity-60">
              {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save Schedule'}
            </button>
          )}
        </motion.div>

        <div className="flex items-center gap-3">
          <CalendarDays className="w-4 h-4 text-muted-foreground/60 shrink-0" />
          <select value={selectedClassroom} onChange={e => { setSelectedClassroom(e.target.value); setGrid({}); }}
            className="input-field max-w-xs">
            <option value="">Select a classroom...</option>
            {classrooms.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>

        {!selectedClassroom && (
          <div className="glass-card p-16 text-center">
            <div className="glow-line-top" />
            <div className="icon-box-lg bg-sky-500/5 border border-sky-500/10 mx-auto mb-4">
              <CalendarDays className="w-6 h-6 text-sky-400/40" />
            </div>
            <p className="text-sm text-muted-foreground">Select a classroom above to build its weekly timetable</p>
          </div>
        )}

        {selectedClassroom && (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 24 }}
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
                      <td className="px-4 py-3 font-semibold text-muted-foreground text-xs">{period}</td>
                      {DAYS.map(day => {
                        const key     = `${day}-${period}`;
                        const value   = grid[key] || '';
                        const subject = subjects.find(s => s._id === value);
                        return (
                          <td key={day} className="px-2 py-2">
                            <select value={value} onChange={e => setGrid(g => ({ ...g, [key]: e.target.value }))}
                              className="w-full px-2 py-1.5 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all appearance-none"
                              style={{
                                backgroundColor: subject ? `${subject.color}18` : 'rgba(255,255,255,0.03)',
                                border:          `1px solid ${subject ? `${subject.color}35` : 'rgba(255,255,255,0.06)'}`,
                                color:           subject ? subject.color : 'var(--muted-foreground)',
                              }}>
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
