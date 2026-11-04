import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  Bookmark,
  CheckCircle,
  Clock,
  Languages,
  Link2,
  Send,
  Sparkles,
  ThumbsUp,
  TrendingUp,
  Users,
} from 'lucide-react';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { errorKey } from '@/features/auth/errors';
import { daysLeft, pickText, postComment, type ProjectComment, type ProjectDetail } from '@/features/projects/api';
import { projectKeys, useProject, useProjectList, useSavedProjects } from '@/features/projects/hooks';
import { ContributeDialog } from '@/features/projects/ContributeDialog';
import { useCategories } from '@/features/reference/useReference';
import { ProjectCard } from '@/components/ProjectCard';
import { Avatar } from '@/components/Avatar';
import { Alert, Button, PageSpinner } from '@/components/ui';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { formatDate, formatMoney, formatNumber } from '@/lib/money';
import { publicFileUrl } from '@/lib/supabase';
import { usePageMeta } from '@/lib/usePageMeta';

type Tab = 'story' | 'budget' | 'milestones' | 'evaluation' | 'risks' | 'updates' | 'comments';
const BUDGET_COLORS = ['bg-brand', 'bg-ink', 'bg-brand-deep', 'bg-slate-400', 'bg-ink-soft', 'bg-track'];

export function ProjectDetailPage() {
  const { t } = useTranslation();
  const { slug } = useParams();
  const { data: project, isPending, isError } = useProject(slug);

  if (isPending) return <PageSpinner />;
  if (isError) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <Alert variant="error">{t('errors.generic')}</Alert>
      </div>
    );
  }
  if (!project) return <NotFoundPage />;
  // key: reset tabs and dialogs when moving to another project
  return <ProjectView key={project.id} project={project} />;
}

