import { useCallback, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import * as authApi from '../../api/auth';
import { clearTokens, getRefreshToken, setTokens } from '../../api/tokenStore';
import { AuthContext, type AuthStatus } from '../../hooks/useAuth';
import type { User } from '../../types/user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  // Sayfa acilisinda: sakli bir refresh token varsa sessizce oturumu geri kur.
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      const refresh = getRefreshToken();
      if (!refresh) {
        setStatus('guest');
        return;
      }
      try {
        const me = await authApi.getMe();
        if (!cancelled) {
          setUser(me);
          setStatus('authenticated');
        }
      } catch {
        clearTokens();
        if (!cancelled) setStatus('guest');
      }
    }

    void restoreSession();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (payload: authApi.LoginPayload) => {
    const { user: loggedInUser, access, refresh } = await authApi.login(payload);
    setTokens({ access, refresh });
    setUser(loggedInUser);
    setStatus('authenticated');
  }, []);

  const register = useCallback(async (payload: authApi.RegisterPayload) => {
    const { user: newUser, access, refresh } = await authApi.register(payload);
    setTokens({ access, refresh });
    setUser(newUser);
    setStatus('authenticated');
  }, []);

  const logout = useCallback(async () => {
    const refresh = getRefreshToken();
    if (refresh) {
      // En iyi çaba: token zaten geçersizse veya ağ hatası olsa da
      // istemci tarafında oturumu kapatmaya devam ederiz.
      await authApi.logout(refresh).catch(() => undefined);
    }
    clearTokens();
    setUser(null);
    setStatus('guest');
  }, []);

  const updateDisplayName = useCallback(async (displayName: string) => {
    const updated = await authApi.updateMe({ display_name: displayName });
    setUser(updated);
  }, []);

  const value = useMemo(
    () => ({ status, user, login, register, logout, updateDisplayName }),
    [status, user, login, register, logout, updateDisplayName],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
