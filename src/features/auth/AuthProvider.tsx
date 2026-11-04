import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { LANGUAGES, type Language } from '@/i18n';
import { AuthContext, type AuthState, type Profile } from '@/features/auth/AuthContext';

async function fetchProfile(userId: string): Promise<Profile | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  if (error) console.error('Could not load profile', error);
  return data ?? null;
}

/**
 * Keeps track of the signed-in user and their profile for the whole app.
 *
 * - Supabase stores the session in the browser and refreshes it automatically.
 * - The profile's preferred language is applied when someone signs in, and
 *   changing the language on the site saves it back to their profile.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation();
  const [session, setSession] = useState<Session | null>(null);
  const [sessionLoaded, setSessionLoaded] = useState(!isSupabaseConfigured);
  // The last profile we loaded, and whose it is.
  const [loaded, setLoaded] = useState<{ userId: string; profile: Profile | null } | null>(null);

  const userId = session?.user.id ?? null;
  // undefined = still loading, null = signed out / not found
  const profile: Profile | null | undefined = !userId ? null : loaded?.userId === userId ? loaded.profile : undefined;
  const setProfile = useCallback(
    (next: Profile) =>
      setLoaded(current => (current?.userId === next.id ? { userId: next.id, profile: next } : current)),
    [],
  );

  // 1. Follow sign-in / sign-out / token refresh.
  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      // Only update state here — Supabase advises against awaiting calls inside this callback.
      setSession(newSession);
      setSessionLoaded(true);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  // 2. Load the profile whenever the signed-in user changes.
  useEffect(() => {
    if (!userId) return;
    let active = true;
    void fetchProfile(userId).then(data => active && setLoaded({ userId, profile: data }));
    return () => {
      active = false; // a newer user signed in meanwhile — ignore this result
    };
  }, [userId]);

  // 3. Use the language saved in the profile…
  const preferred = profile?.preferred_language;
  useEffect(() => {
    if (preferred && preferred !== i18n.resolvedLanguage) void i18n.changeLanguage(preferred);
    // Only when the saved preference changes, not on every language switch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferred]);

  // …and save it when the user switches language while signed in.
  useEffect(() => {
    if (!supabase || !profile) return;
    const save = (lng: string) => {
      if (!LANGUAGES.includes(lng as Language) || lng === profile.preferred_language) return;
      setProfile({ ...profile, preferred_language: lng as Language });
      void supabase!
        .from('profiles')
        .update({ preferred_language: lng as Language })
        .eq('id', profile.id)
        .then(({ error }) => error && console.error('Could not save language', error));
    };
    i18n.on('languageChanged', save);
    return () => i18n.off('languageChanged', save);
  }, [i18n, profile, setProfile]);

  const refreshProfile = useCallback(async () => {
    if (userId) setLoaded({ userId, profile: await fetchProfile(userId) });
  }, [userId]);

  const signOut = useCallback(async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Sign-out failed', error);
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      configured: isSupabaseConfigured,
      loading: !sessionLoaded || (userId !== null && profile === undefined),
      session,
      user: session?.user ?? null,
      profile: profile ?? null,
      isAdmin: profile?.role === 'admin' && !profile.is_blocked,
      needsOnboarding: !!profile && !profile.onboarded_at,
      refreshProfile,
      signOut,
    }),
    [sessionLoaded, userId, profile, session, refreshProfile, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
