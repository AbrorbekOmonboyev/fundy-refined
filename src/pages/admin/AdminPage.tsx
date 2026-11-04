import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { paths } from '@/app/routes';
import { useAuth } from '@/features/auth/AuthContext';
import { usePageMeta } from '@/lib/usePageMeta';
import { AdminHeader } from '@/pages/admin/AdminLayout';

type Counts = { pending: number; live: number; users: number; hiddenComments: number };

/** Admin overview: the numbers that need attention, each linking to its page. */
export function AdminPage() {
  const { t } = useTranslation();
  const { profile } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);
  usePageMeta(t('admin.title'));

  useEffect(() => {
    if (!supabase) return;
    const count = (query: PromiseLike<{ count: number | null }>) => Promise.resolve(query).then(r => r.count ?? 0);
    void Promise.all([
      count(supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'pending_review')),
      count(supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'active')),
      count(supabase.from('profiles').select('*', { count: 'exact', head: true })),
      count(supabase.from('comments').select('*', { count: 'exact', head: true }).eq('is_hidden', true)),
    ]).then(([pending, live, users, hiddenComments]) => setCounts({ pending, live, users, hiddenComments }));
  }, []);

  const tiles: { key: keyof Counts; label: string; to: string; highlight?: boolean }[] = [
    { key: 'pending', label: t('admin.pending'), to: paths.adminReview, highlight: (counts?.pending ?? 0) > 0 },
    { key: 'live', label: t('admin.live'), to: paths.adminProjects },
    { key: 'users', label: t('admin.users.title'), to: paths.adminUsers },
    { key: 'hiddenComments', label: t('admin.hiddenComments'), to: paths.adminComments },
  ];

  return (
    <>
      <AdminHeader title={t('admin.title')} hint={t('admin.greeting', { name: profile?.full_name })} />
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">
        {tiles.map(tile => (
          <Link
            key={tile.key}
            to={tile.to}
            className={`group rounded-3xl p-5 border transition-colors ${
              tile.highlight ? 'bg-brand border-brand' : 'bg-white border-slate-200 hover:border-ink'
            }`}
          >
            <p className="text-xs font-semibold text-slate-600">{tile.label}</p>
            <p className="mt-2 font-display text-3xl text-ink font-mono-numbers">{counts ? counts[tile.key] : '…'}</p>
            <ArrowRight
              className="w-4 h-4 mt-2 text-ink opacity-0 group-hover:opacity-100 transition-opacity"
              aria-hidden
            />
          </Link>
        ))}
      </div>
    </>
  );
}
