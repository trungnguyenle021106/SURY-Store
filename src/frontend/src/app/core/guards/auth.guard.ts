import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, catchError, of } from 'rxjs'; // Thêm catchError, of

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser()) {
    return true;
  }

  return authService.fetchUserInfo().pipe(
    map(user => {
      if (user) {
        return true;
      } else {
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    }),
    // Thêm đoạn này để bắt lỗi nếu API chết hẳn
    catchError(() => {
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
        return of(false);
    })
  );
};