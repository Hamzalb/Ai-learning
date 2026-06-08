'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users, ArrowLeft, GraduationCap, Mail } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { teacherAPI } from '@/services/api';

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive?: boolean;
}

interface RosterData {
  classroom: { name: string; gradeLevel: string; capacity: number };
  students: Student[];
}

export default function ClassRosterPage() {
  const { id }    = useParams<{ id: string }>();
  const router    = useRouter();
  const [data,    setData]    = useState<RosterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    teacherAPI.getClassRoster(id)
      .then(r => setData(r.data.data))
      .finally(() => setLoading(false));
  }, [id]);

  const students = data?.students ?? [];

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-5 max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 24 }}
          className="flex items-center justify-between flex-wrap gap-4"
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="btn-icon"
              aria-label="Go back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="section-header">
                {loading ? 'Loading…' : data?.classroom.name ?? 'Class Roster'}
              </h1>
              <p className="section-subheader">
                {loading ? '' : `${data?.classroom.gradeLevel} · ${students.length} student${students.length !== 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {!loading && data && (
            <div className="badge badge-info gap-1.5">
              <Users className="w-3 h-3" />
              {students.length} / {data.classroom.capacity} capacity
            </div>
          )}
        </motion.div>

        {/* Skeleton */}
        {loading ? (
          <div className="glass-card overflow-hidden">
            <div className="glow-line-top" />
            <div className="divide-y divide-white/[0.03]">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <div className="skeleton w-10 h-10 rounded-xl shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="skeleton h-4 w-2/5 rounded" />
                    <div className="skeleton h-3 w-1/3 rounded" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : students.length === 0 ? (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 24 }}
            className="glass-card p-16 text-center"
          >
            <div className="glow-line-top" />
            <div className="icon-box-lg bg-violet-500/5 border border-violet-500/10 mx-auto mb-4">
              <GraduationCap className="w-6 h-6 text-violet-400/40" />
            </div>
            <p className="text-sm font-semibold text-foreground mb-1">No students enrolled</p>
            <p className="text-xs text-muted-foreground">The principal needs to assign students to this classroom.</p>
          </motion.div>
        ) : (
          /* Student list */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 24 }}
            className="glass-card overflow-hidden"
          >
            <div className="glow-line-top" />
            <div className="divide-y divide-white/[0.03]">
              {students.map((student, i) => (
                <motion.div
                  key={student._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04, type: 'spring', stiffness: 280, damping: 24 }}
                  className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors"
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-600/10 border border-violet-500/20 flex items-center justify-center shrink-0 text-violet-400 font-black">
                    {student.name.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">{student.name}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 text-xs text-muted-foreground">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{student.email}</span>
                    </div>
                  </div>

                  {/* Status dot */}
                  <div className={`w-2 h-2 rounded-full shrink-0 ${student.isActive !== false ? 'bg-emerald-400' : 'bg-rose-400'}`} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </SMSLayout>
  );
}
