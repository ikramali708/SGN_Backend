import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { isTokenExpired, normalizeRole, parseJwtPayload } from '../auth/token.js';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const location = useLocation();
  const { token, role } = useAuth();
  const normalizedRole = normalizeRole(role);
  const normalizedAllowedRoles = allowedRoles.map((r) => normalizeRole(r));

  if (!token || !parseJwtPayload(token) || isTokenExpired(token)) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.includes(normalizedRole)
  ) {
    if (normalizedRole === 'Admin') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    if (normalizedRole === 'NurseryOwner') {
      return <Navigate to="/nursery/dashboard" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return children;
}
