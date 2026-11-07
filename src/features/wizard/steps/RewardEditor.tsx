import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDown, ArrowUp, ImagePlus, Trash2, X } from 'lucide-react';
import { REWARD_IMAGE_MAX, uploadRewardImage, type Draft, type RewardTier } from '@/features/wizard/api';
import { errorKey } from '@/features/auth/errors';
import { Alert, Button, NumberField, TextAreaField, TextField } from '@/components/ui';
import { publicFileUrl } from '@/lib/supabase';
import { formatMoney } from '@/lib/money';
import { discountPercent } from '@/features/projects/rewards';

export const EMPTY_TIER: RewardTier = {
  title: '',
  description: '',
  amount: 0,
  items: [],
  estimated_delivery: '',
  quantity_limit: null,
  kind: 'reward',
  compare_at_amount: null,
  image_paths: [],
  long_description: '',
  is_featured: false,
  is_digital: false,
  is_hidden: false,
  per_backer_limit: null,
  available_from: null,
  available_until: null,
  components: [],
};

/** ISO time ↔ the value of <input type="datetime-local"> (local time, no seconds). */
const toLocalInput = (iso: string | null) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};
const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null);

/** Problems the founder should fix before saving (the database checks the same). */
type Problem =
  'wizard.rewards.needMain' | 'wizard.terms.tierError' | 'wizard.rewards.compareError' | 'wizard.rewards.windowError';

export function rewardProblems(tiers: RewardTier[], minContribution: number): Problem[] {
  const problems: Problem[] = [];
  if (!tiers.some(r => r.kind === 'reward' && !r.is_hidden)) problems.push('wizard.rewards.needMain');
  tiers.forEach(r => {
    if (r.title.trim().length < 2 || r.amount < minContribution) problems.push('wizard.terms.tierError');
    if (r.compare_at_amount !== null && r.compare_at_amount <= r.amount) problems.push('wizard.rewards.compareError');
    if (r.available_from && r.available_until && r.available_from >= r.available_until)
      problems.push('wizard.rewards.windowError');
  });
  return [...new Set(problems)];
}

