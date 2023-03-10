import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable({
	providedIn: 'root'
})


export class AdminService {
	big_data_list: any = undefined;


	private serverUrl = environment.serverUrl;
	constructor(private httpClient: HttpClient) {
		if (this.big_data_list == undefined) {
			this.createBookingGetData().subscribe((response: any) => {
				this.big_data_list = response.data
			})
		}
	}

	getAirportsAndBigData() {
		if (this.big_data_list) {
			return this.big_data_list;
		}
		else {
			return undefined;
		}
	}

	getCookie(keyword: string): null | string {
		let ca = document.cookie.split(';');
		for (let i = 0; i < ca.length; i++) {
			if (ca[i].trim().indexOf(keyword) == 0) {
				return ca[i].substring(ca[i].indexOf('=') + 1, ca[i].length)
			}
		}
		return null
	}

	checkCookie(keyword: string): boolean {
		let required_cookie = this.getCookie(keyword)
		if (required_cookie && required_cookie != '') {
			return true
		}
		return false
	}

	setCookie(key: string, value: string, exdays: number): boolean {
		const date = new Date()

		date.setTime(date.getTime() + (exdays * 24 * 60 * 60 * 1000));
		document.cookie = `${key}=${value};expires=${date.toUTCString()};`;

		// check if the cookies is successfully set
		if (this.checkCookie(key)) {
			return true
		}
		return false
	}

