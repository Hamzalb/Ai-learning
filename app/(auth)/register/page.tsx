'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { BookOpen, User, Mail, Lock, Eye, EyeOff, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const schema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل').max(50),
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'),
  confirmPassword: z.string(),
  role: z.enum(['student', 'teacher'])
}).refine(d => d.password === d.confirmPassword, {
  message: 'كلمتا المرور غير متطابقتين',
  path: ['confirmPassword']
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const [showPass, setShowPass] = useState(false);
  const { register: registerUser, isLoading } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: 'student' }
  });

  const role = watch('role');

  const onSubmit = async (data: FormData) => {
    try {
      await registerUser({ name: data.name, email: data.email, password: data.password, role: data.role });
      toast.success('مرحباً بك في المنصة! 🎉');
      router.push('/dashboard');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'خطأ في إنشاء الحساب';
      toast.error(msg);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6" dir="rtl">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        <div className="glass-card p-8">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">إنشاء حساب جديد</h1>
                <p className="text-muted-foreground text-sm">انضم لمنصة التعلم الذكية</p>
              </div>
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Role selector */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'student', label: 'طالب', icon: '🎓' },
                { value: 'teacher', label: 'أستاذ', icon: '📚' }
              ].map(r => (
                <button
                  key={r.value}
                  type="button"
                  onClick={() => setValue('role', r.value as 'student' | 'teacher')}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all',
                    role === r.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border text-muted-foreground hover:border-border/80'
                  )}
                >
                  <span className="text-2xl">{r.icon}</span>
                  <span className="font-medium text-sm">{r.label}</span>
                </button>
              ))}
            </div>

            <Input
              {...register('name')}
              label="الاسم الكامل"
              placeholder="أدخل اسمك"
              error={errors.name?.message}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              {...register('email')}
              type="email"
              label="البريد الإلكتروني"
              placeholder="example@email.com"
              error={errors.email?.message}
              leftIcon={<Mail className="w-4 h-4" />}
              dir="ltr"
            />

            <Input
              {...register('password')}
              type={showPass ? 'text' : 'password'}
              label="كلمة المرور"
              placeholder="••••••••"
              error={errors.password?.message}
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-muted-foreground hover:text-foreground transition-colors">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              }
            />

            <Input
              {...register('confirmPassword')}
              type={showPass ? 'text' : 'password'}
              label="تأكيد كلمة المرور"
              placeholder="••••••••"
              error={errors.confirmPassword?.message}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              <GraduationCap className="w-5 h-5" />
              إنشاء الحساب مجاناً
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              لديك حساب بالفعل؟{' '}
              <Link href="/login" className="text-primary hover:underline font-medium">
                تسجيل الدخول
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
