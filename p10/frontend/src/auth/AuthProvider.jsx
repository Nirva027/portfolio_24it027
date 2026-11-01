import { useEffect, useMemo, useState } from 'react';
import { getCurrentUser, login as loginRequest, register as registerRequest } from '../api/auth.js';
import { getToken, saveToken } from '../api/client.js';
import { AuthContext } from './AuthContext.js';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      if (!getToken()) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        if (active) setUser(currentUser);
      } catch {
        saveToken(null);
      } finally {
        if (active) setIsCheckingSession(false);
      }
    }

    restoreSession();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const expireSession = () => {
      saveToken(null);
      setUser(null);
    };
    window.addEventListener('task-auth-expired', expireSession);
    return () => window.removeEventListener('task-auth-expired', expireSession);
  }, []);

  async function establishSession(authRequest) {
    const result = await authRequest();
    saveToken(result.token);
    setUser(result.user);
    return result.user;
  }

  async function login(email, password) {
    return establishSession(() => loginRequest(email, password));
  }

  async function register(email, password) {
    return establishSession(() => registerRequest(email, password));
  }

  function logout() {
    saveToken(null);
    setUser(null);
  }

  const value = useMemo(
    () => ({ user, isCheckingSession, login, register, logout }),
    [user, isCheckingSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
