import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { paths } from '@/app/routes';
import { errorKey } from '@/features/auth/errors';
import { isStrongPassword, PASSWORD_MIN_LENGTH } from '@/features/auth/validation';
import { Alert, AuthCard, Button, TextField } from '@/components/ui';

/** Reached from the password-reset email (the link signs the user in first). */
export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<{ password?: string; confirm?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    const found: typeof errors = {};
    if (!isStrongPassword(password)) found.password = t('validation.password', { min: PASSWORD_MIN_LENGTH });
    if (confirm !== password) found.confirm = t('validation.passwordMatch');
    setErrors(found);
    if (Object.keys(found).length || !supabase) return;

    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setError(t(errorKey(error)));
    else setDone(true);
  }

  return (
    <AuthCard title={t('auth.reset.title')}>
      {done ? (
        <>
          <Alert variant="success">{t('auth.reset.done')}</Alert>
          <Link to={paths.home} className="block text-center text-sm font-semibold text-ink hover:underline">
            {t('notFound.home')}
          </Link>
        </>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <TextField
            label={t('auth.fields.newPassword')}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={errors.password}
            hint={t('validation.password', { min: PASSWORD_MIN_LENGTH })}
          />
          <TextField
            label={t('auth.fields.confirmPassword')}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            error={errors.confirm}
          />
          {error && <Alert variant="error">{error}</Alert>}
          <Button type="submit" fullWidth loading={busy}>
            {t('auth.reset.submit')}
          </Button>
        </form>
      )}
    </AuthCard>
  );
}
