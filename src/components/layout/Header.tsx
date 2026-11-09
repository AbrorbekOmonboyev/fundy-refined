import { useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Menu, Search, X } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { paths } from '@/app/routes';
import { LanguageMenu, LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { CartButton } from '@/components/layout/CartButton';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { Logo } from '@/components/Logo';
import { UserMenu } from '@/components/layout/UserMenu';
import { useAccountLinks } from '@/components/layout/useAccountLinks';
import { useCategories } from '@/features/reference/useReference';
import { isAppMode } from '@/lib/appMode';

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  `hover:text-ink transition-colors whitespace-nowrap ${isActive ? 'text-ink font-semibold underline decoration-brand decoration-[3px] underline-offset-[10px]' : ''}`;

const mobileLink = ({ isActive }: { isActive: boolean }) =>
  `text-left py-2 px-3 rounded-lg hover:bg-slate-100 ${isActive ? 'text-ink bg-brand-soft' : 'text-slate-700'}`;

export function Header() {
  const { t } = useTranslation();
  const { configured, loading, user, signOut } = useAuth();
  const accountLinks = useAccountLinks();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  // Explore has its own search box right on the page.
  const { pathname } = useLocation();
  const onExplore = pathname === paths.explore;
  const TAB_ROOTS: string[] = [paths.home, paths.explore, paths.saved];
  const showBack = isAppMode() && !TAB_ROOTS.includes(pathname);

  const search = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `${paths.explore}?q=${encodeURIComponent(q)}` : paths.explore);
  };

  const closeMenu = () => setMobileMenuOpen(false);
  const showLogin = configured && !loading && !user;

  // `section` links point at an anchor on another page, so they never show as "active".
  const links = [
    { to: paths.explore, label: t('nav.explore') },
    { to: `${paths.education}#how-it-works`, label: t('nav.howItWorks'), section: true },
    { to: paths.education, label: t('nav.learn') },
    { to: paths.trustSafety, label: t('nav.trustSafety') },
  ];
  const inactive = { isActive: false };

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-card border-b border-slate-200 ${isAppMode() && pathname.startsWith('/projects/') ? 'app-hide' : ''}`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-6 h-16">
            {/* Logo; in the app, inner screens also get a back arrow like any phone app */}
            <div className="flex items-center gap-1 shrink-0">
              {showBack && (
                <button
                  type="button"
                  onClick={() => (window.history.length > 1 ? navigate(-1) : navigate(paths.home))}
                  aria-label={t('appNav.back')}
                  className="-ml-2 w-11 h-11 flex items-center justify-center text-ink cursor-pointer"
                >
                  <ArrowLeft className="w-6 h-6" aria-hidden />
                </button>
              )}
              <Link to={paths.home} aria-label="Fundy">
                <Logo className="h-7 sm:h-8" />
              </Link>
            </div>

            {/* Desktop navigation. "How it works" lives in the phone menu and on the home page,
                to leave room for search. */}
            <nav className="app-hide hidden xl:flex items-center gap-5 text-sm font-medium text-slate-600">
              {links
                .filter(link => !link.section)
                .map(link => (
                  <NavLink key={link.to} to={link.to} end className={desktopLink}>
                    {link.label}
                  </NavLink>
                ))}
            </nav>

            {/* Search, always in sight on bigger screens (like Kickstarter) */}
            <form
              role="search"
              onSubmit={search}
              className={`${onExplore ? 'md:invisible' : ''} app-hide hidden md:flex flex-1 min-w-40 max-w-xs ml-auto relative`}
            >
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('header.search')}
                aria-label={t('header.search')}
                className="w-full h-10 pl-9 pr-3 text-sm bg-page border border-slate-200 rounded-md text-ink placeholder:text-slate-500 focus:outline-none focus:border-ink"
              />
            </form>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0">
              <LanguageMenu className="app-hide hidden sm:flex" />
              <CartButton />
              <ThemeToggle className="app-hide" />

              {user && <NotificationBell />}

              {showLogin && (
                <Link
                  to={paths.login}
                  className="app-hide hidden sm:inline-block px-3 py-2 text-sm font-semibold text-slate-700 hover:text-ink whitespace-nowrap"
                >
                  {t('account.login')}
                </Link>
              )}

              {/* The one primary action */}
              <Link
                to={paths.startProject}
                className="app-hide hidden sm:inline-block px-4 py-2 text-sm font-semibold text-white bg-night hover:bg-night-soft active:bg-night rounded-md transition-colors whitespace-nowrap"
              >
                {t('nav.startProject')}
              </Link>

              {user && (
                <div className="app-hide">
                  <UserMenu />
                </div>
              )}

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="app-hide xl:hidden w-11 h-11 flex items-center justify-center text-slate-600 hover:text-ink rounded-lg hover:bg-slate-100 transition-colors"
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
          <div className="xl:hidden border-t border-slate-200 bg-card px-4 pt-3 pb-6 space-y-3 shadow-lg">
            <form
              role="search"
              onSubmit={e => {
                search(e);
                closeMenu();
              }}
              className="md:hidden relative"
            >
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none"
                aria-hidden
              />
              <input
                type="search"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('header.search')}
                aria-label={t('header.search')}
                className="w-full h-11 pl-9 pr-3 text-base bg-page border border-slate-200 rounded-md text-ink placeholder:text-slate-500 focus:outline-none focus:border-ink"
              />
            </form>
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
                className="block w-full py-2.5 text-center text-sm font-semibold text-white bg-night rounded-lg shadow-sm"
              >
                {t('nav.startProject')}
              </Link>
            </div>
          </div>
        )}
      </header>
      <CategoryBar />
    </>
  );
}

/**
 * A plain row of categories under the header, like Kickstarter's. Scrolls sideways on phones.
 * Hidden inside the admin panel, the project wizard and account pages, where it would only distract.
 */
function CategoryBar() {
  const { t } = useTranslation();
  const { options } = useCategories();
  const { pathname } = useLocation();

  // Only on project pages: the home page and Explore don't repeat it, and the app never shows it.
  const showOn = pathname.startsWith('/projects/') && !isAppMode();
  if (!showOn || options.length === 0) return null;

  return (
    <nav aria-label={t('header.categories')} className="bg-card border-b border-slate-200">
      <ul className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-6 overflow-x-auto text-sm text-slate-600 [scrollbar-width:none]">
        {options.map(c => (
          <li key={c.value} className="shrink-0">
            <Link
              to={`${paths.explore}?category=${c.value}`}
              className="block py-3 whitespace-nowrap border-b-[3px] border-transparent hover:text-ink hover:border-brand"
            >
              {c.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
