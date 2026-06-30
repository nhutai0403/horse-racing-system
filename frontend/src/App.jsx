import { lazy, Suspense, useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ProtectedRoute from './routes/ProtectedRoute';
import Header from './components/Header/Header'; 
import Footer from './components/Footer/Footer';
import FloatingAiChat from './components/FloatingAiChat/FloatingAiChat';
import PageTransition from './components/PageTransition/PageTransition';

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
const PaymentQRPage = lazy(() => import('./pages/Payment/PaymentQRPage'));
const PaymentCallback = lazy(() => import('./pages/Payment/PaymentCallback'));

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
  const [customAlert, setCustomAlert] = useState(null);

  useEffect(() => {
    window.alert = (message) => {
      setCustomAlert(message);
    };
  }, []);

  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <PageTransition>
            <Suspense fallback={
              <PageTransition initialLoading={true}>
                <div style={{ minHeight: '100vh', background: '#02050a' }} />
              </PageTransition>
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
                    <ProtectedRoute allowedRoles={["SPECTATOR", "HORSE_OWNER", "JOCKEY", "RACE_REFEREE"]}>
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

                {/* Payment Route */}
                <Route
                  path="/payment-qr"
                  element={
                    <ProtectedRoute allowedRoles={["HORSE_OWNER", "JOCKEY"]}>
                      <PaymentQRPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/payment-success" element={<PaymentCallback />} />
                <Route path="/payment-cancel" element={<PaymentCallback />} />

                {/* Public and Protected Routes enclosed in MainLayout */}
                <Route element={<MainLayout />}>
                  {/* Landing Dashboard */}
                  <Route path="/" element={<Home />} />
                  <Route path="/home" element={<Navigate to="/" replace />} />
                </Route>

                {/* Catch-all fallback redirecting to root */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </PageTransition>

        {customAlert && (
          <div className="custom-alert-overlay" onClick={() => setCustomAlert(null)}>
            <div className="custom-alert-box" onClick={(e) => e.stopPropagation()}>
              <h3 className="custom-alert-title">Thông Báo</h3>
              <p className="custom-alert-message">{customAlert}</p>
              <button className="custom-alert-btn" onClick={() => setCustomAlert(null)}>
                Đóng
              </button>
            </div>
          </div>
        )}

        <FloatingAiChat />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
