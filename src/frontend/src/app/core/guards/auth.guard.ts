import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map, of, switchMap } from 'rxjs';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // 1. Nếu đã có thông tin user trong signal -> Cho qua
  if (authService.currentUser()) {
    return true;
  }

  // 2. Nếu chưa có (F5 trang), thử gọi API lấy info
  return authService.fetchUserInfo().pipe(
    map(user => {
      if (user) {
        return true; // Lấy được info -> Cho qua
      } else {
        // Không lấy được -> Chưa login -> Đá về login
        router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
        return false;
      }
    })
  );
};