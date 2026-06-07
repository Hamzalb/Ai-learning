'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Building2 } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { schoolAPI } from '@/services/api';
import { Button } from '@/components/ui/Button';
import toast from 'react-hot-toast';

interface SchoolProfile {
  name: string;
  address: string;
  contactEmail: string;
  phone: string;
  academicYear: string;
  logo: string;
}

export default function SchoolSettingsPage() {
  const [form, setForm] = useState<SchoolProfile>({ name: '', address: '', contactEmail: '', phone: '', academicYear: '', logo: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    schoolAPI.getProfile().then(r => {
      const s = r.data.data.school;
      setForm({ name: s.name || '', address: s.address || '', contactEmail: s.contactEmail || '', phone: s.phone || '', academicYear: s.academicYear || '', logo: s.logo || '' });
    }).finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await schoolAPI.updateProfile(form);
      toast.success('School profile updated');
    } catch { toast.error('Failed to update profile'); }
    finally { setSaving(false); }
  };

  const field = (label: string, key: keyof SchoolProfile, type = 'text', placeholder = '') => (
    <div>
      <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">{label}</label>
      <input type={type} value={form[key]} placeholder={placeholder} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        className="w-full px-3.5 py-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/40" />
    </div>
  );

  return (
    <SMSLayout allowedRoles={['school']}>
      <div className="space-y-6 max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">School Settings</h1>
            <p className="text-sm text-muted-foreground">Update your school profile</p>
          </div>
        </div>

        {loading ? <p className="text-muted-foreground text-center py-12">Loading...</p>
          : (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
              <h2 className="text-sm font-bold text-foreground">School Information</h2>
              {field('School Name', 'name', 'text', 'e.g. Beirut International Academy')}
              {field('Address', 'address', 'text', 'Street, City, Country')}
              {field('Contact Email', 'contactEmail', 'email', 'contact@school.com')}
              {field('Phone Number', 'phone', 'tel', '+961 1 234 567')}
              {field('Academic Year', 'academicYear', 'text', '2025–2026')}
              {field('Logo URL', 'logo', 'url', 'https://...')}

              <div className="pt-2">
                <Button onClick={handleSave} isLoading={saving} className="btn-gradient gap-2">
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </motion.div>
          )}
      </div>
    </SMSLayout>
  );
}
