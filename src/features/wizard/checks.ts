/**
 * Which wizard steps are complete. Mirrors the checks in submit_project()
 * (supabase/migrations/*_functions.sql) so founders see problems before submitting.
 */
import type { Draft } from '@/features/wizard/api';

export const STEPS = ['basics', 'story', 'budget', 'milestones', 'terms', 'founder', 'review'] as const;
export type Step = (typeof STEPS)[number];

export const MIN_TARGET = 1_000_000;
export const MAX_TARGET = 100_000_000_000;
export const MIN_STORY = 200;

export const budgetTotal = (d: Draft) => d.budget.reduce((s, b) => s + b.amount, 0);
export const releaseTotal = (d: Draft) => d.milestones.reduce((s, m) => s + Number(m.release_percent), 0);

export function stepComplete(d: Draft, step: Step): boolean {
  switch (step) {
    case 'basics':
      return !!d.text && d.text.title.trim().length >= 5 && d.text.tagline.trim().length > 0;
    case 'story':
      return !!d.text && d.text.story.trim().length >= MIN_STORY && !!d.project.cover_image_path;
    case 'budget':
      return d.budget.length > 0 && budgetTotal(d) === d.project.target_amount;
    case 'milestones':
      return d.milestones.length > 0 && Math.abs(releaseTotal(d) - 100) < 0.001;
    case 'terms':
      if (d.project.model === 'reward') return d.rewards.length > 0;
      if (d.project.model === 'equity') return !!d.equity;
      return true;
    case 'founder':
      return !!d.founder;
    case 'review':
      return STEPS.filter(s => s !== 'review').every(s => stepComplete(d, s));
  }
}

export const isEditable = (d: Draft) => d.project.status === 'draft' || d.project.status === 'changes_requested';
