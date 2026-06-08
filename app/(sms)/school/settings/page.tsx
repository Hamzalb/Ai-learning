'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Building2, Mail, Phone, Calendar, Link, MapPin } from 'lucide-react';
import SMSLayout from '@/components/sms/SMSLayout';
import { schoolAPI } from '@/services/api';
import toast from 'react-hot-toast';

interface SchoolProfile {
  name: string;
  address: string;
  contactEmail: string;
  phone: string;
  academicYear: string;
  logo: string;
}

const FIELDS: { label: string; key: keyof SchoolProfile; type: string; placeholder: string; icon: React.ElementType; ltr?: boolean }[] = [
  { label: 'School Name',    key: 'name',         type: 'text',  placeholder: 'e.g. Beirut International Academy', icon: Building2 },
  { label: 'Address',        key: 'address',      type: 'text',  placeholder: 'Street, City, Country',             icon: MapPin },
  { label: 'Contact Email',  key: 'contactEmail', type: 'email', placeholder: 'contact@school.com',                icon: Mail,     ltr: true },
  { label: 'Phone Number',   key: 'phone',        type: 'tel',   placeholder: '+961 1 234 567',                    icon: Phone,    ltr: true },
  { label: 'Academic Year',  key: 'academicYear', type: 'text',  placeholder: '2025–2026',                         icon: Calendar },
  { label: 'Logo URL',       key: 'logo',         type: 'url',   placeholder: 'https://...',                       icon: Link,     ltr: true },
];

export default function SchoolSettingsPage() {
  const [form,    setForm]    = useState<SchoolProfile>({ name: '', address: '', contactEmail: '', phone: '', academicYear: '', logo: '' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

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

  return (
    <SMSLayout allowedRoles={['school']}>
      <div className="space-y-6 max-w-2xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ type: 'spring', stiffness: 280, damping: 24 }}>
          <h1 className="section-header">School Settings</h1>
          <p className="section-subheader">Update your school profile and information</p>
        </motion.div>

        {loading ? (
          <div className="glass-card p-6 space-y-4">
            <div className="glow-line-top" />
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-1.5">
                <div className="skeleton h-3 w-28 rounded" />
                <div className="skeleton h-11 w-full rounded-xl" />
              </div>
            ))}
          </div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08, type: 'spring', stiffness: 260, damping: 24 }}
            className="glass-card p-6 space-y-4">
            <div className="glow-line-top" />
            <h2 className="text-sm font-bold text-foreground mb-2">School Information</h2>
            {FIELDS.map(({ label, key, type, placeholder, icon: Icon, ltr }) => (
              <div key={key}>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">{label}</label>
                <div className="relative">
                  <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60 pointer-events-none" />
                  <input
                    type={type}
                    dir={ltr ? 'ltr' : undefined}
                    value={form[key]}
                    placeholder={placeholder}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="input-field pl-10"
                  />
                </div>
              </div>
            ))}
            <div className="pt-2">
              <button onClick={handleSave} disabled={saving} className="btn-gradient gap-2 disabled:opacity-60">
                {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </SMSLayout>
  );
}
