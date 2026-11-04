import { useTranslation } from 'react-i18next';
import { LayoutDashboard, Rocket, Settings, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/features/auth/AuthContext';
import { paths } from '@/app/routes';

/** Links for a signed-in user — shared by the account dropdown and the mobile menu. */
export function useAccountLinks() {
  const { t } = useTranslation();
  const { isAdmin } = useAuth();
  return [
    { to: paths.backerDashboard, label: t('account.contributions'), Icon: LayoutDashboard },
    { to: paths.founderDashboard, label: t('account.projects'), Icon: Rocket },
    { to: paths.settings, label: t('account.settings'), Icon: Settings },
    ...(isAdmin ? [{ to: paths.admin, label: t('account.admin'), Icon: ShieldCheck }] : []),
  ];
}
