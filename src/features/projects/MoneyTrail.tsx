import { useTranslation } from 'react-i18next';
import { BadgeCheck, Check, FileText, ListChecks, Scale } from 'lucide-react';
import type { ProjectDetail } from '@/features/projects/api';
import { formatMoney } from '@/lib/money';

/**
 * "Where is the money?" — Fundy's main promise made visible: one bar split into the
 * project's stages. Stages that were approved are paid out; the rest is still held.
 */
export function MoneyTrail({ project }: { project: ProjectDetail }) {
  const { t } = useTranslation();
  const stages = project.milestones;
  if (stages.length === 0) return null;

  const pool = Math.min(project.raisedAmount, project.targetAmount);
  const sum = (status: string) =>
    stages.filter(m => m.status === status).reduce((s, m) => s + Number(m.release_percent), 0);
  const releasedPct = sum('approved');
  const reviewPct = sum('submitted');
  const current = stages.findIndex(m => m.status !== 'approved');
  const raising = project.status === 'active';

  return (
    <section aria-labelledby="money-trail" className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 id="money-trail" className="text-base font-bold text-ink">
          {t('project.money.title')}
        </h2>
        <p className="text-xs text-slate-500">{t('project.money.stages', { count: stages.length })}</p>
      </div>

      {/* One segment per stage, as wide as its share of the money */}
      <div className="flex h-3 rounded-full overflow-hidden gap-0.5 bg-card" aria-hidden>
        {stages.map(m => (
          <div
            key={m.id}
            style={{ width: `${m.release_percent}%` }}
            className={
              m.status === 'approved'
                ? 'bg-brand'
                : m.status === 'submitted'
                  ? 'bg-amber-200 [background-image:repeating-linear-gradient(45deg,transparent_0_4px,rgb(255_255_255/0.5)_4px_8px)]'
                  : 'bg-track'
            }
          />
        ))}
      </div>

      {!raising && (
        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
          <Legend
            swatch="bg-brand"
            label={t('project.money.released')}
            value={raising ? '—' : formatMoney(Math.round((pool * releasedPct) / 100), true)}
            pct={releasedPct}
          />
          <Legend
            swatch="bg-amber-200"
            label={t('project.money.review')}
            value={raising ? '—' : formatMoney(Math.round((pool * reviewPct) / 100), true)}
            pct={reviewPct}
          />
          <Legend
            swatch="bg-track"
            label={t('project.money.held')}
            value={raising ? '—' : formatMoney(Math.round((pool * (100 - releasedPct - reviewPct)) / 100), true)}
            pct={100 - releasedPct - reviewPct}
          />
        </dl>
      )}

      {raising && <p className="text-sm text-slate-600">{t('project.money.raisingNote')}</p>}

      {/* Timeline */}
      <ol className="grid gap-3" style={{ gridTemplateColumns: `repeat(${stages.length}, minmax(0, 1fr))` }}>
        {stages.map((m, i) => {
          const done = m.status === 'approved';
          const now = i === current && !raising;
          return (
            <li key={m.id} className="relative min-w-0">
              {i > 0 && (
                <span
                  aria-hidden
                  className={`absolute top-3.5 right-1/2 w-full h-0.5 -z-0 ${done ? 'bg-brand' : 'bg-slate-200'}`}
                />
              )}
              <span
                className={`relative z-10 mx-auto w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                  done ? 'bg-brand text-ink' : now ? 'bg-night text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {done ? <Check className="w-4 h-4" aria-label={t('project.milestoneStatus.approved')} /> : i + 1}
              </span>
              <p className="mt-2 text-center text-xs font-semibold text-ink line-clamp-2">{m.title}</p>
              <p className="text-center text-xs text-slate-500 font-mono-numbers">
                {m.target_label ? `${m.target_label} · ` : ''}
                {Number(m.release_percent)}%
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Legend({ swatch, label, value, pct }: { swatch: string; label: string; value: string; pct: number }) {
  return (
    <div className="flex items-start gap-2">
      <span className={`mt-1.5 w-2.5 h-2.5 rounded-sm shrink-0 ${swatch}`} aria-hidden />
      <div>
        <dt className="text-xs text-slate-500">{label}</dt>
        <dd className="font-semibold text-ink font-mono-numbers">
          {value} <span className="text-xs font-normal text-slate-500">({pct}%)</span>
        </dd>
      </div>
    </div>
  );
}

/** What Fundy actually checked — only items that are true are listed. */
export function ChecksList({ project }: { project: ProjectDetail }) {
  const { t } = useTranslation();
  const items: { Icon: typeof Check; text: string }[] = [];
  if (project.founderVerified) items.push({ Icon: BadgeCheck, text: t('project.checks.identity') });
  if (project.verifiedFund !== null)
    items.push({ Icon: BadgeCheck, text: t('project.checks.verifiedFund', { number: project.verifiedFund }) });
  if (project.founder?.registration_number && project.verifiedFund === null)
    items.push({
      Icon: FileText,
      text: t('project.checks.registration', { number: project.founder.registration_number }),
    });
  if (project.budget.length > 0)
    items.push({ Icon: ListChecks, text: t('project.checks.budget', { count: project.budget.length }) });
  if (project.evaluation)
    items.push({ Icon: Scale, text: t('project.checks.score', { score: project.evaluation.overall_score }) });
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="checks" className="pt-6 border-t border-slate-200">
      <h2 id="checks" className="text-base font-bold text-ink mb-3">
        {t('project.checks.title')}
      </h2>
      <ul className="space-y-2">
        {items.map(({ Icon, text }) => (
          <li key={text} className="flex items-start gap-2.5 text-sm text-slate-700">
            <Icon className="w-4 h-4 mt-0.5 text-brand-deep shrink-0" aria-hidden />
            <span className="min-w-0 break-words">{text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
