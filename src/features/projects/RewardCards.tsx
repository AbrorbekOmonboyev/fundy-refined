import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, Columns3, ImageOff, Info, Minus, Sparkles, X } from 'lucide-react';
import type { ProjectDetail } from '@/features/projects/api';
import { discountPercent, isLowStock, rewardStatus, sortRewards, unitsLeft } from '@/features/projects/rewards';
import { publicFileUrl, responsiveImage } from '@/lib/supabase';
import { formatDate, formatMoney, formatNumber } from '@/lib/money';
import { useCart } from '@/features/cart/cart';

export type Reward = ProjectDetail['rewards'][number];

const imageOf = (path: string) => publicFileUrl('project-images', path) ?? path;

/**
 * Rewards and add-ons: cards with price, retail price and saving, real stock,
 * delivery, a details window and a compare tool (docs/PLAN-rewards-and-pledges.md, Phase A).
 * "Add to cart" puts a reward or add-on in the pledge cart (Phase B) and opens it.
 */
export function RewardsSection({
  project,
  canBack,
  onChoose,
}: {
  project: ProjectDetail;
  canBack: boolean;
  onChoose: (rewardId: string) => void;
}) {
  const { t } = useTranslation();
  const [details, setDetails] = useState<Reward | null>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const cart = useCart(project.id);
  const inCart = (id: string) => cart.lines.find(l => l.rewardId === id)?.quantity ?? 0;

  const visible = project.rewards.filter(r => !r.is_hidden);
  const main = sortRewards(visible.filter(r => r.kind === 'reward'));
  const addons = sortRewards(visible.filter(r => r.kind === 'addon'));
  if (visible.length === 0) return null;

  const toggleCompare = (id: string) =>
    setCompare(c => (c.includes(id) ? c.filter(x => x !== id) : c.length >= 4 ? c : [...c, id]));

  return (
    <div className="space-y-10">
      <section aria-labelledby="rewards-main" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="rewards-main" className="text-lg font-bold text-ink">
              {t('rewards.title')}
            </h2>
            <p className="text-sm text-slate-600">{t('rewards.hint')}</p>
          </div>
          {main.length > 1 && (
            <p className="text-xs text-slate-500 flex items-center gap-1.5">
              <Columns3 className="w-4 h-4" aria-hidden />
              {t('rewards.compareHint')}
            </p>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {main.map(r => (
            <RewardCard
              key={r.id}
              reward={r}
              canBack={canBack}
              onChoose={() => onChoose(r.id)}
              inCart={inCart(r.id)}
              onDetails={() => setDetails(r)}
              compareChecked={main.length > 1 ? compare.includes(r.id) : undefined}
              onCompare={() => toggleCompare(r.id)}
            />
          ))}
        </div>
      </section>

      {addons.length > 0 && (
        <section aria-labelledby="rewards-addons" className="space-y-4" id="addons">
          <div>
            <h2 id="rewards-addons" className="text-lg font-bold text-ink">
              {t('rewards.addonsTitle')}
            </h2>
            <p className="text-sm text-slate-600">{t('rewards.addonsHint')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {addons.map(r => (
              <RewardCard
                key={r.id}
                reward={r}
                compact
                canBack={canBack}
                onChoose={() => onChoose(r.id)}
                inCart={inCart(r.id)}
                onDetails={() => setDetails(r)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Compare bar */}
      {compare.length > 0 && (
        <div className="sticky bottom-24 lg:bottom-4 z-20 flex justify-center pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-3 rounded-md bg-night text-white pl-5 pr-2 py-2 shadow-lg">
            <span className="text-sm">{t('rewards.selected', { count: compare.length })}</span>
            <button
              type="button"
              onClick={() => setComparing(true)}
              disabled={compare.length < 2}
              className="rounded-md bg-brand text-night px-4 py-2 text-sm font-semibold disabled:opacity-50 cursor-pointer"
            >
              {t('rewards.compare')}
            </button>
            <button
              type="button"
              onClick={() => setCompare([])}
              aria-label={t('rewards.clearCompare')}
              className="p-2 rounded-full hover:bg-white/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {details && (
        <RewardDetails
          reward={details}
          canBack={canBack}
          onChoose={() => {
            setDetails(null);
            onChoose(details.id);
          }}
          onClose={() => setDetails(null)}
        />
      )}
      {comparing && (
        <CompareDialog rewards={main.filter(r => compare.includes(r.id))} onClose={() => setComparing(false)} />
      )}
    </div>
  );
}

/** Price line: "850 000 so'm  1 100 000 so'm  −23%". */
function Price({ reward, large = false }: { reward: Reward; large?: boolean }) {
  const pct = discountPercent(reward);
  return (
    <p className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <span className={`font-bold text-ink font-mono-numbers ${large ? 'text-2xl' : 'text-lg'}`}>
        {formatMoney(reward.amount)}
      </span>
      {pct !== null && (
        <>
          <s className="text-sm text-slate-500 font-mono-numbers">{formatMoney(reward.compare_at_amount!)}</s>
          <span className="rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-night">−{pct}%</span>
        </>
      )}
    </p>
  );
}

function Badges({ reward }: { reward: Reward }) {
  const { t } = useTranslation();
  const status = rewardStatus(reward);
  const left = unitsLeft(reward);
  const badges: { text: string; tone: string }[] = [];
  if (reward.is_featured && status === 'available')
    badges.push({ text: t('rewards.featured'), tone: 'bg-night text-white' });
  if (status === 'soldOut') badges.push({ text: t('rewards.soldOut'), tone: 'bg-slate-200 text-slate-700' });
  else if (status === 'ended') badges.push({ text: t('rewards.ended'), tone: 'bg-slate-200 text-slate-700' });
  else if (status === 'upcoming') badges.push({ text: t('rewards.upcoming'), tone: 'bg-sky-100 text-sky-800' });
  else if (left !== null && isLowStock(reward))
    badges.push({ text: t('rewards.fewLeft', { count: left }), tone: 'bg-amber-100 text-amber-800' });
  if (reward.available_until && status === 'available')
    badges.push({ text: t('rewards.earlyBird'), tone: 'bg-brand-soft text-ink' });
  if (reward.is_digital) badges.push({ text: t('rewards.digital'), tone: 'bg-slate-100 text-slate-700' });
  if (badges.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map(b => (
        <span key={b.text} className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${b.tone}`}>
          {b.text}
        </span>
      ))}
    </div>
  );
}

function RewardCard({
  reward: r,
  compact = false,
  canBack,
  onChoose,
  onDetails,
  compareChecked,
  onCompare,
  inCart = 0,
}: {
  reward: Reward;
  compact?: boolean;
  canBack: boolean;
  inCart?: number;
  onChoose?: () => void;
  onDetails: () => void;
  compareChecked?: boolean;
  onCompare?: () => void;
}) {
  const { t } = useTranslation();
  const status = rewardStatus(r);
  const left = unitsLeft(r);
  const image = r.image_paths[0];
  const dim = status === 'soldOut' || status === 'ended';

  return (
    <article
      className={`bg-card rounded-2xl border overflow-hidden flex flex-col ${
        r.is_featured && !dim ? 'border-ink' : 'border-slate-200'
      } ${dim ? 'opacity-70' : ''}`}
    >
      {!compact && image && (
        <button
          type="button"
          onClick={onDetails}
          className="block aspect-[16/9] bg-slate-100 overflow-hidden cursor-zoom-in"
        >
          <img
            {...responsiveImage(imageOf(image))}
            sizes="(min-width: 768px) 400px, 100vw"
            alt={r.title}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </button>
      )}
      <div className="p-4 sm:p-5 flex-1 flex flex-col gap-3">
        <Badges reward={r} />
        <div>
          <h3 className="font-bold text-ink leading-snug">{r.title}</h3>
          <div className="mt-1">
            <Price reward={r} />
          </div>
        </div>
        {r.description && <p className="text-sm text-slate-600 leading-relaxed">{r.description}</p>}

        {r.reward_components.length > 0 && !compact && (
          <ul className="text-sm text-slate-700 space-y-1">
            {r.reward_components.map(c => (
              <li key={c.id} className="flex items-start gap-2">
                <Check className="w-4 h-4 mt-0.5 text-brand-deep shrink-0" aria-hidden />
                <span className="min-w-0">
                  {c.name}
                  {c.quantity > 1 && <span className="font-semibold"> ×{c.quantity}</span>}
                </span>
              </li>
            ))}
          </ul>
        )}

        <dl className="mt-auto pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-500">
          {r.estimated_delivery && (
            <div>
              <dt>{r.is_digital ? t('rewards.access') : t('rewards.delivery')}</dt>
              <dd className="font-semibold text-ink">{r.estimated_delivery}</dd>
            </div>
          )}
          <div className={r.estimated_delivery ? 'text-right' : ''}>
            <dt>{left !== null ? t('rewards.leftLabel') : t('rewards.chosenLabel')}</dt>
            <dd className="font-semibold text-ink font-mono-numbers">
              {left !== null
                ? t('rewards.leftOf', { left: formatNumber(left), total: formatNumber(r.quantity_limit!) })
                : t('rewards.chosen', { count: r.claimed_count, formatted: formatNumber(r.claimed_count) })}
            </dd>
          </div>
          {r.per_backer_limit && (
            <div className="col-span-2">{t('rewards.perBacker', { count: r.per_backer_limit })}</div>
          )}
          {r.available_until && status === 'available' && (
            <div className="col-span-2">{t('rewards.until', { date: formatDate(r.available_until) })}</div>
          )}
        </dl>

        <div className="flex flex-wrap items-center gap-2">
          {canBack && onChoose && (
            <button
              type="button"
              disabled={status !== 'available'}
              onClick={onChoose}
              className="flex-1 min-w-32 py-2.5 rounded-md bg-night text-white text-sm font-semibold hover:bg-night-soft disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {status === 'available'
                ? inCart > 0
                  ? t('rewards.addMore', { count: inCart })
                  : t('rewards.addToCart')
                : t(`rewards.${status}`)}
            </button>
          )}
          <button
            type="button"
            onClick={onDetails}
            className="py-2.5 px-4 rounded-md border border-slate-300 text-sm font-semibold text-ink hover:bg-slate-50 cursor-pointer inline-flex items-center gap-1.5"
          >
            <Info className="w-4 h-4" aria-hidden />
            {t('rewards.details')}
          </button>
          {compareChecked !== undefined && onCompare && (
            <label className="ml-auto inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer py-2">
              <input type="checkbox" checked={compareChecked} onChange={onCompare} className="w-4 h-4 accent-ink" />
              {t('rewards.compareOne')}
            </label>
          )}
        </div>
        {compact && (
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" aria-hidden />
            {t('rewards.addonHint')}
          </p>
        )}
      </div>
    </article>
  );
}

/** Shared modal frame: Escape closes, focus moves in, background doesn't scroll. */
function Modal({
  label,
  onClose,
  children,
  wide = false,
}: {
  label: string;
  onClose: () => void;
  children: ReactNode;
  wide?: boolean;
}) {
  const { t } = useTranslation();
  const ref = useRef<HTMLDivElement>(null);
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
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-night/50 sm:p-4"
      onMouseDown={e => e.target === e.currentTarget && onClose()}
    >
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`relative bg-card w-full ${wide ? 'sm:max-w-4xl' : 'sm:max-w-3xl'} max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl shadow-2xl outline-none`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t('common.close')}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-card/90 flex items-center justify-center text-slate-600 hover:text-ink cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

function RewardDetails({
  reward: r,
  canBack,
  onChoose,
  onClose,
}: {
  reward: Reward;
  canBack: boolean;
  onChoose: () => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const [index, setIndex] = useState(0);
  const [zoom, setZoom] = useState(false);
  const status = rewardStatus(r);
  const images = r.image_paths.map(imageOf);

  return (
    <Modal label={r.title} onClose={onClose}>
      <div className="grid md:grid-cols-2">
        <div className="bg-slate-100 md:rounded-l-2xl overflow-hidden">
          {images.length > 0 ? (
            <>
              <button
                type="button"
                onClick={() => setZoom(z => !z)}
                aria-label={t('rewards.zoom')}
                className={`block w-full aspect-square overflow-hidden ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              >
                <img
                  {...responsiveImage(images[index])}
                  sizes="(min-width: 768px) 450px, 100vw"
                  alt={r.title}
                  className={`w-full h-full object-cover transition-transform duration-300 ${zoom ? 'scale-150' : ''}`}
                />
              </button>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      onClick={() => setIndex(i)}
                      aria-label={t('rewards.photo', { n: i + 1 })}
                      aria-pressed={i === index}
                      className={`w-16 h-16 shrink-0 rounded-lg overflow-hidden border-2 ${i === index ? 'border-ink' : 'border-transparent'}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="aspect-square flex items-center justify-center text-slate-300">
              <ImageOff className="w-10 h-10" aria-hidden />
            </div>
          )}
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          <Badges reward={r} />
          <h2 className="text-xl text-ink pr-10">{r.title}</h2>
          <Price reward={r} large />
          {r.description && <p className="text-sm text-slate-700">{r.description}</p>}

          {r.reward_components.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-ink mb-2">{t('rewards.consistsOf')}</h3>
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {r.reward_components.map(c => (
                  <li key={c.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                    <span className="text-slate-700 min-w-0">{c.name}</span>
                    <span className="font-semibold text-ink font-mono-numbers shrink-0">×{c.quantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {r.long_description && (
            <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{r.long_description}</p>
          )}

          <dl className="grid grid-cols-2 gap-3 text-sm rounded-xl bg-page p-3">
            {r.estimated_delivery && (
              <div>
                <dt className="text-xs text-slate-500">{r.is_digital ? t('rewards.access') : t('rewards.delivery')}</dt>
                <dd className="font-semibold text-ink">{r.estimated_delivery}</dd>
              </div>
            )}
            <div>
              <dt className="text-xs text-slate-500">{t('rewards.chosenLabel')}</dt>
              <dd className="font-semibold text-ink font-mono-numbers">
                {t('rewards.chosen', { count: r.claimed_count, formatted: formatNumber(r.claimed_count) })}
              </dd>
            </div>
          </dl>

          {canBack && (
            <button
              type="button"
              disabled={status !== 'available'}
              onClick={onChoose}
              className="w-full py-3 rounded-md bg-night text-white font-semibold hover:bg-night-soft disabled:opacity-50 cursor-pointer"
            >
              {status === 'available' ? t('rewards.addToCart') : t(`rewards.${status}`)}
            </button>
          )}
          {r.kind === 'addon' && <p className="text-xs text-slate-500">{t('rewards.addonHint')}</p>}
        </div>
      </div>
    </Modal>
  );
}

/** Side-by-side table of what each reward includes. */
function CompareDialog({ rewards, onClose }: { rewards: Reward[]; onClose: () => void }) {
  const { t } = useTranslation();
  const names = [...new Set(rewards.flatMap(r => r.reward_components.map(c => c.name)))];
  const qty = (r: Reward, name: string) => r.reward_components.find(c => c.name === name)?.quantity;

  return (
    <Modal label={t('rewards.compare')} onClose={onClose} wide>
      <div className="p-5 sm:p-6 space-y-4">
        <h2 className="text-xl text-ink pr-10">{t('rewards.compare')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse min-w-[480px]">
            <thead>
              <tr>
                <th className="text-left p-3 align-bottom text-slate-500 font-medium w-1/3">&nbsp;</th>
                {rewards.map(r => (
                  <th key={r.id} className="p-3 text-left align-bottom">
                    <span className="block font-bold text-ink">{r.title}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <th className="text-left p-3 font-medium text-slate-600">{t('rewards.price')}</th>
                {rewards.map(r => (
                  <td key={r.id} className="p-3">
                    <Price reward={r} />
                  </td>
                ))}
              </tr>
              {names.map(name => (
                <tr key={name}>
                  <th className="text-left p-3 font-medium text-slate-700">{name}</th>
                  {rewards.map(r => {
                    const q = qty(r, name);
                    return (
                      <td key={r.id} className="p-3">
                        {q ? (
                          <span className="inline-flex items-center gap-1 font-semibold text-ink">
                            <Check className="w-4 h-4 text-brand-deep" aria-label={t('rewards.included')} />
                            {q > 1 && `×${q}`}
                          </span>
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300" aria-label={t('rewards.notIncluded')} />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              <tr>
                <th className="text-left p-3 font-medium text-slate-600">{t('rewards.delivery')}</th>
                {rewards.map(r => (
                  <td key={r.id} className="p-3 text-slate-700">
                    {r.estimated_delivery ?? '—'}
                  </td>
                ))}
              </tr>
              <tr>
                <th className="text-left p-3 font-medium text-slate-600">{t('rewards.leftLabel')}</th>
                {rewards.map(r => {
                  const left = unitsLeft(r);
                  return (
                    <td key={r.id} className="p-3 font-mono-numbers text-slate-700">
                      {left === null ? t('rewards.unlimited') : formatNumber(left)}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-slate-500 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5" aria-hidden />
          {t('rewards.compareNote')}
        </p>
      </div>
    </Modal>
  );
}
