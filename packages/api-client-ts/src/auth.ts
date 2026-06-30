import type {
  AuthUser,
  ConfirmEmailRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  RegisterResponse,
  RequestEmailConfirmationRequest,
  ResetPasswordRequest,
  SessionTokens
} from "@template/contracts";

export interface AuthClient {
  login(request: LoginRequest): Promise<SessionTokens>;
  register(request: RegisterRequest): Promise<RegisterResponse>;
  me(accessToken: string): Promise<AuthUser>;
  refresh(request: RefreshTokenRequest): Promise<SessionTokens>;
  logout(request: RefreshTokenRequest, accessToken: string): Promise<void>;
  forgotPassword(request: ForgotPasswordRequest): Promise<{ message: string; token?: string }>;
  resetPassword(request: ResetPasswordRequest): Promise<{ message: string }>;
  requestEmailConfirmation(
    request: RequestEmailConfirmationRequest
  ): Promise<{ message: string; token?: string }>;
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

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    return this.post<RegisterResponse>("/api/auth/register", request);
  }

  async me(accessToken: string): Promise<AuthUser> {
    return this.fetchJson<AuthUser>("/api/auth/me", {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
  }

  async refresh(request: RefreshTokenRequest): Promise<SessionTokens> {
    return this.post<SessionTokens>("/api/auth/refresh", request);
  }

  async logout(request: RefreshTokenRequest, accessToken: string): Promise<void> {
    await this.fetchJson<void>("/api/auth/logout", {
      method: "POST",
      headers: {
        ...jsonHeaders,
        Authorization: `Bearer ${accessToken}`
      },
      body: JSON.stringify(request)
    });
  }

  async forgotPassword(
    request: ForgotPasswordRequest
  ): Promise<{ message: string; token?: string }> {
    return this.post("/api/auth/forgot-password", request);
  }

  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    return this.post("/api/auth/reset-password", request);
  }

  async requestEmailConfirmation(
    request: RequestEmailConfirmationRequest
  ): Promise<{ message: string; token?: string }> {
    return this.post("/api/auth/request-email-confirmation", request);
  }

  async confirmEmail(request: ConfirmEmailRequest): Promise<{ message: string }> {
    return this.post("/api/auth/confirm-email", request);
  }

  private async post<T>(path: string, body: unknown): Promise<T> {
    return this.fetchJson<T>(path, {
      method: "POST",
      headers: jsonHeaders,
      body: JSON.stringify(body)
    });
  }

  private async fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), init);
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

const mockUsers = new Map<string, MockUserRecord>([
  [
    "editor@example.com",
    {
      user: {
        id: "u-editor",
        email: "editor@example.com",
        firstName: "Editorial",
        lastName: "Owner",
        isActive: true,
        roles: ["User", "Editor"]
      },
      password: "Editor123!",
      emailConfirmed: true
    }
  ]
]);

const refreshTokens = new Map<string, string>();

export class MockAuthClient implements AuthClient {
  async login(request: LoginRequest): Promise<SessionTokens> {
    await delay(180);
    const record = mockUsers.get(request.email.toLowerCase());
    if (!record || record.password !== request.password || !record.emailConfirmed) {
      throw new Error("Invalid credentials.");
    }

    return issueMockTokens(record.user.id);
  }

  async register(request: RegisterRequest): Promise<RegisterResponse> {
    await delay(180);
    const email = request.email.toLowerCase();
    if (mockUsers.has(email)) {
      throw new Error("Email is already registered.");
    }

    const userId = `u-${crypto.randomUUID()}`;
    mockUsers.set(email, {
      user: {
        id: userId,
        email,
        firstName: request.firstName,
        lastName: request.lastName,
        isActive: true,
        roles: ["User"]
      },
      password: request.password,
      emailConfirmed: false
    });

    return {
      userId,
      email
    };
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

  async refresh(request: RefreshTokenRequest): Promise<SessionTokens> {
    await delay(80);
    const userId = refreshTokens.get(request.refreshToken);
    if (!userId) {
      throw new Error("Invalid refresh token.");
    }

    return issueMockTokens(userId, request.refreshToken);
  }

  async logout(request: RefreshTokenRequest): Promise<void> {
    await delay(60);
    refreshTokens.delete(request.refreshToken);
  }

  async forgotPassword(
    request: ForgotPasswordRequest
  ): Promise<{ message: string; token?: string }> {
    await delay(120);
    const record = mockUsers.get(request.email.toLowerCase());
    return {
      message: "If the account exists, a reset token was generated.",
      token: record ? `reset-${record.user.id}` : undefined
    };
  }

  async resetPassword(request: ResetPasswordRequest): Promise<{ message: string }> {
    await delay(120);
    const record = mockUsers.get(request.email.toLowerCase());
    if (!record || request.token !== `reset-${record.user.id}`) {
      throw new Error("Invalid email or token.");
    }

    record.password = request.newPassword;
    return { message: "Password has been reset." };
  }

  async requestEmailConfirmation(
    request: RequestEmailConfirmationRequest
  ): Promise<{ message: string; token?: string }> {
    await delay(120);
    const record = mockUsers.get(request.email.toLowerCase());
    return {
      message: "If the account exists, a confirmation token was generated.",
      token: record ? `confirm-${record.user.id}` : undefined
    };
  }

  async confirmEmail(request: ConfirmEmailRequest): Promise<{ message: string }> {
    await delay(120);
    const record = mockUsers.get(request.email.toLowerCase());
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
    refreshToken,
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
