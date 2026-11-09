/// <reference types="vite/client" />

// Environment variables available in the browser (must start with VITE_).
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** 'true' once the oneid edge function has its OneID keys. */
  readonly VITE_ONEID_ENABLED?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
