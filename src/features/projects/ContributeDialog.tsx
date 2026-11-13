import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldAlert, X } from 'lucide-react';
import { contribute, type ProjectDetail } from '@/features/projects/api';
import { projectKeys } from '@/features/projects/hooks';
import { rewardStatus } from '@/features/projects/rewards';
import { errorKey } from '@/features/auth/errors';
import { formatDate, formatMoney, formatNumber, parseAmount } from '@/lib/money';
import { Alert, Button } from '@/components/ui';
import type { Database } from '@/lib/database.types';
import { BackerSuccess } from '@/features/projects/BackerSuccess';
import { paths } from '@/app/routes';
import { PAYMENT_DAYS, REGISTRATION_DAYS, expectedChargeDate } from '@/features/wizard/organizer';
import { DONATION_ONLY } from '@/lib/focus';

type PaymentMethod = Database['public']['Enums']['payment_method'];
/** Optional tip for Fundy, as a share of the donation. Starts at 0: the donor chooses. */
const TIP_PERCENTS = [0, 5, 10, 15] as const;
const tipFor = (amount: number, percent: number) => Math.round((amount * percent) / 100 / 1000) * 1000;
const METHODS: PaymentMethod[] = ['click', 'payme', 'uzcard', 'humo', 'bank_wire'];

function presets(project: ProjectDetail): number[] {
  if (project.model === 'equity' && project.equity) {
    // Never more than what is left of the goal (the database refuses it too).
    const left = Math.max(0, project.targetAmount - project.raisedAmount);
    const min = project.equity.min_investment;
    const fit = [min, min * 2, min * 5, min * 10].filter(a => a < left);
    return left > 0 ? [...fit.slice(0, 3), left] : fit;
  }
  return [50_000, 100_000, 250_000, 500_000, 1_000_000].filter(a => a >= project.minContribution).slice(0, 4);
}

/**
 * Back a project (simulated payment — no money moves).
 * The database function `contribute` checks every rule and updates the totals.
 */
