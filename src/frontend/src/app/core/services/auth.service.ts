import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { Observable } from "rxjs/internal/Observable";
import { environment } from "../../environments/environment";
import { IdResponse, SuccessResponse } from "../models/core.models";
import { ForgotPasswordRequest, ForgotPasswordResponse, LoginRequest, RegisterRequest, ResetPasswordRequest } from "../models/auth.models";

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.apiUrl}/auth`;

  // 1. Login
  login(payload: LoginRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/login`, payload);
  }

  // 2. Logout
  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/logout`, {});
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
  // Backend yêu cầu body { email: "string" }
  forgotPassword(payload: ForgotPasswordRequest): Observable<ForgotPasswordResponse> {
    return this.http.post<ForgotPasswordResponse>(`${this.baseUrl}/forgot-password`, payload);
  }

  // 6. Reset Password
  resetPassword(payload: ResetPasswordRequest): Observable<SuccessResponse> {
    return this.http.post<SuccessResponse>(`${this.baseUrl}/reset-password`, payload);
  }
}