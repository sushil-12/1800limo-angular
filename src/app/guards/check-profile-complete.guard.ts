import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { TravelAgentService } from '../services/travel-agent.service';
import { ErrorDialogService } from '../services/error-dialog/errordialog.service';

@Injectable({
  providedIn: 'root'
})
export class CheckProfileCompleteGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: TravelAgentService ,
    private errorDialog : ErrorDialogService
  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    if (this.authService.checkIsProfileCompleted()) {
      console.log("in if travel agenr",this.authService.checkIsProfileCompleted())
        return true;
    }
    this.errorDialog.openDialog({
      errors: {
        error: 'Please complete the profile first'
      }
    })
    console.log('travel agent profile');
    this.router.navigate(['/travel_agent/profile']);
    return false;
  }

  
}
