/**
 * The pledge cart (docs/PLAN-rewards-and-pledges.md, Phase B).
 *
 * Kept in this browser per project, so it works before logging in and survives a
 * reload. Each account has its own carts: logging out hides them, logging back in
 * brings them back, and a guest cart is moved into the account on login. Only reward ids and quantities are stored — prices always come from the
 * project data, and the database checks everything again when paying.
 */
import { useSyncExternalStore } from 'react';
import { rewardStatus, unitsLeft, type RewardLike } from '@/features/projects/rewards';

export type CartLine = { rewardId: string; quantity: number };
/** slug + updatedAt let the header icon link to the right project page. */
export type Cart = { lines: CartLine[]; extra: number; slug?: string; updatedAt?: number };

export const MAX_QTY = 99;
const EMPTY: Cart = { lines: [], extra: 0 };
/** Whose carts are shown: null = guest (not logged in), otherwise the user's id. */
let owner: string | null = null;
const GUEST_PREFIX = 'fundy-cart:';
const prefixFor = (who: string | null) => (who ? `fundy-ucart:${who}:` : GUEST_PREFIX);
const key = (projectId: string) => prefixFor(owner) + projectId;
const listeners = new Set<() => void>();
const cache = new Map<string, { raw: string | null; cart: Cart }>();

function read(projectId: string): Cart {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(key(projectId));
  } catch {
    /* storage blocked: empty cart */
  }
  const hit = cache.get(projectId);
  if (hit && hit.raw === raw) return hit.cart; // same object → no needless re-renders
  let cart = EMPTY;
  try {
    const parsed = raw ? (JSON.parse(raw) as Cart) : null;
    if (parsed && Array.isArray(parsed.lines)) {
      cart = {
        lines: parsed.lines
          .filter(l => typeof l.rewardId === 'string' && Number.isInteger(l.quantity) && l.quantity > 0)
          .map(l => ({ rewardId: l.rewardId, quantity: Math.min(l.quantity, MAX_QTY) })),
        extra: Math.max(0, Math.round(Number(parsed.extra) || 0)),
        slug: typeof parsed.slug === 'string' ? parsed.slug : undefined,
        updatedAt: Number(parsed.updatedAt) || 0,
      };
    }
  } catch {
    /* broken data: start empty */
  }
  cache.set(projectId, { raw, cart });
  return cart;
}

function write(projectId: string, cart: Cart) {
  try {
    if (cart.lines.length === 0 && cart.extra === 0) localStorage.removeItem(key(projectId));
    else localStorage.setItem(key(projectId), JSON.stringify(cart));
  } catch {
    /* private mode: the cart just won't be remembered */
  }
  listeners.forEach(l => l());
}

/** All project ids that have a cart saved under this prefix. */
function projectIdsWith(prefix: string): string[] {
  const ids: string[] = [];
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k?.startsWith(prefix)) ids.push(k.slice(prefix.length));
    }
  } catch {
    /* storage blocked */
  }
  return ids;
}

/**
 * Switch carts when someone logs in or out (called by AuthProvider).
 * On login, anything put in the cart as a guest is added to that account's cart,
 * so "add to cart, then log in to pay" keeps working.
 */
export function setCartOwner(userId: string | null) {
  if (userId === owner) return;
  if (userId) {
    for (const projectId of projectIdsWith(GUEST_PREFIX)) {
      owner = null;
      const guest = read(projectId);
      owner = userId;
      const mine = read(projectId);
      const lines = [...mine.lines];
      for (const g of guest.lines) {
        const found = lines.findIndex(l => l.rewardId === g.rewardId);
        if (found >= 0)
          lines[found] = { ...lines[found], quantity: Math.min(MAX_QTY, lines[found].quantity + g.quantity) };
        else lines.push(g);
      }
      try {
        localStorage.setItem(
          key(projectId),
          JSON.stringify({
            lines,
            extra: guest.extra || mine.extra,
            slug: guest.slug ?? mine.slug,
            updatedAt: Math.max(guest.updatedAt ?? 0, mine.updatedAt ?? 0),
          }),
        );
        localStorage.removeItem(GUEST_PREFIX + projectId);
      } catch {
        /* storage blocked */
      }
    }
  }
  owner = userId;
  cache.clear();
  listeners.forEach(l => l());
}

export function cartActions(projectId: string, slug?: string) {
  const update = (fn: (c: Cart) => Cart) =>
    write(projectId, { ...fn(read(projectId)), slug: slug ?? read(projectId).slug, updatedAt: Date.now() });
  return {
    add: (rewardId: string, quantity = 1) =>
      update(c => {
        const found = c.lines.find(l => l.rewardId === rewardId);
        return {
          ...c,
          lines: found
            ? c.lines.map(l =>
                l.rewardId === rewardId ? { ...l, quantity: Math.min(MAX_QTY, l.quantity + quantity) } : l,
              )
            : [...c.lines, { rewardId, quantity }],
        };
      }),
    setQuantity: (rewardId: string, quantity: number) =>
      update(c => ({
        ...c,
        lines:
          quantity <= 0
            ? c.lines.filter(l => l.rewardId !== rewardId)
            : c.lines.map(l => (l.rewardId === rewardId ? { ...l, quantity: Math.min(MAX_QTY, quantity) } : l)),
      })),
    remove: (rewardId: string) => update(c => ({ ...c, lines: c.lines.filter(l => l.rewardId !== rewardId) })),
    setExtra: (extra: number) => update(c => ({ ...c, extra: Math.max(0, Math.round(extra) || 0) })),
    clear: () => write(projectId, EMPTY),
  };
}

