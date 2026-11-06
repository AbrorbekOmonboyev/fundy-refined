import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Send } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { errorKey } from '@/features/auth/errors';
import { Alert, Button } from '@/components/ui';

/** The bot's username without @ (Vercel env VITE_TELEGRAM_BOT). Unset → the feature is hidden. */
export const TELEGRAM_BOT = (import.meta.env.VITE_TELEGRAM_BOT as string | undefined)?.replace(/^@/, '') || null;

/**
 * Settings → Telegram: connect once, then Fundy's notifications also arrive in Telegram.
 * Connecting = a one-time code opened in the bot (t.me/<bot>?start=<code>).
 */
export function TelegramConnect() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState(false);
  const [waiting, setWaiting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const status = useQuery({
    queryKey: ['telegram-status'],
    queryFn: async () => {
      if (!supabase) return false;
      const { data, error } = await supabase.rpc('telegram_status');
      if (error) throw error;
      return data;
    },
    // after opening the bot, check every few seconds until it is linked
    refetchInterval: query => (waiting && query.state.data !== true ? 3000 : false),
  });
  if (!TELEGRAM_BOT || !supabase) return null;
  const linked = status.data === true;

  async function connect() {
    setBusy(true);
    setError(null);
    // Open the window first (browsers block pop-ups opened after an await).
    const win = window.open('', '_blank');
    try {
      const { data: code, error } = await supabase!.rpc('telegram_link_token');
      if (error) throw error;
      const url = `https://t.me/${TELEGRAM_BOT}?start=${code}`;
      if (win) win.location.href = url;
      else window.location.href = url;
      setWaiting(true);
    } catch (e) {
      win?.close();
      setError(t(errorKey(e)));
    } finally {
      setBusy(false);
    }
  }

  async function disconnect() {
    setBusy(true);
    setError(null);
    try {
      const { error } = await supabase!.rpc('telegram_unlink');
      if (error) throw error;
      await queryClient.invalidateQueries({ queryKey: ['telegram-status'] });
    } catch (e) {
      setError(t(errorKey(e)));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {linked ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-ink">✓ {t('telegram.linked')}</p>
          <Button variant="secondary" loading={busy} onClick={disconnect}>
            {t('telegram.disconnect')}
          </Button>
        </div>
      ) : (
        <>
          <Button loading={busy} onClick={connect}>
            <Send className="w-4 h-4" aria-hidden />
            {t('telegram.connect')}
          </Button>
          {waiting && <p className="text-sm text-slate-600">{t('telegram.waiting')}</p>}
        </>
      )}
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
