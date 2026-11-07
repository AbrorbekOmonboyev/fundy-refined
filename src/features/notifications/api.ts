/**
 * In-app notifications. The database creates them (see the *_functions migration:
 * new contribution, project approved, new comment, …); the app only reads them,
 * marks them read, and turns `type` + `data` into text in the reader's language.
 */
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/i18n';

export type NotificationType = Database['public']['Enums']['notification_type'];

export type AppNotification = {
  id: string;
  type: NotificationType;
  data: {
    project_id?: string;
    amount?: number;
    status?: string;
    comment_id?: string;
    update_id?: string;
    name?: string;
    email?: string;
  };
  read_at: string | null;
  created_at: string;
  project: {
    id: string;
    slug: string;
    original_language: Language;
    project_translations: { language: Language; title: string }[];
  } | null;
};

function db() {
  if (!supabase) throw new Error('not_configured');
  return supabase;
}

/** The newest notifications of the signed-in user, with the project each one is about. */
export async function listNotifications(limit = 30): Promise<AppNotification[]> {
  const { data, error } = await db()
    .from('notifications')
    .select('id, type, data, read_at, created_at')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;

  const rows = (data ?? []) as Omit<AppNotification, 'project'>[];
  const projectIds = [...new Set(rows.map(r => r.data?.project_id).filter((id): id is string => !!id))];
  let projects: NonNullable<AppNotification['project']>[] = [];
  if (projectIds.length) {
    // Row Level Security decides which projects the reader may see (their own drafts, or public ones).
    const result = await db()
      .from('projects')
      .select('id, slug, original_language, project_translations ( language, title )')
      .in('id', projectIds);
    if (result.error) throw result.error;
    projects = (result.data ?? []) as typeof projects;
  }
  return rows.map(r => ({ ...r, project: projects.find(p => p.id === r.data?.project_id) ?? null }));
}

export async function markAllRead() {
  const { error } = await db().rpc('mark_all_notifications_read');
  if (error) throw error;
}

export async function markRead(id: string) {
  const { error } = await db().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
  if (error) throw error;
}

/** Calls `onNew` whenever a notification arrives for this user (Supabase Realtime). */
export function subscribeToNotifications(userId: string, onNew: () => void): () => void {
  if (!supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
      onNew,
    )
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}
