import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { isTokenExpired, normalizeRole, parseJwtPayload } from '../auth/token.js';

export default function ProtectedRoute({
  children,
  allowedRoles = [],
  role: requiredRole,
}) {
  const location = useLocation();
  const { token, role } = useAuth();
  const normalizedRole = normalizeRole(role);
  const effectiveAllowed =
    allowedRoles.length > 0
      ? allowedRoles
      : requiredRole
        ? [requiredRole]
        : [];
  const normalizedAllowedRoles = effectiveAllowed.map((r) => normalizeRole(r));

  if (!token || !parseJwtPayload(token) || isTokenExpired(token)) {
    const redirect = encodeURIComponent(
      `${location.pathname}${location.search}`
    );
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  if (
    normalizedAllowedRoles.length > 0 &&
    !normalizedAllowedRoles.includes(normalizedRole)
  ) {
    if (normalizedRole === 'Admin') {
      return <Navigate to="/admin-dashboard" replace />;
    }
    if (normalizedRole === 'NurseryOwner') {
      return <Navigate to="/nursery-dashboard" replace />;
    }
    if (normalizedRole === 'Customer') {
      return <Navigate to="/customer-dashboard" replace />;
    }
    const redirect = encodeURIComponent(
      `${location.pathname}${location.search}`
    );
    return <Navigate to={`/login?redirect=${redirect}`} replace />;
  }

  return children;
}
