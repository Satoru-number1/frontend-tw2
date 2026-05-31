import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
      document.documentElement.classList.add('dark');
      setIsDark(true);
    } else {
      document.documentElement.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className="p-2.5 rounded-xl border border-neutral-200/60 dark:border-neutral-800/60 bg-white/80 dark:bg-neutral-900/80 text-neutral-600 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-white shadow-sm hover:shadow-md transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-neutral-400 dark:focus:ring-neutral-600 cursor-pointer"
      aria-label="Alternar tema"
    >
      <div className="relative w-5 h-5 overflow-hidden">
        {isDark ? (
          <Sun className="w-5 h-5 transition-all duration-500 transform rotate-0 scale-100 text-amber-400" />
        ) : (
          <Moon className="w-5 h-5 transition-all duration-500 transform rotate-0 scale-100 text-neutral-600" />
        )}
      </div>
    </button>
  );
}
