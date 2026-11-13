import React from 'react';
import Button from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center bg-white rounded-2xl border border-dashed border-stone-300/80 shadow-2xs ${className}`}
    >
      {icon && (
        <div className="w-12 h-12 rounded-2xl bg-[#F6F2EA] text-[#0F766E] flex items-center justify-center mb-3.5 border border-stone-200 shadow-2xs">
          {icon}
        </div>
      )}
      <h3 className="text-sm sm:text-base font-bold text-stone-900 tracking-tight">{title}</h3>
      <p className="mt-1 text-xs sm:text-sm text-stone-500 max-w-sm font-normal">{description}</p>
      {action && (
        <div className="mt-4">
          <Button variant="primary" size="sm" onClick={action.onClick}>
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
