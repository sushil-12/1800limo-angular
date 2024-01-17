import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { TravelAgentService } from '../services/travel-agent.service';
import { ErrorDialogService } from '../services/error-dialog/errordialog.service';
import { Location } from '@angular/common';
import { StateManagementService } from '../services/statemanagement.service';
import { AuthService } from '../services/auth.service';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CheckProfileCompleteGuard implements CanActivate {
  constructor(
    private router: Router,
    private agentService: TravelAgentService,
    private errorDialog: ErrorDialogService,
    private location: Location,
    private stateManagementService: StateManagementService,
    private authService: AuthService,
  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      var referringURL = document.referrer;
      console.log('referringURL',this.location.path(true))
    const currentUser: any = JSON.parse(localStorage.getItem('userData'))
    const accountStatus: any=localStorage.getItem('agentAccountStatus')
    if (currentUser?.RoleName != 'travel_agent' && currentUser?.RoleName != 'admin') {
      localStorage.setItem('review_referral_url',this.location.path(true))
      this.router.navigate(['/home']);
      return false;
    }
    if (this.agentService.getStepCompletedObj()) {
      for (let [key, value] of Object.entries(this.agentService.getStepCompletedObj())) {
        console.log('value-->>' , value)
        if (value == 'uncompleted') {
          this.errorDialog.openDialog({
            errors: {
              error: 'Please complete the registration first'
            }
          })
          this.router.navigate([`/travel_agent/profile/${key}`]);
        }
        if(value =='completed' && accountStatus == 'pending'){
          this.errorDialog.openDialog({
            errors: {
              error: `Please wait! As your account status is ${accountStatus} from admin.`
            }
          })
          this.router.navigate([`/travel_agent/profile/step1`]);
        }
        else if(value =='completed' && accountStatus == 'rejected'){
          this.errorDialog.openDialog({
            errors: {
              error: `Your account is being rejected by admin. Currently we are logging you out. Please contact admin!`
            }
          })
          this.router.navigate([`/travel_agent/profile/step1`]);
          setTimeout(()=>{
            console.log("in timeout")
            // this.spinner.show('logoutspinner')
            this.authService.logout()
            .pipe(
              catchError(err =>
              {
                // this.spinner.hide('logoutspinner');//hide spinner
                return throwError(err);
              })
            ).subscribe(({ success }: any) =>
            {
              // this.spinner.hide('logoutspinner');//hide spinner
              if (success == true)
              {
                this.stateManagementService.removeUser();
              }
              this.router.navigate(['/']);
            });
           },15000)
        }
      }
    }
    // if (this.authService.checkIsProfileCompleted()) {
    //   console.log("in if travel agenr",this.authService.checkIsProfileCompleted())
    //     return true;
    // }
    // this.errorDialog.openDialog({
    //   errors: {
    //     error: 'Please complete the registration first'
    //   }
    // })
    // console.log('travel agent profile');
    // this.router.navigate(['/travel_agent/profile/step1']);
    return true;
  }


}
