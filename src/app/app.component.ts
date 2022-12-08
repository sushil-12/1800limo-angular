import { Component, AfterViewChecked, OnInit } from '@angular/core';
import { StateManagementService } from './services/statemanagement.service';
@Component({
	selector: 'app-root',
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit
{
	title = 'limo1800';
	errors: any;

	constructor(
		public stateManagementService: StateManagementService) { }

	ngOnInit(): void
	{
		this.stateManagementService.getError().subscribe(data =>
		{
			this.errors = data;
		});
	}

	storeLastRoute(event: any)
	{
		// should save cookies of these routes
		let inclusive_array = ['admin', 'affiliate', 'individual', 'corporate', 'travel', 'agent']
		if (event.router == undefined)
		{
			return
		}
		console.info(inclusive_array.includes(event.router.url.split('/')[0].toLowerCase()))
		if (inclusive_array.includes(event.router.url.split('/')[0].toLowerCase()))
		{
			console.warn('\n----------------\n')
			console.warn(event.router.url, 'Registering a cookie')
			// set a cookie to store the last route the user navigates to
			let route = event.router.url.substring(1)
			let exdays = 30 * 24 * 60 * 60 * 1000 // 30 days in ms
			let path = '/'

			document.cookie = `lastroute=${route};expires=${exdays};path=${path}`.trim()
		}
	}

}
