import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { formatUZS, getModelLabel } from '@/lib/formatters';
import { Link } from 'react-router';
import { paths } from '@/app/routes';
import { DollarSign, Gift, TrendingUp, Bookmark, ArrowUpRight, Package } from 'lucide-react';

export const BackerDashboardPage: React.FC = () => {
  const { contributions, projects, savedProjectIds, navigateTo, userProfile } = useApp();

  const [activeTab, setActiveTab] = useState<'contributions' | 'portfolio' | 'rewards' | 'saved'>('contributions');

  const totalPledged = contributions.reduce((acc, c) => acc + c.amount, 0);
  const equityContributions = contributions.filter(c => c.projectModel === 'equity');
  const rewardContributions = contributions.filter(c => c.projectModel === 'reward');
  const savedProjects = projects.filter(p => savedProjectIds.includes(p.id));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Backer & Investor Portfolio
            </span>
            <span className="text-xs text-slate-400">· {userProfile.city}, Uzbekistan</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Portfolio of {userProfile.name}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor your simulated contributions, reward delivery timelines, and Musharakah profit-sharing agreements.
          </p>
        </div>

        <button
          onClick={() => navigateTo('explore')}
          className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <span>Explore More Campaigns</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Total Simulated Support
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers">
            {formatUZS(totalPledged, true)}
          </p>
          <p className="text-[11px] text-slate-400">Across {contributions.length} campaigns</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Musharakah Equity
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers">
            {equityContributions.length} Ventures
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">Co-ownership partnership</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Gift className="w-3.5 h-3.5 text-amber-600" /> Preordered Perks
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers">
            {rewardContributions.length} Items
          </p>
          <p className="text-[11px] text-slate-400">Artisan & physical rewards</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5 text-rose-500" /> Bookmarked
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers">
            {savedProjects.length} Saved
          </p>
          <p className="text-[11px] text-slate-400">Projects on your radar</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'contributions', label: `All Contributions (${contributions.length})` },
          { id: 'portfolio', label: `Musharakah Portfolio (${equityContributions.length})` },
          { id: 'rewards', label: `Reward Tracking (${rewardContributions.length})` },
          { id: 'saved', label: `Saved Projects (${savedProjects.length})` },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`py-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
              activeTab === tab.id
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div>
        {/* TAB 1: ALL CONTRIBUTIONS */}
        {activeTab === 'contributions' && (
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Campaign Title</th>
                    <th className="py-3 px-4">Model</th>
                    <th className="py-3 px-4">Payment Channel</th>
                    <th className="py-3 px-4 text-right">Amount (UZS)</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {contributions.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-500 font-mono-numbers">{c.date}</td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => navigateTo('project-detail', c.projectId)}
                          className="font-semibold text-slate-900 hover:text-emerald-700 text-left line-clamp-1"
                        >
                          {c.projectTitle}
                        </button>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {getModelLabel(c.projectModel)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{c.simulatedPaymentMethod} (Simulated)</td>
                      <td className="py-3 px-4 text-right font-mono-numbers font-bold text-slate-900">
                        {formatUZS(c.amount)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => navigateTo('project-detail', c.projectId)}
                          className="text-emerald-700 hover:text-emerald-800 font-semibold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: MUSHARAKAH PORTFOLIO */}
        {activeTab === 'portfolio' && (
          <div className="space-y-4">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <TrendingUp className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Musharakah Co-Ownership Principles:</strong>
                <p className="text-[11px] text-emerald-800 mt-0.5 leading-relaxed">
                  As an equity partner, you share in actual audited profits and enterprise risk. Dividends are paid
                  proportionally to your investment share following quarterly financial audits.
                </p>
              </div>
            </div>

            {equityContributions.map(eq => (
              <div key={eq.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      Active Musharakah Agreement
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">{eq.projectTitle}</h3>
                  </div>
                  <span className="text-xs text-slate-400 font-mono-numbers">Contract Date: {eq.date}</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">Invested Capital:</span>
                    <strong className="text-slate-900 font-mono-numbers text-sm block mt-0.5">
                      {formatUZS(eq.amount)}
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">Calculated Profit Share:</span>
                    <strong className="text-emerald-700 font-mono-numbers text-sm block mt-0.5">
                      ~{eq.equityShare || '1.75'}% of net profit
                    </strong>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">Distribution Cycle:</span>
                    <strong className="text-slate-900 block mt-0.5">Quarterly (Q4 2026)</strong>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                    <span className="text-slate-400 block">Buyout Horizon:</span>
                    <strong className="text-slate-900 block mt-0.5">5 Years (Diminishing)</strong>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 text-xs">
                  <span className="text-slate-500">
                    Next simulated financial statement: <strong>Dec 31, 2026</strong>
                  </span>
                  <button
                    onClick={() => navigateTo('project-detail', eq.projectId)}
                    className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
                  >
                    <span>View Project Updates</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: REWARD TRACKING */}
        {activeTab === 'rewards' && (
          <div className="space-y-4">
            {rewardContributions.map(r => (
              <div key={r.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                      Reward Pre-Order
                    </span>
                    <h3 className="text-base font-bold text-slate-900 mt-1">
                      {r.rewardTitle || 'Artisan Reward Perk'}
                    </h3>
                    <p className="text-slate-500 text-xs">{r.projectTitle}</p>
                  </div>
                  <span className="font-mono-numbers font-bold text-slate-900">{formatUZS(r.amount)}</span>
                </div>

                {/* Tracking Progress */}
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-emerald-800 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-emerald-600" />
                      <span>Status: In Master Studio Hand-Crafting</span>
                    </span>
                    <span className="text-slate-500">Est. Dispatch: January 2027</span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full w-2/3" />
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500">
                    <span>1. Campaign Backed ✓</span>
                    <span className="font-semibold text-emerald-700">2. In Production (Current)</span>
                    <span className="text-slate-400">3. Shipped</span>
                    <span className="text-slate-400">4. Delivered</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: SAVED PROJECTS */}
        {activeTab === 'saved' && (
          <div>
            {savedProjects.length === 0 ? (
              <p className="p-12 text-center text-xs text-slate-500 bg-white rounded-2xl border border-slate-200">
                You haven't bookmarked any projects yet. Click the bookmark icon on any campaign card to save it here.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProjects.map(sp => (
                  // TODO(Phase 5): real saved projects from the database
                  <Link
                    key={sp.id}
                    to={paths.project(sp.slug)}
                    className="block bg-white p-4 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 hover:border-emerald-300"
                  >
                    {sp.title}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
