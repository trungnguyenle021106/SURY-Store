export interface UserProfile {
  id: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  verifyToken: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  isSuccess: boolean;
}

export interface AuthUserInfo {
  id: string;
  fullName: string;
  email: string;
  roles: string[]; // Quan trọng để phân quyền (Customer/Admin)
}
