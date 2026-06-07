'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, ClipboardList } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { teacherAPI } from '@/services/api';
import { Homework, Classroom } from '@/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export default function TeacherHomeworkPage() {
  const [homework, setHomework] = useState<Homework[]>([]);
  const [classes, setClasses] = useState<Classroom[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', classroomId: '', subjectId: '', dueDate: '' });

  const load = () => Promise.all([teacherAPI.getHomework(), teacherAPI.getClasses()])
    .then(([hr, cr]) => { setHomework(hr.data.data.homework); setClasses(cr.data.data.classrooms); })
    .finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const handleCreate = async () => {
    try {
      await teacherAPI.createHomework(form);
      toast.success('Homework assigned');
      setShowForm(false);
      setForm({ title: '', description: '', classroomId: '', subjectId: '', dueDate: '' });
      load();
    } catch { toast.error('Failed to create homework'); }
  };

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-5 max-w-4xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Homework</h1>
            <p className="text-sm text-muted-foreground">{homework.length} assignments created</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Assign</Button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5 space-y-4">
            <h3 className="font-bold text-foreground">New Homework Assignment</h3>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Classroom</label>
                <select value={form.classroomId} onChange={e => setForm(f => ({ ...f, classroomId: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
                  <option value="">Select class...</option>
                  {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <Input label="Due Date" type="datetime-local" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} dir="ltr" />
              <div className="col-span-2">
                <label className="text-sm font-medium text-foreground block mb-1.5">Description</label>
                <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe the assignment..." className="w-full px-3 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40 resize-none" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleCreate} className="btn-gradient gap-2"><Plus className="w-4 h-4" /> Assign</Button>
              <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          {loading ? <p className="text-muted-foreground text-center py-8">Loading...</p>
            : homework.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-muted-foreground">No homework assigned yet</p>
              </div>
            ) : homework.map((h, i) => (
              <motion.div key={h._id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} className="glass-card-hover p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{h.title}</h3>
                    <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{h.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>Due: {h.dueDate ? new Date(h.dueDate).toLocaleDateString() : '—'}</span>
                      <span>{h.submissions?.length || 0} submissions</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
        </div>
      </div>
    </SMSLayout>
  );
}
