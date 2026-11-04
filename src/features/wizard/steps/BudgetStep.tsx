import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { saveBudget, type BudgetItem, type Draft } from '@/features/wizard/api';
import { useStepSave } from '@/features/wizard/hooks';
import { ListRow, WizardShell } from '@/features/wizard/WizardShell';
import { Alert, Button, NumberField, TextField } from '@/components/ui';
import { formatMoney } from '@/lib/money';

const EMPTY: BudgetItem = { category: '', description: '', amount: 0 };

/** Step 3: itemised budget that must add up to the goal. */
export function BudgetStep({ draft }: { draft: Draft }) {
  const { t } = useTranslation();
  const { run, busy, error, setError } = useStepSave(draft.project.id, 'budget');
  const [items, setItems] = useState<BudgetItem[]>(draft.budget.length ? draft.budget : [{ ...EMPTY }]);

  const target = draft.project.target_amount;
  const total = items.reduce((s, i) => s + (i.amount || 0), 0);
  const difference = target - total;
  const update = (index: number, patch: Partial<BudgetItem>) =>
    setItems(list => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const filled = items.filter(i => i.category.trim() || i.amount);
    if (filled.some(i => i.category.trim().length < 2 || i.amount <= 0)) {
      setError(t('wizard.budget.rowError'));
      return;
    }
    void run(() =>
      saveBudget(
        draft.project.id,
        filled.map(i => ({ ...i, category: i.category.trim(), description: i.description.trim() })),
      ),
    );
  }

  return (
    <WizardShell
      draft={draft}
      step="budget"
      title={t('wizard.budget.title')}
      hint={t('wizard.budget.hint', { goal: formatMoney(target) })}
      error={error}
      busy={busy}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        {items.map((item, index) => (
          <ListRow key={index} index={index} onRemove={() => setItems(list => list.filter((_, i) => i !== index))}>
            <div className="grid gap-3 sm:grid-cols-[1fr_180px]">
              <TextField
                label={t('wizard.budget.item')}
                maxLength={120}
                value={item.category}
                onChange={e => update(index, { category: e.target.value })}
              />
              <NumberField
                label={t('contribute.amount')}
                value={item.amount}
                onValue={v => update(index, { amount: Math.round(v) })}
              />
            </div>
            <TextField
              label={t('project.budgetDescription')}
              maxLength={1000}
              value={item.description}
              onChange={e => update(index, { description: e.target.value })}
            />
          </ListRow>
        ))}
        <Button variant="secondary" onClick={() => setItems(list => [...list, { ...EMPTY }])}>
          + {t('wizard.budget.add')}
        </Button>
      </div>

      <Alert variant={difference === 0 ? 'success' : 'warning'}>
        <p className="font-mono-numbers">
          {t('wizard.budget.total', { total: formatMoney(total), goal: formatMoney(target) })}
        </p>
        {difference !== 0 && (
          <p>
            {difference > 0
              ? t('wizard.budget.missing', { amount: formatMoney(difference) })
              : t('wizard.budget.over', { amount: formatMoney(-difference) })}
          </p>
        )}
      </Alert>
    </WizardShell>
  );
}
