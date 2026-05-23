import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { authLogin, authRegister, AuthRole } from '../api/client';
import {
  clearAuthSession,
  loadAuthSession,
  persistAuthSession,
} from '../authStorage';

type AuthContextValue = {
  token: string | null;
  role: AuthRole | null;
  email: string | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  booting: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [role, setRole] = useState<AuthRole | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    (async () => {
      const session = await loadAuthSession();
      if (session) {
        setToken(session.token);
        setRole(session.role);
        setEmail(session.email);
      }
      setBooting(false);
    })();
  }, []);

  const login = useCallback(async (loginEmail: string, password: string) => {
    const res = await authLogin(loginEmail, password);
    await persistAuthSession(res.token, res.role, res.email);
    setToken(res.token);
    setRole(res.role);
    setEmail(res.email);
  }, []);

  const register = useCallback(
    async (registerEmail: string, password: string, name?: string) => {
      const res = await authRegister(registerEmail, password, name);
      await persistAuthSession(res.token, res.role, res.email);
      setToken(res.token);
      setRole(res.role);
      setEmail(res.email);
    },
    [],
  );

  const logout = useCallback(async () => {
    await clearAuthSession();
    setToken(null);
    setRole(null);
    setEmail(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      role,
      email,
      isLoggedIn: Boolean(token),
      isAdmin: role === 'admin',
      booting,
      login,
      register,
      logout,
    }),
    [token, role, email, booting, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
