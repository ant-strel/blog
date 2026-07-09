import { createContext, useContext, useEffect, useState } from "react";
import type {
  AuthUser,
  ConfirmEmailRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RequestEmailConfirmationRequest,
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
  logout(): Promise<void>;
  forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }>;
  requestEmailConfirmation(
    request: RequestEmailConfirmationRequest
  ): Promise<{ message: string }>;
  confirmEmail(request: ConfirmEmailRequest): Promise<{ message: string }>;
  resetPassword(request: ResetPasswordRequest): Promise<{ message: string }>;
  refresh(): Promise<void>;
}

const authClient = createAuthClient();

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<SessionState>({
    user: null,
    tokens: null,
    ready: false
  });

  useEffect(() => {
    let cancelled = false;
    authClient
      .refresh()
      .then(async (tokens) => {
        const user = await authClient.me(tokens.accessToken);
        return { tokens, user };
      })
      .then((session) => {
        if (!cancelled) {
          setState({ user: session.user, tokens: session.tokens, ready: true });
        }
      })
      .catch(() => {
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
      setState({ user, tokens, ready: true });
    },
    async logout() {
      if (state.tokens) {
        await authClient.logout(state.tokens.accessToken);
      }

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

      const tokens = await authClient.refresh();
      const user = await authClient.me(tokens.accessToken);
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
