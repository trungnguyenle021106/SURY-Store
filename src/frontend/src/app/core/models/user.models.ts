import { UserAddress } from './address.models';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string | null; // Có thể null
  addresses: UserAddress[]; // Danh sách địa chỉ đi kèm profile
}

// Request: PUT /users/profile
export interface UpdateProfileRequest {
  fullName: string;
  avatarUrl?: string;
}

// Request: POST /api/users/change-password
export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}