import { useEffect, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, MessageSquareWarning, X } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { errorKey } from '@/features/auth/errors';
import { isValidEmail } from '@/features/auth/validation';
import { Alert, Button, TextAreaField, TextField } from '@/components/ui';
import { FEEDBACK_KINDS, sendFeedback, type FeedbackKind } from '@/features/feedback/api';
import { isAppMode } from '@/lib/appMode';

/** Pages where a feedback button would only get in the way. */
const HIDE_ON = [/^\/admin/, /^\/start\/new/, /^\/auth\//];

type State = 'closed' | 'open' | 'sent';

/**
 * "Shu sahifada nima kamchilik koʻrdingiz?" — always on screen, on every page: a pill in the
 * bottom-left corner (the cart button lives bottom-right). On phones it moves up above the
 * project page's "back this" bar and the app's tab bar.
 * It opens a small panel (computers) or a bottom sheet (phones). Mounted once for the
 * whole visit, so a half-written note survives moving between pages; the page address
 * is taken when the note is sent.
 */
export function PageFeedback() {
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
  const panelRef = useRef<HTMLDivElement>(null);
  const pillRef = useRef<HTMLButtonElement>(null);
  const returnFocus = useRef(false);

  // Going to another page closes the panel (the draft is kept).
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    if (state !== 'closed') setState('closed');
  }

  // After closing, the keyboard lands back on whichever button is on screen.
  useEffect(() => {
    if (state === 'closed' && returnFocus.current) {
      returnFocus.current = false;
      pillRef.current?.focus();
    }
  }, [state]);

  // Open: focus the text box; Esc closes.
  useEffect(() => {
    if (state === 'closed') return;
    if (state === 'open') panelRef.current?.querySelector('textarea')?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state]);

  if (HIDE_ON.some(r => r.test(pathname))) return null;

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
      setKind('bug');
    } catch (err) {
      setSendError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  }

  const isOpen = state !== 'closed';
  // Phones: project pages have a "back this" bar at the bottom, the app has its tab bar.
  const raised =
    pathname.startsWith('/projects/') || (isAppMode() && !/^\/(start\/new|dashboard\/founder\/)/.test(pathname));

  return (
    <>
      {/* Pill, bottom-left. On phones it sits above a bottom bar when the page has one. */}
      {!isOpen && (
        <button
          ref={pillRef}
          type="button"
          onClick={() => setState('open')}
          aria-haspopup="dialog"
          className={`feedback-trigger inline-flex fixed z-40 left-3 lg:left-6 ${raised ? 'bottom-[calc(5rem+env(safe-area-inset-bottom))]' : 'bottom-3'} lg:bottom-6 items-center gap-2 lg:gap-2.5 rounded-full border border-slate-200 bg-card py-1.5 pl-1.5 pr-3.5 lg:py-2 lg:pl-2 lg:pr-4 shadow-lg transition-colors hover:border-ink cursor-pointer`}
        >
          <span className="w-7 h-7 lg:w-8 lg:h-8 rounded-full bg-brand text-night flex items-center justify-center">
            <MessageSquareWarning className="w-4 h-4" aria-hidden />
          </span>
          <span className="text-xs lg:text-sm font-semibold text-ink whitespace-nowrap">
            {t('feedback.promptShort')}
          </span>
        </button>
      )}

      {isOpen && (
        <>
          {/* Phones: dim the page behind the sheet; tap outside to close */}
          <div className="lg:hidden fixed inset-0 z-50 bg-black/40" onClick={close} aria-hidden />
          <div
            ref={panelRef}
            role="dialog"
            aria-modal="false"
            aria-labelledby={titleId}
            className="fixed z-50 inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border-t border-slate-200 bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl
                       lg:inset-x-auto lg:left-6 lg:bottom-6 lg:w-[26rem] lg:max-h-[calc(100vh-3rem)] lg:rounded-2xl lg:border lg:p-6"
          >
            <div className="lg:hidden mx-auto -mt-2 mb-3 h-1 w-10 rounded-full bg-slate-300" aria-hidden />
            <div className="flex items-start gap-3">
              <span className="shrink-0 w-9 h-9 rounded-full bg-brand text-night flex items-center justify-center">
                <MessageSquareWarning className="w-4 h-4" aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <h2 id={titleId} className="font-bold text-ink leading-snug">
                  {state === 'sent' ? t('feedback.thanks') : t('feedback.prompt')}
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  {state === 'sent' ? t('feedback.thanksHint') : t('feedback.intro')}
                </p>
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

            {state === 'sent' ? (
              <div role="status" className="mt-5 flex items-center justify-between gap-3">
                <CheckCircle2 className="w-6 h-6 text-ink" aria-hidden />
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setState('open')}>
                    {t('feedback.another')}
                  </Button>
                  <Button onClick={close}>{t('feedback.close')}</Button>
                </div>
              </div>
            ) : (
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
            )}
          </div>
        </>
      )}
    </>
  );
}
