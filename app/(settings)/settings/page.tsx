'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Lock, Palette, Globe, Save, Shield, Sprout, BookOpen, Rocket } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { authAPI } from '@/services/api';
import { cn } from '@/lib/utils';

const profileSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل')
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'أدخل كلمة المرور الحالية'),
  newPassword: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string()
}).refine(d => d.newPassword === d.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword']
});

type ProfileData = z.infer<typeof profileSchema>;
type PasswordData = z.infer<typeof passwordSchema>;

const TABS = [
  { id: 'profile', label: 'الحساب', icon: User },
  { id: 'security', label: 'الأمان', icon: Shield },
  { id: 'preferences', label: 'التفضيلات', icon: Palette }
];

export default function SettingsPage() {
  const { user, updateUser } = useAuthStore();
  const [activeTab, setActiveTab] = useState('profile');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);

  const [prefs, setPrefs] = useState({
    language: user?.preferences?.language || 'arabic',
    theme: user?.preferences?.theme || 'dark',
    difficulty: user?.preferences?.difficulty || 'beginner'
  });

  const { register: regProfile, handleSubmit: handleProfile, reset: resetProfile, formState: { errors: profileErrors } } =
    useForm<ProfileData>({ resolver: zodResolver(profileSchema), defaultValues: { name: '' } });

  useEffect(() => {
    if (user) resetProfile({ name: user.name || '' });
  }, [user, resetProfile]);

  const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword, formState: { errors: passwordErrors } } =
    useForm<PasswordData>({ resolver: zodResolver(passwordSchema) });

  const onSaveProfile = async (data: ProfileData) => {
    setSavingProfile(true);
    try {
      const res = await authAPI.updateProfile({ name: data.name });
      updateUser(res.data.data.user);
      toast.success('تم تحديث الملف الشخصي');
    } catch {
      toast.error('فشل تحديث الملف الشخصي');
    } finally {
      setSavingProfile(false);
    }
  };

  const onSavePassword = async (data: PasswordData) => {
    setSavingPassword(true);
    try {
      await authAPI.changePassword({ currentPassword: data.currentPassword, newPassword: data.newPassword });
      resetPassword();
      toast.success('تم تغيير كلمة المرور بنجاح');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'فشل تغيير كلمة المرور';
      toast.error(msg);
    } finally {
      setSavingPassword(false);
    }
  };

  const onSavePreferences = async () => {
    setSavingPrefs(true);
    try {
      const res = await authAPI.updateProfile({ preferences: prefs });
      updateUser(res.data.data.user);
      toast.success('تم حفظ التفضيلات');
    } catch {
      toast.error('فشل حفظ التفضيلات');
    } finally {
      setSavingPrefs(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 max-w-3xl mx-auto space-y-8" dir="rtl">
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          <h1 className="text-3xl font-extrabold text-foreground tracking-tight">الإعدادات</h1>
          <p className="text-muted-foreground mt-1 text-sm">إدارة حسابك وتفضيلاتك</p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.04]">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'relative flex items-center gap-2 px-5 py-2.5 text-sm font-medium transition-all rounded-lg flex-1 justify-center',
                activeTab === tab.id
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {activeTab === tab.id && (
                <motion.div
                  layoutId="settings-tab"
                  className="absolute inset-0 bg-white/[0.06] rounded-lg border border-white/[0.06]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
              <tab.icon className="w-4 h-4 relative z-10" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 24 }}
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="glass-card overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-400" />
                  </div>
                  <h3 className="font-bold text-foreground">المعلومات الشخصية</h3>
                </div>

                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 via-violet-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-violet-500/20">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground text-lg">{user?.name}</p>
                      <p className="text-muted-foreground text-sm">{user?.email}</p>
                      <span className="inline-flex items-center mt-1.5 px-2.5 py-0.5 rounded-full bg-primary/8 text-primary text-xs font-medium border border-primary/15">
                        {user?.role === 'student' ? 'طالب' : user?.role === 'teacher' ? 'أستاذ' : 'مدير'}
                      </span>
                    </div>
                  </div>

                  <form onSubmit={handleProfile(onSaveProfile)} className="space-y-4">
                    <Input
                      {...regProfile('name')}
                      label="الاسم الكامل"
                      error={profileErrors.name?.message}
                    />
                    <Input
                      label="البريد الإلكتروني"
                      value={user?.email || ''}
                      disabled
                      className="opacity-50"
                      dir="ltr"
                    />
                    <div className="grid grid-cols-3 gap-3 pt-2">
                      {[
                        { label: 'اختبار', value: user?.stats?.totalQuizzes || 0 },
                        { label: 'نقاط XP', value: user?.xp || 0 },
                        { label: 'يوم متتالي', value: user?.streak || 0 }
                      ].map((stat, i) => (
                        <div key={i} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.04]">
                          <p className="text-2xl font-extrabold text-foreground tabular-nums">{stat.value}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                        </div>
                      ))}
                    </div>
                    <Button type="submit" isLoading={savingProfile} className="gap-2 shadow-lg shadow-primary/15">
                      <Save className="w-4 h-4" />
                      حفظ التغييرات
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="glass-card overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/20 to-transparent" />
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-red-400" />
                  </div>
                  <h3 className="font-bold text-foreground">تغيير كلمة المرور</h3>
                </div>

                <form onSubmit={handlePassword(onSavePassword)} className="space-y-4">
                  <Input
                    {...regPassword('currentPassword')}
                    type="password"
                    label="كلمة المرور الحالية"
                    placeholder="••••••••"
                    error={passwordErrors.currentPassword?.message}
                  />
                  <Input
                    {...regPassword('newPassword')}
                    type="password"
                    label="كلمة المرور الجديدة"
                    placeholder="••••••••"
                    error={passwordErrors.newPassword?.message}
                  />
                  <Input
                    {...regPassword('confirmPassword')}
                    type="password"
                    label="تأكيد كلمة المرور الجديدة"
                    placeholder="••••••••"
                    error={passwordErrors.confirmPassword?.message}
                  />
                  <Button type="submit" isLoading={savingPassword} variant="destructive" className="gap-2">
                    <Shield className="w-4 h-4" />
                    تحديث كلمة المرور
                  </Button>
                </form>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <div className="glass-card overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/20 to-transparent" />
              <div className="p-6">
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
                    <Palette className="w-4 h-4 text-violet-400" />
                  </div>
                  <h3 className="font-bold text-foreground">تخصيص التجربة</h3>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="text-sm font-medium text-foreground flex items-center gap-1.5 mb-3">
                      <Globe className="w-4 h-4 text-primary" />
                      لغة الذكاء الاصطناعي
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'arabic', label: 'عربي فصيح', Icon: Globe, gradient: 'from-emerald-500 to-green-400' },
                        { value: 'lebanese', label: 'عامية لبنانية', Icon: Globe, gradient: 'from-blue-500 to-cyan-400' },
                        { value: 'english', label: 'English', Icon: Globe, gradient: 'from-violet-500 to-purple-400' }
                      ].map(l => (
                        <button
                          key={l.value}
                          onClick={() => setPrefs(p => ({ ...p, language: l.value as 'arabic' | 'lebanese' | 'english' }))}
                          className={cn(
                            'flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200',
                            prefs.language === l.value
                              ? 'border-primary/30 bg-primary/8 text-primary'
                              : 'border-white/[0.06] text-muted-foreground hover:border-white/[0.1] hover:bg-white/[0.02]'
                          )}
                        >
                          <div className={cn(
                            'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                            prefs.language === l.value
                              ? `bg-gradient-to-br ${l.gradient} shadow-md`
                              : 'bg-white/[0.04]'
                          )}>
                            <l.Icon className={cn('w-4 h-4', prefs.language === l.value ? 'text-white' : 'text-muted-foreground')} />
                          </div>
                          <span className="text-xs font-medium">{l.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="h-px bg-gradient-to-l from-transparent via-border to-transparent" />

                  <div>
                    <label className="text-sm font-medium text-foreground block mb-3">مستوى التعلم</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 'beginner', label: 'مبتدئ', Icon: Sprout, gradient: 'from-green-500 to-emerald-400' },
                        { value: 'intermediate', label: 'متوسط', Icon: BookOpen, gradient: 'from-blue-500 to-cyan-400' },
                        { value: 'advanced', label: 'متقدم', Icon: Rocket, gradient: 'from-orange-500 to-amber-400' }
                      ].map(d => (
                        <button
                          key={d.value}
                          onClick={() => setPrefs(p => ({ ...p, difficulty: d.value as 'beginner' | 'intermediate' | 'advanced' }))}
                          className={cn(
                            'flex flex-col items-center gap-2.5 p-4 rounded-xl border transition-all duration-200',
                            prefs.difficulty === d.value
                              ? 'border-primary/30 bg-primary/8 text-primary'
                              : 'border-white/[0.06] text-muted-foreground hover:border-white/[0.1] hover:bg-white/[0.02]'
                          )}
                        >
                          <div className={cn(
                            'w-9 h-9 rounded-lg flex items-center justify-center transition-all',
                            prefs.difficulty === d.value
                              ? `bg-gradient-to-br ${d.gradient} shadow-md`
                              : 'bg-white/[0.04]'
                          )}>
                            <d.Icon className={cn('w-4 h-4', prefs.difficulty === d.value ? 'text-white' : 'text-muted-foreground')} />
                          </div>
                          <span className="text-xs font-medium">{d.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button onClick={onSavePreferences} isLoading={savingPrefs} className="gap-2 shadow-lg shadow-primary/15">
                    <Save className="w-4 h-4" />
                    حفظ التفضيلات
                  </Button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
