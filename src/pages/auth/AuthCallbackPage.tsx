import { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import type { EmailOtpType } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { safeNext } from '@/features/auth/redirects';
import { errorKey } from '@/features/auth/errors';
import { paths } from '@/app/routes';
import { Alert, AuthCard, PageSpinner } from '@/components/ui';

/**
 * Where links in emails (and Google sign-in) land.
 *
 * Email links bring ?token_hash=…&type=… (see supabase/scripts/generate-email-templates.ts):
 * checked with verifyOtp(), they work on any device — request on a computer, open on a phone.
 * Google sign-in brings ?code=…, exchanged for a session in the same browser.
 * If no session appears, this page asks Supabase for the exact reason and explains it.
 */
export function AuthCallbackPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const { loading, user } = useAuth();
  const [failure, setFailure] = useState<string | null>(null);
  const tried = useRef(false);

  // Errors Supabase put in the link itself (?error_code=… or #error_code=…).
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const urlError = params.get('error_code') ?? hash.get('error_code') ?? params.get('error') ?? hash.get('error');
  const code = params.get('code');
  const tokenHash = params.get('token_hash');
  const otpType = params.get('type') as EmailOtpType | null;

  useEffect(() => {
    if (urlError || user || loading || tried.current) return;
    if (!supabase) return;
    if (tokenHash && otpType) {
      // Email link: works on any device.
      tried.current = true;
      void supabase.auth.verifyOtp({ token_hash: tokenHash, type: otpType }).then(({ error }) => {
        if (error) setFailure(t(errorKey(error)));
      });
      return;
    }
    if (!code) return; // handled below: a link without a code can't work
    tried.current = true;
    // No session after the automatic attempt: try once more to learn why.
    void supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) setFailure(t(errorKey(error)));
    });
  }, [urlError, user, loading, code, tokenHash, otpType, t]);

  // Last resort if nothing answers at all.
  useEffect(() => {
    if (user || failure || urlError) return;
    const id = window.setTimeout(() => setFailure(t('errors.linkExpired')), 15_000);
    return () => window.clearTimeout(id);
  }, [user, failure, urlError, t]);

  if (user && !loading) return <Navigate to={safeNext(params.get('next'))} replace />;

  const message = urlError
    ? t(errorKey({ code: params.get('error_code') ?? hash.get('error_code') ?? 'otp_expired' }))
    : !code && !tokenHash && !loading
      ? t('errors.linkExpired')
      : failure;
  if (!message) return <PageSpinner />;

  return (
    <AuthCard title={t('auth.callback.failedTitle')}>
      <Alert variant="error">{message}</Alert>
      <p className="text-sm text-slate-600">{t('auth.callback.confirmedHint')}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        <Link
          to={paths.login}
          className="rounded-md bg-night px-4 py-2.5 text-center text-sm font-semibold text-white hover:bg-night-soft"
        >
          {t('auth.login.submit')}
        </Link>
        <Link
          to={paths.forgotPassword}
          className="rounded-md border border-slate-300 px-4 py-2.5 text-center text-sm font-semibold text-ink hover:bg-page"
        >
          {t('auth.login.forgot')}
        </Link>
      </div>
    </AuthCard>
  );
}
