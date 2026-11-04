/**
 * Money and number formatting in the visitor's language.
 * All amounts are whole Uzbek so'm (UZS).
 */
import i18n from '@/i18n';

const LOCALES = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' } as const;
const locale = () => LOCALES[(i18n.resolvedLanguage ?? 'uz') as keyof typeof LOCALES] ?? 'uz-UZ';

export function formatNumber(value: number): string {
  return new Intl.NumberFormat(locale()).format(value);
}

/** "188 000 000 so'm", or compact: "188 mln so'm". */
export function formatMoney(amount: number, compact = false): string {
  const currency = i18n.t('money.currency');
  if (!compact) return `${formatNumber(amount)} ${currency}`;
  const units: [number, 'money.billion' | 'money.million' | 'money.thousand'][] = [
    [1e9, 'money.billion'],
    [1e6, 'money.million'],
    [1e3, 'money.thousand'],
  ];
  for (const [size, key] of units) {
    if (amount >= size) {
      const value = new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }).format(amount / size);
      return `${value} ${i18n.t(key)} ${currency}`;
    }
  }
  return `${formatNumber(amount)} ${currency}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));
}
