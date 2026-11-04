import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { wizardErrorText } from '@/features/wizard/errors';
import { paths } from '@/app/routes';
import { getDraft } from '@/features/wizard/api';
import { STEPS, type Step } from '@/features/wizard/checks';

export const draftKey = (id: string) => ['draft', id] as const;

export function useDraft(projectId: string | undefined) {
  const { user } = useAuth();
  return useQuery({
    queryKey: draftKey(projectId ?? ''),
    queryFn: () => getDraft(projectId!, user!.id),
    enabled: !!projectId && !!user,
  });
}

/** Runs a step's save, refreshes the draft, then moves to the next step. Translates errors. */
export function useStepSave(projectId: string | null, step: Step) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(save: () => Promise<string | void>) {
    setBusy(true);
    setError(null);
    try {
      const createdId = await save(); // a new draft returns its id
      const id = createdId || projectId!;
      await queryClient.invalidateQueries({ queryKey: draftKey(id) });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      const next = STEPS[STEPS.indexOf(step) + 1] ?? 'review';
      navigate(paths.editProject(id, next));
    } catch (e) {
      setError(wizardErrorText(t, e));
    } finally {
      setBusy(false);
    }
  }

  return { run, busy, error, setError };
}
