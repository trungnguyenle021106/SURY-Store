import { 
  HttpErrorResponse, 
  HttpInterceptorFn, 
  HttpRequest,      // Import thêm
  HttpHandlerFn,    // Import thêm
  HttpEvent         // Import thêm
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, catchError, filter, switchMap, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

// Biến cờ để kiểm soát việc đang refresh
let isRefreshing = false;
// Hàng đợi để giữ các request bị lỗi trong khi đang refresh
const refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Nếu gặp lỗi 401 (Unauthorized) VÀ không phải là request login hay refresh-token
      if (error.status === 401 && !req.url.includes('/auth/login') && !req.url.includes('/auth/refresh-token')) {
        return handle401Error(req, next, authService);
      }

      return throwError(() => error);
    })
  );
};

// SỬA: Định nghĩa rõ kiểu cho req, next và kiểu trả về Observable<HttpEvent<any>>
const handle401Error = (
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn, 
  authService: AuthService
): Observable<HttpEvent<any>> => {
  
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null); // Reset subject

    return authService.refreshToken().pipe(
      switchMap(() => {
        isRefreshing = false;
        refreshTokenSubject.next(true); // Báo hiệu đã refresh xong
        
        // Sau khi refresh cookie thành công, gọi lại request ban đầu
        return next(req); 
      }),
      catchError((err) => {
        isRefreshing = false;
        // Nếu refresh cũng lỗi -> Hết cứu -> Logout
        authService.logout().subscribe(); 
        return throwError(() => err);
      })
    );
  } else {
    // Nếu đang có tiến trình refresh chạy rồi, thì các request khác đợi ở đây
    return refreshTokenSubject.pipe(
      filter(result => result === true), // Đợi đến khi true
      take(1),
      switchMap(() => next(req)) // Gọi lại request
    );
  }
};