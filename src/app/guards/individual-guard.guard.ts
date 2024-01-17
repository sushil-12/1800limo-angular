import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { ErrorDialogService } from '../services/error-dialog/errordialog.service';

@Injectable({
  providedIn: 'root'
})
export class IndividualGuardGuard implements CanActivate {
  constructor(
    private router: Router,
    private errorDialog: ErrorDialogService,

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
      if(!currentUser?.is_profile_complete){
        console.log("in indv guard profile complete")
        this.errorDialog.openDialog({
          errors: {
            error: 'Please complete profile first'
          }
        })
        this.router.navigate(['/individual/profile']);
        return false;
      }
      console.log("in indv guard false true")
      return true;
    }
  
}
