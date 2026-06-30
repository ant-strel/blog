import { createContext, useContext, useEffect, useState } from "react";
import type {
  AuthUser,
  ConfirmEmailRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RequestEmailConfirmationRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SessionTokens
} from "@template/contracts";
import { createAuthClient } from "../lib/authClient";

interface SessionState {
  user: AuthUser | null;
  tokens: SessionTokens | null;
  ready: boolean;
}

interface AuthContextValue extends SessionState {
  login(request: LoginRequest): Promise<void>;
  register(request: RegisterRequest): Promise<{ userId: string; email: string }>;
  logout(): Promise<void>;
  forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string; token?: string }>;
  requestEmailConfirmation(
    request: RequestEmailConfirmationRequest
  ): Promise<{ message: string; token?: string }>;
  confirmEmail(request: ConfirmEmailRequest): Promise<{ message: string }>;
  resetPassword(request: ResetPasswordRequest): Promise<{ message: string }>;
  refresh(): Promise<void>;
}

const authClient = createAuthClient();
const storageKey = "template.account.session";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    user: null,
    tokens: null,
    ready: false
  });

  useEffect(() => {
    let cancelled = false;
    const stored = localStorage.getItem(storageKey);
    if (!stored) {
      setState((current) => ({ ...current, ready: true }));
      return;
    }

    const parsed = JSON.parse(stored) as SessionTokens;
    authClient
      .me(parsed.accessToken)
      .then((user) => {
        if (!cancelled) {
          setState({ user, tokens: parsed, ready: true });
        }
      })
      .catch(() => {
        localStorage.removeItem(storageKey);
        if (!cancelled) {
          setState({ user: null, tokens: null, ready: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const value: AuthContextValue = {
    ...state,
    async login(request) {
      const tokens = await authClient.login(request);
      const user = await authClient.me(tokens.accessToken);
      localStorage.setItem(storageKey, JSON.stringify(tokens));
      setState({ user, tokens, ready: true });
    },
    async register(request) {
      return authClient.register(request);
    },
    async logout() {
      if (state.tokens) {
        await authClient.logout(
          { refreshToken: state.tokens.refreshToken },
          state.tokens.accessToken
        );
      }

      localStorage.removeItem(storageKey);
      setState({ user: null, tokens: null, ready: true });
    },
    forgotPassword(request) {
      return authClient.forgotPassword(request);
    },
    requestEmailConfirmation(request) {
      return authClient.requestEmailConfirmation(request);
    },
    async confirmEmail(request) {
      return authClient.confirmEmail(request);
    },
    async resetPassword(request) {
      return authClient.resetPassword(request);
    },
    async refresh() {
      if (!state.tokens) {
        throw new Error("No active session.");
      }

      const tokens = await authClient.refresh({
        refreshToken: state.tokens.refreshToken
      } satisfies RefreshTokenRequest);
      const user = await authClient.me(tokens.accessToken);
      localStorage.setItem(storageKey, JSON.stringify(tokens));
      setState({ user, tokens, ready: true });
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return value;
}
