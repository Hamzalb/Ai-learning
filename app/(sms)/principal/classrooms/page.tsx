'use client';
import { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Users, BookOpen, X, UserCircle,
  Search, UserPlus, UserMinus, GraduationCap, Check,
} from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { principalAPI } from '@/services/api';
import { Classroom, User } from '@/types';
import toast from 'react-hot-toast';
import { cn } from '@/lib/utils';

const EMPTY_FORM = { name: '', gradeLevel: '', capacity: '30' };

/* ─── Student Manager Panel ─────────────────────────────── */
function StudentManagerPanel({
  classroom,
  allStudents,
  onClose,
  onSaved,
}: {
  classroom: Classroom;
  allStudents: User[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [enrolled, setEnrolled]   = useState<string[]>(classroom.studentIds || []);
  const [search,   setSearch]     = useState('');
  const [saving,   setSaving]     = useState(false);

  const cap     = classroom.capacity || 30;
  const isFull  = enrolled.length >= cap;

  const filteredAll = useMemo(() => {
    const q = search.toLowerCase();
    return allStudents.filter(s =>
      s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q)
    );
  }, [allStudents, search]);

  const enrolledStudents   = filteredAll.filter(s => enrolled.includes(s._id));
  const availableStudents  = filteredAll.filter(s => !enrolled.includes(s._id));

  const addStudent    = (id: string) => { if (!isFull) setEnrolled(e => [...e, id]); };
  const removeStudent = (id: string) => setEnrolled(e => e.filter(x => x !== id));

  const handleSave = async () => {
    setSaving(true);
    try {
      await principalAPI.assignStudents(classroom._id, enrolled);
      toast.success('Student roster saved');
      onSaved();
      onClose();
    } catch {
      toast.error('Failed to save roster');
    } finally {
      setSaving(false);
    }
  };

  const fillPct = Math.min((enrolled.length / cap) * 100, 100);
  const barColor = fillPct >= 100 ? 'from-rose-500 to-red-600'
    : fillPct >= 80  ? 'from-amber-500 to-orange-500'
    : 'from-emerald-500 to-teal-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: -12, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -8, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="glass-card overflow-hidden"
    >
      <div className="glow-line-top" style={{ background: 'linear-gradient(90deg, transparent, hsl(265 89% 66% / 0.35), transparent)' }} />

      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.05]">
        <div className="flex items-center gap-3">
          <div className="icon-box bg-gradient-to-br from-violet-500/20 to-purple-600/10 border border-violet-500/20 text-violet-400">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-foreground">Manage Students</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{classroom.name}</p>
          </div>
        </div>
        <button onClick={onClose} className="btn-icon"><X className="w-4 h-4" /></button>
      </div>

      {/* Capacity bar */}
      <div className="px-6 py-4 border-b border-white/[0.04]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Capacity</span>
          <span className={cn(
            'text-xs font-bold tabular-nums',
            enrolled.length >= cap ? 'text-rose-400' : enrolled.length >= cap * 0.8 ? 'text-amber-400' : 'text-emerald-400'
          )}>
            {enrolled.length} / {cap} students
          </span>
        </div>
        <div className="h-2 rounded-full bg-white/[0.05] overflow-hidden">
          <motion.div
            animate={{ width: `${fillPct}%` }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`h-full rounded-full bg-gradient-to-r ${barColor}`}
          />
        </div>
        {isFull && (
          <p className="text-[11px] text-rose-400 mt-1.5 font-medium">
            Classroom is at full capacity — remove students to add more.
          </p>
        )}
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-white/[0.04]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50 pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search students by name or email…"
            className="input-field pl-10"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/[0.05] max-h-[420px]">

        {/* ── Enrolled students ───────────────────────────── */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.01] shrink-0">
            <div className="w-2 h-2 rounded-full bg-violet-400" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wide">
              Enrolled
            </span>
            <span className="ml-auto badge badge-violet text-[10px] px-2 py-0.5">
              {enrolledStudents.length}
            </span>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {enrolledStudents.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2 text-center">
                <GraduationCap className="w-7 h-7 text-muted-foreground/20" />
                <p className="text-xs text-muted-foreground">
                  {search ? 'No enrolled students match' : 'No students enrolled yet'}
                </p>
              </div>
            ) : enrolledStudents.map(s => (
              <motion.div
                key={s._id}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-violet-500/[0.06] border border-violet-500/10 group"
              >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500/25 to-purple-600/15 border border-violet-500/20 flex items-center justify-center text-violet-300 text-xs font-black shrink-0">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{s.email}</p>
                </div>
                {/* Remove */}
                <button
                  onClick={() => removeStudent(s._id)}
                  title="Remove from classroom"
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* ── Available students ──────────────────────────── */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/[0.04] bg-white/[0.01] shrink-0">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-bold text-foreground uppercase tracking-wide">
              Available
            </span>
            <span className="ml-auto badge badge-success text-[10px] px-2 py-0.5">
              {availableStudents.length}
            </span>
          </div>

          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {availableStudents.length === 0 ? (
              <div className="flex flex-col items-center py-8 gap-2 text-center">
                <Check className="w-7 h-7 text-emerald-400/30" />
                <p className="text-xs text-muted-foreground">
                  {search ? 'No available students match' : 'All school students are enrolled'}
                </p>
              </div>
            ) : availableStudents.map(s => (
              <motion.div
                key={s._id}
                layout
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
                className={cn(
                  'flex items-center gap-2.5 px-3 py-2 rounded-xl border group',
                  isFull
                    ? 'bg-white/[0.01] border-white/[0.03] opacity-40 cursor-not-allowed'
                    : 'bg-white/[0.02] border-white/[0.04] hover:bg-emerald-500/[0.05] hover:border-emerald-500/15 cursor-pointer'
                )}
                onClick={() => !isFull && addStudent(s._id)}
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.05] border border-white/[0.06] flex items-center justify-center text-muted-foreground text-xs font-black shrink-0 group-hover:bg-emerald-500/10 group-hover:text-emerald-300 group-hover:border-emerald-500/20 transition-all">
                  {s.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate leading-tight">{s.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{s.email}</p>
                </div>
                {!isFull && (
                  <button
                    onClick={e => { e.stopPropagation(); addStudent(s._id); }}
                    title="Add to classroom"
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-emerald-400 hover:bg-emerald-500/10 transition-all opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.05] bg-white/[0.01]">
        <p className="text-xs text-muted-foreground">
          {enrolled.length !== (classroom.studentIds?.length || 0) && (
            <span className="text-amber-400 font-semibold">Unsaved changes · </span>
          )}
          {enrolled.length} student{enrolled.length !== 1 ? 's' : ''} selected
        </p>
        <div className="flex gap-2.5">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-gradient gap-2 disabled:opacity-60"
          >
            {saving
              ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              : <Check className="w-4 h-4" />}
            {saving ? 'Saving…' : 'Save Roster'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export default function ClassroomsPage() {
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [teachers,   setTeachers]   = useState<User[]>([]);
  const [students,   setStudents]   = useState<User[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [showForm,   setShowForm]   = useState(false);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);

  // Which panel is open
  const [teacherPanel,  setTeacherPanel]  = useState<string | null>(null); // classroomId
  const [studentPanel,  setStudentPanel]  = useState<Classroom | null>(null);
  const [selectedTeacher, setSelectedTeacher] = useState('');
  const [assigningSaving, setAssigningSaving] = useState(false);

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

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await principalAPI.deleteClassroom(id);
      toast.success('Classroom deleted'); load();
    } catch { toast.error('Failed to delete classroom'); }
  };

  const handleAssignTeacher = async () => {
    if (!teacherPanel || !selectedTeacher) return;
    setAssigningSaving(true);
    try {
      await principalAPI.assignTeacher(teacherPanel, selectedTeacher);
      toast.success('Teacher assigned'); setTeacherPanel(null); load();
    } catch { toast.error('Failed to assign teacher'); }
    finally { setAssigningSaving(false); }
  };

  const openTeacherPanel = (classroomId: string) => {
    setStudentPanel(null);
    setTeacherPanel(classroomId);
    setSelectedTeacher('');
  };

  const openStudentPanel = (classroom: Classroom) => {
    setTeacherPanel(null);
    setStudentPanel(classroom);
  };

  return (
    <SMSLayout allowedRoles={['principal']}>
      <div className="space-y-5 max-w-5xl mx-auto">

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h1 className="section-header">Classrooms</h1>
            <p className="section-subheader">
              {loading ? 'Loading…' : `${classrooms.length} classroom${classrooms.length !== 1 ? 's' : ''} managed`}
            </p>
          </div>
          <button onClick={() => { setShowForm(s => !s); setTeacherPanel(null); setStudentPanel(null); }} className="btn-gradient gap-2">
            <Plus className="w-4 h-4" /> New Classroom
          </button>
        </motion.div>

        {/* ── Create classroom form ── */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card p-6"
            >
              <div className="glow-line-top" />
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-foreground">Create Classroom</h3>
                <button onClick={() => { setShowForm(false); setForm(EMPTY_FORM); }} className="btn-icon">
                  <X className="w-4 h-4" />
                </button>
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
                  <input type="number" dir="ltr" min="1" max="100" value={form.capacity} onChange={e => setForm(f => ({ ...f, capacity: e.target.value }))} className="input-field" />
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

        {/* ── Assign teacher panel ── */}
        <AnimatePresence>
          {teacherPanel && (
            <motion.div
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
              className="glass-card p-6"
            >
              <div className="glow-line-top" style={{ background: 'linear-gradient(90deg, transparent, hsl(160 84% 39% / 0.3), transparent)' }} />
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="icon-box bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    <UserCircle className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-foreground">Assign Homeroom Teacher</h3>
                </div>
                <button onClick={() => setTeacherPanel(null)} className="btn-icon"><X className="w-4 h-4" /></button>
              </div>
              <div className="mb-5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">Select Teacher</label>
                <select value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} className="input-field appearance-none">
                  <option value="">Choose a teacher…</option>
                  {teachers.map(t => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
                {teachers.length === 0 && (
                  <p className="text-xs text-amber-400 mt-1.5">No active teachers found. Ask the school admin to add teachers.</p>
                )}
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAssignTeacher}
                  disabled={!selectedTeacher || assigningSaving}
                  className="btn-gradient gap-2 disabled:opacity-60"
                >
                  {assigningSaving
                    ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <UserCircle className="w-4 h-4" />}
                  {assigningSaving ? 'Assigning…' : 'Assign Teacher'}
                </button>
                <button onClick={() => setTeacherPanel(null)} className="btn-ghost">Cancel</button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Student manager panel ── */}
        <AnimatePresence>
          {studentPanel && (
            <StudentManagerPanel
              classroom={studentPanel}
              allStudents={students}
              onClose={() => setStudentPanel(null)}
              onSaved={load}
            />
          )}
        </AnimatePresence>

        {/* ── Classroom cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card p-5 space-y-3">
                <div className="glow-line-top" />
                <div className="skeleton h-5 w-1/3 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-3 w-2/3 rounded mt-1" />
                <div className="skeleton h-1.5 w-full rounded-full mt-2" />
              </div>
            ))
          ) : classrooms.length === 0 ? (
            <div className="col-span-2 glass-card p-16 text-center">
              <div className="glow-line-top" />
              <div className="icon-box-lg bg-sky-500/5 border border-sky-500/10 mx-auto mb-4">
                <BookOpen className="w-6 h-6 text-sky-400/40" />
              </div>
              <p className="text-sm font-semibold text-foreground mb-1">No classrooms yet</p>
              <p className="text-xs text-muted-foreground mb-4">Create your first classroom to start assigning teachers and students.</p>
              <button onClick={() => setShowForm(true)} className="btn-gradient gap-2">
                <Plus className="w-4 h-4" /> Create First Classroom
              </button>
            </div>
          ) : (
            classrooms.map((c, i) => {
              const teacher   = teachers.find(t => t._id === c.teacherId);
              const enrolled  = c.studentIds?.length || 0;
              const fillPct   = Math.min((enrolled / (c.capacity || 1)) * 100, 100);
              const isActive  = studentPanel?._id === c._id;

              return (
                <motion.div
                  key={c._id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}
                  className={cn('glass-card-hover p-5', isActive && 'border-violet-500/25 shadow-violet-500/10')}
                >
                  <div className="glow-line-top" />

                  {/* Card header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="min-w-0">
                      <h3 className="font-bold text-foreground truncate">{c.name}</h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {c.gradeLevel} · Capacity {c.capacity}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(c._id, c.name)}
                      className="btn-icon hover:bg-rose-500/10 hover:text-rose-400 hover:border-rose-500/20 ml-2 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Teacher row */}
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <BookOpen className="w-3.5 h-3.5" /> Teacher
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate max-w-[120px]">
                        {teacher ? teacher.name : <span className="text-amber-400 text-xs font-semibold">Unassigned</span>}
                      </span>
                      <button
                        onClick={() => openTeacherPanel(c._id)}
                        className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors shrink-0"
                      >
                        {teacher ? 'Change' : 'Assign'}
                      </button>
                    </div>
                  </div>

                  {/* Students row */}
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground flex items-center gap-1.5 text-xs">
                      <Users className="w-3.5 h-3.5" /> Students
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'text-sm font-bold tabular-nums',
                        fillPct >= 100 ? 'text-rose-400' : fillPct >= 80 ? 'text-amber-400' : 'text-foreground'
                      )}>
                        {enrolled}
                        <span className="text-muted-foreground font-normal text-xs ml-1">/ {c.capacity}</span>
                      </span>
                      <button
                        onClick={() => openStudentPanel(c)}
                        className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors shrink-0"
                      >
                        Manage
                      </button>
                    </div>
                  </div>

                  {/* Capacity bar */}
                  <div className="h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        fillPct >= 100 ? 'bg-gradient-to-r from-rose-500 to-red-600'
                          : fillPct >= 80 ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                          : 'bg-gradient-to-r from-primary to-violet-500'
                      )}
                      style={{ width: `${fillPct}%` }}
                    />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </SMSLayout>
  );
}
