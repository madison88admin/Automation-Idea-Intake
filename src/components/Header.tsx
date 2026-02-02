import { useState } from 'react';

interface HeaderProps {
  currentView: 'submit' | 'admin' | 'logs' | 'track' | 'ideas';
  onNavigate: (view: 'submit' | 'admin' | 'logs' | 'track' | 'ideas') => void;
  isLoggedIn: boolean;
  userName?: string;
  onLogout: () => void;
}

const navItems: { key: 'submit' | 'admin' | 'logs' | 'track' | 'ideas'; label: string; icon: JSX.Element }[] = [
  {
    key: 'submit',
    label: 'Submit Idea',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    key: 'track',
    label: 'Track Idea',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
  {
    key: 'admin',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  {
    key: 'ideas',
    label: 'All Submissions',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
      </svg>
    ),
  },
  {
    key: 'logs',
    label: 'Activity Logs',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    ),
  },
];

export function Header({ currentView, onNavigate, isLoggedIn, userName, onLogout }: HeaderProps) {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutConfirm(false);
    onLogout();
  };

  return (
    <header className="header-wrapper">
      {/* Top bar */}
      <div className="bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo + Title */}
            <div className="flex items-center gap-3">
              <img
                src="/logo/madison88ltd_logo-removebg-preview.png"
                alt="Madison 88 Ltd"
                className="h-10 w-auto brightness-0 invert"
              />
              <div className="hidden sm:block border-l border-primary-600 pl-3">
                <p className="text-sm font-bold text-white -mt-0.5">Idea Intake</p>
              </div>
            </div>

            {/* User area */}
            <div className="flex items-center gap-3">
              {isLoggedIn ? (
                <>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-primary-700/50 rounded-lg">
                    <div className="w-7 h-7 rounded-full bg-primary-500 flex items-center justify-center">
                      <span className="text-xs font-bold text-white">{userName?.charAt(0) || 'U'}</span>
                    </div>
                    <span className="text-sm font-medium text-primary-100">{userName}</span>
                  </div>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="px-3 py-1.5 text-sm font-medium text-primary-200 hover:text-white hover:bg-primary-700 rounded-lg transition-colors"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => onNavigate('admin')}
                  className="px-4 py-2 text-sm font-medium text-primary-800 bg-white hover:bg-primary-50 rounded-lg transition-colors shadow-sm"
                >
                  Admin Login
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-primary-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex gap-1">
            {navItems
              .filter(item => {
                const isAdminTab = item.key === 'admin' || item.key === 'ideas' || item.key === 'logs';
                const isUserTab = item.key === 'submit' || item.key === 'track';
                
                if (isLoggedIn) {
                  return isAdminTab;
                } else {
                  return isUserTab;
                }
              })
              .map((item) => {
                const isActive = currentView === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => onNavigate(item.key)}
                    className={`
                      flex items-center gap-2 px-5 py-3 text-sm font-medium rounded-t-lg transition-all relative
                      ${isActive
                        ? 'bg-[#f0f4f8] text-primary-800'
                        : 'text-white/70 hover:text-white hover:bg-white/10'
                      }
                    `}
                  >
                    {item.icon}
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
          </nav>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in" 
            onClick={() => setShowLogoutConfirm(false)} 
          />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-modal-in">
            <div className="p-6 text-center">
              <div className="w-14 h-14 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-1">Sign Out?</h3>
              <p className="text-sm text-gray-500 mb-6">Are you sure you want to log out of the admin dashboard?</p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowLogoutConfirm(false)}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmLogout}
                  className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-primary-700 hover:bg-primary-800 rounded-lg transition-colors shadow-md active:scale-[0.98]"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
