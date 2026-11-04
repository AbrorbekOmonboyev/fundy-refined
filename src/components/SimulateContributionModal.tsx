import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { formatUZS, getModelLabel } from '@/lib/formatters';
import { X, CheckCircle2, ShieldCheck, AlertCircle, CreditCard, ChevronRight } from 'lucide-react';

export const SimulateContributionModal: React.FC = () => {
  const { 
    contributionModalProject, 
    selectedRewardId, 
    closeContributionModal, 
    recordContribution,
    navigateTo 
  } = useApp();

  const project = contributionModalProject;

  const [step, setStep] = useState<'amount' | 'terms' | 'payment' | 'success'>('amount');
  const [selectedAmount, setSelectedAmount] = useState<number>(500_000);
  const [customAmountStr, setCustomAmountStr] = useState<string>('');
  const [isCustom, setIsCustom] = useState<boolean>(false);
  const [chosenRewardId, setChosenRewardId] = useState<string | null>(selectedRewardId);
  const [paymentMethod, setPaymentMethod] = useState<'Click' | 'Payme' | 'Uzcard' | 'Humo' | 'Bank Wire'>('Click');
  const [agreedToRisk, setAgreedToRisk] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Sync chosen reward if passed
  useEffect(() => {
    if (selectedRewardId && project?.rewards) {
      setChosenRewardId(selectedRewardId);
      const reward = project.rewards.find(r => r.id === selectedRewardId);
      if (reward) {
        setSelectedAmount(reward.amount);
        setIsCustom(false);
      }
    } else if (project?.model === 'equity' && project.equityTerms) {
      setSelectedAmount(project.equityTerms.minInvestment);
    } else {
      setSelectedAmount(200_000);
    }
    setStep('amount');
    setAgreedToRisk(false);
  }, [project, selectedRewardId]);

  if (!project) return null;

  const finalAmount = isCustom ? (parseInt(customAmountStr) || 0) : selectedAmount;

  // Calculate simulated equity share
  let calculatedShare = 0;
  if (project.model === 'equity' && project.equityTerms && finalAmount > 0) {
    calculatedShare = parseFloat(
      ((finalAmount / project.targetAmount) * project.equityTerms.investorProfitSharePercent).toFixed(2)
    );
  }

  const chosenReward = project.rewards?.find(r => r.id === chosenRewardId);

  const handlePresetSelect = (amt: number) => {
    setSelectedAmount(amt);
    setIsCustom(false);
  };

  const handleCustomChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setCustomAmountStr(raw);
    setIsCustom(true);
  };

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      recordContribution({
        projectId: project.id,
        amount: finalAmount,
        paymentMethod,
        rewardId: chosenReward?.id,
        rewardTitle: chosenReward?.title
      });
      setIsSubmitting(false);
      setStep('success');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                {getModelLabel(project.model)} Simulation
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 mt-1 line-clamp-1">
              {project.title}
            </h3>
          </div>
          <button
            onClick={closeContributionModal}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prototype notice bar */}
        <div className="bg-amber-50 border-b border-amber-100 px-6 py-2 flex items-center gap-2 text-xs text-amber-800">
          <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
          <span>Demonstration Mode: No actual currency is charged or transferred.</span>
        </div>

        {/* Body based on step */}
        <div className="p-6">
          {step === 'amount' && (
            <div className="space-y-5">
              {/* If equity, highlight Musharakah details */}
              {project.model === 'equity' && project.equityTerms && (
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-950 space-y-1.5">
                  <div className="flex items-center justify-between font-semibold">
                    <span>Musharakah Partnership Terms:</span>
                    <span className="text-emerald-700">{project.equityTerms.contractType}</span>
                  </div>
                  <p className="text-slate-600">
                    Total Investor Pool: {project.equityTerms.investorProfitSharePercent}% of net profits.
                    Distributions scheduled {project.equityTerms.distributionSchedule.toLowerCase()}.
                  </p>
                  <p className="text-slate-500 text-[11px]">
                    Minimum participation ticket: {formatUZS(project.equityTerms.minInvestment)}
                  </p>
                </div>
              )}

              {/* If rewards available, allow picking */}
              {project.model === 'reward' && project.rewards && project.rewards.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Select a Reward Tier (Optional)
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {project.rewards.map(rew => (
                      <div
                        key={rew.id}
                        onClick={() => {
                          setChosenRewardId(rew.id);
                          setSelectedAmount(rew.amount);
                          setIsCustom(false);
                        }}
                        className={`p-3 rounded-lg border text-xs cursor-pointer transition-all ${
                          chosenRewardId === rew.id
                            ? 'border-emerald-600 bg-emerald-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex justify-between items-baseline">
                          <span className="font-semibold text-slate-900">{rew.title}</span>
                          <span className="font-bold text-emerald-700 font-mono-numbers">
                            {formatUZS(rew.amount)}
                          </span>
                        </div>
                        <p className="text-slate-600 mt-1 text-[11px] line-clamp-2">
                          {rew.description}
                        </p>
                        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Est. Delivery: {rew.estimatedDelivery}</span>
                          <span className="font-mono-numbers">{rew.claimedCount} claimed</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amount Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  {project.model === 'equity' ? 'Select Investment Amount (UZS)' : 'Contribution Amount (UZS)'}
                </label>

                {/* Presets */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(project.model === 'equity' 
                    ? [2_500_000, 5_000_000, 10_000_000] 
                    : [100_000, 350_000, 850_000]
                  ).map(amt => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => handlePresetSelect(amt)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        !isCustom && selectedAmount === amt
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {formatUZS(amt, true)}
                    </button>
                  ))}
                </div>

                {/* Custom input */}
                <div>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter custom amount in UZS..."
                      value={isCustom ? customAmountStr : ''}
                      onChange={handleCustomChange}
                      className={`w-full px-3 py-2.5 rounded-lg border text-sm font-mono-numbers text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all ${
                        isCustom ? 'border-emerald-500 bg-white ring-1 ring-emerald-500' : 'border-slate-200 bg-slate-50'
                      }`}
                    />
                    <span className="absolute right-3 top-2.5 text-xs font-semibold text-slate-400">
                      UZS
                    </span>
                  </div>
                </div>
              </div>

              {/* Equity calculation banner */}
              {project.model === 'equity' && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Simulated Investor Pool Share:</span>
                    <span className="font-bold text-slate-900 font-mono-numbers text-sm text-emerald-700">
                      ~{calculatedShare}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Based on your ticket relative to the {formatUZS(project.targetAmount, true)} target.
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeContributionModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={finalAmount <= 0}
                  onClick={() => setStep(project.model === 'equity' ? 'terms' : 'payment')}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'terms' && (
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Musharakah Profit-Sharing Terms & Risk Disclosure
              </h4>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs text-slate-700">
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Investment Ticket:</span>
                  <strong className="text-slate-900 font-mono-numbers">{formatUZS(finalAmount)}</strong>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Calculated Profit Share:</span>
                  <strong className="text-emerald-700 font-mono-numbers">~{calculatedShare}% of net profits</strong>
                </div>
                <div className="flex justify-between pb-2 border-b border-slate-200">
                  <span className="text-slate-500">Contractual Framework:</span>
                  <strong className="text-slate-900">Shariah-Compliant Musharakah</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Distributions:</span>
                  <strong className="text-slate-900">{project.equityTerms?.distributionSchedule}</strong>
                </div>
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                <p className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Important Entrepreneurial Risk Notice:</span>
                </p>
                <p className="text-[11px] leading-relaxed">
                  Musharakah is a genuine profit-and-loss sharing partnership, NOT a guaranteed interest loan or bank deposit. Returns depend upon commercial business performance and audited quarterly earnings.
                </p>
              </div>

              <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={agreedToRisk}
                  onChange={(e) => setAgreedToRisk(e.target.checked)}
                  className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>
                  I understand that this is a simulated equity investment on Fundy under Musharakah principles, subject to business performance risks.
                </span>
              </label>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('amount')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={!agreedToRisk}
                  onClick={() => setStep('payment')}
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-40 rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Accept & Continue</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 'payment' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between items-center">
                <span className="text-slate-600">Simulated Total:</span>
                <span className="text-base font-bold text-slate-900 font-mono-numbers">
                  {formatUZS(finalAmount)}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Select Simulated Uzbek Payment Channel
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'Click', label: 'Click (Simulated)' },
                    { id: 'Payme', label: 'Payme (Simulated)' },
                    { id: 'Uzcard', label: 'Uzcard (Simulated)' },
                    { id: 'Humo', label: 'Humo (Simulated)' }
                  ].map(method => (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => setPaymentMethod(method.id as typeof paymentMethod)}
                      className={`p-3 rounded-lg border text-left text-xs font-medium transition-all flex items-center gap-2 cursor-pointer ${
                        paymentMethod === method.id
                          ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-semibold'
                          : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <CreditCard className="w-4 h-4 text-emerald-600" />
                      <span>{method.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-100 p-2.5 rounded-lg">
                Simulation Notice: Clicking confirm will immediately update project funding statistics and add this transaction to your simulated Backer/Investor portfolio.
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(project.model === 'equity' ? 'terms' : 'amount')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800"
                >
                  Back
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirm}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Simulating Transaction...' : `Confirm ${formatUZS(finalAmount, true)}`}
                </button>
              </div>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4 space-y-4">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Simulated Contribution Confirmed!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  Thank you for testing Fundy. Your simulated pledge of{' '}
                  <strong className="text-slate-900 font-mono-numbers">{formatUZS(finalAmount)}</strong> has been recorded in the platform's local database.
                </p>
              </div>

              {project.model === 'equity' && (
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-900 max-w-xs mx-auto">
                  <span className="font-semibold">Simulated Equity Share:</span> ~{calculatedShare}% of net profits
                </div>
              )}

              {chosenReward && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 max-w-xs mx-auto text-left">
                  <p className="font-semibold text-slate-900">Reward Assigned:</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{chosenReward.title}</p>
                  <p className="text-[10px] text-slate-400 mt-1">Est. Delivery: {chosenReward.estimatedDelivery}</p>
                </div>
              )}

              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    closeContributionModal();
                    navigateTo('backer-dashboard');
                  }}
                  className="w-full sm:w-auto px-5 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors cursor-pointer"
                >
                  View in Backer Dashboard
                </button>
                <button
                  type="button"
                  onClick={closeContributionModal}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                >
                  Back to Project
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
