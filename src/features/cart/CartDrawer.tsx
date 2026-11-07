import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { errorKey } from '@/features/auth/errors';
import { contributeCart, type ProjectDetail } from '@/features/projects/api';
import { projectKeys } from '@/features/projects/hooks';
import { cartActions, maxQuantity, priceCart, useCart } from '@/features/cart/cart';
import { Alert, Button } from '@/components/ui';
import { formatMoney } from '@/lib/money';
import type { Database } from '@/lib/database.types';

type PaymentMethod = Database['public']['Enums']['payment_method'];
const METHODS: PaymentMethod[] = ['click', 'payme', 'uzcard', 'humo', 'bank_wire'];
const EXTRA_PRESETS = [0, 20_000, 50_000, 100_000];

/**
 * "Homiyligim" — the pledge cart for reward projects: rewards and add-ons with
 * quantities, optional extra support, then one (simulated) payment.
 */
export function CartDrawer({
  project,
  title,
  onClose,
}: {
  project: ProjectDetail;
  title: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const location = useLocation();
  const queryClient = useQueryClient();
  const ref = useRef<HTMLDivElement>(null);
  const cart = useCart(project.id);
  const actions = cartActions(project.id);
  const priced = priceCart(cart, project.rewards);
  const [method, setMethod] = useState<PaymentMethod>('click');
  const [anonymous, setAnonymous] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ total: number; count: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/projects/${project.slug}`;

  const addonAlone = priced.hasAddon && !priced.hasMain && !project.allowAddonsOnly;
  const belowMin = priced.total > 0 && priced.total < project.minContribution;
  const canPay = priced.total > 0 && !priced.hasProblems && !belowMin && !busy;

  useEffect(() => {
    ref.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      await contributeCart({
        projectId: project.id,
        items: priced.lines.map(l => ({ rewardId: l.rewardId, quantity: l.quantity })),
        extra: cart.extra,
        paymentMethod: method,
        anonymous,
      });
      setDone({ total: priced.total, count: priced.count });
      actions.clear();
      void queryClient.invalidateQueries({ queryKey: projectKeys.all });
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-night/50"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-title"
        tabIndex={-1}
        className="bg-card w-full sm:max-w-md h-full flex flex-col shadow-2xl outline-none"
      >
        <header className="flex items-start justify-between gap-4 px-5 py-4 border-b border-slate-200">
          <div className="min-w-0">
            <h2 id="cart-title" className="text-lg text-ink flex items-center gap-2">
              <ShoppingBag className="w-5 h-5" aria-hidden />
              {t('cart.title')}
            </h2>
            <p className="text-xs text-slate-500 line-clamp-1">{title}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('common.close')}
            className="w-10 h-10 -mr-2 rounded-full flex items-center justify-center text-slate-500 hover:text-ink cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {done ? (
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-center">
            <CheckCircle2 className="w-14 h-14 mx-auto text-brand-deep" aria-hidden />
            <h3 className="text-xl text-ink">{t('contribute.successTitle')}</h3>
            <p className="text-sm text-slate-600">
              {t('cart.successText', { amount: formatMoney(done.total), count: done.count })}
            </p>
            <div className="rounded-2xl border border-slate-200 p-4 space-y-3 text-left">
              <p className="text-sm font-semibold text-ink">{t('contribute.shareTitle')}</p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(t('contribute.shareMessage', { project: title }))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 rounded-md bg-[#229ED9] text-white text-sm font-semibold text-center hover:opacity-90"
                >
                  Telegram
                </a>
                <button
                  type="button"
                  onClick={() => void navigator.clipboard?.writeText(shareUrl).then(() => setCopied(true))}
                  className="py-3 rounded-md border border-slate-300 bg-card text-sm font-semibold text-ink cursor-pointer"
                >
                  {copied ? t('project.copied') : t('project.copyLink')}
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-500">{t('contribute.demoNote')}</p>
            <Button variant="secondary" fullWidth onClick={onClose}>
              {t('common.close')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
              {priced.lines.length === 0 ? (
                <p className="rounded-2xl bg-page p-4 text-sm text-slate-600">{t('cart.empty')}</p>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {priced.lines.map(l => (
                    <li key={l.rewardId} className="py-3 space-y-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-ink">{l.reward?.title ?? t('cart.gone')}</p>
                          {l.reward && (
                            <p className="text-xs text-slate-500">
                              {t(`wizard.rewards.kind.${l.reward.kind}`)} · {formatMoney(l.reward.amount)}
                            </p>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-ink font-mono-numbers shrink-0">
                          {l.problem ? '—' : formatMoney(l.lineTotal)}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        {l.reward && !l.problem ? (
                          <div className="inline-flex items-center rounded-full border border-slate-300">
                            <button
                              type="button"
                              onClick={() => actions.setQuantity(l.rewardId, l.quantity - 1)}
                              aria-label={t('cart.less')}
                              className="w-10 h-10 flex items-center justify-center text-ink cursor-pointer"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span
                              className="w-8 text-center text-sm font-semibold font-mono-numbers"
                              aria-live="polite"
                            >
                              {l.quantity}
                            </span>
                            <button
                              type="button"
                              disabled={l.quantity >= maxQuantity(l.reward)}
                              onClick={() => actions.setQuantity(l.rewardId, l.quantity + 1)}
                              aria-label={t('cart.more')}
                              className="w-10 h-10 flex items-center justify-center text-ink disabled:opacity-30 cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <p className="text-xs font-semibold text-rose-700">
                            {t(`cart.problem.${l.problem ?? 'missing'}`)}
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={() => actions.remove(l.rewardId)}
                          aria-label={t('wizard.remove')}
                          className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:text-rose-700 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {/* Extra support, on top of the rewards (or on its own) */}
              <fieldset className="space-y-2">
                <legend className="text-sm font-semibold text-ink">{t('cart.extra')}</legend>
                <p className="text-xs text-slate-500">{t('cart.extraHint')}</p>
                <div className="grid grid-cols-4 gap-2">
                  {EXTRA_PRESETS.map(p => (
                    <button
                      key={p}
                      type="button"
                      aria-pressed={cart.extra === p}
                      onClick={() => actions.setExtra(p)}
                      className={`py-2 rounded-md border text-xs font-semibold font-mono-numbers cursor-pointer ${
                        cart.extra === p ? 'border-ink bg-brand-soft text-ink' : 'border-slate-200 text-slate-700'
                      }`}
                    >
                      {p === 0 ? t('cart.noExtra') : formatMoney(p, true)}
                    </button>
                  ))}
                </div>
                <label className="block">
                  <span className="sr-only">{t('cart.extraOther')}</span>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={1000}
                    value={cart.extra || ''}
                    placeholder={t('cart.extraOther')}
                    onChange={e => actions.setExtra(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-card px-3 py-2.5 text-sm font-mono-numbers focus:outline-none focus:ring-1 focus:ring-ink focus:border-ink"
                  />
                </label>
              </fieldset>

              {addonAlone && <Alert variant="info">{t('cart.addonAlone')}</Alert>}
              {belowMin && (
                <Alert variant="warning">
                  {t('errors.amountBelowMinimum', { min: formatMoney(project.minContribution) })}
                </Alert>
              )}

              {/* Payment (simulated) */}
              {user && priced.total > 0 && (
                <fieldset className="space-y-2">
                  <legend className="text-sm font-semibold text-ink">{t('contribute.method')}</legend>
                  <div className="flex flex-wrap gap-2">
                    {METHODS.map(m => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={method === m}
                        onClick={() => setMethod(m)}
                        className={`px-3 py-2 rounded-md border text-xs font-semibold cursor-pointer ${
                          method === m ? 'border-ink bg-brand-soft text-ink' : 'border-slate-200 text-slate-700'
                        }`}
                      >
                        {t(`contribute.methods.${m}`)}
                      </button>
                    ))}
                  </div>
                  <label className="flex items-start gap-2 text-sm text-slate-700 pt-1">
                    <input
                      type="checkbox"
                      checked={anonymous}
                      onChange={e => setAnonymous(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-ink"
                    />
                    {t('contribute.anonymous')}
                  </label>
                </fieldset>
              )}
              {error && <Alert variant="error">{error}</Alert>}
            </div>

            <footer className="border-t border-slate-200 px-5 py-4 space-y-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
              <dl className="space-y-1 text-sm">
                <div className="flex justify-between text-slate-600">
                  <dt>{t('cart.items', { count: priced.count })}</dt>
                  <dd className="font-mono-numbers">{formatMoney(priced.itemsTotal)}</dd>
                </div>
                {cart.extra > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <dt>{t('cart.extra')}</dt>
                    <dd className="font-mono-numbers">{formatMoney(cart.extra)}</dd>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-ink pt-1">
                  <dt>{t('cart.total')}</dt>
                  <dd className="font-mono-numbers">{formatMoney(priced.total)}</dd>
                </div>
              </dl>
              {user ? (
                <Button fullWidth loading={busy} disabled={!canPay} onClick={() => void pay()} className="py-3.5">
                  {t('cart.pay', { amount: formatMoney(priced.total) })}
                </Button>
              ) : (
                <Link
                  to={`${paths.login}?next=${encodeURIComponent(`${location.pathname}?cart=open`)}`}
                  className="block w-full py-3.5 rounded-md bg-night text-white text-center font-semibold hover:bg-night-soft"
                >
                  {t('cart.loginToPay')}
                </Link>
              )}
              <p className="text-xs text-slate-500 text-center">{t('contribute.demoNote')}</p>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}
