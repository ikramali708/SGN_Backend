const TOKEN_STORAGE_KEY = 'token';
const ROLE_STORAGE_KEY = 'role';
const USER_ID_STORAGE_KEY = 'userId';
const LEGACY_TOKEN_STORAGE_KEY = 'sgn_token';
const LEGACY_ROLE_STORAGE_KEY = 'sgn_role';

export function getToken() {
  return (
    localStorage.getItem(TOKEN_STORAGE_KEY) ||
    localStorage.getItem(LEGACY_TOKEN_STORAGE_KEY)
  );
}

export function setToken(token, role, userId) {
  localStorage.setItem(TOKEN_STORAGE_KEY, token);
  localStorage.setItem(LEGACY_TOKEN_STORAGE_KEY, token);
  if (role) {
    setRole(role);
  }
  const resolvedUserId = userId || tokenUserId(token);
  if (resolvedUserId) {
    setUserId(resolvedUserId);
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_STORAGE_KEY);
  localStorage.removeItem(LEGACY_TOKEN_STORAGE_KEY);
  localStorage.removeItem(ROLE_STORAGE_KEY);
  localStorage.removeItem(LEGACY_ROLE_STORAGE_KEY);
  localStorage.removeItem(USER_ID_STORAGE_KEY);
}

export function getRole() {
  return (
    localStorage.getItem(ROLE_STORAGE_KEY) ||
    localStorage.getItem(LEGACY_ROLE_STORAGE_KEY)
  );
}

export function setRole(role) {
  const normalized = normalizeRole(role);
  if (!normalized) return;
  localStorage.setItem(ROLE_STORAGE_KEY, normalized);
  localStorage.setItem(LEGACY_ROLE_STORAGE_KEY, normalized);
}

export function getUserId() {
  return localStorage.getItem(USER_ID_STORAGE_KEY) || '';
}

export function setUserId(userId) {
  if (!userId) return;
  localStorage.setItem(USER_ID_STORAGE_KEY, String(userId));
}

const ROLE_CLAIM =
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';
const NAME_ID_CLAIM =
  'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

export function normalizeRole(role) {
  const normalized = String(role || '')
    .replace(/[\s_-]/g, '')
    .toLowerCase();
  if (normalized === 'admin') return 'Admin';
  if (normalized === 'nurseryowner') {
    return 'NurseryOwner';
  }
  if (normalized === 'customer') return 'Customer';
  return '';
}

export function parseJwtPayload(token) {
  if (!token) return null;
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function tokenHasAdminRole(token) {
  const p = parseJwtPayload(token);
  if (!p) return false;
  const r = p.role ?? p[ROLE_CLAIM] ?? p.Role;
  if (Array.isArray(r)) {
    return r.some((x) => normalizeRole(x) === 'Admin');
  }
  return normalizeRole(r) === 'Admin';
}

export function tokenHasNurseryRole(token) {
  const p = parseJwtPayload(token);
  if (!p) return false;
  const r = p.role ?? p[ROLE_CLAIM] ?? p.Role;
  if (Array.isArray(r)) {
    return r.some((x) => normalizeRole(x) === 'NurseryOwner');
  }
  return normalizeRole(r) === 'NurseryOwner';
}

export function tokenHasCustomerRole(token) {
  const p = parseJwtPayload(token);
  if (!p) return false;
  const r = p.role ?? p[ROLE_CLAIM] ?? p.Role;
  if (Array.isArray(r)) {
    return r.some((x) => normalizeRole(x) === 'Customer');
  }
  return normalizeRole(r) === 'Customer';
}

export function tokenRole(token) {
  if (tokenHasAdminRole(token)) return 'Admin';
  if (tokenHasNurseryRole(token)) return 'NurseryOwner';
  if (tokenHasCustomerRole(token)) return 'Customer';
  return '';
}

export function tokenUserId(token) {
  const p = parseJwtPayload(token);
  if (!p) return '';
  return String(
    p.userId ??
      p.userid ??
      p.sub ??
      p.nameid ??
      p[NAME_ID_CLAIM] ??
      p.UserId ??
      ''
  );
}

export function isTokenExpired(token) {
  const p = parseJwtPayload(token);
  if (!p?.exp) return false;
  const nowInSeconds = Math.floor(Date.now() / 1000);
  return Number(p.exp) <= nowInSeconds;
}
