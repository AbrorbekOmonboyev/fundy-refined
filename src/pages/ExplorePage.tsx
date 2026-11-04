import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ProjectCard } from '../components/ProjectCard';
import { CrowdfundingModel, ProjectCategory } from '../types';
import { Search, Filter, SlidersHorizontal, ArrowUpDown, X } from 'lucide-react';

const CATEGORIES: ('All' | ProjectCategory)[] = [
  'All',
  'Agriculture',
  'Technology',
  'Artisanal & Crafts',
  'Education',
  'Clean Energy',
  'Social Impact'
];

export const ExplorePage: React.FC = () => {
  const { projects } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | ProjectCategory>('All');
  const [selectedModel, setSelectedModel] = useState<'All' | CrowdfundingModel>('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'funded'>('all');
  const [sortBy, setSortBy] = useState<'most_funded' | 'ending_soon' | 'newest' | 'target_low'>('most_funded');

  // Filter and sort
  const filteredProjects = useMemo(() => {
    return projects
      .filter(p => {
        // Search
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchTagline = p.tagline.toLowerCase().includes(q);
          const matchFounder = p.founder.name.toLowerCase().includes(q);
          const matchLocation = p.location.toLowerCase().includes(q);
          const matchCat = p.category.toLowerCase().includes(q);
          if (!matchTitle && !matchTagline && !matchFounder && !matchLocation && !matchCat) {
            return false;
          }
        }

        // Category
        if (selectedCategory !== 'All' && p.category !== selectedCategory) {
          return false;
        }

        // Model
        if (selectedModel !== 'All' && p.model !== selectedModel) {
          return false;
        }

        // Status
        if (selectedStatus === 'active' && p.status !== 'active') return false;
        if (selectedStatus === 'funded' && p.status !== 'funded') return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'most_funded') {
          return (b.raisedAmount / b.targetAmount) - (a.raisedAmount / a.targetAmount);
        }
        if (sortBy === 'ending_soon') {
          return a.daysRemaining - b.daysRemaining;
        }
        if (sortBy === 'newest') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === 'target_low') {
          return a.targetAmount - b.targetAmount;
        }
        return 0;
      });
  }, [projects, searchQuery, selectedCategory, selectedModel, selectedStatus, sortBy]);

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedModel('All');
    setSelectedStatus('all');
    setSortBy('most_funded');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedModel !== 'All' || selectedStatus !== 'all';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
      {/* Page Header */}
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Explore Projects in Uzbekistan
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Discover vetted initiatives across agriculture, tech, crafts, and green energy powered by interest-free community capital.
        </p>
      </div>

      {/* Control Bar: Search, Model Filters, Sorting */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search by project, founder, city (e.g. Fergana, Samarkand)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs rounded-lg border border-slate-200 bg-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Model Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
            {[
              { id: 'All', label: 'All Models' },
              { id: 'equity', label: 'Musharakah Equity' },
              { id: 'reward', label: 'Rewards' },
              { id: 'donation', label: 'Donations' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedModel(tab.id as any)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors cursor-pointer ${
                  selectedModel === tab.id
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 shrink-0">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="text-xs font-medium bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="most_funded">Most Funded (%)</option>
              <option value="ending_soon">Ending Soon</option>
              <option value="newest">Recently Launched</option>
              <option value="target_low">Target Goal (Lowest)</option>
            </select>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 border-t border-slate-100">
          <span className="text-xs text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Category:</span>
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium ml-auto shrink-0 flex items-center gap-1 p-1"
            >
              <X className="w-3 h-3" />
              <span>Clear filters</span>
            </button>
          )}
        </div>
      </div>

      {/* Results Count Header */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <span>
          Showing <strong className="text-slate-800 font-mono-numbers">{filteredProjects.length}</strong> of{' '}
          <strong className="text-slate-800 font-mono-numbers">{projects.length}</strong> campaigns
        </span>
        <span className="text-slate-400">Currency: Uzbek So'm (UZS)</span>
      </div>

      {/* Projects Grid or Empty State */}
      {filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">No campaigns found</h3>
            <p className="text-xs text-slate-500 mt-1">
              We couldn't find any projects matching your current search or filter combination.
            </p>
          </div>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
};
