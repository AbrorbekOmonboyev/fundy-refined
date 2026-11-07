import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth/AuthContext';
import { pickText } from '@/features/projects/api';
import { formatMoney } from '@/lib/money';
import { paths } from '@/app/routes';
import {
  listNotifications,
  markAllRead,
  markRead,
  subscribeToNotifications,
  type AppNotification,
} from '@/features/notifications/api';

const key = (userId: string | null) => ['notifications', userId] as const;

/** The signed-in user's notifications, refreshed live when a new one arrives. */
export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id ?? null;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: key(userId),
    queryFn: () => listNotifications(),
    enabled: !!userId,
    refetchInterval: 5 * 60_000, // safety net if the live connection drops
  });

  useEffect(() => {
    if (!userId) return;
    return subscribeToNotifications(userId, () => {
      void queryClient.invalidateQueries({ queryKey: key(userId) });
      // A new contribution or comment also changes project numbers on screen.
      void queryClient.invalidateQueries({ queryKey: ['projects'] });
    });
  }, [userId, queryClient]);

  const setRead = (ids: 'all' | string) =>
    queryClient.setQueryData<AppNotification[]>(key(userId), list =>
      list?.map(n => (ids === 'all' || n.id === ids ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n)),
    );

  const readAll = useMutation({
    mutationFn: markAllRead,
    onMutate: () => setRead('all'),
    onSettled: () => queryClient.invalidateQueries({ queryKey: key(userId) }),
  });
  const readOne = useMutation({
    mutationFn: markRead,
    onMutate: (id: string) => setRead(id),
  });

  const items = query.data ?? [];
  return {
    items,
    unread: items.filter(n => !n.read_at).length,
    isPending: query.isPending,
    markAllRead: () => readAll.mutate(),
    markRead: (id: string) => readOne.mutate(id),
  };
}

/** Text and link for one notification, in the reader's language. */
export function useNotificationView() {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? 'uz';
  const relative = new Intl.RelativeTimeFormat(lang, { numeric: 'auto' });

  return (n: AppNotification) => {
    const title = n.project
      ? (pickText(n.project.project_translations, lang, n.project.original_language).text?.title ?? n.project.slug)
      : t('notifications.aProject');
    const amount = n.data.amount ? formatMoney(n.data.amount) : '';
    const projectPage = n.project ? paths.project(n.project.slug) : paths.home;
    const editPage = n.data.project_id ? paths.editProject(n.data.project_id, 'review') : paths.founderDashboard;

    const view: Record<NotificationType, { text: string; to: string }> = {
      project_submitted: {
        text: t('notifications.project_submitted', { project: title }),
        to: n.data.project_id ? paths.adminReviewProject(n.data.project_id) : paths.adminReview,
      },
      project_approved: { text: t('notifications.project_approved', { project: title }), to: projectPage },
      project_changes_requested: {
        text: t('notifications.project_changes_requested', { project: title }),
        to: editPage,
      },
      project_rejected: { text: t('notifications.project_rejected', { project: title }), to: editPage },
      project_ended: {
        text:
          n.data.status === 'funded'
            ? t('notifications.project_funded', { project: title })
            : t('notifications.project_unsuccessful', { project: title }),
        to: projectPage,
      },
      new_contribution: {
        text: t('notifications.new_contribution', { project: title, amount }),
        to: paths.founderDashboard,
      },
      contribution_confirmed: {
        text: t('notifications.contribution_confirmed', { project: title, amount }),
        to: paths.backerDashboard,
      },
      new_comment: { text: t('notifications.new_comment', { project: title }), to: projectPage },
      comment_reply: { text: t('notifications.comment_reply', { project: title }), to: projectPage },
      new_update: { text: t('notifications.new_update', { project: title }), to: projectPage },
      contact_message: { text: t('notifications.contact_message'), to: paths.adminMessages },
      milestone_approved: { text: t('notifications.milestone_approved', { project: title }), to: projectPage },
      milestone_submitted: {
        text: t('notifications.milestone_submitted', { project: title }),
        to: paths.adminMilestones,
      },
      milestone_returned: {
        text: t('notifications.milestone_returned', { project: title }),
        to: paths.founderDashboard,
      },
      content_reported: { text: t('notifications.content_reported'), to: paths.adminReports },
      user_signed_up: {
        text: t('notifications.user_signed_up', {
          name: String(n.data?.name ?? '') || '—',
          email: String(n.data?.email ?? ''),
        }),
        to: paths.adminUsers,
      },
    };

    const seconds = Math.round((new Date(n.created_at).getTime() - Date.now()) / 1000);
    const abs = Math.abs(seconds);
    const when =
      abs < 60
        ? relative.format(0, 'second')
        : abs < 3600
          ? relative.format(Math.round(seconds / 60), 'minute')
          : abs < 86400
            ? relative.format(Math.round(seconds / 3600), 'hour')
            : relative.format(Math.round(seconds / 86400), 'day');

    return { ...view[n.type], when };
  };
}

type NotificationType = AppNotification['type'];
