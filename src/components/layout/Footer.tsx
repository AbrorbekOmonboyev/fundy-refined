import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Heart, ShieldCheck } from 'lucide-react';
import { paths } from '@/app/routes';
import { Logo } from '@/components/Logo';

export function Footer() {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('footer.models'),
      links: [
        { to: `${paths.explore}?model=donation`, label: t('footer.donation') },
        { to: `${paths.explore}?model=reward`, label: t('footer.reward') },
        { to: `${paths.explore}?model=equity`, label: t('footer.musharakah') },
        { to: `${paths.education}#calculator`, label: t('footer.calculator') },
      ],
    },
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
    <footer className="bg-night text-slate-400 text-sm border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* About */}
          <div className="lg:col-span-2 space-y-4">
            <Logo variant="dark" className="h-8" />
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">{t('footer.about')}</p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
              <span>{t('footer.simulated')}</span>
            </div>
          </div>

          {/* Link columns */}
          {columns.map(column => (
            <div key={column.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-brand mb-3">{column.title}</h4>
              <ul className="space-y-2 text-xs">
                {column.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="hover:text-brand transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-1">
            <span>{t('footer.madeWith')}</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" aria-hidden />
            <span>{t('footer.forEntrepreneurs')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
