import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Logic kiểm tra quyền Admin
  const checkAdmin = (user: any) => {
    if (user && user.roles.includes('Admin')) {
      return true;
    }
    // Đã login nhưng không phải Admin -> Đá về trang chủ hoặc 403
    router.navigate(['/']); 
    return false;
  };

  if (authService.currentUser()) {
    return checkAdmin(authService.currentUser());
  }

  return authService.fetchUserInfo().pipe(
    map(user => {
      if (user) {
        return checkAdmin(user);
      } else {
        router.navigate(['/auth/login']);
        return false;
      }
    })
  );
};