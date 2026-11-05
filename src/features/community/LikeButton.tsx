import { useNavigate, useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ThumbsUp } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { setLike } from '@/features/community/api';
import { paths } from '@/app/routes';

/** 👍 on a project update. Guests are sent to log in. */
export function LikeButton({
  updateId,
  count,
  liked,
  likesKey,
}: {
  updateId: string;
  count: number;
  liked: boolean;
  likesKey: unknown[];
}) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const toggle = useMutation({
    mutationFn: () => setLike(updateId, user!.id, !liked),
    onMutate: () => {
      queryClient.setQueryData<string[]>(likesKey, ids =>
        liked ? (ids ?? []).filter(id => id !== updateId) : [...(ids ?? []), updateId],
      );
    },
    // Stays "pending" until the fresh count has loaded, so the number never jumps back.
    onSettled: () =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: likesKey }),
        queryClient.invalidateQueries({ queryKey: ['projects', 'detail'] }),
      ]),
  });

  // While saving, `liked` already shows the new state but `count` is the old one.
  const shown = Math.max(0, count + (toggle.isPending ? (liked ? 1 : -1) : 0));

  return (
    <button
      type="button"
      aria-pressed={liked}
      onClick={() =>
        user ? toggle.mutate() : navigate(`${paths.login}?next=${encodeURIComponent(location.pathname)}`)
      }
      disabled={toggle.isPending}
      title={liked ? t('community.unlike') : t('community.like')}
      className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
        liked ? 'bg-brand text-ink' : 'text-slate-500 hover:bg-page hover:text-ink'
      }`}
    >
      <ThumbsUp className={`w-3.5 h-3.5 ${liked ? 'fill-ink' : ''}`} aria-hidden />
      <span className="font-mono-numbers">{shown}</span>
      <span className="sr-only">{liked ? t('community.unlike') : t('community.like')}</span>
    </button>
  );
}
