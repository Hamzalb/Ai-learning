'use client';
import { motion } from 'framer-motion';
import { Shield, Check, X } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';

const PERMISSIONS = [
  { action: 'Create Schools', super_admin: true, school: false, principal: false, teacher: false, student: false },
  { action: 'Create Teachers', super_admin: true, school: true, principal: false, teacher: false, student: false },
  { action: 'Create Students', super_admin: true, school: true, principal: false, teacher: false, student: false },
  { action: 'Create Principals', super_admin: true, school: true, principal: false, teacher: false, student: false },
  { action: 'Manage Classrooms', super_admin: true, school: false, principal: true, teacher: false, student: false },
  { action: 'Manage Subjects', super_admin: true, school: false, principal: true, teacher: false, student: false },
  { action: 'Manage Schedules', super_admin: true, school: false, principal: true, teacher: false, student: false },
  { action: 'Enter Grades', super_admin: true, school: false, principal: false, teacher: true, student: false },
  { action: 'Upload Documents', super_admin: true, school: false, principal: false, teacher: true, student: false },
  { action: 'Create Quizzes', super_admin: true, school: false, principal: false, teacher: true, student: false },
  { action: 'Submit Quiz', super_admin: false, school: false, principal: false, teacher: false, student: true },
  { action: 'View Own Grades', super_admin: true, school: false, principal: false, teacher: false, student: true },
  { action: 'View Documents', super_admin: true, school: false, principal: false, teacher: true, student: true },
  { action: 'View Audit Logs', super_admin: true, school: false, principal: false, teacher: false, student: false }
];

const roles = ['super_admin', 'school', 'principal', 'teacher', 'student'] as const;
const roleLabels: Record<string, string> = { super_admin: 'Super Admin', school: 'School', principal: 'Principal', teacher: 'Teacher', student: 'Student' };

export default function PermissionsPage() {
  return (
    <SMSLayout allowedRoles={['super_admin']}>
      <div className="space-y-5 max-w-5xl">
        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-extrabold text-foreground">Role Permission Matrix</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of what each role can do in the system</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Action</th>
                  {roles.map(r => (
                    <th key={r} className="px-5 py-4 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">{roleLabels[r]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS.map((perm, i) => (
                  <motion.tr key={perm.action} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3.5 font-medium text-foreground">{perm.action}</td>
                    {roles.map(r => (
                      <td key={r} className="px-5 py-3.5 text-center">
                        {perm[r]
                          ? <div className="inline-flex w-6 h-6 rounded-full bg-emerald-500/15 border border-emerald-500/30 items-center justify-center"><Check className="w-3 h-3 text-emerald-400" /></div>
                          : <div className="inline-flex w-6 h-6 rounded-full bg-red-500/10 border border-red-500/20 items-center justify-center"><X className="w-3 h-3 text-red-400/60" /></div>
                        }
                      </td>
                    ))}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </SMSLayout>
  );
}
