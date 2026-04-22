import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/models';

/**
 * Factory guard — call with the list of roles allowed on a route.
 *
 * Usage in routes:
 *   canActivate: [authGuard, roleGuard(['admin'])]
 */
export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (_route, _state) => {
    const auth   = inject(AuthService);
    const router = inject(Router);

    if (!auth.isLoggedIn()) {
      return router.createUrlTree(['/login']);
    }

    const role = auth.userRole();
    if (role && allowedRoles.includes(role)) return true;

    // Wrong role → redirect to their own dashboard
    return router.createUrlTree([auth.getDashboardRoute()]);
  };
};
