import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type FeedbackKind = 'bug' | 'confusing' | 'idea' | 'other';
export const FEEDBACK_KINDS: FeedbackKind[] = ['bug', 'confusing', 'idea', 'other'];
export type PageFeedback = Database['public']['Tables']['page_feedback']['Row'];

function db() {
  if (!supabase) throw new Error('not_configured');
  return supabase;
}

/** What comes along automatically, so a problem can be seen the way the visitor saw it. */
export function feedbackContext(language: string) {
  return {
    lang: language,
    script: document.documentElement.dataset.script ?? null,
    width: window.innerWidth,
    height: window.innerHeight,
    dark: document.documentElement.classList.contains('dark'),
    app: document.documentElement.classList.contains('app-mode'),
    ua: navigator.userAgent.slice(0, 300),
  };
}

/** Anyone can send; the database checks the fields and brakes spam. */
export async function sendFeedback(input: {
  page: string;
  kind: FeedbackKind;
  message: string;
  email?: string;
  userId?: string | null;
  language: string;
}) {
  const { error } = await db()
    .from('page_feedback')
    .insert({
      page: input.page.slice(0, 500),
      kind: input.kind,
      message: input.message.trim(),
      email: input.email?.trim() || null,
      context: feedbackContext(input.language),
      user_id: input.userId ?? null,
    });
  if (error) throw error;
}

/** Admins only (enforced by the database). */
export async function listFeedback(status: 'new' | 'handled' | 'all'): Promise<PageFeedback[]> {
  let query = db().from('page_feedback').select('*').order('created_at', { ascending: false }).limit(200);
  if (status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function setFeedbackHandled(id: string, handled: boolean) {
  const { error } = await db().rpc('admin_set_feedback_handled', { p_feedback_id: id, p_handled: handled });
  if (error) throw error;
}
