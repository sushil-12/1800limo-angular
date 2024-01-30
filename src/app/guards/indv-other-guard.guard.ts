import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class IndvOtherGuardGuard implements CanActivate {
  constructor(
    private router: Router,

  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot){
      const currentUser: any = JSON.parse(localStorage.getItem('currentUser'))
      if (currentUser?.roleName != 'individual'  && currentUser?.roleName != 'admin') {
        console.log("in indv guard false")
        this.router.navigate(['/home']);
        return false;
      }
      console.log("in indv guard false true")
      return true;
    }
  
}
