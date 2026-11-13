import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Check } from 'lucide-react';
import { paths } from '@/app/routes';

/**
 * "You're a backer!" — shown after a pledge (cart) or a contribution.
 * Big green check, one line of detail, then Share and Back to home.
 */
export function BackerSuccess({
  title,
  shareUrl,
  detail,
  extra,
  receiptHref,
  onClose,
}: {
  /** Project title, used in the share message. */
  title: string;
  shareUrl: string;
  /** "Your 650 000 so'm for … has been recorded." */
  detail: ReactNode;
  extra?: ReactNode;
  /** Link to the donation receipt, when there is one. */
  receiptHref?: string;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);
  const message = t('contribute.shareMessage', { project: title });
  const telegram = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(message)}`;

  // Phones open their own share menu (Telegram, WhatsApp, …); computers go to Telegram.
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: message, url: shareUrl });
        return;
      } catch {
        return; // the person closed the share menu
      }
    }
    window.open(telegram, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex-1 overflow-y-auto px-6 py-10 flex flex-col items-center text-center">
      {/* The check pops in and a few sparks fly out along arcs, once */}
      <span className="relative w-24 h-24">
        <span aria-hidden className="success-burst absolute inset-0">
          {Array.from({ length: 8 }, (_, i) => (
            <span key={i} style={{ '--a': `${i * 45}deg` } as CSSProperties} />
          ))}
        </span>
        <span className="success-pop relative w-24 h-24 rounded-full bg-brand flex items-center justify-center">
          <Check className="w-12 h-12 text-white" strokeWidth={3} aria-hidden />
        </span>
      </span>
      <h3 className="mt-6 text-[1.75rem] leading-tight text-ink">{t('contribute.backerTitle')}</h3>
      <p className="mt-3 text-sm text-slate-600 max-w-xs">{detail}</p>
      {extra && <div className="mt-1 text-xs text-slate-500">{extra}</div>}
      <p className="mt-2 text-sm text-slate-600 max-w-xs">{t('contribute.backerFollow')}</p>

      <div className="mt-8 w-full max-w-xs space-y-3">
        <button
          type="button"
          onClick={() => void share()}
          className="w-full min-h-12 py-3.5 rounded-md bg-brand hover:bg-brand-deep text-white text-base font-semibold cursor-pointer transition-[transform,background-color] duration-150 active:scale-[0.97]"
        >
          {t('contribute.shareFriends')}
        </button>
        <button
          type="button"
          onClick={() => {
            onClose();
            navigate(paths.home);
          }}
          className="w-full min-h-12 py-3.5 rounded-md border border-ink text-ink text-base font-semibold cursor-pointer transition-transform duration-150 active:scale-[0.97]"
        >
          {t('contribute.backHome')}
        </button>
        {receiptHref && (
          <Link
            to={receiptHref}
            onClick={onClose}
            className="block w-full py-3.5 rounded-md border border-slate-300 text-ink text-sm font-semibold"
          >
            {t('receipt.open')}
          </Link>
        )}
        <button
          type="button"
          onClick={() => void navigator.clipboard?.writeText(shareUrl).then(() => setCopied(true))}
          className="text-sm text-slate-500 underline underline-offset-4 cursor-pointer"
        >
          {copied ? t('project.copied') : t('project.copyLink')}
        </button>
      </div>
      <p className="mt-6 text-xs text-slate-500">{t('contribute.demoNote')}</p>
    </div>
  );
}
