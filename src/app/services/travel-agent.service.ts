import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class TravelAgentService {

  private environmentServerUrl = environment.serverUrl;
	private serverUrl = environment.serverUrl + 'travel-planner/';
  constructor(private httpClient: HttpClient) { }

  getProfileDetail()
	{
		return this.httpClient.get(`${this.serverUrl}get-profile-data`)
	}

  updateProfile(data){
    return this.httpClient.post(this.serverUrl + 'edit-travel-planner-account', data);
  }
  
}
