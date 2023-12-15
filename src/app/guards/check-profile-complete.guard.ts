import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TravelAgentService } from '../services/travel-agent.service';
import { ErrorDialogService } from '../services/error-dialog/errordialog.service';
import { Location } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class CheckProfileCompleteGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: TravelAgentService,
    private errorDialog: ErrorDialogService,
    private location: Location
  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
      var referringURL = document.referrer;
      console.log('referringURL',this.location.path(true))
    const currentUser: any = JSON.parse(localStorage.getItem('userData'))
    if (currentUser?.RoleName != 'travel_agent') {
      localStorage.setItem('review_referral_url',this.location.path(true))
      this.router.navigate(['/home']);
      return false;
    }
    if (this.authService.getStepCompletedObj()) {
      for (let [key, value] of Object.entries(this.authService.getStepCompletedObj())) {
        console.log('value-->>' , value)
        if (value == 'uncompleted') {
          this.errorDialog.openDialog({
            errors: {
              error: 'Please complete the registration first'
            }
          })
          this.router.navigate([`/travel_agent/profile/${key}`]);
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
