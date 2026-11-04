import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

export type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthState {
  /** false when .env.local has no Supabase settings — login is unavailable. */
  configured: boolean;
  /** true until we know whether someone is signed in (and have their profile). */
  loading: boolean;
  session: Session | null;
  user: User | null;
  /** The signed-in user's row in public.profiles. */
  profile: Profile | null;
  isAdmin: boolean;
  /** Signed in but hasn't finished the welcome step yet. */
  needsOnboarding: boolean;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthState | undefined>(undefined);

/** Who is signed in. Use inside <AuthProvider>. */
export function useAuth(): AuthState {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within <AuthProvider>');
  return context;
}
