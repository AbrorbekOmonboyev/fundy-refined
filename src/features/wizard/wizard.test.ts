import { describe, expect, it } from 'vitest';
import { slugify } from '@/features/wizard/slug';
import { MIN_STORY, founderGaps, stepComplete, type Step } from '@/features/wizard/checks';
import { allowedModels, modelAllowed } from '@/features/wizard/organizer';
import type { Draft } from '@/features/wizard/api';

describe('web address from a title', () => {
  it('handles Uzbek apostrophes in every form', () => {
    expect(slugify("Farg'ona issiqxonasi")).toBe('fargona-issiqxonasi');
    expect(slugify('Fargʻona issiqxonasi')).toBe('fargona-issiqxonasi');
    expect(slugify('Farg‘ona issiqxonasi')).toBe('fargona-issiqxonasi');
  });

  it('turns Cyrillic into Latin letters', () => {
    expect(slugify('Тёплица в Нукусе')).toBe('tyoplitsa-v-nukuse');
  });

  it('keeps addresses short and clean', () => {
    const slug = slugify('A very long title! '.repeat(10));
    expect(slug.length).toBeLessThanOrEqual(60);
    expect(slug).not.toMatch(/^-|-$/);
  });
});

/** A complete donation project; tests break one part at a time. */
function draft(): Draft {
  return {
    project: {
      organizer_type: 'individual',
      model: 'donation',
      target_amount: 10_000_000,
      cover_image_path: 'u/p/cover.jpg',
      status: 'draft',
    },
    text: { title: 'Clean water for Nukus', tagline: 'Wells for 3 villages', story: 'x'.repeat(MIN_STORY) },
    budget: [
      { category: 'equipment', description: 'Pumps', amount: 6_000_000 },
      { category: 'labor', description: 'Drilling', amount: 4_000_000 },
    ],
    milestones: [
      { title: 'Drill', description: '', target_label: 'Month 1', release_percent: 60 },
      { title: 'Finish', description: '', target_label: 'Month 3', release_percent: 40 },
    ],
    rewards: [],
    equity: null,
    documents: [{ kind: 'identity' }],
    founder: { display_name: 'Aziz' },
  } as unknown as Draft;
}

describe('project wizard checks', () => {
  it('a full draft is ready to submit', () => {
    expect(stepComplete(draft(), 'review')).toBe(true);
  });

  const broken: [Step, (d: Draft) => void][] = [
    ['basics', d => (d.text!.title = 'Hi')],
    ['story', d => (d.text!.story = 'too short')],
    ['story', d => (d.project.cover_image_path = null)],
    ['budget', d => (d.budget[0].amount = 1)],
    ['milestones', d => (d.milestones[0].release_percent = 50)],
    ['basics', d => (d.project.organizer_type = null)],
    ['founder', d => (d.founder = null)],
    ['founder', d => (d.documents = [])],
  ];
  it.each(broken)('flags a problem in "%s"', (step, breakIt) => {
    const d = draft();
    breakIt(d);
    expect(stepComplete(d, step)).toBe(false);
    expect(stepComplete(d, 'review')).toBe(false);
  });

  it('a reward project needs at least one reward', () => {
    const d = draft();
    d.project.model = 'reward';
    expect(stepComplete(d, 'terms')).toBe(false);
  });
});

describe('who is raising the money', () => {
  it('musharakah only for a company, non-profits run donations', () => {
    expect(modelAllowed('individual', 'equity')).toBe(false);
    expect(modelAllowed('yatt', 'equity')).toBe(false);
    expect(modelAllowed('mchj', 'equity')).toBe(true);
    expect(allowedModels('ngo')).toEqual(['donation']);
  });

  it('a person applies with a passport only', () => {
    expect(founderGaps(draft())).toEqual([]);
  });

  it('a registered organiser also needs the number and the certificate', () => {
    const d = draft();
    d.project.organizer_type = 'yatt';
    expect(founderGaps(d)).toEqual(['registrationNumber', 'registrationDocument']);
    d.founder!.registration_number = 'YaTT 4012345';
    d.documents.push({ kind: 'registration' } as Draft['documents'][number]);
    expect(founderGaps(d)).toEqual([]);
  });
});
