import { isTokenExpired, normalizeRole } from '../auth/token.js';

export function isCustomerLoggedIn(token, role) {
  return Boolean(
    token &&
    !isTokenExpired(token) &&
    normalizeRole(role) === 'Customer'
  );
}

export function decodeRedirectParam(value) {
  if (value == null || typeof value !== 'string') return '';
  try {
    const decoded = decodeURIComponent(value.trim());
    if (!decoded.startsWith('/') || decoded.startsWith('//')) return '';
    if (decoded.includes('://')) return '';
    return decoded;
  } catch {
    return '';
  }
}

/**
 * Safe path to navigate after login for the given role.
 * @param {string} role - raw or normalized role string
 * @param {string | null} redirectParam - value of ?redirect= (URL-encoded path)
 */
export function pathAfterLogin(role, redirectParam) {
  const normalized = normalizeRole(role);
  const path = decodeRedirectParam(redirectParam || '');
  if (path && normalized === 'Admin' && path.startsWith('/admin')) {
    return path;
  }
  if (path && normalized === 'NurseryOwner' && path.startsWith('/nursery')) {
    return path;
  }
  if (path && normalized === 'Customer' && path.startsWith('/customer')) {
    return path;
  }
  if (normalized === 'Admin') return '/admin-dashboard';
  if (normalized === 'NurseryOwner') return '/nursery-dashboard';
  if (normalized === 'Customer') return '/customer-dashboard';
  return '/customer-dashboard';
}

export function loginUrlWithRedirect(pathname, search = '') {
  const full = `${pathname || '/customer-dashboard'}${search || ''}`;
  return `/login?redirect=${encodeURIComponent(full)}`;
}
