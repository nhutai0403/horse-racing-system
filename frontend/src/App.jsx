import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AuthPage from './pages/AuthPage/AuthPage';
import Home from './pages/Home/Home'; 
import Header from './components/Header/Header'; 
import Footer from './components/Footer/Footer';

// Import Role Dashboards
import AdminPage from './pages/Admin/AdminPage';
import HorseOwnerPage from './pages/Horse-Owner/HorseOwnerPage';
import JockeyPage from './pages/Jockey/JockeyPage';
import RefereePage from './pages/Race-Referee/RefereePage';
import SpectatorPage from './pages/Spectator/SpectatorPage';
import UnauthorizedPage from './pages/Unauthorized/UnauthorizedPage';

const MainLayout = () => {
  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header /> 
      <main style={{ flex: 1 }}>
        <Outlet /> 
      </main>
      <Footer /> 
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Routes */}
          <Route path="/login" element={<AuthPage view="login" />} />
          <Route path="/signup" element={<AuthPage view="signup" />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Standalone Horse Owner Dashboard Suite */}
          <Route
            path="/owner"
            element={
              <ProtectedRoute allowedRoles={["HORSE_OWNER"]}>
                <HorseOwnerPage />
              </ProtectedRoute>
            }
          />
          <Route path="/horseowner/dashboard" element={<Navigate to="/owner" replace />} />

          {/* Protected Routes enclosed in MainLayout */}
          <Route element={<MainLayout />}>
            {/* Landing Dashboard */}
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["SPECTATOR", "ADMIN", "HORSE_OWNER", "JOCKEY", "RACE_REFEREE"]}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/home" element={<Navigate to="/" replace />} />

            {/* Admin Control Page */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />
            <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

            {/* Jockey Dashboard */}
            <Route
              path="/jockey"
              element={
                <ProtectedRoute allowedRoles={["JOCKEY"]}>
                  <JockeyPage />
                </ProtectedRoute>
              }
            />
            <Route path="/jockey/dashboard" element={<Navigate to="/jockey" replace />} />

            {/* Referee Dashboard */}
            <Route
              path="/referee"
              element={
                <ProtectedRoute allowedRoles={["RACE_REFEREE"]}>
                  <RefereePage />
                </ProtectedRoute>
              }
            />

            {/* Spectator Dashboard */}
            <Route
              path="/spectator"
              element={
                <ProtectedRoute allowedRoles={["SPECTATOR"]}>
                  <SpectatorPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all fallback redirecting to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
