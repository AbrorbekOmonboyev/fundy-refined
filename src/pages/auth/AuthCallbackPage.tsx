import { useEffect, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { safeNext } from '@/features/auth/redirects';
import { errorKey } from '@/features/auth/errors';
import { paths } from '@/app/routes';
import { Alert, AuthCard, PageSpinner } from '@/components/ui';

/**
 * Where links in emails land (confirm sign-up, sign-in link, password reset).
 * The Supabase client exchanges ?code=… for a session by itself; this page
 * waits for that, then continues to ?next=…
 */
export function AuthCallbackPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const { loading, user } = useAuth();
  const [timedOut, setTimedOut] = useState(false);

  // Errors come back in the query (?error=…) or, for some flows, the hash.
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const errorCode = params.get('error_code') ?? hash.get('error_code');
  const hasError = Boolean(errorCode ?? params.get('error') ?? hash.get('error'));

  useEffect(() => {
    if (hasError || user) return;
    const id = window.setTimeout(() => setTimedOut(true), 10_000);
    return () => window.clearTimeout(id);
  }, [hasError, user]);

  if (!hasError && user && !loading) return <Navigate to={safeNext(params.get('next'))} replace />;

  if (hasError || timedOut) {
    return (
      <AuthCard title={t('auth.callback.failedTitle')}>
        <Alert variant="error">{t(errorKey({ code: errorCode ?? 'otp_expired' }))}</Alert>
        <Link to={paths.login} className="block text-center text-sm font-semibold text-emerald-700 hover:underline">
          {t('auth.signup.backToLogin')}
        </Link>
      </AuthCard>
    );
  }

  return <PageSpinner />;
}
