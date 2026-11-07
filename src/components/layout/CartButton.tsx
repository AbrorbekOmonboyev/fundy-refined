import { useLocation, useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';
import { paths } from '@/app/routes';
import { requestOpenCart, useCartsSummary } from '@/features/cart/cart';

/**
 * Header cart icon with the number of items. Shown once something is in a cart.
 * On that project's page it opens the cart; elsewhere it goes to the project with the cart open.
 */
export function CartButton() {
  const { t } = useTranslation();
  const { count, latest, all } = useCartsSummary();
  const location = useLocation();
  const navigate = useNavigate();
  if (count === 0 || !latest) return null;

  const here = all.find(c => location.pathname === paths.project(c.slug));
  const label = t('cart.open', { count });

  return (
    <button
      type="button"
      onClick={() => (here ? requestOpenCart(here.projectId) : navigate(`${paths.project(latest.slug)}?cart=open`))}
      aria-label={label}
      title={label}
      className="relative w-11 h-11 shrink-0 rounded-full flex items-center justify-center text-ink hover:bg-slate-100 cursor-pointer"
    >
      <ShoppingBag className="w-5 h-5" aria-hidden />
      <span className="absolute top-1 right-0.5 min-w-5 h-5 px-1 rounded-full bg-brand text-night text-xs font-bold flex items-center justify-center font-mono-numbers">
        {count > 99 ? '99+' : count}
      </span>
    </button>
  );
}
