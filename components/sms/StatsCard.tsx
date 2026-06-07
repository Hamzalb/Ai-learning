'use client';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color?: string;
  delay?: number;
  sub?: string;
}

export default function StatsCard({ label, value, icon: Icon, color = 'text-primary', delay = 0, sub }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 280, damping: 24, delay }}
      className="glass-card-hover p-5 overflow-hidden"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn('text-3xl font-extrabold mt-1 tabular-nums', color)}>{value}</p>
          {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
        </div>
        <div className={cn('w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center', color)}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
