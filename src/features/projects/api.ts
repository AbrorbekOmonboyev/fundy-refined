/**
 * Reading projects from the database.
 *
 * Every project comes with its text in all available languages; `pickText`
 * chooses the visitor's language, falling back to the language the founder
 * wrote it in.
 */
import { supabase } from '@/lib/supabase';
import { publicFileUrl } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/i18n';

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];
export type FundingModel = Enums['funding_model'];
export type ProjectStatus = Enums['project_status'];
type Translation = Pick<Tables['project_translations']['Row'], 'language' | 'title' | 'tagline'> &
  Partial<Pick<Tables['project_translations']['Row'], 'summary' | 'story' | 'risks'>>;

function client() {
  if (!supabase) throw new Error('not_configured');
  return supabase;
}

/** The translation in `lang`, else the original language, else any. */
export function pickText<T extends { language: Language }>(rows: T[], lang: string, original: Language) {
  const chosen = rows.find(r => r.language === lang) ?? rows.find(r => r.language === original) ?? rows[0];
  return { text: chosen, isFallback: !!chosen && chosen.language !== lang };
}

export function daysLeft(endsAt: string | null): number {
  if (!endsAt) return 0;
  return Math.max(0, Math.ceil((new Date(endsAt).getTime() - Date.now()) / 86_400_000));
}

// ---------------------------------------------------------------------------
// Project cards (lists)
// ---------------------------------------------------------------------------
const CARD_COLUMNS = `
  id, slug, model, category_id, region_id, location, cover_image_path, original_language,
  target_amount, raised_amount, backer_count, funded_percent, status, is_featured, ends_at, created_at,
  project_translations ( language, title, tagline ),
  evaluations ( overall_score, is_published ),
  owner:profiles!projects_owner_id_fkey ( full_name, founder_profiles!founder_profiles_user_id_fkey ( display_name, is_verified ) )
`;

type CardRow = {
  id: string;
  slug: string;
  model: FundingModel;
  category_id: string;
  region_id: string | null;
  location: string | null;
  cover_image_path: string | null;
  original_language: Language;
  target_amount: number;
  raised_amount: number;
  backer_count: number;
  funded_percent: number | null;
  status: ProjectStatus;
  is_featured: boolean;
  ends_at: string | null;
  created_at: string;
  project_translations: Translation[];
  evaluations: { overall_score: number | null; is_published: boolean } | null;
  owner: { full_name: string; founder_profiles: { display_name: string; is_verified: boolean } | null } | null;
};

export type ProjectCardData = {
  id: string;
  slug: string;
  model: FundingModel;
  categoryId: string;
  regionId: string | null;
  location: string | null;
  coverUrl: string | null;
  targetAmount: number;
  raisedAmount: number;
  backerCount: number;
  fundedPercent: number;
  status: ProjectStatus;
  endsAt: string | null;
  translations: Translation[];
  originalLanguage: Language;
  founderName: string;
  founderVerified: boolean;
  score: number | null;
};

function toCard(row: CardRow): ProjectCardData {
  return {
    id: row.id,
    slug: row.slug,
    model: row.model,
    categoryId: row.category_id,
    regionId: row.region_id,
    location: row.location,
    coverUrl: publicFileUrl('project-images', row.cover_image_path),
    targetAmount: row.target_amount,
    raisedAmount: row.raised_amount,
    backerCount: row.backer_count,
    fundedPercent: Math.round(row.funded_percent ?? 0),
    status: row.status,
    endsAt: row.ends_at,
    translations: row.project_translations,
    originalLanguage: row.original_language,
    founderName: row.owner?.founder_profiles?.display_name ?? row.owner?.full_name ?? '',
    founderVerified: row.owner?.founder_profiles?.is_verified ?? false,
    score: row.evaluations?.is_published ? (row.evaluations.overall_score ?? null) : null,
  };
}

export type ProjectSort = 'most_funded' | 'newest' | 'ending_soon' | 'most_backers' | 'target_low';
export type ProjectFilters = {
  search?: string;
  model?: FundingModel | null;
  category?: string | null;
  region?: string | null;
  status?: 'live' | 'funded' | 'all';
  sort?: ProjectSort;
  featured?: boolean;
  excludeId?: string;
  page?: number; // 1-based
  pageSize?: number;
};

