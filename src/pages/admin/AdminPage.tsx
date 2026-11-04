import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/features/auth/AuthContext';
import { Alert } from '@/components/ui';

type Counts = { pending: number; live: number; users: number; reports: number };

/** Admin area — the full review tools arrive in Phase 6. */
export function AdminPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    if (!supabase) return;
    const count = (query: PromiseLike<{ count: number | null }>) => Promise.resolve(query).then(r => r.count ?? 0);
    void Promise.all([
      count(supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'pending_review')),
      count(supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active')),
      count(supabase.from('profiles').select('*', { count: 'exact', head: true })),
      count(supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'open')),
    ]).then(([pending, live, users, reports]) => setCounts({ pending, live, users, reports }));
  }, []);

  const tiles: { key: keyof Counts; label: string }[] = [
    { key: 'pending', label: t('admin.pending') },
    { key: 'live', label: t('admin.live') },
    { key: 'users', label: t('admin.users') },
    { key: 'reports', label: t('admin.reports') },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
      <header className="flex items-center gap-3">
        <ShieldCheck className="w-7 h-7 text-emerald-600" aria-hidden />
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{t('admin.title')}</h1>
          <p className="text-sm text-slate-600">{t('admin.greeting', { name: profile?.full_name })}</p>
        </div>
      </header>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {tiles.map(tile => (
          <div key={tile.key} className="bg-white rounded-xl border border-slate-200 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{tile.label}</p>
            <p className="mt-1 text-2xl font-bold text-slate-900 font-mono-numbers">
              {counts ? counts[tile.key] : '…'}
            </p>
          </div>
        ))}
      </div>

      <Alert variant="info">{t('admin.comingSoon')}</Alert>
    </div>
  );
}
