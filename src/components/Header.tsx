import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Bell, Menu, X, CheckCircle2 } from 'lucide-react';

export const Header: React.FC = () => {
  const { currentPage, navigateTo, notifications, markNotificationsAsRead, userProfile } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNav = (page: any, anchor?: string) => {
    navigateTo(page);
    setMobileMenuOpen(false);
    if (anchor) {
      setTimeout(() => {
        const el = document.getElementById(anchor);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => handleNav('home')}
              className="text-left group flex items-center gap-2 cursor-pointer"
            >
              <span className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                F
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors whitespace-nowrap">
                Fundy
              </span>
            </button>
          </div>

          {/* Zone 2: 4–5 clean single-line text navigation links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <button
              onClick={() => handleNav('explore')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap cursor-pointer ${
                currentPage === 'explore' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Explore Projects
            </button>
            <button
              onClick={() => handleNav('home', 'how-it-works')}
              className="hover:text-emerald-700 transition-colors whitespace-nowrap cursor-pointer"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNav('education')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap cursor-pointer ${
                currentPage === 'education' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Education & Musharakah
            </button>
            <button
              onClick={() => handleNav('trust-safety')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap cursor-pointer ${
                currentPage === 'trust-safety' ? 'text-emerald-600 font-semibold' : ''
              }`}
            >
              Trust & Safety
            </button>
            <button
              onClick={() => handleNav(userProfile.role === 'founder' ? 'founder-dashboard' : 'backer-dashboard')}
              className={`hover:text-emerald-700 transition-colors whitespace-nowrap cursor-pointer ${
                currentPage === 'founder-dashboard' || currentPage === 'backer-dashboard'
                  ? 'text-emerald-600 font-semibold'
                  : ''
              }`}
            >
              Dashboard
            </button>
          </nav>

          {/* Zone 3: 1 primary action + notification icon */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Notification trigger */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  if (!showNotifications) markNotificationsAsRead();
                }}
                className="p-2 text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors relative cursor-pointer"
                title="Notifications"
                aria-label="View notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600"></span>
                )}
              </button>

              {/* Notification Popup */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Notifications
                    </span>
                    <button
                      onClick={markNotificationsAsRead}
                      className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
                    >
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-slate-500 text-center">No notifications yet.</p>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className="p-3 text-xs hover:bg-slate-50 transition-colors">
                          <div className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <p className="font-semibold text-slate-800">{n.title}</p>
                              <p className="text-slate-600 mt-0.5">{n.message}</p>
                              <p className="text-slate-400 mt-1 text-[10px]">{n.time}</p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => handleNav('start-project')}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg shadow-sm transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Start a Project
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-lg">
          <div className="flex flex-col space-y-2 text-sm font-medium">
            <button
              onClick={() => handleNav('explore')}
              className="text-left py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Explore Projects
            </button>
            <button
              onClick={() => handleNav('home', 'how-it-works')}
              className="text-left py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              How It Works
            </button>
            <button
              onClick={() => handleNav('education')}
              className="text-left py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Education & Musharakah
            </button>
            <button
              onClick={() => handleNav('trust-safety')}
              className="text-left py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Trust & Safety
            </button>
            <button
              onClick={() => handleNav(userProfile.role === 'founder' ? 'founder-dashboard' : 'backer-dashboard')}
              className="text-left py-2 px-3 rounded-lg text-slate-700 hover:bg-slate-100"
            >
              Dashboard ({userProfile.role === 'founder' ? 'Founder' : 'Backer'})
            </button>
          </div>
          <div className="pt-2 border-t border-slate-100">
            <button
              onClick={() => handleNav('start-project')}
              className="w-full py-2.5 text-center text-sm font-semibold text-white bg-emerald-600 rounded-lg shadow-sm"
            >
              Start a Project
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
