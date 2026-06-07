'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { BookOpen, Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuthStore } from '@/store/authStore';

const schema = z.object({
  email: z.string().email('البريد الإلكتروني غير صحيح'),
  password: z.string().min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  const onSubmit = async (data: FormData) => {
    try {
      await login(data.email, data.password);
      toast.success('أهلاً بعودتك! 👋');
      router.push('/dashboard');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'خطأ في تسجيل الدخول';
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
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">أهلاً بعودتك</h1>
                <p className="text-muted-foreground text-sm">سجّل دخولك للمتابعة</p>
              </div>
            </Link>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <Input
              {...register('email')}
              type="email"
              label="البريد الإلكتروني"
              placeholder="example@email.com"
              error={errors.email?.message}
              leftIcon={<Mail className="w-4 h-4" />}
              dir="ltr"
            />

            <div>
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
              <Link href="#" className="text-xs text-primary hover:underline mt-1 inline-block">
                نسيت كلمة المرور؟
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
              تسجيل الدخول
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-muted-foreground text-sm">
              ليس لديك حساب؟{' '}
              <Link href="/register" className="text-primary hover:underline font-medium">
                إنشاء حساب جديد
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
