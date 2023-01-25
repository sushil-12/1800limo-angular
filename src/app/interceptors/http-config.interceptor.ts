import { Injectable, isDevMode } from '@angular/core';
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

@Injectable()
export class HttpConfigInterceptor implements HttpInterceptor
{
	public errors: any;
	constructor(
		public errorDialogService: ErrorDialogService,
		private authService: AuthService,
		private router: Router,
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
					if (event.status == 401)
					{
						this.errors = {
							errors: {
								error: 'Unauthorized. Please login again to continue.'
							}
						}
						localStorage.clear()
						sessionStorage.clear()
					}
					else if (event.status == 440)
					{
						this.errors = {
							errors: {
								'error': 'Session Expired. Please re-login to continue. You will be navigated to homepage after 1 second.'
							}
						};
						localStorage.clear();
						sessionStorage.clear();
						setTimeout(() =>
						{
							location.reload()
						}, 2800)
					}
					else if (event.status == 500)
					{
						this.errors = {
							errors: {
								error: "Server Error"
							}
						}
					}
					else if (event.status == 404)
					{
						this.errors = {
							errors: {
								error: 'Server Error. Request Not Found. '
							}
						}
					}
					else if (event.status != 200)
					{
						this.errors = {
							errors: {
								error: Object.values(event['data']['errors']).join('\n')
							}
						};
						if (this.errors.errors.error.includes('account not found'))
						{
							localStorage.clear()
							sessionStorage.clear()
							location.reload()
						}
					}
					else
					{
						isDevMode() && console.log('\n\nevent--->>>', event, '\n\n');
						return event;
					}
					this.errorDialogService.openDialog(this.errors);

				}
			})
		)
	}
}