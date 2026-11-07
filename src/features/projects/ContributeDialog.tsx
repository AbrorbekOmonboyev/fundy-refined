import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, ShieldAlert, X } from 'lucide-react';
import { contribute, type ProjectDetail } from '@/features/projects/api';
import { projectKeys } from '@/features/projects/hooks';
import { rewardStatus } from '@/features/projects/rewards';
import { errorKey } from '@/features/auth/errors';
import { formatMoney, formatNumber } from '@/lib/money';
import { Alert, Button } from '@/components/ui';
import type { Database } from '@/lib/database.types';

type PaymentMethod = Database['public']['Enums']['payment_method'];
const METHODS: PaymentMethod[] = ['click', 'payme', 'uzcard', 'humo', 'bank_wire'];

function presets(project: ProjectDetail): number[] {
  if (project.model === 'equity' && project.equity) {
    const min = project.equity.min_investment;
    return [min, min * 2, min * 5, min * 10];
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
  const [amount, setAmount] = useState<number>(initialTier?.amount ?? presets(project)[0] ?? project.minContribution);
  const [method, setMethod] = useState<PaymentMethod>('click');
  const [anonymous, setAnonymous] = useState(false);
  const [acceptedRisk, setAcceptedRisk] = useState(project.model !== 'equity');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/projects/${project.slug}`;

  const minimum = Math.max(project.minContribution, project.equity?.min_investment ?? 0);
  const tier = project.rewards.find(r => r.id === rewardId) ?? null;
  // Only main rewards; add-ons come with the cart (Phase B). Hidden ones never show.
  const choosable = project.rewards.filter(r => r.kind === 'reward' && !r.is_hidden);
  const share = project.equity ? (amount / project.targetAmount) * project.equity.investor_profit_share_pct : 0;
  // What this amount does for the project, in plain words.
  const remaining = Math.max(0, project.targetAmount - project.raisedAmount);
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
    if (tier && amount < tier.amount) {
      setError(t('errors.amountBelowRewardPrice'));
      return;
    }
    setBusy(true);
    try {
      await contribute({ projectId: project.id, amount, paymentMethod: method, rewardTierId: rewardId, anonymous });
      setDone(true);
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    } catch (e) {
      const key = errorKey(e);
      setError(key === 'errors.amountBelowMinimum' ? t(key, { min: formatMoney(minimum) }) : t(key));
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
              {t(`contribute.title.${project.model}`)}
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
          <div className="p-6 space-y-4 text-center">
            <CheckCircle2 className="w-12 h-12 text-ink mx-auto" aria-hidden />
            <h3 className="text-lg font-bold text-ink">{t('contribute.successTitle')}</h3>
            <p className="text-sm text-slate-600">
              {t('contribute.successText', { amount: formatMoney(amount), project: title })}
            </p>
            {tier && <p className="text-xs text-slate-500">{t('contribute.successReward', { reward: tier.title })}</p>}

            {/* Every backer can bring the next one */}
            <div className="rounded-2xl bg-brand-soft border border-brand p-4 space-y-3 text-left">
              <p className="text-sm font-semibold text-ink">{t('contribute.shareTitle')}</p>
              <p className="text-sm text-slate-700">{t('contribute.shareText')}</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(t('contribute.shareMessage', { project: title }))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 rounded-xl bg-[#229ED9] text-white text-sm font-semibold text-center hover:opacity-90"
                >
                  Telegram
                </a>
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard?.writeText(shareUrl).then(() => setCopied(true));
                  }}
                  className="py-3 rounded-xl border border-slate-300 bg-card text-sm font-semibold text-ink cursor-pointer"
                >
                  {copied ? t('project.copied') : t('project.copyLink')}
                </button>
              </div>
            </div>

            <p className="text-xs text-slate-500">{t('contribute.demoNote')}</p>
            <Button onClick={onClose} fullWidth variant="secondary">
              {t('common.close')}
            </Button>
          </div>
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
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presets(project).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setAmount(p)}
                    aria-pressed={amount === p}
                    className={`py-3 rounded-xl border text-sm font-semibold font-mono-numbers ${
                      amount === p
                        ? 'border-ink bg-brand-soft text-ink'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {formatMoney(p, true)}
                  </button>
                ))}
              </div>
              <label className="block">
                <span className="sr-only">{t('contribute.customAmount')}</span>
                <input
                  type="number"
                  inputMode="numeric"
                  min={minimum}
                  step={1000}
                  value={amount || ''}
                  onChange={e => setAmount(Math.round(Number(e.target.value)))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-mono-numbers focus:outline-none focus:ring-2 focus:ring-brand"
                />
              </label>
              <p className="text-xs text-slate-500">{t('contribute.minimum', { min: formatMoney(minimum) })}</p>
              {impact && <p className="text-sm font-medium text-ink">{impact}</p>}
            </fieldset>

            {project.equity && (
              <div className="rounded-lg bg-brand-soft border border-brand p-3 text-xs text-ink">
                {t('contribute.equityShare', {
                  share: formatNumber(share, 2),
                  pool: project.equity.investor_profit_share_pct,
                })}
              </div>
            )}

            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-700 mb-1">{t('contribute.method')}</legend>
              <div className="flex flex-wrap gap-2">
                {METHODS.map(m => (
                  <button
                    key={m}
                    type="button"
                    aria-pressed={method === m}
                    onClick={() => setMethod(m)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      method === m
                        ? 'border-ink bg-brand-soft text-ink'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {t(`contribute.methods.${m}`)}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="flex items-start gap-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={anonymous}
                onChange={e => setAnonymous(e.target.checked)}
                className="mt-0.5 accent-ink"
              />
              {t('contribute.anonymous')}
            </label>

            {project.model === 'equity' && (
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

            {error && <Alert variant="error">{error}</Alert>}

            <Button type="submit" fullWidth loading={busy} disabled={!acceptedRisk}>
              {t('contribute.submit', { amount: formatMoney(amount || 0) })}
            </Button>
            <p className="text-xs text-slate-400 text-center">{t('contribute.demoNote')}</p>
          </form>
        )}
      </div>
    </div>
  );
}
