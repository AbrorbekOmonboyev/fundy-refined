import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { supabase } from '@/lib/supabase';

type Backer = { first_name: string; city: string | null; backed_at: string };

async function fetchRecentBackers(projectId: string): Promise<Backer[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.rpc('recent_backers', { p_project_id: projectId, p_limit: 5 });
  if (error) throw error;
  return data ?? [];
}

/** "2 soat oldin" / "2 hours ago" — our own words, since browsers often lack Uzbek. */
function timeAgo(iso: string, t: TFunction): string {
  const minutes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60_000));
  const units: ['years' | 'months' | 'days' | 'hours', number][] = [
    ['years', 525_600],
    ['months', 43_200],
    ['days', 1_440],
    ['hours', 60],
  ];
  for (const [unit, size] of units) {
    if (minutes >= size) return t(`time.${unit}`, { count: Math.floor(minutes / size) });
  }
  return minutes < 1 ? t('time.now') : t('time.minutes', { count: minutes });
}

/** Real recent backers: first name, city and when. Never amounts; anonymous backers are left out. */
export function RecentBackers({ projectId }: { projectId: string }) {
  const { t } = useTranslation();
  const { data = [] } = useQuery({
    queryKey: ['projects', 'recent-backers', projectId],
    queryFn: () => fetchRecentBackers(projectId),
  });
  if (data.length === 0) return null;

  return (
    <section aria-labelledby="recent-backers" className="pt-6 border-t border-slate-200">
      <h2 id="recent-backers" className="text-base font-bold text-ink mb-3">
        {t('project.recentBackers')}
      </h2>
      <ul className="space-y-2.5">
        {data.map((b, i) => (
          <li key={i} className="flex items-center gap-3 text-sm">
            <span
              aria-hidden
              className="w-8 h-8 rounded-full bg-track text-ink text-xs font-bold flex items-center justify-center shrink-0"
            >
              {b.first_name.charAt(0)}
            </span>
            <span className="min-w-0 flex-1 text-slate-700">
              {b.city
                ? t('project.backedFrom', { name: b.first_name, city: b.city })
                : t('project.backed', { name: b.first_name })}
            </span>
            <time dateTime={b.backed_at} className="text-xs text-slate-500 shrink-0">
              {timeAgo(b.backed_at, t)}
            </time>
          </li>
        ))}
      </ul>
    </section>
  );
}
