import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { paths } from '@/app/routes';
import { Logo } from '@/components/Logo';
import { DONATION_ONLY } from '@/lib/focus';

export function Footer() {
  const { t } = useTranslation();

  const columns = [
    // While donation-only, the model links would lead to an empty or hidden list.
    ...(DONATION_ONLY
      ? []
      : [
          {
            title: t('footer.models'),
            links: [
              { to: `${paths.explore}?model=donation`, label: t('footer.donation') },
              { to: `${paths.explore}?model=reward`, label: t('footer.reward') },
              { to: `${paths.explore}?model=equity`, label: t('footer.musharakah') },
              { to: `${paths.education}#calculator`, label: t('footer.calculator') },
            ],
          },
        ]),
    {
      title: t('footer.platform'),
      links: [
        { to: paths.explore, label: t('footer.discover') },
        { to: paths.startProject, label: t('footer.startCampaign') },
        { to: paths.founderDashboard, label: t('footer.founderDashboard') },
        { to: paths.backerDashboard, label: t('footer.backerDashboard') },
      ],
    },
    {
      title: t('footer.company'),
      links: [
        { to: paths.about, label: t('footer.aboutLink') },
        { to: paths.trustSafety, label: t('footer.verification') },
        { to: paths.education, label: t('footer.learn') },
        { to: paths.contact, label: t('footer.contact') },
        { to: paths.terms, label: t('footer.terms') },
        { to: paths.privacy, label: t('footer.privacy') },
      ],
    },
  ];

  return (
    <footer className="app-hide print:hidden bg-night text-slate-400 text-sm border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 lg:pt-16 pb-24 lg:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* About */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="dark" className="h-8" />
            <p className="text-sm text-slate-300 leading-relaxed max-w-sm">{t('footer.about')}</p>
            <div className="pt-2 flex items-center gap-2 text-sm text-slate-300">
              <span>{t('footer.simulated')}</span>
            </div>
          </div>

          {/* Link columns */}
          {columns.map(column => (
            <div key={column.title}>
              <h2 className="font-sans text-base font-semibold tracking-normal text-white mb-2">{column.title}</h2>
              <ul className="text-sm">
                {column.links.map(link => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="inline-flex items-center min-h-10 text-slate-300 hover:text-brand-light transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-300">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          {/* Quiet link to the Android test app (android/twa-manifest.json; rebuilt APK goes to public/downloads) */}
          <a
            href="/downloads/fundy-android.apk"
            download="Fundy.apk"
            className="inline-flex items-center min-h-11 text-slate-300 hover:text-white underline-offset-4 hover:underline"
          >
            {t('footer.androidApp')}
          </a>
        </div>
      </div>
    </footer>
  );
}
