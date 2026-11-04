import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { ProjectCard } from '@/components/ProjectCard';
import { formatUZS, formatPercentage, getModelLabel } from '@/lib/formatters';
import { 
  CheckCircle, 
  Clock, 
  Users, 
  Bookmark, 
  Share2, 
  AlertCircle, 
  TrendingUp, 
  Sparkles,
  ThumbsUp,
  Send,
} from 'lucide-react';

export const ProjectDetailPage: React.FC = () => {
  const { 
    projects, 
    selectedProjectId, 
    savedProjectIds, 
    toggleSaveProject, 
    openContributionModal, 
    addProjectComment,
    navigateTo 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'story' | 'budget' | 'milestones' | 'evaluation' | 'risks' | 'updates' | 'community'>('story');
  const [commentInput, setCommentInput] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  const project = projects.find(p => p.id === selectedProjectId) || projects[0];
  const isSaved = savedProjectIds.includes(project.id);
  const percentage = formatPercentage(project.raisedAmount, project.targetAmount);

  const relatedProjects = projects
    .filter(p => p.id !== project.id && (p.category === project.category || p.model === project.model))
    .slice(0, 3);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;
    addProjectComment(project.id, commentInput.trim());
    setCommentInput('');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-500">
        <button onClick={() => navigateTo('home')} className="hover:text-slate-800">
          Home
        </button>
        <span aria-hidden="true">/</span>
        <button onClick={() => navigateTo('explore')} className="hover:text-slate-800">
          Explore
        </button>
        <span aria-hidden="true">/</span>
        <span>{project.category}</span>
        <span aria-hidden="true">/</span>
        <span className="text-slate-900 font-medium truncate max-w-xs">{project.title}</span>
      </nav>

      {/* Main Campaign Hero Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Media and Details (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span className="font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
              {getModelLabel(project.model)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.location}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {project.title}
          </h1>

          <p className="text-sm text-slate-600 leading-relaxed">
            {project.tagline}
          </p>

          {/* Cover image */}
          <div className="relative rounded-2xl overflow-hidden aspect-[16/10] bg-slate-100 border border-slate-200">
            <img
              src={project.imageUrl}
              alt={project.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Founder Identity Strip */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm">
                {project.founder.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-xs">
                <div className="flex items-center gap-1.5 font-bold text-slate-900">
                  <span>{project.founder.name}</span>
                  {project.founder.verifiedIdentity && (
                    <span title="Verified by Fundy" className="text-emerald-600">
                      <CheckCircle className="w-3.5 h-3.5 inline" />
                    </span>
                  )}
                </div>
                <p className="text-slate-500">{project.founder.role} · {project.founder.organization}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{project.founder.tinOrRegistration}</p>
              </div>
            </div>

            <div className="text-right text-xs shrink-0 hidden sm:block">
              <span className="text-slate-400">Experience:</span>
              <p className="font-bold text-slate-700">{project.founder.experienceYears} Years</p>
            </div>
          </div>
        </div>

        {/* Right: Financial & Action Sidebar (5 cols) */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            {/* Progress metrics */}
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono-numbers">
                    {formatUZS(project.raisedAmount)}
                  </span>
                  <p className="text-xs text-slate-500 mt-0.5">
                    raised of <strong className="text-slate-700">{formatUZS(project.targetAmount)}</strong> goal
                  </p>
                </div>
                <span className="text-2xl font-bold text-emerald-700 font-mono-numbers">
                  {percentage}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" /> Backers
                  </span>
                  <strong className="text-base text-slate-900 font-mono-numbers block mt-0.5">
                    {project.backerCount}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Time Remaining
                  </span>
                  <strong className="text-base text-slate-900 font-mono-numbers block mt-0.5">
                    {project.daysRemaining} Days
                  </strong>
                </div>
              </div>
            </div>

            {/* Model Highlight Box */}
            {project.model === 'equity' && project.equityTerms && (
              <div className="p-4 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-950 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Musharakah Equity Partnership</span>
                </div>
                <p className="text-slate-700 leading-relaxed text-[11px]">
                  {project.equityTerms.investorProfitSharePercent}% of audited net profits distributed {project.equityTerms.distributionSchedule.toLowerCase()} to backers.
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] text-slate-600 border-t border-emerald-100">
                  <span>Min. Ticket: {formatUZS(project.equityTerms.minInvestment)}</span>
                  <span>Target: {project.equityTerms.projectedAnnualReturn}</span>
                </div>
              </div>
            )}

            {/* Main Action Button */}
            <div className="space-y-2.5">
              <button
                onClick={() => openContributionModal(project)}
                className="w-full py-3.5 px-4 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-xl shadow-sm transition-colors text-center cursor-pointer"
              >
                {project.model === 'equity'
                  ? 'Simulate Musharakah Investment'
                  : project.model === 'reward'
                  ? 'Back This Project & Claim Reward'
                  : 'Make a Simulated Donation'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => toggleSaveProject(project.id)}
                  className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isSaved
                      ? 'border-rose-200 bg-rose-50 text-rose-700'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save Project'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>{copiedLink ? 'Link Copied!' : 'Share'}</span>
                </button>
              </div>
            </div>

            {/* AI Evaluation Scorecard Banner */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <div className="text-xs">
                  <span className="font-bold text-slate-800">AI Evaluation Score:</span>
                  <p className="text-[11px] text-slate-500">{project.evaluation.status}</p>
                </div>
              </div>
              <span className="text-base font-extrabold text-emerald-700 font-mono-numbers">
                {project.evaluation.overallScore}/100
              </span>
            </div>

            {/* Simulation Disclaimer */}
            <p className="text-[10px] text-slate-400 text-center leading-normal">
              Fundy prototype demonstration. No actual funds, banking fees, or legal contracts are exchanged.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="pt-6 border-t border-slate-200">
        {/* Tab Headers */}
        <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
          {[
            { id: 'story', label: 'Story & Narrative' },
            { id: 'budget', label: 'Budget Breakdown' },
            { id: 'milestones', label: 'Milestones & Escrow' },
            { id: 'evaluation', label: 'AI Evaluation (100)' },
            { id: 'risks', label: 'Risks & Challenges' },
            { id: 'updates', label: `Updates (${project.updates.length})` },
            { id: 'community', label: `Q&A (${project.comments.length})` }
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

        {/* Tab Panels */}
        <div className="py-8">
          {/* TAB 1: STORY */}
          {activeTab === 'story' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6 text-sm text-slate-700 leading-relaxed">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-2">About This Campaign</h3>
                  <div className="whitespace-pre-line leading-relaxed text-slate-600">
                    {project.story}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
                    Founder Background & Mission
                  </h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {project.founder.bio}
                  </p>
                </div>
              </div>

              {/* Sidebar with Perks or Equity details */}
              <div className="lg:col-span-4 space-y-4">
                {project.model === 'reward' && project.rewards && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Reward Perks
                    </h4>
                    {project.rewards.map(reward => (
                      <div
                        key={reward.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 shadow-sm hover:border-slate-300 transition-colors"
                      >
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-slate-900 text-xs">{reward.title}</span>
                          <span className="text-xs font-bold text-emerald-700 font-mono-numbers">
                            {formatUZS(reward.amount)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          {reward.description}
                        </p>
                        <ul className="text-[11px] text-slate-500 space-y-1 pt-1">
                          {reward.items.map((item, idx) => (
                            <li key={idx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="pt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-100">
                          <span>Est. {reward.estimatedDelivery}</span>
                          <span className="font-mono-numbers">{reward.claimedCount} claimed</span>
                        </div>
                        <button
                          onClick={() => openContributionModal(project, reward.id)}
                          className="w-full mt-2 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
                        >
                          Select This Reward
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BUDGET BREAKDOWN */}
          {activeTab === 'budget' && (
            <div className="space-y-6 max-w-4xl">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Itemized Capital Allocation (UZS)</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Fundy mandates full line-item visibility before campaigns launch. Total budget aligns with the {formatUZS(project.targetAmount)} target.
                </p>
              </div>

              {/* Visual budget breakdown bars */}
              <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex">
                {project.budgetBreakdown.map((item, idx) => {
                  const colors = ['bg-emerald-600', 'bg-blue-600', 'bg-amber-500', 'bg-purple-600', 'bg-slate-600'];
                  return (
                    <div
                      key={item.id}
                      className={`h-full ${colors[idx % colors.length]}`}
                      style={{ width: `${item.percentage}%` }}
                      title={`${item.category}: ${item.percentage}% (${formatUZS(item.amount)})`}
                    />
                  );
                })}
              </div>

              {/* Itemized Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Cost Category</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-right">Amount (UZS)</th>
                      <th className="py-3 px-4 text-right">Share (%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {project.budgetBreakdown.map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-semibold text-slate-900">{item.category}</td>
                        <td className="py-3 px-4 text-slate-600">{item.description}</td>
                        <td className="py-3 px-4 text-right font-mono-numbers font-medium text-slate-900">
                          {formatUZS(item.amount)}
                        </td>
                        <td className="py-3 px-4 text-right font-mono-numbers text-slate-500">
                          {item.percentage}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-slate-50 border-t border-slate-200 font-bold text-slate-900">
                    <tr>
                      <td className="py-3 px-4" colSpan={2}>Total Goal Allocation</td>
                      <td className="py-3 px-4 text-right font-mono-numbers text-emerald-700">
                        {formatUZS(project.targetAmount)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono-numbers">100%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: MILESTONES & ESCROW */}
          {activeTab === 'milestones' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Milestone-Based Escrow Schedule</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Capital is locked in simulated escrow and disbursed to founders sequentially as each milestone is verified.
                </p>
              </div>

              <div className="space-y-4">
                {project.milestones.map((m, idx) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-xl border transition-all ${
                      m.completed
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold ${
                            m.completed
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {m.completed ? '✓' : idx + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{m.title}</h4>
                            <span className={`text-[11px] px-1.5 py-0.5 rounded font-medium ${
                              m.completed ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {m.completed ? 'Disbursed' : 'Upcoming'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                            {m.description}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-xs shrink-0 font-mono-numbers">
                        <span className="text-slate-400 block">{m.targetMonth}</span>
                        <strong className="text-slate-800">{m.fundReleasePercentage}% of funds</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: AI EVALUATION SCORECARD */}
          {activeTab === 'evaluation' && (
            <div className="space-y-6 max-w-4xl">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Simulated Evaluation Demonstration:</strong>
                  <p className="text-[11px] mt-0.5 text-amber-800">
                    This scorecard showcases Fundy's conceptual multi-factor evaluation framework. It demonstrates deterministic assessment across business viability, team verification, and operational risks.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between pb-6 border-b border-slate-200">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">Project Quality Scorecard</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Evaluated on {project.evaluation.lastEvaluatedDate} · Status: <strong>{project.evaluation.status}</strong>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-extrabold text-emerald-700 font-mono-numbers">
                      {project.evaluation.overallScore}
                    </span>
                    <span className="text-slate-400 text-sm"> / 100</span>
                  </div>
                </div>

                {/* Individual 5 Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { label: 'Business Plan Quality', score: project.evaluation.businessPlanScore, max: 20 },
                    { label: 'Founding Team Pedigree', score: project.evaluation.teamScore, max: 20 },
                    { label: 'Market Opportunity in UZ', score: project.evaluation.marketScore, max: 20 },
                    { label: 'Financial Feasibility', score: project.evaluation.financialScore, max: 20 },
                    { label: 'Risk Mitigation Index', score: project.evaluation.riskScore, max: 20 }
                  ].map((cat, idx) => (
                    <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                      <div className="flex justify-between text-xs font-semibold text-slate-700">
                        <span>{cat.label}</span>
                        <span className="font-mono-numbers text-slate-900">{cat.score} / {cat.max}</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-emerald-600 h-full rounded-full"
                          style={{ width: `${(cat.score / cat.max) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Qualitative Notes */}
                <div className="pt-4 border-t border-slate-100 space-y-4 text-xs">
                  <div>
                    <h4 className="font-bold text-slate-800">Evaluator Synthesis:</h4>
                    <p className="text-slate-600 mt-1 leading-relaxed">
                      {project.evaluation.summaryNotes}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
                      <h5 className="font-bold text-emerald-900 mb-1.5">Key Identified Strengths</h5>
                      <ul className="space-y-1 text-slate-600">
                        {project.evaluation.keyStrengths.map((str, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-amber-50/50 p-3 rounded-lg border border-amber-100">
                      <h5 className="font-bold text-amber-900 mb-1.5">Monitored Risk Factors</h5>
                      <ul className="space-y-1 text-slate-600">
                        {project.evaluation.keyRisks.map((rsk, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-amber-600 font-bold">!</span>
                            <span>{rsk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: RISKS & CHALLENGES */}
          {activeTab === 'risks' && (
            <div className="space-y-4 max-w-3xl">
              <h3 className="text-lg font-bold text-slate-900">Transparency: Risks & Mitigation</h3>
              <p className="text-xs text-slate-500">
                Ethical crowdfunding requires candid disclosures of technical, environmental, and commercial risks before backer capital is committed.
              </p>
              <div className="p-5 bg-white rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed shadow-sm">
                {project.risksAndChallenges}
              </div>
            </div>
          )}

          {/* TAB 6: UPDATES */}
          {activeTab === 'updates' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Project Announcements & Progress</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Direct dispatches from the founding team to backers.
                </p>
              </div>

              {project.updates.length === 0 ? (
                <p className="p-8 text-center text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                  No project updates published yet.
                </p>
              ) : (
                <div className="space-y-4">
                  {project.updates.map(update => (
                    <div key={update.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-900 text-sm">{update.title}</span>
                        <span className="text-slate-400">{update.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {update.content}
                      </p>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs text-slate-500">
                        <span>Posted by <strong>{update.author}</strong></span>
                        <button
                          type="button"
                          className="flex items-center gap-1 text-slate-500 hover:text-emerald-700 transition-colors p-1"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="font-mono-numbers">{update.likesCount}</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: COMMUNITY Q&A */}
          {activeTab === 'community' && (
            <div className="space-y-6 max-w-3xl">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Backer Discussions & Inquiries</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Ask the founder questions about budget items, technology, or timelines.
                </p>
              </div>

              {/* Add comment form */}
              <form onSubmit={handleCommentSubmit} className="bg-white p-4 rounded-xl border border-slate-200 space-y-3 shadow-sm">
                <textarea
                  rows={3}
                  placeholder="Post a question or message of support for the founder..."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  className="w-full text-xs p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!commentInput.trim()}
                    className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Post Question</span>
                  </button>
                </div>
              </form>

              {/* Comments list */}
              <div className="space-y-3">
                {project.comments.map(c => (
                  <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-200 space-y-2 text-xs shadow-sm">
                    <div className="flex items-center justify-between text-slate-500">
                      <div className="flex items-center gap-2">
                        <strong className="text-slate-900">{c.authorName}</strong>
                        <span>({c.authorCity})</span>
                        {c.isBacker && (
                          <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-1.5 py-0.5 rounded">
                            Backer
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400">{c.date}</span>
                    </div>
                    <p className="text-slate-700 leading-relaxed">{c.content}</p>

                    {c.reply && (
                      <div className="mt-2 pl-3 border-l-2 border-emerald-500 pt-1 space-y-1 bg-slate-50/60 p-2 rounded-r-lg">
                        <div className="flex items-center justify-between text-[11px] text-slate-600">
                          <strong className="text-emerald-800">{c.reply.author} (Founder)</strong>
                          <span className="text-slate-400">{c.reply.date}</span>
                        </div>
                        <p className="text-slate-600 text-[11px] leading-relaxed">{c.reply.content}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Campaigns */}
      {relatedProjects.length > 0 && (
        <div className="pt-10 border-t border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900">Similar Campaigns in Uzbekistan</h3>
            <button
              onClick={() => navigateTo('explore')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
            >
              View all
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedProjects.map(rel => (
              <ProjectCard key={rel.id} project={rel} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
