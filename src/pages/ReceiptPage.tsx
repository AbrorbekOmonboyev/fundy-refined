import { Link, useParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { BadgeCheck, Printer } from 'lucide-react';
import { paths } from '@/app/routes';
import { getReceipt } from '@/features/projects/api';
import { pickText } from '@/features/projects/api';
import { Alert, Button, PageSpinner } from '@/components/ui';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { formatDate, formatMoney } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';

/** A donor's receipt for one contribution: to keep, save as PDF or print. */
export function ReceiptPage() {
  const { t, i18n } = useTranslation();
  const { id = '' } = useParams();
  const receipt = useQuery({ queryKey: ['receipt', id], queryFn: () => getReceipt(id) });
  usePageMeta(t('receipt.title'));

  if (receipt.isPending) return <PageSpinner />;
  if (receipt.isError) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <Alert variant="error">{t('errors.generic')}</Alert>
      </div>
    );
  }
  const r = receipt.data;
  if (!r || !r.project) return <NotFoundPage />;

  const lang = i18n.resolvedLanguage ?? 'uz';
  const title =
    pickText(r.project.project_translations, lang, r.project.original_language).text?.title ?? r.project.slug;
  const organiser =
    r.project.owner?.founder_profiles?.organization ||
    r.project.owner?.founder_profiles?.display_name ||
    r.project.owner?.full_name ||
    '';
  const number = `FND-${r.id.slice(0, 8).toUpperCase()}`;
  const rows: [string, string][] = [
    [t('receipt.number'), number],
    [t('receipt.date'), formatDate(r.created_at)],
    [t('receipt.donor'), r.backer?.full_name ?? ''],
    [t('receipt.project'), title],
    [t('receipt.organiser'), organiser],
    ...(r.project.fund_verified_at && r.project.fund_registration_number
      ? ([[t('receipt.registration'), r.project.fund_registration_number]] as [string, string][])
      : []),
    [t('receipt.method'), t(`contribute.methods.${r.payment_method}`)],
    [t('receipt.status'), t(`receipt.statuses.${r.status}`)],
  ];

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <article className="bg-card rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6 print:border-0 print:p-0">
        <header className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Fundy · fundy.uz</p>
          <h1 className="text-2xl text-ink">{t('receipt.title')}</h1>
          <p className="text-sm text-slate-600">{t('receipt.thanks')}</p>
        </header>

        <dl className="divide-y divide-slate-200 border-y border-slate-200 text-sm">
          {rows.map(([label, value]) => (
            <div key={label} className="py-2.5 grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4">
              <dt className="text-slate-500">{label}</dt>
              <dd className="text-ink text-right break-words">{value}</dd>
            </div>
          ))}
        </dl>

        <dl className="space-y-1.5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-slate-600">{t('receipt.donation')}</dt>
            <dd className="font-mono-numbers text-ink">{formatMoney(r.amount)}</dd>
          </div>
          {r.tip_amount > 0 && (
            <div className="flex justify-between gap-4">
              <dt className="text-slate-600">{t('receipt.tip')}</dt>
              <dd className="font-mono-numbers text-ink">{formatMoney(r.tip_amount)}</dd>
            </div>
          )}
          <div className="flex justify-between gap-4 pt-2 border-t border-slate-200 text-base font-bold">
            <dt className="text-ink">{t('receipt.total')}</dt>
            <dd className="font-mono-numbers text-ink">{formatMoney(r.amount + r.tip_amount)}</dd>
          </div>
        </dl>

        {r.project.fund_verified_at && (
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand-deep">
            <BadgeCheck className="w-4 h-4" aria-hidden />
            {t('project.verifiedFund')}
          </p>
        )}

        <p className="text-xs text-slate-500">{t('receipt.note')}</p>

        <div className="flex flex-col sm:flex-row gap-3 print:hidden">
          <Button onClick={() => window.print()} variant="secondary">
            <Printer className="w-4 h-4" aria-hidden />
            {t('receipt.print')}
          </Button>
          <Link
            to={paths.project(r.project.slug)}
            className="px-4 py-2.5 text-sm font-semibold text-ink underline underline-offset-4 self-center"
          >
            {t('receipt.toProject')}
          </Link>
        </div>
      </article>
    </div>
  );
}
