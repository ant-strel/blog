import type {
  AuthUser,
  ConfirmEmailRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RequestEmailConfirmationRequest,
  ResetPasswordRequest,
  SessionTokens
} from "@template/contracts";

export interface AuthClient {
  login(request: LoginRequest): Promise<SessionTokens>;
  me(accessToken: string): Promise<AuthUser>;
  refresh(): Promise<SessionTokens>;
  logout(accessToken: string): Promise<void>;
  forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string }>;
  resetPassword(request: ResetPasswordRequest): Promise<{ message: string }>;
  requestEmailConfirmation(
    request: RequestEmailConfirmationRequest
  ): Promise<{ message: string }>;
  confirmEmail(request: ConfirmEmailRequest): Promise<{ message: string }>;
}

const jsonHeaders = {
  "Content-Type": "application/json"
};

export class ApiAuthClient implements AuthClient {
  constructor(private readonly baseUrl: string) {}

  async login(request: LoginRequest): Promise<SessionTokens> {
    return this.post<SessionTokens>("/api/auth/login", request);
  }

  async me(accessToken: string): Promise<AuthUser> {
    return this.fetchJson<AuthUser>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  async refresh(): Promise<SessionTokens> {
    return this.post<SessionTokens>("/api/auth/refresh");
  }

  async logout(accessToken: string): Promise<void> {
    await this.fetchJson<void>("/api/auth/logout", {
      method: "POST",
      headers: {
        ...jsonHeaders,
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  async forgotPassword(
    request: ForgotPasswordRequest
  ): Promise<{ message: string }> {
    return this.post("/api/auth/forgot-password", request);
  }

  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    return this.post("/api/auth/reset-password", request);
  }

  async requestEmailConfirmation(
    request: RequestEmailConfirmationRequest
  ): Promise<{ message: string }> {
    return this.post("/api/auth/request-email-confirmation", request);
  }

  async confirmEmail(request: ConfirmEmailRequest): Promise<{ message: string }> {
    return this.post("/api/auth/confirm-email", request);
  }

  private async post<T>(path: string, body?: unknown): Promise<T> {
    return this.fetchJson<T>(path, {
      method: "POST",
      headers: jsonHeaders,
      body: body === undefined ? undefined : JSON.stringify(body)
    });
  }

  private async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      ...init,
      credentials: "include"
    });
    if (!response.ok) {
      const message = await readErrorMessage(response);
      throw new Error(message);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  }
}

interface MockUserRecord {
  user: AuthUser;
  password: string;
  emailConfirmed: boolean;
}

const mockUsers = new Map<string, MockUserRecord>();
mockUsers.set("editor@example.com", {
  user: {
    id: "mock-editor",
    email: "editor@example.com",
    firstName: "Editorial",
    lastName: "Owner",
    isActive: true,
    roles: ["Editor", "Admin"]
  },
  password: "Editor123!",
  emailConfirmed: true
});

const refreshTokens = new Map<string, string>();

export class MockAuthClient implements AuthClient {
  async login(request: LoginRequest): Promise<SessionTokens> {
    await delay(180);
    const record = mockUsers.get(request.login.toLowerCase());
    if (!record || record.password !== request.password || !record.emailConfirmed) {
      throw new Error("Invalid credentials.");
    }

    return issueMockTokens(record.user.id);
  }

  async me(accessToken: string): Promise<AuthUser> {
    await delay(80);
    const userId = parseAccessToken(accessToken);
    const record = Array.from(mockUsers.values()).find((candidate) => candidate.user.id === userId);
    if (!record) {
      throw new Error("Session expired.");
    }

    return record.user;
  }

  async refresh(): Promise<SessionTokens> {
    await delay(80);
    const currentRefreshToken = Array.from(refreshTokens.keys()).at(-1);
    const userId = currentRefreshToken ? refreshTokens.get(currentRefreshToken) : undefined;
    if (!userId) {
      throw new Error("Invalid refresh token.");
    }

    return issueMockTokens(userId, currentRefreshToken);
  }

  async logout(): Promise<void> {
    await delay(60);
    refreshTokens.clear();
  }

  async forgotPassword(
    request: ForgotPasswordRequest
  ): Promise<{ message: string }> {
    await delay(120);
    return {
      message: "If the account exists, a reset token was generated."
    };
  }

  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    await delay(120);
    const record = mockUsers.get(request.login.toLowerCase());
    if (!record || request.token !== `reset-${record.user.id}`) {
      throw new Error("Invalid email or token.");
    }

    record.password = request.newPassword;
    return { message: "Password has been reset." };
  }

  async requestEmailConfirmation(
    request: RequestEmailConfirmationRequest
  ): Promise<{ message: string }> {
    await delay(120);
    return {
      message: "If the account exists, a confirmation token was generated."
    };
  }

  async confirmEmail(request: ConfirmEmailRequest): Promise<{ message: string }> {
    await delay(120);
    const record = mockUsers.get(request.login.toLowerCase());
    if (!record || request.token !== `confirm-${record.user.id}`) {
      throw new Error("Invalid email or token.");
    }

    record.emailConfirmed = true;
    return { message: "Email confirmed." };
  }
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const payload = (await response.json()) as { message?: string; detail?: string };
    return payload.message ?? payload.detail ?? `Request failed with status ${response.status}`;
  } catch {
    return `Request failed with status ${response.status}`;
  }
}

function issueMockTokens(userId: string, currentRefreshToken?: string): SessionTokens {
  if (currentRefreshToken) {
    refreshTokens.delete(currentRefreshToken);
  }

  const accessToken = `mock-access:${userId}:${Date.now()}`;
  const refreshToken = `mock-refresh:${crypto.randomUUID()}`;
  refreshTokens.set(refreshToken, userId);

  return {
    accessToken,
    accessTokenExpiresAtUtc: new Date(Date.now() + 1000 * 60 * 15).toISOString(),
    refreshTokenExpiresAtUtc: new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString()
  };
}

function parseAccessToken(token: string): string {
  const [, userId] = token.split(":");
  return userId;
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
