import { Component, AfterViewChecked, OnInit } from '@angular/core';
import { StateManagementService } from './services/statemanagement.service';
import { environment } from 'src/environments/environment';
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
		try
		{
			console.info("Environment: ", environment['environmentName']);
			console.info('ServerURL: ', environment['serverUrl']);
		} catch
		{
			console.error('Error while parsing Environments file. Current Env file is ...');
			console.error(environment);
		}
		this.stateManagementService.getError().subscribe(data =>
		{
			this.errors = data;
		});

		this.loadClarity();

	}

	loadClarity() {
		const clarityId = environment.production ? 's8h568cke2' : 's4gfuspb5j';
	
		const clarityScriptContent = `
		  (function(c,l,a,r,i,t,y){
			c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
			t=l.createElement(r); t.async=1; t.src="https://www.clarity.ms/tag/"+i;
			y=l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t,y);
		  })(window, document, "clarity", "script", "${clarityId}");
		`;
	
		const script = document.createElement('script');
		script.type = 'text/javascript';
		script.text = clarityScriptContent;
		document.head.appendChild(script);
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
