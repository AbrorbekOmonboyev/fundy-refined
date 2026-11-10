/** The long-form content pages. Their text lives in src/content/*.ts. */
import { ArticlePage } from '@/components/ArticlePage';
import { HowItWorks } from '@/features/education/HowItWorks';
import { MusharakahCalculator } from '@/features/education/MusharakahCalculator';
import { about } from '@/content/about';
import { education } from '@/content/education';
import { giving } from '@/content/giving';
import { DONATION_ONLY } from '@/lib/focus';
import { privacy } from '@/content/privacy';
import { terms } from '@/content/terms';
import { trust } from '@/content/trust';

export const AboutPage = () => <ArticlePage content={about} showContents={false} />;
export const TrustSafetyPage = () => <ArticlePage content={trust} />;
export const TermsPage = () => <ArticlePage content={terms} />;
export const PrivacyPage = () => <ArticlePage content={privacy} />;
export const EducationPage = () =>
  DONATION_ONLY ? (
    <ArticlePage content={giving}>
      <HowItWorks />
    </ArticlePage>
  ) : (
    <ArticlePage content={education}>
      <HowItWorks />
      <MusharakahCalculator />
    </ArticlePage>
  );