	deleteCookie(key: string) {
		document.cookie = `${key}=' ';expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
	}

	changeSortOrder(data: any) {
		return this.httpClient.put(this.serverUrl + 'vehicle-types-sorting', data);
	}

	changeSortingOrder(data: any) {
		return this.httpClient.put(this.serverUrl + 'admin/setting/meet-greet-sorting', data);
	}
	changeAmenitySortingOrder(data: any) {
		return this.httpClient.put(this.serverUrl + 'admin/setting/amenity-sorting', data);
	}
	changeSpecialAmenitySortingOrder(data: any) {
		return this.httpClient.put(this.serverUrl + 'admin/setting/special-amenities-sorting', data);
	}
	changeInteriorAmenitySortingOrder(data: any) {
		return this.httpClient.put(this.serverUrl + 'admin/setting/vehicle-interior-sorting', data);
	}

	logout() {
		return this.httpClient.post(this.serverUrl + 'logout', {});
	}

	async getOurVehicles() {
		const result = await this.httpClient.get(this.serverUrl + 'vehicle-types-listing').toPromise();
		return result;
	}

	addVehicleType(data) {
		return this.httpClient.post(this.serverUrl + 'add-vehicle-types', data);
	}

	getVehicleType(id) {
		return this.httpClient.get(this.serverUrl + 'get-vehicle-types/' + id);
	}

	updateVehicleType(data) {
		return this.httpClient.post(this.serverUrl + 'edit-vehicle-types', data);
	}

	//amenities
	async getAmenities() {
		const result = await this.httpClient.get(this.serverUrl + 'amenities').toPromise();
		return result;
	}
	addAmenity(data) {
		return this.httpClient.post(this.serverUrl + 'add-amenity', data);
	}
	getAmenity(id) {
		return this.httpClient.get(this.serverUrl + 'get-amenity/' + id);
	}
	updateAmenity(data) {
		return this.httpClient.put(this.serverUrl + 'edit-amenities', data);
	}
	amenityStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'amenity-status', { 'id': id, 'status': status });
	}

	// special Amenity
	async getSpecialAmenities() {
		const result = await this.httpClient.get(this.serverUrl + 'admin/special-amenities').toPromise();
		return result;
	}
	addSpecialAmenity(data) {
		return this.httpClient.post(this.serverUrl + 'admin/setting/add-special-amenities', data);
	}
	getSpecialAmenity(id) {
		return this.httpClient.get(this.serverUrl + 'admin/setting/get-special-amenities/' + id);
	}
	updateSpecialAmenity(data) {
		return this.httpClient.put(this.serverUrl + 'admin/setting/edit-special-amenities', data);
	}
	specialAmenityStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'admin/setting/special-amenities-status', { 'id': id, 'status': status });
	}

	// Interior Amenity
	async getInteriorAmenities() {
		const result = await this.httpClient.get(this.serverUrl + 'admin/vehicle-interior').toPromise();
		return result;
	}
	addInteriorAmenity(data) {
		return this.httpClient.post(this.serverUrl + 'admin/setting/add-vehicle-interior', data);
	}
	getInteriorAmenity(id) {
		return this.httpClient.get(this.serverUrl + 'admin/setting/get-vehicle-interior/' + id);
	}
	updateInteriorAmenity(data) {
		return this.httpClient.put(this.serverUrl + 'admin/setting/edit-vehicle-interior', data);
	}
	interiorAmenityStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'admin/setting/vehicle-interior-status', { 'id': id, 'status': status });
	}

	//
	// add / edit / update vehicle for admin-affiliate-step 5
	// Add / Edit / Get vehicle data for admin affliliate step 5
	async adminAffiliateVehicleList(id) {
		const result = await this.httpClient.get(this.serverUrl + 'admin/get-affiliate-all-vehicles/' + id).toPromise();
		return result;
	}
	getLooseAffiliateVehicles(vehicle_type_id: number) {
		let data = {}
		data['filters'] = {}
		data['filters']['vehicle-type'] = [vehicle_type_id]
		return this.httpClient.post(`${this.serverUrl}quote/vehicle-listing`, data)
	}
	adminAffiliateSubmitVehicle(data) {
		return this.httpClient.post(this.serverUrl + 'admin/add-vehicle-for-affiliate', data);
	}
	adminAffiliateGetVehicleData(id) {
		return this.httpClient.get(this.serverUrl + 'admin/get-affiliate-vehicle-detail/' + id);
	}
	adminAffiliateEditVehicle(data) {
		return this.httpClient.put(this.serverUrl + 'admin/edit-vehicle-for-affiliate', data);
	}
	adminAffiliateGetFieldsData() {
		return this.httpClient.get(this.serverUrl + 'admin/vehicle-data');
	}
	// end

	//vehicle
	//vehicle rates 
	getMasterVehicleInfo(vehicleId) {
		return this.httpClient.get(this.serverUrl + 'get-master-vehicle-info/' + vehicleId);
	}
	addMasterVehicleRates(data) {
		return this.httpClient.post(this.serverUrl + 'add-vehicle-fare', data);
	}
	getMasterVehicleRates(id) {
		return this.httpClient.get(this.serverUrl + 'get-vehicle-fare/' + id);
	}
	editMasterVehicleRates(data) {
		return this.httpClient.post(this.serverUrl + 'update-master-vehicle-fare', data);
		// if (data.id)//edit vehicle rate
		// {
		// 	return this.httpClient.put(this.serverUrl + 'edit-vehicle-fare', data);
		// }
		// else//add vehicle rate
		// {
		// 	return this.httpClient.post(this.serverUrl + 'add-vehicle-fare', data);
		// }
	}
	//
	vehicles(id) {
		return this.httpClient.get(this.serverUrl + 'get-vehicle-type-vehicles/' + id).toPromise();
	}
	getFieldsData() {
		return this.httpClient.get(this.serverUrl + 'fields-data');
	}
	uploadVehicleImage(image) {
		return this.httpClient.post(this.serverUrl + 'add-single-image', { 'image': image });
	}
	deleteImage(id) {
		return this.httpClient.delete(this.serverUrl + 'delete-image/' + id);
	}
	submitVehicle(data) {
		return this.httpClient.post(this.serverUrl + 'add-vehicle', data);
	}
	getVehicleData(id) {
		return this.httpClient.get(this.serverUrl + 'get-vehicle/' + id);
	}
	editVehicle(data) {
		return this.httpClient.put(this.serverUrl + 'edit-vehicle', data);
	}
	vehicleStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'vehicle-status', { 'id': id, 'status': status });
	}
	//
	//vehicle rates 
	getVehicleInfo(vehicleId) {
		return this.httpClient.get(this.serverUrl + 'admin/get-affililate-vehicle-info/' + vehicleId);
	}
	addVehicleRates(data) {
		return this.httpClient.post(this.serverUrl + 'admin/add-affiliate-vehicle-fare', data);
	}
	getVehicleRates(id) {
		return this.httpClient.get(this.serverUrl + 'admin/get-affiliate-vehicle-fare-by-affiilate/' + id);
	}
	editVehicleRates(data) {
		if (data.id)//edit vehicle rate
		{
			return this.httpClient.put(this.serverUrl + 'admin/edit-affiliate-vehicle-fare', data);
		}
		else//add vehicle rate
		{
			return this.httpClient.post(this.serverUrl + 'admin/add-affiliate-vehicle-fare', data);
		}
	}
	//


	//vehicle year API's
	async getYears() {
		const result = await this.httpClient.get(this.serverUrl + 'years').toPromise();
		return result;
	}
	addYear(data) {
		return this.httpClient.post(this.serverUrl + 'add-year', data);
	}
	getYear(id) {
		return this.httpClient.get(this.serverUrl + 'get-year/' + id);
	}
	updateYear(data) {
		return this.httpClient.put(this.serverUrl + 'edit-year', data);
	}
	yearStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'vehicles-year-status', { 'id': id, 'status': status });
	}
	//

	//vehicle Color API's
	async getColors() {
		const result = await this.httpClient.get(this.serverUrl + 'vehicle-colors').toPromise();
		return result;
	}
	addColor(data) {
		return this.httpClient.post(this.serverUrl + 'add-vehicle-color', data);
	}
	getColor(id) {
		return this.httpClient.get(this.serverUrl + 'get-vehicle-color/' + id);
	}
	updateColor(data) {
		return this.httpClient.put(this.serverUrl + 'edit-vehicle-color', data);
	}
	colorStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'vehicle-color-status', { 'id': id, 'status': status });
	}
	//

	//vehicle make API's
	async getMakeList() {
		const result = await this.httpClient.get(this.serverUrl + 'vehicle-makes').toPromise();
		return result;
	}
	addMake(data) {
		return this.httpClient.post(this.serverUrl + 'add-vehicle-make', data);
	}
	getMake(id) {
		return this.httpClient.get(this.serverUrl + 'get-vehicle-make/' + id);
	}
	updateMake(data) {
		return this.httpClient.put(this.serverUrl + 'edit-vehicle-make', data);
	}
	makeStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'vehicle-make-status', { 'id': id, 'status': status });
	}
	//

	//vehicle model API's
	async getModelList() {
		const result = await this.httpClient.get(this.serverUrl + 'vehicle-models').toPromise();
		return result;
	}
	addModel(data) {
		return this.httpClient.post(this.serverUrl + 'add-vehicle-model', data);
	}
	getModel(id) {
		return this.httpClient.get(this.serverUrl + 'get-vehicle-model/' + id);
	}
	updateModel(data) {
		return this.httpClient.put(this.serverUrl + 'edit-vehicle-model', data);
	}
	modelStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'vehicle-model-status', { 'id': id, 'status': status });
	}
	//
	//vehicle model API's
	async getAffilatePreferenceList() {
		const result = await this.httpClient.get(this.serverUrl + 'affiliate-preferences').toPromise();
		return result;
	}
	addAffilatePreference(data) {
		return this.httpClient.post(this.serverUrl + 'add-affiliate-preference', data);
	}
	getAffilatePreference(id) {
		return this.httpClient.get(this.serverUrl + 'get-affiliate-preference/' + id);
	}
	updateAffilatePreference(data) {
		return this.httpClient.put(this.serverUrl + 'edit-affiliate-preference', data);
	}
	affilatePreferenceStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'affiliate-preference-status', { 'id': id, 'status': status });
	}
	//

	//vehicle model API's
	async getDriverLanguageList() {
		const result = await this.httpClient.get(this.serverUrl + 'driver-languages').toPromise();
		return result;
	}
	addDriverLanguage(data) {
		return this.httpClient.post(this.serverUrl + 'add-driver-language', data);
	}
	getDriverLanguage(id) {
		return this.httpClient.get(this.serverUrl + 'get-driver-language/' + id);
	}
	updateDriverLanguage(data) {
		return this.httpClient.put(this.serverUrl + 'edit-driver-language', data);
	}
	driverLanguageStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'driver-language-status', { 'id': id, 'status': status });
	}
	//

	//vehicle model API's
	async getDriverDressList() {
		const result = await this.httpClient.get(this.serverUrl + 'driver-dresses').toPromise();
		return result;
	}
	addDriverDress(data) {
		return this.httpClient.post(this.serverUrl + 'add-driver-dress', data);
	}
	getDriverDress(id) {
		return this.httpClient.get(this.serverUrl + 'get-driver-dress/' + id);
	}
	updateDriverDress(data) {
		return this.httpClient.put(this.serverUrl + 'edit-driver-dress', data);
	}
	driverDressStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'driver-dress-status', { 'id': id, 'status': status });
	}
	//
	//meet and greet model API's
	async getMeetAndGreetList() {
		const result = await this.httpClient.get(this.serverUrl + 'admin/setting/meet-greet').toPromise();
		return result;
	}
	addMeetAndGreet(data) {
		return this.httpClient.post(this.serverUrl + 'admin/setting/add-meet-greet', data);
	}
	getMeetAndGreet(id) {
		return this.httpClient.get(this.serverUrl + 'admin/setting/get-meet-greet/' + id);
	}
	updateMeetAndGreet(data) {
		return this.httpClient.put(this.serverUrl + 'admin/setting/edit-meet-greet', data);
	}
	MeetAndGreetStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'admin/setting/meet-greet-status', { 'id': id, 'status': status });
	}
	//

	//individual api
	addAccount(data) {
		return this.httpClient.post(this.serverUrl + 'add-account', data);
	}
	individualAccounts(url, keyword) {
		var path;
		if (url) {
			path = url + '&search=' + keyword;
		}
		else {
			path = this.serverUrl + 'accounts' + '?search=' + keyword;
		}
		return this.httpClient.get(path).toPromise();;
	}
	getIndividualAccount(id) {
		return this.httpClient.get(this.serverUrl + 'get-an-account/' + id);
	}
	updateIndividualAccount(data) {
		return this.httpClient.put(this.serverUrl + 'edit-account', data);
	}
	individualAccountStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'account-status', { 'id': id, 'status': status });
	}

	//corporate api
	addCorporateAccount(data) {
		return this.httpClient.post(this.serverUrl + 'add-corporate-account', data);
	}
	corporateAccounts(url, keyword) {
		var path;
		if (url) {
			path = url + '&search=' + keyword;
		}
		else {
			path = this.serverUrl + 'corporate-accounts' + '?search=' + keyword;
		}
		return this.httpClient.get(path).toPromise();;
	}
	getCorporateAccount(id) {
		return this.httpClient.get(this.serverUrl + 'get-corporate-account/' + id);
	}
	updateCorporateAccount(data) {
		return this.httpClient.put(this.serverUrl + 'edit-corporate-account', data);
	}
	corporateAccountStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'corporate-account-status', { 'id': id, 'status': status });
	}

	//corporate api
	addTravelPlannerAccount(data) {
		return this.httpClient.post(this.serverUrl + 'add-travel-planner-account', data);
	}
	travelPlannerAccounts(url, keyword) {
		var path;
		if (url) {
			path = url + '&search=' + keyword;
		}
		else {
			path = this.serverUrl + 'travel-planner' + '?search=' + keyword;
		}
		return this.httpClient.get(path).toPromise();;
	}
	getTravelPlannerAccount(id) {
		return this.httpClient.get(this.serverUrl + 'get-travel-planner-account/' + id);
	}
	updateTravelPlannerAccount(data) {
		return this.httpClient.put(this.serverUrl + 'edit-travel-planner-account', data);
	}
	travelPlannerAccountStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'travel-planner-status', { 'id': id, 'status': status });
	}

	//cards
	async cardsList(id) {
		const result = await this.httpClient.get(this.serverUrl + 'credit-cards/' + id).toPromise();
		return result;
	}
	addCard(data) {
		return this.httpClient.post(this.serverUrl + 'add-credit-card', data);
	}
	getCard(id) {
		return this.httpClient.get(this.serverUrl + 'credit-card/' + id);
	}
	editCard(data) {
		return this.httpClient.put(this.serverUrl + 'edit-credit-card', data);
	}
	cardStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'credit-card-status', { 'id': id, 'status': status });
	}
	deleteCard(id, acc_id) {
		return this.httpClient.delete(this.serverUrl + 'delete-credit-card/' + acc_id + '/' + id);
	}


	//staff
	async staffList(id) {
		const result = await this.httpClient.get(this.serverUrl + 'staff/' + id).toPromise();
		return result;
	}
	addStaff(data) {
		return this.httpClient.post(this.serverUrl + 'add-staff', data);
	}
	staffLanguages() {
		return this.httpClient.get(this.serverUrl + 'staff-languages');
	}
	getStaff(id) {
		return this.httpClient.get(this.serverUrl + 'get-staff/' + id);
	}
	editStaff(data) {
		return this.httpClient.put(this.serverUrl + 'edit-staff', data);
	}
	staffStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'staff-status', { 'id': id, 'status': status });
	}

	//affiliate
	blackCarLimoBusAccounts(url: string, affiliateType: string, filter_type: string, keyword: string) {
		let path;
		if (url) {
			path = url + '&search=' + keyword;
		}
		else {
			path = `${this.serverUrl}affiliate-accounts/${affiliateType}/${filter_type}?search=${keyword}`;
		}
		return this.httpClient.get(path).toPromise()
	}
	blackCarLimoBusAccountStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'affiliate-account-status', { 'id': id, 'status': status });
	}
	acceptAffiliate(acc_id) {
		return this.httpClient.put(this.serverUrl + 'affiliate-account-approval', { 'acc_id': acc_id });
	}
	rejectAffiliate(data) {
		return this.httpClient.put(this.serverUrl + 'reject-affiliate-account', data);
	}

	// steps Code
	getSessionStepsCompleted() {
		return JSON.parse(sessionStorage.getItem('steps-completed'))
	}

	setSessionStepsCompleted(step: number | string) {
		step = step.toString()
		let temp_arr = this.getSessionStepsCompleted()
		if (temp_arr != null && temp_arr.length > 0) {
			if (!temp_arr.includes(step)) {
				temp_arr.push(step)
			}
		} else {
			temp_arr = [step]
		}
		sessionStorage.setItem('steps-completed', JSON.stringify(temp_arr))
	}

	unsetSessionStepsCompleted(step: number | string) {

		let temp_arr = this.getSessionStepsCompleted()



		if (temp_arr.length > 0 && temp_arr.includes(step.toString())) {

			temp_arr.splice(temp_arr.indexOf(step) != -1 ? temp_arr.indexOf(step) : 0)

		}

		sessionStorage.setItem('steps-completed', JSON.stringify(temp_arr))

	}

	getStepsCompleted(id) {
		return this.httpClient.get(this.serverUrl + 'admin/get-affiliate-step-completed/' + id);
	}

	updateStepsCompleted(stepArray) {
		sessionStorage.setItem('stepCompleted', stepArray.toString())
	}
	updateStepsCompletedObj(stepObject) {
		sessionStorage.setItem('step_completed_obj', JSON.stringify(stepObject))
	}
	getLocalStepsCompleted() {
		return sessionStorage.getItem('stepCompleted').split(',');
	}
	getLocalStepsCompletedObj() {
		return JSON.parse(sessionStorage.getItem('step_completed_obj'));
	}

	getUpdatedStepsLocal(step) {
		let stepCompleted: any = sessionStorage.getItem('stepCompleted');
		if (stepCompleted) {
			stepCompleted = stepCompleted.split(',');
			if (!stepCompleted.includes(step)) {
				stepCompleted.push(step);
			}
		}
		else {
			stepCompleted = [step];
		}
		return stepCompleted;
	}

	updateStepsArrayLocal(stepArray) {
		sessionStorage.setItem('stepCompleted', stepArray.toString())
	}
	updateStepsLocal(step) {
		let stepCompleted: any = sessionStorage.getItem('stepCompleted');
		if (stepCompleted) {
			stepCompleted = stepCompleted.split(',');
			if (!stepCompleted.includes(step)) {
				stepCompleted.push(step);
				sessionStorage.setItem('stepCompleted', stepCompleted.toString())
			}
		}
		else {
			stepCompleted = [step];
			sessionStorage.setItem('stepCompleted', stepCompleted.toString())
		}
	}

	// End Steps Code
	fetchStep0Data() {
		return this.httpClient.get(this.serverUrl + 'admin/cms/step0')
	}

	getAssicationsLanguages() {
		return this.httpClient.get(this.serverUrl + 'get-associations-languages');
	}
	addAffiliateAccount(data) {
		if (data.id)//edit affiliate
		{
			return this.httpClient.put(this.serverUrl + 'edit-affiliate-account', data);
		}
		else//add affiliate
		{
			return this.httpClient.post(this.serverUrl + 'add-affiliate-account', data);
		}
	}
	getAffiliateAccount(id) {
		return this.httpClient.get(this.serverUrl + 'get-affiliate-account/' + id);
	}


	getAffiliatesListFromCoords(lat: number, lng: number) {
		return this.httpClient.get(`${this.serverUrl}get-affiliates/${lat}/${lng}`).toPromise()
	}
	addBankOfAffiliate(data) {
		if (data.id)//edit affiliate
		{
			return this.httpClient.put(this.serverUrl + 'edit-a-bank', data);
		}
		else//add affiliate
		{
			return this.httpClient.post(this.serverUrl + 'add-a-bank', data);
		}
	}
	getBankOfAffiliate(id) {
		return this.httpClient.get(this.serverUrl + 'get-a-bank/' + id);
	}

	addInsuranceDetail(data) {
		if (data.id)//edit affiliate
		{
			return this.httpClient.put(this.serverUrl + 'edit-insurance-detail', data);
		}
		else//add affiliate
		{
			return this.httpClient.post(this.serverUrl + 'add-insurance-detail', data);
		}
	}
	getInsuranceDetail(id) {
		return this.httpClient.get(this.serverUrl + 'insurance-detail/' + id);
	}

	//Driver
	async driverList(id) {
		const result = await this.httpClient.get(this.serverUrl + 'affiliate-drivers/' + id).toPromise();
		return result;
	}
	addDriver(data) {
		if (data.id)//edit affiliate
		{
			return this.httpClient.put(this.serverUrl + 'edit-driver', data);
		}
		else//add affiliate
		{
			return this.httpClient.post(this.serverUrl + 'add-driver', data);
		}
	}
	getDriver(id) {
		return this.httpClient.get(this.serverUrl + 'affiliate-driver/' + id);
	}
	editDriver(data) {
		return this.httpClient.put(this.serverUrl + 'edit-driver', data);
	}
	driverStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'affiliate-driver-status', { 'id': id, 'status': status });
	}
	driverDressLanguage() {
		return this.httpClient.get(this.serverUrl + 'affiliate-driver-dresses-languages');
	}

	//Vehicles 
	affiliateVehicleList(affiliate_id: number | string) {
		return this.httpClient.get(this.serverUrl + 'get-vehicles/' + affiliate_id).toPromise();
	}

	// addAffiliateVehicle(data)
	// {
	//   if(data.id)//edit affiliate
	//   {
	//     return this.httpClient.put(this.serverUrl + 'edit-driver',data);
	//   }
	//   else//add affiliate
	//   {
	//     return this.httpClient.post(this.serverUrl + 'add-driver',data);
	//   }
	// }
	// getAffiliateVehicle(id)
	// {
	//   return this.httpClient.get(this.serverUrl + 'affiliate-driver/'+id);
	// }
	// editAffiliateVehicle(data)
	// {
	//   return this.httpClient.put(this.serverUrl + 'edit-driver',data);
	// }
	// affiliateVehicleStatus(id,status)
	// {
	//   return this.httpClient.put(this.serverUrl + 'affiliate-driver-status',{'id':id,'status':status});
	// }
	affiliateTermsAccept(data) {
		return this.httpClient.put(this.serverUrl + 'affiliate-step-completion', data);
	}

	//Create booking
	createBookingGetData() {
		return this.httpClient.get(this.serverUrl + 'amenities-languages-dresses');
	}

	getAccountBytype(accountType) {
		return this.httpClient.get(this.serverUrl + 'get-account-by-type/' + accountType);
	}

	chooseUser(id: number, accountType: string) {
		switch (accountType) {
			case 'individual': {
				return this.httpClient.get(this.serverUrl + 'get-an-account/' + id);
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
	getReservationDetails(reservation_id: number) {

		return this.getBookingDataForEdit(reservation_id, 'detail');
		// return this.httpClient.get(`${this.serverUrl}get-reservation-detail/${reservation_id}`);

	}

	getBookingDataForEdit(reservation_id: number, updateType: string) {
		return this.httpClient.get(`${this.serverUrl}get-reservation/${reservation_id}/${updateType}`);
	}

	getBookingPreview(reservation_id: number) {
		return this.httpClient.get(`${this.serverUrl}admin/get-booking-preview/${reservation_id}`);
	}
	getFinalizeDetails(reservation_id: number) {
		return this.httpClient.get(`${this.serverUrl}admin/finalize-booking-detail/${reservation_id}`);
	}
	updateFinalizeRates(data) {
		return this.httpClient.post(`${this.serverUrl}admin/finalize-rate-edit`, data)
	}

	adminNotification(data) {
		return this.httpClient.post(this.serverUrl + 'admin-notification-daily-booking', data);
	}
	passengerBooking(data){
		return this.httpClient.post(this.serverUrl + 'passenger-booking-confirmation-email' ,data)
	}
	auditTrailInfo(bookingId){
		return this.httpClient.get(this.serverUrl+`admin/booking-audit-records/${bookingId}`)
	}

	loadBookings(url, startDate, endDate, keyword = '') {
		var path;
		if (url) {
			path = url + '&from=' + startDate + '&to=' + endDate + '&search=' + keyword;
		}
		else {
			path = this.serverUrl + 'reservations' + '?from=' + startDate + '&to=' + endDate + '&search=' + keyword;
		}
		return this.httpClient.get(path).toPromise();
	}
	reservationStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'reservation-status', { 'id': id, 'status': status });
	}
	getChargeRates(id) {
		return this.httpClient.get(`${this.serverUrl}get-rates/${id}`);
	}
	paymentProcessing(data) {
		return this.httpClient.post(this.serverUrl + 'payment-processing', data);
	}

	//booking actions
	returnRepeatBooking(data) {
		return this.httpClient.post(this.serverUrl + 'repeat-return-reservation', data);
	}
	//change booking status such as accept/reject
	changeStatusBooking(data) {
		return this.httpClient.put(this.serverUrl + 'change-booking-status', data);
	}
	//send email to affiliate, customer etc
	sendEmail(data) {
		return this.httpClient.post(this.serverUrl + 'send-reservation-detail-email', data);
	}

	sendAffiliateMessage(type: 'email' | 'sms', affiliate_id: number, data: Object) {
		return this.httpClient.post(`${this.serverUrl}admin/notification/send-${type}/${affiliate_id}`, data)
	}

	//invoices
	getInvoiceData(id) {
		return this.httpClient.get(this.serverUrl + 'invoice-summary/' + id);
	}
	invoiceList(url, keyword) {
		var path;
		if (url) {
			path = url + '&search=' + keyword;
		}
		else {
			path = this.serverUrl + 'invoices' + '?search=' + keyword;
		}
		return this.httpClient.get(path).toPromise();
	}

	//sub Admin API
	addSubAdmin(data) {
		if (data.id)//edit affiliate
		{
			return this.httpClient.put(this.serverUrl + 'edit-sub-admin', data);
		}
		else {
			return this.httpClient.post(this.serverUrl + 'add-sub-admin', data);
		}
	}
	subAdminAccounts(url, keyword) {
		var path;
		if (url) {
			path = url + '&search=' + keyword;
		}
		else {
			path = this.serverUrl + 'get-sub-admins' + '?search=' + keyword;
		}
		return this.httpClient.get(path).toPromise();
	}
	getSubAdminAccount(id) {
		return this.httpClient.get(this.serverUrl + 'get-sub-admin-user/' + id);
	}
	subAdminAccountStatus(id, status) {
		return this.httpClient.put(this.serverUrl + 'sub-admin-status', { 'id': id, 'status': status });
	}

	//payment by email API
	getPaymentData(accId, bookingId) {
		return this.httpClient.get(this.serverUrl + 'payment-processing-by-email-page/' + accId + '/' + bookingId);
	}
	paymentProcessingByEmail(data) {
		return this.httpClient.post(this.serverUrl + 'payment-processing-by-email', data);
	}
	//

	//create debit cc card
	paymentProcessingCcDebit(data) {
		return this.httpClient.post(this.serverUrl + 'payment-processing-cc-debit', data);
	}
	//

	//admin cms pages
	getHomePagesSectionContent() {
		return this.httpClient.get(this.serverUrl + 'admin/cms/homepage-content');
	}
	getSingleSectionHomePage(ID) {
		return this.httpClient.get(this.serverUrl + 'admin/cms/homepage-content/section/' + ID);
	}

	saveDataHomePageSection(data) {
		console.log(data);
		return this.httpClient.put(this.serverUrl + 'admin/cms/homepage-content/section/update', data)
	}
	changeStauts(id, event) {
		return this.httpClient.put(this.serverUrl + 'admin/cms/homepage-content/section/status/update', { 'id': id, 'data': event })
	}
	changeStepOSectionStauts(id, event) {
		return this.httpClient.put(this.serverUrl + 'admin/cms/step0/section/status/update', { 'id': id, 'data': event })
	}
	changeStep6SectionStatus(id, event) {
		return this.httpClient.put(`${this.serverUrl}admin/cms/step6/section/status/update`, { id: id, data: event })
	}
	getStepContentData(page: string) {
		return this.httpClient.get(`${this.serverUrl}admin/cms/${page}`)
	}
	getPageSectionData(section_id: number | string, page: string) {
		return this.httpClient.get(`${this.serverUrl}admin/cms/${page}/section/${section_id}`);
	}

	saveStepSectionData(page: string, data: any) {
		return this.httpClient.put(`${this.serverUrl}admin/cms/${page}/section/update`, data);
	}
	uploadAnlImage(image) {
		return this.httpClient.post(this.serverUrl + 'admin/cms/add-image', { 'image': image }).toPromise();
	}

	//aboutUs page
	getAboutUsPageContent() {
		return this.httpClient.get(this.serverUrl + 'admin/cms/about-us');
	}
	getAboutUsSectionDataByID(id) {
		return this.httpClient.get(this.serverUrl + 'admin/cms/about-us/section/' + id);
	}
	saveDataAboutUsSection(data) {
		return this.httpClient.put(this.serverUrl + 'admin/cms/about-us/section/update', data);
	}
	changeAboutUSSectionStauts(id, event) {
		return this.httpClient.put(this.serverUrl + 'admin/cms/about-us/section/status/update', { 'id': id, 'data': event })
	}

	getCurrencies() {
		return this.httpClient.get('assets/json/currencyOptions.json')
	}

	get charterOptions() {
		return this.httpClient.get('assets/json/charterOptions.json')
	}

	fetchAdminNewBookingRates(affiliate_type: string, bookingId: number) {
		if (bookingId) {
			return this.httpClient.get(`${this.serverUrl}admin/reservation-rates/${bookingId}`)
		}
		else {
			return this.httpClient.get(`${this.serverUrl}admin/booking-rates`)
		}
	}
	checkUniquePhoneNumberForLooseCustomer(customer_data: Record<string, any>) {
		return this.httpClient.post(`${this.serverUrl}admin/check-unique-user`, customer_data)
	}

	fetchStepData(step_name: string) {
		return this.httpClient.get(this.serverUrl + 'admin/cms/' + step_name)
	}

	getLocationPoints(booking_id: number) {
		return this.httpClient.get(`${this.serverUrl}admin/booking-location/${booking_id}`)
	}
	getStatusList() {
		return this.httpClient.get(this.serverUrl + 'admin/booking-status-list');
	}



}
