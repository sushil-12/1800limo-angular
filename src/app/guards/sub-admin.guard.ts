import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubAdminGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    const currentUser = this.authService.currentUserValue;

    if (currentUser) {
      if (currentUser.roleName === 'admin' || currentUser.roleName === 'sub_admin') {
        // logged in so return true
        console.log('sub_admin1');
        return true;
      }
    }

    console.log('sub_admin2');
    this.router.navigate(['/']);
    return false;
  }

}
