import { Component, ElementRef, EventEmitter, OnDestroy, OnInit, QueryList, ViewChild, ViewChildren, isDevMode } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import * as moment from 'moment';
import { SharedModule } from '../../shared/shared.module';
import { ErrorDialogService } from '../../../services/error-dialog/errordialog.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomvalidationService } from '../../../services/customvalidation.service';

import { AdminService } from '../../../services/admin.service';
import { AffiliateService } from '../../../services/affiliate.service';
import { CommonService } from '../../../services/common.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { HttpClient } from '@angular/common/http';
import { NgxSpinnerService } from 'ngx-spinner';
import { GoogleMap } from '@angular/google-maps';
import * as intlTelInput from 'intl-tel-input';
import { attachPlaceAutocompleteElement, clearPlaceAutocompleteDisplay, getBookingAddressSyncControl, syncPlaceAutocompleteDisplay } from '../../../utils/google-place-autocomplete';

declare var $: any

@Component({
	selector: 'app-new-booking',
	templateUrl: './new-booking.component.html',
	styleUrls: ['./new-booking.component.scss']
})
export class NewBookingComponent implements OnInit, OnDestroy {

	@ViewChild('pickupInput') pickupInput!: ElementRef;
	@ViewChild('dropoffInput') dropoffInput!: ElementRef;
	@ViewChild('loosecustomerInput') loosecustomerInput!: ElementRef;
	@ViewChild('return_pickupInput') return_pickupInput!: ElementRef;
	@ViewChild('return_dropoffInput') return_dropoffInput!: ElementRef;
	@ViewChild('pickupAirportInput') pickupAirportInput!: ElementRef;
	@ViewChild('dropoffAirportInput') dropoffAirportInput!: ElementRef;
	@ViewChild('returnPickupAirportInput') returnPickupAirportInput!: ElementRef;
	@ViewChild('returnDropoffAirportInput') returnDropoffAirportInput!: ElementRef;
	@ViewChild('fboAddressInput') fboAddressInput!: ElementRef;
	@ViewChild('returnFboAddressInput') returnFboAddressInput!: ElementRef;
	@ViewChildren('extraStopInput') extraStopInputs!: QueryList<ElementRef>;
	@ViewChildren('returnExtraStopInput') returnExtraStopInputs!: QueryList<ElementRef>;


	@ViewChild('cellInput') cellInput!: ElementRef;
	@ViewChild('passengercellInput') passengercellInput!: ElementRef;
	@ViewChild('drivercellInput') drivercellInput!: ElementRef;

	todays_date: string = moment().format('YYYY-MM-DD');
	minDate = new Date();

	booking_params: any = {
		transfer_types: ["airport_to_city", "airport_to_airport", "airport_to_cruise", "city_to_city", "city_to_airport", "city_to_cruise", "cruise_to_airport?", "cruise_to_city"],
		client_account_types: ['individual'],
		affiliate_accounts: ['affiliate', 'loose_affiliate'],
		numbers: (() => {
			let arr = []
			for (let i = 0; i <= 1000; i++) {
				arr.push(i)
			}
			return arr
		})(),
		years: (() => {
			let arr = []
			let i = 0;
			let year = new Date().getFullYear();
			while (i <= 15) {
				arr.push(year + i);
				i++;
			}
			return arr
		})(),
		chevrons: {
			languages: false,
			dresses: false,
			amenities: false,
			images: false,
			taxnrates: false,
		}
	}

	months: any = [{ value: '01' }, { value: '02' }, { value: '03' }, { value: '04' }, { value: '05' }, { value: '06' }, { value: '07' }, { value: '08' }, { value: '09' }, { value: '10' }, { value: '11' }, { value: '12' }]
	monthOptions: any = [...this.months]
	//[{value:'01'},{value:'02'},{value:'03'},{value:'04'},{value:'05'},{value:'06'},{value:'07'},{value:'08'},{value:'09'},{value:'10'},{value:'11'},{value:'12'}]

	LCTelObject: any
	PaxTelObject: any
	DrvTelObject: any
	LATelObject: any

	BookingForm: FormGroup
	RatesForm: any
	ReturnRatesForm: any

	booking_id: number = 0
	newBooking: boolean = false

	driver_image: Record<string, any> = {}
	vehicle_image: Record<string, any> = {}

	BigData: any
	BigData_COPY: any
	activeCustomAddressDropdown: string | null = null;
	activeCustomAirportDropdown: string | null = null;
	private customAddressDropdownBlurTimeout?: ReturnType<typeof setTimeout>;
	private customAirportDropdownBlurTimeout?: ReturnType<typeof setTimeout>;
	private customPlacesService?: google.maps.places.PlacesService;
	private customAddressSearchVersion: Record<string, number> = {};
	private customAirportSearchVersion: Record<string, number> = {};
	private customAddressSearchLoading: Record<string, boolean> = {};
	private customAirportSearchLoading: Record<string, boolean> = {};
	private customAddressOptions: Record<string, Array<any>> = {};
	private customAirportOptions: Record<string, Array<any>> = {};
	private customAirportSearchDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
	private customAirportAutocompleteSessionTokens: Record<string, string> = {};
	AffiliateInformation: Record<string, any> = {}
	ClientAccounts: Array<Record<string, any>> = []
	AffiliateAccounts: Array<Record<string, any>> = []
	VehicleList: Array<Record<string, any>> = []
	DriverList: Array<Record<string, any>> = []

	chosen_user: Record<string, any>

	distance: number = 0
	extraStops_rate: any = 0
	return_distance: number = 0
	distance_for_rates: string = ''
	amenities: Array<string> = []

	init_rates: boolean = false
	init_return_rates: boolean = false
	is_loose_customer_unique: boolean = false
	is_booking_edit_case: boolean = false
	reset_button: boolean = false
	submitBookingForm: boolean;
	nav_to_farmIn: boolean = true;
	booking_data: any = {};
	service_type: any = 'one_way';
	transfer_type: any = 'city_to_city'
	number_of_hours: any = '0';
	numberOfHoursError: boolean = false;
	is_master_vehicle: boolean = JSON.parse(sessionStorage.getItem('selected_vehicle'))?.is_master_vehicle || false
	isTravelShare: boolean;
	isCreatedByAdmin: boolean = true;
	adminSharePercent: number = 25;
	shareArray: any;
	r_shareArray: any;
	isFarmoutBooking: boolean = false;
	currencySymbol: any;
	currencyObj: any;
	updateType: any;
	bookingResponse: any;
	vehicleType_arr: any;
	vehicleMake_arr: any;
	vehicleModal_arr: any;
	vehicleYear_arr: any;
	vehicleColor_arr: any;
	unique_key: any;
	firstLoadAffiliateId: any;
	firstLoadVehicleId: any;
	currentUser: any;
	private isClearingSelection = false;


	constructor(
		private $form: FormBuilder,
		private $api: AdminService,
		private affiliateService: AffiliateService,
		private $shared: SharedModule,
		private $spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private $router: Router,
		private $routeurl: ActivatedRoute,
		private customValidator: CustomvalidationService,
		private commonServices: CommonService,
		private stateManagementService: StateManagementService,
		private el: ElementRef,
		private httpClient: HttpClient,
	) { }

	ngOnInit(): void {

		this.currentUser = JSON.parse(localStorage.getItem('currentUser'))


		// build the form first 
		this.buildBookingForm()
		this.$routeurl.queryParams.subscribe((params: any) => {
			this.nav_to_farmIn = params.nav == 'true' ? true : false
			if (params && params.bookingId && !this.booking_id) {
				this.is_booking_edit_case = true
				this.SetFormValue('reservation_id', params.bookingId)
				console.log('settting-------------- reservation_id', params.bookingId)
				params.updateType ? this.SetFormValue('updateType', params.updateType) : this.SetFormValue('updateType', 'edit')
				this.updateType = params.updateType
			}
			else if (params && params.new == 'true') {
				console.log('in create new booking through QB------------->>', params.new == 'true')
				this.newBooking = params.new == 'true'
			}
			else {
				this.resetFields()
			}
			// place in query params to reinitialise things when modes of new and edit are toggled
			// Subscriptions
			//save currency symbol
			// this.currencySymbol = this.stateManagementService.getCurrencySymbol();
			this.currencyObj = JSON.parse(sessionStorage.getItem('currencyData'))
			this.currencySymbol = this.currencyObj ? this.currencyObj?.symbol : JSON.parse(localStorage.getItem("currencySymbol"))

			this.Subscriptions()
			this.fetchClientAccounts('individual')
			// this.fetchAffiliates('affiliate')
			this.select(true, 'driver_languages', 1)
		})

		// fetch the big data
		this.fetchAirportsAndBigData()

	}


	ngAfterViewInit() {

		this.initphonefield()
		this.initAllAutocompletes()

		// Re-initialize when dynamic views update
		this.extraStopInputs.changes.subscribe(() => {
			setTimeout(() => this.initAllAutocompletes(), 100);
		});

		this.returnExtraStopInputs.changes.subscribe(() => {
			setTimeout(() => this.initAllAutocompletes(), 100);
		});

	}

	ngOnDestroy(): void {
		Object.values(this.customAirportSearchDebounceTimers).forEach((timer) => clearTimeout(timer));
		this.customAirportSearchDebounceTimers = {};
		this.customAirportAutocompleteSessionTokens = {};
	}


	initphonefield() {
		console.log("in init phone", this.cellInput, this.passengercellInput, this.drivercellInput);

		const getInitCountry = (group: string, controlName: string, isdControlName?: string) => {
			let val;
			let isd;
			if (group) {
				const grp = (<FormGroup>this.BookingForm.get(group));
				val = grp.get(controlName)?.value;
				if (isdControlName) isd = grp.get(isdControlName)?.value;
			} else {
				val = this.BookingForm.get(controlName)?.value;
				if (isdControlName) isd = this.BookingForm.get(isdControlName)?.value;
			}

			if (val) return val;
			// If no country but we have an ISD, don't force default 'auto' just yet, or maybe 'auto' handles it?
			// But 'auto' usually does IP lookup.
			// Best to return null/undefined so we can handle it specifically, or stick to 'auto' but let called logic know?
			// For now, let's just stick to logic: if ISD exists, we might default to US temporarily but prefill should fix it.
			// BUT if this runs AFTER prefill, we must NOT return default if ISD is present.

			if (isd) {
				// We have ISD but no country. Try to map simple ones or return 'auto' but avoid currentUser override if possible?
				// Actually, if we return 'auto' here, intlTelInput will do lookup.
				// If we return currentUser, it forces US.
				// Let's return 'auto' if ISD is present, so at least it doesn't force US.
				// Or even better: try to deduce country from ISD here?
				// Simple heuristic:
				if (String(isd).includes('44')) return 'gb';
				if (String(isd).includes('1')) return 'us';
				if (String(isd).includes('52')) return 'mx';
				return 'auto';
			}

			return this.currentUser?.phoneCountry || this.currentUser?.country || 'auto';
		};

		if (this.cellInput) {
			const existing = (window as any).intlTelInputGlobals?.getInstance(this.cellInput.nativeElement);
			if (existing) existing.destroy();
			const lcCountry = getInitCountry('loose_customer', 'phone_country', 'phone_isd');
			this.LCTelObject = intlTelInput(this.cellInput.nativeElement, this.commonServices.getTelInputOptions(lcCountry));

			this.addCustomCountrySearch(this.cellInput.nativeElement);
			this.cellInput.nativeElement.addEventListener('countrychange', () => {
				const countryData = this.LCTelObject.getSelectedCountryData();
				console.log("in country chnage", countryData)
				this.onLCTeleCountryChange(countryData)
				this.validateLooseCustomerPhone();
			});
		}

		if (this.passengercellInput) {
			const existing = (window as any).intlTelInputGlobals?.getInstance(this.passengercellInput.nativeElement);
			if (existing) existing.destroy();
			const paxCountry = getInitCountry(null, 'passenger_cell_country', 'passenger_cell_isd');

			// If we have ISD but getInitCountry returned 'auto' or something, we might want to setNumber?
			this.PaxTelObject = intlTelInput(this.passengercellInput.nativeElement, this.commonServices.getTelInputOptions(paxCountry));

			const paxIsd = this.BookingForm.get('passenger_cell_isd')?.value;
			if (!this.BookingForm.get('passenger_cell_country')?.value && paxIsd) {
				// No country but have ISD. 
				// prefill might have set number.
				// Ensure flag is correct.
				// this.PaxTelObject.setNumber(paxIsd); // This might affect input value.
			}

			this.addCustomCountrySearch(this.passengercellInput.nativeElement);
			this.passengercellInput.nativeElement.addEventListener('countrychange', () => {
				const countryData = this.PaxTelObject.getSelectedCountryData();
				console.log("in country chnage", countryData)
				this.SetFormValue('passenger_cell_isd', '+' + countryData.dialCode); this.SetFormValue('passenger_cell_country', countryData.iso2)
				this.validatePassengerCell();
			});
		}

		if (this.drivercellInput) {
			const existing = (window as any).intlTelInputGlobals?.getInstance(this.drivercellInput.nativeElement);
			if (existing) existing.destroy();
			const drvCountry = getInitCountry(null, 'driver_cell_country', 'driver_cell_isd');
			this.DrvTelObject = intlTelInput(this.drivercellInput.nativeElement, this.commonServices.getTelInputOptions(drvCountry));

			this.addCustomCountrySearch(this.drivercellInput.nativeElement);
			this.drivercellInput.nativeElement.addEventListener('countrychange', () => {
				const countryData = this.DrvTelObject.getSelectedCountryData();
				console.log("in country chnage", countryData)
				this.SetFormValue('driver_cell_isd', '+' + countryData.dialCode); this.SetFormValue('driver_cell_country', countryData.iso2)
				this.validateDriverCell();
			});
		}

	}

	initAllAutocompletes() {
		this.BookingForm?.updateValueAndValidity({ emitEvent: false });
	}

	private isTouchBookingInteraction(): boolean {
		if (typeof window === 'undefined') {
			return false;
		}

		return window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 1024;
	}

	private getGoogleMapsApiKey(): string {
		if (typeof document === 'undefined') {
			return '';
		}

		const script = Array.from(document.querySelectorAll('script[src]')).find((item) =>
			item.getAttribute('src')?.includes('maps.googleapis.com/maps/api/js')
		);

		if (!script) {
			return '';
		}

		try {
			const scriptUrl = new URL(script.getAttribute('src') || '', window.location.origin);
			return scriptUrl.searchParams.get('key') || '';
		} catch {
			return '';
		}
	}

	private getCustomPlacesService(): google.maps.places.PlacesService | null {
		if (typeof google === 'undefined' || !google?.maps?.places) {
			return null;
		}

		if (!this.customPlacesService) {
			this.customPlacesService = new google.maps.places.PlacesService(document.createElement('div'));
		}

		return this.customPlacesService;
	}

	getExtraStopFieldKey(isReturn: boolean, index: number): string {
		return `${isReturn ? 'return_extra_stops' : 'extra_stops'}:${index}`;
	}

	private parseExtraStopFieldKey(fieldName: string): { formArrayName: 'extra_stops' | 'return_extra_stops'; index: number } | null {
		const match = String(fieldName || '').match(/^(extra_stops|return_extra_stops):(\d+)$/);
		if (!match) {
			return null;
		}

		return {
			formArrayName: match[1] as 'extra_stops' | 'return_extra_stops',
			index: Number(match[2])
		};
	}

	private getExtraStopGroup(fieldName: string): FormGroup | null {
		const parsedField = this.parseExtraStopFieldKey(fieldName);
		if (!parsedField) {
			return null;
		}

		return ((this.BookingForm.get(parsedField.formArrayName) as FormArray)?.at(parsedField.index) as FormGroup) || null;
	}

	private getCustomAddressFieldValue(fieldName: string): string {
		const extraStopGroup = this.getExtraStopGroup(fieldName);
		if (extraStopGroup) {
			return String(extraStopGroup.get('address')?.value || '').trim();
		}

		return String(this.BookingForm.get(fieldName)?.value || '').trim();
	}

	private setCustomAddressFieldValue(fieldName: string, value: string): void {
		const extraStopGroup = this.getExtraStopGroup(fieldName);
		if (extraStopGroup) {
			extraStopGroup.patchValue({
				address: value,
				latitude: '',
				longitude: ''
			}, { emitEvent: false });
			return;
		}

		const control = this.BookingForm.get(fieldName);
		if (control) {
			control.setValue(value, { emitEvent: false });
			control.updateValueAndValidity({ emitEvent: false });
		}

		if (fieldName !== 'loose_customer.address') {
			this.BookingForm.get(`${fieldName}_latitude`)?.setValue('', { emitEvent: false });
			this.BookingForm.get(`${fieldName}_longitude`)?.setValue('', { emitEvent: false });
		}
	}

	private getPredictionTextValue(value: any): string {
		if (!value) {
			return '';
		}
		if (typeof value === 'string') {
			return value.trim();
		}
		if (typeof value?.text === 'string') {
			return value.text.trim();
		}
		if (typeof value?.text?.text === 'string') {
			return value.text.text.trim();
		}
		if (typeof value?.plainText === 'string') {
			return value.plainText.trim();
		}
		if (typeof value?.stringValue === 'string') {
			return value.stringValue.trim();
		}
		return '';
	}

	private nextCustomSearchVersion(kind: 'address' | 'airport', fieldName: string): number {
		const versionMap = kind === 'address' ? this.customAddressSearchVersion : this.customAirportSearchVersion;
		const nextVersion = (versionMap[fieldName] || 0) + 1;
		versionMap[fieldName] = nextVersion;
		return nextVersion;
	}

	private isLatestCustomSearchVersion(kind: 'address' | 'airport', fieldName: string, version: number): boolean {
		const versionMap = kind === 'address' ? this.customAddressSearchVersion : this.customAirportSearchVersion;
		return (versionMap[fieldName] || 0) === version;
	}

	private setCustomSearchLoading(kind: 'address' | 'airport', fieldName: string, isLoading: boolean): void {
		const loadingMap = kind === 'address' ? this.customAddressSearchLoading : this.customAirportSearchLoading;
		loadingMap[fieldName] = isLoading;
	}

	isCustomSearchLoading(kind: 'address' | 'airport', fieldName: string): boolean {
		const loadingMap = kind === 'address' ? this.customAddressSearchLoading : this.customAirportSearchLoading;
		return !!loadingMap[fieldName];
	}

	private setCustomOptions(kind: 'address' | 'airport', fieldName: string, options: Array<any>): void {
		const optionsMap = kind === 'address' ? this.customAddressOptions : this.customAirportOptions;
		optionsMap[fieldName] = options;
	}

	getCustomAddressOptions(fieldName: string): Array<any> {
		return this.customAddressOptions[fieldName] || [];
	}

	getCustomAirportOptions(fieldName: string): Array<any> {
		return this.customAirportOptions[fieldName] || [];
	}

	private hasResolvedCustomAirportSelection(fieldName: string): boolean {
		const selectedId = this.BookingForm?.get(fieldName)?.value;
		const displayValue = String(this.BookingForm?.get(`${fieldName}_option`)?.value || '').trim();
		const latitude = this.BookingForm?.get(`${fieldName}_latitude`)?.value;
		const longitude = this.BookingForm?.get(`${fieldName}_longitude`)?.value;

		return !!selectedId
			&& !!displayValue
			&& latitude !== ''
			&& latitude !== null
			&& latitude !== undefined
			&& longitude !== ''
			&& longitude !== null
			&& longitude !== undefined;
	}

	private getResolvedCustomAirportOption(fieldName: string): any | null {
		if (!this.hasResolvedCustomAirportSelection(fieldName)) {
			return null;
		}

		const selectedId = this.BookingForm?.get(fieldName)?.value;
		const displayValue = String(this.BookingForm?.get(`${fieldName}_option`)?.value || '').trim();
		const latitude = this.BookingForm?.get(`${fieldName}_latitude`)?.value;
		const longitude = this.BookingForm?.get(`${fieldName}_longitude`)?.value;

		if (!displayValue) {
			return null;
		}

		return {
			placeId: selectedId,
			name: displayValue,
			description: displayValue,
			secondaryText: '',
			isTerminal: displayValue.toLowerCase().includes('terminal'),
			latitude,
			longitude
		};
	}

	getVisibleCustomAirportOptions(fieldName: string): Array<any> {
		const options = this.getCustomAirportOptions(fieldName);
		if (options?.length) {
			return options;
		}

		const selectedOption = this.getResolvedCustomAirportOption(fieldName);
		return selectedOption ? [selectedOption] : [];
	}

	isCustomAddressDropdownOpen(fieldName: string): boolean {
		return this.activeCustomAddressDropdown === fieldName;
	}

	isCustomAirportDropdownOpen(fieldName: string): boolean {
		return this.activeCustomAirportDropdown === fieldName;
	}

	shouldShowCustomPrompt(kind: 'address' | 'airport', fieldName: string): boolean {
		const value = kind === 'address'
			? this.getCustomAddressFieldValue(fieldName)
			: String(this.BookingForm?.get(`${fieldName}_option`)?.value || '').trim();
		const isOpen = kind === 'address' ? this.isCustomAddressDropdownOpen(fieldName) : this.isCustomAirportDropdownOpen(fieldName);
		return isOpen && !value && !this.isCustomSearchLoading(kind, fieldName);
	}

