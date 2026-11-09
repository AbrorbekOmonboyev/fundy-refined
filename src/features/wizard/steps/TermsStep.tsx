import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { saveEquity, saveRewards, type Draft, type EquityTerms, type RewardTier } from '@/features/wizard/api';
import { useStepSave } from '@/features/wizard/hooks';
import { WizardShell } from '@/features/wizard/WizardShell';
import { EMPTY_TIER, RewardEditor, rewardProblems } from '@/features/wizard/steps/RewardEditor';
import { Alert, Button, ChoiceGroup, NumberField, SelectField, TextField } from '@/components/ui';
import { formatMoney } from '@/lib/money';

/** The lowest amount anyone can give, the same on every project (the database enforces it: migration 30). */
const MINIMUM_AMOUNT = 10_000;

/** Step 5: what backers get — rewards, Musharakah terms, or (donations) just the minimum amount. */
export function TermsStep({ draft }: { draft: Draft }) {
  const { t } = useTranslation();
  const { run, busy, error, setError } = useStepSave(draft.project.id, 'terms');
  const model = draft.project.model;

  const [tiers, setTiers] = useState<RewardTier[]>(draft.rewards.length ? draft.rewards : [{ ...EMPTY_TIER }]);
  const [equity, setEquity] = useState<EquityTerms>(
    draft.equity ?? {
      contract_type: 'musharakah',
      investor_profit_share_pct: 25,
      min_investment: MINIMUM_AMOUNT,
      projected_annual_return: '',
      distribution_schedule: 'quarterly',
      exit_horizon_years: 5,
    },
  );
  const updateTier = (index: number, patch: Partial<RewardTier>) =>
    setTiers(list => list.map((tier, i) => (i === index ? { ...tier, ...patch } : tier)));
  const moveTier = (from: number, to: number) =>
    setTiers(list => {
      const next = [...list];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (model === 'reward') {
      const filled = tiers
        .filter(r => r.title.trim() || r.amount)
        .map(r => ({ ...r, components: r.components.filter(c => c.name.trim()) }));
      const problems = rewardProblems(filled, MINIMUM_AMOUNT);
      if (problems.length) {
        setError(problems.map(p => t(p, { min: formatMoney(MINIMUM_AMOUNT) })).join(' '));
        return;
      }
      void run(async () => {
        await saveRewards(
          draft.project.id,
          filled.map(r => ({
            ...r,
            title: r.title.trim(),
            description: r.description.trim(),
            long_description: r.long_description.trim(),
            estimated_delivery: r.estimated_delivery?.trim() || null,
            components: r.components.map(c => ({ name: c.name.trim(), quantity: c.quantity })),
          })),
        );
      });
    } else if (model === 'equity') {
      const { investor_profit_share_pct: pct, exit_horizon_years: years } = equity;
      if (pct <= 0 || pct >= 100 || years < 1 || years > 30) {
        setError(t('wizard.terms.equityError'));
        return;
      }
      void run(async () => {
        await saveEquity(draft.project.id, {
          ...equity,
          min_investment: MINIMUM_AMOUNT,
          projected_annual_return: equity.projected_annual_return?.trim() || null,
        });
      });
    } else {
      void run(async () => {});
    }
  }

  return (
    <WizardShell
      draft={draft}
      step="terms"
      title={t(`wizard.terms.title.${model}`)}
      hint={t(`wizard.terms.hint.${model}`)}
      error={error}
      busy={busy}
      onSubmit={handleSubmit}
    >
      <p className="text-sm text-slate-700">{t('wizard.terms.minFixed', { amount: formatMoney(MINIMUM_AMOUNT) })}</p>

      {model === 'reward' && (
        <div className="space-y-4">
          {tiers.map((tier, index) => (
            <RewardEditor
              key={index}
              draft={draft}
              tier={tier}
              index={index}
              count={tiers.length}
              onChange={patch => updateTier(index, patch)}
              onMove={to => moveTier(index, to)}
              onRemove={() => setTiers(list => list.filter((_, i) => i !== index))}
            />
          ))}
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => setTiers(list => [...list, { ...EMPTY_TIER }])}>
              + {t('wizard.terms.addTier')}
            </Button>
            <Button variant="secondary" onClick={() => setTiers(list => [...list, { ...EMPTY_TIER, kind: 'addon' }])}>
              + {t('wizard.rewards.addAddon')}
            </Button>
          </div>
        </div>
      )}

      {model === 'equity' && (
        <div className="space-y-4">
          <ChoiceGroup
            label={t('wizard.terms.contract')}
            value={equity.contract_type}
            onChange={v => setEquity(e => ({ ...e, contract_type: v }))}
            options={(['musharakah', 'mudarabah'] as const).map(c => ({
              value: c,
              label: t(`project.contract.${c}`),
              description: t(`wizard.terms.contractHint.${c}`),
            }))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <NumberField
              label={t('wizard.terms.share')}
              hint={t('wizard.terms.shareHint')}
              value={equity.investor_profit_share_pct}
              onValue={v => setEquity(e => ({ ...e, investor_profit_share_pct: v }))}
            />
            <SelectField
              label={t('wizard.terms.schedule')}
              value={equity.distribution_schedule}
              onChange={ev =>
                setEquity(e => ({
                  ...e,
                  distribution_schedule: ev.target.value as EquityTerms['distribution_schedule'],
                }))
              }
              options={(['quarterly', 'biannually', 'annually'] as const).map(s => ({
                value: s,
                label: t(`project.schedule.${s}`),
              }))}
            />
            <NumberField
              label={t('wizard.terms.years')}
              value={equity.exit_horizon_years}
              onValue={v => setEquity(e => ({ ...e, exit_horizon_years: Math.round(v) }))}
            />
          </div>
          <TextField
            label={t('wizard.terms.projected')}
            hint={t('wizard.terms.projectedHint')}
            maxLength={60}
            value={equity.projected_annual_return ?? ''}
            onChange={ev => setEquity(e => ({ ...e, projected_annual_return: ev.target.value }))}
          />
          <Alert variant="info">{t('wizard.terms.equityNote')}</Alert>
        </div>
      )}
    </WizardShell>
  );
}
