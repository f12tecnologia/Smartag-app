import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/pages/Dashboard';
import RedirectPage from '@/pages/RedirectPage';
import AuthPage from '@/pages/AuthPage';
import SettingsPage from '@/pages/SettingsPage';
import ReportsPage from '@/pages/ReportsPage';
import { Loader2 } from 'lucide-react';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#1a1a1a]">
        <Loader2 className="h-12 w-12 text-purple-400 animate-spin" />
      </div>
    );
  }

  return user ? children : <Navigate to="/auth" />;
};

function App() {
  const { user, loading } = useAuth();

  return (
    <>
      <Helmet>
        <title>Dashboard QRCode - Gerencie seus QR Codes e URLs</title>
        <meta name="description" content="Dashboard completo para criação, gerenciamento e análise de QR Codes. Monitore cliques, visualize métricas e gerencie suas URLs de forma intuitiva." />
        <meta property="og:title" content="Dashboard QRCode - Gerencie seus QR Codes e URLs" />
        <meta property="og:description" content="Dashboard completo para criação, gerenciamento e análise de QR Codes. Monitore cliques, visualize métricas e gerencie suas URLs de forma intuitiva." />
      </Helmet>
      
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/auth" element={!loading && user ? <Navigate to="/" /> : <AuthPage />} />
            <Route path="/redirect/:id" element={<RedirectPage />} />
            <Route 
              path="/"
              element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              }
            />
            <Route 
              path="/settings"
              element={
                <PrivateRoute>
                  <SettingsPage />
                </PrivateRoute>
              }
            />
            <Route 
              path="/reports"
              element={
                <PrivateRoute>
                  <ReportsPage />
                </PrivateRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </>
  );
}

export default App;
