import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const normalizeRole = (role) => role?.toString().trim().toUpperCase().replace(/-/g, '_');

export default function ProtectedRoute({ allowedRoles, children }) {
  const { user, isAuthenticated } = useContext(AuthContext);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const normalizedUserRole = normalizeRole(user?.role);
  const normalizedAllowedRoles = allowedRoles.map(normalizeRole);

  if (!normalizedAllowedRoles.includes(normalizedUserRole)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
