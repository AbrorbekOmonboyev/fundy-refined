import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Bookmark, ChevronRight, Compass, Home, LogOut, UserRound, X } from 'lucide-react';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { Avatar } from '@/components/Avatar';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { useAccountLinks } from '@/components/layout/useAccountLinks';
import { isAppMode } from '@/lib/appMode';
import { publicFileUrl } from '@/lib/supabase';

/** Screens that have their own bottom bar or need the whole screen: no tabs there. */
const HIDE_ON = [/^\/projects\//, /^\/start\/new/, /^\/dashboard\/founder\/[^/]+\//, /^\/admin/];

/**
 * App mode only (the Android app): a bottom tab bar like a phone app,
 * instead of the website's big header menu and footer.
 */
export function AppTabBar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const [sheetOpen, setSheetOpen] = useState(false);
  // Close the account sheet whenever the screen changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setSheetOpen(false);
  }

  if (!isAppMode() || HIDE_ON.some(r => r.test(pathname))) return null;

  const tab = ({ isActive }: { isActive: boolean }) =>
    `flex-1 flex flex-col items-center justify-center gap-1 pt-2 pb-1.5 text-[11px] font-medium border-t-2 ${
      isActive ? 'border-transparent text-ink font-semibold' : 'border-transparent text-slate-500'
    }`;

  return (
    <>
      {/* Keeps the last bit of each screen above the bar */}
      <div aria-hidden className="h-[calc(4rem+env(safe-area-inset-bottom))]" />
      <nav
        aria-label={t('appNav.label')}
        className="fixed inset-x-0 bottom-0 z-40 bg-card border-t border-slate-200 flex pb-[env(safe-area-inset-bottom)] select-none"
      >
        <NavLink to={paths.home} end className={tab}>
          <Home className="w-6 h-6" aria-hidden />
          {t('appNav.home')}
        </NavLink>
        <NavLink to={paths.explore} className={tab}>
          <Compass className="w-6 h-6" aria-hidden />
          {t('appNav.explore')}
        </NavLink>
        {/* The big round "f": start a project */}
        <Link
          to={paths.newProject}
          aria-label={t('appNav.start')}
          className="flex-1 flex items-start justify-center border-t-2 border-transparent"
        >
          <span className="-mt-5 w-14 h-14 rounded-full bg-brand ring-4 ring-card flex items-center justify-center">
            <img src="/brand/fundy-symbol-on-chartreuse.svg" alt="" className="w-8 h-8" />
          </span>
        </Link>
        <NavLink to={paths.saved} className={tab}>
          <Bookmark className="w-6 h-6" aria-hidden />
          {t('appNav.saved')}
        </NavLink>
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          aria-haspopup="dialog"
          className={tab({ isActive: sheetOpen || /^\/(dashboard|settings|login|signup)/.test(pathname) })}
        >
          <UserRound className="w-6 h-6" aria-hidden />
          {t('appNav.account')}
        </button>
      </nav>
      {sheetOpen && <AccountSheet onClose={() => setSheetOpen(false)} />}
    </>
  );
}

/** Everything the website keeps in its header menu and footer, in one sheet. */
function AccountSheet({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { user, profile, configured, signOut } = useAuth();
  const accountLinks = useAccountLinks();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const infoLinks = [
    { to: paths.education, label: t('nav.learn') },
    { to: paths.trustSafety, label: t('nav.trustSafety') },
    { to: paths.about, label: t('footer.aboutLink') },
    { to: paths.contact, label: t('footer.contact') },
    { to: paths.terms, label: t('footer.terms') },
    { to: paths.privacy, label: t('footer.privacy') },
  ];
  const row = 'flex items-center justify-between py-3.5 text-base text-ink';

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-night/50" onClick={onClose} role="presentation">
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t('appNav.account')}
        onClick={e => e.stopPropagation()}
        className="w-full max-h-[88vh] overflow-y-auto bg-card rounded-t-2xl px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
      >
        <div aria-hidden className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-300" />
        <div className="flex items-center justify-between gap-3">
          {user ? (
            <div className="flex items-center gap-3 min-w-0">
              <Avatar
                name={profile?.full_name ?? user.email ?? ''}
                url={publicFileUrl('avatars', profile?.avatar_path)}
              />
              <div className="min-w-0">
                <p className="font-semibold text-ink truncate">{profile?.full_name}</p>
                <p className="text-sm text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          ) : (
            <h2 className="text-xl text-ink">{t('appNav.account')}</h2>
          )}
          <button type="button" onClick={onClose} aria-label={t('common.close')} className="p-2 -m-2 text-slate-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {user ? (
          <ul className="mt-3 divide-y divide-slate-200 border-y border-slate-200">
            {accountLinks.map(l => (
              <li key={l.to}>
                <Link to={l.to} className={row}>
                  {l.label}
                  <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          configured && (
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to={paths.login} className="py-3 text-center text-sm font-semibold text-white bg-brand rounded-md">
                {t('account.login')}
              </Link>
              <Link
                to={paths.signup}
                className="py-3 text-center text-sm font-semibold text-ink border border-slate-300 rounded-md"
              >
                {t('account.signup')}
              </Link>
            </div>
          )
        )}

        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-600">{t('header.language')}</span>
            <LanguageSwitcher />
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-600">{t('appNav.theme')}</span>
            <ThemeToggle />
          </div>
        </div>

        <ul className="mt-4 divide-y divide-slate-200 border-y border-slate-200">
          {infoLinks.map(l => (
            <li key={l.to}>
              <Link to={l.to} className={`${row} text-sm`}>
                {l.label}
                <ChevronRight className="w-4 h-4 text-slate-400" aria-hidden />
              </Link>
            </li>
          ))}
        </ul>

        {user && (
          <button
            type="button"
            onClick={() => {
              onClose();
              void signOut();
            }}
            className="mt-4 w-full py-3 flex items-center justify-center gap-2 text-sm font-semibold text-rose-600 cursor-pointer"
          >
            <LogOut className="w-4 h-4" aria-hidden />
            {t('account.signOut')}
          </button>
        )}

        <p className="mt-3 text-xs text-slate-500 text-center">{t('banner.short')}</p>
      </div>
    </div>
  );
}
