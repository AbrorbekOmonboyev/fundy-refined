import { describe, expect, it } from 'vitest';
import { maxQuantity, priceCart, type CartReward } from '@/features/cart/cart';

const reward = (id: string, extra: Partial<CartReward> = {}): CartReward => ({
  id,
  title: id,
  kind: 'reward',
  amount: 280_000,
  compare_at_amount: null,
  quantity_limit: null,
  claimed_count: 0,
  available_from: null,
  available_until: null,
  is_hidden: false,
  per_backer_limit: null,
  ...extra,
});
const now = new Date('2026-11-07T12:00:00Z');

describe('pledge cart', () => {
  const knife = reward('knife', { per_backer_limit: 3 });
  const sheath = reward('sheath', { kind: 'addon', amount: 95_000, quantity_limit: 10, claimed_count: 9 });

  it('adds up lines and extra support', () => {
    const p = priceCart(
      {
        lines: [
          { rewardId: 'knife', quantity: 2 },
          { rewardId: 'sheath', quantity: 1 },
        ],
        extra: 50_000,
      },
      [knife, sheath],
      now,
    );
    expect(p.itemsTotal).toBe(655_000);
    expect(p.total).toBe(705_000);
    expect(p.count).toBe(3);
    expect(p.hasMain && p.hasAddon).toBe(true);
    expect(p.hasProblems).toBe(false);
  });

  it('flags lines that can no longer be bought, and leaves them out of the total', () => {
    const p = priceCart(
      {
        lines: [
          { rewardId: 'gone', quantity: 1 },
          { rewardId: 'sheath', quantity: 2 }, // only 1 left
          { rewardId: 'knife', quantity: 4 }, // max 3 per person
        ],
        extra: 0,
      },
      [knife, sheath],
      now,
    );
    expect(p.lines.map(l => l.problem)).toEqual(['missing', 'notEnough', 'overLimit']);
    expect(p.total).toBe(0);
    expect(p.hasProblems).toBe(true);
  });

  it('caps the quantity stepper by stock and per-person limit', () => {
    expect(maxQuantity(knife)).toBe(3);
    expect(maxQuantity(sheath)).toBe(1);
    expect(maxQuantity(reward('free'))).toBe(99);
  });
});
