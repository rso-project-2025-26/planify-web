export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  mobile?: string;
  consentSms?: boolean;
  consentEmail?: boolean;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface User {
  id: string;
  keycloakId: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  createdAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export interface Organization {
  name: string;
  slug: string;
  business: boolean;
  descriptiona?: string;
  email: string;
  password: string;
}
