import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
	providedIn: 'root'
})
export class AffiliateService
{
	adminNotification(obj: { bookingId: any; reciptentName: any; sendTo: any; sendThrough: string; sendValue: any; sendContent: any; })
	{
		throw new Error('Method not implemented.');
	}
	big_data_list: any
	private environmentServerUrl = environment.serverUrl;
	private serverUrl = environment.serverUrl + 'affiliate/';

	constructor(private httpClient: HttpClient) 
	{
		if (this.big_data_list == undefined) 
		{
			this.createBookingGetData().subscribe((response: any) =>
			{
				this.big_data_list = response.data
			})
		}
	}

	getBigData()
	{
		return this.big_data_list
	}


	fetchStepData(step_name: string)
	{
		return this.httpClient.get(`${this.serverUrl}cms/${step_name}`)
	}

	updateStepsArrayLocal(stepArray)
	{
		// update complete array
		localStorage.setItem('stepCompleted', stepArray.toString())
	}
	updateStepsLocal(step)
	{
		//add one step at a time
		let stepCompleted: any = localStorage.getItem('stepCompleted');
		if (stepCompleted)
		{
			stepCompleted = stepCompleted.split(',');
			if (!stepCompleted.includes(step))
			{
				stepCompleted.push(step);
				localStorage.setItem('stepCompleted', stepCompleted.toString())
			}
		}
		else
		{
			stepCompleted = [step];
			localStorage.setItem('stepCompleted', stepCompleted.toString())
		}
	}
	getLocalStepCompleted()
	{
		//get step completed array
		return localStorage.getItem('stepCompleted').split(',');
	}
	getUpdatedStepsLocal(step)
	{
		//update step completed array and prepare array to send in backend
		let stepCompleted: any = localStorage.getItem('stepCompleted');
		if (stepCompleted)
		{
			stepCompleted = stepCompleted.split(',');
			if (!stepCompleted.includes(step))
			{
				stepCompleted.push(step);
			}
		}
		else
		{
			stepCompleted = [step];
		}
		return stepCompleted;
	}
	// get/set step completed object
	updateStepsCompletedObject(stepObject: any)
	{
		// update complete object
		localStorage.setItem('step_completed_obj', JSON.stringify(stepObject))
	}
	getLocalStepCompletedObject()
	{
		//get step completed object
		return JSON.parse(localStorage.getItem('step_completed_obj'));
	}

	getStepsCompleted()
	{
		return this.httpClient.get(this.serverUrl + 'get-affiliate-register-step-completed');
	}





	/**
	 * 
	 * --------------------------------------------------------------------------------------
	 *  
	 */
	agreementAcceptance(data)
	{
		return this.httpClient.post(this.serverUrl + 'agreement-acceptance', data);
	}
	getAssicationsLanguages()
	{
		return this.httpClient.get(this.serverUrl + 'get-associations-languages-array');
	}
	addAffiliateAccount(data)
	{
		if (data.acc_id)//edit affiliate
		{
			return this.httpClient.put(this.serverUrl + 'edit-affiliate-basic-info', data);
		}
		else//add affiliate
		{
			return this.httpClient.post(this.serverUrl + 'add-affiliate-basic-info', data);
		}
	}

	editAffiliateEmail(email)
	{
		return this.httpClient.post(this.serverUrl + 'edit-email-verification', { "email": email });
	}
	updateAffiliateEmail(data)
	{
		return this.httpClient.post(this.serverUrl + 'edit-email-verify-otps', data);
	}
	resendAffiliateEmailVerification(email)
	{
		return this.httpClient.post(this.serverUrl + 'resend-email-verification', { "email": email });
	}
	editDispatchEmail(email)
	{
		return this.httpClient.post(this.serverUrl + 'edit-dispatcher-email-verification', { "email": email });
	}
	updateDispatchEmail(data)
	{
		return this.httpClient.post(this.serverUrl + 'edit-dispatcher-email-verify-otps', data);
	}
	resendDispatchEmailVerification(email)
	{
		return this.httpClient.post(this.serverUrl + 'resend-dispatcher-email-verification', { "email": email });
	}

	getAffiliateAccount(id)
	{
		return this.httpClient.get(this.serverUrl + 'get-affiliate-basic-info/' + id);
	}

