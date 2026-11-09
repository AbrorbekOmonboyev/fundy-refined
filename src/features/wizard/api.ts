/**
 * Creating and editing a project draft.
 *
 * The database rules (RLS) allow these writes only for the owner, and only
 * while the project is a draft or "changes requested". Submitting goes through
 * the submit_project() function, which re-checks everything.
 */
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/i18n';
import { slugify } from '@/features/wizard/slug';
import type { OrganizerType } from '@/features/wizard/organizer';

type Tables = Database['public']['Tables'];
type Enums = Database['public']['Enums'];
export type FundingModel = Enums['funding_model'];

export type DraftProject = Tables['projects']['Row'];
export type DraftText = Tables['project_translations']['Row'];
export type BudgetItem = Pick<Tables['budget_items']['Row'], 'category' | 'description' | 'amount'>;
export type Milestone = Pick<Tables['milestones']['Row'], 'title' | 'description' | 'target_label' | 'release_percent'>;
export type RewardTier = Pick<
  Tables['reward_tiers']['Row'],
  | 'title'
  | 'description'
  | 'amount'
  | 'items'
  | 'estimated_delivery'
  | 'quantity_limit'
  | 'kind'
  | 'compare_at_amount'
  | 'image_paths'
  | 'long_description'
  | 'is_featured'
  | 'is_digital'
  | 'is_hidden'
  | 'per_backer_limit'
  | 'available_from'
  | 'available_until'
> & { id?: string; claimed_count?: number; components: { name: string; quantity: number }[] };

const REWARD_COLUMNS = `id, title, description, amount, items, estimated_delivery, quantity_limit, claimed_count,
  kind, compare_at_amount, image_paths, long_description, is_featured, is_digital, is_hidden, per_backer_limit,
  available_from, available_until, reward_components ( name, quantity, position )`;
export type EquityTerms = Omit<Tables['equity_terms']['Row'], 'project_id'>;
export type FounderProfile = Tables['founder_profiles']['Row'];
export type ProjectDocument = Tables['project_documents']['Row'];

export type Draft = {
  project: DraftProject;
  text: DraftText | null;
  budget: BudgetItem[];
  milestones: Milestone[];
  rewards: RewardTier[];
  equity: EquityTerms | null;
  documents: ProjectDocument[];
  founder: FounderProfile | null;
};

function db() {
  if (!supabase) throw new Error('not_configured');
  return supabase;
}

const fail = (error: unknown) => {
  if (error) throw error;
};

/** Load a project with all its parts. `userId` must own it — unless `anyOwner` (admins reviewing). */
export async function getDraft(projectId: string, userId: string, { anyOwner = false } = {}): Promise<Draft | null> {
  const { data: project, error } = await db().from('projects').select('*').eq('id', projectId).maybeSingle();
  fail(error);
  if (!project || (!anyOwner && project.owner_id !== userId)) return null;

  const [text, budget, milestones, rewards, equity, documents, founder] = await Promise.all([
    db()
      .from('project_translations')
      .select('*')
      .eq('project_id', projectId)
      .eq('language', project.original_language)
      .maybeSingle(),
    db().from('budget_items').select('category, description, amount').eq('project_id', projectId).order('position'),
    db()
      .from('milestones')
      .select('title, description, target_label, release_percent')
      .eq('project_id', projectId)
      .order('position'),
    db().from('reward_tiers').select(REWARD_COLUMNS).eq('project_id', projectId).order('position'),
    db().from('equity_terms').select('*').eq('project_id', projectId).maybeSingle(),
    db().from('project_documents').select('*').eq('project_id', projectId).order('created_at'),
    db().from('founder_profiles').select('*').eq('user_id', project.owner_id).maybeSingle(),
  ]);
  for (const r of [text, budget, milestones, rewards, equity, documents, founder]) fail(r.error);

  const equityRow = equity.data;
  return {
    project,
    text: text.data,
    budget: budget.data ?? [],
    milestones: milestones.data ?? [],
    rewards: (rewards.data ?? []).map(({ reward_components, ...r }) => ({
      ...r,
      // older rewards may have only the free-text list
      components: reward_components.length
        ? [...reward_components]
            .sort((a, b) => a.position - b.position)
            .map(({ name, quantity }) => ({ name, quantity }))
        : r.items.map(name => ({ name, quantity: 1 })),
    })),
    equity: equityRow
      ? {
          contract_type: equityRow.contract_type,
          investor_profit_share_pct: equityRow.investor_profit_share_pct,
          min_investment: equityRow.min_investment,
          projected_annual_return: equityRow.projected_annual_return,
          distribution_schedule: equityRow.distribution_schedule,
          exit_horizon_years: equityRow.exit_horizon_years,
        }
      : null,
    documents: documents.data ?? [],
    founder: founder.data,
  };
}

