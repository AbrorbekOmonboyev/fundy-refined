import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/features/auth/AuthContext';
import { useCategories, useRegions } from '@/features/reference/useReference';
import { createDraft, updateBasics, type Basics, type Draft } from '@/features/wizard/api';
import { MAX_TARGET, MIN_TARGET } from '@/features/wizard/checks';
import { useStepSave } from '@/features/wizard/hooks';
import { WizardShell } from '@/features/wizard/WizardShell';
import { ChoiceGroup, NumberField, SelectField, TextField } from '@/components/ui';
import { LANGUAGES, type Language } from '@/i18n';
import { formatMoney } from '@/lib/money';

/** Step 1: what the project is. Creates the draft the first time it's saved. */
export function BasicsStep({ draft }: { draft: Draft | null }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const categories = useCategories();
  const regions = useRegions();
  const { run, busy, error } = useStepSave(draft?.project.id ?? null, 'basics');

  const [form, setForm] = useState<Basics>({
    title: draft?.text?.title ?? '',
    tagline: draft?.text?.tagline ?? '',
    model: draft?.project.model ?? 'reward',
    category_id: draft?.project.category_id ?? '',
    region_id: draft?.project.region_id ?? null,
    location: draft?.project.location ?? '',
    target_amount: draft?.project.target_amount ?? 0,
    duration_days: draft?.project.duration_days ?? 30,
    original_language: (draft?.project.original_language ?? i18n.resolvedLanguage ?? 'uz') as Language,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof Basics, string>>>({});
  const set = <K extends keyof Basics>(key: K, value: Basics[K]) => setForm(f => ({ ...f, [key]: value }));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const found: typeof errors = {};
    if (form.title.trim().length < 5 || form.title.trim().length > 140) found.title = t('wizard.basics.titleError');
    if (!form.tagline.trim()) found.tagline = t('wizard.required');
    if (!form.category_id) found.category_id = t('wizard.required');
    if (form.target_amount < MIN_TARGET || form.target_amount > MAX_TARGET) {
      found.target_amount = t('wizard.basics.targetError', { min: formatMoney(MIN_TARGET) });
    }
    if (form.duration_days < 7 || form.duration_days > 90) found.duration_days = t('wizard.basics.durationError');
    setErrors(found);
    if (Object.keys(found).length || !user) return;
    void run(() => (draft ? updateBasics(draft, form) : createDraft(user.id, form)));
  }

  return (
    <WizardShell
      draft={draft}
      step="basics"
      title={t('wizard.basics.title')}
      hint={t('wizard.basics.hint')}
      error={error}
      busy={busy}
      onSubmit={handleSubmit}
    >
      <ChoiceGroup
        label={t('wizard.basics.language')}
        value={form.original_language}
        onChange={lng => set('original_language', lng)}
        options={LANGUAGES.map(lng => ({ value: lng, label: t(`languages.${lng}`) }))}
      />
      <TextField
        label={t('wizard.basics.name')}
        maxLength={140}
        value={form.title}
        onChange={e => set('title', e.target.value)}
        error={errors.title}
        hint={t('wizard.basics.nameHint')}
      />
      <TextField
        label={t('wizard.basics.tagline')}
        maxLength={240}
        value={form.tagline}
        onChange={e => set('tagline', e.target.value)}
        error={errors.tagline}
        hint={t('wizard.basics.taglineHint')}
      />
      <ChoiceGroup
        label={t('wizard.basics.model')}
        value={form.model}
        onChange={m => set('model', m)}
        options={(['donation', 'reward', 'equity'] as const).map(m => ({
          value: m,
          label: t(`models.${m}.name`),
          description: t(`models.${m}.subtitle`),
        }))}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <SelectField
          label={t('explore.category')}
          value={form.category_id}
          onChange={e => set('category_id', e.target.value)}
          options={categories.options}
          placeholder={t('wizard.choose')}
          error={errors.category_id}
        />
        <SelectField
          label={t('welcome.region')}
          value={form.region_id ?? ''}
          onChange={e => set('region_id', e.target.value || null)}
          options={regions.options}
          placeholder={t('wizard.choose')}
        />
      </div>
      <TextField
        label={t('wizard.basics.location')}
        maxLength={120}
        value={form.location}
        onChange={e => set('location', e.target.value)}
        hint={t('wizard.basics.locationHint')}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <NumberField
          label={t('wizard.basics.target')}
          value={form.target_amount}
          onValue={v => set('target_amount', Math.round(v))}
          error={errors.target_amount}
          hint={form.target_amount ? formatMoney(form.target_amount) : t('wizard.basics.targetHint')}
        />
        <NumberField
          label={t('wizard.basics.duration')}
          value={form.duration_days}
          onValue={v => set('duration_days', Math.round(v))}
          error={errors.duration_days}
          hint={t('wizard.basics.durationHint')}
        />
      </div>
    </WizardShell>
  );
}
