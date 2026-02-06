import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  accent?: boolean;
}

export function Card({ children, accent, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 border transition-all duration-200 ${
        accent
          ? 'bg-secondary border-accent shadow-lg'
          : 'bg-secondary border-accent/30 hover:border-accent shadow-md'
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
