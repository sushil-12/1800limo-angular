import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AffiliateDriverGuard implements CanActivate {
  constructor(
    private router: Router,

  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){
      const currentUser: any = JSON.parse(localStorage.getItem('userData'))
      if (currentUser?.RoleName != 'affiliate_driver'  && currentUser?.RoleName != 'admin') {
        this.router.navigate(['/home']);
        return false;
      }
      return true;
    }
  
}