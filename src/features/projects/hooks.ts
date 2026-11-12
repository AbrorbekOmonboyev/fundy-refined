/**
 * React hooks for project data, cached with TanStack Query
 * (a page you visited loads instantly the second time and refreshes quietly).
 */
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router';
import { useAuth } from '@/features/auth/AuthContext';
import { paths } from '@/app/routes';
import {
  getMyContributions,
  getMyProjects,
  getPlatformStats,
  getProject,
  getSavedProjectIds,
  listProjects,
  setSaved,
  type ProjectFilters,
} from '@/features/projects/api';

export const projectKeys = {
  all: ['projects'] as const,
  list: (filters: ProjectFilters) => ['projects', 'list', filters] as const,
  detail: (slug: string) => ['projects', 'detail', slug] as const,
  stats: ['projects', 'stats'] as const,
  saved: (userId: string | null) => ['projects', 'saved', userId] as const,
};

export function useProjectList(filters: ProjectFilters) {
  return useQuery({
    queryKey: projectKeys.list(filters),
    queryFn: () => listProjects(filters),
    placeholderData: keepPreviousData, // keep showing results while the next filter loads
  });
}

export function useProject(slug: string | undefined) {
  return useQuery({
    queryKey: projectKeys.detail(slug ?? ''),
    queryFn: () => getProject(slug!),
    enabled: !!slug,
  });
}

/** Loads a project page in the background (hover, touch, focus) so opening it feels instant. */
export function usePrefetchProject() {
  const queryClient = useQueryClient();
  return (slug: string) =>
    void queryClient.prefetchQuery({
      queryKey: projectKeys.detail(slug),
      queryFn: () => getProject(slug),
      staleTime: 30_000,
    });
}

export function usePlatformStats() {
  return useQuery({ queryKey: projectKeys.stats, queryFn: getPlatformStats, staleTime: 5 * 60_000 });
}

/** Saved (followed) projects of the signed-in user, and a toggle that asks guests to log in. */
export function useSavedProjects() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();

  const saved = useQuery({
    queryKey: projectKeys.saved(userId),
    queryFn: () => getSavedProjectIds(userId!),
    enabled: !!userId,
  });

  const toggle = useMutation({
    mutationFn: ({ projectId, save }: { projectId: string; save: boolean }) => setSaved(userId!, projectId, save),
    // Update the bookmark immediately, undo if the server refuses.
    onMutate: async ({ projectId, save }) => {
      const key = projectKeys.saved(userId);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<string[]>(key) ?? [];
      queryClient.setQueryData(key, save ? [...previous, projectId] : previous.filter(id => id !== projectId));
      return { previous };
    },
    onError: (_error, _vars, context) => queryClient.setQueryData(projectKeys.saved(userId), context?.previous),
  });

  const ids = new Set(saved.data ?? []);
  return {
    isSaved: (projectId: string) => ids.has(projectId),
    toggle: (projectId: string) => {
      if (!userId) {
        navigate(`${paths.login}?next=${encodeURIComponent(location.pathname)}`);
        return;
      }
      toggle.mutate({ projectId, save: !ids.has(projectId) });
    },
  };
}

export function useMyContributions() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['projects', 'my-contributions', user?.id ?? null],
    queryFn: () => getMyContributions(user!.id),
    enabled: !!user,
  });
}

export function useMyProjects() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ['projects', 'mine', user?.id ?? null],
    queryFn: () => getMyProjects(user!.id),
    enabled: !!user,
  });
}

/** Full cards for the user's saved projects. */
export function useSavedProjectCards() {
  const { user } = useAuth();
  const ids = useQuery({
    queryKey: projectKeys.saved(user?.id ?? null),
    queryFn: () => getSavedProjectIds(user!.id),
    enabled: !!user,
  });
  const list = useProjectListFor(ids.data);
  const hasSaved = (ids.data?.length ?? 0) > 0;
  return { isPending: ids.isPending || (hasSaved && list.isPending), items: hasSaved ? (list.data?.items ?? []) : [] };
}

function useProjectListFor(ids: string[] | undefined) {
  return useQuery({
    queryKey: projectKeys.list({ ids: ids ?? [], pageSize: 60 }),
    queryFn: () => listProjects({ ids, status: 'all', sort: 'newest', pageSize: 60 }),
    enabled: !!ids && ids.length > 0,
  });
}
