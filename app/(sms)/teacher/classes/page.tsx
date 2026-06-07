'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import SMSLayout from '@/components/sms/SMSLayout';
import { teacherAPI } from '@/services/api';

interface ClassWithCount {
  _id: string;
  name: string;
  gradeLevel: string;
  studentCount: number;
  capacity: number;
}

export default function TeacherClassesPage() {
  const [classes, setClasses] = useState<ClassWithCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    teacherAPI.getClasses().then(r => setClasses(r.data.data.classrooms)).finally(() => setLoading(false));
  }, []);

  return (
    <SMSLayout allowedRoles={['teacher']}>
      <div className="space-y-5 max-w-4xl">
        <div>
          <h1 className="text-2xl font-extrabold text-foreground">My Classes</h1>
          <p className="text-sm text-muted-foreground">{classes.length} classrooms assigned to you</p>
        </div>

        {loading ? <p className="text-muted-foreground text-center py-12">Loading...</p>
          : classes.length === 0 ? (
            <div className="glass-card p-12 text-center">
              <Users className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">No classes assigned yet. Contact your school principal.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {classes.map((c, i) => (
                <motion.div key={c._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <div className="glass-card-hover p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-foreground text-lg">{c.name}</h3>
                        <p className="text-xs text-muted-foreground mt-0.5">{c.gradeLevel}</p>
                      </div>
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <Users className="w-6 h-6 text-primary" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="text-2xl font-extrabold text-foreground tabular-nums">{c.studentCount}</span>
                        <span className="text-muted-foreground ml-1">/ {c.capacity} students</span>
                      </div>
                      <Link href={`/teacher/classes/${c._id}`} className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                        View Roster <ChevronRight className="w-3 h-3" />
                      </Link>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-white/[0.04] overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-500 transition-all" style={{ width: `${Math.min((c.studentCount / c.capacity) * 100, 100)}%` }} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
      </div>
    </SMSLayout>
  );
}
