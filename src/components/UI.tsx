import React from 'react';
import { cn } from '../utils/cn';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', fullWidth, children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md px-4 py-2 text-sm transition-colors focus:outline-none disabled:opacity-50 disabled:pointer-events-none';
    
    const variants = {
      primary: 'font-semibold',
      secondary: 'hover:opacity-80',
      outline: 'bg-transparent transition-colors',
      ghost: 'bg-transparent hover:bg-black/5 transition-colors',
    };

    const variantStyles: Record<string, React.CSSProperties> = {
      primary: { background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-accent))', color: '#ffffff', border: 'none', boxShadow: '0 4px 14px rgba(79,70,229,0.2)', borderRadius: 10 },
      secondary: { color: 'var(--text-primary)', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 10 },
      outline: { color: 'var(--text-primary)', background: 'transparent', border: '1px solid var(--border-highlight)', borderRadius: 10 },
      ghost: { color: 'var(--text-secondary)' }
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], fullWidth && 'w-full', className)}
        style={{ ...variantStyles[variant], ...(props.style || {}) }}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('rounded-md glass-card', className)}
        style={{ borderRadius: 12, ...(props.style || {}) }}
        {...props}
      >
        {children}
      </div>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("px-6 py-4 border-b border-border-subtle", className)} {...props} />
);

export const CardTitle = ({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn("text-base font-semibold text-text-primary", className)} {...props} />
);

export const CardContent = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6", className)} {...props} />
);

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
            {icon}
          </div>
        )}
        <input
          ref={ref}
          className={cn(
            "flex h-10 w-full rounded-md px-3 text-sm placeholder:text-gray-500 focus:outline-none transition-colors disabled:opacity-50",
            icon && "pl-9",
            className
          )}
          style={{ background: 'var(--bg-surface)', border: '1px solid var(--border-highlight)', color: 'var(--text-primary)', borderRadius: 10, ...(props.style || {}) }}
          onFocus={e => { e.target.style.borderColor = 'var(--brand-primary)'; e.target.style.boxShadow = '0 0 0 3px rgba(79,70,229,0.1)'; }}
          onBlur={e => { e.target.style.borderColor = 'var(--border-highlight)'; e.target.style.boxShadow = 'none'; }}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';
