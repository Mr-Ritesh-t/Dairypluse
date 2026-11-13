import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightAction?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      error,
      leftIcon,
      rightAction,
      className = '',
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5 text-left">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-stone-700 tracking-tight"
          >
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leftIcon && (
            <div className="absolute left-3 flex items-center pointer-events-none text-stone-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`w-full bg-white border rounded-xl py-2 text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 transition-colors duration-150 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0F766E] focus:border-transparent ${
              leftIcon ? 'pl-9.5 pr-3' : 'px-3.5'
            } ${rightAction ? 'pr-10' : ''} ${
              error
                ? 'border-orange-500 bg-orange-50/20 focus:ring-orange-500'
                : 'border-stone-200/90 hover:border-stone-300'
            } ${className}`}
            {...props}
          />
          {rightAction && (
            <div className="absolute right-2.5 flex items-center">
              {rightAction}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-[11px] font-medium text-orange-600 animate-in fade-in duration-100">
            {error}
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-stone-500 font-normal">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;

