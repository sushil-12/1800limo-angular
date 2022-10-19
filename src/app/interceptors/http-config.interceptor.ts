import { Injectable } from '@angular/core';
import
{
	HttpInterceptor,
	HttpRequest,
	HttpResponse,
	HttpHandler,
	HttpEvent,
	HttpErrorResponse
} from '@angular/common/http';
import { StateManagementService } from '../services/statemanagement.service';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ErrorDialogService } from '../services/error-dialog/errordialog.service';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor
{
	public errors: any;
	constructor(
		public errorDialogService: ErrorDialogService,
		private authService: AuthService,
		private router: Router,
		private $spinner: NgxSpinnerService,
		private stateManagementService: StateManagementService
	) { }

	intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>>
	{
		const token: string = localStorage.getItem('token');

		if (token)
		{
			request = request.clone({ headers: request.headers.set('Authorization', 'Bearer ' + token) });
		}

		if (!request.headers.has('Content-Type'))
		{
			request = request.clone({ headers: request.headers.set('Content-Type', 'application/json') });
		}

		request = request.clone({ headers: request.headers.set('Accept', 'application/json') });

		return next.handle(request).pipe(
			map((event: HttpEvent<any>) =>
			{
				if (event instanceof HttpResponse)
				{
					console.log('\n\nevent--->>>', event, '\n\n');
				}
				return event;
			}),
			catchError((errorData: HttpErrorResponse) =>
			{
				this.$spinner.hide()
				if (errorData.status == 401)
				{
					console.log('auth error', errorData.error);
					this.errors = {
						errors: {
							error: "Unauthorized Access"
						}
					}
					this.router.navigate(['/']);
					this.stateManagementService.removeUser();
				}
				// else if (errorData.status == 0) {
				//   this.errors = {
				//     errors: {
				//       error: "Please check your internet connection"
				//     }
				//   }
				// }
				else if (errorData.status == 500)
				{
					this.errors = {
						errors: {
							error: "Server Error"
						}
					}
				}
				else
				{
					this.errors = errorData.error.data;
				}
				this.errorDialogService.openDialog(this.errors);
				return throwError(this.errors);
			}));
	}
}