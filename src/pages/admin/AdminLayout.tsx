import { Suspense, type ReactNode } from 'react';
import { NavLink, Outlet } from 'react-router';
import { useTranslation } from 'react-i18next';
import {
  ClipboardCheck,
  Flag,
  Inbox,
  FolderKanban,
  LayoutDashboard,
  MessageSquare,
  ScrollText,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { paths } from '@/app/routes';
import { PageSpinner } from '@/components/ui';

/** Frame for every admin page: section menu on the left (top on phones), page on the right. */
export function AdminLayout() {
  const { t } = useTranslation();
  const links = [
    { to: paths.admin, label: t('admin.nav.overview'), Icon: LayoutDashboard, end: true },
    { to: paths.adminReview, label: t('admin.nav.review'), Icon: ClipboardCheck },
    { to: paths.adminProjects, label: t('admin.nav.projects'), Icon: FolderKanban },
    { to: paths.adminMilestones, label: t('admin.nav.milestones'), Icon: Flag },
    { to: paths.adminReports, label: t('admin.nav.reports'), Icon: ShieldAlert },
    { to: paths.adminComments, label: t('admin.nav.comments'), Icon: MessageSquare },
    { to: paths.adminUsers, label: t('admin.nav.users'), Icon: Users },
    { to: paths.adminMessages, label: t('admin.nav.messages'), Icon: Inbox },
    { to: paths.adminAudit, label: t('admin.nav.audit'), Icon: ScrollText },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid gap-8 lg:grid-cols-[210px_1fr]">
      <nav aria-label={t('admin.title')} className="lg:sticky lg:top-24 self-start">
        <p className="hidden lg:block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2 px-3">
          {t('admin.title')}
        </p>
        <ul className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
          {links.map(({ to, label, Icon, end }) => (
            <li key={to}>
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm font-medium ${
                    isActive ? 'bg-night text-white' : 'text-slate-600 hover:bg-card hover:text-ink'
                  }`
                }
              >
                <Icon className="w-4 h-4" aria-hidden />
                {label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </div>
    </div>
  );
}

/** Page title row used by admin pages. */
export function AdminHeader({ title, hint, children }: { title: string; hint?: string; children?: ReactNode }) {
  return (
    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
      <div>
        <h1 className="text-2xl text-ink">{title}</h1>
        {hint && <p className="text-sm text-slate-600 mt-1">{hint}</p>}
      </div>
      {children}
    </header>
  );
}
