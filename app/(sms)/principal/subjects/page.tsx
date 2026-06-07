'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2 } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { principalAPI, schoolAPI } from '@/services/api';
import { Subject, Classroom, User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

export default function SubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', classroomId: '', teacherId: '', color: '#6366f1' });

  const load = async () => {
    const [sr, cr, tr] = await Promise.all([principalAPI.getSubjects(), principalAPI.getClassrooms(), schoolAPI.getTeachers()]);
    setSubjects(sr.data.data.subjects);
    setClassrooms(cr.data.data.classrooms);
    setTeachers(tr.data.data.teachers);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await principalAPI.createSubject(form);
      toast.success('Subject created');
      setShowForm(false);
      setForm({ name: '', classroomId: '', teacherId: '', color: '#6366f1' });
      load();
    } catch { toast.error('Failed to create subject'); }
  };

  const handleDelete = async (id: string) => {
    await principalAPI.deleteSubject(id);
    toast.success('Subject deleted');
    load();
  };

  return (
    <SMSLayout allowedRoles={['principal']}>
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Subjects</h1>
            <p className="text-sm text-muted-foreground">{subjects.length} subjects defined</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> New Subject</Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-foreground">Create Subject</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Subject Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Mathematics" />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Classroom</label>
                <select value={form.classroomId} onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                  <option value="">Select classroom...</option>
                  {classrooms.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Teacher</label>
                <select value={form.teacherId} onChange={e => setForm(f => ({ ...f, teacherId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                  <option value="">Select teacher...</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Color</label>
                <div className="flex gap-2 flex-wrap">
                  {COLORS.map(c => (
                    <button key={c} onClick={() => setForm(f => ({ ...f, color: c }))}
                      className="w-7 h-7 rounded-lg border-2 transition-all"
                      style={{ backgroundColor: c, borderColor: form.color === c ? 'white' : 'transparent' }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Create</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? <p className="text-muted-foreground col-span-3 text-center py-8">Loading...</p>
            : subjects.map((s, i) => {
              const classroom = classrooms.find(c => c._id === s.classroomId);
              const teacher = teachers.find(t => t._id === s.teacherId);
              return (
                <motion.div key={s._id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                  className="glass-card-hover p-5 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ backgroundColor: s.color }} />
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-foreground mt-1">{s.name}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{classroom?.name || '—'}</p>
                      <p className="text-xs text-muted-foreground">{teacher?.name || 'No teacher'}</p>
                    </div>
                    <button onClick={() => handleDelete(s._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </SMSLayout>
  );
}
