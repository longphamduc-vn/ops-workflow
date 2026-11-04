import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'neutral', 
  size = 'sm',
  className = '' 
}) => {
  const variantStyles = {
    success: 'bg-emerald-950/70 text-emerald-400 border-emerald-800/80',
    warning: 'bg-amber-950/70 text-amber-300 border-amber-800/80',
    danger: 'bg-rose-950/70 text-rose-400 border-rose-800/80',
    info: 'bg-cyan-950/70 text-cyan-400 border-cyan-800/80',
    purple: 'bg-purple-950/70 text-purple-300 border-purple-800/80',
    neutral: 'bg-slate-800 text-slate-300 border-slate-700',
  };

  const sizeStyles = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
  };

  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded-full border ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}>
      {children}
    </span>
  );
};

