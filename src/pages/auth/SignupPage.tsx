import { useState, type FormEvent } from 'react';
import { Link, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { paths } from '@/app/routes';
import { callbackUrl, safeNext } from '@/features/auth/redirects';
import { errorKey } from '@/features/auth/errors';
import { isStrongPassword, isValidEmail, isValidName, PASSWORD_MIN_LENGTH } from '@/features/auth/validation';
import { Alert, AuthCard, Button, TextField } from '@/components/ui';
import { GoogleButton } from '@/features/auth/GoogleButton';

type Errors = Partial<Record<'name' | 'email' | 'password' | 'terms', string>>;

export function SignupPage() {
  const { t, i18n } = useTranslation();
  const [params] = useSearchParams();
  const next = safeNext(params.get('next'), paths.home);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const found: Errors = {};
    if (!isValidName(name)) found.name = t('validation.name');
    if (!isValidEmail(email)) found.email = t('validation.email');
    if (!isStrongPassword(password)) found.password = t('validation.password', { min: PASSWORD_MIN_LENGTH });
    if (!acceptedTerms) found.terms = t('validation.terms');
    setErrors(found);
    if (Object.keys(found).length || !supabase) return;

    setBusy(true);
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        // Read by the database trigger that creates the profile.
        data: { full_name: name.trim(), language: i18n.resolvedLanguage },
        emailRedirectTo: callbackUrl(`${paths.welcome}?next=${encodeURIComponent(next)}`),
      },
    });
    setBusy(false);

    if (error) setError(t(errorKey(error)));
    // With email confirmation on there's no session yet: ask them to check their inbox.
    // (If confirmation is off, the new session makes <GuestOnly> move on automatically.)
    else if (!data.session) setSentTo(email.trim());
  }

  if (sentTo) {
    return (
      <AuthCard title={t('auth.signup.checkEmailTitle')}>
        <Alert variant="success">{t('auth.signup.checkEmail', { email: sentTo })}</Alert>
        <p className="text-sm text-slate-600">{t('auth.signup.checkEmailHint')}</p>
        <Link to={paths.login} className="block text-center text-sm font-semibold text-ink hover:underline">
          {t('auth.signup.backToLogin')}
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title={t('auth.signup.title')}
      subtitle={
        <>
          {t('auth.signup.haveAccount')}{' '}
          <Link to={paths.login} className="font-semibold text-ink hover:underline">
            {t('auth.signup.loginLink')}
          </Link>
        </>
      }
    >
      <GoogleButton
        next={`${paths.welcome}?next=${encodeURIComponent(next)}`}
        beforeStart={() => {
          if (acceptedTerms) return true;
          setErrors(e => ({ ...e, terms: t('validation.terms') }));
          return false;
        }}
      />

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <TextField
          label={t('auth.fields.fullName')}
          autoComplete="name"
          required
          maxLength={120}
          value={name}
          onChange={e => setName(e.target.value)}
          error={errors.name}
        />
        <TextField
          label={t('auth.fields.email')}
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          error={errors.email}
        />
        <TextField
          label={t('auth.fields.password')}
          type="password"
          autoComplete="new-password"
          required
          value={password}
          onChange={e => setPassword(e.target.value)}
          error={errors.password}
          hint={t('validation.password', { min: PASSWORD_MIN_LENGTH })}
        />

        <div className="space-y-1">
          <label className="flex items-start gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={e => setAcceptedTerms(e.target.checked)}
              className="mt-0.5 accent-ink"
            />
            <span>
              {t('auth.signup.terms')}{' '}
              <Link to={paths.trustSafety} target="_blank" className="font-medium text-ink hover:underline">
                {t('auth.signup.termsLink')}
              </Link>
            </span>
          </label>
          {errors.terms && <p className="text-xs text-rose-600">{errors.terms}</p>}
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <Button type="submit" fullWidth loading={busy}>
          {t('auth.signup.submit')}
        </Button>
      </form>
    </AuthCard>
  );
}
