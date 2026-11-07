import { beforeAll, describe, expect, it } from 'vitest';
import i18n from '@/i18n';
import { formatDate, formatMoney } from '@/lib/money';

// Intl may use a (narrow) no-break space as the thousands separator; \s matches those too.
const plain = (s: string) => s.replace(/\s/g, ' ');

describe('money formatting', () => {
  beforeAll(async () => {
    await i18n.changeLanguage('en');
  });

  it('formats whole amounts with the currency', () => {
    expect(plain(formatMoney(188_000_000))).toBe('188,000,000 UZS');
  });

  it('shortens big amounts when asked', () => {
    expect(formatMoney(188_000_000, true)).toBe('188 M UZS');
    expect(formatMoney(2_500_000_000, true)).toBe('2.5 B UZS');
    expect(formatMoney(45_000, true)).toBe('45 K UZS');
    expect(plain(formatMoney(900, true))).toBe('900 UZS');
  });

  it('switches language', async () => {
    await i18n.changeLanguage('ru');
    expect(formatMoney(5_000_000, true)).toContain(i18n.t('money.million'));
    await i18n.changeLanguage('en');
  });
});

describe('dates', () => {
  it('keeps a plain date on the same calendar day in every time zone', () => {
    expect(formatDate('2026-11-05')).toBe('November 5, 2026');
  });

  it('is empty for missing dates', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});

describe('Uzbek and Russian number style', () => {
  it('uses spaces between thousands and a decimal comma', async () => {
    await i18n.changeLanguage('uz');
    expect(plain(formatMoney(213_000_000))).toBe(`213 000 000 ${i18n.t('money.currency')}`);
    expect(formatMoney(1_340_000_000, true)).toBe(`1,3 ${i18n.t('money.billion')} ${i18n.t('money.currency')}`);
    expect(formatMoney(188_000_000, true)).toBe(`188 ${i18n.t('money.million')} ${i18n.t('money.currency')}`);
    await i18n.changeLanguage('ru');
    expect(plain(formatMoney(5_500))).toBe(`5 500 ${i18n.t('money.currency')}`);
    await i18n.changeLanguage('en');
  });
});

describe('Uzbek dates', () => {
  it('writes months by hand (browsers often lack them)', async () => {
    await i18n.changeLanguage('uz');
    expect(formatDate('2026-11-12')).toBe('2026-yil 12-noyabr');
    await i18n.changeLanguage('en');
  });
});
