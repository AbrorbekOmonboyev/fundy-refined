/**
 * Likes, reports and milestone reviews. The database checks who may do what
 * (see migrations *_security.sql and *_milestones_and_reports.sql).
 */
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/i18n';

type Enums = Database['public']['Enums'];
export type ReportTarget = Enums['report_target'];
export type ReportStatus = Enums['report_status'];
export type Milestone = Pick<
  Database['public']['Tables']['milestones']['Row'],
  | 'id'
  | 'position'
  | 'title'
  | 'description'
  | 'target_label'
  | 'release_percent'
  | 'status'
  | 'evidence'
  | 'review_note'
  | 'approved_at'
  | 'spent_amount'
  | 'receipt_paths'
>;

function db() {
  if (!supabase) throw new Error('not_configured');
  return supabase;
}
const fail = (error: unknown) => {
  if (error) throw error;
};

// ---------------------------------------------------------------------------
// Likes
// ---------------------------------------------------------------------------
export async function getMyLikes(userId: string, updateIds: string[]): Promise<string[]> {
  if (updateIds.length === 0) return [];
  const { data, error } = await db()
    .from('update_likes')
    .select('update_id')
    .eq('user_id', userId)
    .in('update_id', updateIds);
  fail(error);
  return (data ?? []).map(r => r.update_id);
}

export async function setLike(updateId: string, userId: string, like: boolean) {
  const { error } = like
    ? await db().from('update_likes').insert({ update_id: updateId, user_id: userId })
    : await db().from('update_likes').delete().eq('update_id', updateId).eq('user_id', userId);
  if (error && error.code !== '23505') throw error; // 23505: already liked
}

// ---------------------------------------------------------------------------
// Reports
// ---------------------------------------------------------------------------
export const REPORT_REASONS = ['spam', 'abuse', 'misleading', 'other'] as const;
export type ReportReason = (typeof REPORT_REASONS)[number];

/** Returns 'duplicate' if this person already has an open report on the item. */
export async function reportContent(input: {
  reporterId: string;
  target: ReportTarget;
  targetId: string;
  reason: ReportReason;
  details?: string;
}): Promise<'ok' | 'duplicate'> {
  const { error } = await db()
    .from('reports')
    .insert({
      reporter_id: input.reporterId,
      target_type: input.target,
      target_id: input.targetId,
      reason: input.reason,
      details: input.details?.trim() || null,
    });
  if (error?.code === '23505') return 'duplicate';
  fail(error);
  return 'ok';
}

/** A reported comment or project update. */
export type ReportedPost = {
  id: string;
  title: string | null;
  body: string;
  is_hidden: boolean;
  author_name: string;
  project_slug: string;
};

export type AdminReport = Database['public']['Tables']['reports']['Row'] & {
  post: ReportedPost | null;
  project: { id: string; slug: string; title: string } | null;
  person: { id: string; full_name: string; is_blocked: boolean; role: string } | null;
};

const none = Promise.resolve({ data: [], error: null });