export function ContributeDialog({
  project,
  title,
  initialRewardId,
  onClose,
}: {
  project: ProjectDetail;
  title: string;
  initialRewardId: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const dialogRef = useRef<HTMLDivElement>(null);

  const initialTier = project.rewards.find(r => r.id === initialRewardId) ?? null;
  const [rewardId, setRewardId] = useState<string | null>(initialTier?.id ?? null);
  const amountPresets = presets(project);
  // Donors choose their own amount: nothing is pre-selected or recommended.
  const [amount, setAmount] = useState<number>(
    initialTier?.amount ?? (project.model === 'donation' ? 0 : (amountPresets[0] ?? project.minContribution)),
  );
  // What the person is typing; null shows the parsed amount, neatly grouped ("100 000").
  const [amountText, setAmountText] = useState<string | null>(null);
  const [method, setMethod] = useState<PaymentMethod>('click');
  const [anonymous, setAnonymous] = useState(false);
  const [acceptedRisk, setAcceptedRisk] = useState(project.model !== 'equity');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [contributionId, setContributionId] = useState<string | null>(null);
  const [tipPercent, setTipPercent] = useState<number>(0);
  const tips = project.model === 'donation';
  const tip = tips ? tipFor(amount || 0, tipPercent) : 0;
  const shareUrl = `${window.location.origin}/projects/${project.slug}`;
  // No company yet: this is a promise to invest. Payment comes after the MChJ is registered.
  const pledge = project.payAfterRegistration;
  // Pledging = permission to charge the card on this day, only if the company is registered.
  const chargeDate = formatDate(expectedChargeDate(project));
  const [allowCharge, setAllowCharge] = useState(false);

  // What is left of the goal. Investment pledges stop there; the last piece may be under the minimum.
  const remaining = Math.max(0, project.targetAmount - project.raisedAmount);
  const capped = project.model === 'equity';
  const fullMinimum = Math.max(project.minContribution, project.equity?.min_investment ?? 0);
  const minimum = capped && remaining > 0 ? Math.min(fullMinimum, remaining) : fullMinimum;
  const tier = project.rewards.find(r => r.id === rewardId) ?? null;
  // Only main rewards; add-ons come with the cart (Phase B). Hidden ones never show.
  const choosable = project.rewards.filter(r => r.kind === 'reward' && !r.is_hidden);
  const share = project.equity ? (amount / project.targetAmount) * project.equity.investor_profit_share_pct : 0;
  // What this amount does for the project, in plain words.
  const impact =
    !amount || amount < minimum
      ? null
      : remaining > 0 && amount >= remaining
        ? t('contribute.completesGoal')
        : t('contribute.bringsCloser', { percent: formatNumber((amount / project.targetAmount) * 100, 2) });

  // Close on Escape; focus the dialog when it opens.
  useEffect(() => {
    dialogRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function chooseReward(id: string | null) {
    setRewardId(id);
    const chosen = project.rewards.find(r => r.id === id);
    if (chosen && amount < chosen.amount) setAmount(chosen.amount);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (!Number.isFinite(amount) || amount < minimum) {
      setError(t('errors.amountBelowMinimum', { min: formatMoney(minimum) }));
      return;
    }
    if (capped && amount > remaining) {
      setError(t('errors.amountAboveRemaining', { left: formatMoney(remaining) }));
      return;
    }
    if (tier && amount < tier.amount) {
      setError(t('errors.amountBelowRewardPrice'));
      return;
    }
    setBusy(true);
    try {
      const id = await contribute({
        projectId: project.id,
        amount,
        paymentMethod: method,
        rewardTierId: rewardId,
        anonymous,
        tipAmount: tip,
      });
      setContributionId(id);
      setDone(true);
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    } catch (e) {
      const key = errorKey(e);
      setError(
        key === 'errors.amountBelowMinimum'
          ? t(key, { min: formatMoney(minimum) })
          : key === 'errors.amountAboveRemaining'
            ? t(key, { left: formatMoney(remaining) })
            : t(key),
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-night/50 p-0 sm:p-4"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="contribute-title"
        tabIndex={-1}
        className="bg-card w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl outline-none"
      >
        <header className="sticky top-0 bg-card border-b border-slate-100 px-5 py-4 flex items-start justify-between gap-4">
          <div>
            <h2 id="contribute-title" className="text-base font-bold text-ink">
              {pledge ? t('contribute.title.pledge') : t(`contribute.title.${project.model}`)}
            </h2>
            <p className="text-xs text-slate-500 line-clamp-1">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="p-1 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {done ? (
          <BackerSuccess
            title={title}
            shareUrl={shareUrl}
            detail={
              pledge
                ? t('contribute.pledgeSuccess', {
                    amount: formatMoney(amount),
                    project: title,
                    date: chargeDate,
                  })
                : t('contribute.successText', { amount: formatMoney(amount), project: title })
            }
            extra={tier ? t('contribute.successReward', { reward: tier.title }) : undefined}
            receiptHref={contributionId && !pledge ? paths.receipt(contributionId) : undefined}
            onClose={onClose}
          />
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {project.model === 'reward' && choosable.length > 0 && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-700 mb-1">{t('contribute.reward')}</legend>
                {[null, ...choosable].map(r => {
                  // sold out, not yet open or ended: shown but can't be picked
                  const soldOut = !!r && rewardStatus(r) !== 'available';
                  return (
                    <label
                      key={r?.id ?? 'none'}
                      className={`flex items-start gap-2.5 rounded-lg border p-3 text-sm ${soldOut ? 'opacity-50' : 'cursor-pointer'} ${
                        rewardId === (r?.id ?? null) ? 'border-ink bg-brand-soft' : 'border-slate-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="reward"
                        disabled={soldOut}
                        checked={rewardId === (r?.id ?? null)}
                        onChange={() => chooseReward(r?.id ?? null)}
                        className="mt-0.5 accent-ink"
                      />
                      <span className="flex-1">
                        <span className="flex justify-between gap-2 font-medium text-ink">
                          <span>{r ? r.title : t('contribute.noReward')}</span>
                          {r && (
                            <span className="font-mono-numbers text-ink shrink-0">{formatMoney(r.amount, true)}</span>
                          )}
                        </span>
                        {soldOut && <span className="text-xs text-rose-600">{t('project.soldOut')}</span>}
                      </span>
                    </label>
                  );
                })}
              </fieldset>
            )}

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-700 mb-1">{t('contribute.amount')}</legend>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {amountPresets.map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => {
                      setAmount(p);
                      setAmountText(null);
                    }}
                    aria-pressed={amount === p}
                    className={`relative min-h-14 rounded-md border text-base font-semibold font-mono-numbers transition-colors cursor-pointer ${
                      amount === p
                        ? 'border-brand bg-brand-soft text-ink ring-1 ring-brand'
                        : 'border-slate-200 text-slate-700 hover:border-slate-400'
                    }`}
                  >
                    {formatMoney(p, true)}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="sr-only">{t('contribute.customAmount')}</span>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={amountText ?? (amount ? formatNumber(amount) : '')}
                  onChange={e => {
                    setAmountText(e.target.value);
                    setAmount(parseAmount(e.target.value));
                  }}
                  onBlur={() => setAmountText(null)}
                  className="w-full min-h-12 rounded-md border border-slate-300 bg-card px-4 py-3 text-lg font-semibold font-mono-numbers text-ink focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand"
                />
              </label>
              <p className="text-xs text-slate-500">
                {t('contribute.minimum', { min: formatMoney(minimum) })}
                {capped && <> · {t('contribute.upTo', { left: formatMoney(remaining) })}</>}
              </p>
              {impact && <p className="text-sm font-medium text-ink">{impact}</p>}
            </fieldset>

            {!DONATION_ONLY && project.equity && (
              <div className="rounded-lg bg-page border border-slate-200 p-3 text-xs text-ink">
                {t('contribute.equityShare', {
                  share: formatNumber(share, 2),
                  pool: project.equity.investor_profit_share_pct,
                })}
              </div>
            )}

            {tips && (
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-700 mb-1">{t('contribute.tip.title')}</legend>
                <p className="text-xs text-slate-500">{t('contribute.tip.hint')}</p>
                <div className="grid grid-cols-4 gap-2">
                  {TIP_PERCENTS.map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTipPercent(p)}
                      aria-pressed={tipPercent === p}
                      className={`min-h-11 rounded-md border text-sm font-semibold font-mono-numbers cursor-pointer ${
                        tipPercent === p
                          ? 'border-brand bg-brand-soft text-ink ring-1 ring-brand'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {p === 0 ? t('contribute.tip.none') : `${p}%`}
                    </button>
                  ))}
                </div>
                {tip > 0 && (
                  <p className="text-xs text-slate-600">
                    {t('contribute.tip.summary', { tip: formatMoney(tip), total: formatMoney(amount + tip) })}
                  </p>
                )}
              </fieldset>
            )}

            {pledge && (
              <Alert variant="info">
                {t('payLater.dialog', { days: REGISTRATION_DAYS, payDays: PAYMENT_DAYS, date: chargeDate })}
              </Alert>
            )}
            {
              <fieldset className="space-y-2">
                <legend className="text-sm font-medium text-slate-700 mb-1">{t('contribute.method')}</legend>
                <div className="flex flex-wrap gap-2">
                  {METHODS.map(m => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={method === m}
                      onClick={() => setMethod(m)}
                      className={`min-h-11 px-4 rounded-md border text-sm font-semibold cursor-pointer ${
                        method === m
                          ? 'border-brand bg-brand-soft text-ink ring-1 ring-brand'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {t(`contribute.methods.${m}`)}
                    </button>
                  ))}
                </div>
              </fieldset>
            }

            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={e => setAnonymous(e.target.checked)}
                className="mt-0.5 accent-ink"
              />
              {t('contribute.anonymous')}
            </label>

            {!DONATION_ONLY && project.model === 'equity' && (
              <label className="flex items-start gap-2 text-xs text-slate-700 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <input
                  type="checkbox"
                  checked={acceptedRisk}
                  onChange={e => setAcceptedRisk(e.target.checked)}
                  className="mt-0.5 accent-ink"
                />
                <span className="flex gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" aria-hidden />
                  {t('contribute.equityRisk')}
                </span>
              </label>
            )}

            {pledge && (
              <label className="flex items-start gap-2 text-xs text-slate-700 rounded-lg border border-slate-200 bg-page p-3">
                <input
                  type="checkbox"
                  checked={allowCharge}
                  onChange={e => setAllowCharge(e.target.checked)}
                  className="mt-0.5 accent-ink"
                />
                <span>{t('payLater.allowCharge', { date: chargeDate })}</span>
              </label>
            )}

            {error && <Alert variant="error">{error}</Alert>}

            <Button type="submit" fullWidth loading={busy} disabled={!acceptedRisk || (pledge && !allowCharge)}>
              {pledge
                ? t('contribute.submitPledge', { amount: formatMoney(amount || 0) })
                : t('contribute.submit', { amount: formatMoney((amount || 0) + tip) })}
            </Button>
            <p className="text-xs text-slate-400 text-center">{t('contribute.demoNote')}</p>
          </form>
        )}
      </div>
    </div>
  );
}
