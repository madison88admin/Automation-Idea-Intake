interface HeaderProps {
  currentView: 'submit' | 'admin' | 'logs';
  onNavigate: (view: 'submit' | 'admin' | 'logs') => void;
  isLoggedIn: boolean;
  userName?: string;
  onLogout: () => void;
}

const navItems: { key: 'submit' | 'admin' | 'logs'; label: string; icon: JSX.Element }[] = [
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
    key: 'admin',
    label: 'Dashboard',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
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
                <p className="text-[10px] font-semibold text-primary-300 uppercase tracking-widest">Automation</p>
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
                    onClick={onLogout}
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
            {navItems.map((item) => {
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
    </header>
  );
}
