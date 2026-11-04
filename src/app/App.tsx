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
import { FounderDashboardPage } from '@/pages/FounderDashboardPage';
import { BackerDashboardPage } from '@/pages/BackerDashboardPage';
import { EducationPage } from '@/pages/EducationPage';
import { TrustSafetyPage } from '@/pages/TrustSafetyPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { SignupPage } from '@/pages/auth/SignupPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage';
import { WelcomePage } from '@/pages/auth/WelcomePage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminPage } from '@/pages/admin/AdminPage';
import { GuestOnly, RequireAdmin, RequireAuth } from '@/features/auth/guards';

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
          <Route path="/projects/:slug" element={<ProjectDetailPage />} />
          <Route path={paths.education} element={<EducationPage />} />
          <Route path={paths.trustSafety} element={<TrustSafetyPage />} />

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
          <Route
            path={paths.admin}
            element={
              <RequireAdmin>
                <AdminPage />
              </RequireAdmin>
            }
          />

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
