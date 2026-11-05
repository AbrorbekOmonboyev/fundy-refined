import { useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { errorKey } from '@/features/auth/errors';
import {
  approveMilestone,
  listSubmittedMilestones,
  returnMilestone,
  type SubmittedMilestone,
} from '@/features/community/api';
import { pickText } from '@/features/projects/api';
import { Alert, Button, PageSpinner, TextAreaField } from '@/components/ui';
import { usePageMeta } from '@/lib/usePageMeta';
import { AdminHeader } from '@/pages/admin/AdminLayout';

const MIN_NOTE = 10;

/** Milestones founders reported as done: check the evidence, then approve or send back. */
export function AdminMilestonesPage() {
  const { t } = useTranslation();
  const {
    data = [],
    isPending,
    isError,
  } = useQuery({ queryKey: ['admin', 'milestones'], queryFn: listSubmittedMilestones });
  usePageMeta(t('admin.nav.milestones'));

  return (
    <>
      <AdminHeader title={t('admin.nav.milestones')} hint={t('admin.milestones.hint')} />
      {isPending ? (
        <PageSpinner />
      ) : isError ? (
        <Alert variant="error">{t('errors.generic')}</Alert>
      ) : data.length === 0 ? (
        <p className="p-10 text-center text-sm text-slate-500 bg-white rounded-3xl border border-slate-200">
          {t('admin.milestones.empty')}
        </p>
      ) : (
        <ul className="space-y-3">
          {data.map(m => (
            <MilestoneReview key={m.id} milestone={m} />
          ))}
        </ul>
      )}
    </>
  );
}

function MilestoneReview({ milestone: m }: { milestone: SubmittedMilestone }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [returning, setReturning] = useState(false);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const p = m.project;
  const title = p
    ? (pickText(p.project_translations, i18n.resolvedLanguage ?? 'uz', p.original_language).text?.title ?? p.slug)
    : '';
  const isOwn = p?.owner_id === user?.id;

  async function act(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await action();
      await queryClient.invalidateQueries({ queryKey: ['admin', 'milestones'] });
    } catch (e) {
      setError(t(errorKey(e)));
      setBusy(false);
    }
  }

  return (
    <li className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3">
      <div>
        {p && (
          <Link
            to={paths.project(p.slug)}
            className="text-xs font-semibold text-slate-500 hover:text-ink hover:underline"
          >
            {title}
          </Link>
        )}
        <p className="font-semibold text-ink">
          {m.position}. {m.title}
        </p>
        <p className="text-xs text-slate-500">
          {m.target_label} · {t('milestones.release', { percent: m.release_percent })}
        </p>
      </div>
      <div className="rounded-xl bg-page p-3">
        <p className="text-xs font-semibold text-slate-700 mb-1">{t('milestones.evidence')}</p>
        <p className="text-sm text-slate-700 whitespace-pre-line break-words">{m.evidence}</p>
      </div>

      {isOwn && <Alert variant="info">{t('errors.cannotReviewOwn')}</Alert>}
      {error && <Alert variant="error">{error}</Alert>}

      {!isOwn &&
        (returning ? (
          <div className="space-y-2">
            <TextAreaField
              label={t('admin.milestones.noteLabel')}
              hint={t('admin.milestones.noteHint')}
              rows={3}
              maxLength={2000}
              minChars={MIN_NOTE}
              value={note}
              onChange={e => setNote(e.target.value)}
            />
            <div className="flex gap-2">
              <Button
                loading={busy}
                disabled={note.trim().length < MIN_NOTE}
                onClick={() => act(() => returnMilestone(m.id, note))}
              >
                {t('admin.milestones.sendBack')}
              </Button>
              <Button variant="secondary" onClick={() => setReturning(false)}>
                {t('common.cancel')}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Button
              loading={busy}
              onClick={() => {
                if (window.confirm(t('admin.milestones.approveConfirm'))) void act(() => approveMilestone(m.id));
              }}
            >
              {t('admin.milestones.approve')}
            </Button>
            <Button variant="secondary" onClick={() => setReturning(true)}>
              {t('admin.milestones.sendBack')}
            </Button>
          </div>
        ))}
    </li>
  );
}
