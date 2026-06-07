'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Lock, Palette, Globe, Bell, Save, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">الإعدادات</h1>
          <p className="text-muted-foreground mt-1">إدارة حسابك وتفضيلاتك</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-blue-400" />
                  المعلومات الشخصية
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar */}
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-3xl font-bold text-white">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{user?.name}</p>
                    <p className="text-muted-foreground text-sm">{user?.email}</p>
                    <span className="inline-block mt-1 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
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
                    className="opacity-60"
                    dir="ltr"
                  />
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
                      <p className="text-2xl font-bold text-foreground">{user?.stats?.totalQuizzes || 0}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">اختبار</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
                      <p className="text-2xl font-bold text-foreground">{user?.xp || 0}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">نقاط XP</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-secondary/50">
                      <p className="text-2xl font-bold text-foreground">{user?.streak || 0}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">يوم متتالي</p>
                    </div>
                  </div>
                  <Button type="submit" isLoading={savingProfile} className="gap-2">
                    <Save className="w-4 h-4" />
                    حفظ التغييرات
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-red-400" />
                  تغيير كلمة المرور
                </CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-400" />
                  تخصيص التجربة
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="text-sm font-medium text-foreground block mb-3">
                    <Globe className="w-4 h-4 inline ml-1" />
                    لغة الذكاء الاصطناعي
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'arabic', label: 'عربي فصيح', emoji: '🇸🇦' },
                      { value: 'lebanese', label: 'عامية لبنانية', emoji: '🇱🇧' },
                      { value: 'english', label: 'English', emoji: '🇬🇧' }
                    ].map(l => (
                      <button
                        key={l.value}
                        onClick={() => setPrefs(p => ({ ...p, language: l.value as 'arabic' | 'lebanese' | 'english' }))}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                          prefs.language === l.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-border/70'
                        )}
                      >
                        <span className="text-2xl">{l.emoji}</span>
                        <span className="text-xs font-medium">{l.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground block mb-3">مستوى التعلم</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'beginner', label: 'مبتدئ', emoji: '🌱' },
                      { value: 'intermediate', label: 'متوسط', emoji: '📚' },
                      { value: 'advanced', label: 'متقدم', emoji: '🚀' }
                    ].map(d => (
                      <button
                        key={d.value}
                        onClick={() => setPrefs(p => ({ ...p, difficulty: d.value as 'beginner' | 'intermediate' | 'advanced' }))}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                          prefs.difficulty === d.value
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border text-muted-foreground hover:border-border/70'
                        )}
                      >
                        <span className="text-2xl">{d.emoji}</span>
                        <span className="text-xs font-medium">{d.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Button onClick={onSavePreferences} isLoading={savingPrefs} className="gap-2">
                  <Save className="w-4 h-4" />
                  حفظ التفضيلات
                </Button>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
