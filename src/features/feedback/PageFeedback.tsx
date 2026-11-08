import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight, CheckCircle2, MessageSquareWarning, X } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { errorKey } from '@/features/auth/errors';
import { isValidEmail } from '@/features/auth/validation';
import { Alert, Button, TextAreaField, TextField } from '@/components/ui';
import { FEEDBACK_KINDS, sendFeedback, type FeedbackKind } from '@/features/feedback/api';

/** Pages where a feedback prompt would only get in the way. */
const HIDE_ON = [/^\/admin/, /^\/start\/new/, /^\/auth\//];

/**
 * "Shu sahifada nima kamchilik koʻrdingiz?" — a quiet pill at the end of every page.
 * Opens into a small form right there; the page address and screen details come along.
 */
export function PageFeedback() {
  const { pathname } = useLocation();
  if (HIDE_ON.some(r => r.test(pathname))) return null;
  // A new page starts closed and empty.
  return <FeedbackBox key={pathname} />;
}

type State = 'closed' | 'open' | 'sent';

function FeedbackBox() {
  const { t, i18n } = useTranslation();
  const { pathname, search } = useLocation();
  const { user } = useAuth();
  const [state, setState] = useState<State>('closed');
  const [kind, setKind] = useState<FeedbackKind>('bug');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ message?: string; email?: string }>({});
  const [sendError, setSendError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const titleId = useId();
  const boxRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  // After closing, the keyboard lands back on the pill (once it is on screen again).
  useEffect(() => {
    if (state === 'closed' && returnFocus.current) {
      returnFocus.current = false;
      pillRef.current?.focus();
    }
  }, [state]);

  // Esc closes the form and gives focus back to the pill.
  useEffect(() => {
    if (state !== 'open') return;
    boxRef.current?.querySelector('textarea')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state]);

  function close() {
    setState('closed');
    setSendError(null);
    setErrors({});
    returnFocus.current = true;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const found: typeof errors = {};
    if (message.trim().length < 3) found.message = t('feedback.tooShort');
    if (email.trim() && !isValidEmail(email)) found.email = t('validation.email');
    setErrors(found);
    if (Object.keys(found).length) return;
    setBusy(true);
    setSendError(null);
    try {
      await sendFeedback({
        page: pathname + search,
        kind,
        message,
        email: user ? undefined : email,
        userId: user?.id,
        language: i18n.resolvedLanguage ?? 'uz',
      });
      setState('sent');
      setMessage('');
      setEmail('');
    } catch (err) {
      setSendError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <aside className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-10" aria-labelledby={titleId}>
      {state === 'closed' && (
        <div className="flex justify-center">
          <button
            ref={pillRef}
            type="button"
            onClick={() => setState('open')}
            aria-expanded={false}
            className="group inline-flex items-center gap-3 max-w-full rounded-2xl sm:rounded-full border border-slate-200 bg-card py-2 pl-2 pr-5 text-left shadow-sm transition-colors hover:border-ink cursor-pointer"
          >
            <span className="shrink-0 w-8 h-8 rounded-full bg-brand-soft text-ink flex items-center justify-center">
              <MessageSquareWarning className="w-4 h-4" aria-hidden />
            </span>
            <span id={titleId} className="text-sm font-semibold text-ink">
              {t('feedback.prompt')}
            </span>
            <ArrowRight
              className="shrink-0 w-4 h-4 text-slate-400 transition-transform group-hover:translate-x-0.5 group-hover:text-ink"
              aria-hidden
            />
          </button>
        </div>
      )}

      {state === 'open' && (
        <div ref={boxRef} className="max-w-xl mx-auto rounded-2xl border border-slate-200 bg-card p-5 sm:p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <span className="shrink-0 w-9 h-9 rounded-full bg-brand-soft text-ink flex items-center justify-center">
              <MessageSquareWarning className="w-4 h-4" aria-hidden />
            </span>
            <div className="min-w-0 flex-1">
              <h2 id={titleId} className="font-bold text-ink leading-snug">
                {t('feedback.prompt')}
              </h2>
              <p className="mt-1 text-sm text-slate-600">{t('feedback.intro')}</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label={t('feedback.close')}
              className="-mt-1 -mr-1 shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-slate-500 hover:text-ink hover:bg-page cursor-pointer"
            >
              <X className="w-4 h-4" aria-hidden />
            </button>
          </div>

          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            <fieldset>
              <legend className="text-sm font-medium text-slate-700 mb-2">{t('feedback.kindLabel')}</legend>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_KINDS.map(k => (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={kind === k}
                    onClick={() => setKind(k)}
                    className={`rounded-full px-3.5 py-1.5 text-sm font-medium border transition-colors cursor-pointer ${
                      kind === k
                        ? 'bg-night text-white border-night'
                        : 'bg-card text-slate-700 border-slate-300 hover:border-ink'
                    }`}
                  >
                    {t(`feedback.kinds.${k}`)}
                  </button>
                ))}
              </div>
            </fieldset>

            <TextAreaField
              label={t('feedback.message')}
              placeholder={t('feedback.placeholder')}
              rows={3}
              maxLength={2000}
              value={message}
              onChange={e => setMessage(e.target.value)}
              error={errors.message}
            />

            {!user && (
              <TextField
                label={t('feedback.email')}
                hint={t('feedback.emailHint')}
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                error={errors.email}
              />
            )}

            {sendError && <Alert variant="error">{sendError}</Alert>}

            <p className="text-xs text-slate-500">{t('feedback.context')}</p>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2">
              <Button variant="secondary" onClick={close}>
                {t('feedback.cancel')}
              </Button>
              <Button type="submit" loading={busy}>
                {t('feedback.send')}
              </Button>
            </div>
          </form>
        </div>
      )}

      {state === 'sent' && (
        <div
          role="status"
          className="max-w-xl mx-auto rounded-2xl border border-slate-200 bg-card p-5 sm:p-6 flex items-start gap-3"
        >
          <CheckCircle2 className="shrink-0 w-6 h-6 text-ink" aria-hidden />
          <div className="min-w-0 flex-1">
            <p id={titleId} className="font-bold text-ink">
              {t('feedback.thanks')}
            </p>
            <p className="mt-1 text-sm text-slate-600">{t('feedback.thanksHint')}</p>
          </div>
          <Button variant="link" className="text-sm shrink-0" onClick={() => setState('open')}>
            {t('feedback.another')}
          </Button>
        </div>
      )}
    </aside>
  );
}
