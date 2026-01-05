import { HttpClient } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { Observable, tap, catchError, of, map } from "rxjs"; // Thêm operators
import { environment } from "../../environments/environment";
import { IdResponse, SuccessResponse } from "../models/core.models";
import { AuthUserInfo, ForgotPasswordRequest, ForgotPasswordResponse, LoginRequest, RegisterRequest, ResetPasswordRequest } from "../models/auth.models";
import { Router } from "@angular/router";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private baseUrl = `${environment.apiUrl}/auth`;

  // --- STATE USER (Signal) ---
  // null = chưa login, AuthUserInfo = đã login
  currentUser = signal<AuthUserInfo | null>(null);

  // 1. Login
  login(payload: LoginRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/login`, payload).pipe(
      // Login xong thì gọi luôn API lấy info để cập nhật State
      tap(() => this.fetchUserInfo().subscribe())
    );
  }

  // 2. Logout
  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {}).pipe(
      tap(() => {
        this.currentUser.set(null); // Xóa state
        this.router.navigate(['/auth/login']);
      })
    );
  }

  // 3. Refresh Token
  refreshToken(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/refresh-token`, {});
  }

  // 4. Register
  register(payload: RegisterRequest): Observable<IdResponse> {
    return this.http.post<IdResponse>(`${this.baseUrl}/register`, payload);
  }

  // 5. Forgot Password
  forgotPassword(payload: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.baseUrl}/forgot-password`, payload);
  }

  // 6. Reset Password
  resetPassword(payload: ResetPasswordRequest): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(`${this.baseUrl}/reset-password`, payload);
  }

  // 7. Get Current User Info (Gọi cái này khi App khởi động hoặc sau khi Login)
  getTokenInfo(): Observable<AuthUserInfo> {
    return this.http.get<AuthUserInfo>(`${this.baseUrl}/info`);
  }

  // --- HELPER METHODS ---
  
  // Hàm này dùng để load thông tin user và set vào Signal
  fetchUserInfo(): Observable<AuthUserInfo | null> {
    return this.getTokenInfo().pipe(
      tap(user => this.currentUser.set(user)), // Thành công -> Set User
      catchError(() => {
        this.currentUser.set(null); // Lỗi -> Set null
        return of(null);
      })
    );
  }

  // Check quyền Admin
  isAdmin(): boolean {
    const user = this.currentUser();
    return user ? user.roles.includes('Admin') : false;
  }
}