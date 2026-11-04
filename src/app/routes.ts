/**
 * Single source of truth for the site's URLs.
 * Pages link with `paths.*` (or `navigateTo(page)`), never with hard-coded strings.
 */
import { matchPath } from 'react-router';

export type PageView =
  | 'home'
  | 'explore'
  | 'project-detail'
  | 'start-project'
  | 'founder-dashboard'
  | 'backer-dashboard'
  | 'education'
  | 'trust-safety'
  | 'not-found';

export const paths = {
  home: '/',
  explore: '/explore',
  project: (slug: string) => `/projects/${slug}`,
  startProject: '/start',
  editProject: (id: string, step: string = 'basics') => `/dashboard/founder/${id}/${step}`,
  founderDashboard: '/dashboard/founder',
  backerDashboard: '/dashboard/backer',
  education: '/learn',
  trustSafety: '/trust-and-safety',
  // Accounts
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  authCallback: '/auth/callback',
  welcome: '/welcome',
  settings: '/settings',
  admin: '/admin',
} as const;

/** Route patterns, in matching order. */
export const routePatterns: { page: Exclude<PageView, 'not-found'>; pattern: string }[] = [
  { page: 'home', pattern: paths.home },
  { page: 'explore', pattern: paths.explore },
  { page: 'project-detail', pattern: '/projects/:slug' },
  { page: 'start-project', pattern: paths.startProject },
  { page: 'founder-dashboard', pattern: paths.founderDashboard },
  { page: 'backer-dashboard', pattern: paths.backerDashboard },
  { page: 'education', pattern: paths.education },
  { page: 'trust-safety', pattern: paths.trustSafety },
];

/** Which page a URL belongs to, plus the project slug for project pages. */
export function resolvePage(pathname: string): { page: PageView; slug: string | null } {
  for (const { page, pattern } of routePatterns) {
    const match = matchPath(pattern, pathname);
    if (match) return { page, slug: match.params.slug ?? null };
  }
  return { page: 'not-found', slug: null };
}

/** URL for a page view. `project-detail` needs the project's slug. */
export function pathFor(page: PageView, slug?: string): string {
  switch (page) {
    case 'home':
      return paths.home;
    case 'explore':
      return paths.explore;
    case 'project-detail':
      return slug ? paths.project(slug) : paths.explore;
    case 'start-project':
      return paths.startProject;
    case 'founder-dashboard':
      return paths.founderDashboard;
    case 'backer-dashboard':
      return paths.backerDashboard;
    case 'education':
      return paths.education;
    case 'trust-safety':
      return paths.trustSafety;
    case 'not-found':
      return paths.home;
  }
}
