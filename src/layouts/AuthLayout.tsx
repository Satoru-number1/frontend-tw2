import React from 'react';
import ThemeToggle from '../components/ThemeToggle';

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-neutral-100 dark:bg-neutral-950 p-4 transition-colors duration-500 overflow-hidden select-none">


      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">

        <div className="absolute -top-40 -left-40 w-96 h-96 bg-neutral-400 dark:bg-neutral-800 ambient-glow rounded-full animate-float-slow opacity-10" />


        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-neutral-500 dark:bg-neutral-700 ambient-glow rounded-full animate-float-delayed opacity-10" />
      </div>

      <header className="absolute top-6 right-6 z-50 animate-fadeIn">
        <ThemeToggle />
      </header>


      <main className="w-full max-w-[440px] z-10 transition-all duration-500 hover:scale-[1.01]">

        <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800/80 rounded-lg p-8 shadow-sm dark:shadow-neutral-950/20 text-neutral-800 dark:text-neutral-200 transition-colors duration-300">
          {children}
        </div>
      </main>

    </div>
  );
}
