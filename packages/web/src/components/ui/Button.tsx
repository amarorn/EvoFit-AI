import { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary';
  children: ReactNode;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  children,
  loading,
  disabled,
  className = '',
  ...props
}: ButtonProps) {
  const base = 'px-6 py-3 rounded-xl font-heading font-semibold transition-all duration-200';
  const variants = {
    primary: 'bg-accent text-primary hover:bg-accent/90 disabled:opacity-50',
    secondary: 'border-2 border-accent text-accent hover:bg-accent/10',
    tertiary: 'text-accent hover:underline',
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="inline-block h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      ) : (
        children
      )}
    </button>
  );
}
