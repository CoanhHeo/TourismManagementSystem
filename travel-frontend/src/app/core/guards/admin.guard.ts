import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/api/auth.service';
import { map } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      if (!user) {
        // Not logged in, redirect to login
        router.navigate(['/login']);
        return false;
      }

      // Handle both string and object role formats
      const roleName = typeof user.role === 'string' ? user.role : user.role?.roleName;
      const isAdmin = roleName === 'ADMIN' || roleName === 'Admin';
      
      if (!isAdmin) {
        // Not an admin, redirect to tours page
        router.navigate(['/tours']);
        return false;
      }

      return true;
    })
  );
};
