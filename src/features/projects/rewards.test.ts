import { describe, expect, it } from 'vitest';
import {
  discountPercent,
  isLowStock,
  rewardStatus,
  sortRewards,
  unitsLeft,
  type RewardLike,
} from '@/features/projects/rewards';

const base: RewardLike = {
  amount: 850_000,
  compare_at_amount: null,
  quantity_limit: null,
  claimed_count: 0,
  available_from: null,
  available_until: null,
  is_hidden: false,
};
const now = new Date('2026-11-07T12:00:00Z');

describe('reward cards', () => {
  it('shows a discount only when the retail price is higher', () => {
    expect(discountPercent({ amount: 850_000, compare_at_amount: 1_100_000 })).toBe(23);
    expect(discountPercent({ amount: 850_000, compare_at_amount: null })).toBeNull();
    expect(discountPercent({ amount: 850_000, compare_at_amount: 850_000 })).toBeNull();
  });

  it('counts units left', () => {
    expect(unitsLeft({ quantity_limit: 50, claimed_count: 43 })).toBe(7);
    expect(unitsLeft({ quantity_limit: null, claimed_count: 43 })).toBeNull();
    expect(isLowStock({ quantity_limit: 50, claimed_count: 43 })).toBe(true);
    expect(isLowStock({ quantity_limit: 50, claimed_count: 10 })).toBe(false);
  });

  it('knows when a reward is coming, available, sold out or ended', () => {
    expect(rewardStatus(base, now)).toBe('available');
    expect(rewardStatus({ ...base, available_from: '2026-11-10T00:00:00Z' }, now)).toBe('upcoming');
    expect(rewardStatus({ ...base, available_until: '2026-11-01T00:00:00Z' }, now)).toBe('ended');
    expect(rewardStatus({ ...base, quantity_limit: 5, claimed_count: 5 }, now)).toBe('soldOut');
  });

  it('puts available (featured first) before upcoming and sold out', () => {
    const r = (position: number, extra: Partial<RewardLike> & { is_featured?: boolean }) => ({
      ...base,
      position,
      is_featured: false,
      ...extra,
    });
    const sorted = sortRewards(
      [
        r(0, { quantity_limit: 1, claimed_count: 1 }),
        r(1, {}),
        r(2, { is_featured: true }),
        r(3, { available_from: '2027-01-01T00:00:00Z' }),
      ],
      now,
    );
    expect(sorted.map(x => x.position)).toEqual([2, 1, 3, 0]);
  });
});
