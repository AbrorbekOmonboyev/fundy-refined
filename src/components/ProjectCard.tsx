import React from 'react';
import { Project } from '@/types';
import { useApp } from '@/context/AppContext';
import { formatUZS, formatPercentage, getModelLabel } from '@/lib/formatters';
import { Bookmark, CheckCircle, Users, ArrowUpRight } from 'lucide-react';

interface ProjectCardProps {
  project: Project;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  const { navigateTo, savedProjectIds, toggleSaveProject, openContributionModal } = useApp();
  const isSaved = savedProjectIds.includes(project.id);
  const percentage = formatPercentage(project.raisedAmount, project.targetAmount);

  return (
    <article className="group bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col hover:border-slate-300 hover:shadow-md transition-all duration-200">
      {/* Cover Image Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <img
          src={project.imageUrl}
          alt={project.title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // High-fidelity SVG fallback if image fails
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
        
        {/* Top actions overlay */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 z-10">
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleSaveProject(project.id);
            }}
            title={isSaved ? 'Remove bookmark' : 'Bookmark project'}
            aria-label={isSaved ? 'Remove bookmark' : 'Bookmark project'}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm shadow-sm flex items-center justify-center text-slate-700 hover:text-rose-600 transition-colors cursor-pointer"
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Model quiet text overlay */}
        <div className="absolute bottom-2 left-3 z-10">
          <span className="text-[11px] font-semibold text-white px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-sm">
            {getModelLabel(project.model)}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Discipline: clean unboxed text with subtle separators */}
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
            <span>{project.category}</span>
            <span aria-hidden="true">·</span>
            <span>{project.location.split(',')[0]}</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-numbers">{project.daysRemaining} days left</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => navigateTo('project-detail', project.id)}
            className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 cursor-pointer leading-snug"
          >
            {project.title}
          </h3>

          {/* Tagline */}
          <p className="mt-2 text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {project.tagline}
          </p>

          {/* Founder line */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
            <span>by <strong className="font-medium text-slate-800">{project.founder.name}</strong></span>
            {project.founder.verifiedIdentity && (
              <span title="Identity Verified by Fundy" className="inline-flex items-center text-emerald-600">
                <CheckCircle className="w-3.5 h-3.5" />
              </span>
            )}
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span className="text-[11px] text-slate-500 font-mono-numbers">
              Score: <strong className="font-semibold text-slate-700">{project.evaluation.overallScore}/100</strong>
            </span>
          </div>
        </div>

        {/* Financial Progress Section */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          {/* Progress bar */}
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden mb-2.5">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentage >= 100 ? 'bg-emerald-600' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>

          {/* Financial Metrics */}
          <div className="flex items-baseline justify-between text-xs mb-3">
            <div>
              <span className="font-bold text-slate-900 font-mono-numbers text-sm">
                {formatUZS(project.raisedAmount, true)}
              </span>
              <span className="text-slate-500 text-[11px] ml-1">
                of {formatUZS(project.targetAmount, true)}
              </span>
            </div>
            <span className="font-bold text-emerald-700 font-mono-numbers">
              {percentage}%
            </span>
          </div>

          {/* Card footer details: backers + quick support button */}
          <div className="flex items-center justify-between text-xs pt-1">
            <div className="flex items-center gap-1 text-slate-500 font-mono-numbers">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{project.backerCount} backers</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  openContributionModal(project);
                }}
                className="px-2.5 py-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
              >
                {project.model === 'equity' ? 'Invest' : 'Back'}
              </button>
              
              <button
                onClick={() => navigateTo('project-detail', project.id)}
                className="p-1 text-slate-400 hover:text-slate-700 transition-colors"
                title="View full project details"
                aria-label={`View full details for ${project.title}`}
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
