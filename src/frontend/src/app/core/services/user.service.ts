import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ChangePasswordRequest, UpdateProfileRequest, UserProfileResponse } from '../models/user.models';
import { SuccessResponse } from '../models/core.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/users`;

  // 1. Lấy thông tin người dùng hiện tại (bao gồm địa chỉ)
  getMe(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.baseUrl}/me`);
  }

  // 2. Cập nhật hồ sơ (Tên, Avatar)
  updateProfile(payload: UpdateProfileRequest): Observable<SuccessResponse> {
    return this.http.put<SuccessResponse>(`${this.baseUrl}/profile`, payload);
  }

  // 3. Đổi mật khẩu
  changePassword(payload: ChangePasswordRequest): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(`${this.baseUrl}/change-password`, payload);
  }
}