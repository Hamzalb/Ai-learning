'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  /** Tailwind text color class e.g. "text-blue-400" */
  color?: string;
  /** Gradient bg for icon e.g. "from-blue-500/20 to-blue-600/10" */
  iconBg?: string;
  delay?: number;
  sub?: string;
  trend?: number; // percentage change, positive = up
}

// Animated number counter
function AnimatedNumber({ value }: { value: number }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(false);

  useEffect(() => {
    if (ref.current) return;
    ref.current = true;
    const duration = 800;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out-cubic
      setDisplay(Math.round(eased * value));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

export default function StatsCard({
  label,
  value,
  icon: Icon,
  color = 'text-primary',
  iconBg,
  delay = 0,
  sub,
  trend,
}: StatsCardProps) {
  // 3D tilt via mouse
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 200, damping: 20 });
  const sy = useSpring(my, { stiffness: 200, damping: 20 });
  const rotateX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-6, 6]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { mx.set(0); my.set(0); };

  const isNumber = typeof value === 'number';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 22, delay }}
      style={{ perspective: 800, transformStyle: 'preserve-3d' }}
    >
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative glass-card p-5 overflow-hidden transition-all duration-300 cursor-default group"
      >
        {/* Top accent line */}
        <div className="glow-line-top" />

        {/* Subtle inner glow on hover */}
        <div className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-2xl',
          'bg-gradient-to-br from-white/[0.025] via-transparent to-transparent'
        )} />

        {/* Background glow blob */}
        <div className={cn(
          'absolute -top-6 -right-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-60 transition-opacity duration-500 pointer-events-none',
          color.replace('text-', 'bg-').replace('400', '500').replace('text-primary', 'bg-primary')
        )} style={{ opacity: undefined }} />

        <div className="relative flex items-start justify-between z-10">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-2">
              {label}
            </p>
            <p className={cn('text-3xl font-black tabular-nums tracking-tight', color)}
               style={{ transform: 'translateZ(10px)' }}>
              {isNumber ? <AnimatedNumber value={value as number} /> : value}
            </p>
            {sub && (
              <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{sub}</p>
            )}
            {trend !== undefined && (
              <div className={cn(
                'flex items-center gap-1 mt-2 text-xs font-semibold',
                trend >= 0 ? 'text-emerald-400' : 'text-rose-400'
              )}>
                {trend >= 0
                  ? <TrendingUp className="w-3 h-3" />
                  : <TrendingDown className="w-3 h-3" />}
                {Math.abs(trend)}% this month
              </div>
            )}
          </div>

          {/* Icon */}
          <div
            className={cn(
              'icon-box ml-3 shrink-0 transition-transform duration-300 group-hover:scale-110',
              iconBg
                ? `bg-gradient-to-br ${iconBg}`
                : 'bg-white/[0.05] border border-white/[0.08]',
              color
            )}
            style={{ transform: 'translateZ(20px)' }}
          >
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
