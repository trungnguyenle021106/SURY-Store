// src/app/core/interceptors/credentials.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

export const credentialsInterceptor: HttpInterceptorFn = (req, next) => {
  const clonedRequest = req.clone({
    withCredentials: true
  });
  return next(clonedRequest);
};