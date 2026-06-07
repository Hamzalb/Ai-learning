'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import {
  LogIn, Eye, EyeOff, GraduationCap, AlertCircle,
  Building2, Users, BookOpen, BarChart3, Sparkles
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

const schema = z.object({
  email:      z.string().email('Enter a valid email'),
  password:   z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});
type FormData = z.infer<typeof schema>;

/* ── Floating stat badge ─────────────────────────────── */
function FloatBadge({
  icon: Icon, label, value, delay, className
}: {
  icon: React.ElementType; label: string; value: string;
  delay: number; className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 200, damping: 20, delay }}
      className={cn(
        'absolute flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl',
        'bg-white/[0.06] backdrop-blur-xl border border-white/[0.10]',
        'shadow-xl shadow-black/20',
        'animate-float',
        className,
      )}
      style={{ animationDelay: `${delay * 300}ms` }}
    >
      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-white" />
      </div>
      <div>
        <p className="text-[10px] font-semibold text-white/50 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-black text-white leading-none">{value}</p>
      </div>
    </motion.div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setError('');
    try {
      const redirect = await login(data.email, data.password, data.rememberMe);
      router.push(redirect);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Invalid credentials. Please try again.';
      setError(msg);
    }
  };

  /* 3D tilt on the card */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 120, damping: 18 });
  const sy = useSpring(my, { stiffness: 120, damping: 18 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [4, -4]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-4, 4]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mx.set(0); my.set(0); };

  return (
    <div className="min-h-dvh flex overflow-hidden bg-background">

      {/* ═══════════════════════════════════════════════════
          LEFT PANEL — Brand Art
      ═══════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden items-center justify-center">

        {/* Background */}
        <div className="absolute inset-0"
          style={{
            background: `
              radial-gradient(ellipse 80% 70% at 30% 30%, hsl(239 84% 67% / 0.18) 0%, transparent 60%),
              radial-gradient(ellipse 60% 80% at 80% 70%, hsl(265 89% 66% / 0.14) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 60% 10%, hsl(186 94% 42% / 0.10) 0%, transparent 60%),
              hsl(240 42% 4%)
            `
          }}
        />

        {/* Grid */}
        <div className="absolute inset-0 grid-pattern opacity-30" />

        {/* Ambient orbs */}
        <div className="absolute top-[15%] left-[20%] w-64 h-64 rounded-full bg-indigo-500/8 blur-3xl animate-float-orb" />
        <div className="absolute bottom-[20%] right-[10%] w-80 h-80 rounded-full bg-violet-500/8 blur-3xl animate-float-orb"
          style={{ animationDelay: '3s' }} />
        <div className="absolute top-[50%] left-[50%] w-48 h-48 rounded-full bg-cyan-500/6 blur-3xl animate-float-orb"
          style={{ animationDelay: '6s' }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-lg">

          {/* Logo icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotateY: -30 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ type: 'spring', stiffness: 180, damping: 20, delay: 0.1 }}
            className="mb-8"
          >
            <div className="relative w-24 h-24 mx-auto">
              {/* Glow rings */}
              <div className="absolute inset-0 rounded-3xl bg-indigo-500/20 blur-xl animate-pulse-glow" />
              <div className="absolute inset-0 rounded-3xl bg-violet-500/10 blur-2xl animate-pulse-glow"
                style={{ animationDelay: '0.5s' }} />
              {/* Icon box */}
              <div className="relative w-full h-full rounded-3xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
                <GraduationCap className="w-12 h-12 text-white drop-shadow-lg" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22, delay: 0.2 }}
          >
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-bold uppercase tracking-widest text-violet-400">
                EduFlow Portal
              </span>
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <h1 className="text-4xl font-black text-foreground leading-tight mb-4">
              Empowering{' '}
              <span className="gradient-text">Education</span>{' '}
              in Lebanon
            </h1>
            <p className="text-base text-muted-foreground leading-relaxed max-w-xs mx-auto">
              A unified management platform for schools, teachers, and students — built for the future.
            </p>
          </motion.div>

          {/* Floating stat badges */}
          <div className="relative w-full h-48 mt-12">
            <FloatBadge
              icon={Building2} label="Schools" value="24+"
              delay={0.4} className="left-0 top-0"
            />
            <FloatBadge
              icon={Users} label="Students" value="3,200+"
              delay={0.55} className="right-0 top-4"
            />
            <FloatBadge
              icon={BookOpen} label="Teachers" value="180+"
              delay={0.7} className="left-8 bottom-0"
            />
            <FloatBadge
              icon={BarChart3} label="Avg. Grade" value="87%"
              delay={0.85} className="right-4 bottom-4"
            />
          </div>
        </div>

        {/* Right edge fade */}
        <div className="absolute right-0 inset-y-0 w-24 bg-gradient-to-r from-transparent to-background pointer-events-none" />
      </div>

      {/* ═══════════════════════════════════════════════════
          RIGHT PANEL — Login Form
      ═══════════════════════════════════════════════════ */}
      <div className="flex-1 flex items-center justify-center relative overflow-hidden px-6 py-12">

        {/* Mobile background */}
        <div className="absolute inset-0 aurora-bg lg:hidden" />
        <div className="absolute inset-0 grid-pattern opacity-20 lg:hidden" />

        <motion.div
          initial={{ opacity: 0, x: 30, scale: 0.97 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 240, damping: 24, delay: 0.15 }}
          className="w-full max-w-md relative z-10"
          style={{ perspective: 1000 }}
        >
          <motion.div
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
            className="relative glass-card gradient-border overflow-visible"
          >
            {/* Top glow line */}
            <div className="glow-line-top" />

            {/* Inner gradient shimmer */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.025] via-transparent to-transparent pointer-events-none rounded-2xl" />

            <div className="p-8 relative z-10">

              {/* Logo */}
              <div className="flex items-center gap-3.5 mb-8">
                <div
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/30"
                  style={{ transform: 'translateZ(16px)' }}
                >
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <div style={{ transform: 'translateZ(8px)' }}>
                  <h1 className="text-lg font-bold text-foreground leading-tight">EduFlow</h1>
                  <p className="text-[11px] text-muted-foreground font-medium">School Management Portal</p>
                </div>
              </div>

              <div style={{ transform: 'translateZ(4px)' }}>
                <h2 className="text-2xl font-extrabold text-foreground tracking-tight mb-1">
                  Welcome back
                </h2>
                <p className="text-sm text-muted-foreground mb-7">
                  Sign in with your school credentials
                </p>
              </div>

              {/* Error alert */}
              <AnimatePresenceWrapper show={!!error}>
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-rose-500/8 border border-rose-500/20 text-rose-400 text-sm mb-5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              </AnimatePresenceWrapper>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <Input
                  {...register('email')}
                  type="email"
                  label="Email address"
                  placeholder="you@school.com"
                  error={errors.email?.message}
                  dir="ltr"
                  autoComplete="email"
                />

                <div className="relative">
                  <Input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    label="Password"
                    placeholder="••••••••"
                    error={errors.password?.message}
                    dir="ltr"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-[34px] p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword
                      ? <EyeOff className="w-4 h-4" />
                      : <Eye    className="w-4 h-4" />}
                  </button>
                </div>

                {/* Remember me */}
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    {...register('rememberMe')}
                    type="checkbox"
                    className="w-4 h-4 rounded accent-indigo-500"
                  />
                  <span className="text-sm text-muted-foreground">
                    Remember me for 30 days
                  </span>
                </label>

                {/* Submit */}
                <Button
                  type="submit"
                  isLoading={isLoading}
                  className="w-full btn-gradient h-11 text-sm font-bold gap-2.5 mt-2"
                >
                  <LogIn className="w-4 h-4" />
                  Sign In
                </Button>
              </form>

              <p className="mt-7 text-xs text-center text-muted-foreground">
                No account?{' '}
                <span className="text-indigo-400 font-medium">
                  Contact your school administrator
                </span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}

/* Local helper to avoid importing framer-motion AnimatePresence in the middle */
function AnimatePresenceWrapper({ show, children }: { show: boolean; children: React.ReactNode }) {
  if (!show) return null;
  return (
    <motion.div
      initial={{ opacity: 0, height: 0, marginBottom: 0 }}
      animate={{ opacity: 1, height: 'auto', marginBottom: 20 }}
      exit={{ opacity: 0, height: 0, marginBottom: 0 }}
      transition={{ duration: 0.22 }}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}
