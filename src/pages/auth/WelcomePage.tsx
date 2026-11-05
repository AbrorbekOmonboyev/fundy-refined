import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/lib/supabase';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { safeNext } from '@/features/auth/redirects';
import { errorKey } from '@/features/auth/errors';
import { isValidName } from '@/features/auth/validation';
import { useRegions } from '@/features/reference/useReference';
import { LANGUAGES, type Language } from '@/i18n';
import { Alert, AuthCard, Button, ChoiceGroup, SelectField, TextField } from '@/components/ui';

type Intent = 'back' | 'launch';

/** One-time welcome step after the first sign-in. */
export function WelcomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { profile, refreshProfile } = useAuth();
  const { options: regionOptions } = useRegions();

  const [name, setName] = useState(profile?.full_name ?? '');
  const [regionId, setRegionId] = useState(profile?.region_id ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [language, setLanguage] = useState<Language>(
    (profile?.preferred_language ?? i18n.resolvedLanguage ?? 'uz') as Language,
  );
  const [intent, setIntent] = useState<Intent>('back');
  const [nameError, setNameError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!isValidName(name)) {
      setNameError(t('validation.name'));
      return;
    }
    setNameError(null);
    if (!supabase || !profile) return;

    setBusy(true);
    const { error } = await supabase
      .from('profiles')
      .update({
        full_name: name.trim(),
        region_id: regionId || null,
        city: city.trim() || null,
        preferred_language: language,
        onboarded_at: new Date().toISOString(),
      })
      .eq('id', profile.id);
    if (error) {
      setBusy(false);
      setError(t(errorKey(error)));
      return;
    }
    await refreshProfile();
    setBusy(false);

    const requested = params.get('next');
    const fallback = intent === 'launch' ? paths.newProject : paths.explore;
    // Coming from a specific page? Go back there. Otherwise follow their choice.
    navigate(requested && safeNext(requested) !== paths.home ? safeNext(requested) : fallback, { replace: true });
  }

  return (
    <AuthCard title={t('welcome.title')} subtitle={t('welcome.subtitle')}>
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <TextField
          label={t('auth.fields.fullName')}
          autoComplete="name"
          maxLength={120}
          value={name}
          onChange={e => setName(e.target.value)}
          error={nameError}
        />
        <SelectField
          label={t('welcome.region')}
          value={regionId}
          onChange={e => setRegionId(e.target.value)}
          options={regionOptions}
          placeholder={t('welcome.regionPlaceholder')}
        />
        <TextField
          label={t('welcome.city')}
          autoComplete="address-level2"
          maxLength={80}
          value={city}
          onChange={e => setCity(e.target.value)}
        />
        <ChoiceGroup
          label={t('welcome.language')}
          value={language}
          onChange={lng => {
            setLanguage(lng);
            void i18n.changeLanguage(lng);
          }}
          options={LANGUAGES.map(lng => ({ value: lng, label: t(`languages.${lng}`) }))}
        />
        <ChoiceGroup
          label={t('welcome.intent')}
          value={intent}
          onChange={setIntent}
          options={[
            { value: 'back', label: t('welcome.intentBack'), description: t('welcome.intentBackHint') },
            { value: 'launch', label: t('welcome.intentLaunch'), description: t('welcome.intentLaunchHint') },
          ]}
        />
        {error && <Alert variant="error">{error}</Alert>}
        <Button type="submit" fullWidth loading={busy}>
          {t('welcome.submit')}
        </Button>
      </form>
    </AuthCard>
  );
}
