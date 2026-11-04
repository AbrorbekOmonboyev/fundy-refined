import type { FormEvent, ReactNode } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { paths } from '@/app/routes';
import { Alert, Button } from '@/components/ui';
import type { Draft } from '@/features/wizard/api';
import { STEPS, stepComplete, type Step } from '@/features/wizard/checks';

/** Frame around every wizard step: step list, title, the form, and Back / Save buttons. */
export function WizardShell({
  draft,
  step,
  title,
  hint,
  error,
  busy,
  onSubmit,
  submitLabel,
  children,
}: {
  draft: Draft | null; // null while creating a new project
  step: Step;
  title: string;
  hint?: string;
  error?: string | null;
  busy?: boolean;
  onSubmit?: (e: FormEvent) => void;
  submitLabel?: string;
  children: ReactNode;
}) {
  const { t } = useTranslation();
  const index = STEPS.indexOf(step);
  const previous = index > 0 ? STEPS[index - 1] : null;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 grid gap-8 lg:grid-cols-[220px_1fr]">
      <nav aria-label={t('wizard.steps')} className="lg:sticky lg:top-24 self-start">
        <ol className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {STEPS.map((s, i) => {
            const done = draft ? stepComplete(draft, s) : false;
            const current = s === step;
            const label = (
              <span className="flex items-center gap-2">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    current
                      ? 'bg-emerald-600 text-white'
                      : done
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {done && !current ? <Check className="w-3.5 h-3.5" aria-hidden /> : i + 1}
                </span>
                <span className="whitespace-nowrap">{t(`wizard.step.${s}`)}</span>
              </span>
            );
            const style = `block rounded-lg px-2 py-1.5 text-xs font-medium ${current ? 'bg-emerald-50 text-emerald-800' : 'text-slate-600'}`;
            return (
              <li key={s} aria-current={current ? 'step' : undefined}>
                {draft ? (
                  <Link to={paths.editProject(draft.project.id, s)} className={`${style} hover:bg-slate-100`}>
                    {label}
                  </Link>
                ) : (
                  <span className={style}>{label}</span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>

      <form
        onSubmit={onSubmit}
        noValidate
        className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-8 space-y-6 min-w-0"
      >
        <header>
          <p className="text-xs font-semibold text-emerald-700">
            {t('wizard.stepOf', { step: index + 1, total: STEPS.length })}
          </p>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{title}</h1>
          {hint && <p className="text-sm text-slate-600 mt-1">{hint}</p>}
        </header>

        {draft?.project.status === 'changes_requested' && draft.project.review_note && (
          <Alert variant="warning">
            <strong>{t('wizard.changesRequested')}</strong> {draft.project.review_note}
          </Alert>
        )}

        {children}

        {error && <Alert variant="error">{error}</Alert>}

        {onSubmit && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100">
            {draft && previous ? (
              <Link
                to={paths.editProject(draft.project.id, previous)}
                className="text-sm font-semibold text-slate-600 hover:text-slate-900"
              >
                ← {t('wizard.back')}
              </Link>
            ) : (
              <Link to={paths.founderDashboard} className="text-sm font-semibold text-slate-600 hover:text-slate-900">
                {t('common.cancel')}
              </Link>
            )}
            <Button type="submit" loading={busy}>
              {submitLabel ?? t('wizard.saveContinue')}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

/** Small "+ Add" / "Remove" list helpers used by budget, milestones and rewards. */
export function ListRow({ index, onRemove, children }: { index: number; onRemove: () => void; children: ReactNode }) {
  const { t } = useTranslation();
  return (
    <fieldset className="rounded-xl border border-slate-200 p-4 space-y-3 relative">
      <legend className="px-1 text-xs font-semibold text-slate-500">#{index + 1}</legend>
      {children}
      <Button variant="link" onClick={onRemove} className="text-rose-600 hover:text-rose-700">
        {t('wizard.remove')}
      </Button>
    </fieldset>
  );
}
