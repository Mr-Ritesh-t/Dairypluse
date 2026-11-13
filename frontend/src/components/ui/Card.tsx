import React from 'react';

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  variant?: 'default' | 'raised' | 'sunken' | 'flush';
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  variant = 'default',
}) => {
  const hasHeader = Boolean(title || action);

  const variantStyles = {
    default: 'bg-white border-stone-200/90 shadow-[0_1px_3px_rgba(28,25,23,0.04)]',
    raised: 'bg-[#FFFDF9] border-stone-200 shadow-[0_4px_12px_rgba(28,25,23,0.06)]',
    sunken: 'bg-[#F7F4EC] border-stone-200/70 shadow-none',
    flush: 'bg-transparent border-none shadow-none',
  };

  return (
    <div
      className={`rounded-2xl border transition-colors duration-150 ${variantStyles[variant]} ${className}`}
    >
      {hasHeader && (
        <div
          className={`px-5 py-4 border-b border-stone-100 flex items-center justify-between gap-3 ${headerClassName}`}
        >
          <div>
            {title && (
              <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-stone-500 font-normal mt-0.5">{subtitle}</p>
            )}
          </div>
          {action && <div className="shrink-0 flex items-center gap-2">{action}</div>}
        </div>
      )}
      <div className={`p-4 sm:p-6 ${bodyClassName}`}>{children}</div>
    </div>
  );
};

export default Card;
