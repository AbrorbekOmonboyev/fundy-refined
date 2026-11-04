/**
 * Wrappers that protect routes:
 *   <RequireAuth>  signed-in users only (sends others to /login, then back)
 *   <RequireAdmin> admins only
 *   <GuestOnly>    login / sign-up pages: signed-in users are sent onwards
 */
import type { ReactNode } from 'react';
import { Navigate, useLocation, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { safeNext } from '@/features/auth/redirects';
import { paths } from '@/app/routes';
import { Alert, PageSpinner } from '@/components/ui';

function NotConfigured() {
  const { t } = useTranslation();
  return (
    <div className="max-w-md mx-auto px-4 py-16">
      <Alert variant="warning">{t('errors.notConfigured')}</Alert>
    </div>
  );
}

export function RequireAuth({ children, allowUnboarded = false }: { children: ReactNode; allowUnboarded?: boolean }) {
  const { configured, loading, user, needsOnboarding } = useAuth();
  const location = useLocation();
  const here = location.pathname + location.search;

  if (!configured) return <NotConfigured />;
  if (loading) return <PageSpinner />;
  if (!user) return <Navigate to={`${paths.login}?next=${encodeURIComponent(here)}`} replace />;
  if (needsOnboarding && !allowUnboarded) {
    return <Navigate to={`${paths.welcome}?next=${encodeURIComponent(here)}`} replace />;
  }
  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  return (
    <RequireAuth>
      {isAdmin ? (
        children
      ) : (
        <div className="max-w-md mx-auto px-4 py-16">
          <Alert variant="error">{t('errors.adminOnly')}</Alert>
        </div>
      )}
    </RequireAuth>
  );
}

export function GuestOnly({ children }: { children: ReactNode }) {
  const { configured, loading, user, needsOnboarding } = useAuth();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));

  if (!configured) return <NotConfigured />;
  if (loading) return <PageSpinner />;
  if (user) {
    return <Navigate to={needsOnboarding ? `${paths.welcome}?next=${encodeURIComponent(next)}` : next} replace />;
  }
  return <>{children}</>;
}
