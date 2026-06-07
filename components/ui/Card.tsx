import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

const Card = ({ className, glass, children, ...props }: CardProps) => (
  <div
    className={cn(
      'relative rounded-2xl border border-white/[0.06] bg-card/50 backdrop-blur-sm text-card-foreground',
      glass && 'bg-card/30 backdrop-blur-xl border-white/[0.04]',
      className
    )}
    style={{
      boxShadow: '0 0 0 1px hsl(var(--border) / 0.3), 0 1px 2px hsl(var(--background) / 0.3)'
    }}
    {...props}
  >
    {children}
  </div>
);

const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pb-0', className)} {...props} />
);

const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-bold text-foreground tracking-tight', className)} {...props} />
);

const CardDescription = ({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-muted-foreground mt-1', className)} {...props} />
);

const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6', className)} {...props} />
);

const CardFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-6 pt-0 flex items-center', className)} {...props} />
);

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
