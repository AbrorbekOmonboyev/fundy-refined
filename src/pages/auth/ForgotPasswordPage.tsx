import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { paths } from '@/app/routes';
import { callbackUrl } from '@/features/auth/redirects';
import { errorKey } from '@/features/auth/errors';
import { isValidEmail } from '@/features/auth/validation';
import { Alert, AuthCard, Button, TextField } from '@/components/ui';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setEmailError(t('validation.email'));
      return;
    }
    setEmailError(null);
    if (!supabase) return;
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: callbackUrl(paths.resetPassword),
    });
    setBusy(false);
    // Same answer whether or not the account exists.
    if (error && errorKey(error) !== 'errors.generic') setError(t(errorKey(error)));
    else setSent(true);
  }

  return (
    <AuthCard title={t('auth.forgot.title')} subtitle={t('auth.forgot.subtitle')}>
      {sent ? (
        <Alert variant="success">{t('auth.forgot.sent', { email: email.trim() })}</Alert>
      ) : (
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
          {error && <Alert variant="error">{error}</Alert>}
          <Button type="submit" fullWidth loading={busy}>
            {t('auth.forgot.submit')}
          </Button>
        </form>
      )}
      <Link to={paths.login} className="block text-center text-sm font-semibold text-ink hover:underline">
        {t('auth.signup.backToLogin')}
      </Link>
    </AuthCard>
  );
}
