import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private serverUrl=environment.serverUrl;
  private errors={};
  constructor(private httpClient:HttpClient) { }


  setError(value) {      
    this.errors = value;  
  }  
  getError() {  
    return this.errors;  
  } 
  
  public get currentUserValue() {
    return JSON.parse(localStorage.getItem('currentUser'));
  }

  login(data)
  {
    return this.httpClient.post(this.serverUrl + 'login-otp',data);
  }

  verifyOtp(data)
  {
    return this.httpClient.post(this.serverUrl + 'login',data);
  }

  resendOtp(data)
  {
    return this.httpClient.post(this.serverUrl + 'resend-otp',data);
  }

  logout() {
    return this.httpClient.post(this.serverUrl + 'logout',{});
  }

  getAccessToken() {
    return localStorage.getItem('access_token');
  }

}
