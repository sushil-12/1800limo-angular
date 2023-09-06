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

  checkIsProfileCompleted(){
    let loggedInUserData = JSON.parse(localStorage.getItem('currentUser'))
    let role = JSON.parse(localStorage.getItem('userData'))?.RoleName
    if(role=='travel_agent'){
      return loggedInUserData?.is_profile_complete
    }
    else{
      return true
    }
  }

  getProfileDetail()
	{
		return this.httpClient.get(`${this.serverUrl}get-profile-data`)
	}

  updateProfile(data , updateBasicInfo){
    if(updateBasicInfo){
      return this.httpClient.post(this.serverUrl + 'update-travel-planner-account', data);
    }
    else{
      return this.httpClient.post(this.serverUrl + 'create-travel-planner-account', data);
    }
  }
  uploadProfilePicture(image)
	{
		return this.httpClient.post(this.serverUrl + 'profile-detail/upload-image', { 'image': image });
	}

  cardsList(){
    return this.httpClient.get(`${this.serverUrl}view-credit-card`) 
  }
  deleteCard(card_id){
    return this.httpClient.delete(this.serverUrl + `delete-credit-card/${card_id}`);
  }
  addCard(data){
    return this.httpClient.post(this.serverUrl + 'add-credit-card', data);
  }

  //invoice list 
  invoiceList(url, startDate, endDate, useDateFilter,keyword = '') {
		var path;
		if (url) {
			path = url + '&from=' + startDate + '&to=' + endDate + '&search=' + keyword +'&useDateFilter='+useDateFilter;

		}
		else {
			path = this.serverUrl + 'invoices' + '?from=' + startDate + '&to=' + endDate + '&search=' + keyword+'&useDateFilter='+useDateFilter;
		}
		return this.httpClient.get(path).toPromise();
	}

  //invoice summary
	getInvoiceData(id) {
		return this.httpClient.get(this.serverUrl + 'invoice-summary/' + id);
	}
  
}
