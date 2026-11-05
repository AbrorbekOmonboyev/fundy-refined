import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { getMyLikes } from '@/features/community/api';

export const likesKey = (userId: string | null, updateIds: string[]) => ['likes', userId, updateIds];

/** Which of these updates the signed-in user has liked. */
export function useMyLikes(updateIds: string[]) {
  const { user } = useAuth();
  return useQuery({
    queryKey: likesKey(user?.id ?? null, updateIds),
    queryFn: () => getMyLikes(user!.id, updateIds),
    enabled: !!user && updateIds.length > 0,
  });
}
