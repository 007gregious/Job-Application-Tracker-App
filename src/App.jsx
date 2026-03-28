import React, { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  FaTimes,
  FaUserCircle,
  FaChartPie,
  FaListUl,
  FaPlusCircle,
  FaSignOutAlt,
  FaMoon,
  FaSun
} from 'react-icons/fa';
import Header from './components/common/Header';
import Dashboard from './components/dashboard/Dashboard';
import ApplicationForm from './components/applications/ApplicationForm';
import ApplicationList from './components/applications/ApplicationList';
import Footer from './components/common/Footer';
import AuthPage from './components/auth/AuthPage';
import ProfilePage from './components/profile/ProfilePage';
import { ApplicationProvider } from './hooks/useApplications';
import { authService } from './services/authService';
import './styles/global.css';

function App() {
  const [view, setView] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleSignOut = () => {
    authService.signOut();
    setCurrentUser(null);
    setView('dashboard');
    setIsSideMenuOpen(false);
  };

  const handleAuthenticated = (user) => {
    const sessionUser = authService.getCurrentUser();
    setCurrentUser(sessionUser || { id: user.id, name: user.name, email: user.email, profile: user.profile });
  };

  const handleProfileUpdated = (sessionUser) => {
    setCurrentUser(sessionUser);
  };

  return (
    <ApplicationProvider currentUserId={currentUser?.id}>
      <div className="app">
        <Toaster position="top-right" />
        <Header
          currentUser={currentUser}
          onOpenMenu={() => setIsSideMenuOpen(true)}
        />

        {currentUser && (
          <>
            <button
              className={`side-menu-overlay ${isSideMenuOpen ? 'open' : ''}`}
              onClick={() => setIsSideMenuOpen(false)}
              aria-label="Close side menu"
              type="button"
            />
            <aside className={`side-menu ${isSideMenuOpen ? 'open' : ''}`}>
              <div className="side-menu-header">
                <h3>Quick Access</h3>
                <button
                  type="button"
                  className="icon-only-btn"
                  onClick={() => setIsSideMenuOpen(false)}
                  aria-label="Close menu"
                >
                  <FaTimes />
                </button>
              </div>

              <nav className="side-menu-nav">
                <button type="button" onClick={() => { setView('dashboard'); setIsSideMenuOpen(false); }}>
                  <FaChartPie /> Dashboard
                </button>
                <button type="button" onClick={() => { setView('list'); setIsSideMenuOpen(false); }}>
                  <FaListUl /> Applications
                </button>
                <button type="button" onClick={() => { setView('add'); setIsSideMenuOpen(false); }}>
                  <FaPlusCircle /> Add Application
                </button>
                <button type="button" onClick={() => { setView('profile'); setIsSideMenuOpen(false); }}>
                  <FaUserCircle /> My Profile
                </button>
              </nav>

              <div className="side-menu-footer">
                <button
                  type="button"
                  className="side-menu-theme-toggle"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <FaSun /> : <FaMoon />}
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'} Theme
                </button>

                <button type="button" className="side-menu-signout" onClick={handleSignOut}>
                  <FaSignOutAlt /> Sign Out
                </button>
              </div>
            </aside>
          </>
        )}

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
              {view === 'profile' && (
                <ProfilePage currentUser={currentUser} onProfileUpdated={handleProfileUpdated} />
              )}
            </>
          )}
        </main>

        <Footer />
      </div>
    </ApplicationProvider>
  );
}

export default App;
