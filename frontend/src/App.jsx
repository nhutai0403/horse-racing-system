import { BrowserRouter, Routes, Route, Navigate, Outlet} from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage/AuthPage';
import Home from './pages/Home/Home'; 
import AdminDashboard from './pages/Admin/AdminDashboard';
import HorseOwnerDashboard from './pages/Horse-Owner/HorseOwnerDashboard';
import JockeyDashboard from './pages/Jockey/JockeyDashboard';
import Header from './components/Header/Header'; 
import Footer from './components/Footer/Footer';
import ProtectedRoute from './routes/ProtectedRoute';

const MainLayout = () => {
  return (
    <div className="app-layout" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Khối Header mặc định luôn nằm trên cùng */}
      <Header /> 
      
      {/* Nội dung trang Home (hoặc các trang sau này) sẽ được render ở Outlet này */}
      <main style={{ flex: 1 }}>
        <Outlet /> 
      </main>
      
      {/* Khối Footer mặc định luôn nằm dưới cùng */}
      <Footer /> 
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route
              path="/"
              element={
                <ProtectedRoute allowedRoles={["SPECTATOR", "ADMIN", "HORSE_OWNER"]}>
                  <Home />
                </ProtectedRoute>
              }
            />
            <Route path="/home" element={<Navigate to="/" replace />} />
          </Route>
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/horseowner/dashboard"
            element={
              <ProtectedRoute allowedRoles={["HORSE-OWNER"]}>
                <HorseOwnerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/jockey/dashboard"
            element={
              <ProtectedRoute allowedRoles={["JOCKEY"]}>
                <JockeyDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<AuthPage view="login" />} />
          <Route path="/signup" element={<AuthPage view="signup" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