// ---------------------------------------------------------------------------
// Step 1 — basics
// ---------------------------------------------------------------------------
export type Basics = {
  title: string;
  tagline: string;
  organizer_type: OrganizerType | null;
  model: FundingModel;
  category_id: string;
  region_id: string | null;
  location: string;
  target_amount: number;
  duration_days: number;
  original_language: Language;
};

/** Create a new draft. Returns its id. Retries with a suffix if the web address is taken. */
export async function createDraft(userId: string, basics: Basics): Promise<string> {
  const base = slugify(basics.title) || 'project';
  for (let attempt = 0; attempt < 4; attempt++) {
    const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
    const { data, error } = await db()
      .from('projects')
      .insert({
        owner_id: userId,
        slug,
        organizer_type: basics.organizer_type,
        model: basics.model,
        category_id: basics.category_id,
        region_id: basics.region_id,
        location: basics.location || null,
        target_amount: basics.target_amount,
        duration_days: basics.duration_days,
        original_language: basics.original_language,
      })
      .select('id')
      .single();
    if (error?.code === '23505') continue; // slug already used
    fail(error);
    const text = await db().from('project_translations').insert({
      project_id: data!.id,
      language: basics.original_language,
      title: basics.title.trim(),
      tagline: basics.tagline.trim(),
    });
    fail(text.error);
    return data!.id;
  }
  throw new Error('slug_unavailable');
}

export async function updateBasics(draft: Draft, basics: Basics) {
  const { error } = await db()
    .from('projects')
    .update({
      organizer_type: basics.organizer_type,
      model: basics.model,
      category_id: basics.category_id,
      region_id: basics.region_id,
      location: basics.location || null,
      target_amount: basics.target_amount,
      duration_days: basics.duration_days,
      original_language: basics.original_language,
    })
    .eq('id', draft.project.id);
  fail(error);
  await saveText(draft, { title: basics.title.trim(), tagline: basics.tagline.trim() }, basics.original_language);
}

// ---------------------------------------------------------------------------
// Step 2 — story
// ---------------------------------------------------------------------------
type TextFields = Partial<Pick<DraftText, 'title' | 'tagline' | 'summary' | 'story' | 'risks'>>;

export async function saveText(draft: Draft, fields: TextFields, language: Language = draft.project.original_language) {
  const existing = draft.text && draft.text.language === language;
  const { error } = existing
    ? await db().from('project_translations').update(fields).eq('project_id', draft.project.id).eq('language', language)
    : await db()
        .from('project_translations')
        .insert({
          project_id: draft.project.id,
          language,
          title: fields.title ?? draft.text?.title ?? '',
          tagline: fields.tagline ?? draft.text?.tagline ?? '',
          summary: fields.summary ?? draft.text?.summary ?? '',
          story: fields.story ?? draft.text?.story ?? '',
          risks: fields.risks ?? draft.text?.risks ?? '',
        });
  fail(error);
}

const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const COVER_MAX_BYTES = 5 * 1024 * 1024;

