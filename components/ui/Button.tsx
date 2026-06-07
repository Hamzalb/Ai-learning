'use client';
import { forwardRef } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background disabled:opacity-50 disabled:pointer-events-none active:scale-[0.97]',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        outline: 'border border-border bg-transparent hover:bg-secondary text-foreground',
        ghost: 'bg-transparent hover:bg-secondary text-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        success: 'bg-green-600 text-white hover:bg-green-700',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
      },
      size: {
        sm: 'text-sm px-3 py-2 rounded-lg',
        default: 'text-sm px-5 py-2.5 rounded-xl',
        lg: 'text-base px-7 py-3.5 rounded-xl',
        icon: 'p-2 rounded-lg'
      }
    },
    defaultVariants: { variant: 'default', size: 'default' }
  }
);

interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
export { Button, buttonVariants };
