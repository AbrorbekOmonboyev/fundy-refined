import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/database.types';

export type ContactTopic = Database['public']['Enums']['contact_topic'];
export type ContactMessage = Database['public']['Tables']['contact_messages']['Row'];
export const CONTACT_TOPICS: ContactTopic[] = ['general', 'backer', 'founder', 'report', 'partnership'];

function db() {
  if (!supabase) throw new Error('not_configured');
  return supabase;
}

/** Anyone can send; the database checks the fields and allows 5 messages per hour per email. */
export async function sendContactMessage(input: {
  name: string;
  email: string;
  topic: ContactTopic;
  message: string;
  userId?: string | null;
}) {
  const { error } = await db()
    .from('contact_messages')
    .insert({
      name: input.name.trim(),
      email: input.email.trim(),
      topic: input.topic,
      message: input.message.trim(),
      user_id: input.userId ?? null,
    });
  if (error) throw error;
}

/** Admins only (enforced by the database). */
export async function listContactMessages(status: 'new' | 'handled' | 'all'): Promise<ContactMessage[]> {
  let query = db().from('contact_messages').select('*').order('created_at', { ascending: false }).limit(200);
  if (status !== 'all') query = query.eq('status', status);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function setMessageHandled(id: string, handled: boolean) {
  const { error } = await db().rpc('admin_set_message_handled', { p_message_id: id, p_handled: handled });
  if (error) throw error;
}
