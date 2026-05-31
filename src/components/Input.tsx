import React, { useState, forwardRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, type = 'text', className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const isPasswordType = type === 'password';


    const inputType = isPasswordType && showPassword ? 'text' : type;

    return (
      <div className="w-full flex flex-col text-left group">
        <label className="text-[13px] font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 transition-colors group-focus-within:text-neutral-900 dark:group-focus-within:text-neutral-200">
          {label}
        </label>

        <div className="relative w-full rounded-xl transition-all duration-300">

          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            type={inputType}
            className={`
              w-full py-2.5 bg-white dark:bg-neutral-900 text-[15px] rounded-lg border 
              ${error
                ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                : 'border-neutral-300 dark:border-neutral-800 focus:border-neutral-500 dark:focus:border-neutral-600 focus:ring-neutral-500/10'
              } 
              text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 dark:placeholder-neutral-600
              transition-all duration-300 outline-none focus:ring-4
              ${icon ? 'pl-11' : 'pl-3.5'}
              ${isPasswordType ? 'pr-11' : 'pr-3.5'}
              ${className}
            `}
            {...props}
          />

          {isPasswordType && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors focus:outline-none cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4.5 h-4.5" />
              ) : (
                <Eye className="w-4.5 h-4.5" />
              )}
            </button>
          )}
        </div>

        <div className="min-h-5 mt-1">
          {error && (
            <p className="text-[12px] text-red-500 font-medium transition-all duration-300 animate-fadeIn">
              {error}
            </p>
          )}
        </div>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
