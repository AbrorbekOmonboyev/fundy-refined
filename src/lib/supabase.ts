/**
 * The Supabase client — the app's single connection to the database,
 * login and file storage.
 *
 * Configure in .env.local (see .env.example). Until it is configured the
 * site keeps running on the built-in demo data, and `supabase` is null.
 */
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const isSupabaseConfigured = Boolean(url && publishableKey);

// Fully typed from the live schema — regenerate with `npm run db:types` after database changes.
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url!, publishableKey!, {
      // PKCE: email links come back to /auth/callback?code=… and are exchanged for a session.
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: 'pkce' },
    })
  : null;

/** Public URL of a file in a public bucket. Paths starting with "/" are static files in /public. */
export function publicFileUrl(bucket: 'project-images' | 'avatars', path: string | null | undefined): string | null {
  if (!path) return null;
  if (path.startsWith('/') || path.startsWith('http')) return path;
  return supabase ? supabase.storage.from(bucket).getPublicUrl(path).data.publicUrl : null;
}

/**
 * Light versions of the site's own photos (made by `npm run images`):
 * phones load the 640 px WebP, big screens the 1280 px one. Other images are used as they are.
 */
export function responsiveImage(url: string | null | undefined): { src: string; srcSet?: string } | null {
  if (!url) return null;
  const m = /^(\/images\/.+)\.jpg$/.exec(url);
  if (!m) return { src: url };
  return { src: url, srcSet: `${m[1]}-640.webp 640w, ${m[1]}-1280.webp 1280w` };
}
