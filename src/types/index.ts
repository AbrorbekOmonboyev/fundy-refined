export type CrowdfundingModel = 'donation' | 'reward' | 'equity';

export type ProjectCategory = 
  | 'Technology' 
  | 'Agriculture' 
  | 'Artisanal & Crafts' 
  | 'Education' 
  | 'Healthcare' 
  | 'Clean Energy' 
  | 'Food & Culinary' 
  | 'Social Impact';

export type ProjectStatus = 'draft' | 'pending_review' | 'active' | 'funded' | 'completed';

export interface BudgetItem {
  id: string;
  category: string;
  amount: number; // in UZS
  description: string;
  percentage: number;
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  targetMonth: string;
  fundReleasePercentage: number;
  completed: boolean;
}

export interface RewardTier {
  id: string;
  title: string;
  amount: number; // in UZS
  description: string;
  items: string[];
  estimatedDelivery: string;
  claimedCount: number;
  availableCount?: number;
}

export interface EquityTerms {
  investorProfitSharePercent: number; // e.g. 25% of net profits
  founderProfitSharePercent: number; // e.g. 75%
  minInvestment: number; // in UZS
  projectedAnnualReturn: string; // e.g. "18% - 24% target"
  contractType: 'Musharakah' | 'Mudarabah';
  distributionSchedule: 'Quarterly' | 'Bi-Annually' | 'Annually';
  exitHorizonYears: number;
}

export interface ProjectEvaluation {
  overallScore: number; // out of 100
  businessPlanScore: number; // out of 20
  teamScore: number; // out of 20
  marketScore: number; // out of 20
  financialScore: number; // out of 20
  riskScore: number; // out of 20 (lower risk = higher score)
  status: 'Verified High Confidence' | 'Verified Moderate Confidence' | 'In Review';
  lastEvaluatedDate: string;
  summaryNotes: string;
  keyStrengths: string[];
  keyRisks: string[];
}

export interface ProjectUpdate {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  likesCount: number;
}

export interface ProjectComment {
  id: string;
  authorName: string;
  authorCity: string;
  date: string;
  content: string;
  isBacker: boolean;
  reply?: {
    author: string;
    date: string;
    content: string;
  };
}

export interface Founder {
  id: string;
  name: string;
  avatarUrl?: string;
  role: string;
  organization: string;
  location: string; // e.g. "Tashkent, Uzbekistan"
  verifiedIdentity: boolean;
  tinOrRegistration: string; // e.g. "MCHJ #309482710"
  bio: string;
  experienceYears: number;
}

export interface Project {
  id: string;
  slug: string;
  title: string;
  tagline: string;
  description: string;
  story: string;
  model: CrowdfundingModel;
  category: ProjectCategory;
  location: string;
  imageUrl: string;
  targetAmount: number; // in UZS
  raisedAmount: number; // in UZS
  backerCount: number;
  daysRemaining: number;
  status: ProjectStatus;
  featured: boolean;
  founder: Founder;
  budgetBreakdown: BudgetItem[];
  milestones: Milestone[];
  rewards?: RewardTier[];
  equityTerms?: EquityTerms;
  evaluation: ProjectEvaluation;
  risksAndChallenges: string;
  updates: ProjectUpdate[];
  comments: ProjectComment[];
  createdAt: string;
}

export interface Contribution {
  id: string;
  projectId: string;
  projectTitle: string;
  projectModel: CrowdfundingModel;
  amount: number; // in UZS
  date: string;
  rewardId?: string;
  rewardTitle?: string;
  equityShare?: number;
  simulatedPaymentMethod: 'Click' | 'Payme' | 'Uzcard' | 'Humo' | 'Bank Wire';
  status: 'Confirmed (Simulated)' | 'Disbursed to Milestone';
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'project' | 'contribution' | 'milestone' | 'system';
}
