import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatUZS, formatPercentage, getModelLabel } from '../utils/formatters';
import { 
  Plus, 
  CheckCircle, 
  Clock, 
  Send, 
  AlertCircle, 
  ArrowUpRight, 
  FileText,
  DollarSign,
  Users,
  Layers,
  Sparkles,
  BarChart3
} from 'lucide-react';

export const FounderDashboardPage: React.FC = () => {
  const { projects, publishProjectUpdate, navigateTo, userProfile } = useApp();

  const [activeTab, setActiveTab] = useState<'campaigns' | 'milestones' | 'updates' | 'backers'>('campaigns');
  const [updateTitle, setUpdateTitle] = useState('');
  const [updateContent, setUpdateContent] = useState('');
  const [selectedProjectIdForUpdate, setSelectedProjectIdForUpdate] = useState<string>(projects[0]?.id || '');
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  // Filter projects by founder or show active founder mock campaigns
  const founderProjects = projects.filter(p => 
    p.founder.name === userProfile.name || p.id === 'project-1' || p.status === 'pending_review'
  );

  const totalRaised = founderProjects.reduce((acc, p) => acc + p.raisedAmount, 0);
  const totalBackers = founderProjects.reduce((acc, p) => acc + p.backerCount, 0);

  const handlePublishUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateTitle.trim() || !updateContent.trim() || !selectedProjectIdForUpdate) return;
    publishProjectUpdate(selectedProjectIdForUpdate, updateTitle.trim(), updateContent.trim());
    setUpdateTitle('');
    setUpdateContent('');
    setShowUpdateModal(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              Founder & Creator Console
            </span>
            <span className="text-xs text-slate-400">· Verified in Fergana / Tashkent</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
            Welcome back, {userProfile.name}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your campaigns, track milestone disbursements, and communicate with backer communities.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowUpdateModal(true)}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-emerald-600" />
            <span>Publish Update</span>
          </button>
          <button
            onClick={() => navigateTo('start-project')}
            className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Campaign</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Total Capital Raised
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers">
            {formatUZS(totalRaised, true)}
          </p>
          <p className="text-[11px] text-slate-400">Across {founderProjects.length} campaigns</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-blue-600" /> Community Backers
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers">
            {totalBackers}
          </p>
          <p className="text-[11px] text-slate-400">Supporting your ventures</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-amber-600" /> Milestone Verification
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers">
            2 Disbursed
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">108M UZS released</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs text-slate-500 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" /> AI Evaluation Status
          </span>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 font-mono-numbers">
            92 / 100
          </p>
          <p className="text-[11px] text-slate-400">Verified High Confidence</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {[
          { id: 'campaigns', label: `My Campaigns (${founderProjects.length})` },
          { id: 'milestones', label: 'Milestones & Escrow' },
          { id: 'updates', label: 'Published Updates' },
          { id: 'backers', label: 'Backer Directory' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
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

      {/* Tab Panels */}
      <div>
        {/* TAB 1: CAMPAIGNS */}
        {activeTab === 'campaigns' && (
          <div className="space-y-4">
            {founderProjects.map(p => {
              const pct = formatPercentage(p.raisedAmount, p.targetAmount);
              return (
                <div
                  key={p.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-5"
                >
                  <div className="space-y-2 max-w-xl">
                    <div className="flex items-center gap-2 text-xs">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'pending_review'
                          ? 'bg-amber-100 text-amber-800'
                          : p.status === 'funded'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {p.status === 'pending_review' ? 'Pending Review' : p.status}
                      </span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{getModelLabel(p.model)}</span>
                      <span className="text-slate-400">·</span>
                      <span className="text-slate-500">{p.category}</span>
                    </div>

                    <h3
                      onClick={() => navigateTo('project-detail', p.id)}
                      className="text-base font-bold text-slate-900 hover:text-emerald-700 cursor-pointer transition-colors"
                    >
                      {p.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{p.tagline}</p>

                    {/* Progress bar */}
                    <div className="space-y-1 pt-1">
                      <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs font-mono-numbers">
                        <span className="font-semibold text-slate-800">{formatUZS(p.raisedAmount)} raised</span>
                        <span className="text-slate-500">Goal: {formatUZS(p.targetAmount)} ({pct}%)</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => navigateTo('project-detail', p.id)}
                      className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <span>View Public Page</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProjectIdForUpdate(p.id);
                        setShowUpdateModal(true);
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                    >
                      Post Update
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: MILESTONES */}
        {activeTab === 'milestones' && (
          <div className="space-y-6">
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Escrow Verification Process:</strong>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">
                  Funds for each phase are unlocked following independent evaluation of photographic deliverables and supplier receipts. Once approved, funds disburse automatically to the creator's designated account.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {founderProjects[0]?.milestones.map((m, i) => (
                <div
                  key={m.id}
                  className={`p-4 rounded-xl border flex items-center justify-between gap-4 text-xs ${
                    m.completed ? 'bg-emerald-50/40 border-emerald-200' : 'bg-white border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      m.completed ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}>
                      {m.completed ? '✓' : i + 1}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">{m.title}</h4>
                      <p className="text-slate-500 text-[11px]">{m.description}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono-numbers font-bold text-slate-900 block">
                      {m.fundReleasePercentage}% of Capital
                    </span>
                    <span className={`text-[10px] font-semibold ${m.completed ? 'text-emerald-700' : 'text-amber-600'}`}>
                      {m.completed ? 'Verified & Disbursed' : 'Awaiting Proof Upload'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: UPDATES */}
        {activeTab === 'updates' && (
          <div className="space-y-4">
            {founderProjects[0]?.updates.map(u => (
              <div key={u.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-500">
                  <h4 className="font-bold text-slate-900 text-sm">{u.title}</h4>
                  <span>{u.date}</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{u.content}</p>
                <div className="pt-2 text-[11px] text-slate-400">
                  Published to all project backers · {u.likesCount} community likes
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 4: BACKERS */}
        {activeTab === 'backers' && (
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Backer Name</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Model & Perk</th>
                  <th className="py-3 px-4 text-right">Amount (UZS)</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'Alisher Vohidov', city: 'Tashkent', type: 'Musharakah Equity (1.75%)', amt: 15_000_000, status: 'Confirmed' },
                  { name: 'Nodirbek Yusupov', city: 'Tashkent', type: 'Musharakah Equity', amt: 10_000_000, status: 'Confirmed' },
                  { name: 'Farrukh Temirov', city: 'Fergana', type: 'Musharakah Equity', amt: 5_000_000, status: 'Confirmed' },
                  { name: 'Dilnoza Saidova', city: 'Samarkand', type: 'Community Backer', amt: 2_500_000, status: 'Confirmed' }
                ].map((b, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">{b.name}</td>
                    <td className="py-3 px-4 text-slate-500">{b.city}</td>
                    <td className="py-3 px-4 text-slate-700">{b.type}</td>
                    <td className="py-3 px-4 text-right font-mono-numbers font-medium text-slate-900">
                      {formatUZS(b.amt)}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Publish Update Modal */}
      {showUpdateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Publish Project Announcement
            </h3>
            <p className="text-xs text-slate-500">
              Announcements notify all backers immediately and appear on your project page.
            </p>

            <form onSubmit={handlePublishUpdate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target Campaign
                </label>
                <select
                  value={selectedProjectIdForUpdate}
                  onChange={(e) => setSelectedProjectIdForUpdate(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white"
                >
                  {founderProjects.map(p => (
                    <option key={p.id} value={p.id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Update Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Foundation poured and solar inverters delivered!"
                  value={updateTitle}
                  onChange={(e) => setUpdateTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Update Content
                </label>
                <textarea
                  rows={4}
                  placeholder="Share details of recent milestones achieved, photos taken, or upcoming steps..."
                  value={updateContent}
                  onChange={(e) => setUpdateContent(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUpdateModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!updateTitle.trim() || !updateContent.trim()}
                  className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg shadow-sm cursor-pointer"
                >
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
