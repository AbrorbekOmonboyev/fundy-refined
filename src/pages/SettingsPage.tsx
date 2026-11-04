import { useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { LogOut, Trash2, Upload } from 'lucide-react';
import { publicFileUrl, supabase } from '@/lib/supabase';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { errorKey } from '@/features/auth/errors';
import { isStrongPassword, isValidName, PASSWORD_MIN_LENGTH } from '@/features/auth/validation';
import { useRegions } from '@/features/reference/useReference';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import { Avatar } from '@/components/Avatar';
import { Alert, Button, SelectField, TextField } from '@/components/ui';

const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // matches the avatars bucket limit
const AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

type Feedback = { variant: 'success' | 'error'; text: string } | null;

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        {description && <p className="text-sm text-slate-600 mt-0.5">{description}</p>}
      </header>
      {children}
    </section>
  );
}

export function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, profile, refreshProfile, signOut } = useAuth();
  const { options: regionOptions } = useRegions();
  const fileInput = useRef<HTMLInputElement>(null);

  // Profile
  const [name, setName] = useState(profile?.full_name ?? '');
  const [regionId, setRegionId] = useState(profile?.region_id ?? '');
  const [city, setCity] = useState(profile?.city ?? '');
  const [profileFeedback, setProfileFeedback] = useState<Feedback>(null);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Password
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [passwordErrors, setPasswordErrors] = useState<{ password?: string; confirm?: string }>({});
  const [passwordFeedback, setPasswordFeedback] = useState<Feedback>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete
  const [deleteFeedback, setDeleteFeedback] = useState<Feedback>(null);
  const [deleting, setDeleting] = useState(false);

  if (!supabase || !user || !profile) return null; // RequireAuth guarantees these
  const client = supabase;

  async function saveProfile(event: FormEvent) {
    event.preventDefault();
    if (!isValidName(name)) {
      setProfileFeedback({ variant: 'error', text: t('validation.name') });
      return;
    }
    setSavingProfile(true);
    const { error } = await client
      .from('profiles')
      .update({ full_name: name.trim(), region_id: regionId || null, city: city.trim() || null })
      .eq('id', user!.id);
    setSavingProfile(false);
    if (error) setProfileFeedback({ variant: 'error', text: t(errorKey(error)) });
    else {
      setProfileFeedback({ variant: 'success', text: t('settings.saved') });
      void refreshProfile();
    }
  }

  async function uploadAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    if (!AVATAR_TYPES.includes(file.type)) {
      setProfileFeedback({ variant: 'error', text: t('settings.avatarType') });
      return;
    }
    if (file.size > AVATAR_MAX_BYTES) {
      setProfileFeedback({ variant: 'error', text: t('settings.avatarSize', { mb: 2 }) });
      return;
    }

    setUploading(true);
    const extension = file.type.split('/')[1].replace('jpeg', 'jpg');
    const path = `${user!.id}/avatar-${Date.now()}.${extension}`; // own folder, as storage rules require
    const upload = await client.storage.from('avatars').upload(path, file, { contentType: file.type });
    if (upload.error) {
      setUploading(false);
      setProfileFeedback({ variant: 'error', text: t(errorKey(upload.error)) });
      return;
    }
    const previous = profile!.avatar_path;
    const { error } = await client.from('profiles').update({ avatar_path: path }).eq('id', user!.id);
    if (!error && previous && !previous.startsWith('/')) await client.storage.from('avatars').remove([previous]);
    setUploading(false);
    if (error) setProfileFeedback({ variant: 'error', text: t(errorKey(error)) });
    else {
      setProfileFeedback({ variant: 'success', text: t('settings.saved') });
      void refreshProfile();
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    setPasswordFeedback(null);
    const found: typeof passwordErrors = {};
    if (!isStrongPassword(password)) found.password = t('validation.password', { min: PASSWORD_MIN_LENGTH });
    if (confirm !== password) found.confirm = t('validation.passwordMatch');
    setPasswordErrors(found);
    if (Object.keys(found).length) return;

    setSavingPassword(true);
    const { error } = await client.auth.updateUser({ password });
    setSavingPassword(false);
    if (error) setPasswordFeedback({ variant: 'error', text: t(errorKey(error)) });
    else {
      setPassword('');
      setConfirm('');
      setPasswordFeedback({ variant: 'success', text: t('auth.reset.done') });
    }
  }

  async function deleteAccount() {
    if (!window.confirm(t('settings.deleteConfirm'))) return;
    setDeleting(true);
    const { error } = await client.rpc('delete_my_account');
    if (error) {
      setDeleting(false);
      setDeleteFeedback({ variant: 'error', text: t(errorKey(error)) });
      return;
    }
    await signOut();
    navigate(paths.home, { replace: true });
  }

  async function handleSignOut() {
    await signOut();
    navigate(paths.home, { replace: true });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('settings.title')}</h1>
        <Button variant="secondary" onClick={handleSignOut}>
          <LogOut className="w-4 h-4" aria-hidden />
          {t('account.signOut')}
        </Button>
      </div>

      <Section title={t('settings.profile')} description={t('settings.profileHint')}>
        <div className="flex items-center gap-4">
          <Avatar name={profile.full_name} url={publicFileUrl('avatars', profile.avatar_path)} size="lg" />
          <div>
            <input ref={fileInput} type="file" accept={AVATAR_TYPES.join(',')} hidden onChange={uploadAvatar} />
            <Button variant="secondary" loading={uploading} onClick={() => fileInput.current?.click()}>
              <Upload className="w-4 h-4" aria-hidden />
              {t('settings.avatarUpload')}
            </Button>
            <p className="text-xs text-slate-500 mt-1">{t('settings.avatarHint', { mb: 2 })}</p>
          </div>
        </div>

        <form onSubmit={saveProfile} noValidate className="space-y-4">
          <TextField
            label={t('auth.fields.fullName')}
            maxLength={120}
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label={t('welcome.region')}
              value={regionId}
              onChange={e => setRegionId(e.target.value)}
              options={regionOptions}
              placeholder={t('welcome.regionPlaceholder')}
            />
            <TextField label={t('welcome.city')} maxLength={80} value={city} onChange={e => setCity(e.target.value)} />
          </div>
          <TextField label={t('auth.fields.email')} value={user.email ?? ''} disabled hint={t('settings.emailHint')} />
          {profileFeedback && <Alert variant={profileFeedback.variant}>{profileFeedback.text}</Alert>}
          <Button type="submit" loading={savingProfile}>
            {t('settings.save')}
          </Button>
        </form>
      </Section>

      <Section title={t('settings.language')} description={t('settings.languageHint')}>
        <LanguageSwitcher />
      </Section>

      <Section title={t('settings.password')}>
        <form onSubmit={changePassword} noValidate className="space-y-4">
          <TextField
            label={t('auth.fields.newPassword')}
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={passwordErrors.password}
            hint={t('validation.password', { min: PASSWORD_MIN_LENGTH })}
          />
          <TextField
            label={t('auth.fields.confirmPassword')}
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            error={passwordErrors.confirm}
          />
          {passwordFeedback && <Alert variant={passwordFeedback.variant}>{passwordFeedback.text}</Alert>}
          <Button type="submit" loading={savingPassword}>
            {t('auth.reset.submit')}
          </Button>
        </form>
      </Section>

      <Section title={t('settings.deleteTitle')} description={t('settings.deleteHint')}>
        {deleteFeedback && <Alert variant={deleteFeedback.variant}>{deleteFeedback.text}</Alert>}
        <Button variant="danger" loading={deleting} onClick={deleteAccount}>
          <Trash2 className="w-4 h-4" aria-hidden />
          {t('settings.deleteButton')}
        </Button>
      </Section>
    </div>
  );
}