	addBankOfAffiliate(data)
	{
		if (data.id)//edit affiliate
		{
			return this.httpClient.put(this.serverUrl + 'edit-affiliate-bank-ccdetail', data);
		}
		else//add affiliate
		{
			return this.httpClient.post(this.serverUrl + 'add-affiliate-bank-ccdetail', data);
		}
	}
	getBankOfAffiliate(id)
	{
		return this.httpClient.get(this.serverUrl + 'get-affiliate-bank-detail/' + id);
	}
	stripeRefreshAccountLink(accountID)
	{
		return this.httpClient.post(this.serverUrl + 'stripe-refresh-account-link', { 'accountID': accountID });
	}
	requestAddressChange(data)
	{
		return this.httpClient.post(this.serverUrl + 'request-stripe-address-change', data);
	}
	addCard(data)
	{
		return this.httpClient.post(this.serverUrl + 'add-aff-credit-card', data);
	}
	getCard(id)
	{
		return this.httpClient.get(this.serverUrl + 'credit-card/' + id);
	}
	editCard(data)
	{
		return this.httpClient.put(this.serverUrl + 'edit-credit-card', data);
	}
	cardStatus(id)
	{
		return this.httpClient.delete(this.serverUrl + 'delete-aff-credit-card/' + id);
	}

	addInsuranceDetail(data)
	{
		if (data.id)//edit affiliate
		{
			return this.httpClient.put(this.serverUrl + 'edit-vehicle-insurance-detail', data);
		}
		else//add affiliate
		{
			return this.httpClient.post(this.serverUrl + 'add-vehicle-insurance-detail', data);
		}
	}
	getInsuranceDetail(id)
	{
		return this.httpClient.get(this.serverUrl + 'get-vehicle-insurance-detail/' + id);
	}
	uploadVehicleImage(image)
	{
		return this.httpClient.post(this.serverUrl + 'add-single-image', { 'image': image });
	}
	deleteImage(id)
	{
		return this.httpClient.delete(this.serverUrl + 'delete-image/' + id);
	}

	getSignatureImage()
	{
		return this.httpClient.get(this.serverUrl + 'getstep6');
	}

	//Driver
	async driverList()
	{
		const result = await this.httpClient.get(this.serverUrl + 'get-affiliate-driver-list').toPromise();
		return result;
	}
	addDriver(data)
	{
		if (data.id)//edit affiliate
		{
			return this.httpClient.put(this.serverUrl + 'edit-affiliate-driver', data);
		}
		else//add affiliate
		{
			return this.httpClient.post(this.serverUrl + 'add-affiliate-driver', data);
		}
	}
	getDriver(id)
	{
		return this.httpClient.get(this.serverUrl + 'get-affiliate-driver/' + id);
	}
	editDriver(data)
	{
		return this.httpClient.put(this.serverUrl + 'edit-driver', data);
	}
	driverStatus(id, status)
	{
		return this.httpClient.put(this.serverUrl + 'change-affiliate-driver-status', { 'id': id, 'status': status });
	}
	driverDressLanguage()
	{
		return this.httpClient.get(this.serverUrl + 'driver-dresses-languages-array');
	}

	//Vehicles 
	async affiliateVehicleList()
	{
		const result = await this.httpClient.get(this.serverUrl + 'get-affiliate-vehicles').toPromise();
		return result;
	}
	getFieldsData()
	{
		return this.httpClient.get(this.serverUrl + 'vehicle-data');
	}
	submitVehicle(data)
	{
		return this.httpClient.post(this.serverUrl + 'add-vehicle-by-affiliate', data);
	}
	getVehicleData(id)
	{
		return this.httpClient.get(this.serverUrl + 'get-vehicle-detail/' + id);
	}
	editVehicle(data)
	{
		return this.httpClient.put(this.serverUrl + 'edit-vehicle-by-affiliate', data);
	}
	duplicateVehicle(data)
	{
		return this.httpClient.post(this.serverUrl + 'duplicate-affiliate-vehicle', data);
	}
	vehicleStatus(id, status)
	{
		return this.httpClient.put(this.serverUrl + 'change-vehicle-status', { 'id': id, 'status': status });
	}
	//vehicle rates 
	getVehicleInfo(vehicleId)
	{
		return this.httpClient.get(this.serverUrl + 'get-vehicle-info/' + vehicleId);
	}
	addVehicleRates(data)
	{
		return this.httpClient.post(this.serverUrl + 'add-affiliate-vehicle-fare', data);
	}
	getVehicleRates(id)
	{
		return this.httpClient.get(this.serverUrl + 'get-affiliate-vehicle-fare/' + id);
	}
	editVehicleRates(data)
	{
		if (data.id)//edit vehicle rate
		{
			console.log('Editing Rates')
			return this.httpClient.put(this.serverUrl + 'edit-affiliate-vehicle-fare', data);
		}
		else//add vehicle rate
		{
			console.log('Adding Rates')
			return this.httpClient.post(this.serverUrl + 'add-affiliate-vehicle-fare', data);
		}
	}