/** One reward or add-on: price, retail price, contents, photos, delivery, limits, dates, flags. */
export function RewardEditor({
  draft,
  tier,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  draft: Draft;
  tier: RewardTier;
  index: number;
  count: number;
  onChange: (patch: Partial<RewardTier>) => void;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pct = discountPercent(tier);
  const setComponent = (i: number, patch: Partial<{ name: string; quantity: number }>) =>
    onChange({ components: tier.components.map((c, j) => (j === i ? { ...c, ...patch } : c)) });

  async function addImages(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError(null);
    try {
      const room = REWARD_IMAGE_MAX - tier.image_paths.length;
      const paths: string[] = [];
      for (const file of [...files].slice(0, room)) paths.push(await uploadRewardImage(draft, file));
      onChange({ image_paths: [...tier.image_paths, ...paths] });
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setUploading(false);
    }
  }

  return (
    <fieldset className="rounded-2xl border border-slate-200 p-4 sm:p-5 space-y-4">
      <legend className="px-1 text-xs font-semibold text-slate-500">
        #{index + 1} · {t(`wizard.rewards.kind.${tier.kind}`)}
      </legend>

      {/* Main reward or add-on */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="inline-flex rounded-full bg-slate-100 p-1"
          role="group"
          aria-label={t('wizard.rewards.kindLabel')}
        >
          {(['reward', 'addon'] as const).map(k => (
            <button
              key={k}
              type="button"
              aria-pressed={tier.kind === k}
              onClick={() => onChange({ kind: k })}
              className={`px-3 py-1.5 rounded-full text-sm font-semibold cursor-pointer ${
                tier.kind === k ? 'bg-card text-ink shadow-sm' : 'text-slate-600'
              }`}
            >
              {t(`wizard.rewards.kind.${k}`)}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMove(index - 1)}
            aria-label={t('wizard.rewards.moveUp')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
          <button
            type="button"
            disabled={index === count - 1}
            onClick={() => onMove(index + 1)}
            aria-label={t('wizard.rewards.moveDown')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
          >
            <ArrowDown className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={t('wizard.remove')}
            className="w-10 h-10 rounded-full flex items-center justify-center text-rose-600 hover:bg-rose-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <TextField
        label={t('wizard.terms.tierName')}
        maxLength={160}
        value={tier.title}
        onChange={e => onChange({ title: e.target.value })}
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField
          label={t('wizard.terms.tierPrice')}
          hint={formatMoney(tier.amount || 0)}
          value={tier.amount}
          onValue={v => onChange({ amount: Math.round(v) })}
        />
        <NumberField
          label={t('wizard.rewards.compareAt')}
          hint={pct !== null ? t('wizard.rewards.saving', { pct }) : t('wizard.rewards.compareAtHint')}
          value={tier.compare_at_amount ?? 0}
          onValue={v => onChange({ compare_at_amount: v > 0 ? Math.round(v) : null })}
        />
      </div>
      <TextAreaField
        label={t('wizard.rewards.short')}
        rows={2}
        maxLength={2000}
        value={tier.description}
        onChange={e => onChange({ description: e.target.value })}
      />

      {/* What's inside */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">{t('wizard.rewards.components')}</p>
        {tier.components.map((c, i) => (
          <div key={i} className="flex gap-2 items-start">
            <div className="flex-1">
              <TextField
                label={t('wizard.rewards.componentName', { n: i + 1 })}
                maxLength={120}
                value={c.name}
                onChange={e => setComponent(i, { name: e.target.value })}
              />
            </div>
            <div className="w-24">
              <NumberField
                label={t('wizard.rewards.qty')}
                value={c.quantity}
                onValue={v => setComponent(i, { quantity: Math.min(999, Math.max(1, Math.round(v) || 1)) })}
              />
            </div>
            <button
              type="button"
              onClick={() => onChange({ components: tier.components.filter((_, j) => j !== i) })}
              aria-label={t('wizard.remove')}
              className="mt-7 w-10 h-10 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
        {tier.components.length < 20 && (
          <Button
            variant="secondary"
            onClick={() => onChange({ components: [...tier.components, { name: '', quantity: 1 }] })}
          >
            + {t('wizard.rewards.addComponent')}
          </Button>
        )}
      </div>

      {/* Photos */}
      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-700">{t('wizard.rewards.photos', { max: REWARD_IMAGE_MAX })}</p>
        <div className="flex flex-wrap gap-2">
          {tier.image_paths.map(path => (
            <div key={path} className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
              <img src={publicFileUrl('project-images', path) ?? ''} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => onChange({ image_paths: tier.image_paths.filter(p => p !== path) })}
                aria-label={t('wizard.remove')}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-night/70 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
          {tier.image_paths.length < REWARD_IMAGE_MAX && (
            <label className="w-20 h-20 rounded-xl border border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:text-ink cursor-pointer">
              <ImagePlus className="w-6 h-6" aria-hidden />
              <span className="sr-only">{t('wizard.rewards.addPhoto')}</span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                disabled={uploading}
                onChange={e => void addImages(e.target.files)}
              />
            </label>
          )}
        </div>
        {uploading && <p className="text-xs text-slate-500">{t('common.loading')}</p>}
        {error && <Alert variant="error">{error}</Alert>}
      </div>

      <TextAreaField
        label={t('wizard.rewards.long')}
        hint={t('wizard.rewards.longHint')}
        rows={4}
        maxLength={5000}
        value={tier.long_description}
        onChange={e => onChange({ long_description: e.target.value })}
      />

      {/* Delivery and limits */}
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          label={tier.is_digital ? t('wizard.rewards.accessWhen') : t('wizard.terms.delivery')}
          maxLength={60}
          value={tier.estimated_delivery ?? ''}
          onChange={e => onChange({ estimated_delivery: e.target.value })}
          placeholder={t('wizard.terms.deliveryPlaceholder')}
        />
        <NumberField
          label={t('wizard.terms.limit')}
          hint={t('wizard.terms.limitHint')}
          value={tier.quantity_limit ?? 0}
          onValue={v => onChange({ quantity_limit: v > 0 ? Math.round(v) : null })}
        />
        <NumberField
          label={t('wizard.rewards.perBacker')}
          hint={t('wizard.rewards.perBackerHint')}
          value={tier.per_backer_limit ?? 0}
          onValue={v => onChange({ per_backer_limit: v > 0 ? Math.min(999, Math.round(v)) : null })}
        />
      </div>

      {/* Early-bird window */}
      <div className="grid gap-3 sm:grid-cols-2">
        <TextField
          type="datetime-local"
          label={t('wizard.rewards.from')}
          hint={t('wizard.rewards.fromHint')}
          value={toLocalInput(tier.available_from)}
          onChange={e => onChange({ available_from: fromLocalInput(e.target.value) })}
        />
        <TextField
          type="datetime-local"
          label={t('wizard.rewards.until')}
          hint={t('wizard.rewards.untilHint')}
          value={toLocalInput(tier.available_until)}
          onChange={e => onChange({ available_until: fromLocalInput(e.target.value) })}
        />
      </div>

      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
        {(['is_featured', 'is_digital', 'is_hidden'] as const).map(flag => (
          <label key={flag} className="inline-flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={tier[flag]}
              onChange={e => onChange({ [flag]: e.target.checked })}
              className="w-4 h-4 accent-ink"
            />
            {t(`wizard.rewards.${flag}`)}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
