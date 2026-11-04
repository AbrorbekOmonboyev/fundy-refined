import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, Contribution, NotificationItem, ProjectUpdate, ProjectComment } from '../types';
import { INITIAL_PROJECTS } from '../data/mockProjects';

export type PageView = 
  | 'home' 
  | 'explore' 
  | 'project-detail' 
  | 'start-project' 
  | 'founder-dashboard' 
  | 'backer-dashboard' 
  | 'education' 
  | 'trust-safety';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'backer' | 'founder';
  city: string;
  balanceUZS: number;
}

interface AppContextType {
  projects: Project[];
  currentPage: PageView;
  selectedProjectId: string | null;
  savedProjectIds: string[];
  contributions: Contribution[];
  notifications: NotificationItem[];
  userProfile: UserProfile;
  contributionModalProject: Project | null;
  selectedRewardId: string | null;
  
  // Navigation
  navigateTo: (page: PageView, projectId?: string) => void;
  
  // Interactions
  toggleSaveProject: (projectId: string) => void;
  openContributionModal: (project: Project, rewardId?: string) => void;
  closeContributionModal: () => void;
  recordContribution: (params: {
    projectId: string;
    amount: number;
    paymentMethod: 'Click' | 'Payme' | 'Uzcard' | 'Humo' | 'Bank Wire';
    rewardId?: string;
    rewardTitle?: string;
  }) => void;
  
  // Founder actions
  addNewProject: (projectData: Partial<Project>) => string;
  publishProjectUpdate: (projectId: string, title: string, content: string) => void;
  addProjectComment: (projectId: string, content: string) => void;
  
