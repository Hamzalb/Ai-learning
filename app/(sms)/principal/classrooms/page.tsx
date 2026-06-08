'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Users, BookOpen, X, UserCircle } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { principalAPI } from '@/services/api';
import { Classroom, User } from '@/types';
import toast from 'react-hot-toast';

const EMPTY_FORM = { name: '', gradeLevel: '', capacity: '30' };

export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers,   setTeachers]   = useState<User[]>([]);
  const [students,   setStudents]   = useState<User[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [assigning,  setAssigning]  = useState<{ classroomId: string; type: 'teacher' | 'students' } | null>(null);
  const [selectedTeacher,  setSelectedTeacher]  = useState('');
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const load = async () => {
    const [cr, tr, sr] = await Promise.all([
      principalAPI.getClassrooms(),
      principalAPI.getTeachers(),
      principalAPI.getStudents(),
    ]);
    setClassrooms(cr.data.data.classrooms);
    setTeachers(tr.data.data.teachers);
    setStudents(sr.data.data.students);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    if (!form.name) { toast.error('Class name required'); return; }
    setSaving(true);
    try {
      await principalAPI.createClassroom({ ...form, capacity: Number(form.capacity) });
      toast.success('Classroom created');
      setShowForm(false); setForm(EMPTY_FORM); load();
    } catch { toast.error('Failed to create classroom'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this classroom?')) return;
    await principalAPI.deleteClassroom(id);
    toast.success('Classroom deleted'); load();
  };

  const handleAssignTeacher = async () => {
    if (!assigning || !selectedTeacher) return;
    await principalAPI.assignTeacher(assigning.classroomId, selectedTeacher);
    toast.success('Teacher assigned'); setAssigning(null); load();
  };

  const handleAssignStudents = async () => {
    if (!assigning) return;
    await principalAPI.assignStudents(assigning.classroomId, selectedStudents);
    toast.success('Students assigned'); setAssigning(null); load();
  };

  return (
    <SMSLayout allowedRoles={['principal']}>
      <div className="space-y-5 max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="section-header">Classrooms</h1>
            <p className="section-subheader">{classrooms.length} classrooms managed</p>
          </div>
          <button onClick={() => setShowForm(s => !s)} className="btn-gradient gap-2">
            <Plus className="w-4 h-4" /> New Classroom
          </button>
        </motion.div>

        <AnimatePresence>
          {showForm && (
            <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card p-6">
              <div className="glow-line-top" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-foreground">Create Classroom</h3>
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Class Name</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Grade 10 A" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Grade Level</label>
                  <input value={form.gradeLevel} onChange={e => setForm(f => ({ ...f, gradeLevel: e.target.value }))} placeholder="Grade 10" className="input-field" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Capacity</label>
                  <input type="number" dir="ltr" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} className="input-field" />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={saving} className="btn-gradient gap-2 disabled:opacity-60">
                  {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Creating…' : 'Create Classroom'}
                </button>
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="btn-ghost">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {assigning && (
            <motion.div initial={{ opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card p-6">
              <div className="glow-line-top" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-foreground">
                  {assigning.type === 'teacher' ? 'Assign Homeroom Teacher' : 'Manage Students'}
                </h3>
                <button onClick={() => setAssigning(null)} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
              {assigning.type === 'teacher' ? (
                <>
                  <div className="mb-5">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Select Teacher</label>
                    <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="input-field appearance-none">
                      <option value="">Choose a teacher...</option>
                      {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleAssignTeacher} className="btn-gradient gap-2">
                      <UserCircle className="w-4 h-4" /> Assign Teacher
                    </button>
                    <button onClick={() => setAssigning(null)} className="btn-ghost">Cancel</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-56 overflow-y-auto mb-5 pr-1">
                    {students.map(s => (
                      <label key={s._id} className="flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-white/[0.03] cursor-pointer border border-transparent hover:border-white/[0.05] transition-all">
                        <input type="checkbox" checked={selectedStudents.includes(s._id)}
                          onChange={e => setSelectedStudents(prev => e.target.checked ? [...prev, s._id] : prev.filter(id => id !== s._id))}
                          className="accent-primary w-4 h-4 shrink-0" />
                        <span className="text-sm text-foreground">{s.name}</span>
                      </label>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <button onClick={handleAssignStudents} className="btn-gradient gap-2">
                      <Users className="w-4 h-4" /> Assign {selectedStudents.length} Students
                    </button>
                    <button onClick={() => setAssigning(null)} className="btn-ghost">Cancel</button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-5 space-y-3">
              <div className="skeleton h-5 w-1/3 rounded" />
              <div className="skeleton h-3 w-1/2 rounded" />
              <div className="skeleton h-1.5 w-full rounded-full" />
            </div>
          )) : classrooms.length === 0 ? (
            <div className="col-span-2 glass-card p-16 text-center">
              <div className="glow-line-top" />
              <div className="icon-box-lg bg-sky-500/5 border border-sky-500/10 mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-sky-400/40" />
              </div>
              <p className="text-sm text-muted-foreground">No classrooms created yet</p>
              <button onClick={() => setShowForm(true)} className="btn-gradient gap-2 mt-4">
                <Plus className="w-4 h-4" /> Create First Classroom
              </button>
            </div>
          ) : classrooms.map((c, i) => {
            const teacher = teachers.find(t => t._id === c.teacherId);
            const fillPct  = Math.min(((c.studentIds?.length || 0) / (c.capacity || 1)) * 100, 100);
            return (
              <motion.div key={c._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
                className="glass-card-hover p-5">
                <div className="glow-line-top" />
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-foreground">{c.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{c.gradeLevel} · Capacity {c.capacity}</p>
                  </div>
                  <button onClick={() => handleDelete(c._id)} className="btn-icon hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2.5 text-sm mb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> Teacher</span>
                    <div className="flex items-center gap-2">
                      <span className="text-foreground text-sm">{teacher?.name || <span className="text-amber-400 text-xs">Unassigned</span>}</span>
                      <button onClick={() => { setAssigning({ classroomId: c._id, type: 'teacher' }); setSelectedTeacher(''); }}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">Assign</button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> Students</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{c.studentIds?.length || 0}</span>
                      <button onClick={() => { setAssigning({ classroomId: c._id, type: 'students' }); setSelectedStudents(c.studentIds || []); }}
                        className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">Manage</button>
                    </div>
                  </div>
                </div>
                <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all" style={{ width: `${fillPct}%` }} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </SMSLayout>
  );
}