	shouldShowCustomEmpty(kind: 'address' | 'airport', fieldName: string): boolean {
		const value = kind === 'address'
			? this.getCustomAddressFieldValue(fieldName)
			: String(this.BookingForm?.get(`${fieldName}_option`)?.value || '').trim();
		const isOpen = kind === 'address' ? this.isCustomAddressDropdownOpen(fieldName) : this.isCustomAirportDropdownOpen(fieldName);
		const options = kind === 'address' ? this.getCustomAddressOptions(fieldName) : this.getVisibleCustomAirportOptions(fieldName);
		return isOpen && !!value && !this.isCustomSearchLoading(kind, fieldName) && !options.length;
	}

	private clearCustomAddressDropdownBlurTimer(): void {
		if (this.customAddressDropdownBlurTimeout) {
			clearTimeout(this.customAddressDropdownBlurTimeout);
			this.customAddressDropdownBlurTimeout = undefined;
		}
	}

	private clearCustomAirportDropdownBlurTimer(): void {
		if (this.customAirportDropdownBlurTimeout) {
			clearTimeout(this.customAirportDropdownBlurTimeout);
			this.customAirportDropdownBlurTimeout = undefined;
		}
	}

	openCustomAddressDropdown(fieldName: string): void {
		this.clearCustomAddressDropdownBlurTimer();
		this.closeCustomAirportDropdown();
		this.activeCustomAddressDropdown = fieldName;
		void this.searchCustomAddress(fieldName, this.getCustomAddressFieldValue(fieldName));
	}

	closeCustomAddressDropdown(fieldName?: string): void {
		this.clearCustomAddressDropdownBlurTimer();
		if (!fieldName || this.activeCustomAddressDropdown === fieldName) {
			this.activeCustomAddressDropdown = null;
		}
	}

	openCustomAirportDropdown(fieldName: string): void {
		this.clearCustomAirportDropdownBlurTimer();
		this.closeCustomAddressDropdown();
		this.activeCustomAirportDropdown = fieldName;
		const selectedOption = this.getResolvedCustomAirportOption(fieldName);
		if (selectedOption) {
			this.setCustomOptions('airport', fieldName, [selectedOption]);
			return;
		}
		void this.searchCustomAirport(fieldName, this.BookingForm.get(`${fieldName}_option`)?.value || '');
	}

	closeCustomAirportDropdown(fieldName?: string): void {
		this.clearCustomAirportDropdownBlurTimer();
		if (!fieldName || this.activeCustomAirportDropdown === fieldName) {
			this.activeCustomAirportDropdown = null;
		}
	}

	private clearCustomAirportSearchDebounceTimer(fieldName: string): void {
		if (this.customAirportSearchDebounceTimers[fieldName]) {
			clearTimeout(this.customAirportSearchDebounceTimers[fieldName]);
			delete this.customAirportSearchDebounceTimers[fieldName];
		}
	}

	private scheduleCustomAirportSearch(fieldName: string, value: string, delay = 300): void {
		this.clearCustomAirportSearchDebounceTimer(fieldName);
		this.customAirportSearchDebounceTimers[fieldName] = setTimeout(() => {
			void this.searchCustomAirport(fieldName, value || '');
		}, delay);
	}

