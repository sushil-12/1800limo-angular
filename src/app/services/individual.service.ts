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
      return this.httpClient.put(this.serverUrl + 'edit-reservation', data);
    }
    else {
      return this.httpClient.post(this.serverUrl + 'create-reservation', data);
    }
  }

  getAccountDetails() {
    return this.httpClient.get(this.serverUrl + `get-account-details`);
  }

}
