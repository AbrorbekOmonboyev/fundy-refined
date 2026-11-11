import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ChevronDown } from 'lucide-react';
import { Alert } from '@/components/ui';
import type { Article, Localized } from '@/content/types';
import type { Language } from '@/i18n';
import { formatDate } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';

/**
 * Renders a long-form content page in the visitor's language: the title and a short intro,
 * then each section as a row that opens on a tap, so a visitor scans the headings first and
 * reads only what they need. A section named in the link (#how-it-works) starts open.
 * Wide screens also get a contents list.
 */
export function ArticlePage({
  content,
  showContents = true,
  children,
}: {
  content: Localized<Article>;
  showContents?: boolean;
  /** Extra blocks shown after the text (e.g. a calculator or a form). */
  children?: ReactNode;
}) {
  const { t, i18n } = useTranslation();
  const { hash } = useLocation();
  const a = content[(i18n.resolvedLanguage ?? 'uz') as Language] ?? content.uz;
  usePageMeta(a.title, a.intro);

  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const setSection = (id: string, isOpen: boolean) =>
    setOpen(prev => {
      if (prev.has(id) === isOpen) return prev;
      const next = new Set(prev);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });

  // A link to a section (#how-it-works) opens it (during render, like a derived value)…
  const hashId = hash.replace('#', '');
  const [seenHash, setSeenHash] = useState('');
  if (hashId !== seenHash) {
    setSeenHash(hashId);
    if (a.sections.some(s => s.id === hashId) && !open.has(hashId)) setOpen(new Set(open).add(hashId));
  }
  // …and brings it into view.
  useEffect(() => {
    if (hashId) requestAnimationFrame(() => document.getElementById(hashId)?.scrollIntoView({ block: 'start' }));
  }, [hashId]);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <header className="max-w-3xl">
        <h1 className="text-[2.25rem] sm:text-5xl leading-[1.06] font-extrabold tracking-[-0.03em] text-ink text-balance">
          {a.title}
        </h1>
        <p className="mt-4 text-lg text-slate-700 leading-relaxed">{a.intro}</p>
        {a.updated && (
          <p className="mt-3 text-xs text-slate-500">{t('content.updated', { date: formatDate(a.updated) })}</p>
        )}
        {a.draftNote && (
          <div className="mt-5">
            <Alert variant="warning">{a.draftNote}</Alert>
          </div>
        )}
      </header>

      <div className={`mt-10 grid gap-10 ${showContents ? 'lg:grid-cols-[220px_1fr]' : ''}`}>
        {showContents && (
          <nav aria-label={t('content.onThisPage')} className="hidden lg:block lg:sticky lg:top-24 self-start">
            <p className="text-sm font-semibold text-ink mb-3">{t('content.onThisPage')}</p>
            <ol className="space-y-2 text-sm">
              {a.sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} onClick={() => setSection(s.id, true)} className="text-slate-600 hover:text-ink">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="min-w-0 max-w-3xl">
          <div className="border-t border-slate-200">
            {a.sections.map(s => (
              <details
                key={s.id}
                id={s.id}
                open={open.has(s.id)}
                onToggle={e => setSection(s.id, (e.currentTarget as HTMLDetailsElement).open)}
                className="group scroll-mt-24 border-b border-slate-200"
              >
                <summary className="flex items-center justify-between gap-4 min-h-16 py-3 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <h2 className="text-lg sm:text-xl font-bold text-ink">{s.heading}</h2>
                  <ChevronDown
                    className="w-5 h-5 shrink-0 text-slate-500 transition-transform group-open:rotate-180"
                    aria-hidden
                  />
                </summary>
                <div className="pb-6 space-y-3">
                  {s.paragraphs?.map((p, i) => (
                    <p key={i} className="text-base text-slate-700 leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {s.bullets && (
                    <ul className="space-y-2">
                      {s.bullets.map((b, i) => (
                        <li key={i} className="flex gap-3 text-base text-slate-700 leading-relaxed">
                          <span className="mt-[0.7rem] h-px w-3 shrink-0 bg-slate-400" aria-hidden />
                          <span>{b}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </details>
            ))}
          </div>
          {children && <div className="mt-10 space-y-10">{children}</div>}
        </div>
      </div>
    </div>
  );
}
