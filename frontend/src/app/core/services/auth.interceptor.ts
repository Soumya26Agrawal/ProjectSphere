import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Attaches the stored JWT (if any) as a Bearer token on every outgoing request.
 * Skips the /auth/login endpoint itself.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('ps_token');
  const isLogin = req.url.includes('/api/v1/auth/login');

  if (token && !isLogin) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }
  return next(req);
};
