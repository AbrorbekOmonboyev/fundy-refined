import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { errorKey } from '@/features/auth/errors';
import { isValidEmail, isValidName } from '@/features/auth/validation';
import { CONTACT_TOPICS, sendContactMessage, type ContactTopic } from '@/features/contact/api';
import { Alert, Button, SelectField, TextAreaField, TextField } from '@/components/ui';
import { usePageMeta } from '@/lib/usePageMeta';

/** Contact form. Messages go to the admin inbox (Admin → Messages). */
export function ContactPage() {
  const { t } = useTranslation();
  const { user, profile } = useAuth();
  usePageMeta(t('contact.title'), t('contact.intro'));

  const [name, setName] = useState(profile?.full_name ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [topic, setTopic] = useState<ContactTopic>('general');
  const [message, setMessage] = useState('');
  const [website, setWebsite] = useState(''); // hidden field: only bots fill it in
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    const found: typeof errors = {};
    if (!isValidName(name)) found.name = t('validation.name');
    if (!isValidEmail(email)) found.email = t('validation.email');
    if (message.trim().length < 10) found.message = t('contact.messageTooShort');
    setErrors(found);
    if (Object.keys(found).length) return;
    if (website) {
      setSent(true); // pretend success to bots
      return;
    }
    setBusy(true);
    try {
      await sendContactMessage({ name, email, topic, message, userId: user?.id });
      setSent(true);
    } catch (err) {
      const e2 = err as { message?: string };
      setError(e2.message === 'too_many_messages' ? t('contact.tooMany') : t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 lg:py-14">
      <header>
        <h1 className="mt-4 text-3xl sm:text-4xl text-ink">{t('contact.title')}</h1>
        <p className="mt-4 text-slate-600 leading-relaxed">{t('contact.intro')}</p>
      </header>

      <div className="mt-8 bg-card rounded-2xl border border-slate-200 p-5 sm:p-8">
        {sent ? (
          <div className="text-center space-y-3 py-6">
            <CheckCircle2 className="w-12 h-12 mx-auto text-brand-deep" aria-hidden />
            <h2 className="text-xl text-ink">{t('contact.sentTitle')}</h2>
            <p className="text-slate-600">{t('contact.sentText')}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                label={t('auth.fields.fullName')}
                autoComplete="name"
                maxLength={120}
                value={name}
                onChange={e => setName(e.target.value)}
                error={errors.name}
              />
              <TextField
                label={t('auth.fields.email')}
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={errors.email}
              />
            </div>
            <SelectField
              label={t('contact.topic')}
              value={topic}
              onChange={e => setTopic(e.target.value as ContactTopic)}
              options={CONTACT_TOPICS.map(v => ({ value: v, label: t(`contact.topics.${v}`) }))}
            />
            <TextAreaField
              label={t('contact.message')}
              rows={6}
              maxLength={4000}
              value={message}
              onChange={e => setMessage(e.target.value)}
              error={errors.message}
            />
            {/* Honeypot: hidden from people, tempting for spam bots */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={e => setWebsite(e.target.value)}
              className="absolute -left-[9999px] h-0 w-0 opacity-0"
              aria-hidden
            />
            {error && <Alert variant="error">{error}</Alert>}
            <Button type="submit" loading={busy}>
              {t('contact.send')}
            </Button>
            <p className="text-xs text-slate-500">{t('contact.privacyNote')}</p>
          </form>
        )}
      </div>
    </div>
  );
}