function ProjectView({ project }: { project: ProjectDetail }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { nameOf } = useCategories();
  const saved = useSavedProjects();
  const related = useProjectList({ category: project.categoryId, excludeId: project.id, status: 'live', pageSize: 3 });

  const lang = i18n.resolvedLanguage ?? 'uz';
  const { text, isFallback } = pickText(project.translations, lang, project.originalLanguage);
  const title = text?.title ?? project.slug;
  usePageMeta(title, text?.tagline);

  const [tab, setTab] = useState<Tab>('story');
  const [dialogReward, setDialogReward] = useState<string | null | undefined>(undefined); // undefined = closed
  const [copied, setCopied] = useState(false);

  const isLive = project.status === 'active' && daysLeft(project.endsAt) > 0;
  const isOwner = user?.id === project.ownerId;
  const isSaved = saved.isSaved(project.id);
  const shareUrl = window.location.href;

  function openContribute(rewardId: string | null = null) {
    if (!user) {
      navigate(`${paths.login}?next=${encodeURIComponent(location.pathname)}`);
      return;
    }
    setDialogReward(rewardId);
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t('project.copyLink'), shareUrl);
    }
  }

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'story', label: t('project.tabs.story'), show: true },
    { id: 'budget', label: t('project.tabs.budget'), show: project.budget.length > 0 },
    { id: 'milestones', label: t('project.tabs.milestones'), show: project.milestones.length > 0 },
    { id: 'evaluation', label: t('project.tabs.evaluation'), show: !!project.evaluation },
    { id: 'risks', label: t('project.tabs.risks'), show: !!text?.risks },
    { id: 'updates', label: t('project.tabs.updates', { count: project.updates.length }), show: true },
    { id: 'comments', label: t('project.tabs.comments', { count: project.comments.length }), show: true },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12">
      <nav aria-label={t('project.breadcrumb')} className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
        <Link to={paths.home} className="hover:text-ink shrink-0">
          {t('project.home')}
        </Link>
        <span aria-hidden>/</span>
        <Link to={paths.explore} className="hover:text-ink shrink-0">
          {t('nav.explore')}
        </Link>
        <span aria-hidden>/</span>
        <Link to={`${paths.explore}?category=${project.categoryId}`} className="hover:text-ink shrink-0">
          {nameOf(project.categoryId)}
        </Link>
        <span aria-hidden>/</span>
        <span className="text-ink font-medium truncate">{title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: story header */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-ink bg-brand-soft px-2 py-0.5 rounded">
              {t(`models.${project.model}.name`)}
            </span>
            <span aria-hidden>·</span>
            <span>{nameOf(project.categoryId)}</span>
            {project.location && (
              <>
                <span aria-hidden>·</span>
                <span>{project.location}</span>
              </>
            )}
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink leading-tight">{title}</h1>
          <p className="text-sm text-slate-600 leading-relaxed">{text?.tagline}</p>

          {isFallback && text && (
            <p className="flex items-center gap-1.5 text-xs text-slate-500">
              <Languages className="w-3.5 h-3.5" aria-hidden />
              {t('project.originalLanguage', { language: t(`languages.${text.language}`) })}
            </p>
          )}

          {project.coverUrl && (
            <div className="rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 border border-slate-200">
              <img src={project.coverUrl} alt="" className="w-full h-full object-cover" />
            </div>
          )}

          {/* Founder */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={project.founderName} url={project.founderAvatarUrl} />
              <div className="text-xs min-w-0">
                <p className="flex items-center gap-1.5 font-bold text-ink">
                  {project.founderName}
                  {project.founderVerified && (
                    <CheckCircle className="w-3.5 h-3.5 text-ink" aria-label={t('project.verifiedFounder')} />
                  )}
                </p>
                {(project.founder?.role_title || project.founder?.organization) && (
                  <p className="text-slate-500 truncate">
                    {[project.founder?.role_title, project.founder?.organization].filter(Boolean).join(' · ')}
                  </p>
                )}
                {project.founder?.registration_number && (
                  <p className="text-[11px] text-slate-400 mt-0.5">{project.founder.registration_number}</p>
                )}
              </div>
            </div>
            {project.founder?.experience_years != null && (
              <div className="text-right text-xs shrink-0 hidden sm:block">
                <span className="text-slate-400">{t('project.experience')}</span>
                <p className="font-bold text-slate-700">
                  {t('project.years', { count: project.founder.experience_years })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right: funding box */}
        <aside className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="space-y-2">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <p className="text-2xl sm:text-3xl font-extrabold text-ink font-mono-numbers">
                    {formatMoney(project.raisedAmount)}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {t('project.raisedOf', { goal: formatMoney(project.targetAmount) })}
                  </p>
                </div>
                <span className="text-2xl font-bold text-ink font-mono-numbers">{project.fundedPercent}%</span>
              </div>
              <div className="w-full bg-track rounded-full h-2.5 overflow-hidden" aria-hidden>
                <div
                  className="bg-brand h-full rounded-full"
                  style={{ width: `${Math.min(project.fundedPercent, 100)}%` }}
                />
              </div>
              <dl className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <dt className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" aria-hidden /> {t('project.backersLabel')}
                  </dt>
                  <dd className="text-base font-bold text-ink font-mono-numbers mt-0.5">
                    {formatNumber(project.backerCount)}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" aria-hidden />{' '}
                    {isLive ? t('project.timeLeft') : t('project.statusLabel')}
                  </dt>
                  <dd className="text-base font-bold text-ink font-mono-numbers mt-0.5">
                    {isLive
                      ? t('project.daysLeft', { count: daysLeft(project.endsAt) })
                      : t(`status.${project.status}`)}
                  </dd>
                </div>
              </dl>
            </div>

            {project.equity && (
              <div className="p-4 bg-brand-soft border border-brand rounded-xl text-xs space-y-2">
                <p className="flex items-center gap-1.5 font-bold text-ink">
                  <TrendingUp className="w-4 h-4 text-ink" aria-hidden />
                  {t(`project.contract.${project.equity.contract_type}`)}
                </p>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {t('project.equitySummary', {
                    percent: project.equity.investor_profit_share_pct,
                    schedule: t(`project.schedule.${project.equity.distribution_schedule}`),
                    years: project.equity.exit_horizon_years,
                  })}
                </p>
                <div className="pt-1 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-600 border-t border-brand">
                  <span>{t('project.minInvestment', { amount: formatMoney(project.equity.min_investment) })}</span>
                  {project.equity.projected_annual_return && (
                    <span>{t('project.projectedReturn', { value: project.equity.projected_annual_return })}</span>
                  )}
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              {isLive && !isOwner && (
                <Button onClick={() => openContribute()} fullWidth className="py-3.5">
                  {t(`contribute.cta.${project.model}`)}
                </Button>
              )}
              {isOwner && <Alert variant="info">{t('project.youOwnThis')}</Alert>}
              {!isLive && !isOwner && <Alert variant="info">{t('project.notAccepting')}</Alert>}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => saved.toggle(project.id)}
                  aria-pressed={isSaved}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer ${
                    isSaved
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} aria-hidden />
                  {isSaved ? t('project.saved') : t('project.save')}
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Link2 className="w-3.5 h-3.5" aria-hidden />
                  {copied ? t('project.copied') : t('project.copyLink')}
                </button>
              </div>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full py-2 px-3 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-xs font-semibold text-sky-800 text-center"
              >
                {t('project.shareTelegram')}
              </a>
            </div>

            {project.evaluation && (
              <button
                type="button"
                onClick={() => setTab('evaluation')}
                className="w-full p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-left hover:border-slate-300"
              >
                <span className="flex items-center gap-2 text-xs">
                  <Sparkles className="w-4 h-4 text-ink" aria-hidden />
                  <span>
                    <span className="block font-bold text-ink">{t('project.evaluationScore')}</span>
                    <span className="text-[11px] text-slate-500">
                      {t(`project.confidence.${project.evaluation.confidence}`)}
                    </span>
                  </span>
                </span>
                <span className="text-base font-extrabold text-ink font-mono-numbers">
                  {project.evaluation.overall_score}/100
                </span>
              </button>
            )}

            <p className="text-[10px] text-slate-400 text-center leading-normal">{t('contribute.demoNote')}</p>
          </div>
        </aside>
      </div>

      {/* Tabs */}
      <section className="pt-6 border-t border-slate-200">
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto" role="tablist">
          {tabs
            .filter(x => x.show)
            .map(x => (
              <button
                key={x.id}
                type="button"
                role="tab"
                aria-selected={tab === x.id}
                onClick={() => setTab(x.id)}
                className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 -mb-px cursor-pointer ${
                  tab === x.id ? 'border-ink text-ink' : 'border-transparent text-slate-500 hover:text-ink'
                }`}
              >
                {x.label}
              </button>
            ))}
        </div>

        <div className="py-8" role="tabpanel">
          {tab === 'story' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6 text-sm text-slate-700 leading-relaxed">
                <h2 className="text-lg font-bold text-ink">{t('project.about')}</h2>
                <div className="whitespace-pre-line text-slate-600">{text?.story}</div>
                {project.founder?.bio && (
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h3 className="font-bold text-ink text-xs uppercase tracking-wider">{t('project.founderBio')}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{project.founder.bio}</p>
                  </div>
                )}
              </div>
              {project.rewards.length > 0 && (
                <div className="lg:col-span-4 space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">{t('project.rewards')}</h3>
                  {project.rewards.map(r => {
                    const soldOut = r.quantity_limit !== null && r.claimed_count >= r.quantity_limit;
                    return (
                      <div key={r.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-sm">
                        <div className="flex justify-between items-baseline gap-2">
                          <span className="font-bold text-ink text-xs">{r.title}</span>
                          <span className="text-xs font-bold text-ink font-mono-numbers shrink-0">
                            {formatMoney(r.amount)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">{r.description}</p>
                        {r.items.length > 0 && (
                          <ul className="text-[11px] text-slate-500 space-y-1 pt-1">
                            {r.items.map(item => (
                              <li key={item} className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" aria-hidden />
                                {item}
                              </li>
                            ))}
                          </ul>
                        )}
                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                          {r.estimated_delivery && <span>{t('project.delivery', { when: r.estimated_delivery })}</span>}
                          <span className="font-mono-numbers">
                            {r.quantity_limit !== null
                              ? t('project.claimedOf', { claimed: r.claimed_count, limit: r.quantity_limit })
                              : t('project.claimed', { count: r.claimed_count })}
                          </span>
                        </div>
                        {isLive && !isOwner && (
                          <button
                            type="button"
                            disabled={soldOut}
                            onClick={() => openContribute(r.id)}
                            className="w-full mt-2 py-2 text-xs font-semibold text-ink bg-brand-soft hover:bg-brand disabled:opacity-50 rounded-lg"
                          >
                            {soldOut ? t('project.soldOut') : t('project.selectReward')}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'budget' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h2 className="text-lg font-bold text-ink">{t('project.budgetTitle')}</h2>
                <p className="text-xs text-slate-500 mt-1">
                  {t('project.budgetText', { goal: formatMoney(project.targetAmount) })}
                </p>
              </div>
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex" aria-hidden>
                {project.budget.map((item, i) => (
                  <div
                    key={item.id}
                    className={`h-full ${BUDGET_COLORS[i % BUDGET_COLORS.length]}`}
                    style={{ width: `${(item.amount / project.targetAmount) * 100}%` }}
                    title={item.category}
                  />
                ))}
              </div>
              <div className="border border-slate-200 rounded-xl overflow-x-auto bg-white shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">{t('project.budgetItem')}</th>
                      <th className="py-3 px-4">{t('project.budgetDescription')}</th>
                      <th className="py-3 px-4 text-right">{t('project.budgetAmount')}</th>
                      <th className="py-3 px-4 text-right">%</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {project.budget.map(item => (
                      <tr key={item.id}>
                        <td className="py-3 px-4 font-semibold text-ink">{item.category}</td>
                        <td className="py-3 px-4 text-slate-600">{item.description}</td>
                        <td className="py-3 px-4 text-right font-mono-numbers whitespace-nowrap">
                          {formatMoney(item.amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-numbers text-slate-500">
                          {Math.round((item.amount / project.targetAmount) * 100)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-ink">
                    <tr>
                      <td className="py-3 px-4" colSpan={2}>
                        {t('project.budgetTotal')}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-numbers text-ink whitespace-nowrap">
                        {formatMoney(project.targetAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-numbers">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {tab === 'milestones' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h2 className="text-lg font-bold text-ink">{t('project.milestonesTitle')}</h2>
                <p className="text-xs text-slate-500 mt-1">{t('project.milestonesText')}</p>
              </div>
              <ol className="space-y-4">
                {project.milestones.map((m, i) => {
                  const approved = m.status === 'approved';
                  return (
                    <li
                      key={m.id}
                      className={`p-4 rounded-xl border ${approved ? 'bg-brand-soft border-brand' : 'bg-white border-slate-200'}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                              approved ? 'bg-ink text-white' : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {approved ? '✓' : i + 1}
                          </span>
                          <div>
                            <h3 className="font-bold text-ink text-sm flex flex-wrap items-center gap-2">
                              {m.title}
                              <span
                                className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${approved ? 'bg-brand text-ink' : 'bg-slate-100 text-slate-600'}`}
                              >
                                {t(`project.milestoneStatus.${m.status}`)}
                              </span>
                            </h3>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">{m.description}</p>
                          </div>
                        </div>
                        <div className="text-right text-xs shrink-0 font-mono-numbers">
                          {m.target_label && <span className="text-slate-400 block">{m.target_label}</span>}
                          <strong className="text-ink">{t('project.release', { percent: m.release_percent })}</strong>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>
          )}

          {tab === 'evaluation' && project.evaluation && <EvaluationPanel project={project} />}

          {tab === 'risks' && (
            <div className="space-y-4 max-w-3xl">
              <h2 className="text-lg font-bold text-ink">{t('project.risksTitle')}</h2>
              <p className="text-xs text-slate-500">{t('project.risksText')}</p>
              <div className="p-5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-sm whitespace-pre-line">
                {text?.risks}
              </div>
            </div>
          )}

          {tab === 'updates' && (
            <div className="space-y-6 max-w-3xl">
              <h2 className="text-lg font-bold text-ink">{t('project.updatesTitle')}</h2>
              {project.updates.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                  {t('project.noUpdates')}
                </p>
              ) : (
                project.updates.map(u => (
                  <article key={u.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                    <header className="flex items-start justify-between gap-3 text-xs">
                      <h3 className="font-bold text-ink text-sm">{u.title}</h3>
                      <time className="text-slate-400 shrink-0">{formatDate(u.created_at)}</time>
                    </header>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{u.body}</p>
                    <footer className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <span>{t('project.postedBy', { name: u.author?.full_name ?? project.founderName })}</span>
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3.5 h-3.5" aria-hidden />
                        <span className="font-mono-numbers">{u.likes_count}</span>
                      </span>
                    </footer>
                  </article>
                ))
              )}
            </div>
          )}

          {tab === 'comments' && <CommentsPanel project={project} isOwner={isOwner} />}
        </div>
      </section>

      {related.data && related.data.items.length > 0 && (
        <section className="pt-10 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-ink">{t('project.related')}</h2>
            <Link
              to={`${paths.explore}?category=${project.categoryId}`}
              className="text-xs font-semibold text-ink hover:text-ink"
            >
              {t('project.viewAll')}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {related.data.items.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        </section>
      )}

      {dialogReward !== undefined && (
        <ContributeDialog
          project={project}
          title={title}
          initialRewardId={dialogReward}
          onClose={() => setDialogReward(undefined)}
        />
      )}
    </div>
  );
}

function EvaluationPanel({ project }: { project: ProjectDetail }) {
  const { t } = useTranslation();
  const e = project.evaluation!;
  const pillars = [
    { key: 'businessPlan', score: e.business_plan_score },
    { key: 'team', score: e.team_score },
    { key: 'market', score: e.market_score },
    { key: 'financial', score: e.financial_score },
    { key: 'risk', score: e.risk_score },
  ] as const;

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden />
        <p>{t('project.evaluationNote')}</p>
      </div>
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between pb-6 border-b border-slate-200 gap-4">
          <div>
            <h2 className="text-xl font-bold text-ink">{t('project.evaluationTitle')}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('project.evaluatedOn', { date: formatDate(e.evaluated_at) })} ·{' '}
              {t(`project.confidence.${e.confidence}`)}
            </p>
          </div>
          <p>
            <span className="text-3xl font-extrabold text-ink font-mono-numbers">{e.overall_score}</span>
            <span className="text-slate-400 text-sm"> / 100</span>
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {pillars.map(p => (
            <div key={p.key} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs font-semibold text-slate-700">
                <span>{t(`project.pillars.${p.key}`)}</span>
                <span className="font-mono-numbers text-ink">{p.score} / 20</span>
              </div>
              <div className="w-full bg-track rounded-full h-1.5 overflow-hidden" aria-hidden>
                <div className="bg-brand h-full rounded-full" style={{ width: `${(p.score / 20) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
          {e.summary && (
            <div>
              <h3 className="font-bold text-ink">{t('project.evaluatorSummary')}</h3>
              <p className="text-slate-600 mt-1 leading-relaxed">{e.summary}</p>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-brand-soft p-3 rounded-lg border border-brand">
              <h3 className="font-bold text-ink mb-1.5">{t('project.strengths')}</h3>
              <ul className="space-y-1 text-slate-600">
                {e.strengths.map(s => (
                  <li key={s} className="flex items-start gap-1.5">
                    <span className="text-ink font-bold" aria-hidden>
                      ✓
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
              <h3 className="font-bold text-amber-900 mb-1.5">{t('project.watchedRisks')}</h3>
              <ul className="space-y-1 text-slate-600">
                {e.risks.map(r => (
                  <li key={r} className="flex items-start gap-1.5">
                    <span className="text-amber-600 font-bold" aria-hidden>
                      !
                    </span>
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CommentsPanel({ project, isOwner }: { project: ProjectDetail; isOwner: boolean }) {
  const { t } = useTranslation();
  const location = useLocation();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [body, setBody] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(text: string, parentId?: string) {
    if (!user || !text.trim()) return false;
    setBusy(true);
    setError(null);
    try {
      await postComment(project.id, user.id, text, parentId);
      await queryClient.invalidateQueries({ queryKey: projectKeys.detail(project.slug) });
      return true;
    } catch (e) {
      setError(t(errorKey(e)));
      return false;
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (await submit(body)) setBody('');
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="text-lg font-bold text-ink">{t('project.commentsTitle')}</h2>
        <p className="text-xs text-slate-500 mt-1">{t('project.commentsText')}</p>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
          <label className="sr-only" htmlFor="new-comment">
            {t('project.commentPlaceholder')}
          </label>
          <textarea
            id="new-comment"
            rows={3}
            maxLength={4000}
            placeholder={t('project.commentPlaceholder')}
            value={body}
            onChange={e => setBody(e.target.value)}
            className="w-full text-sm p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand"
          />
          {error && <Alert variant="error">{error}</Alert>}
          <div className="flex justify-end">
            <Button type="submit" loading={busy} disabled={!body.trim()}>
              <Send className="w-3.5 h-3.5" aria-hidden />
              {t('project.postComment')}
            </Button>
          </div>
        </form>
      ) : (
        <p className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm text-slate-600">
          <Link
            to={`${paths.login}?next=${encodeURIComponent(location.pathname)}`}
            className="font-semibold text-ink hover:underline"
          >
            {t('account.login')}
          </Link>
          {t('project.loginToComment')}
        </p>
      )}

      {project.comments.length === 0 ? (
        <p className="text-center text-xs text-slate-500 py-6">{t('project.noComments')}</p>
      ) : (
        <ul className="space-y-3">
          {project.comments.map(c => (
            <CommentItem key={c.id} comment={c} canReply={isOwner} onReply={text => submit(text, c.id)} busy={busy} />
          ))}
        </ul>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  canReply,
  onReply,
  busy,
}: {
  comment: ProjectComment;
  canReply: boolean;
  onReply: (text: string) => Promise<boolean>;
  busy: boolean;
}) {
  const { t } = useTranslation();
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState('');

  return (
    <li className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs shadow-sm">
      <div className="flex items-center justify-between gap-2 text-slate-500">
        <div className="flex items-center gap-2 min-w-0">
          <Avatar
            name={comment.author?.full_name ?? '?'}
            url={publicFileUrl('avatars', comment.author?.avatar_path)}
            size="sm"
          />
          <strong className="text-ink truncate">{comment.author?.full_name}</strong>
          {comment.author?.city && <span className="hidden sm:inline">({comment.author.city})</span>}
          {comment.is_backer && (
            <span className="text-[10px] bg-brand-soft text-ink font-semibold px-1.5 py-0.5 rounded">
              {t('project.backerBadge')}
            </span>
          )}
        </div>
        <time className="text-[11px] text-slate-400 shrink-0">{formatDate(comment.created_at)}</time>
      </div>
      <p className="text-slate-700 leading-relaxed whitespace-pre-line">{comment.body}</p>

      {comment.replies.map(r => (
        <div key={r.id} className="mt-2 pl-3 border-l-2 border-ink space-y-1 bg-slate-50/60 p-2 rounded-r-lg">
          <div className="flex items-center justify-between text-[11px] text-slate-600">
            <strong className="text-ink">{t('project.founderReply', { name: r.author?.full_name })}</strong>
            <time className="text-slate-400">{formatDate(r.created_at)}</time>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed whitespace-pre-line">{r.body}</p>
        </div>
      ))}

      {canReply &&
        (replying ? (
          <form
            onSubmit={async e => {
              e.preventDefault();
              if (await onReply(reply)) {
                setReply('');
                setReplying(false);
              }
            }}
            className="pt-2 space-y-2"
          >
            <textarea
              rows={2}
              maxLength={4000}
              value={reply}
              onChange={e => setReply(e.target.value)}
              aria-label={t('project.reply')}
              className="w-full text-xs p-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand"
            />
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setReplying(false)}>
                {t('common.cancel')}
              </Button>
              <Button type="submit" loading={busy} disabled={!reply.trim()}>
                {t('project.reply')}
              </Button>
            </div>
          </form>
        ) : (
          <Button variant="link" onClick={() => setReplying(true)}>
            {t('project.reply')}
          </Button>
        ))}
    </li>
  );
}
