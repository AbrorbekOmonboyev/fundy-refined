import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/routes';
import { usePageMeta } from '@/lib/usePageMeta';

export function NotFoundPage() {
  const { t } = useTranslation();
  usePageMeta(t('notFound.title'));

  return (
    <section className="max-w-xl mx-auto px-4 py-24 text-center">
      <p className="text-sm font-semibold text-ink">404</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink">{t('notFound.title')}</h1>
      <p className="mt-4 text-slate-600">{t('notFound.message')}</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link
          to={paths.home}
          className="px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand-deep rounded-md"
        >
          {t('notFound.home')}
        </Link>
        <Link
          to={paths.explore}
          className="px-4 py-2 text-sm font-semibold text-slate-700 bg-card border border-slate-200 hover:bg-slate-50 rounded-md"
        >
          {t('nav.explore')}
        </Link>
      </div>
    </section>
  );
}
