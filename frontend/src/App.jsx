import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Header from './components/Header/Header'; 
import Footer from './components/Footer/Footer';

// Lazy load Page Components
const AuthPage = lazy(() => import('./pages/AuthPage/AuthPage'));
const VerifyAccountPage = lazy(() => import('./pages/AuthPage/VerifyAccountPage'));
const Home = lazy(() => import('./pages/Home/Home'));
const AdminPage = lazy(() => import('./pages/Admin/AdminPage'));
const HorseOwnerPage = lazy(() => import('./pages/Horse-Owner/HorseOwnerPage'));
const JockeyPage = lazy(() => import('./pages/Jockey/JockeyPage'));
const RefereePage = lazy(() => import('./pages/Race-Referee/RefereePage'));
const SpectatorPage = lazy(() => import('./pages/Spectator/SpectatorPage'));
const UnauthorizedPage = lazy(() => import('./pages/Unauthorized/UnauthorizedPage'));

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
        <Suspense fallback={
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            background: '#02140b',
            color: '#ffffff',
            fontSize: '1.2rem',
            fontFamily: 'sans-serif'
          }}>
            Loading system...
          </div>
        }>
          <Routes>
            {/* Public Authentication Routes */}
            <Route path="/login" element={<AuthPage view="login" />} />
            <Route path="/signup" element={<AuthPage view="signup" />} />
            <Route path="/verify-account" element={<VerifyAccountPage />} />
            <Route path="/verify-email" element={<VerifyAccountPage />} />
            <Route path="/unauthorized" element={<UnauthorizedPage />} />

            {/* Standalone Horse Owner Dashboard Suite */}
            <Route
              path="/owner/*"
              element={
                <ProtectedRoute allowedRoles={["HORSE_OWNER"]}>
                  <HorseOwnerPage />
                </ProtectedRoute>
              }
            />
            <Route path="/horseowner/dashboard" element={<Navigate to="/owner" replace />} />

            {/* Jockey Nested Dashboard Layout */}
            <Route
              path="/jockey/*"
              element={
                <ProtectedRoute allowedRoles={["JOCKEY"]}>
                  <JockeyPage />
                </ProtectedRoute>
              }
            />

            {/* Referee Nested Dashboard Layout */}
            <Route
              path="/referee/*"
              element={
                <ProtectedRoute allowedRoles={["RACE_REFEREE"]}>
                  <RefereePage />
                </ProtectedRoute>
              }
            />

            {/* Spectator Nested Dashboard Layout */}
            <Route
              path="/spectator/*"
              element={
                <ProtectedRoute allowedRoles={["SPECTATOR"]}>
                  <SpectatorPage />
                </ProtectedRoute>
              }
            />

            {/* Standalone Admin Dashboard Suite */}
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={["ADMIN"]}>
                  <AdminPage />
                </ProtectedRoute>
              }
            />

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
            </Route>

            {/* Catch-all fallback redirecting to root */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
