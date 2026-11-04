import { Route, Routes } from 'react-router';
import { useApp } from '@/context/AppContext';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { SimulateContributionModal } from '@/components/SimulateContributionModal';
import { paths } from '@/app/routes';
import { ScrollManager } from '@/app/ScrollManager';

import { HomePage } from '@/pages/HomePage';
import { ExplorePage } from '@/pages/ExplorePage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { StartProjectPage } from '@/pages/StartProjectPage';
import { FounderDashboardPage } from '@/pages/FounderDashboardPage';
import { BackerDashboardPage } from '@/pages/BackerDashboardPage';
import { EducationPage } from '@/pages/EducationPage';
import { TrustSafetyPage } from '@/pages/TrustSafetyPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

/** Shows the project page, or 404 if the slug in the URL doesn't match a project. */
function ProjectRoute() {
  const { selectedProjectId } = useApp();
  return selectedProjectId ? <ProjectDetailPage /> : <NotFoundPage />;
}

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <ScrollManager />
      <DemoBanner />
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path={paths.home} element={<HomePage />} />
          <Route path={paths.explore} element={<ExplorePage />} />
          <Route path="/projects/:slug" element={<ProjectRoute />} />
          <Route path={paths.startProject} element={<StartProjectPage />} />
          <Route path={paths.founderDashboard} element={<FounderDashboardPage />} />
          <Route path={paths.backerDashboard} element={<BackerDashboardPage />} />
          <Route path={paths.education} element={<EducationPage />} />
          <Route path={paths.trustSafety} element={<TrustSafetyPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      <SimulateContributionModal />
      <Footer />
    </div>
  );
}
