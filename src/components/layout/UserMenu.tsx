import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { publicFileUrl } from '@/lib/supabase';
import { paths } from '@/app/routes';
import { Avatar } from '@/components/Avatar';
import { useAccountLinks } from '@/components/layout/useAccountLinks';

export function UserMenu() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { profile, user, signOut } = useAuth();
  const links = useAccountLinks();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click or Escape.
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const name = profile?.full_name || user?.email || '';

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1.5 rounded-full p-0.5 pr-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
      >
        <Avatar name={name} url={publicFileUrl('avatars', profile?.avatar_path)} size="sm" />
        <ChevronDown className="w-4 h-4 text-slate-500" aria-hidden />
        <span className="sr-only">{t('account.menu')}</span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-60 bg-card rounded-xl shadow-xl border border-slate-200 py-2 z-50 text-sm"
        >
          <div className="px-4 py-2 border-b border-slate-100">
            <p className="font-semibold text-ink truncate">{profile?.full_name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
          {links.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              role="menuitem"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50"
            >
              <Icon className="w-4 h-4 text-slate-400" aria-hidden />
              {label}
            </Link>
          ))}
          <button
            type="button"
            role="menuitem"
            onClick={async () => {
              setOpen(false);
              await signOut();
              navigate(paths.home);
            }}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-slate-700 hover:bg-slate-50 border-t border-slate-100 mt-1 cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400" aria-hidden />
            {t('account.signOut')}
          </button>
        </div>
      )}
    </div>
  );
}
