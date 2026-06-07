'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, Users, AlertTriangle } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import StatsCard from '@/components/sms/StatsCard';
import { principalAPI } from '@/services/api';

export default function PrincipalDashboard() {
  const [stats, setStats] = useState({ classrooms: 0, subjects: 0, teachers: 0, unassigned: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    principalAPI.getDashboard().then(r => setStats(r.data.data.stats)).finally(() => setLoading(false));
  }, []);

  return (
    <SMSLayout allowedRoles={['principal']}>
      <div className="space-y-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
          <h1 className="text-2xl font-extrabold text-foreground">Principal Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage classrooms, schedules and subjects</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Classrooms" value={loading ? '...' : stats.classrooms} icon={Home} color="text-blue-400" delay={0} />
          <StatsCard label="Subjects" value={loading ? '...' : stats.subjects} icon={BookOpen} color="text-emerald-400" delay={0.05} />
          <StatsCard label="Teachers" value={loading ? '...' : stats.teachers} icon={Users} color="text-violet-400" delay={0.1} />
          <StatsCard label="Unassigned" value={loading ? '...' : stats.unassigned} icon={AlertTriangle} color="text-amber-400" delay={0.15} sub="Classrooms without teacher" />
        </div>
      </div>
    </SMSLayout>
  );
}
