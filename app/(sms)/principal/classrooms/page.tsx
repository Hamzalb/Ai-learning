'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Users, BookOpen } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { principalAPI, schoolAPI } from '@/services/api';
import { Classroom, User } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', gradeLevel: '', capacity: '30' });
  const [assigning, setAssigning] = useState<{ classroomId: string; type: 'teacher' | 'students' } | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const load = async () => {
    const [cr, tr, sr] = await Promise.all([principalAPI.getClassrooms(), schoolAPI.getTeachers(), schoolAPI.getStudents()]);
    setClassrooms(cr.data.data.classrooms);
    setTeachers(tr.data.data.teachers);
    setStudents(sr.data.data.students);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await principalAPI.createClassroom({ ...form, capacity: Number(form.capacity) });
      toast.success('Classroom created');
      setShowForm(false);
      setForm({ name: '', gradeLevel: '', capacity: '30' });
      load();
    } catch { toast.error('Failed to create classroom'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this classroom?')) return;
    await principalAPI.deleteClassroom(id);
    toast.success('Classroom deleted');
    load();
  };

  const handleAssignTeacher = async () => {
    if (!assigning || !selectedTeacher) return;
    await principalAPI.assignTeacher(assigning.classroomId, selectedTeacher);
    toast.success('Teacher assigned');
    setAssigning(null);
    load();
  };

  const handleAssignStudents = async () => {
    if (!assigning) return;
    await principalAPI.assignStudents(assigning.classroomId, selectedStudents);
    toast.success('Students assigned');
    setAssigning(null);
    load();
  };

  return (
    <SMSLayout allowedRoles={['principal']}>
      <div className="space-y-5 max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Classrooms</h1>
            <p className="text-sm text-muted-foreground">{classrooms.length} classrooms managed</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> New Classroom</Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-foreground">Create Classroom</h3>
            <div className="grid grid-cols-3 gap-4">
              <Input label="Class Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Grade 10 A" />
              <Input label="Grade Level" value={form.gradeLevel} onChange={e => setForm(f => ({ ...f, gradeLevel: e.target.value }))} placeholder="Grade 10" />
              <Input label="Capacity" type="number" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Create</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        {assigning && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
            {assigning.type === 'teacher' ? (
              <>
                <h3 className="font-bold text-foreground">Assign Homeroom Teacher</h3>
                <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                  <option value="">Select teacher...</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                <div className="flex gap-2">
                  <Button onClick={handleAssignTeacher} className="btn-gradient">Assign</Button>
                  <Button variant="ghost" onClick={() => setAssigning(null)}>Cancel</Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-bold text-foreground">Assign Students</h3>
                <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                  {students.map(s => (
                    <label key={s._id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-white/[0.03] cursor-pointer">
                      <input type="checkbox" checked={selectedStudents.includes(s._id)} onChange={e => {
                        setSelectedStudents(prev => e.target.checked ? [...prev, s._id] : prev.filter(id => id !== s._id));
                      }} className="accent-primary" />
                      <span className="text-sm text-foreground">{s.name}</span>
                    </label>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleAssignStudents} className="btn-gradient">Assign {selectedStudents.length} students</Button>
                  <Button variant="ghost" onClick={() => setAssigning(null)}>Cancel</Button>
                </div>
              </>
            )}
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? <p className="text-muted-foreground col-span-2 text-center py-8">Loading...</p>
            : classrooms.map((c, i) => {
              const teacher = teachers.find(t => t._id === c.teacherId);
              return (
                <motion.div key={c._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card-hover p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-foreground">{c.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.gradeLevel} · Capacity {c.capacity}</p>
                    </div>
                    <button onClick={() => handleDelete(c._id)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Teacher</span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{teacher?.name || <span className="text-amber-400 text-xs">Unassigned</span>}</span>
                        <button onClick={() => { setAssigning({ classroomId: c._id, type: 'teacher' }); setSelectedTeacher(''); }} className="text-xs text-primary hover:underline">Assign</button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Students</span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground">{c.studentIds?.length || 0}</span>
                        <button onClick={() => { setAssigning({ classroomId: c._id, type: 'students' }); setSelectedStudents(c.studentIds || []); }} className="text-xs text-primary hover:underline">Manage</button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>
      </div>
    </SMSLayout>
  );
}
