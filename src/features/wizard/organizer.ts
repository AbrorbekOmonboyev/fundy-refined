/**
 * Who is raising the money, and what that allows.
 * Mirrors the projects_model_fits_organizer constraint, submit_project() and the
 * pledge rules (supabase/migrations/20261109000027_organizer_type.sql and
 * 20261109000028_pledge_then_pay_and_identity.sql). Change both together.
 */
import type { Database } from '@/lib/database.types';
import { DONATION_ONLY } from '@/lib/focus';

export type OrganizerType = Database['public']['Enums']['organizer_type'];
type FundingModel = Database['public']['Enums']['funding_model'];

export const ORGANIZERS: readonly OrganizerType[] = ['individual', 'yatt', 'mchj', 'ngo'];

const ALLOWED: Record<OrganizerType, readonly FundingModel[]> = {
  individual: ['donation', 'reward', 'equity'],
  yatt: ['donation', 'reward', 'equity'],
  mchj: ['donation', 'reward', 'equity'],
  ngo: ['donation'],
};

/** While Fundy is donation-only (src/lib/focus.ts) every organiser runs donations only. */
export const allowedModels = (o: OrganizerType): readonly FundingModel[] =>
  DONATION_ONLY ? ALLOWED[o].filter(m => m === 'donation') : ALLOWED[o];
export const modelAllowed = (o: OrganizerType, m: FundingModel) => allowedModels(o).includes(m);

/** A registered organiser types its registration number before submitting. */
export const needsRegistration = (o: OrganizerType | null) => !!o && o !== 'individual';

/**
 * Musharakah without a company yet: investors pledge now and pay only after the
 * founder registers an MChJ (60 days after the goal is reached; then 7 days to pay).
 */
export const paysAfterRegistration = (o: OrganizerType | null, m: FundingModel) =>
  m === 'equity' && !!o && o !== 'mchj';
export const REGISTRATION_DAYS = 60;
export const PAYMENT_DAYS = 7;

/** When pledged cards will be charged: the registration deadline + 1 day (estimated before the campaign ends). */
export function expectedChargeDate(p: {
  endsAt: string | null;
  registrationDueAt: string | null;
  chargeAt: string | null;
}) {
  if (p.chargeAt) return p.chargeAt;
  const base = p.registrationDueAt ? new Date(p.registrationDueAt) : p.endsAt ? new Date(p.endsAt) : null;
  if (!base) return null;
  base.setDate(base.getDate() + (p.registrationDueAt ? 1 : REGISTRATION_DAYS + 1));
  return base.toISOString();
}

export const isOrganizer = (v: unknown): v is OrganizerType => ORGANIZERS.includes(v as OrganizerType);