export function useCart(projectId: string): Cart {
  return useSyncExternalStore(
    l => {
      listeners.add(l);
      const onStorage = (e: StorageEvent) => e.key === key(projectId) && l(); // other tabs
      window.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(l);
        window.removeEventListener('storage', onStorage);
      };
    },
    () => read(projectId),
    () => EMPTY,
  );
}

// ---------------------------------------------------------------------------
// Totals and problems (pure — tested in cart.test.ts)
// ---------------------------------------------------------------------------
export type CartReward = RewardLike & {
  id: string;
  title: string;
  kind: 'reward' | 'addon';
  per_backer_limit: number | null;
};

export type LineProblem = 'missing' | 'unavailable' | 'notEnough' | 'overLimit';

export type PricedLine = {
  rewardId: string;
  reward: CartReward | null;
  quantity: number;
  lineTotal: number;
  problem: LineProblem | null;
};

export function priceCart(cart: Cart, rewards: CartReward[], now = new Date()) {
  const lines: PricedLine[] = cart.lines.map(l => {
    const reward = rewards.find(r => r.id === l.rewardId && !r.is_hidden) ?? null;
    if (!reward) return { rewardId: l.rewardId, reward: null, quantity: l.quantity, lineTotal: 0, problem: 'missing' };
    const status = rewardStatus(reward, now);
    const left = unitsLeft(reward);
    const problem: LineProblem | null =
      status !== 'available'
        ? 'unavailable'
        : left !== null && l.quantity > left
          ? 'notEnough'
          : reward.per_backer_limit !== null && l.quantity > reward.per_backer_limit
            ? 'overLimit'
            : null;
    return { rewardId: l.rewardId, reward, quantity: l.quantity, lineTotal: reward.amount * l.quantity, problem };
  });
  const valid = lines.filter(l => !l.problem);
  const itemsTotal = valid.reduce((s, l) => s + l.lineTotal, 0);
  return {
    lines,
    itemsTotal,
    total: itemsTotal + cart.extra,
    count: valid.reduce((s, l) => s + l.quantity, 0),
    hasMain: valid.some(l => l.reward?.kind === 'reward'),
    hasAddon: valid.some(l => l.reward?.kind === 'addon'),
    hasProblems: lines.some(l => l.problem),
  };
}

/** Highest quantity the stepper allows for a reward. */
export function maxQuantity(r: CartReward): number {
  const left = unitsLeft(r);
  return Math.max(1, Math.min(MAX_QTY, left ?? MAX_QTY, r.per_backer_limit ?? MAX_QTY));
}

// ---------------------------------------------------------------------------
// All carts in this browser (for the header icon)
// ---------------------------------------------------------------------------
export type CartRef = { projectId: string; slug: string };
export type CartsSummary = { count: number; latest: CartRef | null; all: CartRef[] };
const NO_CARTS: CartsSummary = { count: 0, latest: null, all: [] };
let summaryCache: { sig: string; value: CartsSummary } = { sig: '', value: NO_CARTS };

function readSummary(): CartsSummary {
  const carts = projectIdsWith(prefixFor(owner)).map(projectId => ({ projectId, cart: read(projectId) }));
  const count = carts.reduce(
    (s, c) =>
      s + c.cart.lines.reduce((n, l) => n + l.quantity, 0) + (c.cart.extra > 0 && c.cart.lines.length === 0 ? 1 : 0),
    0,
  );
  const withItems = carts
    .filter(c => c.cart.slug && (c.cart.lines.length > 0 || c.cart.extra > 0))
    .sort((a, b) => (b.cart.updatedAt ?? 0) - (a.cart.updatedAt ?? 0))
    .map(c => ({ projectId: c.projectId, slug: c.cart.slug! }));
  const value: CartsSummary = { count, latest: withItems[0] ?? null, all: withItems };
  const sig = JSON.stringify(value);
  if (sig !== summaryCache.sig) summaryCache = { sig, value };
  return summaryCache.value;
}

export function useCartsSummary(): CartsSummary {
  return useSyncExternalStore(
    l => {
      listeners.add(l);
      const onStorage = (e: StorageEvent) => e.key?.startsWith(prefixFor(owner)) && l();
      window.addEventListener('storage', onStorage);
      return () => {
        listeners.delete(l);
        window.removeEventListener('storage', onStorage);
      };
    },
    readSummary,
    () => NO_CARTS,
  );
}

/** Ask the open project page to show its cart (the header icon uses this). */
export const OPEN_CART_EVENT = 'fundy:open-cart';
export function requestOpenCart(projectId: string) {
  window.dispatchEvent(new CustomEvent(OPEN_CART_EVENT, { detail: { projectId } }));
}
