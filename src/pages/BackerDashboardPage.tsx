import { useState, type ReactNode } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Bookmark, Gift, HandCoins, TrendingUp } from 'lucide-react';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { pickText, type MyContribution } from '@/features/projects/api';
import { useMyContributions, useSavedProjectCards } from '@/features/projects/hooks';
import { ProjectCard } from '@/components/ProjectCard';
import { Alert, PageSpinner } from '@/components/ui';
import { formatDate, formatMoney, formatNumber } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';

type Tab = 'contributions' | 'saved';

/** "My contributions": everything the signed-in user has backed, and their saved projects. */
export function BackerDashboardPage() {
  const { t, i18n } = useTranslation();
  const { profile } = useAuth();
  const contributions = useMyContributions();
  const saved = useSavedProjectCards();
  const [tab, setTab] = useState<Tab>('contributions');
  usePageMeta(t('account.contributions'));

  const rows = contributions.data ?? [];
  const confirmed = rows.filter(c => c.status === 'confirmed');
  const total = confirmed.reduce((sum, c) => sum + c.amount, 0);
  const projectsBacked = new Set(confirmed.map(c => c.project?.slug)).size;
  const musharakah = confirmed.filter(c => c.project?.model === 'equity').reduce((sum, c) => sum + c.amount, 0);
  const rewards = confirmed.filter(c => c.reward).length;

  const tiles = [
    { Icon: HandCoins, label: t('dashboard.backer.total'), value: formatMoney(total, true) },
    { Icon: Bookmark, label: t('dashboard.backer.projects'), value: formatNumber(projectsBacked) },
    { Icon: TrendingUp, label: t('dashboard.backer.musharakah'), value: formatMoney(musharakah, true) },
    { Icon: Gift, label: t('dashboard.backer.rewards'), value: formatNumber(rewards) },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <p className="text-xs font-semibold text-ink">{t('account.contributions')}</p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mt-1">
            {t('dashboard.backer.title', { name: profile?.full_name })}
          </h1>
        </div>
        <Link
          to={paths.explore}
          className="px-4 py-2 text-xs font-semibold text-white bg-night hover:bg-night-soft rounded-md self-start sm:self-auto"
        >
          {t('home.hero.explore')}
        </Link>
      </header>

      <dl className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {tiles.map(({ Icon, label, value }) => (
          <div key={label} className="bg-card rounded-xl border border-slate-200 p-4">
            <dt className="flex items-center gap-1.5 text-xs text-slate-500">
              <Icon className="w-3.5 h-3.5 text-ink" aria-hidden />
              {label}
            </dt>
            <dd className="mt-1 text-xl font-bold text-ink font-mono-numbers">
              {contributions.isPending ? '…' : value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex gap-2 border-b border-slate-200" role="tablist">
        {(['contributions', 'saved'] as const).map(id => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`py-3 px-3 text-xs font-semibold border-b-2 -mb-px cursor-pointer ${
              tab === id ? 'border-ink text-ink' : 'border-transparent text-slate-500 hover:text-ink'
            }`}
          >
            {id === 'contributions'
              ? t('dashboard.backer.historyTab', { count: rows.length })
              : t('dashboard.backer.savedTab', { count: saved.items.length })}
          </button>
        ))}
      </div>

      {tab === 'contributions' &&
        (contributions.isPending ? (
          <PageSpinner />
        ) : contributions.isError ? (
          <Alert variant="error">{t('errors.generic')}</Alert>
        ) : rows.length === 0 ? (
          <Empty text={t('dashboard.backer.emptyContributions')} />
        ) : (
          <div className="bg-card rounded-xl border border-slate-200 overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">{t('dashboard.backer.date')}</th>
                  <th className="py-3 px-4">{t('dashboard.backer.project')}</th>
                  <th className="py-3 px-4">{t('dashboard.backer.details')}</th>
                  <th className="py-3 px-4">{t('dashboard.backer.money.title')}</th>
                  <th className="py-3 px-4">{t('contribute.method')}</th>
                  <th className="py-3 px-4 text-right">{t('contribute.amount')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map(c => {
                  const title = c.project
                    ? (pickText(
                        c.project.project_translations,
                        i18n.resolvedLanguage ?? 'uz',
                        c.project.original_language,
                      ).text?.title ?? c.project.slug)
                    : '—';
                  return (
                    <tr key={c.id} className="align-top">
                      <td className="py-3 px-4 whitespace-nowrap text-slate-500">{formatDate(c.created_at)}</td>
                      <td className="py-3 px-4">
                        {c.project ? (
                          <Link to={paths.project(c.project.slug)} className="font-semibold text-ink hover:text-ink">
                            {title}
                          </Link>
                        ) : (
                          title
                        )}
                        {c.project && (
                          <span className="block text-xs text-slate-500 mt-0.5">
                            {t(`models.${c.project.model}.name`)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {c.contribution_items.length > 0 ? (
                          <ul className="space-y-0.5">
                            {c.contribution_items.map((item, i) => (
                              <li key={i}>
                                {item.reward?.title ?? '—'}
                                {item.quantity > 1 && <strong className="text-ink"> ×{item.quantity}</strong>}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          c.reward && (
                            <span className="block">{t('contribute.successReward', { reward: c.reward.title })}</span>
                          )
                        )}
                        {c.extra_amount > 0 && c.contribution_items.length > 0 && (
                          <span className="block text-slate-500">
                            {t('cart.extra')}: {formatMoney(c.extra_amount)}
                          </span>
                        )}
                        {c.equity_share_pct != null && (
                          <span className="block">{t('dashboard.backer.share', { share: c.equity_share_pct })}</span>
                        )}
                        {c.is_anonymous && (
                          <span className="block text-slate-400">{t('dashboard.backer.anonymous')}</span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <MoneyStatus c={c} />
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                        {t(`contribute.methods.${c.payment_method}`)}
                        <span className="block text-xs text-slate-400">{t('dashboard.backer.simulated')}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono-numbers font-semibold text-ink whitespace-nowrap">
                        {formatMoney(c.amount)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

      {tab === 'saved' &&
        (saved.isPending ? (
          <PageSpinner />
        ) : saved.items.length === 0 ? (
          <Empty text={t('dashboard.backer.emptySaved')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-10">
            {saved.items.map(p => (
              <ProjectCard key={p.id} project={p} />
            ))}
          </div>
        ))}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  const { t } = useTranslation();
  return (
    <div className="p-12 text-center bg-card rounded-2xl border border-slate-200 space-y-4">
      <p className="text-sm text-slate-600">{text}</p>
      <Link
        to={paths.explore}
        className="inline-block px-4 py-2 text-xs font-semibold text-ink bg-brand-soft hover:bg-brand rounded-md"
      >
        {t('home.hero.explore')}
      </Link>
    </div>
  );
}

const MONTHS: Record<string, number> = { quarterly: 3, biannually: 6, annually: 12 };

/** First payout after today: every few months from the campaign's end. */
function nextPayoutDate(endsAt: string, everyMonths: number): string {
  const d = new Date(endsAt);
  const now = new Date();
  do d.setMonth(d.getMonth() + everyMonths);
  while (d < now);
  return d.toISOString().slice(0, 10);
}

/** Where this backer's money is now, in plain words, plus the next profit date for Musharakah. */
function MoneyStatus({ c }: { c: MyContribution }) {
  const { t } = useTranslation();
  const p = c.project;
  if (!p) return null;
  if (c.status === 'refunded') return <Badge tone="rose">{t('dashboard.backer.money.refunded')}</Badge>;
  if (p.status === 'active') return <Badge tone="slate">{t('dashboard.backer.money.waiting')}</Badge>;
  if (p.status === 'unsuccessful') return <Badge tone="rose">{t('dashboard.backer.money.refunding')}</Badge>;

  const released = p.milestones.filter(m => m.status === 'approved').reduce((s, m) => s + Number(m.release_percent), 0);
  let nextPayout: string | null = null;
  if (p.model === 'equity' && p.equity_terms && p.ends_at) {
    nextPayout = formatDate(nextPayoutDate(p.ends_at, MONTHS[p.equity_terms.distribution_schedule] ?? 3));
  }

  return (
    <div className="space-y-1.5 min-w-40">
      <p className="text-ink font-semibold">{t('dashboard.backer.money.released', { percent: released })}</p>
      <div className="h-1.5 rounded-full bg-track overflow-hidden" aria-hidden>
        <div className="h-full bg-brand rounded-full" style={{ width: `${released}%` }} />
      </div>
      {nextPayout && <p className="text-slate-500">{t('dashboard.backer.money.nextPayout', { date: nextPayout })}</p>}
    </div>
  );
}

function Badge({ tone, children }: { tone: 'rose' | 'slate'; children: ReactNode }) {
  const style = tone === 'rose' ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-700';
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 font-semibold whitespace-nowrap ${style}`}>{children}</span>
  );
}
