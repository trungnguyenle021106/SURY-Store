import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { MessageService } from 'primeng/api'; // Nếu muốn hiện thông báo lỗi

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  // const messageService = inject(MessageService); // Có thể inject để báo lỗi

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // Xử lý lỗi 401 (Unauthorized) - Thường do Cookie hết hạn hoặc chưa đăng nhập
      if (error.status === 401) {
        // Có thể gọi API Logout ở đây nếu cần clear session phía server
        // messageService.add({severity: 'error', summary: 'Hết phiên', detail: 'Vui lòng đăng nhập lại'});
        
        // Chuyển hướng về trang login
        router.navigate(['/auth/login']);
      }
      
      // Xử lý lỗi 403 (Forbidden) - Đăng nhập rồi nhưng không có quyền (VD: User thường vào trang Admin)
      if (error.status === 403) {
        router.navigate(['/']); // Đá về trang chủ hoặc trang 403
      }

      return throwError(() => error);
    })
  );
};