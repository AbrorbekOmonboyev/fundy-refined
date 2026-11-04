/**
 * Admin actions. Every write goes through an admin_* database function, which
 * checks the caller is an admin and records the action in the audit log.
 */
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/i18n';

type Enums = Database['public']['Enums'];
type Functions = Database['public']['Functions'];
export type ProjectStatus = Enums['project_status'];
export type Evaluation = Database['public']['Tables']['evaluations']['Row'];

function db() {
  if (!supabase) throw new Error('not_configured');
  return supabase;
}
const fail = (error: unknown) => {
  if (error) throw error;
};

// ---------------------------------------------------------------------------
// Projects
// ---------------------------------------------------------------------------
export type AdminProjectRow = {
  id: string;
  slug: string;
  status: ProjectStatus;
  model: Enums['funding_model'];
  target_amount: number;
  raised_amount: number;
  funded_percent: number | null;
  is_featured: boolean;
  submitted_at: string | null;
  created_at: string;
  original_language: Language;
  project_translations: { language: Language; title: string }[];
  owner: {
    full_name: string;
    founder_profiles: { display_name: string; is_verified: boolean } | null;
  } | null;
  evaluations: { overall_score: number | null } | null;
};

export async function listAdminProjects(status: ProjectStatus | 'all'): Promise<AdminProjectRow[]> {
  let query = db()
    .from('projects')
    .select(
      `id, slug, status, model, target_amount, raised_amount, funded_percent, is_featured, submitted_at, created_at, original_language,
       project_translations ( language, title ),
       owner:profiles!projects_owner_id_fkey ( full_name, founder_profiles!founder_profiles_user_id_fkey ( display_name, is_verified ) ),
       evaluations ( overall_score )`,
    );
  if (status !== 'all') query = query.eq('status', status);
  // The review queue is first-come, first-served; other lists show newest first.
  query =
    status === 'pending_review'
      ? query.order('submitted_at', { ascending: true })
      : query.order('created_at', { ascending: false });
  const { data, error } = await query.limit(200).returns<AdminProjectRow[]>();
  fail(error);
  return data ?? [];
}

export async function getEvaluation(projectId: string): Promise<Evaluation | null> {
  const { data, error } = await db().from('evaluations').select('*').eq('project_id', projectId).maybeSingle();
  fail(error);
  return data;
}

export type EvaluationInput = {
  business_plan_score: number;
  team_score: number;
  market_score: number;
  financial_score: number;
  risk_score: number;
  confidence: Enums['evaluation_confidence'];
  summary: string;
  strengths: string[];
  risks: string[];
};

export async function saveEvaluation(projectId: string, e: EvaluationInput) {
  const { error } = await db().rpc('admin_save_evaluation', {
    p_project_id: projectId,
    p_business_plan_score: e.business_plan_score,
    p_team_score: e.team_score,
    p_market_score: e.market_score,
    p_financial_score: e.financial_score,
    p_risk_score: e.risk_score,
    p_confidence: e.confidence,
    p_summary: e.summary,
    p_strengths: e.strengths,
    p_risks: e.risks,
  });
  fail(error);
}

export type Decision = 'approve' | 'request_changes' | 'reject';

export async function reviewProject(projectId: string, decision: Decision, note: string | null) {
  fail(
    (
      await db().rpc('admin_review_project', {
        p_project_id: projectId,
        p_decision: decision,
        p_note: note ?? undefined,
      })
    ).error,
  );
}

export async function setFeatured(projectId: string, featured: boolean) {
  fail((await db().rpc('admin_set_featured', { p_project_id: projectId, p_featured: featured })).error);
}

export async function verifyFounder(userId: string, verified: boolean) {
  fail((await db().rpc('admin_verify_founder', { p_user_id: userId, p_verified: verified })).error);
}

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------
export type AdminComment = Functions['admin_recent_comments']['Returns'][number];

export async function listRecentComments(onlyHidden: boolean): Promise<AdminComment[]> {
  const { data, error } = await db().rpc('admin_recent_comments', { p_limit: 100, p_only_hidden: onlyHidden });
  fail(error);
  return data ?? [];
}

export async function setCommentHidden(commentId: string, hidden: boolean) {
  fail((await db().rpc('admin_set_hidden', { p_target: 'comment', p_target_id: commentId, p_hidden: hidden })).error);
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
export type AdminUser = Functions['admin_list_users']['Returns'][number];
export const USERS_PAGE_SIZE = 25;

export async function listUsers(search: string, page: number): Promise<{ users: AdminUser[]; total: number }> {
  const { data, error } = await db().rpc('admin_list_users', {
    p_search: search.trim() || undefined,
    p_limit: USERS_PAGE_SIZE,
    p_offset: (page - 1) * USERS_PAGE_SIZE,
  });
  fail(error);
  const users = data ?? [];
  return { users, total: Number(users[0]?.total_count ?? 0) };
}

export async function setUserBlocked(userId: string, blocked: boolean) {
  fail((await db().rpc('admin_set_user_blocked', { p_user_id: userId, p_blocked: blocked })).error);
}

export async function setUserRole(userId: string, role: Enums['app_role']) {
  fail((await db().rpc('admin_set_role', { p_user_id: userId, p_role: role })).error);
}

// ---------------------------------------------------------------------------
// Audit log
// ---------------------------------------------------------------------------
export type AuditEntry = {
  id: number;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown>;
  created_at: string;
  actor: { full_name: string } | null;
};

export async function listAudit(): Promise<AuditEntry[]> {
  const { data, error } = await db()
    .from('audit_log')
    .select('id, action, target_type, target_id, details, created_at, actor:profiles ( full_name )')
    .order('id', { ascending: false })
    .limit(200)
    .returns<AuditEntry[]>();
  fail(error);
  return data ?? [];
}
