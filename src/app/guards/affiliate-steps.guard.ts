import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AffiliateService } from '../services/affiliate.service';
import { ErrorDialogService } from '../services/error-dialog/errordialog.service';

@Injectable({
  providedIn: 'root'
})
export class AffiliateStepsGuard implements CanActivate {

  constructor(
    private router: Router,
    private authService: AuthService,
    private affiliateService: AffiliateService,
    public errorDialogService: ErrorDialogService
  ) { }
  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot) {
    const account_approval = localStorage.getItem("account_approval");
    if (account_approval == 'completed')//redirect user to account status screen if account status is completed
    {
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
        this.router.navigate(['/affiliate/account-status'])
      );
    }

    const stepCompleted = this.affiliateService.getLocalStepCompleted();
    const lastPartUrl = route.url[0].path;
    const currentStep = parseInt(lastPartUrl.charAt(lastPartUrl.length - 1));
    let nextStep: number;
    console.log('show data', lastPartUrl, currentStep, stepCompleted);


    // Allow/Disallow route based on step completion
    if (currentStep <= 1)//if current step is 1 or below
    {
      if (currentStep == 0)//if current step is 0
      {
        console.log('step 0 allowed');
        return true;
      }
      else {//if current step is 1
        if (stepCompleted.includes('0'))//if step 0 is completed
        {
          console.log('step 1 allowed');
          return true;
        }
        else {//if no step is completed
          console.log('step 1 not allowed');
          nextStep = 0;
        }
      }
    }
    else {//if current step is 2 or above
      if (stepCompleted.includes('1'))//if step 1 is completed
      {
        console.log('step greater than 1 allowed');
        return true;
      }
      else if (stepCompleted.includes('0')) {//if step 0 is completed
        console.log('step greater than 1 redirected to step 1');
        nextStep = 1;
      }
      else {//if no step is completed
        console.log('step greater than 1 redirected to step 0');
        nextStep = 0;
      }
    }

    //redirect user to a step with error message
    const errors = {
      errors: {
        error: "Please complete step " + nextStep + " first!"
      }
    }
    this.errorDialogService.openDialog(errors);
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
      this.router.navigate(['/affiliate/step' + nextStep])
    );
    return false;
  }

}
