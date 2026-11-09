/**
 * Who is raising the money, and what that allows.
 * Mirrors the projects_model_fits_organizer constraint, submit_project() and the
 * pledge rules (supabase/migrations/20261109000027_organizer_type.sql and
 * 20261109000028_pledge_then_pay_and_identity.sql). Change both together.
 */
import type { Database } from '@/lib/database.types';

export type OrganizerType = Database['public']['Enums']['organizer_type'];
type FundingModel = Database['public']['Enums']['funding_model'];

export const ORGANIZERS: readonly OrganizerType[] = ['individual', 'yatt', 'mchj', 'ngo'];

const ALLOWED: Record<OrganizerType, readonly FundingModel[]> = {
  individual: ['donation', 'reward', 'equity'],
  yatt: ['donation', 'reward', 'equity'],
  mchj: ['donation', 'reward', 'equity'],
  ngo: ['donation'],
};

export const allowedModels = (o: OrganizerType) => ALLOWED[o];
export const modelAllowed = (o: OrganizerType, m: FundingModel) => ALLOWED[o].includes(m);

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

export const isOrganizer = (v: unknown): v is OrganizerType => ORGANIZERS.includes(v as OrganizerType);
