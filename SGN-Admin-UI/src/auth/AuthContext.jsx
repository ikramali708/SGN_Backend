import { createContext, useContext, useMemo, useState } from 'react';
import {
  clearToken,
  getRole,
  getToken,
  getUserId,
  isTokenExpired,
  normalizeRole,
  setToken,
  tokenRole,
} from './token.js';

const AuthContext = createContext(null);

function resolveRole(token) {
  const storedRole = normalizeRole(getRole());
  if (storedRole) return storedRole;
  return tokenRole(token);
}

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(() => {
    const stored = getToken();
    if (stored && !isTokenExpired(stored)) return stored;
    if (stored) clearToken();
    return '';
  });
  const [role, setRoleState] = useState(() => resolveRole(getToken()));
  const [userId, setUserIdState] = useState(() => getUserId());

  const value = useMemo(
    () => ({
      token,
      role,
      userId,
      isAuthenticated: Boolean(token),
      login: (nextToken, nextRole, nextUserId) => {
        const normalized = normalizeRole(nextRole) || tokenRole(nextToken);
        setToken(nextToken, normalized, nextUserId);
        setTokenState(nextToken);
        setRoleState(normalized);
        setUserIdState(getUserId());
      },
      logout: () => {
        clearToken();
        setTokenState('');
        setRoleState('');
        setUserIdState('');
      },
    }),
    [token, role, userId]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