	affiliateTermsAccept(data)
	{
		return this.httpClient.put(this.serverUrl + 'affiliate-steps-completion', data);
	}
	checkAffiliateAccountStatus()
	{
		return this.httpClient.get(this.serverUrl + 'get-affiliate-approval-status');
	}


	//Booking
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
	//change booking status such as accept/reject
	changeStatusBooking(data)
	{
		return this.httpClient.put(this.serverUrl + 'change-affiliate-booking-status', data);
	}
	//send email to affiliate, customer etc
	sendEmail(data)
	{
		return this.httpClient.post(this.serverUrl + 'reservation-detail-email', data);
	}


	//Create booking
	createBookingGetData()
	{
		// return this.httpClient.get(this.environmentServerUrl + 'pre-request-booking-data');
		return this.httpClient.get(this.environmentServerUrl + 'amenities-languages-dresses');

	}
	getAccountBytype(accountType)
	{
		return this.httpClient.get(this.serverUrl + 'get-account-by-type/' + accountType);
	}
	getBookingDataForEdit(id)
	{
		return this.httpClient.get(this.serverUrl + 'get-reservation/' + id);
	}
	chooseUser(id, accountType)
	{
		switch (accountType)
		{
			case 'individual': {
				return this.httpClient.get(this.serverUrl + 'get-an-individual-account/' + id);
			}
			case 'corporate': {
				return this.httpClient.get(this.serverUrl + 'get-corporate-account/' + id);
			}
			case 'travel': {
				return this.httpClient.get(this.serverUrl + 'get-travel-planner-account/' + id);
			}
			default: {
				return this.httpClient.get(this.serverUrl + 'get-affiliate-account/' + id);
			}
		}
	}
	createBooking(data)
	{
		if (data.reservation_id)//edit affiliate
		{
			return this.httpClient.put(this.serverUrl + 'edit-reservation', data);
		}
		else//add affiliate
		{
			return this.httpClient.post(this.serverUrl + 'create-reservation', data);
		}
	}
	getBookingData(id)
	{
		return this.httpClient.get(this.serverUrl + 'get-reservation-detail/' + id);
	}
	paymentProcessing(data)
	{
		return this.httpClient.post(this.serverUrl + 'affiliate-payment-processing', data);
	}
	//invoices
	getInvoiceData(id)
	{
		return this.httpClient.get(this.serverUrl + 'invoice-summary/' + id);
	}
	//Profile related API
	getProfileDetail()
	{
		return this.httpClient.get(this.serverUrl + 'profile-detail');
	}
	uploadProfilePicture(image)
	{
		return this.httpClient.post(this.serverUrl + 'profile-detail/upload-image', { 'image': image });
	}
	deactivateAffiliateAccount()
	{
		return this.httpClient.put(this.serverUrl + 'deactivate-account', {});
	}

	getCurrencies()
	{
		return this.httpClient.get('assets/json/currencyOptions.json')
	}

	get charterOptions()
	{
		return this.httpClient.get('assets/json/charterOptions.json')
	}



	affiliateVerificationStatus(user_account_id: number)
	{
		return this.httpClient.get(`${this.serverUrl}verification-status/${user_account_id}`)
	}



	// ------------------------ Farm Out Bookings -------------------------

	initialiseFarmout(): boolean
	{
		// check if the selected vehicle and logged in affiliate is same ?
		const sel_veh = JSON.parse(sessionStorage.getItem('selected_vehicle'))

		if (sel_veh != null && sel_veh.affiliate_id != "")
		{
			return sel_veh.affiliate_id
		}
		return false
	}


}
