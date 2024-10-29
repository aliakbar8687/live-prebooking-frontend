// auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { PrebookFormService } from './prebook-form.service'; // Adjust the import according to your project structure

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private prebookFormService: PrebookFormService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {
    
    const isAuthenticated = this.prebookFormService.isAuthenticated(); // Check if user is authenticated
    const isAdmin = this.prebookFormService.isAdmin(); // Check if user is admin

    // If the route has a mode query parameter set to 'signup'
    if (route.queryParams['mode'] === 'signup') {
      // Check if the user is not authenticated or not an admin
      if (!isAuthenticated || !isAdmin) {
        this.router.navigate(['/auth']); // Redirect to auth if not admin or not authenticated
        return false;
      }
    }

    // Allow access if authenticated
    if (!isAuthenticated) {
      this.router.navigate(['/auth']); // Redirect to auth if not authenticated
      return false;
    }

    return true;
  }
}
