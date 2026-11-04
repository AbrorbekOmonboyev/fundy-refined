import React, { useState } from 'react';
import { ShieldCheck, Sparkles, AlertTriangle, Lock, CheckCircle2 } from 'lucide-react';

export const TrustSafetyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState<
    'verification' | 'scoring' | 'risk' | 'terms' | 'privacy' | 'refunds'
  >('verification');

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-200 pb-6">
        <div className="flex items-center gap-2 text-xs font-semibold text-ink uppercase tracking-wide">
          <ShieldCheck className="w-4 h-4 text-ink inline" />
          <span>Integrity, Verification & Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink mt-1">Trust & Safety Center</h1>
        <p className="text-sm text-slate-600 mt-1 max-w-2xl">
          Learn how Fundy verifies creators, evaluates project feasibility, protects backer capital through milestone
          escrow, and ensures transparent Islamic compliance.
        </p>
      </div>

      {/* Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200">
        {[
          { id: 'verification', label: '1. Project Verification' },
          { id: 'scoring', label: '2. AI Scoring System (100)' },
          { id: 'risk', label: '3. Risk Disclosures' },
          { id: 'refunds', label: '4. Escrow & Refunds' },
          { id: 'terms', label: '5. Terms of Prototype' },
          { id: 'privacy', label: '6. Privacy Standards' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as typeof activeSection)}
            className={`py-2 px-3 text-xs font-semibold rounded-lg whitespace-nowrap transition-colors cursor-pointer ${
              activeSection === tab.id
                ? 'bg-ink text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Panels */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 text-xs text-slate-700">
        {/* 1. VERIFICATION */}
        {activeSection === 'verification' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-ink">How Project & Founder Verification Works</h2>
              <p className="text-slate-500 mt-1">
                Before any campaign appears publicly in Uzbekistan, it completes our 4-stage integrity pipeline.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <CheckCircle2 className="w-5 h-5 text-ink" />
                <h3 className="font-bold text-ink text-sm">Stage 1: Identity & TIN Audit</h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Verification of founder government identity documents (passport/ID card) and official enterprise tax
                  registration (MCHJ or YaTT) via Uzbekistan Ministry of Justice public registries.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <CheckCircle2 className="w-5 h-5 text-ink" />
                <h3 className="font-bold text-ink text-sm">Stage 2: Budget Itemization Audit</h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  All spending categories must match verifiable market supplier estimates in Uzbekistan (e.g. quotes for
                  steel frames, solar PV panels, or Marghilan silk cocoons).
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <CheckCircle2 className="w-5 h-5 text-ink" />
                <h3 className="font-bold text-ink text-sm">Stage 3: Shariah Ethical Audit</h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Confirmation that the venture is free from Riba (usury/interest), gambling (Maysir), and excessive
                  uncertainty (Gharar), conforming to standard Musharakah rules.
                </p>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <CheckCircle2 className="w-5 h-5 text-ink" />
                <h3 className="font-bold text-ink text-sm">Stage 4: Milestone Agreement</h3>
                <p className="text-slate-600 leading-relaxed text-[11px]">
                  Contractual alignment on phased deliverable thresholds and release percentages prior to public
                  campaign launch.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. SCORING SYSTEM */}
        {activeSection === 'scoring' && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-1.5 text-ink font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Deterministic Scoring Engine</span>
              </div>
              <h2 className="text-lg font-bold text-ink">How the 100-Point Project Evaluation System Works</h2>
              <p className="text-slate-500 mt-1">
                Our simulated evaluation framework provides community backers with an objective health score broken down
                into 5 critical pillars.
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  title: '1. Business Plan Viability (20 Points)',
                  desc: 'Clarity of the revenue model, unit economics, supply chain dependencies, and pricing feasibility in the domestic market.',
                },
                {
                  title: '2. Founding Team Pedigree (20 Points)',
                  desc: 'Domain experience, historical delivery track record, legal integrity, and technical execution competence.',
                },
                {
                  title: '3. Market Opportunity in Uzbekistan (20 Points)',
                  desc: 'Validation of customer demand, competition analysis, and regional import-substitution value in Uzbekistan.',
                },
                {
                  title: '4. Financial Feasibility & Budget Rigor (20 Points)',
                  desc: 'Detailed line-item allocation, reasonable working capital buffers, and realism of the funding target.',
                },
                {
                  title: '5. Risk Mitigation Index (20 Points)',
                  desc: 'Robustness of contingency plans for weather shocks, equipment delays, and currency exchange stability.',
                },
              ].map((p, idx) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h3 className="font-bold text-ink text-xs">{p.title}</h3>
                  <p className="text-slate-600 mt-1 text-[11px] leading-relaxed">{p.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
              Note: This is a conceptual demonstration scoring mechanism based on deterministic evaluation heuristics.
              It does not replace independent personal due diligence.
            </div>
          </div>
        )}

        {/* 3. RISK DISCLOSURE */}
        {activeSection === 'risk' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <span>Comprehensive Risk Disclosure</span>
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Backing crowdfunding campaigns—especially equity-based Musharakah partnerships—involves real
              entrepreneurial risk:
            </p>
            <ul className="space-y-2.5 text-slate-600 pl-4 list-disc">
              <li>
                <strong>Capital at Risk:</strong> In equity crowdfunding, returns depend on the commercial success of
                the business. If the venture fails to generate net profit, no dividend distribution will occur.
              </li>
              <li>
                <strong>Non-Guaranteed Projections:</strong> Historical track records and target returns are estimates,
                not guaranteed bank yields.
              </li>
              <li>
                <strong>Illiquidity:</strong> Equity stakes in early-stage ventures cannot be easily liquidated on
                public stock exchanges prior to agreed buyout or partnership exit horizons.
              </li>
              <li>
                <strong>Production & Delivery Delays:</strong> Physical reward products may face manufacturing or
                courier delays due to supply chain shortages.
              </li>
            </ul>
          </div>
        )}

        {/* 4. REFUNDS & ESCROW */}
        {activeSection === 'refunds' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-ink flex items-center gap-2">
              <Lock className="w-5 h-5 text-ink" />
              <span>Milestone Escrow & Cancellation Policy</span>
            </h2>
            <p className="text-slate-600 leading-relaxed">Under Fundy's proposed milestone escrow system:</p>
            <ul className="space-y-2 text-slate-600 pl-4 list-disc">
              <li>
                If a campaign does not reach its minimum threshold by the campaign end date, 100% of pledged funds are
                returned to backer balances with zero deductions.
              </li>
              <li>
                Once funded, capital is disbursed to the founder in pre-agreed stages upon review of milestone proofs.
              </li>
              <li>
                If a creator fails to provide verifiable proof of work for an upcoming milestone, remaining locked
                escrow funds are protected and subject to community audit.
              </li>
            </ul>
          </div>
        )}

        {/* 5. TERMS OF USE */}
        {activeSection === 'terms' && (
          <div className="space-y-4 leading-relaxed text-slate-600">
            <h2 className="text-lg font-bold text-ink">Prototype Terms of Use (Illustrative)</h2>
            <p>
              This website is an interactive concept prototype created to demonstrate the Fundy product vision for the
              Uzbekistan market.
            </p>
            <p>
              By interacting with this platform, you acknowledge that all financial figures, payment gateways (Click,
              Payme, Uzcard, Humo), investment agreements, and profit distributions are simulated. No actual monetary
              exchange or binding contractual commitment occurs.
            </p>
          </div>
        )}

        {/* 6. PRIVACY */}
        {activeSection === 'privacy' && (
          <div className="space-y-4 leading-relaxed text-slate-600">
            <h2 className="text-lg font-bold text-ink">Privacy & Data Protection Principles</h2>
            <p>
              In our full production architecture, Fundy commits to strict compliance with the Law of the Republic of
              Uzbekistan "On Personal Data" (No. ZRU-547).
            </p>
            <p>
              In this prototype demonstration, simulated contributions and user actions are stored exclusively in your
              local browser session (via localStorage) and are never transmitted to external third-party advertisers.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
