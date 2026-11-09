import { useTranslation } from 'react-i18next';

/** The full four steps of how money moves (moved here from the home page to keep it short). */
export function HowItWorks() {
  const { t } = useTranslation();
  return (
    <section id="how-it-works" className="scroll-mt-24 mb-12">
      <h2 className="text-2xl sm:text-[1.75rem] text-ink pb-3 mb-6 border-b border-slate-200">{t('home.how.title')}</h2>
      <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-8">
        {([1, 2, 3, 4] as const).map(i => (
          <li key={i}>
            <p className="text-sm font-bold text-slate-400 font-mono-numbers">0{i}</p>
            <h3 className="mt-2 text-base font-bold text-ink">{t(`home.how.step${i}Title`)}</h3>
            <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{t(`home.how.step${i}Text`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