	private getOrCreateCustomAirportSessionToken(fieldName: string): string {
		const existingToken = this.customAirportAutocompleteSessionTokens[fieldName];
		if (existingToken) {
			return existingToken;
		}

		const token = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `${fieldName}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

		this.customAirportAutocompleteSessionTokens[fieldName] = token;
		return token;
	}

	private resetCustomAirportSessionToken(fieldName: string): void {
		delete this.customAirportAutocompleteSessionTokens[fieldName];
	}

	onCustomAddressFocus(fieldName: string, input?: HTMLInputElement): void {
		if (!this.isTouchBookingInteraction()) {
			input?.select();
		}
		this.openCustomAddressDropdown(fieldName);
	}

	onCustomAddressBlur(fieldName: string): void {
		this.clearCustomAddressDropdownBlurTimer();
		this.customAddressDropdownBlurTimeout = setTimeout(() => this.closeCustomAddressDropdown(fieldName), 150);
	}

	onCustomAirportFocus(fieldName: string, input?: HTMLInputElement): void {
		if (!this.isTouchBookingInteraction()) {
			input?.select();
		}
		this.openCustomAirportDropdown(fieldName);
	}

	onCustomAirportBlur(fieldName: string): void {
		this.clearCustomAirportDropdownBlurTimer();
		this.customAirportDropdownBlurTimeout = setTimeout(() => this.closeCustomAirportDropdown(fieldName), 150);
	}

	onCustomAddressInput(fieldName: string, value: string): void {
		this.clearCustomAddressDropdownBlurTimer();
		this.setCustomAddressFieldValue(fieldName, value || '');
		this.BookingForm.updateValueAndValidity({ emitEvent: false });
		this.openCustomAddressDropdown(fieldName);
		void this.searchCustomAddress(fieldName, value || '');
	}

	onCustomAirportInput(fieldName: string, value: string): void {
		this.clearCustomAirportDropdownBlurTimer();
		this.BookingForm.get(`${fieldName}_option`)?.setValue(value, { emitEvent: false });
		this.BookingForm.get(fieldName)?.setValue('', { emitEvent: false });
		this.BookingForm.get(`${fieldName}_name`)?.setValue('', { emitEvent: false });
		this.BookingForm.get(`${fieldName}_latitude`)?.setValue('', { emitEvent: false });
		this.BookingForm.get(`${fieldName}_longitude`)?.setValue('', { emitEvent: false });
		this.BookingForm.updateValueAndValidity({ emitEvent: false });
		this.activeCustomAirportDropdown = fieldName;
		this.scheduleCustomAirportSearch(fieldName, value || '', 300);
	}

	getCustomOptionLabel(option: any): string {
		return String(option?.name || option?.description || '').trim();
	}

	getCustomOptionSecondary(option: any): string {
		return String(option?.secondaryText || '').trim();
	}

	isCustomAirportTerminalOption(option: any): boolean {
		return !!option?.isTerminal;
	}

	private searchGooglePredictions(searchText: string, sessionToken?: string): Promise<Array<any>> {
		const apiKey = this.getGoogleMapsApiKey();
		if (!apiKey || !String(searchText || '').trim()) {
			return Promise.resolve([]);
		}

		return fetch('https://places.googleapis.com/v1/places:autocomplete', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Goog-Api-Key': apiKey,
				'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text,suggestions.placePrediction.types'
			},
			body: JSON.stringify({
				input: searchText,
				includeQueryPredictions: false,
				languageCode: 'en-US',
				...(sessionToken ? { sessionToken } : {})
			})
		})
			.then((response) => response.ok ? response.json() : Promise.resolve({ suggestions: [] }))
			.then((response: any) => {
				const suggestions = Array.isArray(response?.suggestions) ? response.suggestions : [];
				return suggestions
					.map((suggestion: any) => suggestion?.placePrediction)
					.filter((prediction: any) => !!prediction?.placeId)
					.map((prediction: any) => ({
						placeId: prediction.placeId,
						types: prediction.types || [],
						name: this.getPredictionTextValue(prediction?.structuredFormat?.mainText)
							|| this.getPredictionTextValue(prediction?.text)?.split(',')[0]?.trim()
							|| this.getPredictionTextValue(prediction?.text),
						secondaryText: this.getPredictionTextValue(prediction?.structuredFormat?.secondaryText),
						description: this.getPredictionTextValue(prediction?.text)
					}))
					.slice(0, 8);
			})
			.catch(() => []);
	}

	private isAirportPrediction(option: any): boolean {
		const combined = [option?.name, option?.secondaryText, option?.description, (option?.types || []).join(' ')].join(' ').toLowerCase();
		return ['airport', 'terminal', 'concourse', 'fbo', 'airfield', 'aerodrome', 'gate', 'parking', 'garage', 'departures', 'arrivals'].some((keyword) =>
			combined.includes(keyword)
		);
	}

	private getCustomAirportBaseQuery(searchText: string): string {
		const normalizedSearchText = String(searchText || '')
			.replace(/\s+/g, ' ')
			.trim();

		if (!normalizedSearchText) {
			return '';
		}

		const terminalPrefixes = ['t', 'te', 'ter', 'term', 'termi', 'termin', 'termina', 'terminal'];
		const parts = normalizedSearchText.split(' ').filter(Boolean);
		const lastToken = String(parts[parts.length - 1] || '').toLowerCase();

		if (terminalPrefixes.includes(lastToken)) {
			return parts.slice(0, -1).join(' ').trim();
		}

		return normalizedSearchText.replace(/\bterminal\b.*$/i, '').replace(/\s+/g, ' ').trim();
	}

	private getCustomAirportPredictionType(option: any): string {
		const types = Array.isArray(option?.types) ? option.types.map((type: string) => String(type || '').toLowerCase()) : [];
		return types.includes('airport') ? 'airport' : 'terminal';
	}

	private normalizeCustomAirportSearchText(value: string): string {
		return String(value || '')
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	private buildCustomAirportMatchTokens(airport: any, searchText: string): string[] {
		const codeMatches = [airport?.name, airport?.description, searchText]
			.flatMap((value: any) => String(value || '').match(/\b[A-Z]{3,4}\b/g) || [])
			.map((value: string) => value.toLowerCase());

		const phraseCandidates = [
			String(searchText || '').trim(),
			String(airport?.name || '').trim(),
			String(airport?.secondaryText || '').split(',')[0]?.trim() || '',
		]
			.map((value) => this.normalizeCustomAirportSearchText(value))
			.filter((value) => value.length >= 3);

		return Array.from(new Set([...codeMatches, ...phraseCandidates]));
	}

	private findMatchingCustomAirportForTerminal(terminal: any, airports: Array<any>, searchText: string): any | null {
		const normalizedDescription = this.normalizeCustomAirportSearchText(terminal?.description || terminal?.secondaryText || terminal?.name || '');
		if (!normalizedDescription.includes('terminal')) {
			return null;
		}

		for (const airport of airports) {
			const tokens = this.buildCustomAirportMatchTokens(airport, searchText);
			if (tokens.some((token) => token && normalizedDescription.includes(token))) {
				return airport;
			}
		}

		return null;
	}

	private dedupeCustomAirportOptions(options: Array<any>): Array<any> {
		const seen = new Set<string>();
		return options.filter((option: any) => {
			const key = String(option?.placeId || `${option?.name}__${option?.description}`).toLowerCase();
			if (!key || seen.has(key)) {
				return false;
			}
			seen.add(key);
			return true;
		});
	}

	private mergeCustomAirportAndTerminalPredictions(airports: Array<any>, terminals: Array<any>, searchText: string): Array<any> {
		const merged: Array<any> = [];
		const matchedTerminalIds = new Set<string>();
		const normalizedTerminals = this.dedupeCustomAirportOptions(terminals);

		for (const airport of this.dedupeCustomAirportOptions(airports)) {
			merged.push({
				...airport,
				isTerminal: false,
			});

			const airportTerminals = normalizedTerminals.filter((terminal: any) => {
				const matchingAirport = this.findMatchingCustomAirportForTerminal(terminal, [airport], searchText);
				if (!matchingAirport) {
					return false;
				}

				const terminalKey = String(terminal?.placeId || `${terminal?.name}__${terminal?.description}`).toLowerCase();
				if (matchedTerminalIds.has(terminalKey)) {
					return false;
				}

				matchedTerminalIds.add(terminalKey);
				return true;
			});

			if (airportTerminals.length) {
				merged.push(...airportTerminals.map((terminal: any) => ({
					...terminal,
					isTerminal: true,
					parentAirportPlaceId: airport.placeId,
					parentAirportName: airport.name,
				})));
			}
		}

		return merged;
	}

	private fetchPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult | null> {
		const service = this.getCustomPlacesService();
		if (!service || !placeId) {
			return Promise.resolve(null);
		}

		return new Promise((resolve) => {
			service.getDetails(
				{
					placeId,
					fields: ['place_id', 'name', 'formatted_address', 'geometry', 'address_components', 'types']
				},
				(place, status) => {
					if (status !== google.maps.places.PlacesServiceStatus.OK || !place) {
						resolve(null);
						return;
					}
					resolve(place);
				}
			);
		});
	}

	async searchCustomAddress(fieldName: string, value: string): Promise<void> {
		const requestVersion = this.nextCustomSearchVersion('address', fieldName);
		const searchText = String(value || '').trim();
		if (!searchText) {
			if (this.isLatestCustomSearchVersion('address', fieldName, requestVersion)) {
				this.setCustomSearchLoading('address', fieldName, false);
				this.setCustomOptions('address', fieldName, []);
			}
			return;
		}

		this.setCustomSearchLoading('address', fieldName, true);
		const options = await this.searchGooglePredictions(searchText);
		if (this.isLatestCustomSearchVersion('address', fieldName, requestVersion)) {
			this.setCustomOptions('address', fieldName, options);
			this.setCustomSearchLoading('address', fieldName, false);
		}
	}

	async searchCustomAirport(fieldName: string, value: string): Promise<void> {
		const requestVersion = this.nextCustomSearchVersion('airport', fieldName);
		const searchText = String(value || '').trim();
		const selectedOption = this.getResolvedCustomAirportOption(fieldName);
		if (!searchText) {
			if (this.isLatestCustomSearchVersion('airport', fieldName, requestVersion)) {
				this.setCustomSearchLoading('airport', fieldName, false);
				this.setCustomOptions('airport', fieldName, selectedOption ? [selectedOption] : []);
			}
			return;
		}

		this.setCustomSearchLoading('airport', fieldName, true);
		const baseSearchText = this.getCustomAirportBaseQuery(searchText) || searchText;
		const terminalSearchText = `${baseSearchText} terminal`.trim();
		const sessionToken = this.getOrCreateCustomAirportSessionToken(fieldName);
		const [airportOptions, terminalOptions] = await Promise.all([
			this.searchGooglePredictions(baseSearchText, sessionToken),
			this.searchGooglePredictions(terminalSearchText, sessionToken)
		]);

		const airportPredictions = airportOptions
			.filter((option) => this.isAirportPrediction(option) && this.getCustomAirportPredictionType(option) === 'airport')
			.map((option) => ({ ...option, isTerminal: false }));

		const terminalPredictions = terminalOptions
			.filter((option) =>
				this.isAirportPrediction(option)
				&& String(option?.description || '').toLowerCase().includes('terminal')
			)
			.map((option) => ({ ...option, isTerminal: true }));

		const options = terminalPredictions.length
			? this.mergeCustomAirportAndTerminalPredictions(airportPredictions, terminalPredictions, baseSearchText)
			: this.dedupeCustomAirportOptions(airportPredictions);

		if (this.isLatestCustomSearchVersion('airport', fieldName, requestVersion)) {
			this.setCustomOptions('airport', fieldName, options.length ? options : (selectedOption ? [selectedOption] : []));
			this.setCustomSearchLoading('airport', fieldName, false);
		}
	}

	async selectCustomAddressOption(fieldName: string, option: any): Promise<void> {
		this.clearCustomAddressDropdownBlurTimer();
		const place = await this.fetchPlaceDetails(option?.placeId);
		if (place?.geometry?.location) {
			if (fieldName === 'loose_customer.address') {
				this.fillLooseCustomerAddress(place);
			} else {
				const formattedAddress = place.formatted_address ?? '';
				const placeName = place.name ?? '';
				const displayAddress = placeName ? `${placeName} - ${formattedAddress}` : formattedAddress;
				const addressPayload = {
					...place,
					formatted_address: formattedAddress,
					display_address: displayAddress
				};
				const extraStopField = this.parseExtraStopFieldKey(fieldName);
				if (extraStopField) {
					this.fillExtraStop(extraStopField.formArrayName === 'return_extra_stops', extraStopField.index, addressPayload, {
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					});
				} else {
					this.fillAddress(fieldName, addressPayload);
					this.fillLocationPoints(fieldName, {
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					});
				}
			}
		}
		this.closeCustomAddressDropdown(fieldName);
	}

	async selectCustomAirportOption(fieldName: string, option: any): Promise<void> {
		this.clearCustomAirportDropdownBlurTimer();
		const place = await this.fetchPlaceDetails(option?.placeId);
		if (place?.geometry?.location) {
			this.handleAirportPlaceSelection(fieldName, place);
		}
		this.resetCustomAirportSessionToken(fieldName);
		this.closeCustomAirportDropdown(fieldName);
	}

	initAutocomplete(input: ElementRef, control: string, index?: number, is_return: boolean = false) {
		const nativeInput = input instanceof ElementRef ? input.nativeElement : input;
		console.log("initautocomplete", nativeInput)

		void attachPlaceAutocompleteElement(
			nativeInput,
			{
				types: ['geocode', 'establishment'],
				fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components', 'types'],
				syncControl: getBookingAddressSyncControl(this.BookingForm, control, index),
			},
			(place) => {
				if (!place.geometry || !place.geometry.location) return;

				const formattedAddress = place.formatted_address ?? '';
				const placeName = place.name ?? '';
				const displayAddress = placeName ? `${placeName} - ${formattedAddress}` : formattedAddress;
				const location = {
					latitude: place.geometry.location.lat(),
					longitude: place.geometry.location.lng()
				};

				if (control === 'loose_customer') {
					this.fillLooseCustomerAddress(place);
					nativeInput.value = displayAddress;
					return;
				}

				if (control === 'extra_stops' || control === 'return_extra_stops') {
					this.fillExtraStop(!!is_return, index!, { formatted_address: formattedAddress, display_address: displayAddress }, location);
					nativeInput.value = displayAddress;
				} else {
					this.fillAddress(control, { formatted_address: formattedAddress, display_address: displayAddress });
					this.fillLocationPoints(control, location);
					nativeInput.value = displayAddress;
				}
			}
		);
	}

	initAirportAutocomplete(input: ElementRef | HTMLInputElement, control: string) {
		const nativeInput = input instanceof ElementRef ? input.nativeElement : input;
		console.log("init airport autocomplete", nativeInput, control)

		void attachPlaceAutocompleteElement(
			nativeInput,
			{
				airportField: true,
				primaryTypes: ['airport'],
				syncControl: this.BookingForm.get(`${control}_option`) ?? undefined,
			},
			(place) => {
				if (!place.geometry || !place.geometry.location) return;
				this.handleAirportPlaceSelection(control, place);
				nativeInput.value = this.getAirportSelectionLabel(place);
			}
		);
	}


	scroll(id) {
		let el = document.getElementById(id);
		console.log(`scrolling to ${id}`, el);
		el.scrollIntoView(true);
	}

	dateFormat(value: any) {
		return moment(value, 'YYYY-MM-DD').format('ll')
	}

	dateFormat2(value: any) {
		return moment(value, 'YYYY-MM-DD').format('L')
	}

	dateFormatToDay(value: any) {
		return moment(value, "YYYY-MM-DD").format('dddd');
	}

	timeFormat(value: any) {
		if (value.toUpperCase() == '12:00 AM') {
			return '0000 h'
		}
		let hours = moment(moment(value, 'hh:mm a').format('HH'), 'HH').hours();
		let mins = moment(value, 'hh:mm a').minutes().toString();
		if (Number(mins) == 0 || Number(mins) < 10) {
			mins = '0' + mins.toString();
		}

		return hours < 10 ? '0' + hours.toString() + mins.toString() + ' h' : hours.toString() + mins.toString() + ' h'
		//return value.replace(':', '').substring(0, 5) + 'h';
	}

	timeFormat2(value: string) {
		return moment(value, 'HH:mm a').format('h:mm a');
	}

	textFormatter(text: string) {
		try {
			return text.replace(/[\\\_$]+/g, ' ')
		}
		catch {
			return text
		}
	}
	textFormatterClientAccounts(text: string) {
		try {
			return text == 'travel_planner' ? 'Travel Advisor' : text.replace(/[\\\_$]+/g, ' ')
		}
		catch {
			return text
		}
	}

	mToMi(distance: number): string {
		return (distance / 1609).toFixed(2)
	}

	mToKm(distance: number): string {
		return (distance / 1000).toFixed(2)
	}

	numberOnly(event: any): boolean {
		const charCode = (event.which) ? event.which : event.keyCode;
		// Allow: backspace, delete, tab, escape, enter, + symbol (43)
		if (charCode === 43) {
			return true;
		}
		if (charCode > 31 && (charCode < 48 || charCode > 57)) {
			return false;
		}
		return true;
	}

	validatePhoneGeneric(control: any, telInputObject: any) {
		if (telInputObject) {
			const value = control.value;
			if (!value) {
				if (control.errors) {
					const { invalidIntl, ...otherErrors } = control.errors;
					control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
				}
				return;
			}
			const isValid = telInputObject.isValidNumber();
			if (!isValid) {
				const errorCode = telInputObject.getValidationError();
				const errorMsg = ["Invalid phone number", "Invalid country code", "Invalid phone number", "Invalid phone number", "Invalid phone number"][errorCode] || "Invalid phone number";
				const currentErrors = control.errors || {};
				control.setErrors({ ...currentErrors, 'invalidIntl': errorMsg });
			} else {
				if (control.errors) {
					const { invalidIntl, ...otherErrors } = control.errors;
					control.setErrors(Object.keys(otherErrors).length > 0 ? otherErrors : null);
				}
			}
		}
	}

	validateLooseCustomerPhone() {
		this.validatePhoneGeneric(this.BookingForm.get('loose_customer').get('phone'), this.LCTelObject);
	}

	validatePassengerCell() {
		this.validatePhoneGeneric(this.BookingForm.get('passenger_cell'), this.PaxTelObject);
	}

	validateDriverCell() {
		this.validatePhoneGeneric(this.BookingForm.get('driver_cell'), this.DrvTelObject);
	}

	/**
	* Returns true/false depending on the existence of search_string in text.
	* @param text [Required] text where to search ?
	* @param search_string [Required] text what to search ?
	* @param start [Optional] search starting point. Default 0
	* @returns boolean
	*/
	searchSubstring(text: string, search_string: string, start: number = 0): boolean {
		return text.indexOf(search_string, start) != -1
	}


	/**
	* Booking Form
	*/
	buildBookingForm() {
		this.BookingForm = this.$form.group({
			service_type: ['one_way', Validators.required],
			transfer_type: ['city_to_city', Validators.required],
			return_transfer_type: ['city_to_city', Validators.required],
			number_of_hours: ['0'],
			acc_id: [''],
			account_type: ['individual'],
			loose_customer: this.$form.group({
				first_name: [''],
				middle_name: [''],
				last_name: [''],
				phone: [''],
				phone_isd: ['+1'],
				phone_country: ['us'],
				email: [''],
				address: [''],
				card_details: this.$form.group({
					name: [''],
					card_number: [''],
					exp_month: [''],
					exp_year: [''],
					cvv: ['']
				})
			}),
			passenger_name: ['', this.customValidator.whitespace()],
			passenger_email: ['', Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)],
			passenger_cell: ['', [Validators.pattern("^[0-9+]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			passenger_cell_isd: ['+1'],
			passenger_cell_country: ['us'],
			total_passengers: [1],
			luggage_count: [0],
			booking_instructions: [''],
			return_booking_instructions: [''],
			affiliate_type: ['affiliate'],
			affiliate_id: [''],
			lose_affiliate_name: ['', this.customValidator.whitespace()],
			lose_affiliate_phone: ['', [Validators.pattern("^[0-9+]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			lose_affiliate_phone_isd: ['+1'],
			lose_affiliate_phone_country: ['us'],
			lose_affiliate_email: ['', Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)],
			vehicle_type: ['', [Validators.required]],
			vehicle_type_name: [''],
			vehicle_id: [''],
			vehicle_make: [''],
			vehicle_make_name: [''],
			vehicle_model: [''],
			vehicle_model_name: [''],
			vehicle_year: [''],
			vehicle_year_name: [''],
			vehicle_color: [''],
			vehicle_color_name: [''],
			vehicle_license_plate: ['', this.customValidator.whitespace()],
			vehicle_seats: ['4', Validators.pattern("^[0-9+]*$")],
			driver_id: [''],
			driver_name: ['', this.customValidator.whitespace()],
			driver_gender: [''],
			driver_cell: ['', [Validators.pattern("^[0-9+]*$"), Validators.minLength(4), Validators.maxLength(15)]],
			driver_cell_isd: ['+1'],
			driver_cell_country: ['us'],
			driver_email: ['', Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)],
			driver_phone_type: [''],
			driver_image_id: [''],
			vehicle_image_id: [''],
			meet_greet_choices: [2],
			meet_greet_choices_name: ['Driver -  Airport - Text/call after plane lands with curbside meet location'],
			number_of_vehicles: [''],
			pickup_date: [''],
			pickup_time: ['12:00 am'],
			extra_stops: this.$form.array([]),
			pickup: [''],
			pickup_latitude: [''],
			pickup_longitude: [''],
			pickup_airport_option: [''],
			pickup_airport: [''],
			pickup_airport_name: [''],
			pickup_airport_latitude: [''],
			pickup_airport_longitude: [''],
			pickup_airline_option: [''],
			pickup_airline: [''],
			pickup_airline_name: [''],
			pickup_flight: [''],
			origin_airport_city: [''],
			cruise_port: [''],
			cruise_name: [''],
			cruise_time: ['12:00 am'],
			dropoff: [''],
			dropoff_latitude: [''],
			dropoff_longitude: [''],
			dropoff_airport_option: [''],
			dropoff_airport: [''],
			dropoff_airport_name: [''],
			dropoff_airport_latitude: [''],
			dropoff_airport_longitude: [''],
			dropoff_airline_option: [''],
			dropoff_airline: [''],
			dropoff_airline_name: [''],
			dropoff_flight: [''],
			return_meet_greet_choices: [2],
			return_meet_greet_choices_name: ['Driver -  Airport - Text/call after plane lands with curbside meet location'],
			return_pickup_date: [''],
			return_pickup_time: ['12:00 am'],
			return_extra_stops: this.$form.array([]),
			return_pickup: [''],
			return_pickup_latitude: [''],
			return_pickup_longitude: [''],
			return_pickup_airport_option: [''],
			return_pickup_airport: [''],
			return_pickup_airport_name: [''],
			return_pickup_airport_latitude: [''],
			return_pickup_airport_longitude: [''],
			return_pickup_airline_option: [''],
			return_pickup_airline: [''],
			return_pickup_airline_name: [''],
			return_pickup_flight: [''],
			return_cruise_port: [''],
			return_cruise_name: [''],
			return_cruise_time: ['12:00 pm'],
			return_dropoff: [''],
			return_dropoff_latitude: [''],
			return_dropoff_longitude: [''],
			return_dropoff_airport_option: [''],
			return_dropoff_airport: [''],
			return_dropoff_airport_name: [''],
			return_dropoff_airport_latitude: [''],
			return_dropoff_airport_longitude: [''],
			return_dropoff_airline_option: [''],
			return_dropoff_airline: [''],
			return_dropoff_airline_name: [''],
			return_dropoff_flight: [''],
			driver_languages: this.$form.array([]),
			driver_dresses: this.$form.array([]),
			amenities: this.$form.array([]),
			chargedAmenities: this.$form.array([]),
			journeyDistance: [''],
			journeyTime: [''],
			returnJourneyDistance: [''],
			returnJourneyTime: [''],
			reservation_id: [''],
			updateType: [''],
			departing_airport_city: [''],
			fbo_address: [''],
			return_fbo_address: [''],
			fbo_name: [''],
			return_fbo_name: ['']
		})

		let date = new Date();
		let timestamp = date.getTime();

		this.SetFormValue('pickup_date', moment(timestamp).format("YYYY-MM-DD"))
		this.SetFormValue('return_pickup_date', moment(timestamp).format("YYYY-MM-DD"))
		this.SetFormValue('number_of_vehicles', 1)
		this.updateNumberOfHoursValidators(this.BookingForm.get('service_type')?.value);
		this.SetFormValue('booking_instructions', "1. Driver - Text on location. Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route");
		this.SetFormValue('return_booking_instructions', "1. Driver - Text on location. Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route");


		if (this.BookingForm.value.transfer_type.includes('city_')) {
			this.SetFormValue('meet_greet_choices', 1)
		} else {
			this.SetFormValue('meet_greet_choices', 2)
		}

		if (this.BookingForm.value.transfer_type.includes('_city')) {
			this.SetFormValue('return_meet_greet_choices', 1)
		} else {
			this.SetFormValue('return_meet_greet_choices', 2)
		}
	}
	changeTransferType(type: string) {
		this.initAllAutocompletes()
		if (type.includes('city_')) {
			this.SetFormValue('meet_greet_choices', 1)
		} else {
			this.SetFormValue('meet_greet_choices', 2)
		}

		if (type.includes('_city')) {
			this.SetFormValue('return_meet_greet_choices', 1)
		} else {
			this.SetFormValue('return_meet_greet_choices', 2)
		}
	}

	private updateReturnLegValidators(value: string) {
		if (this.BookingForm?.get('service_type')?.value == 'round_trip') {
			if (!value.startsWith('airport_')) {
				this.BookingForm?.get('return_pickup')?.setValidators([Validators.required]);
			} else {
				this.BookingForm?.get('return_pickup')?.clearValidators();
			}
			this.BookingForm?.get('return_pickup')?.updateValueAndValidity();

			if (!value.endsWith('_airport')) {
				this.BookingForm?.get('return_dropoff')?.setValidators([Validators.required]);
			} else {
				this.BookingForm?.get('return_dropoff')?.clearValidators();
			}
			this.BookingForm?.get('return_dropoff')?.updateValueAndValidity();

			if (value.includes("city_")) {
				this.SetFormValue('return_booking_instructions', "1. Driver - Text on location. Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route");
			}

			if (value.includes('_cruise') || value.includes('cruise_')) {
				if (value.includes("cruise_")) {
					this.SetFormValue('return_booking_instructions', "1. Pax - Text driver when docked.  2. Driver - Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route. Text pax with pickup instructions when ship has arrived.");
				}
				this.BookingForm.get('return_cruise_name').setValidators([Validators.required]);
				this.BookingForm.get('return_cruise_port').setValidators([Validators.required]);
				this.BookingForm.get('return_cruise_name').updateValueAndValidity();
				this.BookingForm.get('return_cruise_port').updateValueAndValidity();
			} else {
				this.BookingForm.get('return_cruise_name').clearValidators();
				this.BookingForm.get('return_cruise_port').clearValidators();
				this.BookingForm.get('return_cruise_name').updateValueAndValidity();
				this.BookingForm.get('return_cruise_port').updateValueAndValidity();
			}

			if (value.includes('_airport')) {
				this.BookingForm.get('return_dropoff_airline_option').setValidators([Validators.required]);
				this.BookingForm.get('return_dropoff_airline_option').updateValueAndValidity();
				this.BookingForm.get('return_dropoff_airport_option').setValidators([Validators.required]);
				this.BookingForm.get('return_dropoff_airport_option').updateValueAndValidity();
			} else {
				this.BookingForm.get('return_dropoff_airline_option').clearValidators();
				this.BookingForm.get('return_dropoff_airline_option').updateValueAndValidity();
				this.BookingForm.get('return_dropoff_airport_option').clearValidators();
				this.BookingForm.get('return_dropoff_airport_option').updateValueAndValidity();
			}

			if (value.includes('airport_')) {
				this.SetFormValue('return_booking_instructions', "1. Pax - Text driver when landing.  2. Driver - Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route. Text pax with pickup instructions when plane has arrived.");
				this.BookingForm.get('return_pickup_flight').setValidators([Validators.required]);
				this.BookingForm.get('return_pickup_flight').updateValueAndValidity();
				this.BookingForm.get('return_pickup_airline_option').setValidators([Validators.required]);
				this.BookingForm.get('return_pickup_airline_option').updateValueAndValidity();
				this.BookingForm.get('return_pickup_airport_option').setValidators([Validators.required]);
				this.BookingForm.get('return_pickup_airport_option').updateValueAndValidity();
				this.BookingForm.get('departing_airport_city').setValidators([Validators.required]);
				this.BookingForm.get('departing_airport_city').updateValueAndValidity();
			} else {
				this.BookingForm.get('return_pickup_flight').clearValidators();
				this.BookingForm.get('return_pickup_flight').updateValueAndValidity();
				this.BookingForm.get('return_pickup_airline_option').clearValidators();
				this.BookingForm.get('return_pickup_airline_option').updateValueAndValidity();
				this.BookingForm.get('return_pickup_airport_option').clearValidators();
				this.BookingForm.get('return_pickup_airport_option').updateValueAndValidity();
				this.BookingForm.get('departing_airport_city').clearValidators();
				this.BookingForm.get('departing_airport_city').updateValueAndValidity();
			}
		} else {
			this.clearReturnOnlyValidators();
		}
	}

	private updateNumberOfHoursValidators(serviceType: string): void {
		const hoursControl = this.BookingForm?.get('number_of_hours');
		if (!hoursControl) {
			return;
		}

		if (serviceType == 'charter_tour' || serviceType == 'chartertour') {
			hoursControl.setValidators([Validators.min(2)]);
		} else {
			hoursControl.clearValidators();
		}

		hoursControl.updateValueAndValidity({ emitEvent: false });
	}

	private clearReturnOnlyValidators(): void {
		[
			'return_pickup',
			'return_dropoff',
			'return_cruise_name',
			'return_cruise_port',
			'return_dropoff_airport_option',
			'return_dropoff_airline_option',
			'return_pickup_flight',
			'return_pickup_airline_option',
			'return_pickup_airport_option',
			'departing_airport_city'
		].forEach((controlName) => {
			this.BookingForm?.get(controlName)?.clearValidators();
			this.BookingForm?.get(controlName)?.updateValueAndValidity();
		});
	}
	handleChangeMeetAndGreet(event: any, type: string) {
		console.log('in function meet and greet-->>>', event.source.triggerValue, type)
		if (type == 'return') {
			this.BookingForm.patchValue({
				return_meet_greet_choices_name: event.source.triggerValue
			})
		}
		else {
			this.BookingForm.patchValue({
				meet_greet_choices_name: event.source.triggerValue
			})
		}
	}

	handleChangeMonth(value: any) {
		console.log('value', value)
		if (value) {
			this.monthOptions = this.months.filter(i => i.value.includes(value))
		}
	}
	handleClientAccChange(selectedAcc) {
		this.isTravelShare = selectedAcc == 'travel_planner' ? true : false
		this.BookingForm.get('acc_id').setValue(null);
		this.chosen_user = null
		this.BookingForm.patchValue({
			passenger_name: '',
			passenger_email: '',
			passenger_cell: '',
			passenger_cell_isd: '+1',
			passenger_cell_country: 'us',
		})
	}

	// for showing details when client account is chosen
	getUserValue(key: string): string {
		const lowerKey = key.toLowerCase();

		// Create a mapping of normalized keys to possible variations
		const variations = {
			name: ['name', 'Name'],
			mobile: ['mobile', 'Mobile'],
			email: ['email', 'Email'],
			country: ['country', 'Country'],
			zip: ['zip', 'zipCode', 'Zip', 'ZipCode'],
			address: ['address', 'Address']
		};

		const possibleKeys = variations[lowerKey] || [key];

		for (const k of possibleKeys) {
			if (this.chosen_user && this.chosen_user[k] !== undefined) {
				return this.chosen_user[k];
			}
		}

		return ''; // default fallback if nothing found
	}

	prefillViaBookingID(booking_id: number) {
		console.log('Prefilling via Booking Id', booking_id)
		this.$spinner.show('normalspinner');
		this.affiliateService.getBookingDataForEdit(booking_id).subscribe((response: any) => {
			this.bookingResponse = response.data
			this.SetFormValue('account_type', response?.data?.account_type)
			response.data.booking_instructions = response?.data?.booking_instructions?.replaceAll('<br />', '')
			let currency = response?.data?.currency
			this.httpClient.get("assets/json/currencyOptions.json").subscribe(data => {
				for (const key of Object.keys(data)) {
					if (data[key].currency === currency.toUpperCase()) {
						this.currencyObj = data[key]
						this.currencySymbol = data[key].symbol
					}
				}
			})
			console.log("this.currencyObj?.currency", this.currencyObj)
			this.firstLoadVehicleId = response.data.vehicle_id
			this.firstLoadAffiliateId = response.data.affiliate_id
			this.fetchAffiliateVehicles(this.firstLoadAffiliateId)
			this.isTravelShare = response?.data?.account_type == 'travel_planner' ? true : false
			this.isCreatedByAdmin = response?.data?.created_by == 1 ? true : false
			this.isFarmoutBooking = response?.data?.reservation_type == 'farmout' ? true : false
			let editing_data = response?.data
			this.number_of_hours = response?.data?.number_of_hours
			this.autofillData('cruise', editing_data);
			console.log(editing_data, "check big data")
			for (let item in editing_data) {
				if (item.includes('extra_stops') || item.includes('languages') || item.includes('dresses') || item.toLowerCase().includes('amenities')) {
					// console.log('Skipping in the case of Extra Stops. ')
				}
				if (editing_data[item]) {
					if (isNaN(Number(editing_data[item]))) {
						this.SetFormValue(item, editing_data[item]);
					} else {
						this.SetFormValue(item, Number(editing_data[item]));
					}
				}
			}
			this.SetFormValue('pickup_time', this.FormatTime(response?.data?.pickup_time))
			this.SetFormValue('cruise_time', this.FormatTime(response?.data?.cruise_time))
			this.SetFormValue('return_pickup_time', this.FormatTime(response?.data?.return_pickup_time))
			this.SetFormValue('pickup_airport_option', this.getEditAirportDisplayValue(this.Form?.pickup_airport?.value, editing_data.pickup_address));
			this.SetFormValue('pickup_airport_name', this.getEditAirportDisplayValue(this.Form?.pickup_airport?.value, editing_data.pickup_address));
			this.SetFormValue('pickup_airline_option', this.BigData?.airlinesData?.find((item: any) => item?.id == this.Form?.pickup_airline?.value));
			this.SetFormValue('dropoff_airport_option', this.getEditAirportDisplayValue(this.Form?.dropoff_airport?.value, editing_data.dropoff_address));
			this.SetFormValue('dropoff_airport_name', this.getEditAirportDisplayValue(this.Form?.dropoff_airport?.value, editing_data.dropoff_address));
			this.SetFormValue('dropoff_airline_option', this.BigData?.airlinesData?.find((item: any) => item?.id == this.Form?.dropoff_airline?.value));
			this.SetFormValue('return_pickup_airport_option', this.getEditAirportDisplayValue(this.Form?.return_pickup_airport?.value, editing_data.return_pickup_address));
			this.SetFormValue('return_pickup_airport_name', this.getEditAirportDisplayValue(this.Form?.return_pickup_airport?.value, editing_data.return_pickup_address));
			this.SetFormValue('return_pickup_airline_option', this.BigData?.airlinesData?.find((item: any) => item?.id == this.Form?.return_pickup_airline?.value));
			this.SetFormValue('return_dropoff_airport_option', this.getEditAirportDisplayValue(this.Form?.return_dropoff_airport?.value, editing_data.return_dropoff_address));
			this.SetFormValue('return_dropoff_airport_name', this.getEditAirportDisplayValue(this.Form?.return_dropoff_airport?.value, editing_data.return_dropoff_address));
			this.SetFormValue('return_dropoff_airline_option', this.BigData?.airlinesData?.find((item: any) => item?.id == this?.Form?.return_dropoff_airline?.value));
			this.SetFormValue('origin_airport_city', editing_data?.origin_airport_city ? editing_data?.origin_airport_city : editing_data?.departing_airport_city)

			if (this.BookingForm?.get('updateType')?.value == 'edit') {
				// this.scroll('travel_date')
				// this.SetFormValue('pickup_date', moment().format('YYYY-MM-DD'))
				this.SetFormValue('pickup_date', editing_data?.pickup_date)
				this.SetFormValue('return_pickup_date', editing_data?.pickup_date)

			}

			if (editing_data?.driver_image) {
				this.SetFormValue('driver_image_id', editing_data?.driver_image?.id);
				this.driver_image['image'] = editing_data?.driver_image?.image;
			}
			if (editing_data?.vehicle_image) {
				this.SetFormValue('vehicle_image_id', editing_data?.vehicle_image?.id);
				this.vehicle_image['image'] = editing_data?.vehicle_image?.image;
			}

			['driver_languages', 'driver_dresses', 'amenities', 'chargedAmenities'].forEach((item: string) => {
				if (editing_data[item] && editing_data[item]?.length > 0) {
					editing_data[item].forEach((id: number) => {
						this.select(true, item, id)
					})
				}
			})

			if (editing_data?.extra_stops && editing_data?.extra_stops?.length > 0) {
				editing_data?.extra_stops?.forEach((item: any, index: number) => {
					if (item.hasOwnProperty('address')) {
						item['formatted_address'] = item?.address;
						this.addExtraStop();
						this.fillExtraStop(false, index, item, item);
						console.log(this.BookingForm);
					}
				})
			}
			else {
				console.error('No Extra Stops found.')
			}
			this.BookingForm.updateValueAndValidity()

			// override specific value
			this.BookingForm.patchValue({
				service_type: response.data.service_type == 'oneway' ? 'one_way' : response.data['service_type'] == 'roundtrip' ? 'round_trip' : 'charter_tour',
			})

			this.service_type = response.data.service_type == 'oneway' ? 'one_way' : response.data['service_type'] == 'roundtrip' ? 'round_trip' : 'charter_tour'

			// if (this.Form?.updateType?.value == 'edit') {
			// 	this.booking_params?.client_account_types?.pop()
			// }
			this.booking_id = this.Form?.reservation_id?.value;
			// this.Form.affiliate_id.value != 0 ? this.chooseAffiliate() : ''\
			// Update Passenger Cell Flag
			// Update Passenger Cell Flag (Wrapped in local variables for closure safety)
			const pCountry = editing_data.passenger_cell_country;
			const pISD = editing_data.passenger_cell_isd;
			const pCell = editing_data.passenger_cell;

			const dCountry = editing_data.driver_cell_country || editing_data.driver?.CellNumberCountry || editing_data.driver?.cell_number_country;
			const dISD = editing_data.driver_cell_isd || editing_data.driver?.cell_isd || editing_data.driver?.CellIsd;
			const dCell = editing_data.driver_cell || editing_data.driver?.cell_number || editing_data.driver?.CellNumber;

			setTimeout(() => {
				if (this.PaxTelObject) {
					// 1. Set Number first (might default flag to US for +1)
					if (pISD && pCell) {
						let isd = String(pISD).startsWith('+') ? pISD : '+' + pISD;
						this.PaxTelObject.setNumber(isd + pCell);
						this.SetFormValue('passenger_cell_isd', isd);
					}
					this.SetFormValue('passenger_cell', pCell);

					// 2. FORCE backend country preference LAST to override any setNumber inference
					if (pCountry) {
						this.PaxTelObject.setCountry(String(pCountry).toLowerCase());
						this.SetFormValue('passenger_cell_country', String(pCountry).toLowerCase());
					}
				}

				// Update Driver Cell Flag
				if (this.DrvTelObject) {
					// 1. Set Number first
					if (dISD && dCell) {
						let isd = String(dISD).startsWith('+') ? dISD : '+' + dISD;
						this.DrvTelObject.setNumber(isd + dCell);
						this.SetFormValue('driver_cell_isd', isd);
					}
					this.SetFormValue('driver_cell', dCell);

					// 2. FORCE backend country preference LAST
					if (dCountry) {
						this.DrvTelObject.setCountry(String(dCountry).toLowerCase());
						this.SetFormValue('driver_cell_country', String(dCountry).toLowerCase());
					}
				}
			}, 1000);

			this.fetchAffiliateDrivers(this.BookingForm.get('affiliate_id').value)
			this.initphonefield()
			this.$spinner.hide('normalspinner')
			this.scroll('booking_detail')
			this.handleNoOfHours(this.number_of_hours)
		})

	}

	SetFormValue(form_control: string, value: any, emit: boolean = true) {
		if ((value === undefined || value === null) || !form_control) {
			console.info(`No Value to set for ${form_control}. Returning ...`)
			return
		}
		console.log('Setting Form Value for ', form_control, ' : ', value);
		try {

			this.BookingForm.get(form_control).setValue(value, { emitEvent: emit })
			this.BookingForm.updateValueAndValidity()
		}
		catch (err) {
			console.error('NFC Error: ')
			return
		}
	}

	private setControlValue(form_control: string, value: any, emit: boolean = false) {
		const control = this.BookingForm?.get(form_control);
		if (!control) {
			return;
		}
		control.setValue(value, { emitEvent: emit });
		control.updateValueAndValidity({ emitEvent: emit });
	}

	private patchControls(values: Record<string, any>) {
		if (!this.BookingForm) {
			return;
		}
		Object.entries(values).forEach(([controlName, value]) => {
			const control = this.BookingForm.get(controlName);
			if (control) {
				control.setValue(value, { emitEvent: false });
				control.updateValueAndValidity({ emitEvent: false });
			}
		});
		this.BookingForm.updateValueAndValidity({ emitEvent: false });
	}

	private clearAirportSelection(formControl: string) {
		if (this.isClearingSelection) {
			return;
		}
		this.isClearingSelection = true;
		try {
			const valuesToClear: Record<string, any> = {};
			const clearAirportFields = (controlName: string) => {
				const fieldPrefix = controlName.replace(/_airport$/, '');
				valuesToClear[`${fieldPrefix}_airport_option`] = '';
				valuesToClear[controlName] = '';
				valuesToClear[`${fieldPrefix}_airport_name`] = '';
				valuesToClear[`${fieldPrefix}_airport_latitude`] = '';
				valuesToClear[`${fieldPrefix}_airport_longitude`] = '';
				this.addAirlineClearValues(valuesToClear, `${fieldPrefix}_airline`);
			};

			clearAirportFields(formControl);

			if (formControl === 'pickup_airport') {
				clearAirportFields('return_dropoff_airport');
			}
			if (formControl === 'dropoff_airport') {
				clearAirportFields('return_pickup_airport');
			}

			this.patchControls(valuesToClear);
		} finally {
			this.isClearingSelection = false;
		}
	}

	private clearAirlineSelection(formControl: string) {
		if (this.isClearingSelection) {
			return;
		}
		this.isClearingSelection = true;
		try {
			const valuesToClear: Record<string, any> = {};
			this.addAirlineClearValues(valuesToClear, formControl);
			this.patchControls(valuesToClear);
		} finally {
			this.isClearingSelection = false;
		}
	}

	private addAirlineClearValues(valuesToClear: Record<string, any>, formControl: string) {
		const fieldPrefix = formControl.replace(/_airline$/, '');
		valuesToClear[`${fieldPrefix}_airline_option`] = null;
		valuesToClear[formControl] = '';
		valuesToClear[`${fieldPrefix}_airline_name`] = '';

		if (formControl === 'pickup_airline') {
			valuesToClear['return_dropoff_airline_option'] = null;
			valuesToClear['return_dropoff_airline'] = '';
			valuesToClear['return_dropoff_airline_name'] = '';
		}
		if (formControl === 'dropoff_airline') {
			valuesToClear['return_pickup_airline_option'] = null;
			valuesToClear['return_pickup_airline'] = '';
			valuesToClear['return_pickup_airline_name'] = '';
		}
	}

	SetLCFormValue(form_control: string, value: any) {
		if (!value || !form_control) {
			console.info(`No Value to set for ${form_control}. Returning ...`)
			return
		}
		console.log('Setting Form Value for ', form_control, ' : ', value);
		try {

			(this.BookingForm.get('loose_customer')).get(form_control).setValue(value)
			this.BookingForm.updateValueAndValidity()
		}
		catch (err) {
			console.error('NFC Error: ')
			return
		}
	}


	async MapController(is_return: boolean = false) {
		// console.log('Map has been initialised.')'
		try {
			let waypoints = []
			let origin: google.maps.LatLng
			let destination: google.maps.LatLng
			let map: google.maps.Map

			await this.mapsApiReady();

			if (is_return) {
				// console.log('Return Map has been initialised. ')
				// map
				map = new google.maps.Map(document.getElementById('return_map'), {
					zoom: 7,
					center: new google.maps.LatLng(41.850033, -87.6500523),
					scaleControl: true
				})

				// waypoints
				if (this.ReturnExtraStops.length > 0) {
					for (let i = 0; i < this.ReturnExtraStops.length; i++) {
						let stop = (<FormGroup>(<FormArray>this.BookingForm.get('return_extra_stops')).at(i))
						waypoints.push({
							location: new google.maps.LatLng(stop.get('latitude').value, stop.get('longitude').value),
							stopover: true
						})
					}
				}

				// defaults for Source/Target - City
				origin = new google.maps.LatLng(this.Form.return_pickup_latitude.value, this.Form.return_pickup_longitude.value)
				destination = new google.maps.LatLng(this.Form.return_dropoff_latitude.value, this.Form.return_dropoff_longitude.value)

				// Overrides
				if (this.Form.return_transfer_type.value.includes('airport_')) {
					// override for Source - Airport
					// console.log('Return Override for Source Airport')
					origin = new google.maps.LatLng(this.Form.return_pickup_airport_latitude.value, this.Form.return_pickup_airport_longitude.value)
				}
				if (this.Form.return_transfer_type.value.includes('_airport')) {
					// override for Target - Airport
					// console.log('Return Override for Target Airport')
					destination = new google.maps.LatLng(this.Form.return_dropoff_airport_latitude.value, this.Form.return_dropoff_airport_longitude.value)
				}
			}
			else {
				map = new google.maps.Map(document.getElementById("map"), {
					zoom: 7,
					center: new google.maps.LatLng(41.850033, -87.6500523),
					scaleControl: true
				})

				// waypoints
				if (this.ExtraStops.length > 0) {
					for (let i = 0; i < this.ExtraStops.length; i++) {
						let stop = (<FormGroup>(<FormArray>this.BookingForm.get('extra_stops')).at(i))
						waypoints.push({
							location: new google.maps.LatLng(stop.get('latitude').value, stop.get('longitude').value),
							stopover: true
						})
					}
				}

				//defaults for Source/Target - City
				origin = new google.maps.LatLng(this.Form.pickup_latitude.value, this.Form.pickup_longitude.value)
				destination = new google.maps.LatLng(this.Form.dropoff_latitude.value, this.Form.dropoff_longitude.value)

				// Overrides
				if (this.Form.transfer_type.value.includes('airport_')) {
					// override for Source - Airport
					// console.log('Override for Source Airport')
					origin = new google.maps.LatLng(this.Form.pickup_airport_latitude.value, this.Form.pickup_airport_longitude.value)
				}
				if (this.Form.transfer_type.value.includes('_airport')) {
					// override for Target - Airport
					// console.log('Override for Target Airport')
					destination = new google.maps.LatLng(this.Form.dropoff_airport_latitude.value, this.Form.dropoff_airport_longitude.value)
				}

			}
			const request: google.maps.DirectionsRequest = {
				origin,
				destination,
				waypoints,
				optimizeWaypoints: true,
				travelMode: google.maps.TravelMode.DRIVING
			};

			this.drawMap(map, request, is_return);

		} catch (error) {
			console.error('Error initializing MapController:', error);
		}

	}

	mapsApiReady(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (window['google'] && window['google'].maps) {
				resolve();
			} else {
				const check = setInterval(() => {
					if (window['google'] && window['google'].maps) {
						clearInterval(check);
						resolve();
					}
				}, 100);
				setTimeout(() => {
					clearInterval(check);
					reject('Google Maps API not available');
				}, 5000); // Timeout after 5s
			}
		});
	}


	drawMap(map: google.maps.Map, request: google.maps.DirectionsRequest, is_return: boolean) {
		if (request && !request.hasOwnProperty('waypoints') && !request.hasOwnProperty('origin') && !request.hasOwnProperty('destination')) {
			console.error('Request Object is not properly according to specified requirements.')
			return
		}


		const directionsRenderer = new google.maps.DirectionsRenderer()
		const directionsService = new google.maps.DirectionsService()
		directionsRenderer.setMap(map)

		directionsService.route(request, (response: any, status: string) => {
			if (status == google.maps.DirectionsStatus.OK) {
				// console.log('Directions Service Response: ', response)
				directionsRenderer.setDirections(response)

				this.fetchDistanceAndTime(response).then((response: { distance: number, time: number }) => {
					if (is_return) {
						this.return_distance = response.distance
						if (!this.BookingForm.get('return_extra_stops')?.value?.length || this.BookingForm.get('return_extra_stops')?.value[0]['rate']?.length) {
							this.buildBookingData()
						}
						this.BookingForm.patchValue({
							returnJourneyDistance: response.distance,
							returnJourneyTime: response.time
						})
					} else {
						this.distance = response.distance
						if (!this.BookingForm.get('extra_stops')?.value?.length || this.BookingForm.get('extra_stops')?.value[0]['rate']?.length) {
							this.buildBookingData()
						}
						this.BookingForm.patchValue({
							journeyDistance: response.distance,
							journeyTime: response.time
						})
					}
					// this.distance_for_rates = ((): string =>
					// {
					// 	return (this.mToKm(this.distance))
					// })()
				})
			}
		})


	}

	get Form() {
		return this.BookingForm.controls;
	}

	get LooseCustomer() {
		return (<FormGroup>this.BookingForm.get('loose_customer')).controls;
	}

	get ExtraStops(): FormArray {
		return (<FormArray>this.BookingForm.get('extra_stops'));
	}

	get ReturnExtraStops() {
		return (<FormArray>this.BookingForm.get('return_extra_stops'));
	}


	fillAddress(form_control: string, address: any) {
		// console.log('Address: ', address)
		this.SetFormValue(form_control, address?.display_address ?? address?.formatted_address ?? '')
	}

	fillLocationPoints(form_control: string, location: any) {
		// console.log('Location Points', location)
		this.SetFormValue(form_control + '_latitude', location.latitude)
		this.SetFormValue(form_control + '_longitude', location.longitude)
		this.MapController()
		if (this.Form.service_type.value == 'round_trip') {
			this.MapController(true)
		}
	}

	getAirportDisplayValue(airport: any): string {
		if (!airport) {
			return '';
		}
		return airport?.formatted_name
			|| airport?.display_address
			|| airport?.formattedAddress
			|| airport?.formatted_address
			|| airport?.name
			|| airport?.displayName
			|| (typeof airport === 'string' ? airport : '');
	}

	getAirportSelectionLabel(airport: any): string {
		if (!airport) {
			return '';
		}

		const displayName = typeof airport?.displayName === 'string'
			? airport.displayName
			: airport?.displayName?.text;
		const primaryName = airport?.name || displayName || '';
		const displayValue = this.getAirportDisplayValue(airport);

		if (primaryName && displayValue) {
			if (displayValue === primaryName || displayValue.startsWith(`${primaryName} - `)) {
				return displayValue;
			}
			return `${primaryName} - ${displayValue}`;
		}

		return primaryName || displayValue;
	}

	getPreviewAirportDisplay(name: any, option: any): string {
		return this.getAirportDisplayValue(name) || this.getAirportDisplayValue(option) || '';
	}

	private getEditAirportDisplayValue(
		airportId: any,
		savedAirportLine: any
	): string {
		const savedDisplay = String(savedAirportLine || '').trim();
		if (savedDisplay) {
			return savedDisplay;
		}

		return this.getAirportDisplayValue(
			this.BigData?.airportsData?.find((item: any) => item?.id == airportId)
		);
	}

	syncAirportPayloadFields() {
		const airportFields = [
			'pickup_airport',
			'dropoff_airport',
			'return_pickup_airport',
			'return_dropoff_airport',
		];

		for (const field of airportFields) {
			const selectedAirportId = this.BookingForm.get(field)?.value;
			const optionControl = this.BookingForm.get(`${field}_option`);
			const nameControl = this.BookingForm.get(`${field}_name`);
			const latControl = this.BookingForm.get(`${field}_latitude`);
			const lngControl = this.BookingForm.get(`${field}_longitude`);
			const matchedAirport = this.resolveInternalAirportRecord({
				name: nameControl?.value || optionControl?.value,
				formatted_address: optionControl?.value || nameControl?.value
			}, latControl?.value, lngControl?.value);
			const airportSelected = matchedAirport || this.BigData?.airportsData?.find((item: any) => item.id == selectedAirportId);
			const airportDisplay = this.getPreviewAirportDisplay(nameControl?.value, optionControl?.value)
				|| this.getAirportDisplayValue(airportSelected);

			if (airportDisplay && nameControl && !nameControl.value) {
				nameControl.setValue(airportDisplay, { emitEvent: false });
			}

			if (airportDisplay && optionControl && !optionControl.value) {
				optionControl.setValue(airportDisplay, { emitEvent: false });
			}

			if (airportSelected) {
				if (this.BookingForm.get(field)?.value != airportSelected.id) {
					this.BookingForm.get(field)?.setValue(airportSelected.id, { emitEvent: false });
				}
				if (latControl && (latControl.value === '' || latControl.value === null || latControl.value === undefined)) {
					latControl.setValue(airportSelected.lat, { emitEvent: false });
				}
				if (lngControl && (lngControl.value === '' || lngControl.value === null || lngControl.value === undefined)) {
					lngControl.setValue(airportSelected.long, { emitEvent: false });
				}
				continue;
			}

			const currentControlValue = this.BookingForm.get(field)?.value;
			if ((currentControlValue === '' || currentControlValue === null || currentControlValue === undefined) && airportDisplay) {
				this.BookingForm.get(field)?.setValue(airportDisplay, { emitEvent: false });
			}
		}

		this.BookingForm.updateValueAndValidity({ emitEvent: false });
	}

	normalizeAirportMatchText(value: any): string {
		return String(value || '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, ' ')
			.trim();
	}

	getNumericAirportCoordinate(value: any): number | null {
		const parsed = Number(value);
		return Number.isFinite(parsed) ? parsed : null;
	}

	getAirportCoordinates(airport: any): { lat: number, lng: number } | null {
		const lat = this.getNumericAirportCoordinate(airport?.lat ?? airport?.latitude);
		const lng = this.getNumericAirportCoordinate(airport?.long ?? airport?.lng ?? airport?.longitude);
		return lat !== null && lng !== null ? { lat, lng } : null;
	}

	getAirportDistanceInKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
		const toRadians = (value: number) => value * Math.PI / 180;
		const earthRadiusKm = 6371;
		const deltaLat = toRadians(lat2 - lat1);
		const deltaLng = toRadians(lng2 - lng1);
		const a =
			Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
			Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
			Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2);
		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
		return earthRadiusKm * c;
	}

	resolveInternalAirportRecord(placeLike: any, latitude?: number | null, longitude?: number | null): any {
		const airports = this.BigData?.airportsData || [];
		if (!airports.length) {
			return null;
		}

		const normalizedLat = this.getNumericAirportCoordinate(latitude);
		const normalizedLng = this.getNumericAirportCoordinate(longitude);

		if (normalizedLat !== null && normalizedLng !== null) {
			let nearestAirport: any = null;
			let nearestDistance = Number.POSITIVE_INFINITY;

			for (const airport of airports) {
				const coordinates = this.getAirportCoordinates(airport);
				if (!coordinates) {
					continue;
				}
				const distance = this.getAirportDistanceInKm(normalizedLat, normalizedLng, coordinates.lat, coordinates.lng);
				if (distance < nearestDistance) {
					nearestDistance = distance;
					nearestAirport = airport;
				}
			}

			if (nearestAirport) {
				return nearestAirport;
			}
		}

		const displayValue = this.getAirportDisplayValue(placeLike);
		const nameValue = placeLike?.name || placeLike?.displayName || '';
		const addressValue = placeLike?.formatted_address || placeLike?.formattedAddress || '';
		const searchBlob = this.normalizeAirportMatchText([displayValue, nameValue, addressValue].filter(Boolean).join(' '));

		if (!searchBlob) {
			return null;
		}

		const codeTokens = searchBlob.split(' ');
		let bestMatch: any = null;
		let bestScore = 0;

		for (const airport of airports) {
			const code = String(airport?.code || '').toLowerCase();
			const name = this.normalizeAirportMatchText(airport?.name);
			const formattedName = this.normalizeAirportMatchText(airport?.formatted_name);
			const city = this.normalizeAirportMatchText(airport?.city);
			const country = this.normalizeAirportMatchText(airport?.country);
			let score = 0;

			if (code && codeTokens.includes(code)) {
				score += 300;
			}
			if (name && searchBlob.includes(name)) {
				score += 220;
			}
			if (formattedName && searchBlob.includes(formattedName)) {
				score += 180;
			}
			if (city && searchBlob.includes(city)) {
				score += 40;
			}
			if (country && searchBlob.includes(country)) {
				score += 20;
			}

			if (score > bestScore) {
				bestScore = score;
				bestMatch = airport;
			}
		}

		return bestScore > 0 ? bestMatch : null;
	}

	handleAirportPlaceSelection(formControl: string, place: google.maps.places.PlaceResult) {
		const displayValue = this.getAirportSelectionLabel(place);
		const location = place.geometry?.location;
		if (!location) {
			return;
		}
		const latitude = location.lat();
		const longitude = location.lng();
		const matchedAirport = this.resolveInternalAirportRecord(place, latitude, longitude);
		const resolvedAirportValue = matchedAirport?.id ?? displayValue;

		this.BookingForm.get(`${formControl}_option`)?.setValue(displayValue);
		this.BookingForm.get(`${formControl}_name`)?.setValue(displayValue);
		this.BookingForm.get(`${formControl}_latitude`)?.setValue(latitude);
		this.BookingForm.get(`${formControl}_longitude`)?.setValue(longitude);
		this.BookingForm.get(formControl)?.setValue(resolvedAirportValue);
		this.BookingForm.updateValueAndValidity();
	}

	private syncVisibleFieldPayloads() {
		const addressInputs: Array<{ control: string; inputRef?: ElementRef<HTMLInputElement> }> = [
			{ control: 'pickup', inputRef: this.pickupInput },
			{ control: 'dropoff', inputRef: this.dropoffInput },
			{ control: 'return_pickup', inputRef: this.return_pickupInput },
			{ control: 'return_dropoff', inputRef: this.return_dropoffInput },
			{ control: 'fbo_address', inputRef: this.fboAddressInput },
			{ control: 'return_fbo_address', inputRef: this.returnFboAddressInput },
			{ control: 'loose_customer.address', inputRef: this.loosecustomerInput }
		];

		addressInputs.forEach(({ control, inputRef }) => {
			const nativeValue = String(inputRef?.nativeElement?.value || '').trim();
			const controlRef = this.BookingForm.get(control);
			const controlValue = String(controlRef?.value || '').trim();

			if (nativeValue && controlRef && !controlValue) {
				controlRef.setValue(nativeValue, { emitEvent: false });
				controlRef.updateValueAndValidity({ emitEvent: false });
			}
		});

		const airportInputs: Array<{ control: string; inputRef?: ElementRef<HTMLInputElement> }> = [
			{ control: 'pickup_airport', inputRef: this.pickupAirportInput },
			{ control: 'dropoff_airport', inputRef: this.dropoffAirportInput },
			{ control: 'return_pickup_airport', inputRef: this.returnPickupAirportInput },
			{ control: 'return_dropoff_airport', inputRef: this.returnDropoffAirportInput },
		];

		airportInputs.forEach(({ control, inputRef }) => {
			const nativeValue = String(inputRef?.nativeElement?.value || '').trim();
			const optionControl = this.BookingForm.get(`${control}_option`);
			const nameControl = this.BookingForm.get(`${control}_name`);
			const optionValue = String(optionControl?.value || '').trim();
			const nameValue = String(nameControl?.value || '').trim();

			if (nativeValue && optionControl && !optionValue) {
				optionControl.setValue(nativeValue, { emitEvent: false });
				optionControl.updateValueAndValidity({ emitEvent: false });
			}

			if (nativeValue && nameControl && !nameValue) {
				nameControl.setValue(nativeValue, { emitEvent: false });
				nameControl.updateValueAndValidity({ emitEvent: false });
			}
		});

		this.BookingForm.updateValueAndValidity({ emitEvent: false });
	}

	private applyQuoteBotAirportPrefill(
		fieldPrefix: 'pickup' | 'dropoff' | 'return_pickup' | 'return_dropoff',
		airportDisplay: any,
		airportLat: any,
		airportLng: any,
		rawAirportId: any,
		matchedAirport: any
	) {
		const resolvedDisplay = String(airportDisplay || '').trim();
		const resolvedAirportId = matchedAirport?.id ?? rawAirportId ?? resolvedDisplay ?? '';
		const valuesToPatch: Record<string, any> = {
			[`${fieldPrefix}_airport`]: resolvedAirportId,
			[`${fieldPrefix}_airport_option`]: resolvedDisplay,
			[`${fieldPrefix}_airport_name`]: resolvedDisplay,
			[`${fieldPrefix}_airport_latitude`]: airportLat ?? '',
			[`${fieldPrefix}_airport_longitude`]: airportLng ?? '',
		};

		this.patchControls(valuesToPatch);
	}

	private clearAddressState(formControl: string) {
		const valuesToClear: Record<string, any> = {
			[formControl]: '',
			[`${formControl}_latitude`]: '',
			[`${formControl}_longitude`]: ''
		};
		this.patchControls(valuesToClear);
	}

	clearAddressField(formControl: string) {
		this.BookingForm.get(formControl)?.setValue('');
		if (formControl !== 'loose_customer.address') {
			this.BookingForm.get(`${formControl}_latitude`)?.setValue('');
			this.BookingForm.get(`${formControl}_longitude`)?.setValue('');
		}
		this.BookingForm.updateValueAndValidity();

		const inputMap: Record<string, ElementRef | undefined> = {
			pickup: this.pickupInput,
			dropoff: this.dropoffInput,
			return_pickup: this.return_pickupInput,
			return_dropoff: this.return_dropoffInput,
			fbo_address: this.fboAddressInput,
			return_fbo_address: this.returnFboAddressInput,
			'loose_customer.address': this.loosecustomerInput,
		};

		const nativeInput = inputMap[formControl]?.nativeElement as HTMLInputElement | undefined;
		if (nativeInput) {
			nativeInput.value = '';
			syncPlaceAutocompleteDisplay(nativeInput);
		}

		if (formControl !== 'loose_customer.address') {
			this.MapController();
			if (this.Form.service_type.value == 'round_trip') {
				this.MapController(true);
			}
			this.buildBookingData();
		}
	}

	clearAirportField(formControl: string) {
		this.resetCustomAirportSessionToken(formControl);
		this.clearCustomAirportSearchDebounceTimer(formControl);
		const clearFields = (controlName: string) => {
			this.BookingForm.get(controlName)?.setValue('', { emitEvent: false });
			this.BookingForm.get(`${controlName}_option`)?.setValue('', { emitEvent: false });
			this.BookingForm.get(`${controlName}_name`)?.setValue('', { emitEvent: false });
			this.BookingForm.get(`${controlName}_latitude`)?.setValue('', { emitEvent: false });
			this.BookingForm.get(`${controlName}_longitude`)?.setValue('', { emitEvent: false });
		};

		clearFields(formControl);
		if (formControl === 'pickup_airport') {
			clearFields('return_dropoff_airport');
		}
		if (formControl === 'dropoff_airport') {
			clearFields('return_pickup_airport');
		}
		this.BookingForm.updateValueAndValidity();

		const inputMap: Record<string, ElementRef | undefined> = {
			pickup_airport: this.pickupAirportInput,
			dropoff_airport: this.dropoffAirportInput,
			return_pickup_airport: this.returnPickupAirportInput,
			return_dropoff_airport: this.returnDropoffAirportInput,
		};

		const nativeInput = inputMap[formControl]?.nativeElement as HTMLInputElement | undefined;
		if (nativeInput) {
			nativeInput.value = '';
			clearPlaceAutocompleteDisplay(nativeInput);
		}

		this.resyncAirportAutocompleteDisplays();
		requestAnimationFrame(() => this.resyncAirportAutocompleteDisplays());
		setTimeout(() => this.resyncAirportAutocompleteDisplays(), 0);
		setTimeout(() => this.resyncAirportAutocompleteDisplays(), 120);

		this.MapController();
		if (this.Form.service_type.value == 'round_trip') {
			this.MapController(true);
		}
		this.buildBookingData();
	}

	private resyncAirportAutocompleteDisplays() {
		const syncMap: Array<{ formControl: string; inputRef?: ElementRef }> = [
			{ formControl: 'pickup_airport', inputRef: this.pickupAirportInput },
			{ formControl: 'dropoff_airport', inputRef: this.dropoffAirportInput },
			{ formControl: 'return_pickup_airport', inputRef: this.returnPickupAirportInput },
			{ formControl: 'return_dropoff_airport', inputRef: this.returnDropoffAirportInput },
		];

		syncMap.forEach(({ formControl, inputRef }) => {
			const nativeInput = inputRef?.nativeElement as HTMLInputElement | undefined;
			if (!nativeInput) {
				return;
			}

			nativeInput.value = this.BookingForm.get(`${formControl}_option`)?.value || '';
			syncPlaceAutocompleteDisplay(nativeInput);
		});
	}

	clearExtraStopAddress(isReturn: boolean, stopIndex: number, input?: HTMLInputElement) {
		const formArrayName = isReturn ? 'return_extra_stops' : 'extra_stops';
		const stopGroup = (this.BookingForm.get(formArrayName) as FormArray)?.at(stopIndex);

		stopGroup?.get('address')?.setValue('');
		stopGroup?.get('latitude')?.setValue('');
		stopGroup?.get('longitude')?.setValue('');
		this.BookingForm.updateValueAndValidity();

		if (input) {
			input.value = '';
			syncPlaceAutocompleteDisplay(input);
		}

		if (isReturn) {
			this.MapController(true);
		} else {
			this.MapController();
		}
		this.buildBookingData();
	}

	fetchAirportsAndBigData(): void {
		let s = setInterval(() => {
			let bigData = this.$api.getAirportsAndBigData()
			// bigData
			if (bigData) {
				this.$spinner.hide('fetchspinner');
				this.BigData = JSON.parse(JSON.stringify(bigData));
				this.BigData_COPY = JSON.parse(JSON.stringify(this.BigData));
				// format the name of each airports/airlines data as 'code - name, city, country'
				this.BigData.airportsData.map((item: any) => {
					if (item.id === 3283) {
						item['formatted_name'] = `${item.code} - ${item.name}`;
					} else {
						item['formatted_name'] = `${item.code} - ${item.name}, ${item.city}, ${item.country}`;
					}
					return item;
				});
				this.BigData.airlinesData.map((item: any) => item['formatted_name'] = `${item.code} - ${item.name}, ${item.country}`);
				this.BigData_COPY.airportsData.map((item: any) => {
					if (item.id === 3283) {
						item['formatted_name'] = `${item.code} - ${item.name}`;
					} else {
						item['formatted_name'] = `${item.code} - ${item.name}, ${item.city}, ${item.country}`;
					}
					return item;
				});
				this.BigData_COPY.airlinesData.map((item: any) => item['formatted_name'] = `${item.code} - ${item.name}, ${item.country}`);

				this.MapController();
				console.log('this.Form.reservation_id.value----------->>>>>>>>>>>>>', this.Form.reservation_id.value)
				this.Form.reservation_id.value ? this.prefillViaBookingID(this.Form.reservation_id.value) : '';
				this.newBooking ? this.setValueByBookNow() : "";
				clearInterval(s);
			}
			else {
				this.$spinner.show('fetchspinner');
			}
		}, 2000);
	}


	fetchClientAccounts(account_type: string) {
		console.log('fetchClientAccounts->>', account_type)
		const legend = {
			individual: 'individual',
			// corporate: 'corporate',
			travel_planner: 'travel'
		}

		// fail-safe
		if (!legend.hasOwnProperty(account_type)) {
			// console.error('Invalid Account type: ', account_type)
			return
		}
		else {
			this.$spinner.show()
			this.affiliateService.getAccountBytype(legend[account_type]).subscribe((response: any) => {
				if (response.success && response.data.length > 0) {
					this.ClientAccounts = response.data;
				}
				this.$spinner.hide()
			})
		}
	}



	chooseUser(account_id: number) {
		this.$spinner.show()
		this.chosen_user = {}
		console.log('chooseUser---->>>', this.Form.account_type.value)
		this.affiliateService.chooseUser(account_id, this.Form.account_type.value).subscribe((response: any) => {
			if (response.success && Object.keys(response.data).length > 0) {
				this.chosen_user = response.data
				this.chosen_user['name'] = `${response.data.first_name} ${response.data.middle_name ?? ''} ${response.data.last_name}`
				this.autofillData('passenger', this.chosen_user);
			}
			this.$spinner.hide();
		})
	}

	fetchAffiliates(affiliate_type: 'affiliate' | 'loose_affiliate') {
		if (affiliate_type == 'loose_affiliate') {
			return
		}
		else {
			this.AffiliateAccounts = []
			this.$spinner.show()
			this.$api.getAccountBytype('driver').subscribe((response: any) => {
				if (response.success && response.data.length > 0) {
					this.AffiliateAccounts = response.data

					//lose all affiliate vehicle and driver data on change of affiliate type
					// for (let key in this.Form)
					// {
					// 	if (this.BookingForm.get(key) instanceof FormControl && (this.searchSubstring(key, 'vehicle') || this.searchSubstring(key, 'driver')))
					// 	{
					// 		this.BookingForm.get(key).reset()
					// 	}
					// }
				}
				this.$spinner.hide()
			})
		}
	}


	// custom search function
	airportSearchFunction(term: string, item: any) {
		term = term.toLowerCase();

		// Creating and array of space saperated term and removinf the empty values using filter
		let splitTerm = term.split(' ').filter(t => t);

		let isWordThere = [];

		// Pushing True/False if match is found
		splitTerm.forEach(arr_term => {
			if (arr_term.length <= 3) {
				let search = item['formatted_name'].toLowerCase();
				isWordThere.push(search.startsWith(arr_term));
			}
			if (arr_term.length > 3) {
				let search = item['formatted_name'].toLowerCase();
				isWordThere.push(search.indexOf(arr_term) != -1);
			}
		});
		const all_words = (this_word) => this_word;
		// Every method will return true if all values are true in isWordThere.
		return isWordThere.every(all_words);
	}

	// custom search function
	airlineSearchFunction(term: string, item: any) {
		term = term.toLowerCase();

		// Creating and array of space saperated term and removinf the empty values using filter
		let splitTerm = term.split(' ').filter(t => t);

		let isWordThere = [];

		// Pushing True/False if match is found
		splitTerm.forEach(arr_term => {
			if (arr_term.length <= 2) {
				let search = item['formatted_name'].toLowerCase();
				isWordThere.push(search.startsWith(arr_term));
			}
			if (arr_term.length > 2) {
				let search = item['formatted_name'].toLowerCase();
				isWordThere.push(search.indexOf(arr_term) != -1);
			}
		});



		const all_words = (this_word) => this_word;
		// Every method will return true if all values are true in isWordThere.
		return isWordThere.every(all_words);
	}
	// chooseAffiliate() {
	// 	// console.warn('Fetching Affiliate vehicles and drivers')
	// 	this.fetchAffiliateVehicles(this.BookingForm.get('affiliate_id').value)
	// 	this.fetchAffiliateDrivers(this.BookingForm.get('affiliate_id').value)
	// }

	fetchAffiliateInformation(affiliate_id: number) {
		// this.$spinner.show('normalspinner');
		// this.$api.getAffiliateAccount(affiliate_id).pipe(pluck('data')).subscribe((response: any) => {
		// 	isDevMode() && console.info('Affiliate Information', response);
		// 	this.AffiliateInformation = response;
		// 	this.$spinner.hide('normalspinner');
		// })
	}

	fetchAffiliateVehicles(affiliate_id: number) {
		if (!affiliate_id) {
			console.error('Invalid Paramater affiliate_data', affiliate_id)
			return
		}
		this.$spinner.show()
		this.affiliateService.getVehicleDataByAffiliateId(affiliate_id).then((response: any) => {
			console.log('get vehicle data response------------------->>>>>>>>>>>>>>>', response.success && response.data?.vehicleList.length > 0, response.data)
			if (response.success && response.data?.vehicleList.length > 0) {
				this.VehicleList = response.data?.vehicleList
				console.log('in else vehicle list ---->>>>>>', this.VehicleList)
				// add a key with formatted name to every value
				this.VehicleList.map((item: any) => item['formatted_name'] = `${item.vehicleType} - ${item.make} (${item.model})`);

				this.vehicleType_arr = this.VehicleList = this.vehicleMake_arr = this.VehicleList = this.vehicleModal_arr = this.VehicleList = this.vehicleYear_arr = this.VehicleList = this.vehicleColor_arr = this.VehicleList
				for (let i = 0; i < this.VehicleList.length; i++) {
					if (this.VehicleList[i].isRatesCompleted) {
						// let vehicle_type_id = this.BigData['vehicleCategories'].find(item => item.name == this.VehicleList[i].vehicleType)['id']
						if (affiliate_id == this.firstLoadAffiliateId) {
							if (this.VehicleList[i].ID == this.firstLoadVehicleId) {
								console.log('selected vehicle on first load---------------------------------->>>>>', this.VehicleList[i])
								this.SetFormValue('vehicle_id', this.VehicleList[i].ID);
								this.SetFormValue('vehicle_type', this.VehicleList[i].vehicleType_id)
								this.SetFormValue('vehicle_type_name', this.VehicleList[i].vehicleType)
								this.unique_key = this.VehicleList[i].unique_key
								this.handleSelectVehicleType(this.VehicleList[i])
								// this.autofillData('vehicle', this.VehicleList[i]);
								break;
							}
						}
						else {
							console.log('new affiliate seleted')
							this.SetFormValue('vehicle_id', this.VehicleList[i].ID);
							this.SetFormValue('vehicle_type', this.VehicleList[i].vehicleType_id)
							this.SetFormValue('vehicle_type_name', this.VehicleList[i].vehicleType)
							this.unique_key = this.VehicleList[i].unique_key
							this.handleSelectVehicleType(this.VehicleList[i])
							// this.autofillData('vehicle', this.VehicleList[i]);
							break;
						}

					}
				}
			}
			this.$spinner.hide()
		})
	}

	fetchAffiliateDrivers(affiliate_id: number) {
		if (!affiliate_id) {
			console.error('Invalid Paramater affiliate_data', affiliate_id)
			return
		}
		console.log('in function fectch driver info -------------------')

		this.$spinner.show()
		this.affiliateService.driverList(affiliate_id).then((response: any) => {
			if (response.success && response.data?.data.length > 0) {
				setTimeout(() => {
					this.initphonefield()
				}, 200)
				this.DriverList = response.data.data
				let isValueSet = false
				for (let i = 0; i < this.DriverList.length; i++) {
					if (this.bookingResponse?.driver_id && this.DriverList[i]?.id == this.bookingResponse?.driver_id) {
						this.SetFormValue('driver_id', this.DriverList[i].id)
						console.log('autofill driver info--->>', this.DriverList[i])
						this.autofillData('driver', this.DriverList[i])
						isValueSet = true
						break;
					}
				}
				if (!isValueSet) {
					this.SetFormValue('driver_id', this.DriverList[0].id)
					this.autofillData('driver', this.DriverList[0])
				}
				// autofill data
				// if (this.DriverList.length == 1) {
				// 	this.SetFormValue('driver_id', this.DriverList[0].id)
				// 	this.autofillData('driver', this.DriverList[0])
				// }
			}
			this.$spinner.hide();
		})
	}

	buildBookingData() {
		console.log('rebuild booking data')
		this.booking_data = {
			vehicle_id: this.BookingForm.get('vehicle_id').value,
			transfer_type: this.BookingForm.get('transfer_type').value,
			service_type: this.BookingForm.get('service_type').value,
			numberOfVehicles: 1,
			distance: this.distance,
			return_distance: this.return_distance,
			no_of_hours: this.number_of_hours,
			is_master_vehicle: this.is_master_vehicle,
			extra_stops: this.BookingForm.get('extra_stops').value,
			return_extra_stops: this.BookingForm.get('return_extra_stops').value,
			pickup_time: this.BookingForm.get('pickup_time').value,
			return_pickup_time: this.BookingForm.get('return_pickup_time').value,
			return_vehicle_id: this.BookingForm.get('vehicle_id').value,
			return_affiliate_type: this.BookingForm.get('affiliate_type').value,
		}
	}
	handleNoOfHours(eventValue: any) {
		const value = Number(eventValue);
		// Update error flag reactively
		if (this.Form.service_type.value == 'charter_tour') {
			if (!isNaN(value) && value < 2) {
				this.numberOfHoursError = true;
			} else {
				this.numberOfHoursError = false;
			}
		} else {
			this.numberOfHoursError = false;
		}

		if (!isNaN(value) && value > 0) {
			this.number_of_hours = value;
			this.buildBookingData();
		}
	}

	enforceMinimumHours(event: any) {
		let value = Number(event.target.value || 0);

		if (this.Form.service_type.value == 'charter_tour' && (isNaN(value) || value < 2)) {
			value = 2;
			this.number_of_hours = 2;
			this.SetFormValue('number_of_hours', 2);
			this.numberOfHoursError = false;
		}

		if (!isNaN(value) && value > 0) {
			this.buildBookingData();
		}
	}

	blockNegative(event: KeyboardEvent) {
		if (event.key === '-') {
			event.preventDefault();
		}
	}
	onSelectionChangeServiceType(event: any) {
		console.log("in service type change--->", event.value)
		this.service_type = event.value;
		this.buildBookingData()
	}
	chooseDriver(driver_data: any) {
		this.autofillData('driver', driver_data)
	}

	fetchVehiclesFromVehicleType(vehicleType_id: any) {
		// Todo: autofill data 
	}

	fetchModels(make_id: number) {
		this.BigData['vehicleModels'] = this.BigData['vehicleModels'].filter(item => item.make_id == make_id)
		return
	}

	searchValue(list_name: string, search_value: string, search_with: string, form_control?: string) {
		if (form_control) {
			this.BookingForm.get(form_control).reset()
			this.BookingForm.updateValueAndValidity()
		}
		if (!this.BigData) {
			return
		}
		if (list_name == 'vehicleModels') {
			this.BigData['vehicleModels'] = this.BigData_COPY['vehicleModels'].filter((item: any) => item.make_id == this.Form.vehicle_make.value)
		} else {
			this.BigData[list_name] = this.BigData_COPY[list_name]
		}
		if (search_value == '') {
			return
		}

		if (list_name === 'airportsData' || list_name === 'airlinesData') {
			// match with code
			this.BigData[list_name] = this.BigData[list_name].filter((item: any) => item['code'].toLowerCase().startsWith(search_value.toLowerCase()))
			// match with name 
			if (this.BigData[list_name].length == 0) {
				this.BigData[list_name] = this.BigData_COPY[list_name]
				this.BigData[list_name] = this.BigData[list_name].filter((item: any) => item['name'].toLowerCase().startsWith(search_value.toLowerCase()))
			}

			// match with country
			if (this.BigData[list_name].length == 0) {
				this.BigData[list_name] = this.BigData_COPY[list_name]
				this.BigData[list_name] = this.BigData[list_name].filter((item: any) => item['country'].toLowerCase().startsWith(search_value.toLowerCase()))
			}
			return	// for only airport/airlines data
		}

		// for other cases
		this.BigData[list_name] = this.BigData[list_name].filter((item: any) => item[search_with].toLowerCase().startsWith(search_value.toLowerCase()))
	}
	convertToMinutes(value) {
		const days = Math.floor(value / (24 * 60 * 60));
		const remainingSeconds = value % (24 * 60 * 60);
		const hours = Math.floor(remainingSeconds / (60 * 60));
		const remainingMinutes = Math.floor((remainingSeconds % (60 * 60)) / 60);

		let result = "";

		if (days > 0) {
			result += `${days} days, `;
		}

		if (hours > 0 || (days === 0 && hours === 0)) {
			result += `${hours} hours, `;
		}

		result += `${remainingMinutes} minutes`;

		return result;
	}

	fillValue(list: Array<Record<string, any> | string> | null = null, form_control: string, return_key: string = null, sep?: string): string | number {
		// fail-safe
		if (!this.BigData) {
			return ''
		}

		if (list === null && return_key === null) {
			return this.BookingForm.get(form_control).value ?? ''
		}

		// fail-safes
		if (!list && !form_control && !return_key) {
			// console.trace('Invalid Parameters Passed. ')
			return ''
		}

		if (list && typeof list[0] === 'string') {
			return list.find((item: string) => item == this.Form[form_control].value)[return_key]
		}

		if (!this.BookingForm.get(form_control).value) {
			return null
		}

		let temp = list.find(item => item['id'] == this.BookingForm.get(form_control).value)
		if (return_key.includes('+') && temp) {
			let keys = return_key.split('+')
			let ret_str = ""
			for (let i = 0; i < keys.length; i++) {
				ret_str = ret_str + temp[keys[i].trim()] + sep
			}
			return ret_str.replace(/(\,)$/g, '').trim()
		}
		return temp ? temp[return_key] : ''

	}


	fetchStopValue(form_group_name: string, index: number) {
		try {
			return (<FormArray>this.BookingForm.get(form_group_name)).at(index).get('address').value
		}
		catch {
			return ''
		}
	}

	autofillData(filling_for: string, data: any) {
		console.log("data in autofill", data)
		if (filling_for === 'passenger') {
			data.middle_name ?
				this.SetFormValue('passenger_name', `${data?.first_name} ${data?.middle_name} ${data?.last_name}`) : this.SetFormValue('passenger_name', `${data?.first_name} ${data?.last_name}`)
			this.SetFormValue('passenger_email', data.email)
			this.SetFormValue('passenger_cell', data.mobile)
			this.SetFormValue('passenger_cell_isd', data.mobileIsd)
			this.SetFormValue('passenger_cell_country', data.mobileCountry)
			this.SetFormValue('origin_airport_city', data?.origin_airport_city ? data?.origin_airport_city : data?.departing_airport_city)
			this.SetFormValue('pickup_flight', data.pickup_flight)
			this.SetFormValue('dropoff_flight', data.dropoff_flight)
			if (this.PaxTelObject) {
				this.PaxTelObject.setCountry(data.mobileCountry);
			}
		}

		if (filling_for === 'cruise') {
			if (data?.cruise_port == null) {
				this.SetFormValue('cruise_port', data?.return_cruise_port);
			} else {
				this.SetFormValue('cruise_port', data?.cruise_port)
			}
			if (data?.cruise_name == null) {
				this.SetFormValue('cruise_name', data?.return_cruise_name)
			} else {
				this.SetFormValue('cruise_name', data?.cruise_name)
			}
			if (data?.cruise_time == null) {
				this.SetFormValue('cruise_time', data?.return_cruise_time)
			} else {
				this.SetFormValue('cruise_time', data?.cruise_time)
			}
		}

		if (filling_for == 'vehicle') {
			this.SetFormValue('vehicle_license_plate', data.licensePlate)
			this.SetFormValue('vehicle_seats', data.seats)

			// fill values of make/model/year/color
			let i = 0
			let legend = ['make', 'model', 'year', 'color']
			for (let item of ['vehicleMakes', 'vehicleModels', 'vehicleYears', 'vehicleColors']) {
				let obj = this.BigData[item].find(item => item.name == data[legend[i]])
				this.SetFormValue('vehicle_' + legend[i], obj['id'])
				let name = obj['name']; // name
				this.SetFormValue("vehicle_" + legend[i] + "_name", name);
				i++;
			}
		}

		if (filling_for == 'driver') {
			console.log('autofill data driver info-->>>', data, this.DriverList)
			let info = data
			if (!isNaN(data)) {
				for (let i = 0; i < this.DriverList.length; i++) {
					if (this.DriverList[i].id == data) {
						info = { ...this.DriverList[i] }
					}
				}
			}
			this.SetFormValue('driver_name', `${info?.FirstName} ${info?.MiddleName ?? ''} ${info?.LastName}`)
			this.SetFormValue('driver_gender', info?.Gender)
			this.SetFormValue('driver_cell', info?.CellNumber)
			this.SetFormValue('driver_cell_isd', info?.CellIsd || info?.cell_isd)
			this.SetFormValue('driver_cell_country', (info?.CellNumberCountry || info?.cell_number_country)?.toLowerCase())
			this.SetFormValue('driver_email', info?.Email || info?.email)
			this.SetFormValue('driver_phone_type', info?.PhoneType ?? info?.phone_type ?? '');
			if (this.DrvTelObject) {
				this.DrvTelObject.setCountry(this.BookingForm.get('driver_cell_country').value);
			}
		}
	}



	addExtraStop(is_return: boolean = false) {
		// console.log('Adding Extra Stop ...')
		if (is_return) {
			let index = Object.keys(this.ReturnExtraStops).length + 1;
			(<FormArray>this.BookingForm.get('return_extra_stops')).push(new FormGroup({
				address: new FormControl(''),
				latitude: new FormControl(''),
				longitude: new FormControl(''),
				rate: new FormControl(''),
				booking_instructions: new FormControl('')
			}))
		}
		else {
			let index = Object.keys(this.ExtraStops).length + 1;
			(<FormArray>this.BookingForm.get('extra_stops')).push(new FormGroup({
				address: new FormControl(''),
				latitude: new FormControl(''),
				longitude: new FormControl(''),
				rate: new FormControl(''),
				booking_instructions: new FormControl('')
			}))
		}
	}

	deleteExtraStop(is_return: boolean, stop_index: number) {
		if (is_return) {
			(<FormArray>this.BookingForm.get('return_extra_stops')).removeAt(stop_index)
			this.MapController(true)
		}
		else {
			(<FormArray>this.BookingForm.get('extra_stops')).removeAt(stop_index)
			this.MapController()
		}
		this.buildBookingData()
	}



	fillExtraStop(is_return: boolean, index: number, address: any, location: any) {
		console.log(is_return, index, address, location);
		const displayAddress = address?.display_address ?? address?.formatted_address ?? '';
		if (is_return) {
			if (address) {
				(<FormArray>this.BookingForm.get('return_extra_stops')).at(index).patchValue({
					address: displayAddress
				})
				let return_pickup_location = this.Form.return_pickup?.value
				if (this.Form.transfer_type.value.includes('_airport')) {
					return_pickup_location = this.Form.return_pickup_airport_name?.value
				}
				this.checkExtraStopInTown(return_pickup_location, address.formatted_address, 'return_extra_stops', index)
			}
			if (location) {
				(<FormArray>this.BookingForm.get('return_extra_stops')).at(index).patchValue({
					latitude: location.latitude,
					longitude: location.longitude
				})
			}
			this.BookingForm.updateValueAndValidity();
			this.MapController(true)
		}
		else {
			if (address) {
				(<FormArray>this.BookingForm.get('extra_stops')).at(index).patchValue({
					address: displayAddress
				});
				let pickup_location = this.Form.pickup.value
				if (this.Form.transfer_type.value.includes('airport_')) {
					pickup_location = this.Form.pickup_airport_name.value
				}
				this.checkExtraStopInTown(pickup_location, address.formatted_address, 'extra_stops', index)
			}

			if (location) {
				(<FormArray>this.BookingForm.get('extra_stops')).at(index).patchValue({
					latitude: location.latitude,
					longitude: location.longitude
				})
			}

			this.BookingForm.updateValueAndValidity();
			this.MapController()
		}
	}
	getTown(geocodeResult) {
		for (let i = 0; i < geocodeResult.length; i++) {
			const addressComponents = geocodeResult[i].address_components;
			for (let j = 0; j < addressComponents.length; j++) {
				const types = addressComponents[j].types;
				if (types.includes('locality')) {
					return addressComponents[j].long_name;
				}
			}
		}
		return null;
	}

	handleChangeVehicleType(event) {
		console.log('in function handle change vehicle type', event, event.unique_key)
		this.VehicleList.map(i => (i.unique_key == event.unique_key) ? this.handleSelectVehicleType(i) : '')

	}

	handleSelectVehicleType(selectedVehicle: any) {
		console.log('selectweed vehicle-->>>>', selectedVehicle, selectedVehicle.licensePlate === null)
		this.SetFormValue('vehicle_id', selectedVehicle.ID);
		this.SetFormValue('vehicle_type_name', selectedVehicle.vehicleType)
		this.SetFormValue('vehicle_make', selectedVehicle.make_id);
		this.SetFormValue('vehicle_make_name', selectedVehicle.make);
		this.SetFormValue('vehicle_model', selectedVehicle.model_id);
		this.SetFormValue('vehicle_model_name', selectedVehicle.model);
		this.SetFormValue('vehicle_year', selectedVehicle.year_id);
		this.SetFormValue('vehicle_year_name', selectedVehicle.year);
		this.SetFormValue('vehicle_color', selectedVehicle.color_id);
		this.SetFormValue('vehicle_color_name', selectedVehicle.color);
		selectedVehicle.licensePlate === null ? this.BookingForm.get('vehicle_license_plate').setValue('') : this.SetFormValue('vehicle_license_plate', selectedVehicle.licensePlate)
		this.SetFormValue('vehicle_seats', selectedVehicle.seats)
		this.buildBookingData()
	}

	checkExtraStopInTown(location1: string, location2: string, formKey: string, index: any) {
		console.log('in function check extra stop in town', location1, location2)
		const geocoder = new google.maps.Geocoder();
		geocoder.geocode({ address: location1 }, (results1, status1) => {
			if (status1 === 'OK' && results1.length > 0) {
				const town1 = this.getTown(results1);
				geocoder.geocode({ address: location2 }, async (results2, status2) => {
					if (status2 === 'OK' && results2.length > 0) {
						const town2 = this.getTown(results2);

						if (town1 === town2) {
							console.log('Both locations are in the same town/city.', this.extraStops_rate);
							await (<FormArray>this.BookingForm.get([formKey])).at(index).patchValue({
								rate: 'in_town'
							});
						} else {
							console.log('Locations are in different towns/cities.', this.extraStops_rate);
							(<FormArray>this.BookingForm.get([formKey])).at(index).patchValue({
								rate: 'out_town'
							});
						}
						setTimeout(() => {
							this.buildBookingData()
						}, 300)
					} else {
						console.error('Geocoding for Location 2 failed:', status2);
					}
				});
			} else {
				console.error('Geocoding for Location 1 failed:', status1);
			}
		});
	}


	select(is_checked: boolean, form_control: string, value: any) {
		let amenity_name: string = ''
		amenity_name = this.BigData?.amenity.find(item => item.id == value)['name']

		if (is_checked) {
			if (!this.BookingForm.get(form_control).value.includes(value)) {
				this.amenities.push(amenity_name);
				(<FormArray>this.BookingForm.get(form_control)).push(new FormControl(value));
			}
		} else {
			// remove from list
			let list_index = this.BookingForm.get(form_control).value.findIndex((item: number) => item == value);
			this.amenities = this.amenities.filter((item: any) => item != amenity_name);
			(<FormArray>this.BookingForm.get(form_control)).removeAt(list_index)
		}
	}





	isChecked(form_control: string, object: any) {
		let list = (<FormArray>this.BookingForm.get(form_control)).value
		return list.includes(object)
	}

	getTopOffset(controlEl: HTMLElement): number {
		// console.log(controlEl.getBoundingClientRect());
		const labelOffset = 90;
		return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
	}
	textFormatterTransferType(text: any) {
		try {
			return text.replace(/[\\\_$]+/g, ' ') + '?'
		}
		catch {
			return text
		}
	}

	createReservationShareArray() {
		console.log('in function createReservationShareArray')
		if (this.RatesForm) {
			let base_rate = 0
			if (this.BookingForm.value?.service_type == 'charter_tour' && !this.BookingForm.value.rateArray?.min_rate_involved) {
				base_rate += this.RatesForm.all_inclusive_rates["Base_Rate"].baserate * this.number_of_hours
			}
			else {
				base_rate += this.RatesForm.all_inclusive_rates["Base_Rate"].baserate
			}
			['ELH_Charges', 'Stops', 'Wait'].map((key) => {
				base_rate += this.RatesForm.all_inclusive_rates[key].baserate
			});
			for (const key of Object.keys(this.RatesForm.amenities)) {
				base_rate += this.RatesForm.amenities[key].baserate;
			}
			if (this.BookingForm.value.number_of_vehicles != 0) {
				base_rate *= this.BookingForm.value.number_of_vehicles
			}
			let grandTotal = this.BookingForm.value.rateArray.grand_total
			let stripeFee = grandTotal * 0.05 + 0.30
			let adminShare = (base_rate * this.adminSharePercent) / 100
			adminShare = adminShare + (this.BookingForm.value.rateArray.misc.Extra_Gratuity.amount * 0.25)
			let deducted_admin_share = adminShare - stripeFee
			let shareArray = {
				baseRate: base_rate,
				grandTotal: grandTotal,
				stripeFee: stripeFee,
				adminShare: adminShare,
				deducted_admin_share: deducted_admin_share,  // Admin will get this amount only
				affiliateShare: grandTotal - base_rate * 0.25
			}
			// travelAgentShare : 
			if (this.BookingForm.value?.account_type == 'travel_planner' && !this.isCreatedByAdmin) {
				this.adminSharePercent = 15
				shareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100
				shareArray['deducted_admin_share'] = shareArray['adminShare'] - shareArray['stripeFee']
				shareArray['travelAgentShare'] = base_rate * 0.10
			}
			else if (this.isFarmoutBooking) {
				this.adminSharePercent = 15
				shareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100
				shareArray['deducted_admin_share'] = shareArray['adminShare'] - shareArray['stripeFee']
				shareArray['farmoutShare'] = base_rate * 0.10
				shareArray['affiliateShare'] = grandTotal - base_rate * 0.25
			}
			this.shareArray = shareArray
			// console.log('in function createReservationShareArray-->>>' , base_rate, shareArray )
			return shareArray;
			// value['rateArray'] = JSON.parse(JSON.stringify(this.RatesForm))
		}
	}
	createReservationReturnShareArray() {
		console.log('createReservationReturnShareArray', this.BookingForm.value.return_grand_total)
		if (this.Form.service_type.value == 'round_trip' && this.ReturnRatesForm) {

			let base_rate = 0
			for (const key of Object.keys(this.ReturnRatesForm.all_inclusive_rates)) {
				base_rate += this.ReturnRatesForm.all_inclusive_rates[key].baserate;
			}
			for (const key of Object.keys(this.ReturnRatesForm.amenities)) {
				base_rate += this.ReturnRatesForm.amenities[key].baserate;
			}
			if (this.BookingForm.value.number_of_vehicles != 0) {
				base_rate *= this.BookingForm.value.number_of_vehicles
			}
			let returnGrandTotal = this.BookingForm.value.return_grand_total
			let stripeFee = returnGrandTotal * 0.05 + 0.30
			let adminShare = (base_rate * this.adminSharePercent) / 100
			adminShare = adminShare + (this.BookingForm.value.returnRateArray.misc.Extra_Gratuity.amount * 0.25)
			let deducted_admin_share = adminShare - stripeFee
			let returnShareArray = {
				baseRate: base_rate,
				returnGrandTotal: returnGrandTotal,
				deducted_admin_share: deducted_admin_share,  // Admin will get this amount only
				grandTotal: returnGrandTotal,
				stripeFee: stripeFee,
				adminShare: adminShare,
				affiliateShare: returnGrandTotal - adminShare
			}
			// travelAgentShare : 
			if (this.BookingForm.value?.account_type == 'travel_planner' && this.BookingForm.value?.affiliate_type == 'affiliate') {
				returnShareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100
				returnShareArray['deducted_admin_share'] = returnShareArray['adminShare'] - returnShareArray['stripeFee']
				returnShareArray['travelAgentShare'] = base_rate * 0.10
			}
			else if (this.isFarmoutBooking) {
				this.adminSharePercent = 15
				returnShareArray['adminShare'] = (base_rate * this.adminSharePercent) / 100
				returnShareArray['deducted_admin_share'] = returnShareArray['adminShare'] - returnShareArray['stripeFee']
				returnShareArray['farmoutShare'] = base_rate * 0.10
			}

			this.r_shareArray = returnShareArray
			// console.log('in function createReservationreturnShareArray-->>>' , base_rate, returnShareArray )
			return returnShareArray;
			// value['returnRateArray'] = JSON.parse(JSON.stringify(this.ReturnRatesForm))
		}
	}


	submitForm(preview: boolean) {
		this.submitBookingForm = true
		console.log(this.BookingForm);
		console.log(this.BookingForm.status);

		this.syncVisibleFieldPayloads();
		this.syncAirportPayloadFields();


		// Sanitize loose_customer.phone
		const lcPhone = this.BookingForm.get('loose_customer.phone');
		const lcIsd = this.BookingForm.get('loose_customer.phone_isd');
		if (lcPhone && lcPhone.value && lcIsd && lcIsd.value) {
			const val = String(lcPhone.value);
			const isd = String(lcIsd.value);
			if (val.startsWith(isd)) {
				lcPhone.setValue(val.substring(isd.length), { emitEvent: false });
			}
		}

		// Sanitize lose_affiliate_phone
		const laPhone = this.BookingForm.get('lose_affiliate_phone');
		const laIsd = this.BookingForm.get('lose_affiliate_phone_isd');
		if (laPhone && laPhone.value && laIsd && laIsd.value) {
			const val = String(laPhone.value);
			const isd = String(laIsd.value);
			if (val.startsWith(isd)) {
				laPhone.setValue(val.substring(isd.length));
			}
		}

		// Sanitize phone
		const phone = this.BookingForm.get('phone');
		const phoneIsd = this.BookingForm.get('phone_isd');
		if (phone && phone.value && phoneIsd && phoneIsd.value) {
			const val = String(phone.value);
			const isd = String(phoneIsd.value);
			if (val.startsWith(isd)) {
				phone.setValue(val.substring(isd.length));
			}
		}

		// Sanitize passenger_cell
		const pCell = this.BookingForm.get('passenger_cell');
		const pIsd = this.BookingForm.get('passenger_cell_isd');
		if (pCell && pCell.value && pIsd && pIsd.value) {
			const val = String(pCell.value);
			const isd = String(pIsd.value);
			if (val.startsWith(isd)) {
				pCell.setValue(val.substring(isd.length));
			}
		}

		// Sanitize driver_cell
		const dCell = this.BookingForm.get('driver_cell');
		const dIsd = this.BookingForm.get('driver_cell_isd');
		if (dCell && dCell.value && dIsd && dIsd.value) {
			const val = String(dCell.value);
			const isd = String(dIsd.value);
			if (val.startsWith(isd)) {
				dCell.setValue(val.substring(isd.length));
			}
		}

		if (this.BookingForm.invalid) {
			return;
		}

		let value = this.BookingForm.value;
		['pickup_airport', 'dropoff_airport', 'return_pickup_airport', 'return_dropoff_airport'].forEach((field) => {
			if (!value[field]) {
				value[field] = value[`${field}_name`] || value[`${field}_option`] || '';
			}
		});
		value['currency'] = this.currencyObj?.currency
		value['platform_type'] = 'web'
		if (this.RatesForm) {
			value['rateArray'] = JSON.parse(JSON.stringify(this.RatesForm))
			value['grand_total'] = value['rateArray']['grand_total']
			value['sub_total'] = value['rateArray']['sub_total']
			value['min_rate_involved'] = value['rateArray']['min_rate_involved']
			value['shares_array'] = this.createReservationShareArray()
			delete value['rateArray']['grand_total']
			delete value['rateArray']['sub_total']
			delete value['rateArray']['min_rate_involved']
			// Return Rates Form
			if (this.Form.service_type.value == 'round_trip' && this.ReturnRatesForm) {
				value['returnRateArray'] = JSON.parse(JSON.stringify(this.ReturnRatesForm))
				value['return_grand_total'] = value['returnRateArray']['r_grandtotal']
				value['return_sub_total'] = value['returnRateArray']['r_subtotal']
				delete value['returnRateArray']['r_grandtotal']
				delete value['returnRateArray']['r_subtotal']
				value['return_shares_array'] = this.createReservationReturnShareArray()
			}
		}

		if (preview) {
			this.$spinner.show()
			this.affiliateService.createBooking(value).subscribe((response: any) => {
				// this.$errors.openDialog({
				// 	errors: {
				// 		error: `<span class='text-success'>${response.message}</span>`
				// 	}
				// })
				if (this.currentUser.roleName == 'sub_affiliate') {
					this.nav_to_farmIn ? this.$router.navigate(['/sub_affiliate/my-bookings']) : this.$router.navigate(['/sub_affiliate/farm-out'])
				}
				else {
					this.nav_to_farmIn ? this.$router.navigate(['/affiliate/my-bookings']) : this.$router.navigate(['/affiliate/farm-out'])
				}

				this.$spinner.hide()
			})
		}
		else {
			$('#previewBooking').modal('handleUpdate').modal('show')
		}
	}

	resetFields() {
		this.chosen_user = null
		this.buildBookingForm()
		this.MapController()
		this.driver_image = {}
		this.vehicle_image = {}

		// if (!this.booking_params['client_account_types'].includes('loose_customer')) {
		// 	this.booking_params['client_account_types'].push('loose_customer')
		// }

		// if directly navigated to create new booking mode from edit booking mode
		if (this.BigData_COPY) {
			this.BigData = this.BigData_COPY
		}
		this.reset_button = !this.reset_button
	}

	returnZero() {
		return 0	// for keeping the order
	}



	/**
	* upload image with the specified name and set form value with its id.
	* @param event input event
	* @param image_type String [Required] type of the image being uploaded
	* @param image_id [Optional] id of the image to be edited
	*/
	async uploadImage(event: any, image_type: string) {
		if (!await this.commonServices.handleFile(event)) {
			return;
		}
		let image: any
		console.log(event.target.files)
		if (event.target.files && event.target.files.length > 0) {
			const reader = new FileReader()
			const file = event.target.files[0]
			reader.readAsDataURL(file)
			reader.onload = () => {
				image = reader.result as string
				// this.$spinner.show();
				// this.$api.uploadVehicleImage(image).subscribe((response: any) => {
				// 	this[image_type] = { image: response.data.image, id: response.data.ID }
				// 	this.SetFormValue(image_type + '_id', this[image_type]['id'])
				// 	this.$spinner.hide();
				// })
			}
		}
	}


	/**
	* Delete the image from the form. Basically sets the form value, empty.
	* @param image_type String [Required] type of the image to delete
	*/
	deleteImage(image_type: string) {
		this[image_type] = {};
		this.SetFormValue(image_type + '_id', 0);
	}


	modal_image: any
	showImageModal(image: string) {
		this.modal_image = image
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
	}

	close_image_modal: EventEmitter<any> = new EventEmitter()
	closeImageModal() {
		this.close_image_modal.emit()
	}


	fetchDistanceAndTime(data: any): Promise<{ [key: string]: number }> {
		let total_distance = 0.0
		let total_time = 0
		return new Promise((resolve) => {
			data.routes[0].legs.forEach((item: any) => {
				if (item.distance.value == 0) {
					this.$errors.openDialog({
						errors: {
							error: 'Please select a valid location point.'
						}
					})
					return
				}
				else {
					total_distance += item.distance.value
					total_time += item.duration.value
				}
			})
			resolve({
				distance: total_distance,
				time: total_time
			})
		})
	}


	toggleDropdown(type: string) {
		// console.log('Toggle Dropdown ', type)
		this.booking_params['chevrons'][type] = !this.booking_params['chevrons'][type]
	}

	Subscriptions() {

		// this.BookingForm.get('transfer_type').valueChanges.subscribe((value: string) => {
		// 	const reverseStringChars = (text: string) => {
		// 		let temp = text.split('_')
		// 		return temp.reverse().join('_')
		// 	}
		// 	this.SetFormValue('return_transfer_type', reverseStringChars(value))
		// })

		this.BookingForm.get('vehicle_type').valueChanges.subscribe((value: string) => {
			if (this.Form.affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate vehicle_type', value)
				if (value) {
					this.VehicleList.map(i => (i.unique_key == this.unique_key) ? this.handleSelectVehicleType(i) : '')
				}
				else {
					this.SetFormValue('vehicle_type_name', '');
					this.BookingForm.get('vehicle_make').setValue('')
					this.BookingForm.get('vehicle_make_name').setValue('')
					this.BookingForm.get('vehicle_model').setValue('')
					this.BookingForm.get('vehicle_model_name').setValue('')
					this.BookingForm.get('vehicle_year').setValue('')
					this.BookingForm.get('vehicle_year_name').setValue('')
					this.BookingForm.get('vehicle_color').setValue('')
					this.BookingForm.get('vehicle_color_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}

			} else {
				if (value && this.BigData) {
					let name = this.BigData['vehicleCategories'].find(item => item.id == value)['name']
					this.SetFormValue('vehicle_type_name', name);
					this.BookingForm.get('vehicle_make').setValue('')
					this.BookingForm.get('vehicle_make_name').setValue('')
					this.BookingForm.get('vehicle_model').setValue('')
					this.BookingForm.get('vehicle_model_name').setValue('')
					this.BookingForm.get('vehicle_year').setValue('')
					this.BookingForm.get('vehicle_year_name').setValue('')
					this.BookingForm.get('vehicle_color').setValue('')
					this.BookingForm.get('vehicle_color_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}
			}
		})

		this.BookingForm.get('vehicle_make').valueChanges.subscribe((value: string) => {
			if (this.Form.affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate  vehicle_make')
			} else {
				if (value && this.BigData) {
					this.BigData['vehicleModels'] = this.BigData_COPY?.vehicleModels.filter(item => item.make_id == value)
					let name = this.BigData['vehicleMakes'].find(item => item.id == value)['name']
					this.SetFormValue('vehicle_model', this.BigData?.vehicleModels[0]['id'])
					this.SetFormValue('vehicle_make_name', name)
				}
				else {
					this.BookingForm.get('vehicle_make_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}
			}
		})

		this.BookingForm.get('vehicle_model').valueChanges.subscribe((value: string) => {
			if (this.Form.affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate vehicle_model')

			} else {
				if (value && this.BigData) {
					let name = this.BigData['vehicleModels'].find(item => item.id == value)['name']
					this.SetFormValue('vehicle_model_name', name)
				}
				else {
					this.BookingForm.get('vehicle_model_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}
			}
		})

		this.BookingForm.get('vehicle_year').valueChanges.subscribe((value: string) => {
			if (this.Form.affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate vehicle_year')
			} else {
				if (value && this.BigData) {
					let name = this.BigData['vehicleYears'].find(item => item.id == value)['name']
					this.SetFormValue('vehicle_year_name', name)
				}
				else {
					this.BookingForm.get('vehicle_year_name').setValue('')
					this.BookingForm.updateValueAndValidity();
				}
			}
		})
		this.BookingForm.get('vehicle_color').valueChanges.subscribe((value: string) => {
			if (this.Form.affiliate_type.value == 'affiliate') {
				console.log('in function change value for affilliate vehicle_color')

			} else {
				if (value && this.BigData) {
					let name = this.BigData['vehicleColors'].find(item => item.id == value)['name']
					this.SetFormValue('vehicle_color_name', name)
				}
				else {
					this.BookingForm.get('vehicle_color_name').setValue('')
					this.BookingForm.updateValueAndValidity();

				}
			}
		})

		//pickup time change 
		this.BookingForm.get('pickup_time').valueChanges.subscribe((value: string) => {
			this.buildBookingData()
		})
		this.BookingForm.get('return_pickup_time').valueChanges.subscribe((value: string) => {
			this.buildBookingData()
		})


		// Service Type
		this.BookingForm.get('service_type').valueChanges.subscribe((value: string) => {
			this.updateNumberOfHoursValidators(value);
			this.init_return_rates = false;
			if (value == 'round_trip') {
				this.initAllAutocompletes()
				this.init_return_rates = true;
				console.log('init_return_rates---------->>>>>>>>', this.init_return_rates)
				setTimeout(() => {
					this.MapController(true)
				}, 2000)
				this.updateReturnLegValidators(this.BookingForm.get('return_transfer_type').value);
			}
			if (value != 'charter_tour') {
				this.BookingForm.get('number_of_hours').setValue(0)
				this.BookingForm.updateValueAndValidity()
				console.log(this.BookingForm.get('number_of_hours').value);
			}
			if (value == 'one_way') {
				this.clearReturnOnlyValidators();
			}
		})

		// Transfer Type
		this.BookingForm.get('transfer_type').valueChanges.subscribe((value: string) => {
			this.transfer_type = value;
			this.initAllAutocompletes()
			if (value.includes("city_")) {
				this.SetFormValue('booking_instructions', "1. Driver - Text on location. Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route");
			}

			// set cruise ship name and cruise port mandatory
			if (value.includes('_cruise') || value.includes('cruise_')) {
				if (value.includes("cruise_")) {
					this.SetFormValue('booking_instructions', "1. Pax - Text driver when docked.  2. Driver - Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route. Text pax with pickup instructions when ship has arrived.");
				}
				console.log("setting value of cruise port and name mandatory")
				this.BookingForm.get('cruise_name').setValidators([Validators.required]);
				this.BookingForm.get('cruise_port').setValidators([Validators.required]);
				this.BookingForm.get('cruise_name').updateValueAndValidity();
				this.BookingForm.get('cruise_port').updateValueAndValidity();
			} else {
				console.log("setting value of cruise port and name not mandatory")
				this.BookingForm.get('cruise_name').clearValidators();
				this.BookingForm.get('cruise_port').clearValidators();
				this.BookingForm.get('cruise_name').updateValueAndValidity();
				this.BookingForm.get('cruise_port').updateValueAndValidity();
			}

			// set flight number mandatory
			if (value.includes('_airport')) {
				console.log("setting value of dropoff flight mandatory")
				// this.BookingForm.get('dropoff_flight').setValidators([Validators.required]);
				// this.BookingForm.get('dropoff_flight').updateValueAndValidity();
				this.BookingForm.get('dropoff_airline_option').setValidators([Validators.required]);
				this.BookingForm.get('dropoff_airline_option').updateValueAndValidity();
				this.BookingForm.get('dropoff_airport_option').setValidators([Validators.required]);
				this.BookingForm.get('dropoff_airport_option').updateValueAndValidity();
			} else {
				console.log("setting value of dropoff flight not mandatory")
				// this.BookingForm.get('dropoff_flight').clearValidators();
				// this.BookingForm.get('dropoff_flight').updateValueAndValidity();
				this.BookingForm.get('dropoff_airline_option').clearValidators();
				this.BookingForm.get('dropoff_airline_option').updateValueAndValidity();
				this.BookingForm.get('dropoff_airport_option').clearValidators();
				this.BookingForm.get('dropoff_airport_option').updateValueAndValidity();
			}

			if (value.includes('airport_')) {
				this.SetFormValue('booking_instructions', "1. Pax - Text driver when landing.  2. Driver - Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route. Text pax with pickup instructions when plane has arrived.");
				console.log("setting value of pickup flight mandatory")
				this.BookingForm.get('pickup_flight').setValidators([Validators.required]);
				this.BookingForm.get('pickup_flight').updateValueAndValidity();
				this.BookingForm.get('pickup_airline_option').setValidators([Validators.required]);
				this.BookingForm.get('pickup_airline_option').updateValueAndValidity();
				this.BookingForm.get('pickup_airport_option').setValidators([Validators.required]);
				this.BookingForm.get('pickup_airport_option').updateValueAndValidity();
				this.BookingForm.get('origin_airport_city').setValidators([Validators.required]);
				this.BookingForm.get('origin_airport_city').updateValueAndValidity();
			} else {
				console.log("setting value of pickup flight not mandatory")
				this.BookingForm.get('pickup_flight').clearValidators();
				this.BookingForm.get('pickup_flight').updateValueAndValidity();
				this.BookingForm.get('pickup_airline_option').clearValidators();
				this.BookingForm.get('pickup_airline_option').updateValueAndValidity();
				this.BookingForm.get('pickup_airport_option').clearValidators();
				this.BookingForm.get('pickup_airport_option').updateValueAndValidity();
				this.BookingForm.get('origin_airport_city').clearValidators();
				this.BookingForm.get('origin_airport_city').updateValueAndValidity();
			}
			const reverseStringChars = (text: string) => {
				let temp = text.split('_')
				return temp.reverse().join('_')
			}
			this.SetFormValue('return_transfer_type', reverseStringChars(value))

			// pickup address validation
			if (!value.startsWith('airport_')) {
				this.BookingForm.get('pickup')?.setValidators([Validators.required]);
			} else {
				this.BookingForm.get('pickup')?.clearValidators();
			}
			this.BookingForm.get('pickup')?.updateValueAndValidity();

			// dropoff address validation
			if (!value.endsWith('_airport')) {
				this.BookingForm.get('dropoff')?.setValidators([Validators.required]);
			} else {
				this.BookingForm.get('dropoff')?.clearValidators();
			}
			this.BookingForm.get('dropoff')?.updateValueAndValidity();

			this.updateReturnLegValidators(this.BookingForm.get('return_transfer_type').value);
		})

		this.BookingForm.get('return_transfer_type').valueChanges.subscribe((value: string) => {
			console.log("in return_transfer_type value changes", value)
			this.initAllAutocompletes()
			if (this.BookingForm.get('service_type').value == 'round_trip') {


				if (value.includes("city_")) {
					this.SetFormValue('return_booking_instructions', "1. Driver - Text on location. Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route");
				}

				// set cruise ship name and cruise port mandatory
				if (value.includes('_cruise') || value.includes('cruise_')) {
					if (value.includes("cruise_")) {
						this.SetFormValue('return_booking_instructions', "1. Pax - Text driver when docked.  2. Driver - Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route. Text pax with pickup instructions when ship has arrived.");
					}
					console.log("setting value of return cruise port and name mandatory")
					this.BookingForm.get('return_cruise_name').setValidators([Validators.required]);
					this.BookingForm.get('return_cruise_port').setValidators([Validators.required]);
					this.BookingForm.get('return_cruise_name').updateValueAndValidity();
					this.BookingForm.get('return_cruise_port').updateValueAndValidity();
				} else {
					console.log("setting value of return cruise port and name not mandatory")
					this.BookingForm.get('return_cruise_name').clearValidators();
					this.BookingForm.get('return_cruise_port').clearValidators();
					this.BookingForm.get('return_cruise_name').updateValueAndValidity();
					this.BookingForm.get('return_cruise_port').updateValueAndValidity();
				}

				// set flight number mandatory
				if (value.includes('_airport')) {
					console.log("setting value of return dropoff flight mandatory")
					// this.BookingForm.get('return_dropoff_flight').setValidators([Validators.required]);
					// this.BookingForm.get('return_dropoff_flight').updateValueAndValidity();
					this.BookingForm.get('return_dropoff_airline_option').setValidators([Validators.required]);
					this.BookingForm.get('return_dropoff_airline_option').updateValueAndValidity();
					this.BookingForm.get('return_dropoff_airport_option').setValidators([Validators.required]);
					this.BookingForm.get('return_dropoff_airport_option').updateValueAndValidity();
				} else {
					console.log("setting value of return dropoff flight not mandatory")
					// this.BookingForm.get('return_dropoff_flight').clearValidators();
					// this.BookingForm.get('return_dropoff_flight').updateValueAndValidity();
					this.BookingForm.get('return_dropoff_airline_option').clearValidators();
					this.BookingForm.get('return_dropoff_airline_option').updateValueAndValidity();
					this.BookingForm.get('return_dropoff_airport_option').clearValidators();
					this.BookingForm.get('return_dropoff_airport_option').updateValueAndValidity();
				}

				if (value.includes('airport_')) {
					this.SetFormValue('return_booking_instructions', "1. Pax - Text driver when landing.  2. Driver - Text the client a day before to confirm driver name , cell phone and booking details. Text client with ETA when en route. Text pax with pickup instructions when plane has arrived.");
					console.log("setting value of return pickup flight mandatory")
					this.BookingForm.get('return_pickup_flight').setValidators([Validators.required]);
					this.BookingForm.get('return_pickup_flight').updateValueAndValidity();
					this.BookingForm.get('return_pickup_airline_option').setValidators([Validators.required]);
					this.BookingForm.get('return_pickup_airline_option').updateValueAndValidity();
					this.BookingForm.get('return_pickup_airport_option').setValidators([Validators.required]);
					this.BookingForm.get('return_pickup_airport_option').updateValueAndValidity();
					this.BookingForm.get('departing_airport_city').setValidators([Validators.required]);
					this.BookingForm.get('departing_airport_city').updateValueAndValidity();
				} else {
					console.log("setting value of return pickup flight not mandatory")
					this.BookingForm.get('return_pickup_flight').clearValidators();
					this.BookingForm.get('return_pickup_flight').updateValueAndValidity();
					this.BookingForm.get('return_pickup_airline_option').clearValidators();
					this.BookingForm.get('return_pickup_airline_option').updateValueAndValidity();
					this.BookingForm.get('return_pickup_airport_option').clearValidators();
					this.BookingForm.get('return_pickup_airport_option').updateValueAndValidity();
					this.BookingForm.get('departing_airport_city').clearValidators();
					this.BookingForm.get('departing_airport_city').updateValueAndValidity();
				}

				// return_pickup address validation
				if (!value.startsWith('airport_')) {
					this.BookingForm.get('return_pickup')?.setValidators([Validators.required]);
				} else {
					this.BookingForm.get('return_pickup')?.clearValidators();
				}
				this.BookingForm.get('return_pickup')?.updateValueAndValidity();

				// return_dropoff address validation
				if (!value.endsWith('_airport')) {
					this.BookingForm.get('return_dropoff')?.setValidators([Validators.required]);
				} else {
					this.BookingForm.get('return_dropoff')?.clearValidators();
				}
				this.BookingForm.get('return_dropoff')?.updateValueAndValidity();
			} else {
				this.clearReturnOnlyValidators();
			}

		})

		// Account Type Subscription
		this.BookingForm.get('account_type').valueChanges.subscribe((value: string) => {
			if (value == 'loose_customer') {
				setTimeout(() => {
					this.initphonefield()
				}, 200)
				this.initAllAutocompletes()
				const loose_customer = (this.BookingForm.get('loose_customer') as FormGroup)
				// for every 'item' in loose_customer
				for (let item in loose_customer.controls) {
					// if 'item' in loose_customer is a formgroup, like card_details
					if ((<FormGroup>this.BookingForm.get('loose_customer')).get(item) instanceof FormGroup) {
						console.log(item)
						// for every 'key' in card_details formgroup
						for (let key in (loose_customer.get(item) as FormGroup).controls) {
							// set validators in card_details
							(<FormGroup>loose_customer.get(item)).get(key).setValidators([Validators.required]);
							(<FormGroup>loose_customer.get(item)).get(key).updateValueAndValidity();

						}
					}

					if (item != 'middle_name' && item != 'address') {
						loose_customer.get(item).setValidators([Validators.required]);
					}
				}

				(<FormGroup>loose_customer.get('card_details')).get('card_number').setValidators([Validators.required, Validators.pattern("^[0-9+]*$"), , Validators.minLength(14), Validators.maxLength(20),]);
				(<FormGroup>loose_customer.get('card_details')).get('name').setValidators([Validators.required]);
				(<FormGroup>loose_customer.get('card_details')).get('cvv').setValidators([Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(3), Validators.maxLength(5)]);
				loose_customer.get('email').setValidators([Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)])
				loose_customer.get('phone').setValidators([Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(4), Validators.maxLength(15)])
				loose_customer.get('first_name').setValidators([Validators.required])
				// loose_customer.get('middle_name').setValidators(this.customValidator.whitespace())
				loose_customer.get('last_name').setValidators([Validators.required])
				loose_customer.get('address').setValidators(this.customValidator.whitespace())

			}
			else {
				const loose_customer = (this.BookingForm.get('loose_customer') as FormGroup)
				// for every 'item' in loose_customer
				for (let item in loose_customer.controls) {
					// if 'item' in loose_customer is a formgroup, like card_details
					if (loose_customer.get(item) instanceof FormGroup) {
						// for every 'key' in card_details formgroup
						for (let key in (loose_customer.get(item) as FormGroup).controls) {
							// clear validators in card_details
							loose_customer.get(item).get(key).clearValidators()
							loose_customer.get(item).get(key).updateValueAndValidity()
						}
					}
					loose_customer.get(item).clearValidators()
					loose_customer.get(item).updateValueAndValidity()
				}

				this.fetchClientAccounts(value)
			}
		})

		this.BookingForm.get('acc_id').valueChanges.subscribe((value: number) => {
			if (value) {
				this.chooseUser(value)
			}
		})

		// Affiliate Type
		this.BookingForm.get('affiliate_type').valueChanges.subscribe((value: string) => {
			if (value == 'loose_affiliate') {
				this.toggleDropdown(null)
				this.init_rates = true
				if (this.Form.service_type.value === 'round_trip') {
					this.init_return_rates = true;
				}
			}
			else {
				this.init_rates = true;
				this.init_return_rates = false;
				this.fetchAffiliates('affiliate')
				// this.chooseAffiliate()
			}
		})

		this.BookingForm.get('affiliate_id').valueChanges.subscribe((value: number) => {
			if (value) {
				// this.chooseAffiliate()
				this.fetchAffiliateInformation(value)
			}
		})

		this.BookingForm.get('vehicle_id').valueChanges.subscribe((value: any) => {
			if (value && this.VehicleList) {
				let v = this.VehicleList.find(item => item.ID == value)
				this.autofillData('vehicle', v);
			}
		})

		this.BookingForm.get('vehicle_type').valueChanges.subscribe((value: string) => {
			if (value && this.BigData) {
				let name = this.BigData['vehicleCategories'].find(item => item.id == value)['name']
				this.SetFormValue('vehicle_type_name', name);
			}
		})

		this.BookingForm.get('vehicle_make').valueChanges.subscribe((value: string) => {
			if (value && this.BigData) {
				this.BigData['vehicleModels'] = this.BigData_COPY?.vehicleModels.filter(item => item.make_id == value)
				let name = this.BigData['vehicleMakes'].find(item => item.id == value)['name']
				this.SetFormValue('vehicle_model', this.BigData?.vehicleModels[0]['id'])
				this.SetFormValue('vehicle_make_name', name)
			}
		})

		this.BookingForm.get('vehicle_model').valueChanges.subscribe((value: string) => {
			if (value && this.BigData) {

				let name = this.BigData['vehicleModels'].find(item => item.id == value)['name']
				this.SetFormValue('vehicle_model_name', name)
			}
		})

		this.BookingForm.get('vehicle_year').valueChanges.subscribe((value: string) => {
			if (value && this.BigData) {
				let name = this.BigData['vehicleYears'].find(item => item.id == value)['name']
				this.SetFormValue('vehicle_year_name', name)
			}
		})
		this.BookingForm.get('vehicle_color').valueChanges.subscribe((value: string) => {
			if (value && this.BigData) {
				let name = this.BigData['vehicleColors'].find(item => item.id == value)['name']
				this.SetFormValue('vehicle_color_name', name)
			}
		})

		this.BookingForm.get('pickup_airport_option').valueChanges.subscribe((value: any) => {
			if (!value && this.BookingForm.get('pickup_airport')?.value) {
				this.clearAirportSelection('pickup_airport');
			}
		});

		this.BookingForm.get('dropoff_airport_option').valueChanges.subscribe((value: any) => {
			if (!value && this.BookingForm.get('dropoff_airport')?.value) {
				this.clearAirportSelection('dropoff_airport');
			}
		});

		this.BookingForm.get('return_pickup_airport_option').valueChanges.subscribe((value: any) => {
			if (!value && this.BookingForm.get('return_pickup_airport')?.value) {
				this.clearAirportSelection('return_pickup_airport');
			}
		});

		this.BookingForm.get('return_dropoff_airport_option').valueChanges.subscribe((value: any) => {
			if (!value && this.BookingForm.get('return_dropoff_airport')?.value) {
				this.clearAirportSelection('return_dropoff_airport');
			}
		});
		// Pickup Airport
		this.BookingForm.get('pickup_airport').valueChanges.subscribe((value: number) => {
			console.log("value in pickup_airport--->", value)
			if (value == 3283) {
				this.BookingForm.get('pickup_airline_option').clearValidators();
				this.BookingForm.get('pickup_airline_option').updateValueAndValidity();
				setTimeout(() => this.initAllAutocompletes(), 100);
			}
			if (value) {
				let airport_selected = this.BigData?.airportsData.find(item => item.id == value)
				const airport_display = this.Form.pickup_airport_option.value || this.getAirportDisplayValue(airport_selected);
				airport_selected && this.SetFormValue('pickup_airport_name', airport_display);
				airport_selected && this.SetFormValue('pickup_airport_latitude', this.Form.pickup_airport_latitude.value || airport_selected.lat);
				airport_selected && this.SetFormValue('pickup_airport_longitude', this.Form.pickup_airport_longitude.value || airport_selected.long);
				this.SetFormValue('return_dropoff_airport_option', airport_display);
				this.SetFormValue('return_dropoff_airport_name', this.Form.pickup_airport_name.value || airport_display);
				this.SetFormValue('return_dropoff_airport_latitude', this.Form.pickup_airport_latitude.value || airport_selected?.lat);
				this.SetFormValue('return_dropoff_airport_longitude', this.Form.pickup_airport_longitude.value || airport_selected?.long);
				this.SetFormValue('return_dropoff_airport', value);
				this.MapController();
				if (this.Form.service_type.value == 'round_trip') {
					setTimeout(() => {
						this.MapController(true);
					}, 2000);
				}
			}
		});

		// Pickup Airlines
		this.BookingForm.get('pickup_airline').valueChanges.subscribe((value: string) => {
			if (value) {
				let airline_selected = this.BigData?.airlinesData.find(item => item.id == value)
				this.SetFormValue('pickup_airline_name', airline_selected.formatted_name);
				this.SetFormValue('return_dropoff_airline_option', airline_selected);
				this.SetFormValue('return_dropoff_airline', value)
			}
		})

		// Dropoff Airport
		this.BookingForm.get('dropoff_airport').valueChanges.subscribe((value: string) => {
			if (value) {
				let airport_selected = this.BigData?.airportsData.find(item => item.id == value)
				const airport_display = this.Form.dropoff_airport_option.value || this.getAirportDisplayValue(airport_selected);
				airport_selected && this.SetFormValue('dropoff_airport_name', airport_display);
				airport_selected && this.SetFormValue('dropoff_airport_latitude', this.Form.dropoff_airport_latitude.value || airport_selected.lat)
				airport_selected && this.SetFormValue('dropoff_airport_longitude', this.Form.dropoff_airport_longitude.value || airport_selected.long)
				this.SetFormValue('return_pickup_airport_option', airport_display);
				this.SetFormValue('return_pickup_airport_name', this.Form.dropoff_airport_name.value || airport_display);
				this.SetFormValue('return_pickup_airport_latitude', this.Form.dropoff_airport_latitude.value || airport_selected?.lat);
				this.SetFormValue('return_pickup_airport_longitude', this.Form.dropoff_airport_longitude.value || airport_selected?.long);
				this.SetFormValue('return_pickup_airport', value)
				this.MapController()
				if (this.Form.service_type.value == 'round_trip') {
					setTimeout(() => {
						this.MapController(true)
					}, 2000)
				}
			}
		})

		// Dropoff Airlines
		this.BookingForm.get('dropoff_airline').valueChanges.subscribe((value: string) => {
			let airline_selected = this.BigData?.airlinesData.find(item => item.id == value)
			this.SetFormValue('dropoff_airline_name', airline_selected.formatted_name);
			this.SetFormValue('return_pickup_airline_option', airline_selected);
			this.SetFormValue('return_pickup_airline', value);
		})

		// Return Pickup Airport
		this.BookingForm.get('return_pickup_airport').valueChanges.subscribe((value: string) => {
			console.log("value in pickup_airport--->", value)
			if (value == '3283') {
				this.BookingForm.get('return_pickup_airline_option').clearValidators();
				this.BookingForm.get('return_pickup_airline_option').updateValueAndValidity();
				setTimeout(() => this.initAllAutocompletes(), 100);
			}
			if (value) {
				let airport_selected = this.BigData?.airportsData.find(item => item.id == value)
				const airport_display = this.Form.return_pickup_airport_option.value || this.getAirportDisplayValue(airport_selected);
				airport_selected && this.SetFormValue('return_pickup_airport_name', airport_display);
				airport_selected && this.SetFormValue('return_pickup_airport_latitude', this.Form.return_pickup_airport_latitude.value || airport_selected.lat);
				airport_selected && this.SetFormValue('return_pickup_airport_longitude', this.Form.return_pickup_airport_longitude.value || airport_selected.long);
				setTimeout(() => this.MapController(), 2000)
				if (this.Form.service_type.value == 'round_trip') {
					setTimeout(() => {
						this.MapController(true)
					}, 2000)
				}
			}
		})

		// Return Pickup Airlines
		this.BookingForm.get('return_pickup_airline').valueChanges.subscribe((value: string) => {
			if (value) {
				let airline_selected = this.BigData?.airlinesData.find(item => item.id == value)
				this.SetFormValue('return_pickup_airline_name', airline_selected.formatted_name);
			}
		})

		// Return Dropoff Airport
		this.BookingForm.get('return_dropoff_airport').valueChanges.subscribe((value: string) => {
			if (value) {
				let airport_selected = this.BigData?.airportsData.find(item => item.id == value);
				const airport_display = this.Form.return_dropoff_airport_option.value || this.getAirportDisplayValue(airport_selected);
				airport_selected && this.SetFormValue('return_dropoff_airport_name', airport_display);
				airport_selected && this.SetFormValue('return_dropoff_airport_latitude', this.Form.return_dropoff_airport_latitude.value || airport_selected.lat);
				airport_selected && this.SetFormValue('return_dropoff_airport_longitude', this.Form.return_dropoff_airport_longitude.value || airport_selected.long);
				setTimeout(() => this.MapController(), 2000)
				if (this.Form.service_type.value == 'round_trip') {
					setTimeout(() => {
						this.MapController(true)
					}, 2000)
				}
			}
		})

		// Return Dropoff Airlines
		this.BookingForm.get('return_dropoff_airline').valueChanges.subscribe((value: string) => {
			if (value) {
				let airline_selected = this.BigData?.airlinesData.find(item => item.id == value)
				this.SetFormValue('return_dropoff_airline_name', airline_selected.formatted_name);
			}
		})

		// Pickup Address
		this.BookingForm.get('pickup').valueChanges.subscribe((value: string) => {
			setTimeout(() => {
				this.SetFormValue('return_dropoff', value)
				this.SetFormValue('return_dropoff_latitude', this.Form.pickup_latitude.value)
				this.SetFormValue('return_dropoff_longitude', this.Form.pickup_longitude.value)
				this.MapController()
			}, 1000)
			if (this.Form.service_type.value == 'round_trip') {
				setTimeout(() => {
					this.MapController(true)
				}, 2000)
			}
		})

		// Dropoff Address
		this.BookingForm.get('dropoff').valueChanges.subscribe((value: string) => {
			setTimeout(() => {
				this.SetFormValue('return_pickup', value)
				this.SetFormValue('return_pickup_latitude', this.Form.dropoff_latitude.value)
				this.SetFormValue('return_pickup_longitude', this.Form.dropoff_longitude.value)
				this.MapController()
			}, 1000)
			if (this.Form.service_type.value == 'round_trip') {
				setTimeout(() => {
					this.MapController(true)
				}, 2000)
			}
		})
	}

	resetDriverAndVehicle(affiliate_type: string) {
		if (affiliate_type == 'loose_affiliate') {
			['vehicle_type', 'vehicle_id', 'vehicle_make', 'vehicle_model', 'vehicle_color', 'vehicle_year', 'driver_name', 'driver_email', 'driver_gender', 'driver_cell', 'vehicle_license_plate'].forEach((item: any) => {
				this.BookingForm.get(item).reset();
				this.BookingForm.updateValueAndValidity();
			})
			this.SetFormValue('driver_cell_isd', '+1');
			this.SetFormValue('driver_cell_country', 'us');
		}
	}

	RateFormValue(data: any) {
		// console.log('Rates Form: ', data)
		this.RatesForm = data
	}
	ReturnRateFormValue(data: any) {
		// console.log('Return Rates Form: ', data)
		this.ReturnRatesForm = data
	}
	HandleReturnNumberOfHr(data: any) {
		console.log('____<><><><><><><><>', data)
		this.BookingForm.get('number_of_hours').setValue(data)
	}

	// checkUniqueness() {
	// 	this.affiliateService.checkUniquePhoneNumberForLooseCustomer({
	// 		phoneISD: this.LooseCustomer.phone_isd.value,
	// 		phoneNumber: this.LooseCustomer.phone.value
	// 	}).pipe(
	// 		pluck('data'),
	// 		pluck('is_exist')
	// 	).subscribe((is_exist: boolean) => {
	// 		// console.log(is_exist)
	// 		this.is_loose_customer_unique = is_exist;
	// 		return
	// 	})
	// }

	// fillLooseCustomerAddress(value: any) {
	// 	(<FormGroup>this.BookingForm.get('loose_customer')).get('address').setValue(value);
	// 	(<FormGroup>this.BookingForm.get('loose_customer')).updateValueAndValidity();
	// 	this.BookingForm.updateValueAndValidity();
	// }

	fillLooseCustomerAddress(place: any) {
		console.log('Addresss-->>>', place);

		const looseCustomerGroup = <FormGroup>this.BookingForm.get('loose_customer');
		const formattedAddress = place?.formatted_address ?? '';
		const placeName = place?.name ?? '';
		const displayAddress = placeName ? `${placeName} - ${formattedAddress}` : formattedAddress;
		looseCustomerGroup.get('address').setValue(displayAddress);

		looseCustomerGroup.updateValueAndValidity();
		this.BookingForm.updateValueAndValidity();
	}



	onLCTeleCountryChange(event: any) {
		(<FormGroup>this.BookingForm.get('loose_customer')).get('phone_country').setValue(event.iso2);
		(<FormGroup>this.BookingForm.get('loose_customer')).get('phone_isd').setValue('+' + event.dialCode);
		this.BookingForm.updateValueAndValidity()
	}

	LCTelInputObject(event: any) {
		this.LCTelObject = event;
	}

	PaxTelInputObject(event: any) {
		this.PaxTelObject = event;
	}

	LATelInputObject(event: any) {
		this.LATelObject = event;
	}

	DrvTelInputObject(event: any) {
		this.DrvTelObject = event;
	}
	// addLineBreak(){
	// 	console.log('add line break __>>' , this.BookingForm.get('booking_instructions').value)
	// 	// this.BookingForm.patchValue({
	// 	// 	booking_instructions: this.BookingForm.get('booking_instructions').value +'\n'
	// 	// })
	// }

	EmailDomainValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			let value = control.value;
			console.log(value)
			if (!value) {
				return null
			}
			value = value.split('@')[1]
			let domain = value?.substring(value.indexOf('.') + 1)
			console.log(domain)
			const domains = ['com', 'net', 'in', 'co', 'uk', 'br', 'us']
			if (domains.includes(domain)) {
				return null
			}
			else if (domain?.includes('.')) {
				console.log(domain)
				return domain.split('.').every(item => domains.includes(item)) ? null : { domain: true }
			}
			else {
				return { domain: true }
			}
		}
	}

	change(event: any, form_control: string) {
		console.log(event, form_control)
		if (event?.id) {
			this.SetFormValue(form_control, event.id);
			return;
		}

		if (form_control.endsWith('_airport')) {
			this.clearAirportSelection(form_control);
			return;
		}

		if (form_control.endsWith('_airline')) {
			this.clearAirlineSelection(form_control);
			return;
		}

		this.setControlValue(form_control, '');
	}
	tConvert(time) {
		// Check correct time format and split into components
		time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

		if (time.length > 1) { // If time format correct
			time = time.slice(1);  // Remove full string match value
			time[5] = +time[0] < 12 ? ' am' : ' pm'; // Set AM/PM
			time[0] = +time[0] % 12 || 12; // Adjust hours
		}
		return time.join(''); // return adjusted time or original string
	}
	FormatTime(time: string) {
		return moment(time, "HH:mm:ss").format("LT");
	}

	iOS() {
		return [
			'iPad Simulator',
			'iPhone Simulator',
			'iPod Simulator',
			'iPad',
			'iPhone',
			'iPod'
		].includes(navigator.platform)
			// iPad on iOS 13 detection
			|| (navigator.userAgent.includes("Mac") && "ontouchend" in document)
	}


	showLocationPointOnMap(address: any) {
		let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
		console.log('isSafari', isSafari)
		this.$spinner.show()
		this.$spinner.hide();
		if (address) {
			let googleDirectionUrl;
			let iosDirectionUrl;
			googleDirectionUrl = 'https://www.google.com/maps/dir/?api=1' + '&destination=' +
				encodeURIComponent(address) + '&travelmode=driving'
			iosDirectionUrl = 'http://maps.apple.com/?daddr=' +
				encodeURIComponent(address)
			if (this.iOS()) {
				setTimeout(() => {
					window.location.href = iosDirectionUrl;
				})
			}
			else {
				window.open(googleDirectionUrl, '_blank');
			}
		} else {
			throw new Error('Error: Location Points Not Specified Properly. ');
		}
	}

	setValueByBookNow() {
		let QB: any = JSON.parse(localStorage.getItem('quotebot_form'))
		// for (const key in QB) {
		//   console.log(`QB______${key}: ${QB[key]}`);
		//   this.SetFormValue(key ,QB[key])
		// }    
		this.SetFormValue('service_type', QB?.service_type)
		if (QB?.service_type == "charter_tour") {
			console.log('setttttttttttttttttttt', QB?.service_type)
			this.SetFormValue('number_of_hours', QB?.booking_hour)
		}
		let transfer_type_value = QB?.pickup_type + '_to_' + QB?.dropoff_type
		let return_transfer_type_value = QB?.dropoff_type + '_to_' + QB?.pickup_type
		this.SetFormValue('transfer_type', transfer_type_value)
		this.SetFormValue('return_transfer_type', return_transfer_type_value)
		this.SetFormValue('total_passengers', QB?.no_of_luggage)
		this.SetFormValue('luggage_count', QB?.no_of_passenger)
		//pickup
		this.SetFormValue('pickup_date', QB?.pickup_date)
		this.SetFormValue('pickup', QB?.pickup_address)
		this.SetFormValue('pickup_latitude', QB?.pickup_address_lat)
		this.SetFormValue('pickup_longitude', QB?.pickup_address_long)
		this.fillAddress('pickup', QB?.pickup_address)
		this.fillLocationPoints('pickup', QB?.pickup_address)
		const matchedPickupAirport = this.resolveInternalAirportRecord({
			name: QB?.other_details?.pickup_airport_name,
			formatted_address: QB?.other_details?.pickup_airport_name
		}, QB?.pickup_airport_lat, QB?.pickup_airport_long);
		const matchedDropoffAirport = this.resolveInternalAirportRecord({
			name: QB?.other_details?.dropoff_airport_name,
			formatted_address: QB?.other_details?.dropoff_airport_name
		}, QB?.dropoff_airport_lat, QB?.dropoff_airport_long);
		const matchedReturnPickupAirport = this.resolveInternalAirportRecord({
			name: QB?.other_details?.return_pickup_airport_name,
			formatted_address: QB?.other_details?.return_pickup_airport_name
		}, QB?.return_pickup_airport_lat, QB?.return_pickup_airport_long);
		const matchedReturnDropoffAirport = this.resolveInternalAirportRecord({
			name: QB?.other_details?.return_dropoff_airport_name,
			formatted_address: QB?.other_details?.return_dropoff_airport_name
		}, QB?.return_dropoff_airport_lat, QB?.return_dropoff_airport_long);
		this.applyQuoteBotAirportPrefill('pickup', QB?.other_details?.pickup_airport_name, QB?.pickup_airport_lat, QB?.pickup_airport_long, QB?.pickup_airport, matchedPickupAirport)

		//dropOFF
		this.SetFormValue('dropoff', QB?.dropoff_address)
		this.SetFormValue('dropoff_latitude', QB?.dropoff_address_lat)
		this.SetFormValue('dropoff_longitude', QB?.dropoff_address_long)
		this.applyQuoteBotAirportPrefill('dropoff', QB?.other_details?.dropoff_airport_name, QB?.dropoff_airport_lat, QB?.dropoff_airport_long, QB?.dropoff_airport, matchedDropoffAirport)


		//return pickup
		this.SetFormValue('return_pickup_date', QB?.return_pickup_date)
		this.SetFormValue('return_pickup', QB?.return_pickup_address ?? QB?.return_dropoff_address)
		this.SetFormValue('return_pickup_latitude', QB?.return_pickup_address_lat ?? QB?.return_dropoff_address_lat)
		this.SetFormValue('return_pickup_longitude', QB?.return_pickup_address_long ?? QB?.return_dropoff_address_long)
		this.applyQuoteBotAirportPrefill('return_pickup', QB?.other_details?.return_pickup_airport_name, QB?.return_pickup_airport_lat, QB?.return_pickup_airport_long, QB?.return_pickup_airport, matchedReturnPickupAirport)

		//return dropOff
		this.SetFormValue('return_dropoff', QB?.return_dropoff_address)
		this.SetFormValue('return_dropoff_latitude', QB?.return_dropoff_address_lat)
		this.SetFormValue('return_dropoff_longitude', QB?.return_dropoff_address_long)
		this.applyQuoteBotAirportPrefill('return_dropoff', QB?.other_details?.return_dropoff_airport_name, QB?.return_dropoff_airport_lat, QB?.return_dropoff_airport_long, QB?.return_dropoff_airport, matchedReturnDropoffAirport)

		this.SetFormValue('pickup_time', this.FormatTime(QB?.pickup_time))
		this.SetFormValue('return_pickup_time', this.FormatTime(QB?.return_pickup_time))
		this.SetFormValue('cruise_time', this.FormatTime(QB?.pickup_time))
		this.SetFormValue('return_cruise_time', this.FormatTime(QB?.return_pickup_time))
		// this.MapController()
		// this.MapController(true)
		setTimeout(() => {
			console.log('settimeout finction---------------------------------------------------------------')
			// this.fetchQBAffiliateVehicles(selected_vehicle?.affiliate_id)
			this.fetchAffiliateDrivers(this.BookingForm.get('affiliate_id').value)
		}, 5000)
		this.syncAirportPayloadFields();
	}

	// numbers in red and seperated to next line
	highlightNumbers(text: string): string {
		const parts = text.split(/\b(\d+\.\s)/); // Split by number followed by dot and space

		// Process parts and apply formatting
		let formattedText = '';
		for (let i = 0; i < parts.length; i++) {
			if (i % 2 === 0) {
				formattedText += parts[i]; // Regular text part
			} else {
				formattedText += `<br><span class="text-danger font-weight-bolder">${parts[i]}</span>`; // Numbered instruction part
			}
		}

		return formattedText;
	}


	private addCustomCountrySearch(element: HTMLElement) {
		element.addEventListener('open:countrydropdown', () => {
			const container = element.closest('.iti');
			const dropdown = container?.querySelector('.iti__country-list');
			if (!dropdown) return;

			// Check if search already exists
			if (dropdown.querySelector('.iti-search-input')) return;

			// Create search container
			const searchContainer = document.createElement('div');
			searchContainer.className = 'iti-search-container';

			// Create search input
			const searchInput = document.createElement('input');
			searchInput.type = 'text';
			searchInput.className = 'iti-search-input';
			searchInput.placeholder = 'Search country...';

			searchContainer.appendChild(searchInput);

			// Prevent dropdown from closing when interacting with search
			searchInput.addEventListener('click', (e) => e.stopPropagation());
			searchInput.addEventListener('keydown', (e) => e.stopPropagation());

			// Insert at top of dropdown
			dropdown.insertBefore(searchContainer, dropdown.firstChild);

			// Focus on search
			setTimeout(() => searchInput.focus(), 100);

			// Filter countries on input
			searchInput.addEventListener('input', (e: any) => {
				e.stopPropagation();
				const searchTerm = e.target.value.toLowerCase();
				const countries = dropdown.querySelectorAll('.iti__country');
				let hasVisible = false;

				countries.forEach((country: any) => {
					// Search in the full text (Name + Dial Code)
					const text = country.textContent?.toLowerCase() || '';

					if (text.includes(searchTerm)) {
						country.classList.remove('iti__hide');
						country.style.display = 'block'; // Force show
						hasVisible = true;
					} else {
						country.classList.add('iti__hide');
						country.style.display = 'none'; // Force hide
					}
				});

				// Handle No Results
				let noResults = dropdown.querySelector('.iti-no-results');
				if (!noResults) {
					noResults = document.createElement('div');
					noResults.className = 'iti-no-results';
					noResults.textContent = 'No results found';
					dropdown.appendChild(noResults);
				}

				if (!hasVisible && searchTerm) {
					(noResults as HTMLElement).style.display = 'block';
				} else {
					(noResults as HTMLElement).style.display = 'none';
				}

				// Show all if search is empty
				if (!searchTerm) {
					countries.forEach((country: any) => {
						country.classList.remove('iti__hide');
						country.style.display = 'block';
					});
					(noResults as HTMLElement).style.display = 'none';
				}
			});
		});
	}
}
