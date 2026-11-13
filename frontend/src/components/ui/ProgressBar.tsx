import React from 'react';

interface ProgressBarProps {
  value: number; // 0 to 100
  max?: number;
  label?: string;
  showPercent?: boolean;
  variant?: 'teal' | 'amber' | 'green' | 'orange' | 'sky';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const variantFills = {
  teal: 'bg-[#0F766E]',
  amber: 'bg-[#D97706]',
  green: 'bg-[#15803D]',
  orange: 'bg-[#C2410C]',
  sky: 'bg-[#0369A1]',
};

const sizeHeights = {
  sm: 'h-1.5',
  md: 'h-2',
  lg: 'h-3',
};

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  label,
  showPercent = false,
  variant = 'teal',
  size = 'md',
  className = '',
}) => {
  const percentage = Math.min(Math.max(Math.round((value / max) * 100), 0), 100);

  return (
    <div className={`w-full space-y-1 ${className}`}>
      {(label || showPercent) && (
        <div className="flex items-center justify-between text-xs font-semibold text-stone-700">
          {label && <span>{label}</span>}
          {showPercent && <span className="tabular-nums">{percentage}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={percentage}
        aria-valuemin={0}
        aria-valuemax={100}
        className={`w-full bg-stone-100/90 rounded-full overflow-hidden border border-stone-200/50 ${sizeHeights[size]}`}
      >
        <div
          className={`${variantFills[variant]} h-full rounded-full transition-all duration-300 origin-left`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
