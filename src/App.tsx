/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { DemoBanner } from './components/DemoBanner';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SimulateContributionModal } from './components/SimulateContributionModal';

// Pages
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { ProjectDetailPage } from './pages/ProjectDetailPage';
import { StartProjectPage } from './pages/StartProjectPage';
import { FounderDashboardPage } from './pages/FounderDashboardPage';
import { BackerDashboardPage } from './pages/BackerDashboardPage';
import { EducationPage } from './pages/EducationPage';
import { TrustSafetyPage } from './pages/TrustSafetyPage';

const AppContent: React.FC = () => {
  const { currentPage } = useApp();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      {/* Demonstration Banner */}
      <DemoBanner />

      {/* Primary Top Bar */}
      <Header />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentPage === 'home' && <HomePage />}
        {currentPage === 'explore' && <ExplorePage />}
        {currentPage === 'project-detail' && <ProjectDetailPage />}
        {currentPage === 'start-project' && <StartProjectPage />}
        {currentPage === 'founder-dashboard' && <FounderDashboardPage />}
        {currentPage === 'backer-dashboard' && <BackerDashboardPage />}
        {currentPage === 'education' && <EducationPage />}
        {currentPage === 'trust-safety' && <TrustSafetyPage />}
      </main>

      {/* Global Interactive Modal */}
      <SimulateContributionModal />

      {/* Comprehensive Footer */}
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