export async function listProjects(filters: ProjectFilters): Promise<{ items: ProjectCardData[]; total: number }> {
  const db = client();
  const pageSize = filters.pageSize ?? 12;
  const page = Math.max(1, filters.page ?? 1);

  let ids: string[] | null = null;
  if (filters.search && filters.search.trim().length >= 2) {
    const { data, error } = await db.rpc('search_project_ids', { p_query: filters.search });
    if (error) throw error;
    ids = data ?? [];
    if (ids.length === 0) return { items: [], total: 0 };
  }

  let query = db.from('projects').select(CARD_COLUMNS, { count: 'exact' });
  // Only approved projects are listed (owners also see their drafts through RLS — exclude them here).
  if (filters.status === 'live') query = query.eq('status', 'active');
  else if (filters.status === 'funded') query = query.in('status', ['funded', 'completed']);
  else query = query.in('status', ['active', 'funded', 'completed', 'unsuccessful']);
  if (ids) query = query.in('id', ids);
  if (filters.model) query = query.eq('model', filters.model);
  if (filters.category) query = query.eq('category_id', filters.category);
  if (filters.region) query = query.eq('region_id', filters.region);
  if (filters.featured) query = query.eq('is_featured', true);
  if (filters.excludeId) query = query.neq('id', filters.excludeId);

  switch (filters.sort ?? 'most_funded') {
    case 'newest':
      query = query.order('starts_at', { ascending: false, nullsFirst: false });
      break;
    case 'ending_soon':
      query = query.order('status', { ascending: true }).order('ends_at', { ascending: true });
      break;
    case 'most_backers':
      query = query.order('backer_count', { ascending: false });
      break;
    case 'target_low':
      query = query.order('target_amount', { ascending: true });
      break;
    default:
      query = query.order('funded_percent', { ascending: false });
  }
  query = query.order('id').range((page - 1) * pageSize, page * pageSize - 1);

  const { data, error, count } = await query.returns<CardRow[]>();
  if (error) throw error;
  return { items: (data ?? []).map(toCard), total: count ?? 0 };
}

// ---------------------------------------------------------------------------
// One project (detail page)
// ---------------------------------------------------------------------------
const DETAIL_COLUMNS = `
  ${CARD_COLUMNS.replace(
    'project_translations ( language, title, tagline )',
    'project_translations ( language, title, tagline, summary, story, risks )',
  )
    .replace('evaluations ( overall_score, is_published )', 'evaluations ( * )')
    .replace(
      'owner:profiles!projects_owner_id_fkey ( full_name, founder_profiles!founder_profiles_user_id_fkey ( display_name, is_verified ) )',
      'owner:profiles!projects_owner_id_fkey ( id, full_name, avatar_path, founder_profiles!founder_profiles_user_id_fkey ( * ) )',
    )},
  owner_id, min_contribution, starts_at,
  budget_items ( id, position, category, description, amount ),
  milestones ( id, position, title, description, target_label, release_percent, status ),
  reward_tiers ( id, position, title, description, amount, items, estimated_delivery, quantity_limit, claimed_count ),
  equity_terms ( * ),
  project_updates ( id, title, body, likes_count, created_at, author:profiles!project_updates_author_id_fkey ( full_name ) ),
  comments ( id, body, created_at, parent_id, is_backer, author:profiles!comments_author_id_fkey ( id, full_name, city, avatar_path ) )
`;

type DetailRow = Omit<CardRow, 'evaluations' | 'owner'> & {
  owner_id: string;
  min_contribution: number;
  starts_at: string | null;
  evaluations: Tables['evaluations']['Row'] | null;
  owner: {
    id: string;
    full_name: string;
    avatar_path: string | null;
    founder_profiles: Tables['founder_profiles']['Row'] | null;
  } | null;
  budget_items: Pick<Tables['budget_items']['Row'], 'id' | 'position' | 'category' | 'description' | 'amount'>[];
  milestones: Pick<
    Tables['milestones']['Row'],
    'id' | 'position' | 'title' | 'description' | 'target_label' | 'release_percent' | 'status'
  >[];
  reward_tiers: Omit<Tables['reward_tiers']['Row'], 'project_id'>[];
  equity_terms: Tables['equity_terms']['Row'] | null;
  project_updates: {
    id: string;
    title: string;
    body: string;
    likes_count: number;
    created_at: string;
    author: { full_name: string } | null;
  }[];
  comments: {
    id: string;
    body: string;
    created_at: string;
    parent_id: string | null;
    is_backer: boolean;
    author: { id: string; full_name: string; city: string | null; avatar_path: string | null } | null;
  }[];
};

