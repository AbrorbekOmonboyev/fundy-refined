import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProjectCard } from '../components/ProjectCard';
import { CrowdfundingModel } from '../types';
import { formatUZS } from '../utils/formatters';
import { 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  TrendingUp, 
  Gift, 
  HeartHandshake, 
  Users, 
  Building2, 
  Sparkles,
  ChevronDown,
  Lock,
  Layers,
  Search
} from 'lucide-react';

export const HomePage: React.FC = () => {
  const { projects, navigateTo } = useApp();
  const [activeModelTab, setActiveModelTab] = useState<'all' | CrowdfundingModel>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Compute live prototype metrics
  const totalRaised = projects.reduce((acc, p) => acc + p.raisedAmount, 0);
  const totalBackers = projects.reduce((acc, p) => acc + p.backerCount, 0);
  const activeProjectsCount = projects.filter(p => p.status === 'active').length;

  const filteredProjects = activeModelTab === 'all'
    ? projects.slice(0, 6)
    : projects.filter(p => p.model === activeModelTab).slice(0, 6);

  const faqs = [
    {
      q: 'What makes Fundy interest-free (Riba-free)?',
      a: 'Conventional lending relies on predetermined interest fees regardless of whether a business succeeds or fails. Fundy eliminates interest entirely. We connect backers with ventures through philanthropic Donations, non-financial Reward perks, or equity-based Musharakah (where investors and founders share actual profits and enterprise risks proportionally).'
    },
    {
      q: 'How does the Musharakah (Equity) model work in practice?',
      a: 'Under a Musharakah agreement, investors provide capital to purchase productive business assets (e.g., greenhouse structures, solar cold chain units, machinery). The founder manages day-to-day operations. The business distributes an agreed percentage (e.g. 24% to 30%) of net audited profits to the investor pool periodically, with clear buyout horizons.'
    },
    {
      q: 'Are funds released all at once or in milestones?',
      a: 'To protect community backers, funds are never disbursed in a single lump sum. Fundy releases capital in predetermined stages tied to verifiable milestones (e.g., foundation pouring, equipment arrival, prototype testing), with photographic proof and backer review.'
    },
    {
      q: 'Is Fundy limited to tech startups, or can traditional businesses apply?',
      a: 'Fundy embraces all sectors across Uzbekistan: high-tech software and robotics, greenhouse agriculture, craft silk weavers and ceramicists, local food producers, public school education, and social sustainability initiatives.'
    },
    {
      q: 'What currency is used on the platform?',
      a: 'Fundy uses Uzbek So\'m (UZS) as the primary currency for all campaigns, budgets, rewards, and simulated profit distributions, reflecting the domestic economic reality of Uzbekistan.'
    }
  ];

  return (
    <div className="space-y-16 lg:space-y-24 pb-16">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-12 lg:pt-14 lg:pb-16 bg-gradient-to-b from-slate-100/70 via-slate-50 to-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* Left Column: Proposition */}
            <div className="lg:col-span-7 space-y-6">
              {/* Quiet unboxed kicker */}
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 tracking-wide uppercase">
                <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
                <span>Ethical & Interest-Free Financing for Uzbekistan</span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight leading-[1.15] text-balance">
                Crowdfunding rooted in transparency, community, and fair profit-sharing.
              </h1>

              {/* Value Proposition Description */}
              <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
                Fundy brings interest-free financing to Uzbekistan’s entrepreneurs, artisans, and innovators. Back causes through <strong>Donations</strong>, preorder authentic <strong>Rewards</strong>, or participate in real ventures via <strong>Musharakah</strong> equity partnerships.
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => navigateTo('explore')}
                  className="px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <span>Explore Projects</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => navigateTo('start-project')}
                  className="px-6 py-3 text-sm font-semibold text-slate-800 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  Start a Project
                </button>
              </div>

              {/* Trust markers */}
              <div className="pt-4 border-t border-slate-200 grid grid-cols-3 gap-4 text-xs text-slate-600">
                <div>
                  <strong className="block text-slate-900 font-bold">0% Interest</strong>
                  <span>Zero Riba or hidden debt fees</span>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">Milestone Escrow</strong>
                  <span>Staged fund release audits</span>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold">UZS Currency</strong>
                  <span>Domestic Uzbek banking alignment</span>
                </div>
              </div>
            </div>

            {/* Right Column: Marquee Hero Visual Asset */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200 aspect-[4/3] bg-slate-900">
                <img
                  src="/images/hero_fundy_fintech_1793748701470.jpg"
                  alt="Fundy innovation and crowdfunding ecosystem in Tashkent"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent flex flex-col justify-end p-6 text-white">
                  <div className="text-xs text-emerald-300 font-medium">Tashkent Tech & Innovation Hub</div>
                  <h3 className="text-base font-bold text-white mt-1">
                    Connecting Uzbekistan’s creators with community capital
                  </h3>
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-300">
                    <span className="font-mono-numbers">8 Active Regions</span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-numbers">100% Interest-Free</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. PLATFORM STATISTICS STRIP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-8 shadow-lg">
          <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Platform Traction (Simulated Prototype Data)
            </span>
            <span className="text-[11px] text-slate-400">Currency: Uzbek So'm (UZS)</span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            <div>
              <p className="text-xs text-slate-400">Total Capital Raised</p>
              <p className="text-2xl lg:text-3xl font-extrabold text-white mt-1 font-mono-numbers">
                {formatUZS(totalRaised, true)}
              </p>
              <p className="text-[11px] text-emerald-400 mt-1">Across 8 active campaigns</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Community Backers</p>
              <p className="text-2xl lg:text-3xl font-extrabold text-white mt-1 font-mono-numbers">
                {totalBackers.toLocaleString()}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">From 12 regions in Uzbekistan</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Musharakah Equity</p>
              <p className="text-2xl lg:text-3xl font-extrabold text-white mt-1 font-mono-numbers">
                3 Ventures
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Profit-sharing co-ownership</p>
            </div>
            <div>
              <p className="text-xs text-slate-400">Milestone Audit Pass Rate</p>
              <p className="text-2xl lg:text-3xl font-extrabold text-emerald-400 mt-1 font-mono-numbers">
                96.4%
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Verified stage disbursements</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THE 3 CROWDFUNDING MODELS EXPLAINED */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Transparent Financing Architecture
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 text-balance">
            Three Crowdfunding Models. Zero Predatory Interest.
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Fundy tailors financing to the nature of each project—whether philanthropic, product-driven, or entrepreneurial equity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Donation */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-4">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">1. Donation-Based</h3>
              <p className="text-xs text-slate-500 mt-1">Philanthropic Social Impact</p>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Backers contribute without expecting financial returns. Perfect for public school STEM labs, desertification reforestation in Muynak, and rural pediatric healthcare.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>100% goes directly to verified project budget</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>Verified NGO and social team registration</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                setActiveModelTab('donation');
                navigateTo('explore');
              }}
              className="mt-6 text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore Donation Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Reward */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center mb-4">
                <Gift className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">2. Reward-Based</h3>
              <p className="text-xs text-slate-500 mt-1">Pre-Orders & Artisan Perks</p>
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Backers preorder exclusive handmade creations, artisan ikat textiles, Damascus forged knives, and innovative local products before general market release.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Clear production delivery timeline</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Tangible perks dispatched across Uzbekistan</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => {
                setActiveModelTab('reward');
                navigateTo('explore');
              }}
              className="mt-6 text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1.5 cursor-pointer"
            >
              <span>Explore Reward Projects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Equity / Musharakah */}
          <div className="bg-emerald-900 text-white p-6 rounded-2xl shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-xl bg-emerald-800 text-emerald-300 flex items-center justify-center mb-4">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">3. Equity (Musharakah)</h3>
              <p className="text-xs text-emerald-300 mt-1">Islamic Profit-Sharing Ventures</p>
              <p className="text-xs text-slate-300 mt-3 leading-relaxed">
                Backers become genuine partners in revenue-generating enterprises (solar cold chains, greenhouses, electric mobility). Capital and risk are shared, with transparent quarterly profit distributions.
              </p>
              <ul className="mt-4 space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Audited quarterly dividend payouts</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Full Shariah compliance & asset-backed terms</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => navigateTo('education')}
              className="mt-6 text-xs font-semibold text-emerald-300 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              <span>Learn How Musharakah Works</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* 4. FEATURED PROJECTS SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              Discover Opportunities
            </h2>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              Featured Campaigns Across Uzbekistan
            </p>
          </div>

          {/* Interactive Model Filter Tabs (§1.A: Button tabs allowed) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              onClick={() => setActiveModelTab('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeModelTab === 'all'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Models
            </button>
            <button
              onClick={() => setActiveModelTab('equity')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeModelTab === 'equity'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Musharakah Equity
            </button>
            <button
              onClick={() => setActiveModelTab('reward')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeModelTab === 'reward'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Rewards
            </button>
            <button
              onClick={() => setActiveModelTab('donation')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                activeModelTab === 'donation'
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Donations
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {/* Explore all button */}
        <div className="text-center mt-10">
          <button
            onClick={() => navigateTo('explore')}
            className="px-6 py-2.5 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg shadow-sm transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <span>View All {projects.length} Campaigns</span>
          </button>
        </div>
      </section>

      {/* 5. HOW FUNDY WORKS */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 lg:p-12">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
              The Fundy Lifecycle
            </h2>
            <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 text-balance">
              How Projects Raise and Deliver Capital
            </p>
            <p className="text-sm text-slate-600 mt-2">
              Every campaign undergoes identity checks, deterministic AI evaluation, and milestone-locked fund disbursements.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="relative space-y-3">
              <span className="text-xs font-bold text-emerald-600 font-mono-numbers">01</span>
              <h3 className="text-base font-bold text-slate-900">Proposal & Budget Submission</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Founders formulate a clear project story, itemized budget in UZS, delivery milestones, and model terms (perks or Musharakah ratios).
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative space-y-3">
              <span className="text-xs font-bold text-emerald-600 font-mono-numbers">02</span>
              <h3 className="text-base font-bold text-slate-900">Verification & AI Evaluation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Fundy verifies the founder's legal identity/TIN and generates a 100-point project health score across business plan, team, market, and risk.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative space-y-3">
              <span className="text-xs font-bold text-emerald-600 font-mono-numbers">03</span>
              <h3 className="text-base font-bold text-slate-900">Community Backing</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Backers and investors across Uzbekistan support projects via simulated local payment channels (Click, Payme, Uzcard, Humo).
              </p>
            </div>

            {/* Step 4 */}
            <div className="relative space-y-3">
              <span className="text-xs font-bold text-emerald-600 font-mono-numbers">04</span>
              <h3 className="text-base font-bold text-slate-900">Milestone-Locked Payouts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Funds are held in milestone escrow and disbursed in verified stages as founders publish proof of work, receipts, and progress logs.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. TRUST & VERIFICATION HIGHLIGHT */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 lg:p-12 overflow-hidden relative shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 uppercase">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span>Security Architecture</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white leading-tight">
                Built to protect backer trust and founder accountability.
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Traditional crowdfunding often suffers from unfulfilled promises. Fundy enforces structural accountability through audited corporate registration checks, deterministic risk scoring, and mandatory backer communication updates.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigateTo('trust-safety')}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors cursor-pointer"
                >
                  Read Verification Standards
                </button>
                <button
                  onClick={() => navigateTo('education')}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  Explore Islamic Finance Guidelines
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Legal TIN Verification</h4>
                <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  Every campaign creator verifies corporate registration (MCHJ or YaTT) in Uzbekistan.
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <Layers className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Escrow Milestones</h4>
                <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  Campaign funding is released in chunks only upon proof of delivery for each phase.
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <Sparkles className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-white text-sm">100-Pt AI Evaluation</h4>
                <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  Multi-variable scoring evaluates business plans, financial models, and operational risk.
                </p>
              </div>

              <div className="bg-slate-800/80 p-4 rounded-xl border border-slate-700">
                <Building2 className="w-5 h-5 text-emerald-400 mb-2" />
                <h4 className="font-bold text-white text-sm">Direct Auditor Access</h4>
                <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  Equity ventures submit quarterly financial statements directly to backer dashboards.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. ILLUSTRATIVE TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Voices from Uzbekistan
          </h2>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            Founders & Backers on Fundy
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Illustrative feedback from community participants across Uzbekistan regions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "As an agronomist in Fergana, high bank loan interest rates made long-term greenhouse expansion impossible. Musharakah through Fundy allowed us to partner with 42 community backers who genuinely care about sustainable agriculture."
            </p>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                AR
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">Azizbek Rakhimov</p>
                <p className="text-slate-500">Founder, AgroSmart Fergana</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "We backed the Samarkand SilkRoad studio and received an authentic hand-woven scarf with a certificate signed by the master weaver. The transparency of the budget and production updates was unmatched."
            </p>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                SY
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">Shakhnoza Yusupova</p>
                <p className="text-slate-500">Community Backer, Tashkent</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <p className="text-xs text-slate-700 leading-relaxed italic">
              "Our school students in Chilanzar finally have 3D printers and micro-controllers thanks to 164 donors. Being able to release funds milestone by milestone gave every donor total confidence."
            </p>
            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                JB
              </div>
              <div className="text-xs">
                <p className="font-bold text-slate-900">Jasur Bekmuradov</p>
                <p className="text-slate-500">Educator, Tashkent Robotics Lab</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. FREQUENTLY ASKED QUESTIONS */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-xs font-bold uppercase tracking-wider text-emerald-700">
            Got Questions?
          </h2>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            Frequently Asked Questions
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <div
              key={idx}
              className="border border-slate-200 rounded-xl overflow-hidden bg-white"
            >
              <button
                onClick={() => setOpenFaqIndex(openFaqIndex === idx ? null : idx)}
                className="w-full px-5 py-4 text-left text-sm font-semibold text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                    openFaqIndex === idx ? 'rotate-180 text-emerald-600' : ''
                  }`}
                />
              </button>
              {openFaqIndex === idx && (
                <div className="px-5 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. BOTTOM CALL TO ACTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-emerald-950">
            Ready to bring your project to Uzbekistan?
          </h2>
          <p className="text-xs sm:text-sm text-emerald-800 max-w-xl mx-auto leading-relaxed">
            Submit your campaign proposal in 10 simple steps, receive an AI-assisted evaluation score, and raise ethical, interest-free capital from thousands of supporters.
          </p>
          <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigateTo('start-project')}
              className="px-6 py-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors cursor-pointer"
            >
              Start Your Project Today
            </button>
            <button
              onClick={() => navigateTo('explore')}
              className="px-6 py-3 text-xs font-semibold text-emerald-900 bg-white hover:bg-emerald-100/60 border border-emerald-200 rounded-lg transition-colors cursor-pointer"
            >
              Browse All Projects
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
