import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  accent?: boolean;
}

export function Card({ children, accent, className = '', ...props }: CardProps) {
  return (
    <div
      className={`rounded-xl p-6 shadow-lg ${
        accent ? 'bg-secondary border border-accent/30' : 'bg-white'
      } text-primary ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
