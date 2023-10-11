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
      return false
    }
  }

  getStepCompletedObj(){
    let step_completed_obj = JSON.parse(sessionStorage.getItem('step_completed_obj'))
    return step_completed_obj;
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

  loadBookings(url, keyword, startDate, endDate)
	{
		var path;
		if (url)
		{
			path = url + '?from=' + startDate + '&to=' + endDate + '&search=' + keyword;
		}
		else
		{
			path = this.serverUrl + 'get-bookings' + '?from=' + startDate + '&to=' + endDate + '&search=' + keyword;
		}
		return this.httpClient.get(path).toPromise();
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

  //get invoice list
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

  //audit trail info 
  auditTrailInfoInvoice(bookingId) {
		return this.httpClient.get(this.serverUrl + `booking-audit-records/${bookingId}/invoice`)
	}

  //get location map
  getLocationPoints(booking_id: number) {
		return this.httpClient.get(`${this.serverUrl}booking-location/${booking_id}`)
	}

  //get details of the booking
  getBookingPreview(reservation_id: number) {
		return this.httpClient.get(`${this.serverUrl}get-booking-preview/${reservation_id}`);
	}

  travelAgentNotification(data) {
		return this.httpClient.post(this.serverUrl + 'notification-daily-booking', data);
	}
  auditTrailInfo(bookingId){
		return this.httpClient.get(this.serverUrl+`booking-audit-records/${bookingId}`)
	}
  getBookingDataForEdit(id,updateType){
		return this.httpClient.get(this.serverUrl + `get-reservation/${id}/${updateType}`);
  }

  getStepsCompleted(id) {
		return this.httpClient.get(this.serverUrl + 'get-step-completed');
	}

  updateStepsArrayLocal(stepArray) {
		sessionStorage.setItem('stepCompleted', stepArray.toString())
	}

  updateStepsCompletedObj(stepObject) {
		sessionStorage.setItem('step_completed_obj', JSON.stringify(stepObject))
	}

  getBankOfAffiliate(acc_id){
		return this.httpClient.get(this.serverUrl + `get-a-bank/${acc_id}`);
  }
  addBankOfAffiliate(data){
    return this.httpClient.post(this.serverUrl + 'add-a-bank', data);
  }

  getTravelClientAccounts(url, keyword){
    var path;
		if (url) {
			path = url + '&search=' + keyword;
		}
		else {
			path = this.serverUrl + 'accounts' + '?search=' + keyword;
		}
		return this.httpClient.get(path).toPromise();;
  }
  addAccount(data,id=null) {
	if(id){
		//update api here
	}
	else{
		return this.httpClient.post(this.serverUrl + 'add-account', data);
	}
	}
	getClientAccount(id){
		return this.httpClient.get(this.serverUrl + `get-an-account/${id}`);
	}
  
}
