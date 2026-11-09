import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { getIdentity, identityKey, oneIdEnabled, startOneId } from '@/features/wizard/api';
import { Alert, Button } from '@/components/ui';
import { formatDate } from '@/lib/money';

/**
 * Who the founder is, without uploading a passport: OneID (id.egov.uz) fills it in.
 * Until OneID is connected, our team confirms it on a short video call during review.
 */
export function IdentityCard({ userId }: { userId: string }) {
  const { t } = useTranslation();
  const [params] = useSearchParams();
  const identity = useQuery({ queryKey: identityKey(userId), queryFn: () => getIdentity(userId) });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(params.get('oneid') === 'error' ? t('identity.oneidFailed') : null);

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      await startOneId(window.location.pathname);
    } catch {
      setError(t('identity.oneidFailed'));
      setBusy(false);
    }
  }

  if (identity.isPending) return null;
  const confirmed = identity.data;

  if (confirmed) {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-brand-deep/30 bg-brand-soft p-4 text-sm">
        <ShieldCheck className="w-5 h-5 text-brand-deep shrink-0 mt-0.5" aria-hidden />
        <div>
          <p className="font-semibold text-ink">{t('identity.confirmedTitle')}</p>
          <p className="text-slate-700">
            {t(`identity.confirmedBy.${confirmed.method}`, { date: formatDate(confirmed.verified_at) })}
          </p>
          {confirmed.company_name && <p className="text-slate-600 mt-0.5">{confirmed.company_name}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-slate-200 p-4 space-y-3 text-sm">
      <div className="flex items-start gap-3">
        <ShieldCheck className="w-5 h-5 text-slate-500 shrink-0 mt-0.5" aria-hidden />
        <div className="space-y-1">
          <p className="font-semibold text-ink">{t('identity.title')}</p>
          <p className="text-slate-700">{t('identity.noUpload')}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3 pl-8">
        <Button variant="secondary" loading={busy} disabled={!oneIdEnabled} onClick={verify}>
          {t('identity.verifyOneId')}
        </Button>
        {!oneIdEnabled && (
          <span className="text-xs font-semibold text-slate-500 rounded-full bg-slate-100 px-2.5 py-1">
            {t('identity.comingSoon')}
          </span>
        )}
      </div>
      {!oneIdEnabled && <p className="text-slate-600 pl-8">{t('identity.videoCallMeanwhile')}</p>}
      {error && <Alert variant="error">{error}</Alert>}
    </div>
  );
}
