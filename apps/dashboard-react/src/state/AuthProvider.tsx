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
const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<SessionTokens | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    authClient.refresh().then(async (nextTokens) => {
      const nextUser = await authClient.me(nextTokens.accessToken);
      if (!cancelled) {
        setUser(nextUser);
        setTokens(nextTokens);
        setReady(true);
      }
    }).catch(() => {
      if (!cancelled) {
        setReady(true);
      }
    });

    return () => {
      cancelled = true;
    };
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
          setTokens(nextTokens);
          setUser(nextUser);
        },
        async logout() {
          if (tokens) {
            await authClient.logout(tokens.accessToken);
          }

          setTokens(null);
          setUser(null);
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
