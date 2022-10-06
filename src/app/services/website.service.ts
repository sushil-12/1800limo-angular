import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
	providedIn: 'root'
})
export class WebsiteService
{

	private serverUrl = environment.serverUrl;
	constructor(private httpClient: HttpClient) { }

	async getOurVehicles()
	{
		const result = await this.httpClient.get(this.serverUrl + 'vehicle-types').toPromise();
		return result;
	}
	affiliateEmailVerification(email, hash)
	{
		return this.httpClient.get(this.serverUrl + 'affiliate/email-verification/' + email + '/' + hash);
	}
	dispatchEmailVerification(email, hash)
	{
		return this.httpClient.get(this.serverUrl + 'affiliate/dispatcher-email-verification/' + email + '/' + hash);
	}
	contactFormData(data)
	{
		return this.httpClient.post(this.serverUrl + 'contact-form', data);
	}






	// ---------------------------------- HOMEPAGE API ---------------------------------------------------------   






	fetchHomePageData()
	{
		return this.httpClient.get(this.serverUrl + 'cms/homepage');
	}
}
