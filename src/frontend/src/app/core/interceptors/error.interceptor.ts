import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError, switchMap, BehaviorSubject, filter, take, EMPTY } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Cờ đánh dấu đang refresh để tránh gọi refresh 2-3 lần cùng lúc
let isRefreshing = false;
// Hàng đợi để các request khác chờ trong lúc đang refresh
const refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {

      const currentUrl = router.url; // Lấy URL hiện tại trên thanh địa chỉ

      // Kiểm tra xem URL có chứa reset-password hay forgot-password không
      if (currentUrl.includes('/auth/reset-password') || currentUrl.includes('/auth/forgot-password')) {
        // Nếu đúng, ném lỗi ra cho Component tự xử lý, INTERCEPTOR DỪNG TẠI ĐÂY.
        return throwError(() => error);
      }

      // Xử lý khi gặp lỗi 401 (Unauthorized)
      if (error.status === 401) {

        // Trường hợp 1: Nếu chính cái request 'refresh-token' hoặc 'login' bị lỗi 401
        // Nghĩa là hết thuốc chữa -> Logout và về trang login ngay.
        if (req.url.includes('auth/refresh-token') || req.url.includes('auth/login') || req.url.includes('auth/info')) {
          authService.currentUser.set(null);
          //  router.navigate(['/auth/login']);
          return throwError(() => error);
        }

        // Trường hợp 2: Các request bình thường bị 401 -> Thử Refresh Token
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null); // Block các request khác

          return authService.refreshToken().pipe(
            switchMap(() => {
              isRefreshing = false;
              refreshTokenSubject.next(true); // Mở khóa

              // Refresh thành công! Browser đã tự cập nhật Cookie mới.
              // Ta chỉ cần gọi lại request ban đầu (req).
              return next(req);
            }),
            catchError((refreshErr) => {
              // Refresh thất bại (Refresh token cũng hết hạn) -> Logout
              isRefreshing = false;
              authService.currentUser.set(null);
              router.navigate(['/']);
              return throwError(() => refreshErr);
            })
          );
        } else {
          // Trường hợp 3: Có 1 thằng khác đang refresh rồi, request này phải chờ
          return refreshTokenSubject.pipe(
            filter(token => token != null), // Chờ đến khi subject có giá trị (refresh xong)
            take(1),
            switchMap(() => {
              // Refresh xong rồi, thử gọi lại request này
              return next(req);
            })
          );
        }
      }

      // Xử lý lỗi 403 (Forbidden - Không có quyền)
      if (error.status === 403) {
        router.navigate(['/']); // Đá về trang chủ hoặc trang Access Denied
      }

      return throwError(() => error);
    })
  );
};