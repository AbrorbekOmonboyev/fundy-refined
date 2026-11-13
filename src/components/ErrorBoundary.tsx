import { Component, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TriangleAlert } from 'lucide-react';
import { reportError } from '@/lib/monitoring';

/**
 * If a page crashes, show a friendly message instead of a blank screen,
 * and report the error. `resetKey` (the page address) clears it on navigation.
 */
export class ErrorBoundary extends Component<{ children: ReactNode; resetKey?: string }, { error: unknown }> {
  state = { error: null as unknown };

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  componentDidCatch(error: unknown, info: { componentStack?: string | null }) {
    reportError(error, { componentStack: info.componentStack });
  }

  componentDidUpdate(prev: { resetKey?: string }) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    return this.state.error ? <CrashMessage /> : this.props.children;
  }
}

function CrashMessage() {
  const { t } = useTranslation();
  return (
    <div role="alert" className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
      <TriangleAlert className="w-10 h-10 text-amber-500 mx-auto" aria-hidden />
      <h1 className="text-xl font-bold text-ink">{t('errors.crashTitle')}</h1>
      <p className="text-sm text-slate-600">{t('errors.crashText')}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="px-4 py-2 text-sm font-semibold text-white bg-brand hover:bg-brand-deep rounded-md"
      >
        {t('errors.reload')}
      </button>
    </div>
  );
}
