import { Route, Routes } from 'react-router';
import { DemoBanner } from '@/components/layout/DemoBanner';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { paths } from '@/app/routes';
import { ScrollManager } from '@/app/ScrollManager';

import { HomePage } from '@/pages/HomePage';
import { ExplorePage } from '@/pages/ExplorePage';
import { ProjectDetailPage } from '@/pages/ProjectDetailPage';
import { StartProjectPage } from '@/pages/StartProjectPage';
import { ProjectEditorPage } from '@/pages/ProjectEditorPage';
import { FounderDashboardPage } from '@/pages/FounderDashboardPage';
import { BackerDashboardPage } from '@/pages/BackerDashboardPage';
import { AboutPage, EducationPage, PrivacyPage, TermsPage, TrustSafetyPage } from '@/pages/ContentPages';
import { ContactPage } from '@/pages/ContactPage';
import { AdminMessagesPage } from '@/pages/admin/AdminMessagesPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage';
import { WelcomePage } from '@/pages/auth/WelcomePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { AdminLayout } from '@/pages/admin/AdminLayout';
import { ReviewQueuePage } from '@/pages/admin/ReviewQueuePage';
import { ReviewProjectPage } from '@/pages/admin/ReviewProjectPage';
import { AdminProjectsPage } from '@/pages/admin/AdminProjectsPage';
import { AdminCommentsPage } from '@/pages/admin/AdminCommentsPage';
import { AdminUsersPage } from '@/pages/admin/AdminUsersPage';
import { AdminAuditPage } from '@/pages/admin/AdminAuditPage';
import { GuestOnly, RequireAdmin, RequireAuth } from '@/features/auth/guards';

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-page text-ink font-sans">
      <ScrollManager />
      <DemoBanner />
      <Header />

      <main className="flex-1">
        <Routes>
          <Route path={paths.home} element={<HomePage />} />
          <Route path={paths.explore} element={<ExplorePage />} />
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path={paths.education} element={<EducationPage />} />
          <Route path={paths.trustSafety} element={<TrustSafetyPage />} />
          <Route path={paths.about} element={<AboutPage />} />
          <Route path={paths.contact} element={<ContactPage />} />
          <Route path={paths.terms} element={<TermsPage />} />
          <Route path={paths.privacy} element={<PrivacyPage />} />

          {/* Signed-in users only */}
          <Route
            path={paths.startProject}
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
      </main>

      <Footer />
    </div>
  );
}
