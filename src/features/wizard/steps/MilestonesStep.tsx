import { useState, type FormEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { saveMilestones, type Draft, type Milestone } from '@/features/wizard/api';
import { useStepSave } from '@/features/wizard/hooks';
import { ListRow, WizardShell } from '@/features/wizard/WizardShell';
import { Alert, Button, NumberField, TextAreaField, TextField } from '@/components/ui';

const EMPTY: Milestone = { title: '', description: '', target_label: '', release_percent: 0 };

/** Step 4: stages of work; each releases a % of the money once verified. */
export function MilestonesStep({ draft }: { draft: Draft }) {
  const { t } = useTranslation();
  const { run, busy, error, setError } = useStepSave(draft.project.id, 'milestones');
  const [items, setItems] = useState<Milestone[]>(
    draft.milestones.length
      ? draft.milestones.map(m => ({ ...m, target_label: m.target_label ?? '' }))
      : [{ ...EMPTY }],
  );
  const total = items.reduce((s, m) => s + (Number(m.release_percent) || 0), 0);
  const update = (index: number, patch: Partial<Milestone>) =>
    setItems(list => list.map((item, i) => (i === index ? { ...item, ...patch } : item)));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const filled = items.filter(m => m.title.trim() || m.release_percent);
    if (filled.some(m => m.title.trim().length < 2 || m.release_percent <= 0 || m.release_percent > 100)) {
      setError(t('wizard.milestones.rowError'));
      return;
    }
    void run(() =>
      saveMilestones(
        draft.project.id,
        filled.map(m => ({
          ...m,
          title: m.title.trim(),
          description: m.description.trim(),
          target_label: m.target_label?.trim() || null,
        })),
      ),
    );
  }

  return (
    <WizardShell
      draft={draft}
      step="milestones"
      title={t('wizard.milestones.title')}
      hint={t('wizard.milestones.hint')}
      error={error}
      busy={busy}
      onSubmit={handleSubmit}
    >
      <div className="space-y-4">
        {items.map((m, index) => (
          <ListRow key={index} index={index} onRemove={() => setItems(list => list.filter((_, i) => i !== index))}>
            <div className="grid gap-3 sm:grid-cols-[1fr_140px_120px]">
              <TextField
                label={t('wizard.milestones.name')}
                maxLength={160}
                value={m.title}
                onChange={e => update(index, { title: e.target.value })}
              />
              <TextField
                label={t('wizard.milestones.when')}
                maxLength={60}
                value={m.target_label ?? ''}
                onChange={e => update(index, { target_label: e.target.value })}
                placeholder={t('wizard.milestones.whenPlaceholder')}
              />
              <NumberField
                label={t('wizard.milestones.release')}
                value={Number(m.release_percent)}
                onValue={v => update(index, { release_percent: v })}
              />
            </div>
            <TextAreaField
              label={t('project.budgetDescription')}
              rows={2}
              maxLength={2000}
              value={m.description}
              onChange={e => update(index, { description: e.target.value })}
            />
          </ListRow>
        ))}
        <Button variant="secondary" onClick={() => setItems(list => [...list, { ...EMPTY }])}>
          + {t('wizard.milestones.add')}
        </Button>
      </div>
      <Alert variant={Math.abs(total - 100) < 0.001 ? 'success' : 'warning'}>
        {t('wizard.milestones.total', { total })}
      </Alert>
    </WizardShell>
  );
}
