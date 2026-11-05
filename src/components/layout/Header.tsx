import { useState } from 'react';
import { Link, NavLink } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { paths } from '@/app/routes';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { Logo } from '@/components/Logo';
import { UserMenu } from '@/components/layout/UserMenu';
import { useAccountLinks } from '@/components/layout/useAccountLinks';

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  `hover:text-ink transition-colors whitespace-nowrap ${isActive ? 'text-ink font-semibold underline decoration-brand decoration-[3px] underline-offset-[10px]' : ''}`;

const mobileLink = ({ isActive }: { isActive: boolean }) =>
  `text-left py-2 px-3 rounded-lg hover:bg-slate-100 ${isActive ? 'text-ink bg-brand-soft' : 'text-slate-700'}`;

export function Header() {
  const { t } = useTranslation();
  const { configured, loading, user, signOut } = useAuth();
  const accountLinks = useAccountLinks();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMenu = () => setMobileMenuOpen(false);
  const showLogin = configured && !loading && !user;

  // `section` links point at an anchor on another page, so they never show as "active".
  const links = [
    { to: paths.explore, label: t('nav.explore') },
    { to: `${paths.home}#how-it-works`, label: t('nav.howItWorks'), section: true },
    { to: paths.education, label: t('nav.learn') },
    { to: paths.trustSafety, label: t('nav.trustSafety') },
  ];
  const inactive = { isActive: false };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-6 h-16">
          {/* Logo */}
          <Link to={paths.home} className="shrink-0" aria-label="Fundy">
            <Logo className="h-7 sm:h-8" />
          </Link>

          {/* Desktop navigation */}
          <nav className="hidden xl:flex items-center gap-6 text-sm font-medium text-slate-600">
            {links.map(link =>
              link.section ? (
                <Link key={link.to} to={link.to} className={desktopLink(inactive)}>
                  {link.label}
                </Link>
              ) : (
                <NavLink key={link.to} to={link.to} end className={desktopLink}>
                  {link.label}
                </NavLink>
              ),
            )}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <LanguageSwitcher className="hidden sm:flex" />

            {user && <NotificationBell />}

            <Link
              to={paths.startProject}
              className="hidden sm:inline-block px-4 py-2 text-xs font-semibold text-white bg-ink hover:bg-ink-soft active:bg-ink rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              {t('nav.startProject')}
            </Link>

            {user && <UserMenu />}
            {showLogin && (
              <>
                <Link
                  to={paths.login}
                  className="hidden sm:inline-block px-3 py-2 text-xs font-semibold text-slate-700 hover:text-ink whitespace-nowrap"
                >
                  {t('account.login')}
                </Link>
                <Link
                  to={paths.signup}
                  className="hidden md:inline-block px-4 py-2 text-xs font-semibold text-ink bg-brand hover:bg-brand-deep rounded-full whitespace-nowrap transition-colors"
                >
                  {t('account.signup')}
                </Link>
              </>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 text-slate-600 hover:text-ink rounded-lg hover:bg-slate-100 transition-colors"
              aria-label={t('header.toggleMenu')}
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="xl:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <nav className="flex flex-col space-y-1 text-sm font-medium">
            {links.map(link =>
              link.section ? (
                <Link key={link.to} to={link.to} onClick={closeMenu} className={mobileLink(inactive)}>
                  {link.label}
                </Link>
              ) : (
                <NavLink key={link.to} to={link.to} end onClick={closeMenu} className={mobileLink}>
                  {link.label}
                </NavLink>
              ),
            )}
          </nav>
          {user && (
            <nav className="flex flex-col space-y-1 text-sm font-medium pt-3 border-t border-slate-100">
              {accountLinks.map(link => (
                <NavLink key={link.to} to={link.to} onClick={closeMenu} className={mobileLink}>
                  {link.label}
                </NavLink>
              ))}
              <button
                type="button"
                onClick={() => {
                  closeMenu();
                  void signOut();
                }}
                className={mobileLink(inactive)}
              >
                {t('account.signOut')}
              </button>
            </nav>
          )}
          <div className="pt-3 border-t border-slate-100 space-y-3">
            <LanguageSwitcher className="sm:hidden" />
            {showLogin && (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to={paths.login}
                  onClick={closeMenu}
                  className="py-2.5 text-center text-sm font-semibold text-slate-700 border border-slate-300 rounded-lg"
                >
                  {t('account.login')}
                </Link>
                <Link
                  to={paths.signup}
                  onClick={closeMenu}
                  className="py-2.5 text-center text-sm font-semibold text-ink border border-brand rounded-lg"
                >
                  {t('account.signup')}
                </Link>
              </div>
            )}
            <Link
              to={paths.startProject}
              onClick={closeMenu}
              className="block w-full py-2.5 text-center text-sm font-semibold text-white bg-ink rounded-lg shadow-sm"
            >
              {t('nav.startProject')}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
