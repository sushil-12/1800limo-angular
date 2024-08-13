import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SubAffiliateGuard implements CanActivate {
  constructor(
    private router: Router,

  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){
      const currentUser: any = JSON.parse(localStorage.getItem('userData'))
      if (currentUser?.RoleName != 'sub_affiliate'  && currentUser?.RoleName != 'admin') {
        this.router.navigate(['/home']);
        return false;
      }
      return true;
    }
  
}