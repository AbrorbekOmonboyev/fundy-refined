import React, { useState } from 'react';
import { formatUZS } from '@/lib/formatters';
import { BookOpen, TrendingUp, Gift, HeartHandshake, Calculator } from 'lucide-react';

export const EducationPage: React.FC = () => {
  // Interactive Profit-Sharing Calculator State
  const [projectCapital, setProjectCapital] = useState<number>(240_000_000); // 240M UZS
  const [investorTicket, setInvestorTicket] = useState<number>(12_000_000); // 12M UZS
  const [investorPoolSharePct, setInvestorPoolSharePct] = useState<number>(28); // 28%
  const [projectedAnnualProfit, setProjectedAnnualProfit] = useState<number>(80_000_000); // 80M UZS

  // Calculation
  const yourProportionOfPool = investorTicket / projectCapital;
  const yourEffectiveSharePct = yourProportionOfPool * investorPoolSharePct;
  const yourProjectedAnnualDividend = projectedAnnualProfit * (yourEffectiveSharePct / 100);
  const projectedROI = investorTicket > 0 ? (yourProjectedAnnualDividend / investorTicket) * 100 : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink uppercase tracking-wide">
          <BookOpen className="w-4 h-4 text-ink inline" />
          <span>Fundy Knowledge & Islamic Finance Academy</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mt-1">Understanding Crowdfunding & Musharakah</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Everything you need to know about ethical, interest-free capital formation, profit-and-loss sharing, and
          backer protections in Uzbekistan.
        </p>
      </div>

      {/* Interactive Calculator Section */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-ink" />
            <h2 className="text-base font-bold text-ink">Interactive Musharakah Profit-Sharing Simulator</h2>
          </div>
          <span className="text-xs text-slate-500">Uzbekistan Market Model (UZS)</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          In a Musharakah agreement, investors do not earn fixed interest. Instead, you share in actual business profits
          proportionally. Test how changes in investment size and business profits affect annual returns:
        </p>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Your Investment Ticket:{' '}
              <strong className="font-mono-numbers text-ink">{formatUZS(investorTicket)}</strong>
            </label>
            <input
              type="range"
              min="2000000"
              max="50000000"
              step="1000000"
              value={investorTicket}
              onChange={e => setInvestorTicket(parseInt(e.target.value))}
              className="w-full accent-ink"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>2M UZS</span>
              <span>50M UZS</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Total Venture Target Capital:{' '}
              <strong className="font-mono-numbers text-ink">{formatUZS(projectCapital)}</strong>
            </label>
            <input
              type="range"
              min="50000000"
              max="500000000"
              step="10000000"
              value={projectCapital}
              onChange={e => setProjectCapital(parseInt(e.target.value))}
              className="w-full accent-ink"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>50M UZS</span>
              <span>500M UZS</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Investor Pool Profit Share:{' '}
              <strong className="font-mono-numbers text-ink">{investorPoolSharePct}% of net profits</strong>
            </label>
            <input
              type="range"
              min="15"
              max="40"
              step="1"
              value={investorPoolSharePct}
              onChange={e => setInvestorPoolSharePct(parseInt(e.target.value))}
              className="w-full accent-ink"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>15%</span>
              <span>40%</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Projected Annual Business Net Profit:{' '}
              <strong className="font-mono-numbers text-ink">{formatUZS(projectedAnnualProfit)}</strong>
            </label>
            <input
              type="range"
              min="20000000"
              max="200000000"
              step="5000000"
              value={projectedAnnualProfit}
              onChange={e => setProjectedAnnualProfit(parseInt(e.target.value))}
              className="w-full accent-ink"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>20M UZS</span>
              <span>200M UZS</span>
            </div>
          </div>
        </div>

        {/* Calculated Results Box */}
        <div className="p-5 bg-brand-soft rounded-xl border border-brand grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-ink">
          <div>
            <span className="text-slate-600 block">Your Effective Profit Share:</span>
            <strong className="text-lg font-extrabold text-ink font-mono-numbers block mt-0.5">
              {yourEffectiveSharePct.toFixed(2)}%
            </strong>
            <span className="text-[10px] text-slate-500">of company's net earnings</span>
          </div>

          <div>
            <span className="text-slate-600 block">Simulated Annual Dividend:</span>
            <strong className="text-lg font-extrabold text-ink font-mono-numbers block mt-0.5">
              {formatUZS(Math.round(yourProjectedAnnualDividend))}
            </strong>
            <span className="text-[10px] text-slate-500">distributed quarterly</span>
          </div>

          <div>
            <span className="text-slate-600 block">Simulated Annual ROI:</span>
            <strong className="text-lg font-extrabold text-ink font-mono-numbers block mt-0.5">
              ~{projectedROI.toFixed(1)}% p.a.
            </strong>
            <span className="text-[10px] text-slate-500">relative to ticket</span>
          </div>
        </div>
      </section>

      {/* Guide Content: The 3 Models */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-ink">The Three Crowdfunding Models Deep Dive</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-700">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <HeartHandshake className="w-6 h-6 text-blue-600" />
            <h3 className="font-bold text-ink text-sm">Donation Crowdfunding</h3>
            <p className="leading-relaxed text-slate-600">
              In donation crowdfunding, individuals pool small to moderate gifts to fund community-wide benefit. Backers
              do not receive financial payouts or physical goods.
            </p>
            <h4 className="font-semibold text-ink">Best used for:</h4>
            <p className="text-slate-500">
              Public school computer labs, ecological plantings, free health diagnostics, and cultural museums.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <Gift className="w-6 h-6 text-amber-600" />
            <h3 className="font-bold text-ink text-sm">Reward Crowdfunding</h3>
            <p className="leading-relaxed text-slate-600">
              Backers act as early customers and patrons. They pledge funds in exchange for tiered physical rewards or
              services upon completion.
            </p>
            <h4 className="font-semibold text-ink">Best used for:</h4>
            <p className="text-slate-500">
              Handcrafted ceramics, silk textiles, books, designer kitchenware, and specialty roasted coffees.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
            <TrendingUp className="w-6 h-6 text-ink" />
            <h3 className="font-bold text-ink text-sm">Equity / Musharakah</h3>
            <p className="leading-relaxed text-slate-600">
              Investors contribute risk capital into a commercially viable enterprise. Profit and enterprise risk are
              shared according to transparent contractual ratios.
            </p>
            <h4 className="font-semibold text-ink">Best used for:</h4>
            <p className="text-slate-500">
              High-tech hydroponic greenhouses, solar cold storage, electric vehicles, and SaaS software.
            </p>
          </div>
        </div>
      </section>

      {/* What is Musharakah vs Conventional Loans? */}
      <section className="bg-slate-50 rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-xs font-semibold text-ink uppercase">Shariah Alignment</span>
          <h2 className="text-xl font-bold text-ink mt-1">How Musharakah Differs from Conventional Debt Loans</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="bg-white p-5 rounded-xl border border-rose-200 space-y-2">
            <h3 className="font-bold text-rose-900 text-sm">Conventional Bank Lending (Debt)</h3>
            <ul className="space-y-2 text-slate-600">
              <li>• Charges fixed interest (Riba) regardless of business outcome.</li>
              <li>• Founder bears 100% of the downside risk, often pledging family home as collateral.</li>
              <li>• Bank has no interest in whether the product actually enriches society.</li>
              <li>• Default leads to compounding penalties and legal distress.</li>
            </ul>
          </div>

          <div className="bg-white p-5 rounded-xl border border-brand space-y-2">
            <h3 className="font-bold text-ink text-sm">Musharakah Partnership (Fundy)</h3>
            <ul className="space-y-2 text-slate-600">
              <li>• Zero interest. Returns are strictly tied to real audited commercial profits.</li>
              <li>• Investors and founders share business risk equitably.</li>
              <li>• Capital is asset-backed (machinery, seeds, solar panels, inventory).</li>
              <li>• Encourages collaboration, ethical governance, and long-term community prosperity.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Risks & Mitigation */}
      <section className="space-y-4 text-xs text-slate-700">
        <h2 className="text-xl font-bold text-ink">Understanding the Risks of Crowdfunding</h2>
        <p className="leading-relaxed text-slate-600">
          All entrepreneurial ventures face execution risk. Product prototypes can experience manufacturing delays;
          agricultural projects can face climatic variations; consumer demand can shift.
        </p>
        <p className="leading-relaxed text-slate-600">
          Fundy minimizes risk through <strong>staged milestone disbursements</strong> (founders only receive money
          after verifying earlier stages), <strong>legal identity verification</strong> across Uzbekistan registries,
          and <strong>100-point multi-variable evaluations</strong>. Backers should always diversify their support
          across multiple initiatives.
        </p>
      </section>
    </div>
  );
};
