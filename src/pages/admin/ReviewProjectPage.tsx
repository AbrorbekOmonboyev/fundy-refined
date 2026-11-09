import { useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { BadgeCheck, ExternalLink, FileText } from 'lucide-react';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { errorKey } from '@/features/auth/errors';
import { getDraft, documentUrl, type Draft } from '@/features/wizard/api';
import { STEPS, stepComplete } from '@/features/wizard/checks';
import {
  getEvaluation,
  reviewProject,
  saveEvaluation,
  verifyFounder,
  type Decision,
  type Evaluation,
  type EvaluationInput,
} from '@/features/admin/api';
import { Alert, Button, ChoiceGroup, NumberField, PageSpinner, TextAreaField } from '@/components/ui';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AdminHeader } from '@/pages/admin/AdminLayout';
import { IdentityPanel, RegistrationPanel } from '@/pages/admin/IdentityPanels';
import { publicFileUrl } from '@/lib/supabase';
import { formatDate, formatMoney } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';

/** Everything a founder submitted, the evaluation form, and the decision. */
export function ReviewProjectPage() {
  const { t } = useTranslation();
  const { projectId } = useParams();
  const { user } = useAuth();
  const draft = useQuery({
    queryKey: ['admin', 'review', projectId],
    queryFn: () => getDraft(projectId!, user!.id, { anyOwner: true }),
    enabled: !!projectId && !!user,
  });
  const evaluation = useQuery({
    queryKey: ['admin', 'evaluation', projectId],
    queryFn: () => getEvaluation(projectId!),
    enabled: !!projectId,
  });
  usePageMeta(draft.data?.text?.title ?? t('admin.nav.review'));

  if (draft.isPending || evaluation.isPending) return <PageSpinner />;
  if (draft.isError || evaluation.isError) return <Alert variant="error">{t('errors.generic')}</Alert>;
  if (!draft.data) return <NotFoundPage />;
  return <Review key={draft.data.project.updated_at} draft={draft.data} evaluation={evaluation.data ?? null} />;
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="bg-card rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-3">
      <h2 className="text-base text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Review({ draft, evaluation }: { draft: Draft; evaluation: Evaluation | null }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const isOwn = draft.project.owner_id === user?.id;
  const p = draft.project;
  const text = draft.text;
  const isPending = p.status === 'pending_review';
  const complete = STEPS.filter(s => s !== 'review').every(s => stepComplete(draft, s));

  return (
    <div className="space-y-6">
      <AdminHeader title={text?.title ?? p.slug} hint={text?.tagline}>
        <span className="rounded-full bg-brand px-3 py-1 text-xs font-semibold text-ink self-start">
          {t(`status.${p.status}`)}
        </span>
      </AdminHeader>

      {!complete && <Alert variant="warning">{t('admin.review.incomplete')}</Alert>}

      <div className="grid gap-6 xl:grid-cols-[1fr_380px] items-start">
        {/* What the founder submitted */}
        <div className="space-y-6 min-w-0">
          <Section title={t('admin.review.overview')}>
            {p.cover_image_path && (
              <img
                src={publicFileUrl('project-images', p.cover_image_path) ?? ''}
                alt={t('wizard.story.cover')}
                className="w-full aspect-[16/9] object-cover rounded-2xl"
              />
            )}
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
              <Fact
                label={t('wizard.basics.organizer')}
                value={p.organizer_type ? t(`organizer.${p.organizer_type}.name`) : '—'}
              />
              <Fact
                label={t('wizard.basics.model')}
                value={t(`models.${p.model}.name`) + (p.pay_after_registration ? ` · ${t('payLater.label')}` : '')}
              />
              <Fact label={t('wizard.basics.target')} value={formatMoney(p.target_amount)} />
              <Fact label={t('wizard.basics.duration')} value={String(p.duration_days)} />
              <Fact label={t('wizard.basics.language')} value={t(`languages.${p.original_language}`)} />
            </dl>
            {p.status !== 'pending_review' && p.status !== 'draft' && (
              <Link
                to={paths.project(p.slug)}
                className="inline-flex items-center gap-1 text-sm font-semibold text-ink hover:underline"
              >
                {t('dashboard.founder.viewPage')} <ExternalLink className="w-3.5 h-3.5" aria-hidden />
              </Link>
            )}
          </Section>

          <Section title={t('wizard.step.story')}>
            {text?.summary && <p className="text-sm text-slate-700">{text.summary}</p>}
            <p className="text-sm text-slate-700 whitespace-pre-line">{text?.story}</p>
            {text?.risks && (
              <div className="rounded-2xl bg-page p-4">
                <h3 className="text-sm font-semibold text-ink mb-1">{t('wizard.story.risks')}</h3>
                <p className="text-sm text-slate-700 whitespace-pre-line">{text.risks}</p>
              </div>
            )}
          </Section>

          <Section title={t('wizard.step.budget')}>
            <Table
              rows={draft.budget.map(b => [b.category, b.description, formatMoney(b.amount)])}
              footer={[t('project.budgetTotal'), '', formatMoney(draft.budget.reduce((s, b) => s + b.amount, 0))]}
            />
          </Section>

          <Section title={t('wizard.step.milestones')}>
            <Table rows={draft.milestones.map(m => [m.title, m.target_label ?? '', `${m.release_percent}%`])} />
          </Section>

          {p.model === 'reward' && (
            <Section title={t('project.rewards')}>
              <p className="text-sm text-slate-600 mb-3">{t('admin.review.rewardChecks')}</p>
              <Table
                rows={draft.rewards.map(r => [
                  `${r.title} · ${t(`wizard.rewards.kind.${r.kind}`)}${r.is_hidden ? ` · ${t('wizard.rewards.is_hidden')}` : ''}`,
                  r.components.map(c => (c.quantity > 1 ? `${c.name} ×${c.quantity}` : c.name)).join(', '),
                  [
                    r.estimated_delivery,
                    r.quantity_limit ? `≤ ${r.quantity_limit}` : null,
                    r.per_backer_limit ? `${t('wizard.rewards.perBacker')}: ${r.per_backer_limit}` : null,
                    r.available_until ? `${t('wizard.rewards.until')}: ${formatDate(r.available_until)}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · '),
                  r.compare_at_amount
                    ? `${formatMoney(r.amount)} (${formatMoney(r.compare_at_amount)})`
                    : formatMoney(r.amount),
                ])}
              />
            </Section>
          )}
          {p.model === 'equity' && draft.equity && (
            <Section title={t('wizard.terms.title.equity')}>
              <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                <Fact label={t('wizard.terms.contract')} value={t(`project.contract.${draft.equity.contract_type}`)} />
                <Fact label={t('wizard.terms.share')} value={`${draft.equity.investor_profit_share_pct}%`} />
                <Fact label={t('wizard.terms.minInvestment')} value={formatMoney(draft.equity.min_investment)} />
                <Fact
                  label={t('wizard.terms.schedule')}
                  value={t(`project.schedule.${draft.equity.distribution_schedule}`)}
                />
                <Fact label={t('wizard.terms.years')} value={String(draft.equity.exit_horizon_years)} />
                <Fact label={t('wizard.terms.projected')} value={draft.equity.projected_annual_return ?? '—'} />
              </dl>
            </Section>
          )}

          <FounderSection draft={draft} />
        </div>

        {/* Evaluation and decision */}
        <div className="space-y-6 xl:sticky xl:top-24">
          {isOwn ? (
            <Alert variant="warning">{t('errors.cannotReviewOwn')}</Alert>
          ) : (
            <>
              {p.pay_after_registration && p.status === 'funded' && !p.registration_confirmed_at && (
                <RegistrationPanel draft={draft} />
              )}
              <IdentityPanel ownerId={p.owner_id} />
              <EvaluationForm projectId={p.id} evaluation={evaluation} />
              {isPending && <DecisionPanel projectId={p.id} hasEvaluation={!!evaluation} />}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Table({ rows, footer }: { rows: string[][]; footer?: string[] }) {
  const { t } = useTranslation();
  if (rows.length === 0) return <p className="text-sm text-slate-500">{t('admin.review.nothing')}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-slate-100">
          {rows.map((r, i) => (
            <tr key={i}>
              {r.map((cell, j) => (
                <td
                  key={j}
                  className={`py-2 pr-3 align-top ${j === r.length - 1 ? 'text-right font-mono-numbers whitespace-nowrap' : 'text-slate-700'}`}
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot className="border-t border-slate-200 font-semibold">
            <tr>
              {footer.map((cell, j) => (
                <td key={j} className={`py-2 pr-3 ${j === footer.length - 1 ? 'text-right font-mono-numbers' : ''}`}>
                  {cell}
                </td>
              ))}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

function FounderSection({ draft }: { draft: Draft }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const f = draft.founder;

  async function toggleVerified() {
    if (!f) return;
    setBusy(true);
    setError(null);
    try {
      await verifyFounder(f.user_id, !f.is_verified);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'review', draft.project.id] });
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Section title={t('wizard.step.founder')}>
      {f ? (
        <>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-semibold text-ink flex items-center gap-1.5">
                {f.display_name}
                {f.is_verified && (
                  <BadgeCheck className="w-4 h-4 text-brand-deep" aria-label={t('project.verifiedFounder')} />
                )}
              </p>
              <p className="text-sm text-slate-600">
                {[f.role_title, f.organization, f.location].filter(Boolean).join(' · ')}
              </p>
              {f.registration_number && <p className="text-xs text-slate-500 mt-0.5">{f.registration_number}</p>}
            </div>
            <Button variant={f.is_verified ? 'secondary' : 'primary'} loading={busy} onClick={toggleVerified}>
              {f.is_verified ? t('admin.review.unverify') : t('admin.review.verify')}
            </Button>
          </div>
          {f.bio && <p className="text-sm text-slate-700 whitespace-pre-line">{f.bio}</p>}
        </>
      ) : (
        <Alert variant="warning">{t('wizard.review.problem.founder')}</Alert>
      )}
      {error && <Alert variant="error">{error}</Alert>}

      <h3 className="text-sm font-semibold text-ink pt-2">{t('wizard.founder.documents')}</h3>
      {draft.documents.length === 0 ? (
        <p className="text-sm text-slate-500">{t('admin.review.noDocuments')}</p>
      ) : (
        <ul className="space-y-1">
          {draft.documents.map(doc => (
            <li key={doc.id}>
              <button
                type="button"
                onClick={async () => window.open(await documentUrl(doc), '_blank', 'noopener')}
                className="flex items-center gap-2 text-sm text-ink hover:underline"
              >
                <FileText className="w-4 h-4 text-slate-400" aria-hidden />
                {doc.file_name}
                <span className="text-xs text-slate-500">· {t(`wizard.founder.kinds.${doc.kind}`)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

const PILLARS = ['business_plan_score', 'team_score', 'market_score', 'financial_score', 'risk_score'] as const;
const PILLAR_LABEL = {
  business_plan_score: 'businessPlan',
  team_score: 'team',
  market_score: 'market',
  financial_score: 'financial',
  risk_score: 'risk',
} as const;

function EvaluationForm({ projectId, evaluation }: { projectId: string; evaluation: Evaluation | null }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<EvaluationInput>({
    business_plan_score: evaluation?.business_plan_score ?? 0,
    team_score: evaluation?.team_score ?? 0,
    market_score: evaluation?.market_score ?? 0,
    financial_score: evaluation?.financial_score ?? 0,
    risk_score: evaluation?.risk_score ?? 0,
    confidence: evaluation?.confidence ?? 'moderate',
    summary: evaluation?.summary ?? '',
    strengths: evaluation?.strengths ?? [],
    risks: evaluation?.risks ?? [],
  });
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ variant: 'success' | 'error'; text: string } | null>(null);
  const total = PILLARS.reduce((s, k) => s + (form[k] || 0), 0);
  const lines = (s: string) =>
    s
      .split('\n')
      .map(x => x.trim())
      .filter(Boolean)
      .slice(0, 10);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (PILLARS.some(k => form[k] < 0 || form[k] > 20 || !Number.isInteger(form[k]))) {
      setFeedback({ variant: 'error', text: t('admin.review.scoreError') });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await saveEvaluation(projectId, form);
      await queryClient.invalidateQueries({ queryKey: ['admin', 'evaluation', projectId] });
      setFeedback({ variant: 'success', text: t('settings.saved') });
    } catch (err) {
      setFeedback({ variant: 'error', text: t(errorKey(err)) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="bg-card rounded-2xl border border-slate-200 p-5 sm:p-6 space-y-4"
    >
      <div className="flex items-baseline justify-between">
        <h2 className="text-base text-ink">{t('project.evaluationTitle')}</h2>
        <p className="font-display text-2xl text-ink">
          {total}
          <span className="text-sm text-slate-400"> / 100</span>
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {PILLARS.map(k => (
          <NumberField
            key={k}
            label={`${t(`project.pillars.${PILLAR_LABEL[k]}`)} (0–20)`}
            value={form[k]}
            onValue={v => setForm(f => ({ ...f, [k]: Math.round(v) }))}
          />
        ))}
      </div>
      <ChoiceGroup
        label={t('admin.review.confidence')}
        value={form.confidence}
        onChange={v => setForm(f => ({ ...f, confidence: v }))}
        options={(['high', 'moderate', 'in_review'] as const).map(c => ({
          value: c,
          label: t(`project.confidence.${c}`),
        }))}
      />
      <TextAreaField
        label={t('project.evaluatorSummary')}
        rows={3}
        maxLength={4000}
        value={form.summary}
        onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
      />
      <TextAreaField
        label={t('project.strengths')}
        hint={t('wizard.terms.tierItemsHint')}
        rows={3}
        value={form.strengths.join('\n')}
        onChange={e => setForm(f => ({ ...f, strengths: lines(e.target.value) }))}
      />
      <TextAreaField
        label={t('project.watchedRisks')}
        hint={t('wizard.terms.tierItemsHint')}
        rows={3}
        value={form.risks.join('\n')}
        onChange={e => setForm(f => ({ ...f, risks: lines(e.target.value) }))}
      />
      {feedback && <Alert variant={feedback.variant}>{feedback.text}</Alert>}
      <Button type="submit" variant="secondary" loading={busy} fullWidth>
        {t('admin.review.saveEvaluation')}
      </Button>
      <p className="text-xs text-slate-500">{t('admin.review.evaluationPublic')}</p>
    </form>
  );
}

function DecisionPanel({ projectId, hasEvaluation }: { projectId: string; hasEvaluation: boolean }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<Decision>('approve');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const needsNote = decision !== 'approve';

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (decision === 'approve' && !hasEvaluation) {
      setError(t('admin.review.needEvaluation'));
      return;
    }
    if (needsNote && note.trim().length < 10) {
      setError(t('admin.review.needNote'));
      return;
    }
    const confirmText = t(`admin.review.confirm.${decision}`);
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setError(null);
    try {
      await reviewProject(projectId, decision, note.trim() || null);
      await queryClient.invalidateQueries({ queryKey: ['admin'] });
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
      navigate(paths.adminReview);
    } catch (err) {
      setError(t(errorKey(err)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="bg-brand rounded-2xl p-5 sm:p-6 space-y-4">
      <h2 className="text-base text-ink">{t('admin.review.decision')}</h2>
      <ChoiceGroup
        label={t('admin.review.decisionLabel')}
        value={decision}
        onChange={setDecision}
        options={(['approve', 'request_changes', 'reject'] as const).map(d => ({
          value: d,
          label: t(`admin.review.decisions.${d}`),
          description: t(`admin.review.decisionHints.${d}`),
        }))}
      />
      <TextAreaField
        label={needsNote ? t('admin.review.noteRequired') : t('admin.review.noteOptional')}
        hint={t('admin.review.noteHint')}
        rows={4}
        maxLength={2000}
        value={note}
        onChange={e => setNote(e.target.value)}
      />
      {error && <Alert variant="error">{error}</Alert>}
      <Button type="submit" loading={busy} fullWidth variant={decision === 'reject' ? 'danger' : 'primary'}>
        {t(`admin.review.submit.${decision}`)}
      </Button>
    </form>
  );
}
