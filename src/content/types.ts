/**
 * Long-form page content (About, Trust & Safety, Terms, Privacy, Education).
 * Each page file exports one Article per language — edit the text there.
 */
import type { Language } from '@/i18n';

export type Section = {
  /** Used for the #anchor link, e.g. "data-we-collect". Same in every language. */
  id: string;
  heading: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type Article = {
  kicker: string;
  title: string;
  intro: string;
  /** Shown as a warning box, e.g. "Draft — to be reviewed by a lawyer". */
  draftNote?: string;
  /** ISO date the text was last changed. */
  updated?: string;
  sections: Section[];
};

export type Localized<T> = Record<Language, T>;
