import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { AuthService } from './auth.service';
import { ErrorDialogService } from './error-dialog/errordialog.service';

@Injectable({
  providedIn: 'root'
})
export class IndividualService {
  private environmentServerUrl = environment.serverUrl;
  private serverUrl = environment.serverUrl + 'individual/';
  constructor(
    private httpClient: HttpClient,
    private $errors: ErrorDialogService,
    private authService: AuthService
  ) { }

  createIndividualAccount(data, is_profile_complete) {
    if (is_profile_complete) {
      return this.httpClient.post(this.serverUrl + 'edit-individual-account', data);
    }
    else {
      return this.httpClient.post(this.serverUrl + 'add-individual-account', data);
    }
  }

  getIndividualAccountDetails() {
    return this.httpClient.get(this.serverUrl + `get-profile-data`);
  }

  addIndividualCreditCard(data) {
    return this.httpClient.post(this.serverUrl + `add-credit-card`, data);
  }

  deleteIndividualCreditCard(card_id) {
    return this.httpClient.delete(this.serverUrl + `delete-credit-card/${card_id}`);
  }

  createBooking(data: any, update_type: string) {
    if (update_type == 'return' || update_type == 'repeat') {
      return this.httpClient.post(`${this.serverUrl}duplicate-reservation`, data)
    }
    if (data.reservation_id) {
      return this.httpClient.post(this.serverUrl + 'edit-reservation', data);
    }
    else {
      return this.httpClient.post(this.serverUrl + 'create-reservation', data);
    }
  }

  getAccountDetails() {
    return this.httpClient.get(this.serverUrl + `get-account-details`);
  }


  loadBookings(url, keyword, startDate, endDate, useDateFilter) {
    var path;
    if (url) {
      path = url + '?from=' + startDate + '&to=' + endDate + '&search=' + keyword + '&useDateFilter=' + useDateFilter;
    }
    else {
      path = this.serverUrl + 'get-all-reservation' + '?from=' + startDate + '&to=' + endDate + '&search=' + keyword + '&useDateFilter=' + useDateFilter;
    }
    return this.httpClient.get(path).toPromise();
  }


  getFamilyMemberList(url, keyword) {
    var path;
    if (url) {
      path = url + '&search=' + keyword;
    }
    else {
      path = this.serverUrl + 'family-members' + '?search=' + keyword;
    }
    return this.httpClient.get(path).toPromise();;
  }

  //get details of the booking
  getBookingPreview(reservation_id: number) {
    return this.httpClient.get(`${this.serverUrl}get-booking-preview/${reservation_id}`);
  }

  getBookingDataForEdit(id, updateType) {
    return this.httpClient.get(this.serverUrl + `get-reservation/${id}/${updateType}`);
  }

  //get invoice list
  invoiceList(url, startDate, endDate, useDateFilter, keyword = '') {
    var path;
    if (url) {
      path = url + '&from=' + startDate + '&to=' + endDate + '&search=' + keyword + '&useDateFilter=' + useDateFilter;

    }
    else {
      path = this.serverUrl + 'invoices' + '?from=' + startDate + '&to=' + endDate + '&search=' + keyword + '&useDateFilter=' + useDateFilter;
    }
    return this.httpClient.get(path).toPromise();
  }

  //invoice summary
  getInvoiceData(id) {
    return this.httpClient.get(this.serverUrl + 'invoice-summary/' + id);
  }

  paymentProcessing(data) {
    return this.httpClient.post(this.serverUrl + 'payment-processing', data);
  }

  cancelBooking(id) {
    return this.httpClient.get(this.serverUrl + `cancel-booking/${id}`);
  }

  showRatesArray(id) {
    return this.httpClient.get(this.serverUrl + `show-rates-array/${id}`)
  }

  addAccount(data, id = null) {
    if (id) {
      //update api here
      return this.httpClient.post(this.serverUrl + `family-members/${id}`, data);
    }
    else {
      return this.httpClient.post(this.serverUrl + 'family-members', data);
    }
  }

  getAccount(id) {
    return this.httpClient.get(this.serverUrl + `family-member/${id}`);
  }

}
