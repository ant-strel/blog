import { createContext, useContext, useEffect, useState } from "react";
import type { AuthUser, LoginRequest, SessionTokens } from "@template/contracts";
import { createAuthClient } from "../lib/authClient";

interface AuthContextValue {
  user: AuthUser | null;
  tokens: SessionTokens | null;
  ready: boolean;
  login(request: LoginRequest): Promise<void>;
  logout(): Promise<void>;
}

const authClient = createAuthClient();
const storageKey = "template.public.session";
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<SessionTokens | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    const parsed = stored ? JSON.parse(stored) as SessionTokens : null;
    if (!parsed) {
      setReady(true);
      return;
    }

    authClient.me(parsed.accessToken).then((nextUser) => {
      localStorage.setItem(storageKey, JSON.stringify(parsed));
      setTokens(parsed);
      setUser(nextUser);
      setReady(true);
    }).catch(() => {
      localStorage.removeItem(storageKey);
      setReady(true);
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        tokens,
        ready,
        async login(request) {
          const nextTokens = await authClient.login(request);
          const nextUser = await authClient.me(nextTokens.accessToken);
          localStorage.setItem(storageKey, JSON.stringify(nextTokens));
          setTokens(nextTokens);
          setUser(nextUser);
        },
        async logout() {
          try {
            if (tokens) {
              await authClient.logout({ refreshToken: tokens.refreshToken }, tokens.accessToken);
            }
          } finally {
            localStorage.removeItem(storageKey);
            setTokens(null);
            setUser(null);
          }
        }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider.");
  return value;
}