/** Reports with a preview of what was reported (admins only). */
export async function listReports(status: ReportStatus | 'all'): Promise<AdminReport[]> {
  let query = db().from('reports').select('*').order('created_at', { ascending: false }).limit(200);
  if (status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  fail(error);
  const reports = data ?? [];
  const idsOf = (type: ReportTarget) => reports.filter(r => r.target_type === type).map(r => r.target_id);
  const [commentIds, updateIds, projectIds, userIds] = (['comment', 'update', 'project', 'user'] as const).map(idsOf);

  const [comments, updates, projects, people] = await Promise.all([
    commentIds.length
      ? db()
          .from('comments')
          .select(
            'id, body, is_hidden, author:profiles!comments_author_id_fkey ( full_name ), project:projects ( slug )',
          )
          .in('id', commentIds)
      : none,
    updateIds.length
      ? db()
          .from('project_updates')
          .select(
            'id, title, body, is_hidden, author:profiles!project_updates_author_id_fkey ( full_name ), project:projects ( slug )',
          )
          .in('id', updateIds)
      : none,
    projectIds.length
      ? db()
          .from('projects')
          .select('id, slug, original_language, project_translations ( language, title )')
          .in('id', projectIds)
      : none,
    userIds.length ? db().from('profiles').select('id, full_name, is_blocked, role').in('id', userIds) : none,
  ]);
  for (const result of [comments, updates, projects, people]) fail(result.error);

  type PostRow = {
    id: string;
    title?: string;
    body: string;
    is_hidden: boolean;
    author: { full_name: string } | null;
    project: { slug: string } | null;
  };
  type ProjectRow = {
    id: string;
    slug: string;
    original_language: Language;
    project_translations: { language: Language; title: string }[];
  };
  const posts = [...((comments.data ?? []) as PostRow[]), ...((updates.data ?? []) as PostRow[])];

  return reports.map(r => {
    const post =
      r.target_type === 'comment' || r.target_type === 'update' ? posts.find(x => x.id === r.target_id) : undefined;
    const p = (projects.data as ProjectRow[] | null)?.find(x => x.id === r.target_id);
    const person =
      r.target_type === 'user'
        ? (people.data as AdminReport['person'][] | null)?.find(x => x?.id === r.target_id)
        : null;
    return {
      ...r,
      post: post
        ? {
            id: post.id,
            title: post.title ?? null,
            body: post.body,
            is_hidden: post.is_hidden,
            author_name: post.author?.full_name ?? '',
            project_slug: post.project?.slug ?? '',
          }
        : null,
      project: p
        ? {
            id: p.id,
            slug: p.slug,
            title: p.project_translations.find(t => t.language === p.original_language)?.title ?? p.slug,
          }
        : null,
      person: person ?? null,
    };
  });
}

export async function resolveReport(reportId: string, status: 'resolved' | 'dismissed') {
  fail((await db().rpc('admin_resolve_report', { p_report_id: reportId, p_status: status })).error);
}

/** Hide a comment or an update from the public. */
export async function hidePost(target: 'comment' | 'update', id: string) {
  fail((await db().rpc('admin_set_hidden', { p_target: target, p_target_id: id, p_hidden: true })).error);
}

// ---------------------------------------------------------------------------
// Milestones
// ---------------------------------------------------------------------------
const MILESTONE_COLUMNS =
  'id, position, title, description, target_label, release_percent, status, evidence, review_note, approved_at, spent_amount, receipt_paths';

export async function listMilestones(projectId: string): Promise<Milestone[]> {
  const { data, error } = await db()
    .from('milestones')
    .select(MILESTONE_COLUMNS)
    .eq('project_id', projectId)
    .order('position');
  fail(error);
  return data ?? [];
}

/** Founder reports a milestone as done (project must be funded), with what was spent and receipt photos. */
export async function submitMilestone(
  milestoneId: string,
  evidence: string,
  spentAmount: number | null = null,
  receiptPaths: string[] = [],
) {
  fail(
    (
      await db().rpc('submit_milestone', {
        p_milestone_id: milestoneId,
        p_evidence: evidence.trim(),
        p_spent_amount: spentAmount ?? undefined,
        p_receipt_paths: receiptPaths,
      })
    ).error,
  );
}

const RECEIPT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const RECEIPT_MAX_BYTES = 5 * 1024 * 1024;
export const RECEIPTS_MAX = 10;

/** A receipt photo goes to the founder's own folder; it becomes public with the approved report. */
export async function uploadReceipt(ownerId: string, milestoneId: string, file: File): Promise<string> {
  if (!RECEIPT_TYPES.includes(file.type)) throw new Error('image_type');
  if (file.size > RECEIPT_MAX_BYTES) throw new Error('image_size');
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${ownerId}/receipts/${milestoneId}/${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  fail((await db().storage.from('project-images').upload(path, file, { contentType: file.type })).error);
  return path;
}

export type SubmittedMilestone = Milestone & {
  project: {
    id: string;
    slug: string;
    owner_id: string;
    original_language: Language;
    project_translations: { language: Language; title: string }[];
  } | null;
};

export async function listSubmittedMilestones(): Promise<SubmittedMilestone[]> {
  const { data, error } = await db()
    .from('milestones')
    .select(
      `${MILESTONE_COLUMNS}, project:projects ( id, slug, owner_id, original_language, project_translations ( language, title ) )`,
    )
    .eq('status', 'submitted')
    .order('position')
    .returns<SubmittedMilestone[]>();
  fail(error);
  return data ?? [];
}

export async function approveMilestone(milestoneId: string) {
  fail((await db().rpc('admin_approve_milestone', { p_milestone_id: milestoneId })).error);
}

export async function returnMilestone(milestoneId: string, note: string) {
  fail((await db().rpc('admin_return_milestone', { p_milestone_id: milestoneId, p_note: note.trim() })).error);
}
