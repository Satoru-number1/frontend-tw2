import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  children: React.ReactNode;
}

export default function Button({
  isLoading = false,
  variant = 'primary',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {

  const baseClasses = 'relative w-full flex items-center justify-center py-2.5 px-4 rounded-xl text-[15px] font-medium transition-all duration-300 transform active:scale-98 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none cursor-pointer';

  const variants = {
    primary: 'bg-neutral-600 dark:bg-neutral-700 hover:bg-neutral-700 dark:hover:bg-neutral-600 text-white shadow-md hover:shadow-lg focus:ring-neutral-500 dark:focus:ring-offset-neutral-900',
    secondary: 'bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 focus:ring-neutral-400 dark:focus:ring-offset-neutral-900',
    outline: 'border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-900 text-neutral-700 dark:text-neutral-300 focus:ring-neutral-400 dark:focus:ring-offset-neutral-900',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-md hover:shadow-lg focus:ring-rose-500 dark:focus:ring-offset-neutral-900'
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${variants[variant]} ${className}`}
      {...props}
    >
      {isLoading && (
        <svg
          className="animate-spin -ml-1 mr-2.5 h-4.5 w-4.5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}

      <span className={`${isLoading ? 'opacity-90' : 'opacity-100'} transition-opacity`}>
        {children}
      </span>
    </button>
  );
}
