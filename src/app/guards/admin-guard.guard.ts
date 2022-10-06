import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuardGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {

    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      if (currentUser.roleName === 'admin') {
        // logged in so return true
        console.log('admin1');
        return true;
      }
    }

    console.log('admin2');
    this.router.navigate(['/']);
    return false;

  }

}
