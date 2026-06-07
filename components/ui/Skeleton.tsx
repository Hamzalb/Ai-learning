import { cn } from '@/lib/utils';

const Skeleton = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn('rounded-xl bg-white/[0.04]', className)}
    style={{
      backgroundImage: 'linear-gradient(90deg, transparent 0%, hsl(var(--muted-foreground) / 0.04) 50%, transparent 100%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 2s ease-in-out infinite'
    }}
    {...props}
  />
);

export { Skeleton };
