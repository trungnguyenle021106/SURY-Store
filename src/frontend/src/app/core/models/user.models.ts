import { UserAddress } from './address.models';

// GET /users/me
export interface UserProfileResponse {
  id: string;
  fullName: string;
  email: string;
  avatarUrl?: string; // Có thể null
  addresses: UserAddress[]; // Danh sách địa chỉ đi kèm
}

// PUT /users/profile
export interface UpdateProfileRequest {
  fullName: string;
  avatarUrl?: string;
}

// POST /users/change-password
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// Response cho Change Password đã dùng SuccessResponse trong core.models.ts