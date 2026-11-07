import { beforeEach, describe, expect, it, vi } from 'vitest';

// A tiny in-memory stand-in for the browser's localStorage.
function memoryStorage() {
  const data = new Map<string, string>();
  return {
    get length() {
      return data.size;
    },
    key: (i: number) => [...data.keys()][i] ?? null,
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, String(v)),
    removeItem: (k: string) => void data.delete(k),
    clear: () => data.clear(),
  };
}

describe('cart per account', () => {
  let cart: typeof import('@/features/cart/cart');
  // Read the cart directly from storage, the way the app would show it.
  const linesOf = (projectId: string) => {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)!;
      if (k === currentPrefix + projectId) {
        return (JSON.parse(localStorage.getItem(k)!) as { lines: { rewardId: string; quantity: number }[] }).lines;
      }
    }
    return [];
  };
  let currentPrefix = 'fundy-cart:';
  const login = (id: string | null) => {
    cart.setCartOwner(id);
    currentPrefix = id ? `fundy-ucart:${id}:` : 'fundy-cart:';
  };

  beforeEach(async () => {
    vi.stubGlobal('localStorage', memoryStorage());
    vi.resetModules();
    cart = await import('@/features/cart/cart');
    currentPrefix = 'fundy-cart:';
  });

  it('hides the cart after logout and brings it back after login', () => {
    login('user-a');
    cart.cartActions('p1', 'knives').add('knife', 2);
    expect(linesOf('p1')).toEqual([{ rewardId: 'knife', quantity: 2 }]);

    login(null);
    expect(linesOf('p1')).toEqual([]);

    login('user-a');
    expect(linesOf('p1')).toEqual([{ rewardId: 'knife', quantity: 2 }]);
  });

  it('moves a guest cart into the account on login, adding to what was there', () => {
    login('user-a');
    cart.cartActions('p1', 'knives').add('knife', 1);
    login(null);
    cart.cartActions('p1', 'knives').add('knife', 2);
    cart.cartActions('p1', 'knives').add('sheath', 1);

    login('user-a');
    expect(linesOf('p1')).toEqual([
      { rewardId: 'knife', quantity: 3 },
      { rewardId: 'sheath', quantity: 1 },
    ]);
    expect(localStorage.getItem('fundy-cart:p1')).toBeNull(); // guest cart is gone
  });

  it('never shows one account the cart of another', () => {
    login('user-a');
    cart.cartActions('p1', 'knives').add('knife', 1);
    login(null);
    login('user-b');
    expect(linesOf('p1')).toEqual([]);
  });
});
