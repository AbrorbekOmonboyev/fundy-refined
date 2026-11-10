/**
 * Fundy starts as a donation platform. While this is true the site only offers
 * donation campaigns; equity (Musharakah) and reward projects that are already
 * live run to their end. The database enforces the same rule
 * (private.settings 'donation_only', migration 32): change both together.
 */
export const DONATION_ONLY = true;
