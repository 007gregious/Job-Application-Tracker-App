import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Header from './components/common/Header';
import Dashboard from './components/dashboard/Dashboard';
import ApplicationForm from './components/applications/ApplicationForm';
import ApplicationList from './components/applications/ApplicationList';
import Footer from './components/common/Footer';
import AuthPage from './components/auth/AuthPage';
import { ApplicationProvider } from './hooks/useApplications';
import { authService } from './services/authService';
import './styles/global.css';

function App() {
  const [view, setView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  const handleSignOut = () => {
    authService.signOut();
    setCurrentUser(null);
    setView('dashboard');
  };

  const handleAuthenticated = (user) => {
    setCurrentUser({ id: user.id, name: user.name, email: user.email });
  };

  return (
    <ApplicationProvider>
      <div className="app">
        <Toaster position="top-right" />
        <Header currentUser={currentUser} onSignOut={handleSignOut} />

        <main className="main-content">
          {!currentUser ? (
            <AuthPage onAuthenticated={handleAuthenticated} />
          ) : (
            <>
              <div className="view-toggle">
                <button
                  className={view === 'dashboard' ? 'active' : ''}
                  onClick={() => setView('dashboard')}
                >
                  Dashboard
                </button>
                <button
                  className={view === 'list' ? 'active' : ''}
                  onClick={() => setView('list')}
                >
                  Applications
                </button>
                <button
                  className={view === 'add' ? 'active' : ''}
                  onClick={() => setView('add')}
                >
                  + Add New
                </button>
              </div>

              {view === 'dashboard' && <Dashboard />}
              {view === 'add' && <ApplicationForm onSuccess={() => setView('list')} />}
              {view === 'list' && <ApplicationList />}
            </>
          )}
        </main>

        <Footer />
      </div>
    </ApplicationProvider>
  );
}

export default App;
