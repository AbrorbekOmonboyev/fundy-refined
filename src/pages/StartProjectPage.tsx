import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { CrowdfundingModel, ProjectCategory, BudgetItem, Milestone, RewardTier } from '@/types';
import { formatUZS } from '@/lib/formatters';
import { 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  Sparkles,
  TrendingUp,
  Gift,
  HeartHandshake
} from 'lucide-react';

const DRAFT_STORAGE_KEY = 'fundy_project_draft_v1';

export const StartProjectPage: React.FC = () => {
  const { addNewProject, navigateTo, setUserRole } = useApp();

  const [step, setStep] = useState<number>(1);
  const totalSteps = 10;

  // Form State
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [category, setCategory] = useState<ProjectCategory>('Technology');
  const [location, setLocation] = useState('Tashkent, Uzbekistan');
  const [imageUrl, setImageUrl] = useState('/images/hero.jpg');

  const [description] = useState('');
  const [story, setStory] = useState('');

  const [model, setModel] = useState<CrowdfundingModel>('reward');
  const [targetAmount, setTargetAmount] = useState<number>(75_000_000);
  const [daysRemaining, setDaysRemaining] = useState<number>(30);

  // Budget items
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([
    { id: 'b-1', category: 'Production & Tooling', description: 'Core equipment & materials', amount: 45_000_000, percentage: 60 },
    { id: 'b-2', category: 'Packaging & Delivery', description: 'Eco-friendly boxes & courier', amount: 15_000_000, percentage: 20 },
    { id: 'b-3', category: 'Working Capital & Operations', description: 'Operating labor & quality testing', amount: 15_000_000, percentage: 20 }
  ]);

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: 'm-1', title: 'Phase 1: Setup & Tooling', description: 'Procure primary supplies and setup workshop', targetMonth: 'Month 1', fundReleasePercentage: 50, completed: false },
    { id: 'm-2', title: 'Phase 2: Execution & Fulfillment', description: 'Complete final production and dispatch backer packages', targetMonth: 'Month 3', fundReleasePercentage: 50, completed: false }
  ]);

  // Rewards
  const [rewards, setRewards] = useState<RewardTier[]>([
    { id: 'r-1', title: 'Early Supporter Tier', amount: 250_000, description: 'First batch limited release with personalized thank you note.', items: ['Exclusive Product', 'Numbered Authenticity Card'], estimatedDelivery: 'March 2027', claimedCount: 0, availableCount: 50 }
  ]);

  // Equity Terms
  const [investorProfitSharePercent, setInvestorProfitSharePercent] = useState<number>(25);
  const [minInvestment, setMinInvestment] = useState<number>(2_500_000);
  const [distributionSchedule, setDistributionSchedule] = useState<'Quarterly' | 'Bi-Annually' | 'Annually'>('Quarterly');

  const [risksAndChallenges, setRisksAndChallenges] = useState('Primary risks include local supplier lead times and material price fluctuations. We maintain agreements with two alternative domestic suppliers in Tashkent.');

  // Founder Information
  const [founderName, setFounderName] = useState('Azizbek Rakhimov');
  const [founderRole, setFounderRole] = useState('Founder & Product Lead');
  const [organization, setOrganization] = useState('InnoCraft Technologies MCHJ');
  const [tinOrRegistration, setTinOrRegistration] = useState('MCHJ #309819203 (Registered Tashkent City)');
  const [bio, setBio] = useState('Passionate builder with 6 years experience in hardware and consumer products across Central Asia.');
  const [experienceYears] = useState<number>(6);

  // Load from local draft
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.title) setTitle(parsed.title);
        if (parsed.tagline) setTagline(parsed.tagline);
        if (parsed.category) setCategory(parsed.category);
        if (parsed.location) setLocation(parsed.location);
        if (parsed.story) setStory(parsed.story);
        if (parsed.model) setModel(parsed.model);
        if (parsed.targetAmount) setTargetAmount(parsed.targetAmount);
      }
    } catch {
      // ignore
    }
  }, []);

  // Save to draft
  const saveDraft = () => {
    const draft = {
      title,
      tagline,
      category,
      location,
      description,
      story,
      model,
      targetAmount,
      daysRemaining
    };
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft));
  };

  const handleNext = () => {
    saveDraft();
    setStep(prev => Math.min(prev + 1, totalSteps));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = () => {
    addNewProject({
      title,
      tagline,
      description: tagline,
      story,
      model,
      category,
      location,
      imageUrl,
      targetAmount,
      daysRemaining,
      budgetBreakdown: budgetItems,
      milestones,
      rewards: model === 'reward' ? rewards : undefined,
      equityTerms: model === 'equity' ? {
        investorProfitSharePercent,
        founderProfitSharePercent: 100 - investorProfitSharePercent,
        minInvestment,
        projectedAnnualReturn: '20% - 25% p.a.',
        contractType: 'Musharakah',
        distributionSchedule,
        exitHorizonYears: 5
      } : undefined,
      risksAndChallenges,
      founder: {
        id: `f-${Date.now()}`,
        name: founderName,
        role: founderRole,
        organization,
        location,
        verifiedIdentity: true,
        tinOrRegistration,
        bio,
        experienceYears
      }
    });

    localStorage.removeItem(DRAFT_STORAGE_KEY);
    setUserRole('founder');
    navigateTo('founder-dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Wizard Header & Progress */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Project Submission Wizard</span>
          <span className="font-semibold text-slate-800 font-mono-numbers">
            Step {step} of {totalSteps}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            {step === 1 && '1. Project Basics'}
            {step === 2 && '2. Detailed Story & Narrative'}
            {step === 3 && '3. Choose Crowdfunding Model'}
            {step === 4 && '4. Funding Target & Duration'}
            {step === 5 && '5. Itemized Budget Allocation (UZS)'}
            {step === 6 && '6. Milestones & Escrow Stages'}
            {step === 7 && (model === 'reward' ? '7. Backer Reward Tiers' : model === 'equity' ? '7. Musharakah Partnership Terms' : '7. Social Impact Metrics')}
            {step === 8 && '8. Risks, Challenges & Mitigation'}
            {step === 9 && '9. Founder & Legal Verification'}
            {step === 10 && '10. Final Review & Submission'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the details for your campaign. All submissions undergo initial compliance and verification before going live.
          </p>
        </div>
      </div>

      {/* Wizard Content Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        {/* STEP 1: BASICS */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Campaign Title *
              </label>
              <input
                type="text"
                placeholder="e.g. Tashkent Robotics: Community STEM Maker Lab"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Short Tagline (1 sentence summary) *
              </label>
              <input
                type="text"
                placeholder="Briefly state what you are creating and why it matters..."
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Primary Category *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as typeof category)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Technology">Technology & Hardware</option>
                  <option value="Agriculture">Agriculture & Agro-Tech</option>
                  <option value="Artisanal & Crafts">Artisanal & Crafts</option>
                  <option value="Education">Education & Youth</option>
                  <option value="Clean Energy">Clean Energy & Sustainability</option>
                  <option value="Social Impact">Social Impact & Community</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Location in Uzbekistan *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Fergana Valley, Uzbekistan or Tashkent"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Cover Image
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Fintech Hub', url: '/images/hero.jpg' },
                  { label: 'Fergana Greenhouse', url: '/images/fergana-agro.jpg' },
                  { label: 'Samarkand Crafts', url: '/images/samarkand-craft.jpg' },
                  { label: 'Tashkent Robotics', url: '/images/tashkent-robotics.jpg' }
                ].map((preset, i) => (
                  <div
                    key={i}
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative rounded-lg overflow-hidden border-2 aspect-video cursor-pointer transition-all ${
                      imageUrl === preset.url ? 'border-emerald-600 ring-2 ring-emerald-500/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 text-[10px] bg-slate-900/80 text-white px-1.5 py-0.5 rounded">
                      {preset.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: STORY */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                The Full Campaign Narrative *
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Describe the problem you are solving in Uzbekistan, why your solution works, and how community capital will be utilized.
              </p>
              <textarea
                rows={10}
                placeholder="Write your story here... Provide specific context about your operations, your community impact, and the technology or craft involved."
                value={story}
                onChange={(e) => setStory(e.target.value)}
                className="w-full text-xs p-3.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
              />
            </div>
          </div>
        )}

        {/* STEP 3: CROWDFUNDING MODEL */}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-xs text-slate-600">
              Select the financing structure that fits your venture. All three models operate strictly without interest.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Donation */}
              <div
                onClick={() => setModel('donation')}
                className={`p-5 rounded-xl border text-xs cursor-pointer transition-all ${
                  model === 'donation'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <HeartHandshake className="w-6 h-6 text-blue-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">Donation-Based</h4>
                <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                  No financial or material returns. Ideal for non-profits, youth education, and public environmental programs.
                </p>
              </div>

              {/* Reward */}
              <div
                onClick={() => setModel('reward')}
                className={`p-5 rounded-xl border text-xs cursor-pointer transition-all ${
                  model === 'reward'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <Gift className="w-6 h-6 text-amber-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">Reward-Based</h4>
                <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                  Backers receive pre-ordered physical items, artisanal ceramics, silk scarves, or experiences.
                </p>
              </div>

              {/* Equity */}
              <div
                onClick={() => setModel('equity')}
                className={`p-5 rounded-xl border text-xs cursor-pointer transition-all ${
                  model === 'equity'
                    ? 'border-emerald-600 bg-emerald-50/40 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <TrendingUp className="w-6 h-6 text-emerald-600 mb-2" />
                <h4 className="font-bold text-slate-900 text-sm">Equity (Musharakah)</h4>
                <p className="text-slate-600 mt-1 leading-relaxed text-[11px]">
                  Shariah-compliant business co-investment with shared profits and enterprise risk distribution.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: TARGET GOAL & DURATION */}
        {step === 4 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Funding Target in Uzbek So'm (UZS) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1000000"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(Math.max(1_000_000, parseInt(e.target.value) || 0))}
                  className="w-full text-sm font-mono-numbers px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
                <span className="absolute right-3.5 top-2.5 text-xs font-semibold text-slate-400">
                  UZS
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Formatted: <strong className="text-slate-800 font-mono-numbers">{formatUZS(targetAmount)}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Campaign Duration (Days) *
              </label>
              <input
                type="number"
                min="14"
                max="90"
                value={daysRemaining}
                onChange={(e) => setDaysRemaining(parseInt(e.target.value) || 30)}
                className="w-full text-xs font-mono-numbers px-3.5 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 max-w-xs"
              />
              <p className="text-xs text-slate-500 mt-1">
                Recommended duration is 30 to 45 days.
              </p>
            </div>
          </div>
        )}

        {/* STEP 5: BUDGET ALLOCATION */}
        {step === 5 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Itemized Budget Allocation</h4>
                <p className="text-[11px] text-slate-500">Total target: {formatUZS(targetAmount)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  const newAmt = Math.round(targetAmount * 0.1);
                  setBudgetItems(prev => [
                    ...prev,
                    {
                      id: `b-${Date.now()}`,
                      category: 'New Equipment Line',
                      description: 'Operational expenses',
                      amount: newAmt,
                      percentage: 10
                    }
                  ]);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Budget Line</span>
              </button>
            </div>

            <div className="space-y-3">
              {budgetItems.map((b, i) => (
                <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-12 gap-2 items-center text-xs">
                  <div className="col-span-4">
                    <input
                      type="text"
                      placeholder="Category name"
                      value={b.category}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBudgetItems(prev => prev.map((item, idx) => idx === i ? { ...item, category: val } : item));
                      }}
                      className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white text-xs"
                    />
                  </div>
                  <div className="col-span-5">
                    <input
                      type="text"
                      placeholder="Line description"
                      value={b.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setBudgetItems(prev => prev.map((item, idx) => idx === i ? { ...item, description: val } : item));
                      }}
                      className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white text-xs"
                    />
                  </div>
                  <div className="col-span-2">
                    <input
                      type="number"
                      placeholder="Amount UZS"
                      value={b.amount}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setBudgetItems(prev => prev.map((item, idx) => idx === i ? { ...item, amount: val } : item));
                      }}
                      className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white text-xs font-mono-numbers"
                    />
                  </div>
                  <div className="col-span-1 text-right">
                    <button
                      type="button"
                      onClick={() => setBudgetItems(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 6: MILESTONES */}
        {step === 6 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-xs font-bold text-slate-900">Milestone-Locked Release Stages</h4>
                <p className="text-[11px] text-slate-500">Funds are disbursed sequentially upon proof of completion.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setMilestones(prev => [
                    ...prev,
                    {
                      id: `m-${Date.now()}`,
                      title: `Phase ${prev.length + 1}: Implementation`,
                      description: 'Milestone deliverables and audit report',
                      targetMonth: `Month ${prev.length + 1}`,
                      fundReleasePercentage: 20,
                      completed: false
                    }
                  ]);
                }}
                className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-3">
              {milestones.map((m, i) => (
                <div key={m.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Stage {i + 1}</span>
                    <button
                      type="button"
                      onClick={() => setMilestones(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Milestone title"
                      value={m.title}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMilestones(prev => prev.map((item, idx) => idx === i ? { ...item, title: val } : item));
                      }}
                      className="px-2 py-1.5 rounded border border-slate-200 bg-white text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Target timeline (e.g. Month 2)"
                      value={m.targetMonth}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMilestones(prev => prev.map((item, idx) => idx === i ? { ...item, targetMonth: val } : item));
                      }}
                      className="px-2 py-1.5 rounded border border-slate-200 bg-white text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Deliverable description and verification criteria..."
                    value={m.description}
                    onChange={(e) => {
                      const val = e.target.value;
                      setMilestones(prev => prev.map((item, idx) => idx === i ? { ...item, description: val } : item));
                    }}
                    className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white text-xs"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STEP 7: REWARDS OR EQUITY TERMS */}
        {step === 7 && (
          <div className="space-y-4">
            {model === 'reward' && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-slate-900">Define Backer Reward Perks</h4>
                  <button
                    type="button"
                    onClick={() => {
                      setRewards(prev => [
                        ...prev,
                        {
                          id: `r-${Date.now()}`,
                          title: 'Special Collector Box',
                          amount: 500_000,
                          description: 'Handcrafted perk with certified provenance.',
                          items: ['Collector Box', 'Certificate'],
                          estimatedDelivery: 'April 2027',
                          claimedCount: 0,
                          availableCount: 30
                        }
                      ]);
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Reward Tier</span>
                  </button>
                </div>

                {rewards.map((rew, i) => (
                  <div key={rew.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        placeholder="Tier title"
                        value={rew.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRewards(prev => prev.map((r, idx) => idx === i ? { ...r, title: val } : r));
                        }}
                        className="px-2 py-1.5 rounded border border-slate-200 bg-white text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Pledge amount in UZS"
                        value={rew.amount}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setRewards(prev => prev.map((r, idx) => idx === i ? { ...r, amount: val } : r));
                        }}
                        className="px-2 py-1.5 rounded border border-slate-200 bg-white text-xs font-mono-numbers"
                      />
                    </div>
                    <textarea
                      rows={2}
                      placeholder="Detailed reward description..."
                      value={rew.description}
                      onChange={(e) => {
                        const val = e.target.value;
                        setRewards(prev => prev.map((r, idx) => idx === i ? { ...r, description: val } : r));
                      }}
                      className="w-full px-2 py-1.5 rounded border border-slate-200 bg-white text-xs"
                    />
                  </div>
                ))}
              </div>
            )}

            {model === 'equity' && (
              <div className="space-y-4">
                <h4 className="text-xs font-bold text-slate-900">Musharakah Profit-Sharing Agreement Parameters</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Investor Pool Net Profit Share (%)
                    </label>
                    <input
                      type="number"
                      min="10"
                      max="49"
                      value={investorProfitSharePercent}
                      onChange={(e) => setInvestorProfitSharePercent(parseInt(e.target.value) || 20)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono-numbers"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">Founder retains {100 - investorProfitSharePercent}% of net profits</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Minimum Investment Ticket (UZS)
                    </label>
                    <input
                      type="number"
                      step="500000"
                      value={minInvestment}
                      onChange={(e) => setMinInvestment(parseInt(e.target.value) || 1_000_000)}
                      className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs font-mono-numbers"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Profit Distribution Schedule
                  </label>
                  <select
                    value={distributionSchedule}
                    onChange={(e) => setDistributionSchedule(e.target.value as typeof distributionSchedule)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-white"
                  >
                    <option value="Quarterly">Quarterly (Audited Books)</option>
                    <option value="Bi-Annually">Bi-Annually</option>
                    <option value="Annually">Annually</option>
                  </select>
                </div>
              </div>
            )}

            {model === 'donation' && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 text-xs text-blue-900 space-y-2">
                <p className="font-semibold">Donation Transparency Guidelines:</p>
                <p className="text-[11px] leading-relaxed">
                  As a non-profit donation campaign, 100% of community contributions are disbursed according to verified project expenditure receipts. Backers receive periodic social impact reports.
                </p>
              </div>
            )}
          </div>
        )}

        {/* STEP 8: RISKS & CHALLENGES */}
        {step === 8 && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Transparency: Risks, Obstacles & Mitigation Plan *
              </label>
              <p className="text-xs text-slate-500 mb-2">
                Disclosing potential roadblocks builds backer confidence. Detail how you will handle supplier delays or seasonal variations.
              </p>
              <textarea
                rows={6}
                value={risksAndChallenges}
                onChange={(e) => setRisksAndChallenges(e.target.value)}
                className="w-full text-xs p-3.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 leading-relaxed font-sans"
              />
            </div>
          </div>
        )}

        {/* STEP 9: FOUNDER INFORMATION & LEGAL REGISTRATION */}
        {step === 9 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Founder Full Name *
                </label>
                <input
                  type="text"
                  value={founderName}
                  onChange={(e) => setFounderName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Founder Role / Title *
                </label>
                <input
                  type="text"
                  value={founderRole}
                  onChange={(e) => setFounderRole(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Legal Entity / Organization *
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-200"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  TIN / Registration Number (Uzbekistan) *
                </label>
                <input
                  type="text"
                  value={tinOrRegistration}
                  onChange={(e) => setTinOrRegistration(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Founder Bio & Track Record
              </label>
              <textarea
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full text-xs p-3 rounded-lg border border-slate-200"
              />
            </div>
          </div>
        )}

        {/* STEP 10: REVIEW & SUBMIT */}
        {step === 10 && (
          <div className="space-y-5">
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold">Ready for Review:</strong>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Submitting will record your campaign into Fundy's prototype system with a 'Pending Review' status and redirect you to your Founder Dashboard.
                </p>
              </div>
            </div>

            <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Title:</span>
                <strong className="text-slate-900">{title || 'Untitled Campaign'}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Category & Location:</span>
                <strong className="text-slate-900">{category} · {location}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Target Goal:</span>
                <strong className="text-slate-900 font-mono-numbers">{formatUZS(targetAmount)}</strong>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Model:</span>
                <strong className="text-emerald-700 capitalize">{model}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Founder:</span>
                <strong className="text-slate-900">{founderName} ({organization})</strong>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous Step</span>
            </button>
          ) : (
            <div />
          )}

          {step < totalSteps ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Next: Step {step + 1}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Submit Campaign for Review</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
