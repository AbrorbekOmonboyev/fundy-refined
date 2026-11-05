import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from '@/components/ui';
import type { Article, Localized } from '@/content/types';
import type { Language } from '@/i18n';
import { formatDate } from '@/lib/money';
import { usePageMeta } from '@/lib/usePageMeta';

/** Renders a long-form content page in the visitor's language, with a contents list. */
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
  const a = content[(i18n.resolvedLanguage ?? 'uz') as Language] ?? content.uz;
  usePageMeta(a.title, a.intro);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14">
      <header className="max-w-3xl">
        <p className="inline-block rounded-full bg-brand px-3 py-1 text-xs font-semibold text-ink">{a.kicker}</p>
        <h1 className="mt-4 text-3xl sm:text-4xl text-ink text-balance">{a.title}</h1>
        <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed">{a.intro}</p>
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
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              {t('content.onThisPage')}
            </p>
            <ol className="space-y-2 text-sm">
              {a.sections.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-slate-600 hover:text-ink">
                    {s.heading}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="min-w-0 max-w-3xl space-y-10">
          {a.sections.map(s => (
            <section key={s.id} id={s.id} className="scroll-mt-24 space-y-3">
              <h2 className="text-xl text-ink">{s.heading}</h2>
              {s.paragraphs?.map((p, i) => (
                <p key={i} className="text-slate-700 leading-relaxed">
                  {p}
                </p>
              ))}
              {s.bullets && (
                <ul className="space-y-2">
                  {s.bullets.map((b, i) => (
                    <li key={i} className="flex gap-3 text-slate-700 leading-relaxed">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-deep" aria-hidden />
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          ))}
          {children}
        </div>
      </div>
    </div>
  );
}
