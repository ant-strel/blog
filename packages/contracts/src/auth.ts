export interface SessionTokens {
  accessToken: string;
  accessTokenExpiresAtUtc: string;
  refreshTokenExpiresAtUtc: string;
}

export interface AuthUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  roles: string[];
}

export interface LoginRequest {
  login: string;
  password: string;
}

export interface ForgotPasswordRequest {
  login: string;
}

export interface ResetPasswordRequest {
  login: string;
  token: string;
  newPassword: string;
}

export interface RequestEmailConfirmationRequest {
  login: string;
}

export interface ConfirmEmailRequest {
  login: string;
  token: string;
}
