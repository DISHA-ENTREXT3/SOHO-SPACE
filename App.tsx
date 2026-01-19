
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import Header from './components/Header';
import Footer from './components/Footer';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PartnerProfilePage from './pages/PartnerProfilePage';
import CollaborationWorkspacePage from './pages/CollaborationWorkspacePage';
import PrivateRoute from './components/PrivateRoute';
import CompanyProfilePage from './pages/CompanyProfilePage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/AdminPage';
import HomePage from './pages/HomePage';
import OnboardingPage from './pages/OnboardingPage';
import ScrollToTop from './components/ScrollToTop';

import FeedbackPage from './pages/FeedbackPage';
import DiscoverPage from './pages/DiscoverPage';
import PricingPage from './pages/PricingPage';

// Fix: Extracted route elements into variables to simplify the JSX tree inside <Routes />.
// This can prevent potential parser issues with complex nested components in props.
const DashboardRoute = <PrivateRoute><DashboardPage /></PrivateRoute>;
const PartnerProfileRoute = <PrivateRoute><PartnerProfilePage /></PrivateRoute>;
const CollaborationWorkspaceRoute = <PrivateRoute><CollaborationWorkspacePage /></PrivateRoute>;
const CompanyProfileRoute = <PrivateRoute><CompanyProfilePage /></PrivateRoute>;
const SettingsRoute = <PrivateRoute><SettingsPage /></PrivateRoute>;
const AdminRoute = <PrivateRoute><AdminPage /></PrivateRoute>;
const OnboardingRoute = <PrivateRoute><OnboardingPage /></PrivateRoute>;


function App() {
  // Fix for Supabase auth redirect cleanup
  React.useEffect(() => {
    const handleAuthRedirect = async () => {
      const hash = window.location.hash;
      if (hash && (hash.includes('access_token=') || hash.includes('type=recovery') || hash.includes('error='))) {
        // Wait a tiny bit to allow Supabase SDK to parse the hash
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Clear the hash from the URL without reloading
        console.log('[App] Cleaning up auth tokens from URL...');
        window.history.replaceState(null, '', window.location.pathname);
      }
    };
    handleAuthRedirect();
  }, []);

  return (
    <AppProvider>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <ScrollToTop />
            <div className="min-h-screen font-sans text-gray-100 flex flex-col bg-[var(--bg-primary)] transition-colors duration-300">
              <Header />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/feedback" element={<FeedbackPage />} />
                  <Route path="/discover" element={<DiscoverPage />} />
                  <Route
                    path="/dashboard"
                    element={DashboardRoute}
                  />
                  <Route
                    path="/partner/:id"
                    element={PartnerProfileRoute}
                  />
                   <Route
                    path="/company/:id"
                    element={CompanyProfileRoute}
                  />
                  <Route
                    path="/workspace/:id"
                    element={CollaborationWorkspaceRoute}
                  />
                   <Route
                    path="/settings"
                    element={SettingsRoute}
                  />
                   <Route
                    path="/admin"
                    element={AdminRoute}
                  />
                  <Route
                    path="/onboarding"
                    element={OnboardingRoute}
                  />
                  <Route path="/pricing" element={<PricingPage />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </AppProvider>
  );
}

export default App;