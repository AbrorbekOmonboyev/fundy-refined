/**
 * Formats a number as Uzbek So'm (UZS).
 * E.g. 150000000 -> "150,000,000 UZS"
 */
export function formatUZS(amount: number, compact: boolean = false): string {
  if (compact) {
    if (amount >= 1_000_000_000) {
      return `${(amount / 1_000_000_000).toFixed(1)}B UZS`;
    }
    if (amount >= 1_000_000) {
      return `${(amount / 1_000_000).toFixed(1)}M UZS`;
    }
    if (amount >= 1_000) {
      return `${(amount / 1_000).toFixed(0)}K UZS`;
    }
    return `${amount} UZS`;
  }

  return `${new Intl.NumberFormat('uz-UZ').format(amount)} UZS`;
}

/**
 * Formats a funding percentage.
 */
export function formatPercentage(raised: number, target: number): number {
  if (!target || target <= 0) return 0;
  return Math.min(Math.round((raised / target) * 100), 200);
}

/**
 * Formats model names into clear human labels.
 */
export function getModelLabel(model: 'donation' | 'reward' | 'equity'): string {
  switch (model) {
    case 'donation':
      return 'Donation-based';
    case 'reward':
      return 'Reward-based';
    case 'equity':
      return 'Equity (Musharakah)';
  }
}

/**
 * Returns human-readable description of the model.
 */
export function getModelDescription(model: 'donation' | 'reward' | 'equity'): string {
  switch (model) {
    case 'donation':
      return 'Non-financial philanthropic support for social causes, educational initiatives, and community development.';
    case 'reward':
      return 'Backers receive early-bird products, hand-crafted artifacts, or curated experiences upon campaign fulfillment.';
    case 'equity':
      return 'Shariah-compliant entrepreneurial partnership with shared profit distributions and transparent balance-sheet audits.';
  }
}
