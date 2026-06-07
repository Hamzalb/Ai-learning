'use client';
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, rightIcon, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground',
              'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
              'transition-all duration-200 text-sm',
              leftIcon && 'pr-10',
              rightIcon && 'pl-10',
              error && 'border-destructive focus:ring-destructive',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {rightIcon}
            </div>
          )}
        </div>
        {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
export { Input };
