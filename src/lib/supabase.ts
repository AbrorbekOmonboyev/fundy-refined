/**
 * The Supabase client — the app's single connection to the database,
 * login and file storage.
 *
 * Configure in .env.local (see .env.example). Until it is configured the
 * site keeps running on the built-in demo data, and `supabase` is null.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url!, publishableKey!, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

/** Public URL of a file in a public bucket. Paths starting with "/" are static files in /public. */
export function publicFileUrl(bucket: 'project-images' | 'avatars', path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('/') || path.startsWith('http')) return path;
  return supabase ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;
}
