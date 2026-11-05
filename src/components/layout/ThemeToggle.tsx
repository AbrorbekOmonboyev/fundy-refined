import { Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { setTheme, useTheme } from '@/lib/theme';

/** One button: sun by day, moon by night. The icons swap with a little spin. */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const dark = theme === 'dark';
  const label = t(dark ? 'header.lightMode' : 'header.darkMode');

  return (
    <button
      type="button"
      onClick={e => {
        const r = e.currentTarget.getBoundingClientRect();
        setTheme(dark ? 'light' : 'dark', { x: r.left + r.width / 2, y: r.top + r.height / 2 });
      }}
      aria-label={label}
      title={label}
      className={`relative w-9 h-9 shrink-0 rounded-full flex items-center justify-center text-slate-600 hover:text-ink hover:bg-slate-100 transition-colors cursor-pointer overflow-hidden ${className}`}
    >
      <Sun
        aria-hidden
        className={`absolute w-[18px] h-[18px] transition-all duration-500 ${dark ? 'opacity-0 rotate-90 scale-50' : 'opacity-100 rotate-0 scale-100'}`}
      />
      <Moon
        aria-hidden
        className={`absolute w-[18px] h-[18px] text-brand transition-all duration-500 ${dark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}
      />
    </button>
  );
}
