import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Heart, ShieldCheck } from 'lucide-react';
import { paths } from '@/app/routes';

export function Footer() {
  const { t } = useTranslation();

  const columns = [
    {
      title: t('footer.models'),
      links: [
        { to: paths.explore, label: t('footer.donation') },
        { to: paths.explore, label: t('footer.reward') },
        { to: paths.education, label: t('footer.musharakah') },
        { to: paths.education, label: t('footer.calculator') },
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
      title: t('footer.trust'),
      links: [
        { to: paths.trustSafety, label: t('footer.verification') },
        { to: paths.trustSafety, label: t('footer.aiEvaluation') },
        { to: paths.trustSafety, label: t('footer.risk') },
        { to: paths.trustSafety, label: t('footer.terms') },
      ],
    },
  ];

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* About */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                F
              </span>
              <span className="text-xl font-bold tracking-tight text-white">Fundy</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">{t('footer.about')}</p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t('footer.simulated')}</span>
            </div>
          </div>

          {/* Link columns */}
          {columns.map(column => (
            <div key={column.title}>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">{column.title}</h4>
              <ul className="space-y-2 text-xs">
                {column.links.map(link => (
                  <li key={link.label}>
                    <Link to={link.to} className="hover:text-emerald-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
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
