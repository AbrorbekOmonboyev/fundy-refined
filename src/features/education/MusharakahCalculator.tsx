import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Calculator } from 'lucide-react';
import { formatMoney } from '@/lib/money';

/**
 * Musharakah example: profit is shared at the agreed rate, a loss in proportion to capital.
 *   your share of the business = investment / project capital
 *   profit year: your profit = annual result × backers' share × (investment / capital)
 *   loss year:   your loss   = annual result × (investment / capital)
 */
export function MusharakahCalculator() {
  const { t } = useTranslation();
  const [investment, setInvestment] = useState(12_000_000);
  const [capital, setCapital] = useState(240_000_000);
  const [backersShare, setBackersShare] = useState(28);
  const [result, setResult] = useState(80_000_000);

  const ownership = investment / capital;
  const isLoss = result < 0;
  const yours = isLoss ? result * ownership : result * (backersShare / 100) * ownership;
  const yearlyReturn = (yours / investment) * 100;

  return (
    <section
      id="calculator"
      className="scroll-mt-24 rounded-3xl bg-card border border-slate-200 p-5 sm:p-8 space-y-6"
      aria-labelledby="calc-title"
    >
      <header className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-2xl bg-brand text-ink flex items-center justify-center shrink-0">
          <Calculator className="w-5 h-5" aria-hidden />
        </span>
        <div>
          <h2 id="calc-title" className="text-xl text-ink">
            {t('education.calc.title')}
          </h2>
          <p className="text-sm text-slate-600 mt-1">{t('education.calc.hint')}</p>
        </div>
      </header>

      <div className="grid gap-5 md:grid-cols-2">
        <Slider
          label={t('education.calc.investment')}
          value={investment}
          onChange={setInvestment}
          min={1_000_000}
          max={100_000_000}
          step={1_000_000}
          display={formatMoney(investment)}
        />
        <Slider
          label={t('education.calc.capital')}
          value={capital}
          onChange={v => setCapital(Math.max(v, investment))}
          min={50_000_000}
          max={1_000_000_000}
          step={10_000_000}
          display={formatMoney(capital)}
        />
        <Slider
          label={t('education.calc.share')}
          value={backersShare}
          onChange={setBackersShare}
          min={5}
          max={70}
          step={1}
          display={`${backersShare}%`}
        />
        <Slider
          label={t('education.calc.result')}
          value={result}
          onChange={setResult}
          min={-100_000_000}
          max={200_000_000}
          step={5_000_000}
          display={`${result < 0 ? '−' : ''}${formatMoney(Math.abs(result))}`}
        />
      </div>

      <dl className={`grid gap-4 sm:grid-cols-3 rounded-2xl p-5 ${isLoss ? 'bg-rose-50' : 'bg-brand-soft'}`}>
        <div>
          <dt className="text-xs text-slate-600">{t('education.calc.ownership')}</dt>
          <dd className="font-display text-2xl text-ink">{(ownership * 100).toFixed(2)}%</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">
            {isLoss ? t('education.calc.yourLoss') : t('education.calc.yourProfit')}
          </dt>
          <dd className={`font-display text-2xl ${isLoss ? 'text-rose-700' : 'text-ink'}`}>
            {isLoss ? '−' : ''}
            {formatMoney(Math.round(Math.abs(yours)))}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-600">{t('education.calc.return')}</dt>
          <dd className={`font-display text-2xl ${isLoss ? 'text-rose-700' : 'text-ink'}`}>
            {yearlyReturn.toFixed(1)}%
          </dd>
        </div>
      </dl>
      <p className="text-xs text-slate-500">{isLoss ? t('education.calc.lossNote') : t('education.calc.profitNote')}</p>
    </section>
  );
}

function Slider(props: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  display: string;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="flex justify-between gap-3 text-sm text-slate-700 mb-2">
        <span>{props.label}</span>
        <strong className="font-mono-numbers text-ink">{props.display}</strong>
      </label>
      <input
        id={id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={e => props.onChange(Number(e.target.value))}
        className="w-full accent-ink"
      />
    </div>
  );
}
