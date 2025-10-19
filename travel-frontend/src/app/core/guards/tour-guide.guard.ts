import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/api/auth.service';
import { map } from 'rxjs/operators';

export const tourGuideGuard: CanActivateFn = (route, state) => {
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
      const isTourGuide = roleName === 'Tour Guide' || roleName === 'TOUR_GUIDE';
      
      if (!isTourGuide) {
        // Not a tour guide, redirect to appropriate page based on role
        if (roleName === 'Admin' || roleName === 'ADMIN') {
          router.navigate(['/admin']);
        } else {
          router.navigate(['/tours']);
        }
        return false;
      }

      return true;
    })
  );
};