export type ProjectComment = DetailRow['comments'][number] & { replies: DetailRow['comments'] };

export type ProjectDetail = ProjectCardData & {
  ownerId: string;
  minContribution: number;
  startsAt: string | null;
  evaluation: Tables['evaluations']['Row'] | null;
  founder: Tables['founder_profiles']['Row'] | null;
  founderAvatarUrl: string | null;
  budget: DetailRow['budget_items'];
  milestones: DetailRow['milestones'];
  rewards: DetailRow['reward_tiers'];
  equity: Tables['equity_terms']['Row'] | null;
  updates: DetailRow['project_updates'];
  comments: ProjectComment[];
};

const byPosition = (a: { position: number }, b: { position: number }) => a.position - b.position;
const newestFirst = (a: { created_at: string }, b: { created_at: string }) => b.created_at.localeCompare(a.created_at);

/** A project by its URL slug, or null if it doesn't exist / isn't visible. */
export async function getProject(slug: string): Promise<ProjectDetail | null> {
  const { data, error } = await client()
    .from('projects')
    .select(DETAIL_COLUMNS)
    .eq('slug', slug)
    .returns<DetailRow[]>()
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const card = toCard({
    ...data,
    evaluations: data.evaluations,
    owner: data.owner
      ? {
          full_name: data.owner.full_name,
          founder_profiles: data.owner.founder_profiles,
        }
      : null,
  });
  const topLevel = data.comments.filter(c => !c.parent_id).sort(newestFirst);
  const replies = data.comments.filter(c => c.parent_id).sort((a, b) => a.created_at.localeCompare(b.created_at));

  return {
    ...card,
    ownerId: data.owner_id,
    minContribution: data.min_contribution,
    startsAt: data.starts_at,
    evaluation: data.evaluations?.is_published ? data.evaluations : null,
    founder: data.owner?.founder_profiles ?? null,
    founderAvatarUrl: publicFileUrl('avatars', data.owner?.avatar_path),
    budget: [...data.budget_items].sort(byPosition),
    milestones: [...data.milestones].sort(byPosition),
    rewards: [...data.reward_tiers].sort(byPosition),
    equity: data.equity_terms,
    updates: [...data.project_updates].sort(newestFirst),
    comments: topLevel.map(c => ({ ...c, replies: replies.filter(r => r.parent_id === c.id) })),
  };
}

// ---------------------------------------------------------------------------
// Home page numbers
// ---------------------------------------------------------------------------
export type PlatformStats = {
  raised: number;
  backers: number;
  live_projects: number;
  public_projects: number;
  equity_projects: number;
  regions: number;
};

export async function getPlatformStats(): Promise<PlatformStats> {
  const { data, error } = await client().rpc('platform_stats');
  if (error) throw error;
  return data as PlatformStats;
}

// ---------------------------------------------------------------------------
// Signed-in actions
// ---------------------------------------------------------------------------
export async function getSavedProjectIds(userId: string): Promise<string[]> {
  const { data, error } = await client().from('follows').select('project_id').eq('user_id', userId);
  if (error) throw error;
  return data.map(r => r.project_id);
}

export async function setSaved(userId: string, projectId: string, saved: boolean) {
  const db = client();
  const { error } = saved
    ? await db.from('follows').insert({ user_id: userId, project_id: projectId })
    : await db.from('follows').delete().eq('user_id', userId).eq('project_id', projectId);
  if (error && error.code !== '23505') throw error; // 23505 = already saved
}

export async function postComment(projectId: string, authorId: string, body: string, parentId?: string) {
  const { error } = await client()
    .from('comments')
    .insert({ project_id: projectId, author_id: authorId, body: body.trim(), parent_id: parentId ?? null });
  if (error) throw error;
}

export async function contribute(args: {
  projectId: string;
  amount: number;
  paymentMethod: Enums['payment_method'];
  rewardTierId?: string | null;
  anonymous?: boolean;
}): Promise<string> {
  const { data, error } = await client().rpc('contribute', {
    p_project_id: args.projectId,
    p_amount: args.amount,
    p_payment_method: args.paymentMethod,
    p_reward_tier_id: args.rewardTierId ?? undefined,
    p_is_anonymous: args.anonymous ?? false,
  });
  if (error) throw error;
  return data;
}
