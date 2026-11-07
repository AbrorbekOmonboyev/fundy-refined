/**
 * Reward rules shown on cards. The database enforces the same rules when someone
 * pays (contribute()); these only decide what the card says.
 */
export type RewardLike = {
  amount: number;
  compare_at_amount: number | null;
  quantity_limit: number | null;
  claimed_count: number;
  available_from: string | null;
  available_until: string | null;
  is_hidden: boolean;
};

export type RewardStatus = 'upcoming' | 'available' | 'soldOut' | 'ended';

/** "−20%" from the retail price, rounded; null when there's no real discount. */
export function discountPercent(r: Pick<RewardLike, 'amount' | 'compare_at_amount'>): number | null {
  if (!r.compare_at_amount || r.compare_at_amount <= r.amount) return null;
  const pct = Math.round((1 - r.amount / r.compare_at_amount) * 100);
  return pct >= 1 ? pct : null;
}

/** Units still available, or null when unlimited. */
export function unitsLeft(r: Pick<RewardLike, 'quantity_limit' | 'claimed_count'>): number | null {
  return r.quantity_limit === null ? null : Math.max(0, r.quantity_limit - r.claimed_count);
}

export function rewardStatus(r: RewardLike, now: Date = new Date()): RewardStatus {
  if (r.available_from && now < new Date(r.available_from)) return 'upcoming';
  if (r.available_until && now >= new Date(r.available_until)) return 'ended';
  if (unitsLeft(r) === 0) return 'soldOut';
  return 'available';
}

/** "Few left" badge: 10 or fewer units, or under 10% of the stock. */
export function isLowStock(r: Pick<RewardLike, 'quantity_limit' | 'claimed_count'>): boolean {
  const left = unitsLeft(r);
  return left !== null && left > 0 && (left <= 10 || left / (r.quantity_limit ?? 1) < 0.1);
}

/** Available first (featured on top), then upcoming, then sold out / ended. Keeps the founder's order inside each group. */
export function sortRewards<T extends RewardLike & { position: number; is_featured: boolean }>(
  list: T[],
  now = new Date(),
): T[] {
  const rank = (r: T) => {
    const s = rewardStatus(r, now);
    return s === 'available' ? (r.is_featured ? 0 : 1) : s === 'upcoming' ? 2 : 3;
  };
  return [...list].sort((a, b) => rank(a) - rank(b) || a.position - b.position);
}