  // Profile Switcher (Backer vs Founder perspective)
  setUserRole: (role: 'backer' | 'founder') => void;
  markNotificationsAsRead: () => void;
  resetToDefaultData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_PROJECTS = 'fundy_projects_v1';
const LOCAL_STORAGE_KEY_SAVED = 'fundy_saved_ids_v1';
const LOCAL_STORAGE_KEY_CONTRIBUTIONS = 'fundy_contributions_v1';

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load initial projects from localStorage or default
  const [projects, setProjects] = useState<Project[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_PROJECTS);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch {
      // fallback
    }
    return INITIAL_PROJECTS;
  });

  const [savedProjectIds, setSavedProjectIds] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_SAVED);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return ['project-1', 'project-2'];
  });

  const [contributions, setContributions] = useState<Contribution[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY_CONTRIBUTIONS);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }
    return [
      {
        id: 'contrib-demo-1',
        projectId: 'project-1',
        projectTitle: 'AgroSmart Fergana: Solar-Powered Hydroponic Greenhouses',
        projectModel: 'equity',
        amount: 15_000_000,
        date: '2026-10-25',
        equityShare: 1.75,
        simulatedPaymentMethod: 'Click',
        status: 'Confirmed (Simulated)'
      },
      {
        id: 'contrib-demo-2',
        projectId: 'project-2',
        projectTitle: 'SilkRoad Artisan Studio: Preserving Samarkand Ikat & Ceramics',
        projectModel: 'reward',
        amount: 850_000,
        date: '2026-10-27',
        rewardId: 'r-2',
        rewardTitle: 'Hand-Woven Pure Silk Ikat Scarf (180x50cm)',
        simulatedPaymentMethod: 'Payme',
        status: 'Confirmed (Simulated)'
      }
    ];
  });

  const [currentPage, setCurrentPage] = useState<PageView>('home');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>('project-1');
  const [contributionModalProject, setContributionModalProject] = useState<Project | null>(null);
  const [selectedRewardId, setSelectedRewardId] = useState<string | null>(null);

  const [userProfile, setUserProfile] = useState<UserProfile>({
    id: 'user-alisher',
    name: 'Alisher Vohidov',
    email: 'alisher.v@example.uz',
    role: 'backer',
    city: 'Tashkent',
    balanceUZS: 50_000_000
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      title: 'Milestone Disbursed',
      message: 'AgroSmart Fergana completed Milestone 2 (Solar Commissioning). 40% funds released.',
      time: '2 hours ago',
      read: false,
      type: 'milestone'
    },
    {
      id: 'notif-2',
      title: 'Reward Production Update',
      message: 'Samarkand Artisan Studio completed first test firing of electric kilns.',
      time: '1 day ago',
      read: false,
      type: 'project'
    },
    {
      id: 'notif-3',
      title: 'New Musharakah Opportunity',
      message: 'Andijan Mobility Electric Trikes opened for community equity participation.',
      time: '3 days ago',
      read: true,
      type: 'system'
    }
  ]);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_PROJECTS, JSON.stringify(projects));
    } catch (e) {
      console.warn('Failed to save projects to localStorage', e);
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_SAVED, JSON.stringify(savedProjectIds));
    } catch (e) {
      console.warn('Failed to save bookmarks to localStorage', e);
    }
  }, [savedProjectIds]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CONTRIBUTIONS, JSON.stringify(contributions));
    } catch (e) {
      console.warn('Failed to save contributions to localStorage', e);
    }
  }, [contributions]);

  const navigateTo = (page: PageView, projectId?: string) => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSaveProject = (projectId: string) => {
    setSavedProjectIds(prev => 
      prev.includes(projectId) 
        ? prev.filter(id => id !== projectId) 
        : [...prev, projectId]
    );
  };

  const openContributionModal = (project: Project, rewardId?: string) => {
    setContributionModalProject(project);
    setSelectedRewardId(rewardId || null);
  };

  const closeContributionModal = () => {
    setContributionModalProject(null);
    setSelectedRewardId(null);
  };

  const recordContribution = ({
    projectId,
    amount,
    paymentMethod,
    rewardId,
    rewardTitle
  }: {
    projectId: string;
    amount: number;
    paymentMethod: 'Click' | 'Payme' | 'Uzcard' | 'Humo' | 'Bank Wire';
    rewardId?: string;
    rewardTitle?: string;
  }) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;

    let equityShare: number | undefined = undefined;
    if (project.model === 'equity' && project.equityTerms) {
      // Calculate share proportion
      const share = (amount / project.targetAmount) * project.equityTerms.investorProfitSharePercent;
      equityShare = parseFloat(share.toFixed(2));
    }

    const newContribution: Contribution = {
      id: `contrib-${Date.now()}`,
      projectId,
      projectTitle: project.title,
      projectModel: project.model,
      amount,
      date: new Date().toISOString().split('T')[0],
      rewardId,
      rewardTitle,
      equityShare,
      simulatedPaymentMethod: paymentMethod,
      status: 'Confirmed (Simulated)'
    };

    setContributions(prev => [newContribution, ...prev]);

    // Update project raised amount and backer count
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newRaised = p.raisedAmount + amount;
        return {
          ...p,
          raisedAmount: newRaised,
          backerCount: p.backerCount + 1,
          status: newRaised >= p.targetAmount ? 'funded' : p.status
        };
      }
      return p;
    }));

    // Add notification
    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Contribution Successful',
        message: `Your simulated support of ${amount.toLocaleString()} UZS to "${project.title}" has been recorded.`,
        time: 'Just now',
        read: false,
        type: 'contribution'
      },
      ...prev
    ]);
  };

  const addNewProject = (projectData: Partial<Project>): string => {
    const newId = `project-user-${Date.now()}`;
    const slug = (projectData.title || 'new-project')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .slice(0, 40);

    const fullProject: Project = {
      id: newId,
      slug,
      title: projectData.title || 'Untitled Project',
      tagline: projectData.tagline || 'Community project in Uzbekistan',
      description: projectData.description || '',
      story: projectData.story || projectData.description || '',
      model: projectData.model || 'reward',
      category: projectData.category || 'Technology',
      location: projectData.location || 'Tashkent, Uzbekistan',
      imageUrl: projectData.imageUrl || '/images/hero_fundy_fintech_1793748701470.jpg',
      targetAmount: projectData.targetAmount || 50_000_000,
      raisedAmount: 0,
      backerCount: 0,
      daysRemaining: projectData.daysRemaining || 30,
      status: 'pending_review',
      featured: false,
      founder: projectData.founder || {
        id: `f-${Date.now()}`,
        name: userProfile.name,
        role: 'Creator & Lead',
        organization: 'Independent Initiative',
        location: projectData.location || 'Tashkent, Uzbekistan',
        verifiedIdentity: true,
        tinOrRegistration: 'Pending Municipal Verification',
        bio: 'Founder on Fundy platform.',
        experienceYears: 4
      },
      budgetBreakdown: projectData.budgetBreakdown || [
        { id: 'b-init-1', category: 'Direct Production Equipment', amount: (projectData.targetAmount || 50_000_000) * 0.7, description: 'Core hardware & tooling', percentage: 70 },
        { id: 'b-init-2', category: 'Operational & Packaging', amount: (projectData.targetAmount || 50_000_000) * 0.3, description: 'Logistics and execution', percentage: 30 }
      ],
      milestones: projectData.milestones || [
        { id: 'm-init-1', title: 'Phase 1 Tooling & Setup', description: 'Procure primary supplies', targetMonth: 'Month 1', fundReleasePercentage: 50, completed: false },
        { id: 'm-init-2', title: 'Phase 2 Deliveries & Impact', description: 'Deliver to community', targetMonth: 'Month 3', fundReleasePercentage: 50, completed: false }
      ],
      rewards: projectData.rewards,
      equityTerms: projectData.equityTerms,
      evaluation: {
        overallScore: 88,
        businessPlanScore: 18,
        teamScore: 18,
        marketScore: 17,
        financialScore: 18,
        riskScore: 17,
        status: 'In Review',
        lastEvaluatedDate: new Date().toISOString().split('T')[0],
        summaryNotes: 'Newly submitted campaign undergoing initial Shariah ethical compliance audit and identity verification checks.',
        keyStrengths: ['Clear community focus', 'Coherent budget outline'],
        keyRisks: ['Early stage roadmap execution verification needed']
      },
      risksAndChallenges: projectData.risksAndChallenges || 'Project execution is dependent on timely supplier deliveries within Uzbekistan.',
      updates: [],
      comments: [],
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProjects(prev => [fullProject, ...prev]);

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Project Submitted for Review',
        message: `"${fullProject.title}" has been successfully submitted and is under verification in your Founder Dashboard.`,
        time: 'Just now',
        read: false,
        type: 'system'
      },
      ...prev
    ]);

    return newId;
  };

  const publishProjectUpdate = (projectId: string, title: string, content: string) => {
    const newUpdate: ProjectUpdate = {
      id: `u-${Date.now()}`,
      title,
      content,
      date: new Date().toISOString().split('T')[0],
      author: userProfile.name,
      likesCount: 0
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          updates: [newUpdate, ...p.updates]
        };
      }
      return p;
    }));

    setNotifications(prev => [
      {
        id: `notif-${Date.now()}`,
        title: 'Update Published',
        message: `Your project update "${title}" was published to all backers.`,
        time: 'Just now',
        read: false,
        type: 'project'
      },
      ...prev
    ]);
  };

  const addProjectComment = (projectId: string, content: string) => {
    const newComment: ProjectComment = {
      id: `c-${Date.now()}`,
      authorName: userProfile.name,
      authorCity: userProfile.city,
      date: new Date().toISOString().split('T')[0],
      content,
      isBacker: contributions.some(c => c.projectId === projectId)
    };

    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return {
          ...p,
          comments: [newComment, ...p.comments]
        };
      }
      return p;
    }));
  };

  const setUserRole = (role: 'backer' | 'founder') => {
    setUserProfile(prev => ({
      ...prev,
      role,
      name: role === 'founder' ? 'Azizbek Rakhimov' : 'Alisher Vohidov',
      city: role === 'founder' ? 'Fergana' : 'Tashkent'
    }));
  };

  const markNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const resetToDefaultData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_PROJECTS);
    localStorage.removeItem(LOCAL_STORAGE_KEY_SAVED);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CONTRIBUTIONS);
    setProjects(INITIAL_PROJECTS);
    setSavedProjectIds(['project-1', 'project-2']);
    setContributions([
      {
        id: 'contrib-demo-1',
        projectId: 'project-1',
        projectTitle: 'AgroSmart Fergana: Solar-Powered Hydroponic Greenhouses',
        projectModel: 'equity',
        amount: 15_000_000,
        date: '2026-10-25',
        equityShare: 1.75,
        simulatedPaymentMethod: 'Click',
        status: 'Confirmed (Simulated)'
      }
    ]);
  };

  return (
    <AppContext.Provider
      value={{
        projects,
        currentPage,
        selectedProjectId,
        savedProjectIds,
        contributions,
        notifications,
        userProfile,
        contributionModalProject,
        selectedRewardId,
        navigateTo,
        toggleSaveProject,
        openContributionModal,
        closeContributionModal,
        recordContribution,
        addNewProject,
        publishProjectUpdate,
        addProjectComment,
        setUserRole,
        markNotificationsAsRead,
        resetToDefaultData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
