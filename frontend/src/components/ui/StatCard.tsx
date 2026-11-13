import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: string;
    isPositive?: boolean;
    label?: string;
  };
  variant?: 'teal' | 'amber' | 'blue' | 'terracotta' | 'stone';
  className?: string;
  onClick?: () => void;
}

const variantIconStyles = {
  teal: 'bg-teal-50 text-teal-700 border-teal-200/80',
  amber: 'bg-amber-50 text-amber-700 border-amber-200/80',
  blue: 'bg-sky-50 text-sky-700 border-sky-200/80',
  terracotta: 'bg-orange-50 text-orange-700 border-orange-200/80',
  stone: 'bg-stone-100 text-stone-700 border-stone-200/80',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  variant = 'teal',
  className = '',
  onClick,
}) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-[0_1px_3px_rgba(28,25,23,0.04)] hover:border-stone-300 hover:shadow-[0_4px_12px_rgba(28,25,23,0.06)] transition-all duration-150 text-left w-full group ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-500">
          {title}
        </p>
        {icon && (
          <div
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shadow-xs transition-transform duration-150 group-hover:scale-105 shrink-0 ${variantIconStyles[variant]}`}
          >
            {icon}
          </div>
        )}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-xl sm:text-2xl font-extrabold tracking-tight text-stone-900 tabular-nums">
          {value}
        </span>
        {trend && (
          <span
            className={`inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full border ${
              trend.isPositive
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200/80'
                : 'bg-rose-50 text-rose-800 border-rose-200/80'
            }`}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-stone-500 font-medium truncate">
          {subtitle}
        </p>
      )}
    </Component>
  );
};

export default StatCard;
