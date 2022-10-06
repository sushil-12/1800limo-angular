import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AffiliateService } from '../services/affiliate.service';
import { ErrorDialogService } from '../services/error-dialog/errordialog.service';

@Injectable({
  providedIn: 'root'
})
export class AffiliateOtherRouteGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
    private affiliateService: AffiliateService,
    public errorDialogService: ErrorDialogService
  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    console.log('affiliate_other_step');
    const affiliateAccountStatus = localStorage.getItem("account_approval");
    const stepCompleted = this.affiliateService.getLocalStepCompleted();
    const secondPartUrl = route.url[0].path;

    switch (secondPartUrl) {
      case 'profile': {
        return true;
      }
      case 'account-status': {
        if (affiliateAccountStatus == 'completed' || affiliateAccountStatus == 'rejected') {//allow account status
          console.log('account status allowed because account status is completed or rejected');
          return true;
        }
        else if (affiliateAccountStatus == 'accepted') {//redirect to my-booking screen
          console.log('redirect to my-booking screen');
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate(['/affiliate/my-bookings'])
          );
          return false;
        }
        else {//redirect user to a step
          console.log('redirect user to a step');
          let nextStep: number;
          if (stepCompleted.includes('1')) {
            nextStep = 1;
          }
          else {
            nextStep = 0;
          }
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate(['/affiliate/step' + nextStep])
          );
          return false;
        }
        break;
      }
      default: {
        if (affiliateAccountStatus == 'accepted') {//allow all booking/other routes
          console.log('allow all booking/other routes');
          return true;
        }
        else if (affiliateAccountStatus == 'completed' || affiliateAccountStatus == 'rejected') {//redirect to account status
          console.log('redirect to account status in case of completed and rejected');
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate(['/affiliate/account-status'])
          );
          return false;
        }
        else {//redirect user to a step
          console.log('redirect user to a step');
          let nextStep: number;
          if (stepCompleted.includes('1')) {
            nextStep = 1;
          }
          else {
            nextStep = 0;
          }
          this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
            this.router.navigate(['/affiliate/step' + nextStep])
          );
          return false;
        }
        break;
      }
    }
    return false;
  }

}
