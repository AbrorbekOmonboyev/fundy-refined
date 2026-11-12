import { describe, expect, test } from 'vitest';
import { parseAmount } from '@/lib/money';

describe('parseAmount (accepts amounts the way people type them)', () => {
  test.each([
    ['100000', 100_000],
    ['100 000', 100_000],
    ['100,000', 100_000],
    ['100.000', 100_000],
    ['100k', 100_000],
    ['100 ming', 100_000],
    ['1.5 mln', 1_500_000],
    ['1,5 mln', 1_500_000],
    ['2 млн', 2_000_000],
    ["50 000 so'm", 50_000],
    ['50 000 soʻm', 50_000],
    ['250 000 сум', 250_000],
    ['', 0],
    ['abc', 0],
  ])('%s → %d', (input, expected) => {
    expect(parseAmount(input)).toBe(expected);
  });
});
