import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'outline'
  | 'ghost'
  | 'danger'
  | 'amber';

export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-[#0F766E] hover:bg-[#0D6560] active:bg-[#115E59] text-white border border-[#0F766E] shadow-xs',
  secondary:
    'bg-white hover:bg-[#F6F2EA] active:bg-[#EFE9DE] text-stone-800 border border-stone-200/90 shadow-2xs',
  outline:
    'bg-transparent hover:bg-teal-50 active:bg-teal-100 text-[#0F766E] border border-teal-600/30',
  ghost:
    'bg-transparent hover:bg-stone-100/80 active:bg-stone-200/60 text-stone-700 border-transparent',
  danger:
    'bg-[#C2410C] hover:bg-[#9A3412] active:bg-[#7C2D12] text-white border border-[#C2410C] shadow-xs',
  amber:
    'bg-[#D97706] hover:bg-[#B45309] active:bg-[#92400E] text-white border border-[#D97706] shadow-xs',
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'px-2.5 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm sm:text-base font-bold rounded-xl gap-2.5',
  icon: 'p-2 text-sm rounded-xl',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={`inline-flex items-center justify-center font-medium transition-all duration-150 cursor-pointer select-none disabled:opacity-50 disabled:pointer-events-none disabled:cursor-not-allowed ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
            <span>{children}</span>
          </>
        ) : (
          <>
            {leftIcon && <span className="shrink-0">{leftIcon}</span>}
            {children && <span>{children}</span>}
            {rightIcon && <span className="shrink-0">{rightIcon}</span>}
          </>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
