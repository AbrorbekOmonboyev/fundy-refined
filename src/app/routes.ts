/**
 * Single source of truth for the site's URLs.
 * Pages link with `paths.*`, never with hard-coded strings.
 * The matching <Route> elements are in src/app/App.tsx.
 */
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
  about: '/about',
  contact: '/contact',
  terms: '/terms',
  privacy: '/privacy',
  // Accounts
  login: '/login',
  signup: '/signup',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  authCallback: '/auth/callback',
  welcome: '/welcome',
  settings: '/settings',
  // Admin
  admin: '/admin',
  adminReview: '/admin/review',
  adminReviewProject: (id: string) => `/admin/review/${id}`,
  adminProjects: '/admin/projects',
  adminComments: '/admin/comments',
  adminUsers: '/admin/users',
  adminAudit: '/admin/audit',
  adminMessages: '/admin/messages',
  adminMilestones: '/admin/milestones',
  adminReports: '/admin/reports',
} as const;
