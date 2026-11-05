import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import { Rocket } from 'lucide-react';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { errorKey } from '@/features/auth/errors';
import { pickText, type MyProject } from '@/features/projects/api';
import { useMyProjects } from '@/features/projects/hooks';
import { deleteDraft, postUpdate, withdrawSubmission } from '@/features/wizard/api';
import { FounderMilestones } from '@/features/community/FounderMilestones';
import { Alert, Button, PageSpinner, TextAreaField, TextField } from '@/components/ui';
import { formatMoney } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';

const STATUS_STYLE: Record<string, string> = {
  draft: 'bg-slate-100 text-slate-700',
  pending_review: 'bg-amber-100 text-amber-800',
  changes_requested: 'bg-orange-100 text-orange-800',
  rejected: 'bg-rose-100 text-rose-800',
  active: 'bg-brand text-ink',
  funded: 'bg-night text-white',
  unsuccessful: 'bg-slate-200 text-slate-700',
  completed: 'bg-sky-100 text-sky-800',
};
const LIVE = ['active', 'funded', 'unsuccessful', 'completed'];

/** "My projects": the signed-in user's own projects, in every status. */
export function FounderDashboardPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const { data = [], isPending, isError } = useMyProjects();
  usePageMeta(t('account.projects'));
  const justSubmitted = (location.state as { submitted?: boolean } | null)?.submitted;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink">{t('account.projects')}</h1>
        <Link
          to={paths.newProject}
          className="px-4 py-2 text-xs font-semibold text-white bg-night hover:bg-night-soft rounded-lg self-start sm:self-auto"
        >
          + {t('dashboard.founder.newProject')}
        </Link>
      </header>

      {justSubmitted && <Alert variant="success">{t('dashboard.founder.submitted')}</Alert>}

      {isPending ? (
        <PageSpinner />
      ) : isError ? (
        <Alert variant="error">{t('errors.generic')}</Alert>
      ) : data.length === 0 ? (
        <div className="p-12 text-center bg-card rounded-2xl border border-slate-200 space-y-4">
          <Rocket className="w-10 h-10 text-ink mx-auto" aria-hidden />
          <h2 className="text-lg font-bold text-ink">{t('dashboard.founder.emptyTitle')}</h2>
          <p className="text-sm text-slate-600 max-w-md mx-auto">{t('dashboard.founder.emptyText')}</p>
          <Link
            to={paths.newProject}
            className="inline-block px-4 py-2 text-xs font-semibold text-white bg-night hover:bg-night-soft rounded-lg"
          >
            {t('nav.startProject')}
          </Link>
        </div>
      ) : (
        <ul className="space-y-4">
          {data.map(p => (
            <ProjectRow key={p.id} project={p} />
          ))}
        </ul>
      )}
    </div>
  );
}

function ProjectRow({ project: p }: { project: MyProject }) {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [writing, setWriting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const title = pickText(p.translations, i18n.resolvedLanguage ?? 'uz', p.originalLanguage).text?.title ?? p.slug;
  const isLive = LIVE.includes(p.status);
  const editable = p.status === 'draft' || p.status === 'changes_requested';
  // Milestone reports start once the money is raised.
  const hasMilestones = p.status === 'funded' || p.status === 'completed';
  const [showMilestones, setShowMilestones] = useState(false);

  async function withdraw() {
    if (!window.confirm(t('dashboard.founder.withdrawConfirm'))) return;
    setDeleting(true);
    try {
      await withdrawSubmission(p.id);
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setDeleting(false);
    }
  }

  async function remove() {
    if (!window.confirm(t('dashboard.founder.deleteConfirm'))) return;
    setDeleting(true);
    try {
      await deleteDraft(p.id, user!.id);
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
    } catch (e) {
      setError(t(errorKey(e)));
      setDeleting(false);
    }
  }

  return (
    <li className="bg-card rounded-xl border border-slate-200 p-5 space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
        <div className="min-w-0">
          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${STATUS_STYLE[p.status]}`}>
            {t(`status.${p.status}`)}
          </span>
          <p className="mt-1.5 font-semibold text-ink">
            {isLive ? (
              <Link to={paths.project(p.slug)} className="hover:text-ink">
                {title}
              </Link>
            ) : (
              title
            )}
          </p>
          <p className="text-xs text-slate-500 mt-0.5">{t(`models.${p.model}.name`)}</p>
        </div>
        <p className="text-sm font-mono-numbers text-slate-700 shrink-0">
          {formatMoney(p.raisedAmount, true)} / {formatMoney(p.targetAmount, true)} · {p.fundedPercent}%
        </p>
      </div>

      {p.reviewNote && (p.status === 'changes_requested' || p.status === 'rejected') && (
        <Alert variant={p.status === 'rejected' ? 'error' : 'warning'}>
          <strong>{t('dashboard.founder.reviewNote')}</strong> {p.reviewNote}
        </Alert>
      )}
      {error && <Alert variant="error">{error}</Alert>}

      <div className="flex flex-wrap gap-2">
        {editable && (
          <Link
            to={paths.editProject(p.id, 'review')}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-night hover:bg-night-soft rounded-lg"
          >
            {t('dashboard.founder.continue')}
          </Link>
        )}
        {p.status === 'pending_review' && (
          <Link
            to={paths.editProject(p.id, 'review')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
          >
            {t('dashboard.founder.viewStatus')}
          </Link>
        )}
        {p.status === 'pending_review' && (
          <Button variant="link" loading={deleting} onClick={withdraw} className="ml-auto">
            {t('dashboard.founder.withdraw')}
          </Button>
        )}
        {isLive && (
          <>
            <Link
              to={paths.project(p.slug)}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50"
            >
              {t('dashboard.founder.viewPage')}
            </Link>
            <Button variant="secondary" className="!px-3 !py-1.5 text-xs" onClick={() => setWriting(!writing)}>
              {t('dashboard.founder.postUpdate')}
            </Button>
            {hasMilestones && (
              <Button
                variant="secondary"
                className="!px-3 !py-1.5 text-xs"
                onClick={() => setShowMilestones(!showMilestones)}
              >
                {t('milestones.manage')}
              </Button>
            )}
          </>
        )}
        {p.status === 'draft' && (
          <Button
            variant="link"
            loading={deleting}
            onClick={remove}
            className="text-rose-600 hover:text-rose-700 ml-auto"
          >
            {t('dashboard.founder.delete')}
          </Button>
        )}
      </div>

      {writing && <UpdateForm projectId={p.id} slug={p.slug} onDone={() => setWriting(false)} />}
      {hasMilestones && showMilestones && <FounderMilestones projectId={p.id} />}
    </li>
  );
}

function UpdateForm({ projectId, slug, onDone }: { projectId: string; slug: string; onDone: () => void }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (title.trim().length < 2 || !body.trim()) {
      setError(t('wizard.required'));
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await postUpdate(projectId, user!.id, title, body);
      await queryClient.invalidateQueries({ queryKey: ['projects', 'detail', slug] });
      onDone();
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-3 border-t border-slate-100 pt-4">
      <TextField
        label={t('dashboard.founder.updateTitle')}
        maxLength={160}
        value={title}
        onChange={e => setTitle(e.target.value)}
      />
      <TextAreaField
        label={t('dashboard.founder.updateBody')}
        hint={t('dashboard.founder.updateHint')}
        rows={5}
        maxLength={20000}
        value={body}
        onChange={e => setBody(e.target.value)}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onDone}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={busy}>
          {t('dashboard.founder.publish')}
        </Button>
      </div>
    </form>
  );
}
