/**
 * Money and number formatting in the visitor's language.
 * All amounts are whole Uzbek so'm (UZS).
 *
 * Uzbek and Russian: "213 000 000 so'm", "1,3 mlrd so'm" (space between thousands,
 * comma for decimals). We do this ourselves because some browsers lack Uzbek
 * number data and fall back to "213,000,000". English uses the English style.
 */
import i18n from '@/i18n';

const LOCALES = { uz: 'uz-UZ', ru: 'ru-RU', en: 'en-US' } as const;
const lang = () => (i18n.resolvedLanguage ?? 'uz') as keyof typeof LOCALES;
const locale = () => LOCALES[lang()] ?? 'uz-UZ';

const NBSP = String.fromCharCode(160); // keeps "213 000 000" on one line

/** Formats with at most `decimals` decimal places (trailing zeros dropped). */
function format(value: number, decimals: number): string {
  if (lang() === 'en') return new Intl.NumberFormat('en-US', { maximumFractionDigits: decimals }).format(value);
  const factor = 10 ** decimals;
  const rounded = Math.round(Math.abs(value) * factor) / factor;
  const [whole, fraction] = String(rounded).split('.');
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, NBSP);
  return `${value < 0 ? '-' : ''}${grouped}${fraction ? `,${fraction}` : ''}`;
}

export function formatNumber(value: number, decimals = 0): string {
  return format(value, decimals);
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
    if (amount >= size) return `${format(amount / size, 1)} ${i18n.t(key)} ${currency}`;
  }
  return `${formatNumber(amount)} ${currency}`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '';
  // A plain date ("2026-11-05") means that calendar day everywhere — don't let time zones shift it.
  const plain = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  const date = plain ? new Date(Number(plain[1]), Number(plain[2]) - 1, Number(plain[3])) : new Date(iso);
  return new Intl.DateTimeFormat(locale(), { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
}
