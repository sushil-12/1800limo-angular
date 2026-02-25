import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
	providedIn: 'root'
})
export class WebsiteService {

	private serverUrl = environment.serverUrl;
	constructor(private httpClient: HttpClient) { }

	async getOurVehicles() {
		const result = await this.httpClient.get(this.serverUrl + 'vehicle-types').toPromise();
		return result;
	}
	async getFleetVehicles() {
		const result = await this.httpClient.get(this.serverUrl + 'vehicle-types-formatted').toPromise();
		return result;
	}
	affiliateEmailVerification(email: any, hash: any, is_dispatch: boolean) {
		if (is_dispatch) {
			return this.httpClient.get(this.serverUrl + 'affiliate/dispatcher-email-verification/' + email + '/' + hash);
		} else {
			return this.httpClient.get(this.serverUrl + 'affiliate/email-verification/' + email + '/' + hash);
		}
	}
	contactFormData(data) {
		return this.httpClient.post(this.serverUrl + 'contact-form', data);
	}






	// ---------------------------------- HOMEPAGE API ---------------------------------------------------------   






	fetchHomePageData() {
		return this.httpClient.get(this.serverUrl + 'cms/homepage');
	}
}
