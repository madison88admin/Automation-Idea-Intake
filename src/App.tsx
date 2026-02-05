import { useState, useEffect, useRef, useMemo } from 'react';
import { User } from './models';
import { Header } from './components';
import { SubmitPage, AdminDashboard, LogsPage, TrackPage, AdminIdeasPage } from './pages';
import { AuthService } from './services/AuthService';

type View = 'submit' | 'admin' | 'logs' | 'track' | 'ideas';

function App() {
  const [currentView, setCurrentView] = useState<View>(() => (localStorage.getItem('automation_idea_intake_view') as View) || 'submit');
  const [displayedView, setDisplayedView] = useState<View>(() => (localStorage.getItem('automation_idea_intake_view') as View) || 'submit');
  const [fading, setFading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const pendingView = useRef<View | null>(null);

  const authService = useMemo(() => new AuthService(), []);

  useEffect(() => {
    // Initialize auth from localStorage or Supabase session and subscribe to changes
    let unsubscribe: (() => void) | undefined;
    (async () => {
      const restored = await authService.init();
      if (restored) setUser(restored);
      setAuthReady(true);
      unsubscribe = authService.onAuthStateChange((u) => {
        setUser(u);
      });
    })();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [authService]);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = async () => {
    await authService.logout();
    setUser(null);
    handleNavigate('submit');
  };

  const handleNavigate = (view: View) => {
    if (view === displayedView && !fading) return;
    pendingView.current = view;
    setCurrentView(view);
    localStorage.setItem('automation_idea_intake_view', view);
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
        isLoggedIn={authReady ? !!user : !!user}
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
