import { useState } from 'react';
import { User } from './models';
import { Header } from './components';
import { SubmitPage, AdminDashboard, LogsPage } from './pages';

function App() {
  const [currentView, setCurrentView] = useState<'submit' | 'admin' | 'logs'>('submit');
  const [user, setUser] = useState<User | null>(null);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('submit');
  };

  const handleNavigate = (view: 'submit' | 'admin' | 'logs') => {
    setCurrentView(view);
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

      <main>
        {currentView === 'submit' ? (
          <SubmitPage />
        ) : currentView === 'logs' ? (
          <LogsPage />
        ) : (
          <AdminDashboard user={user} onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
    </div>
  );
}

export default App;
