import { Suspense } from 'react';
import { Route, Routes, useLocation } from 'react-router';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { AppTabBar } from '@/components/layout/AppTabBar';
import { paths } from '@/app/routes';
import { ScrollManager } from '@/app/ScrollManager';

import { HomePage } from '@/pages/HomePage';
import { AppHomePage, SavedPage } from '@/features/app/AppScreens';
import { isAppMode } from '@/lib/appMode';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { GuestOnly, RequireAdmin, RequireAuth } from '@/features/auth/guards';
import { page } from '@/app/lazyPage';
import { PageSpinner } from '@/components/ui';

// Every page except Home is downloaded only when it is opened.
const ExplorePage = page(() => import('@/pages/ExplorePage'), 'ExplorePage');
const ProjectDetailPage = page(() => import('@/pages/ProjectDetailPage'), 'ProjectDetailPage');
const StartProjectPage = page(() => import('@/pages/StartProjectPage'), 'StartProjectPage');
const StartLandingPage = page(() => import('@/pages/StartProjectPage'), 'StartLandingPage');
const ProjectEditorPage = page(() => import('@/pages/ProjectEditorPage'), 'ProjectEditorPage');
const FounderDashboardPage = page(() => import('@/pages/FounderDashboardPage'), 'FounderDashboardPage');
const BackerDashboardPage = page(() => import('@/pages/BackerDashboardPage'), 'BackerDashboardPage');
const AboutPage = page(() => import('@/pages/ContentPages'), 'AboutPage');
const EducationPage = page(() => import('@/pages/ContentPages'), 'EducationPage');
const PrivacyPage = page(() => import('@/pages/ContentPages'), 'PrivacyPage');
const TermsPage = page(() => import('@/pages/ContentPages'), 'TermsPage');
const TrustSafetyPage = page(() => import('@/pages/ContentPages'), 'TrustSafetyPage');
const ContactPage = page(() => import('@/pages/ContactPage'), 'ContactPage');
const AdminMessagesPage = page(() => import('@/pages/admin/AdminMessagesPage'), 'AdminMessagesPage');
const AdminMilestonesPage = page(() => import('@/pages/admin/AdminMilestonesPage'), 'AdminMilestonesPage');
const AdminReportsPage = page(() => import('@/pages/admin/AdminReportsPage'), 'AdminReportsPage');
const LoginPage = page(() => import('@/pages/auth/LoginPage'), 'LoginPage');
const SignupPage = page(() => import('@/pages/auth/SignupPage'), 'SignupPage');
const ForgotPasswordPage = page(() => import('@/pages/auth/ForgotPasswordPage'), 'ForgotPasswordPage');
const ResetPasswordPage = page(() => import('@/pages/auth/ResetPasswordPage'), 'ResetPasswordPage');
const AuthCallbackPage = page(() => import('@/pages/auth/AuthCallbackPage'), 'AuthCallbackPage');
const WelcomePage = page(() => import('@/pages/auth/WelcomePage'), 'WelcomePage');
const SettingsPage = page(() => import('@/pages/SettingsPage'), 'SettingsPage');
const AdminPage = page(() => import('@/pages/admin/AdminPage'), 'AdminPage');
const AdminLayout = page(() => import('@/pages/admin/AdminLayout'), 'AdminLayout');
const ReviewQueuePage = page(() => import('@/pages/admin/ReviewQueuePage'), 'ReviewQueuePage');
const ReviewProjectPage = page(() => import('@/pages/admin/ReviewProjectPage'), 'ReviewProjectPage');
const AdminProjectsPage = page(() => import('@/pages/admin/AdminProjectsPage'), 'AdminProjectsPage');
const AdminCommentsPage = page(() => import('@/pages/admin/AdminCommentsPage'), 'AdminCommentsPage');
const AdminUsersPage = page(() => import('@/pages/admin/AdminUsersPage'), 'AdminUsersPage');
const AdminAuditPage = page(() => import('@/pages/admin/AdminAuditPage'), 'AdminAuditPage');

export function App() {
  const { pathname } = useLocation();
  return (
    <div className="min-h-screen flex flex-col bg-page text-ink font-sans">
      <ScrollManager />
      <DemoBanner />
      <Header />

      <main className="flex-1">
        <ErrorBoundary resetKey={pathname}>
          <Suspense fallback={<PageSpinner />}>
            <Routes>
              {/* Inside the Android app the home is a "Discover" screen, not the website's landing page */}
              <Route path={paths.home} element={isAppMode() ? <AppHomePage /> : <HomePage />} />
              <Route path={paths.saved} element={<SavedPage />} />
              <Route path={paths.explore} element={<ExplorePage />} />
              <Route path="/projects/:slug" element={<ProjectDetailPage />} />
              <Route path={paths.education} element={<EducationPage />} />
              <Route path={paths.trustSafety} element={<TrustSafetyPage />} />
              <Route path={paths.about} element={<AboutPage />} />
              <Route path={paths.contact} element={<ContactPage />} />
              <Route path={paths.terms} element={<TermsPage />} />
              <Route path={paths.privacy} element={<PrivacyPage />} />

              <Route path={paths.startProject} element={<StartLandingPage />} />

              {/* Signed-in users only */}
              <Route
                path={paths.newProject}
                element={
                  <RequireAuth>
                    <StartProjectPage />
                  </RequireAuth>
                }
              />
              <Route
                path={paths.founderDashboard}
                element={
                  <RequireAuth>
                    <FounderDashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path="/dashboard/founder/:projectId/:step"
                element={
                  <RequireAuth>
                    <ProjectEditorPage />
                  </RequireAuth>
                }
              />
              <Route
                path={paths.backerDashboard}
                element={
                  <RequireAuth>
                    <BackerDashboardPage />
                  </RequireAuth>
                }
              />
              <Route
                path={paths.settings}
                element={
                  <RequireAuth>
                    <SettingsPage />
                  </RequireAuth>
                }
              />
              <Route
                path={paths.welcome}
                element={
                  <RequireAuth allowUnboarded>
                    <WelcomePage />
                  </RequireAuth>
                }
              />
              <Route
                path={paths.resetPassword}
                element={
                  <RequireAuth allowUnboarded>
                    <ResetPasswordPage />
                  </RequireAuth>
                }
              />
              {/* Admin panel — every page inside requires the admin role */}
              <Route
                path={paths.admin}
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route index element={<AdminPage />} />
                <Route path="review" element={<ReviewQueuePage />} />
                <Route path="review/:projectId" element={<ReviewProjectPage />} />
                <Route path="projects" element={<AdminProjectsPage />} />
                <Route path="comments" element={<AdminCommentsPage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="audit" element={<AdminAuditPage />} />
                <Route path="messages" element={<AdminMessagesPage />} />
                <Route path="milestones" element={<AdminMilestonesPage />} />
                <Route path="reports" element={<AdminReportsPage />} />
              </Route>

              {/* Accounts */}
              <Route
                path={paths.login}
                element={
                  <GuestOnly>
                    <LoginPage />
                  </GuestOnly>
                }
              />
              <Route
                path={paths.signup}
                element={
                  <GuestOnly>
                    <SignupPage />
                  </GuestOnly>
                }
              />
              <Route path={paths.forgotPassword} element={<ForgotPasswordPage />} />
              <Route path={paths.authCallback} element={<AuthCallbackPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
      </main>

      <Footer />
      <AppTabBar />
    </div>
  );
}
