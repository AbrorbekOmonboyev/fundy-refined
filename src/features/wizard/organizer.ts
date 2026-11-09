/**
 * Who is raising the money, and what that allows.
 * Mirrors the projects_model_fits_organizer constraint and submit_project()
 * (supabase/migrations/20261109000027_organizer_type.sql). Change both together.
 */
import type { Database } from '@/lib/database.types';

export type OrganizerType = Database['public']['Enums']['organizer_type'];
type FundingModel = Database['public']['Enums']['funding_model'];

export const ORGANIZERS: readonly OrganizerType[] = ['individual', 'yatt', 'mchj', 'ngo'];

const ALLOWED: Record<OrganizerType, readonly FundingModel[]> = {
  individual: ['donation', 'reward'],
  yatt: ['donation', 'reward'],
  mchj: ['donation', 'reward', 'equity'],
  ngo: ['donation'],
};

export const allowedModels = (o: OrganizerType) => ALLOWED[o];
export const modelAllowed = (o: OrganizerType, m: FundingModel) => ALLOWED[o].includes(m);

/** A registered organiser gives its registration number and certificate before submitting. */
export const needsRegistration = (o: OrganizerType | null) => !!o && o !== 'individual';

export const isOrganizer = (v: unknown): v is OrganizerType => ORGANIZERS.includes(v as OrganizerType);
