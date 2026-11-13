import React from 'react';

export type BadgeVariant =
  | 'teal'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'amber'
  | 'emerald';

export type BadgeSize = 'xs' | 'sm' | 'md';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; dot: string }> = {
  teal: {
    bg: 'bg-teal-50 border-teal-200/90',
    text: 'text-teal-800',
    dot: 'bg-teal-600',
  },
  emerald: {
    bg: 'bg-emerald-50 border-emerald-200/90',
    text: 'text-emerald-800',
    dot: 'bg-emerald-600',
  },
  success: {
    bg: 'bg-green-50 border-green-200/90',
    text: 'text-green-800',
    dot: 'bg-green-600',
  },
  warning: {
    bg: 'bg-amber-50 border-amber-200/90',
    text: 'text-amber-800',
    dot: 'bg-amber-600',
  },
  amber: {
    bg: 'bg-amber-50 border-amber-200/90',
    text: 'text-amber-800',
    dot: 'bg-amber-600',
  },
  danger: {
    bg: 'bg-orange-50 border-orange-200/90',
    text: 'text-orange-900',
    dot: 'bg-orange-600',
  },
  info: {
    bg: 'bg-sky-50 border-sky-200/90',
    text: 'text-sky-800',
    dot: 'bg-sky-600',
  },
  neutral: {
    bg: 'bg-stone-100 border-stone-200',
    text: 'text-stone-700',
    dot: 'bg-stone-500',
  },
};

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-[10px] font-semibold',
  sm: 'px-2.5 py-0.5 text-xs font-semibold',
  md: 'px-3 py-1 text-xs font-bold',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  dot = false,
  className = '',
}) => {
  const currentVariant = variantStyles[variant] || variantStyles.neutral;
  const currentSize = sizeStyles[size] || sizeStyles.sm;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border tracking-tight ${currentVariant.bg} ${currentVariant.text} ${currentSize} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${currentVariant.dot}`} />}
      {children}
    </span>
  );
};

export default Badge;
