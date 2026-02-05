import { useState, useEffect, useRef } from 'react';
import { User } from './models';
import { Header } from './components';
import { SubmitPage, AdminDashboard, LogsPage, TrackPage, AdminIdeasPage } from './pages';

type View = 'submit' | 'admin' | 'logs' | 'track' | 'ideas';

function App() {
  const [currentView, setCurrentView] = useState<View>('submit');
  const [displayedView, setDisplayedView] = useState<View>('submit');
  const [fading, setFading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const pendingView = useRef<View | null>(null);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    handleNavigate('submit');
  };

  const handleNavigate = (view: View) => {
    if (view === displayedView && !fading) return;
    pendingView.current = view;
    setCurrentView(view);
    setFading(true);
  };

  useEffect(() => {
    if (!fading) return;
    const timer = setTimeout(() => {
      setDisplayedView(pendingView.current!);
      setFading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [fading]);

  const renderPage = () => {
    switch (displayedView) {
      case 'submit': return <SubmitPage />;
      case 'track': return <TrackPage />;
      case 'logs': return <LogsPage user={user} />;
      case 'ideas': return <AdminIdeasPage user={user} />;
      case 'admin': return <AdminDashboard user={user} onLoginSuccess={handleLoginSuccess} onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f4f8]">
      <Header
        currentView={currentView}
        onNavigate={handleNavigate}
        isLoggedIn={!!user}
        userName={user?.name}
        onLogout={handleLogout}
      />

      <main
        className="transition-all duration-200 ease-in-out"
        style={{
          opacity: fading ? 0 : 1,
          transform: fading ? 'translateY(8px)' : 'translateY(0)',
        }}
      >
        {renderPage()}
      </main>
    </div>
  );
}

export default App;
