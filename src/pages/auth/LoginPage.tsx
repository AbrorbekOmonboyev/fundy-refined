import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { paths } from '@/app/routes';
import { callbackUrl, safeNext } from '@/features/auth/redirects';
import { errorKey } from '@/features/auth/errors';
import { isValidEmail } from '@/features/auth/validation';
import { Alert, AuthCard, Button, TextField } from '@/components/ui';

type Mode = 'password' | 'link';

export function LoginPage() {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'));
  const nextQuery = params.get('next') ? `?next=${encodeURIComponent(next)}` : '';

  const [mode, setMode] = useState<Mode>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const reset = () => {
    setError(null);
    setNotice(null);
    setUnconfirmed(false);
  };

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    reset();
    if (!isValidEmail(email)) {
      setEmailError(t('validation.email'));
      return;
    }
    setEmailError(null);
    if (!supabase) return;
    setBusy(true);

    if (mode === 'password') {
      // On success the auth state changes and <GuestOnly> moves the user on.
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        setUnconfirmed(error.code === 'email_not_confirmed');
        setError(t(errorKey(error)));
      }
    } else {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: callbackUrl(next), shouldCreateUser: false },
      });
      // Don't reveal whether an account exists: same message either way.
      if (error && error.code !== 'otp_disabled' && error.code !== 'user_not_found') setError(t(errorKey(error)));
      else setNotice(t('auth.login.linkSent', { email: email.trim() }));
    }
    setBusy(false);
  }

  async function resendConfirmation() {
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email.trim(),
      options: { emailRedirectTo: callbackUrl(paths.welcome) },
    });
    setBusy(false);
    setUnconfirmed(false);
    if (error) setError(t(errorKey(error)));
    else {
      setError(null);
      setNotice(t('auth.signup.checkEmail', { email: email.trim() }));
    }
  }

  return (
    <AuthCard
      title={t('auth.login.title')}
      subtitle={
        <>
          {t('auth.login.noAccount')}{' '}
          <Link to={`${paths.signup}${nextQuery}`} className="font-semibold text-emerald-700 hover:underline">
            {t('auth.login.signupLink')}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label={t('auth.fields.email')}
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={emailError}
        />

        {mode === 'password' && (
          <div className="space-y-1.5">
            <TextField
              label={t('auth.fields.password')}
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <div className="text-right">
              <Link to={paths.forgotPassword} className="text-xs font-medium text-emerald-700 hover:underline">
                {t('auth.login.forgot')}
              </Link>
            </div>
          </div>
        )}

        {error && (
          <Alert variant="error">
            <p>{error}</p>
            {unconfirmed && (
              <Button variant="link" onClick={resendConfirmation} disabled={busy}>
                {t('auth.login.resendConfirmation')}
              </Button>
            )}
          </Alert>
        )}
        {notice && <Alert variant="success">{notice}</Alert>}

        <Button type="submit" fullWidth loading={busy}>
          {mode === 'password' ? t('auth.login.submit') : t('auth.login.sendLink')}
        </Button>
      </form>

      <div className="text-center">
        <Button
          variant="link"
          onClick={() => {
            reset();
            setMode(mode === 'password' ? 'link' : 'password');
          }}
        >
          {mode === 'password' ? t('auth.login.useLink') : t('auth.login.usePassword')}
        </Button>
      </div>
    </AuthCard>
  );
}