/** Upload a cover image into the owner's folder and remember it on the project. */
export async function uploadCover(draft: Draft, file: File): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('image_type');
  if (file.size > COVER_MAX_BYTES) throw new Error('image_size');
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${draft.project.owner_id}/${draft.project.id}/cover-${Date.now()}.${ext}`;
  const upload = await db().storage.from('project-images').upload(path, file, { contentType: file.type });
  fail(upload.error);
  const { error } = await db().from('projects').update({ cover_image_path: path }).eq('id', draft.project.id);
  fail(error);
  const old = draft.project.cover_image_path;
  if (old && !old.startsWith('/')) await db().storage.from('project-images').remove([old]);
  return path;
}

// ---------------------------------------------------------------------------
// Steps 3–5 — lists (replaced as a whole on save)
// ---------------------------------------------------------------------------
export async function saveBudget(projectId: string, items: BudgetItem[]) {
  fail((await db().from('budget_items').delete().eq('project_id', projectId)).error);
  if (items.length === 0) return;
  fail(
    (
      await db()
        .from('budget_items')
        .insert(items.map((item, position) => ({ ...item, project_id: projectId, position })))
    ).error,
  );
}

export async function saveMilestones(projectId: string, items: Milestone[]) {
  fail((await db().from('milestones').delete().eq('project_id', projectId)).error);
  if (items.length === 0) return;
  fail(
    (
      await db()
        .from('milestones')
        .insert(items.map((item, position) => ({ ...item, project_id: projectId, position })))
    ).error,
  );
}

export async function saveRewards(projectId: string, items: RewardTier[]) {
  // Deleting a reward also deletes its components (on delete cascade).
  fail((await db().from('reward_tiers').delete().eq('project_id', projectId)).error);
  if (items.length === 0) return;
  const { data, error } = await db()
    .from('reward_tiers')
    .insert(
      items.map((r, position) => ({
        project_id: projectId,
        position,
        title: r.title,
        description: r.description,
        amount: r.amount,
        items: r.components.map(c => c.name), // kept for older screens
        estimated_delivery: r.estimated_delivery,
        quantity_limit: r.quantity_limit,
        kind: r.kind,
        compare_at_amount: r.compare_at_amount,
        image_paths: r.image_paths,
        long_description: r.long_description,
        is_featured: r.is_featured,
        is_digital: r.is_digital,
        is_hidden: r.is_hidden,
        per_backer_limit: r.per_backer_limit,
        available_from: r.available_from,
        available_until: r.available_until,
      })),
    )
    .select('id, position');
  fail(error);
  const components = (data ?? []).flatMap(row =>
    items[row.position].components.map((c, position) => ({
      reward_tier_id: row.id,
      position,
      name: c.name,
      quantity: c.quantity,
    })),
  );
  if (components.length) fail((await db().from('reward_components').insert(components)).error);
}

export const REWARD_IMAGE_MAX = 6;

/** Upload a photo for a reward (stored like the cover, in the owner's folder). */
export async function uploadRewardImage(draft: Draft, file: File): Promise<string> {
  if (!IMAGE_TYPES.includes(file.type)) throw new Error('image_type');
  if (file.size > COVER_MAX_BYTES) throw new Error('image_size');
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${draft.project.owner_id}/${draft.project.id}/reward-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
  const upload = await db().storage.from('project-images').upload(path, file, { contentType: file.type });
  fail(upload.error);
  return path;
}

export async function saveEquity(projectId: string, terms: EquityTerms) {
  // Update first; insert only if there were no terms yet. (An upsert would also try to
  // rewrite project_id, which owners are not allowed to change.)
  const updated = await db().from('equity_terms').update(terms).eq('project_id', projectId).select('project_id');
  fail(updated.error);
  if (updated.data && updated.data.length > 0) return;
  fail(
    (
      await db()
        .from('equity_terms')
        .insert({ project_id: projectId, ...terms })
    ).error,
  );
}

export async function saveMinContribution(projectId: string, amount: number) {
  fail((await db().from('projects').update({ min_contribution: amount }).eq('id', projectId)).error);
}

// ---------------------------------------------------------------------------
// Step 6 — founder and documents
// ---------------------------------------------------------------------------
export type FounderFields = Pick<
  FounderProfile,
  'display_name' | 'role_title' | 'organization' | 'location' | 'bio' | 'experience_years' | 'registration_number'
>;

export async function saveFounder(userId: string, exists: boolean, fields: FounderFields) {
  const { error } = exists
    ? await db().from('founder_profiles').update(fields).eq('user_id', userId)
    : await db()
        .from('founder_profiles')
        .insert({ user_id: userId, ...fields });
  fail(error);
}

/** The founder's registration number (YaTT / MChJ), or null if they haven't registered yet. */
export async function getFounderRegistration(userId: string): Promise<string | null> {
  const { data, error } = await db()
    .from('founder_profiles')
    .select('registration_number')
    .eq('user_id', userId)
    .maybeSingle();
  fail(error);
  return data?.registration_number?.trim() || null;
}

/** Added after registering, so the first stage's money can be released. */
export async function saveRegistrationNumber(userId: string, registrationNumber: string) {
  const { error } = await db()
    .from('founder_profiles')
    .update({ registration_number: registrationNumber })
    .eq('user_id', userId);
  fail(error);
}

const DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;

export async function uploadDocument(draft: Draft, file: File, kind: Enums['document_kind']) {
  if (!DOCUMENT_TYPES.includes(file.type)) throw new Error('document_type');
  if (file.size > DOCUMENT_MAX_BYTES) throw new Error('document_size');
  const safeName = file.name.replace(/[^\w.-]+/g, '_').slice(-80);
  const path = `${draft.project.owner_id}/${draft.project.id}/${Date.now()}-${safeName}`;
  fail((await db().storage.from('project-documents').upload(path, file, { contentType: file.type })).error);
  const { error } = await db()
    .from('project_documents')
    .insert({
      project_id: draft.project.id,
      kind,
      storage_path: path,
      file_name: file.name.slice(0, 200),
      uploaded_by: draft.project.owner_id,
    });
  fail(error);
}

export async function deleteDocument(doc: ProjectDocument) {
  fail((await db().from('project_documents').delete().eq('id', doc.id)).error);
  await db().storage.from('project-documents').remove([doc.storage_path]);
}

/** Temporary private link to view a document (valid 5 minutes). */
export async function documentUrl(doc: ProjectDocument): Promise<string> {
  const { data, error } = await db().storage.from('project-documents').createSignedUrl(doc.storage_path, 300);
  fail(error);
  return data!.signedUrl;
}

// ---------------------------------------------------------------------------
// Step 7 — submit, and managing projects
// ---------------------------------------------------------------------------
export async function submitDraft(projectId: string) {
  fail((await db().rpc('submit_project', { p_project_id: projectId })).error);
}

/**
 * Delete a draft for good: the project row (its text, budget, milestones, rewards and
 * document records go with it), then its uploaded photo and documents.
 * The database only allows this for the owner's own drafts.
 */
export async function deleteDraft(projectId: string, ownerId: string) {
  const deleted = await db().from('projects').delete().eq('id', projectId).select('id');
  fail(deleted.error);
  if (!deleted.data?.length) throw new Error('project_not_editable');

  const folder = `${ownerId}/${projectId}`;
  for (const bucket of ['project-images', 'project-documents'] as const) {
    const { data: files } = await db().storage.from(bucket).list(folder);
    if (files?.length)
      await db()
        .storage.from(bucket)
        .remove(files.map(f => `${folder}/${f.name}`));
  }
}

/** Take a submitted project back from the review queue; it becomes an editable draft again. */
export async function withdrawSubmission(projectId: string) {
  fail((await db().rpc('withdraw_submission', { p_project_id: projectId })).error);
}

export async function postUpdate(projectId: string, authorId: string, title: string, body: string) {
  const { error } = await db()
    .from('project_updates')
    .insert({ project_id: projectId, author_id: authorId, title: title.trim(), body: body.trim() });
  fail(error);
}
