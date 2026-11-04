import React from 'react';
import { useApp } from '../context/AppContext';
import { ShieldCheck, UserCheck, RefreshCw } from 'lucide-react';

export const DemoBanner: React.FC = () => {
  const { userProfile, setUserRole, resetToDefaultData } = useApp();

  return (
    <aside aria-label="Prototype Notice" className="bg-slate-900 text-slate-300 border-b border-slate-800 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium text-slate-200">Demonstration Prototype:</span>
          <span className="text-slate-400 hidden sm:inline">
            Designed for the Uzbekistan market. All transactions, profit distributions, and projects are simulations.
          </span>
          <span className="text-slate-400 sm:hidden">
            Uzbekistan simulation (UZS).
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-1.5 bg-slate-800/80 rounded-md px-2 py-1 border border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-slate-400">View as:</span>
            <button
              onClick={() => setUserRole('backer')}
              className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
                userProfile.role === 'backer'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Backer
            </button>
            <span className="text-slate-600">/</span>
            <button
              onClick={() => setUserRole('founder')}
              className={`px-1.5 py-0.5 rounded text-xs font-medium transition-colors ${
                userProfile.role === 'founder'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              Founder
            </button>
          </div>

          <button
            onClick={() => {
              if (window.confirm('Reset prototype data to original demo state?')) {
                resetToDefaultData();
              }
            }}
            title="Reset simulated data"
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 transition-colors p-1"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
