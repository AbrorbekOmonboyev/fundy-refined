import { useTranslation } from 'react-i18next';
import { formatMoney } from '@/lib/money';
import { publicFileUrl } from '@/lib/supabase';

type Props = {
  evidence: string | null;
  spentAmount: number | null;
  receiptPaths: string[];
};

/**
 * What a stage's money was spent on: the organiser's note, the amount and photos of the
 * receipts. Public on the project page once Fundy approved the stage; also shown to admins.
 */
export function SpendingReport({ evidence, spentAmount, receiptPaths }: Props) {
  const { t } = useTranslation();
  if (!evidence && spentAmount === null && receiptPaths.length === 0) return null;

  return (
    <div className="rounded-lg bg-page p-3 space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold text-slate-700">{t('spending.title')}</p>
        {spentAmount !== null && (
          <p className="text-sm text-ink">
            {t('spending.spent')} <strong className="font-mono-numbers">{formatMoney(spentAmount)}</strong>
          </p>
        )}
      </div>
      {evidence && <p className="text-sm text-slate-700 whitespace-pre-line break-words">{evidence}</p>}
      {receiptPaths.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label={t('spending.receipts')}>
          {receiptPaths.map((path, i) => {
            const url = publicFileUrl('project-images', path);
            if (!url) return null;
            return (
              <li key={path}>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-20 h-20 rounded-md overflow-hidden border border-slate-200 hover:border-ink"
                >
                  <img
                    src={url}
                    alt={t('spending.receiptAlt', { n: i + 1 })}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                </a>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
