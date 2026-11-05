import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Bell, CheckCheck, CircleAlert, Gift, HandCoins, Megaphone, MessageSquare, Rocket, Trophy } from 'lucide-react';
import { useNotifications, useNotificationView } from '@/features/notifications/hooks';
import type { AppNotification } from '@/features/notifications/api';

const ICONS: Record<AppNotification['type'], typeof Bell> = {
  project_submitted: Rocket,
  project_approved: Rocket,
  project_changes_requested: CircleAlert,
  project_rejected: CircleAlert,
  project_ended: Trophy,
  new_contribution: HandCoins,
  contribution_confirmed: Gift,
  new_comment: MessageSquare,
  comment_reply: MessageSquare,
  new_update: Megaphone,
  milestone_approved: Trophy,
};

/** 🔔 in the header: the signed-in user's real notifications, updated live. */
export function NotificationBell() {
  const { t } = useTranslation();
  const { items, unread, isPending, markAllRead, markRead } = useNotifications();
  const viewOf = useNotificationView();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={unread ? t('notifications.unreadLabel', { count: unread }) : t('header.notifications')}
        className="relative p-2 text-slate-500 hover:text-ink rounded-full hover:bg-page transition-colors cursor-pointer"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-brand text-ink text-[10px] font-bold flex items-center justify-center ring-2 ring-white">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] bg-white rounded-2xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
            <span className="text-sm font-semibold text-ink">{t('header.notifications')}</span>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1 text-xs font-semibold text-ink hover:underline"
              >
                <CheckCheck className="w-3.5 h-3.5" aria-hidden />
                {t('header.markAllRead')}
              </button>
            )}
          </div>
          <ul className="max-h-[26rem] overflow-y-auto divide-y divide-slate-100">
            {isPending ? (
              <li className="p-6 text-center text-xs text-slate-500">{t('common.loading')}</li>
            ) : items.length === 0 ? (
              <li className="p-6 text-center text-xs text-slate-500">{t('header.noNotifications')}</li>
            ) : (
              items.map(n => {
                const view = viewOf(n);
                const Icon = ICONS[n.type];
                return (
                  <li key={n.id}>
                    <Link
                      to={view.to}
                      onClick={() => {
                        if (!n.read_at) markRead(n.id);
                        setOpen(false);
                      }}
                      className={`flex items-start gap-3 px-4 py-3 text-sm hover:bg-page ${n.read_at ? '' : 'bg-brand-soft/60'}`}
                    >
                      <span
                        className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${n.read_at ? 'bg-page text-slate-500' : 'bg-brand text-ink'}`}
                      >
                        <Icon className="w-4 h-4" aria-hidden />
                      </span>
                      <span className="min-w-0">
                        <span className={`block leading-snug ${n.read_at ? 'text-slate-600' : 'text-ink font-medium'}`}>
                          {view.text}
                        </span>
                        <span className="block text-[11px] text-slate-400 mt-0.5">{view.when}</span>
                      </span>
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
