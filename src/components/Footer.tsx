import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  const { navigateTo } = useApp();

  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                F
              </span>
              <span className="text-xl font-bold tracking-tight text-white">
                Fundy
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Uzbekistan's transparent, interest-free crowdfunding ecosystem. Connecting visionary entrepreneurs, artisans, and social champions with community backers through Donations, Rewards, and Musharakah profit-sharing.
            </p>
            <div className="pt-2 flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Simulated Prototype · Built for the Uzbekistan Tech Ecosystem</span>
            </div>
          </div>

          {/* Crowdfunding Models */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Models
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('explore')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Donation-Based
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('explore')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Reward-Based Perks
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('education')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Musharakah (Equity)
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('education')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Profit-Sharing Calculator
                </button>
              </li>
            </ul>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Platform
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('explore')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Discover Projects
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('start-project')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Start a Campaign
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('founder-dashboard')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Founder Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('backer-dashboard')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Backer Dashboard
                </button>
              </li>
            </ul>
          </div>

          {/* Trust & Legal */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">
              Trust & Safety
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => navigateTo('trust-safety')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Verification Standards
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('trust-safety')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  AI Project Evaluation
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('trust-safety')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Risk Disclosures
                </button>
              </li>
              <li>
                <button
                  onClick={() => navigateTo('trust-safety')}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  Prototype Terms & Privacy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© 2026 Fundy Platform (Demonstration Prototype). All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
            <span>for entrepreneurs across Uzbekistan.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
