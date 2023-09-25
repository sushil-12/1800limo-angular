import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class QuotebotService
{

	private serverUrl = environment.serverUrl;
	constructor(private httpClient: HttpClient) { }

	fileAQuote(data: any)
	{
		return this.httpClient.post(`${this.serverUrl}quote`, data)
	}

	getAllFilters()
	{
		return this.httpClient.get(this.serverUrl + 'quote/filters');
	}


	/**
	 * Fetch the vehicles according to the applied filters
	 * @param filters the filter object
	 * @returns HttpClient Observable
	 */
	getVehicleDetails(filters: any)
	{
		return this.httpClient.post(`${this.serverUrl}quote/vehicle-listing`, filters)
	}

	getMasterVehicleTypes(quotebot_data: any)
	{
		return this.httpClient.post(`${this.serverUrl}quote/master-vehicle-listing`, quotebot_data)
	}


	getAirportsData()
	{
		console.log('Fetching Airports Data')
		return this.httpClient.get(`${this.serverUrl}get-airports`)
	}

	createBooking(data: any, update_type: string) {
		if (update_type == 'return' || update_type == 'repeat') {
			return this.httpClient.post(`${this.serverUrl}duplicate-reservation`, data)
		}
		if (data.reservation_id) {
			return this.httpClient.put(this.serverUrl + 'edit-reservation', data);
		}
		else {
			return this.httpClient.post(this.serverUrl + 'create-reservation', data);
		}
	}
}
