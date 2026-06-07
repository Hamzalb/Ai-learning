'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Users, UserCheck, Home, Plus, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import SMSLayout from '@/components/sms/SMSLayout';
import StatsCard from '@/components/sms/StatsCard';
import { schoolAPI } from '@/services/api';

export default function SchoolDashboard() {
  const [stats, setStats] = useState({ teachers: 0, students: 0, principals: 0, classrooms: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    schoolAPI.getDashboard().then(r => setStats(r.data.data.stats)).finally(() => setLoading(false));
  }, []);

  return (
    <SMSLayout allowedRoles={['school']}>
      <div className="space-y-6 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 24 }}>
          <h1 className="text-2xl font-extrabold text-foreground">School Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Manage your school staff and students</p>
        </motion.div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard label="Teachers" value={loading ? '...' : stats.teachers} icon={BookOpen} color="text-emerald-400" delay={0} />
          <StatsCard label="Students" value={loading ? '...' : stats.students} icon={Users} color="text-violet-400" delay={0.05} />
          <StatsCard label="Principals" value={loading ? '...' : stats.principals} icon={UserCheck} color="text-amber-400" delay={0.1} />
          <StatsCard label="Classrooms" value={loading ? '...' : stats.classrooms} icon={Home} color="text-blue-400" delay={0.15} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: 'Add Teacher', href: '/school/teachers', icon: BookOpen, color: 'from-emerald-500 to-teal-500' },
            { label: 'Add Student', href: '/school/students', icon: Users, color: 'from-violet-500 to-purple-600' },
            { label: 'View Classrooms', href: '/principal/classrooms', icon: Home, color: 'from-blue-500 to-cyan-500' }
          ].map((action, i) => (
            <motion.div key={action.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.05, type: 'spring', stiffness: 280, damping: 24 }}>
              <Link href={action.href} className="glass-card-hover p-5 flex items-center gap-4 group">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shrink-0 shadow-lg`}>
                  <action.icon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Quick action</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </SMSLayout>
  );
}
