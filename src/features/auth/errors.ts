/**
 * Turns errors from Supabase (login or database) into a translation key,
 * so the message is shown in the visitor's language.
 */
import type { ParseKeys } from 'i18next';

type ErrorKey = Extract<ParseKeys, `errors.${string}`>;

const BY_CODE: Record<string, ErrorKey> = {
  // Login (Supabase Auth error codes)
  invalid_credentials: 'errors.invalidCredentials',
  email_not_confirmed: 'errors.emailNotConfirmed',
  user_already_exists: 'errors.userExists',
  email_exists: 'errors.userExists',
  weak_password: 'errors.weakPassword',
  same_password: 'errors.samePassword',
  email_address_invalid: 'errors.invalidEmail',
  validation_failed: 'errors.invalidEmail',
  over_email_send_rate_limit: 'errors.rateLimit',
  over_request_rate_limit: 'errors.rateLimit',
  otp_expired: 'errors.linkExpired',
  flow_state_expired: 'errors.linkExpired',
  flow_state_not_found: 'errors.linkExpired',
  bad_code_verifier: 'errors.linkOtherBrowser',
  signup_disabled: 'errors.signupDisabled',
  user_banned: 'errors.blocked',
  // Database functions (see supabase/migrations/*_functions.sql)
  account_has_activity: 'errors.accountHasActivity',
  amount_below_minimum: 'errors.amountBelowMinimum',
  amount_above_maximum: 'errors.amountAboveMaximum',
  amount_below_reward_price: 'errors.amountBelowRewardPrice',
  reward_sold_out: 'errors.rewardSoldOut',
  project_not_accepting_contributions: 'errors.projectClosed',
  cannot_back_own_project: 'errors.ownProject',
  account_blocked: 'errors.blocked',
  not_signed_in: 'errors.notSignedIn',
};

export function errorKey(error: unknown): ErrorKey {
  if (!error || typeof error !== 'object') return 'errors.generic';
  const e = error as { code?: string; message?: string; name?: string; status?: number };
  if (e.code && BY_CODE[e.code]) return BY_CODE[e.code];
  if (e.message && BY_CODE[e.message]) return BY_CODE[e.message]; // database functions raise the key as the message
  if (e.name === 'AuthRetryableFetchError' || e.message === 'Failed to fetch' || e.status === 0)
    return 'errors.network';
  return 'errors.generic';
}
