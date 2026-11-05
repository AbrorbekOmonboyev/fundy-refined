import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { App } from '@/app/App';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { Analytics } from '@vercel/analytics/react';
import { startMonitoring } from '@/lib/monitoring';
import { watchSystemTheme } from '@/lib/theme';
import '@/i18n';
import '@/index.css';

// Cached server data: fresh for 30 s, then refreshed in the background when used.
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

startMonitoring();
watchSystemTheme();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <App />
        </AuthProvider>
        {/* Cookie-free visitor counts; works once Web Analytics is enabled in Vercel */}
        <Analytics />
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>,
);
