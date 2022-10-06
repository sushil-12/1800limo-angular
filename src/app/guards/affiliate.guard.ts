import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AffiliateGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      if (currentUser.roleName === 'driver') {
        // logged in so return true
        console.log('affiliate1');
        return true;
      }
    }

    console.log('affiliate2');
    this.router.navigate(['/']);
    return false;
  }

}
