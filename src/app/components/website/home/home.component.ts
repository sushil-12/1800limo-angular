import { Component, OnInit, OnDestroy, ViewChild, ElementRef, NgZone, HostListener, AfterViewInit } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';
import { FormGroup, FormControl, FormBuilder, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { WebsiteService } from '../../../services/website.service';
import { AuthService } from '../../../services/auth.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { ErrorDialogService } from '../../../services/error-dialog/errordialog.service';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { NgxSpinnerService } from "ngx-spinner";
import { QuotebotService } from '../../../services/quotebot.service';
import { SharedModule } from '../../../components/shared/shared.module';
import { attachPlaceAutocompleteElement, clearPlaceAutocompleteDisplay, getPlaceAutocompleteDisplayValue, syncPlaceAutocompleteDisplay } from '../../../utils/google-place-autocomplete';
// data for select fields
import { constant_data } from '../../../../assets/js/data.js'
import * as moment from 'moment';
import { Swiper } from 'swiper';
import { Navigation, Autoplay, Pagination } from 'swiper/modules';


declare var $: any;

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy, AfterViewInit {
	@ViewChild('addressinput') addressinput!: ElementRef;
	@ViewChild('dropaddressinput') dropaddressinput!: ElementRef;
	@ViewChild('retaddressinput') retaddressinput!: ElementRef;
	@ViewChild('retdropaddressinput') retdropaddressinput!: ElementRef;
	@ViewChild('airportinput') airportinput!: ElementRef;
	@ViewChild('dropairportinput') dropairportinput!: ElementRef;
	@ViewChild('retairportinput') retairportinput!: ElementRef;
	@ViewChild('retdropairportinput') retdropairportinput!: ElementRef;
	@ViewChild('clientLogoContainer') clientLogoContainer!: ElementRef;

	clientLogoSwiper: Swiper | null = null;

	vehicles: any;
	vehiclesRes: any;
	minDate = new Date();
	currentUser: any;
	modalHeading: string;
	modalInstructions: string;
	modalType: string;
	modalInformation: boolean = true;
	selectedModal: string;
	steps: any = "";
	accountStatus: any = "";
	value: any;
	splitSteps: any;
	public innerWidth: any;
	oneWayAddress: boolean = false;
	roundTripAddress: boolean = false;
	showAppStorePopup: boolean = false;

	countriesList: Array<String> = constant_data.countries
	PersonalilzedList: Array<String> = constant_data.personallist
	hour_values: Array<any> = constant_data.hour_values
	time_values: Array<any> = constant_data.time_values

	// PersonalilzedList
	PersonalilzedList1: Array<String>;
	PersonalilzedList2: Array<String>;

	// countriesList
	countriesList1: Array<String>;
	countriesList2: Array<String>;
	countriesList3: Array<String>;
	countriesListData1: Array<String>;
	countriesListData2: Array<String>;

	airports_data: Array<any>
	airports_data_copy: Array<any>
	airports_data_pickup: Array<any>
	airports_data_dropoff: Array<any>
	airports_data_r_pickup: Array<any>
	airports_data_r_dropoff: Array<any>
	address_data_pickup: Array<any> = []
	address_data_dropoff: Array<any> = []
	address_data_r_pickup: Array<any> = []
	address_data_r_dropoff: Array<any> = []
	activeAirportDropdown: string | null = null;
	activeAddressDropdown: string | null = null;
	private airportDropdownBlurTimeout?: ReturnType<typeof setTimeout>;
	private addressDropdownBlurTimeout?: ReturnType<typeof setTimeout>;
	private airportPlacesService?: google.maps.places.PlacesService;
	private addressPlacesService?: google.maps.places.PlacesService;
	private airportSearchRequestVersion: Record<string, number> = {};
	private addressSearchRequestVersion: Record<string, number> = {};
	private airportSearchLoadingState: Record<string, boolean> = {};
	private addressSearchLoadingState: Record<string, boolean> = {};
	private locationRequestVersionByField: Record<string, number> = {};
	private airportSearchDebounceTimers: Record<string, ReturnType<typeof setTimeout>> = {};
	private airportAutocompleteSessionTokens: Record<string, string> = {};

	//For reactive form
	quoteBotForm: FormGroup;
	roundForm: FormGroup;
	charterTourForm: FormGroup;
	getInTouchForm: FormGroup;
	submitted = false;


	homePageData: any;
	checkdata: any;
	clientImages: any[] = [];
	isHomePageLoading: boolean = true;
	time_value_for_phone_only: string

	vars: Object = {}
	desktopWidth: any;

	// Step rotation properties for "How Works" section
	currentActiveStep: number = 1;
	stepRotationInterval: any;
	progressWidth: number = 25; // Progress line width percentage
	private quoteBotAutofillSyncInterval?: ReturnType<typeof setInterval>;
	private quoteBotAutocompleteRetryTimeout?: ReturnType<typeof setTimeout>;


	constructor(
		private ngZone: NgZone,
		private formBuilder: FormBuilder,
		private router: Router,
		private websiteService: WebsiteService,
		private stateManagementService: StateManagementService,
		private spinner: NgxSpinnerService,
		private authService: AuthService,
		private errorDialogService: ErrorDialogService,
		private quotebotService: QuotebotService,
		private globalFunctions: SharedModule,
		private elementRef: ElementRef,
		private titleService: Title,
		private metaService: Meta
	) { }
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

	validateInputLimit(event: any) {
		const value = parseInt(event.target.value);
		if (value > 100) {
			event.target.value = 100;
			this.quoteBotForm.get(event.target.getAttribute('formControlName'))?.setValue(100);
		}
	}
	//google map autocomplete
	title: string = 'AGM project';
	latitude: number;
	longitude: number;
	zoom: number;
	address: string;
	isVehicleLoading = true;

	ngOnInit() {
		this.spinner.hide();
		this.spinner.hide('fetchspinner');
		this.spinner.hide('normalspinner');
		this.spinner.hide('savespinner');

		// Set SEO Metadata for Home Page matching index.html
		this.titleService.setTitle('1800 Limo - Premium Chauffeur & Luxury Transportation Services');
		this.metaService.updateTag({ name: 'description', content: '1800 Limo offers premium chauffeur services, luxury vehicle hire, and airport transfers worldwide. Book your ride today.' });
		this.metaService.updateTag({ name: 'keywords', content: 'limo service, chauffeur service, luxury transportation, airport transfer, 1800 limo' });

		// Open Graph
		this.metaService.updateTag({ property: 'og:title', content: '1800 Limo - Premium Chauffeur & Luxury Transportation Services' });
		this.metaService.updateTag({ property: 'og:description', content: '1800 Limo offers premium chauffeur services, luxury vehicle hire, and airport transfers worldwide.' });
		this.metaService.updateTag({ property: 'og:type', content: 'website' });
		this.metaService.updateTag({ property: 'og:url', content: 'https://www.1800limo.com' });
		this.metaService.updateTag({ property: 'og:site_name', content: '1800 Limo' });

		// Twitter Card
		this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
		this.metaService.updateTag({ name: 'twitter:title', content: '1800 Limo - Premium Chauffeur & Luxury Transportation Services' });
		this.metaService.updateTag({ name: 'twitter:description', content: '1800 Limo offers premium chauffeur services, luxury vehicle hire, and airport transfers worldwide.' });

		this.isVehicleLoading = true;
		try {
			const elementsWithTabIndex = document.querySelectorAll('[tabindex]');

			// Add event listeners for focus and blur events to each element
			console.log('home-- elementsWithTabIndex-->', elementsWithTabIndex)
			elementsWithTabIndex?.forEach((element) => {
				element.addEventListener('focus', () => {
					element.classList.add('focus-border'); // Add the focus-border class on focus
					setTimeout(() => {
						element.classList.remove('focus-border');
					}, 1500)
				});

				element.addEventListener('blur', () => {
					element.classList.remove('focus-border'); // Remove the focus-border class on blur (when focus is lost)
				});
			});
		} catch (error) {
			console.log(error)
		}


		this.fetchAirportsData()

		setTimeout(() => {

			$('[data-toggle="modal"]').tooltip();//Bootstrap tooltip

		}, 500);
		this.innerWidth = window.innerWidth; //window inner width

		$('#countriestooltip').tooltip();//Bootstrap tooltip
		// // hide tooltip in Mobile View
		$(".showCountries").click(function () {
			$(this).tooltip('hide');
		});

		this.currentUser = this.stateManagementService.getUser()

		this.steps = localStorage.getItem("stepCompleted");
		this.accountStatus = localStorage.getItem("account_approval");

		if (this.accountStatus == "completed" || this.accountStatus == "accepted") {
			this.value = "Manage Bookings";
		}
		else {
			this.value = "Continue Affiliate Set-Up";
		}

		// PersonalilzedList
		const halfPersonalized = Math.ceil(this.PersonalilzedList.length / 2);
		this.PersonalilzedList1 = this.PersonalilzedList.splice(0, halfPersonalized);
		this.PersonalilzedList2 = this.PersonalilzedList.splice(-halfPersonalized);

		// Display CountryList
		if (this.innerWidth >= 767) {
			console.log(this.innerWidth, 'fall in above 767')
			// countriesList for desktop    
			const oneThirdCountries = Math.ceil(this.countriesList.length / 3);
			this.countriesList3 = this.countriesList.splice(-oneThirdCountries);
			this.countriesList2 = this.countriesList.splice(-oneThirdCountries);
			this.countriesList1 = this.countriesList;
		}
		else {
			console.log(this.innerWidth, 'fall in below 767')
			// countriesList for mobile 
			const halfCountries = Math.ceil(this.countriesList.length / 2);
			this.countriesListData1 = this.countriesList.splice(0, halfCountries);
			this.countriesListData2 = this.countriesList.splice(-halfCountries);

		}


		this.initialiseQuotebot()  	// initialise Quote Bot
		//Get In Touch Form
		this.getInTouchForm = this.formBuilder.group({
			getInTouchName: ['', Validators.required],
			getInTouchEmail: ['', [Validators.required, Validators.pattern(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i)]],
			getInTouchMessage: ['', Validators.required]
		});

		// Load Our vehicles using API
		this.websiteService.getOurVehicles().then(result => {
			console.log(this.isVehicleLoading, "consoell")
			this.vehiclesRes = result;
			this.vehicles = this.vehiclesRes.data;

			// Initialize vehicle carousel after data is loaded
			setTimeout(() => {
				this.initVehicleCarousel();
				this.isVehicleLoading = false;
			});
		});

		// Client carousel will be initialized in fetchHomePageData() after data loads
		this.fetchHomePageData();
		this.Subscriptions();


		// $('.scrollDownButton').css('left', '3px');
		// $('.scrollDownButton').css('right', '');
		// $('.scrollTopButton').css('left', '3px');
		// $('.scrollTopButton').css('right', '');

	}

	// ngOnInit() ends
	ngAfterViewInit(): void {
		this.desktopWidth = window.innerWidth;
		if (this.desktopWidth <= '767') {
			//google translate
			console.log('-----google translate element for mobile view-------->>>>')
			var v = document.createElement("script");
			v.type = "text/javascript";
			v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en',layout: google.translate.TranslateElement.InlineLayout.VERTICAL}, 'google_translate_element_home_mobile'); } ";
			this.elementRef.nativeElement.appendChild(v);
			var s = document.createElement("script");
			s.type = "text/javascript";
			s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
			this.elementRef.nativeElement.appendChild(s);

			$('.goog-te-gadget').html($('.goog-te-gadget').children());
			$("#google-translate").fadeIn('1000');


			function cleartimer() {
				setTimeout(function () {
					window.clearInterval(myVar);
				}, 500);
			}
			function myTimer() {
				if ($('.goog-te-combo option:first').length) {
					$('.goog-te-combo option:first').html('English');
					cleartimer();
				}
			}
			var myVar = setInterval(function () { myTimer() }, 0);
		}

		if (this.desktopWidth > '767') {
			//google translate
			console.log('<<<<<<<-------select language------>>>>>>>>')
			var v = document.createElement("script");
			v.type = "text/javascript";
			v.innerHTML = "function googleTranslateElementInit() { new google.translate.TranslateElement({ pageLanguage: 'en', autoDisplay: false, layout: google.translate.TranslateElement.InlineLayout.VERTICAL }, 'google_translate_element_home_desktop'); } ";
			this.elementRef.nativeElement.appendChild(v);
			var s = document.createElement("script");
			s.type = "text/javascript";
			s.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
			this.elementRef.nativeElement.appendChild(s);
			$('.goog-te-gadget').html($('.goog-te-gadget').children());
			$("#google-translate").fadeIn('1000');


			function cleartimer() {
				setTimeout(function () {
					window.clearInterval(myVar);
				}, 500);
			}
			function myTimer() {
				if ($('.goog-te-combo option:first').length) {
					$('.goog-te-combo option:first').html('English');
					cleartimer();
				}
			}
			var myVar = setInterval(function () { myTimer() }, 0);

		}
		this.retryGoogleAutocompleteInitialization()

		// Fix for Browser Autofill suppressing events:
		// Periodically check native inputs and sync with Angular Reactive Form if populated natively
		this.ngZone.runOutsideAngular(() => {
			this.quoteBotAutofillSyncInterval = setInterval(() => {
				let changed = false;
				const checkAndSync = (inputRef: ElementRef, controlName: string) => {
					if (inputRef && inputRef.nativeElement) {
						const control = this.quoteBotForm?.get(controlName);
						const rawNativeValue = inputRef.nativeElement.value || '';
						if (!rawNativeValue.trim() && !(control?.value || '').toString().trim()) {
							clearPlaceAutocompleteDisplay(inputRef.nativeElement);
							return;
						}
						const nativeVal = getPlaceAutocompleteDisplayValue(inputRef.nativeElement);
						if (nativeVal && inputRef.nativeElement.value !== nativeVal) {
							inputRef.nativeElement.value = nativeVal;
							changed = true;
						}
						if (control && nativeVal && control.value !== nativeVal) {
							control.setValue(nativeVal, { emitEvent: false });
							changed = true;
						}
					}
				};

				checkAndSync(this.addressinput, 'pickup_address');
				checkAndSync(this.dropaddressinput, 'dropoff_address');
				checkAndSync(this.retaddressinput, 'return_pickup_address');
				checkAndSync(this.retdropaddressinput, 'return_dropoff_address');
				checkAndSync(this.airportinput, 'pickup_airport_name');
				checkAndSync(this.dropairportinput, 'dropoff_airport_name');
				checkAndSync(this.retairportinput, 'return_pickup_airport_name');
				checkAndSync(this.retdropairportinput, 'return_dropoff_airport_name');

				if (changed) {
					this.ngZone.run(() => {
						this.quoteBotForm.updateValueAndValidity();
					});
				}
			}, 100);
		});
	}

	private retryGoogleAutocompleteInitialization(attempts = 8, delay = 250): void {
		if (this.quoteBotAutocompleteRetryTimeout) {
			clearTimeout(this.quoteBotAutocompleteRetryTimeout);
		}

		const tryAttach = (remainingAttempts: number) => {
			const googleReady = typeof google !== 'undefined' && !!google?.maps;
			const hasAnyAddressInput =
				!!this.addressinput?.nativeElement ||
				!!this.dropaddressinput?.nativeElement ||
				!!this.retaddressinput?.nativeElement ||
				!!this.retdropaddressinput?.nativeElement ||
				!!this.airportinput?.nativeElement ||
				!!this.dropairportinput?.nativeElement ||
				!!this.retairportinput?.nativeElement ||
				!!this.retdropairportinput?.nativeElement;

			if (googleReady && hasAnyAddressInput) {
				this.initializeallloadGoogleAutocomplete();
				return;
			}

			if (remainingAttempts > 1) {
				this.quoteBotAutocompleteRetryTimeout = setTimeout(() => {
					tryAttach(remainingAttempts - 1);
				}, delay);
			}
		};

		tryAttach(attempts);
	}

	loadGoogleAutocomplete(input: HTMLInputElement, fieldName: string) {
		// test thing
		console.log("in loadf auto complete", input, fieldName)
		void attachPlaceAutocompleteElement(
			input,
			{
				types: ['geocode', 'establishment'],
				fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components', 'types'],
				syncControl: this.quoteBotForm?.get(fieldName) ?? undefined,
			},
			(place) => {
				this.ngZone.run(() => {
					const geometryLocation = place.geometry?.location;
					if (!geometryLocation) {
						this.SetFormValue(fieldName, '');
						this.SetFormValue(`${fieldName}_lat`, '');
						this.SetFormValue(`${fieldName}_long`, '');
						return;
					}

					const formattedAddress = place.formatted_address ?? '';
					const placeName = place.name ?? '';
					const displayAddress = placeName ? `${placeName} - ${formattedAddress}` : formattedAddress;

					const location = {
						formatted_address: formattedAddress,
						display_address: displayAddress,
						latitude: geometryLocation.lat(),
						longitude: geometryLocation.lng()
					};

					this.onAutocompleteSelected(location, fieldName);
					this.onLocationSelected(location, fieldName);
				});
			}
		);
	}

	loadGoogleAirportAutocomplete(input: HTMLInputElement, fieldName: string) {
		void attachPlaceAutocompleteElement(
			input,
			{
				airportField: true,
				primaryTypes: ['airport'],
				fields: ['formatted_address', 'geometry', 'place_id', 'name', 'address_components', 'types'],
				syncControl: this.quoteBotForm?.get(`${fieldName}_name`) ?? undefined,
			},
			(place) => {
				this.ngZone.run(() => {
					const geometryLocation = place.geometry?.location;
					if (!geometryLocation) {
						this.clearAirportSelection(fieldName);
						return;
					}

					const formattedAddress = place.formatted_address ?? '';
					const placeName = (place.name ?? '').trim();
					const airportDisplayName = this.getAirportSelectionLabel(placeName, formattedAddress);

					this.onAirportSelected({
						id: place.place_id ?? '',
						name: airportDisplayName,
						latitude: geometryLocation.lat(),
						longitude: geometryLocation.lng()
					}, fieldName);
				});
			}
		);
	}

	getAirportSelectionLabel(placeName: string, formattedAddress: string): string {
		const normalizedName = String(placeName || '').trim();
		const normalizedAddress = String(formattedAddress || '').trim();

		if (normalizedName && normalizedAddress) {
			if (normalizedAddress === normalizedName || normalizedAddress.startsWith(`${normalizedName} - `)) {
				return normalizedAddress;
			}
			return `${normalizedName} - ${normalizedAddress}`;
		}

		return normalizedName || normalizedAddress;
	}

	shouldShowAddressClear(inputRef: ElementRef | HTMLInputElement | undefined, controlName: string): boolean {
		const controlValue = this.quoteBotForm?.get(controlName)?.value;
		const nativeInput = inputRef instanceof ElementRef ? inputRef.nativeElement : inputRef;
		const visibleValue = getPlaceAutocompleteDisplayValue(nativeInput) || nativeInput?.value || '';

		return !!String(controlValue || visibleValue || '').trim();
	}

	getAirportPanelWidth(inputRef: HTMLInputElement | null | undefined): number | undefined {
		const fieldContainer = inputRef?.closest('.input-contain--airport') as HTMLElement | null;
		return fieldContainer?.offsetWidth || inputRef?.offsetWidth || undefined;
	}

	onAutocompleteSelected(location: any, fieldName: string) {
		this.SetFormValue(fieldName, location.display_address ?? location.formatted_address);
		if (this.QBForm?.service_type?.value === 'round_trip' && !fieldName.includes('return_')) {
			this.fillReturnDetails();
		}
	}

	onLocationSelected(location: any, fieldName: string) {
		this.SetFormValue(`${fieldName}_lat`, location.latitude);
		this.SetFormValue(`${fieldName}_long`, location.longitude);
		if (this.QBForm?.service_type?.value === 'round_trip' && !fieldName.includes('return_')) {
			this.fillReturnDetails();
		}
	}

	initializeallloadGoogleAutocomplete() {
		this.scheduleQuoteBotAutocompleteDisplaySync();
	}

	getAddressOptions(fieldName: string): Array<any> {
		switch (fieldName) {
			case 'pickup_address':
				return this.address_data_pickup || [];
			case 'dropoff_address':
				return this.address_data_dropoff || [];
			case 'return_pickup_address':
				return this.address_data_r_pickup || [];
			case 'return_dropoff_address':
				return this.address_data_r_dropoff || [];
			default:
				return [];
		}
	}

	isAddressDropdownOpen(fieldName: string): boolean {
		return this.activeAddressDropdown === fieldName;
	}

	private hasResolvedAirportSelection(fieldName: string): boolean {
		const selectedId = this.quoteBotForm?.get(fieldName)?.value;
		const displayValue = String(this.quoteBotForm?.get(`${fieldName}_name`)?.value || '').trim();
		const latitude = this.quoteBotForm?.get(`${fieldName}_lat`)?.value;
		const longitude = this.quoteBotForm?.get(`${fieldName}_long`)?.value;

		return !!selectedId
			&& !!displayValue
			&& latitude !== ''
			&& latitude !== null
			&& latitude !== undefined
			&& longitude !== ''
			&& longitude !== null
			&& longitude !== undefined;
	}

	private getResolvedAirportDropdownOption(fieldName: string): any | null {
		if (!this.hasResolvedAirportSelection(fieldName)) {
			return null;
		}

		const selectedId = this.quoteBotForm?.get(fieldName)?.value;
		const displayValue = String(this.quoteBotForm?.get(`${fieldName}_name`)?.value || '').trim();
		const latitude = this.quoteBotForm?.get(`${fieldName}_lat`)?.value;
		const longitude = this.quoteBotForm?.get(`${fieldName}_long`)?.value;

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

	getVisibleAirportOptions(fieldName: string): Array<any> {
		const options = this.getAirportOptions(fieldName);
		if (options?.length) {
			return options;
		}

		const selectedOption = this.getResolvedAirportDropdownOption(fieldName);
		return selectedOption ? [selectedOption] : [];
	}

	isAirportSearchLoading(fieldName: string): boolean {
		return !!this.airportSearchLoadingState[fieldName];
	}

	private setAirportSearchLoading(fieldName: string, isLoading: boolean): void {
		this.airportSearchLoadingState[fieldName] = isLoading;
	}

	shouldShowAirportLoadingState(fieldName: string): boolean {
		return this.isAirportDropdownOpen(fieldName) && this.isAirportSearchLoading(fieldName);
	}

	shouldShowAirportEmptyState(fieldName: string): boolean {
		const currentValue = String(this.quoteBotForm?.get(`${fieldName}_name`)?.value || '').trim();
		return this.isAirportDropdownOpen(fieldName)
			&& !!currentValue
			&& !this.isAirportSearchLoading(fieldName)
			&& !this.hasResolvedAirportSelection(fieldName)
			&& !this.getVisibleAirportOptions(fieldName)?.length;
	}

	shouldShowAirportPromptState(fieldName: string): boolean {
		const currentValue = String(this.quoteBotForm?.get(`${fieldName}_name`)?.value || '').trim();
		return this.isAirportDropdownOpen(fieldName) && !currentValue;
	}

	shouldShowAddressEmptyState(fieldName: string): boolean {
		const currentValue = String(this.quoteBotForm?.get(fieldName)?.value || '').trim();
		return this.isAddressDropdownOpen(fieldName)
			&& !!currentValue
			&& !this.isAddressSearchLoading(fieldName)
			&& !this.getAddressOptions(fieldName)?.length;
	}

	shouldShowAddressPromptState(fieldName: string): boolean {
		const currentValue = String(this.quoteBotForm?.get(fieldName)?.value || '').trim();
		return this.isAddressDropdownOpen(fieldName) && !currentValue;
	}

	private clearAddressDropdownBlurTimer(): void {
		if (this.addressDropdownBlurTimeout) {
			clearTimeout(this.addressDropdownBlurTimeout);
			this.addressDropdownBlurTimeout = undefined;
		}
	}

	openAddressDropdown(fieldName: string): void {
		this.clearAddressDropdownBlurTimer();
		this.activeAddressDropdown = fieldName;
		void this.searchAddress(this.quoteBotForm.get(fieldName)?.value || '', fieldName);
	}

	closeAddressDropdown(fieldName?: string): void {
		this.clearAddressDropdownBlurTimer();
		if (!fieldName || this.activeAddressDropdown === fieldName) {
			this.activeAddressDropdown = null;
		}
	}

	onAddressFieldFocus(fieldName: string, input?: HTMLInputElement): void {
		if (!this.isTouchAirportInteraction()) {
			input?.select();
		}
		this.openAddressDropdown(fieldName);
	}

	onAddressFieldBlur(fieldName: string): void {
		this.clearAddressDropdownBlurTimer();
		this.addressDropdownBlurTimeout = setTimeout(() => {
			this.closeAddressDropdown(fieldName);
		}, 150);
	}

	private clearAddressResolvedSelection(fieldName: string): void {
		this.SetFormValue(`${fieldName}_lat`, '');
		this.SetFormValue(`${fieldName}_long`, '');

		if (fieldName === 'pickup_address') {
			this.SetFormValue('return_dropoff_address', '');
			this.SetFormValue('return_dropoff_address_lat', '');
			this.SetFormValue('return_dropoff_address_long', '');
		} else if (fieldName === 'dropoff_address') {
			this.SetFormValue('return_pickup_address', '');
			this.SetFormValue('return_pickup_address_lat', '');
			this.SetFormValue('return_pickup_address_long', '');
		}
	}

	onAddressFieldInput(value: string, fieldName: string): void {
		this.clearAddressDropdownBlurTimer();
		this.openAddressDropdown(fieldName);
		this.clearAddressResolvedSelection(fieldName);
		void this.searchAddress(value || '', fieldName);
	}

	async selectAddressOption(address: any, fieldName: string): Promise<void> {
		this.clearAddressDropdownBlurTimer();
		const googleAddress = await this.fetchGoogleAddressDetails(address?.placeId);
		if (googleAddress) {
			this.onAutocompleteSelected(googleAddress, fieldName);
			this.onLocationSelected(googleAddress, fieldName);
		}
		this.closeAddressDropdown(fieldName);
	}

	getAddressOptionLabel(address: any): string {
		const normalizedName = String(address?.name || '').trim();
		if (normalizedName) {
			return normalizedName;
		}

		const description = String(address?.description || '').trim();
		if (description) {
			return description.split(',')[0]?.trim() || description;
		}

		return '';
	}

	getAddressOptionSecondaryText(address: any): string {
		const secondaryText = String(address?.secondaryText || '').trim();
		if (secondaryText) {
			return secondaryText;
		}

		const description = String(address?.description || '').trim();
		if (description) {
			const parts = description.split(',').map((part: string) => part.trim()).filter(Boolean);
			if (parts.length > 1) {
				return parts.slice(1).join(', ');
			}
		}

		return '';
	}

	private setAddressOptions(fieldName: string, options: Array<any>): void {
		switch (fieldName) {
			case 'pickup_address':
				this.address_data_pickup = options;
				break;
			case 'dropoff_address':
				this.address_data_dropoff = options;
				break;
			case 'return_pickup_address':
				this.address_data_r_pickup = options;
				break;
			case 'return_dropoff_address':
				this.address_data_r_dropoff = options;
				break;
		}
	}

	private nextAddressSearchVersion(fieldName: string): number {
		const nextVersion = (this.addressSearchRequestVersion[fieldName] || 0) + 1;
		this.addressSearchRequestVersion[fieldName] = nextVersion;
		return nextVersion;
	}

	private isLatestAddressSearchVersion(fieldName: string, version: number): boolean {
		return (this.addressSearchRequestVersion[fieldName] || 0) === version;
	}

	isAddressSearchLoading(fieldName: string): boolean {
		return !!this.addressSearchLoadingState[fieldName];
	}

	private setAddressSearchLoading(fieldName: string, isLoading: boolean): void {
		this.addressSearchLoadingState[fieldName] = isLoading;
	}

	private getAddressPlacesService(): google.maps.places.PlacesService | null {
		if (typeof google === 'undefined' || !google?.maps?.places) {
			return null;
		}

		if (!this.addressPlacesService) {
			this.addressPlacesService = new google.maps.places.PlacesService(document.createElement('div'));
		}

		return this.addressPlacesService;
	}

	private getAddressSelectionLabel(placeName: string, formattedAddress: string): string {
		const normalizedName = String(placeName || '').trim();
		const normalizedAddress = String(formattedAddress || '').trim();

		return normalizedName ? `${normalizedName} - ${normalizedAddress}` : normalizedAddress;
	}

	private searchGoogleAddressPredictions(searchText: string): Promise<Array<any>> {
		const apiKey = this.getGoogleMapsApiKey();
		if (!apiKey || !String(searchText || '').trim()) {
			return Promise.resolve([]);
		}

		return fetch('https://places.googleapis.com/v1/places:autocomplete', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Goog-Api-Key': apiKey,
				'X-Goog-FieldMask': 'suggestions.placePrediction.placeId,suggestions.placePrediction.text.text,suggestions.placePrediction.structuredFormat.mainText.text,suggestions.placePrediction.structuredFormat.secondaryText.text'
			},
			body: JSON.stringify({
				input: searchText,
				includeQueryPredictions: false,
				languageCode: 'en-US'
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

	private fetchGoogleAddressDetails(placeId: string): Promise<any | null> {
		const service = this.getAddressPlacesService();
		if (!service || !placeId) {
			return Promise.resolve(null);
		}

		return new Promise((resolve) => {
			service.getDetails(
				{
					placeId,
					fields: ['place_id', 'name', 'formatted_address', 'geometry']
				},
				(place, status) => {
					if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) {
						resolve(null);
						return;
					}

					const formattedAddress = place.formatted_address ?? '';
					const placeName = (place.name ?? '').trim();

					resolve({
						formatted_address: formattedAddress,
						display_address: this.getAddressSelectionLabel(placeName, formattedAddress),
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					});
				}
			);
		});
	}

	async searchAddress(value: string, fieldName: string): Promise<void> {
		const requestVersion = this.nextAddressSearchVersion(fieldName);
		const searchText = String(value || '').trim();

		if (!searchText) {
			if (this.isLatestAddressSearchVersion(fieldName, requestVersion)) {
				this.setAddressSearchLoading(fieldName, false);
				this.setAddressOptions(fieldName, []);
			}
			return;
		}

		this.setAddressSearchLoading(fieldName, true);

		try {
			const options = await this.searchGoogleAddressPredictions(searchText);
			if (this.isLatestAddressSearchVersion(fieldName, requestVersion)) {
				this.setAddressOptions(fieldName, options);
				this.setAddressSearchLoading(fieldName, false);
			}
		} catch {
			if (this.isLatestAddressSearchVersion(fieldName, requestVersion)) {
				this.setAddressOptions(fieldName, []);
				this.setAddressSearchLoading(fieldName, false);
			}
		}
	}

	getAirportOptions(fieldName: string): Array<any> {
		switch (fieldName) {
			case 'pickup_airport':
				return this.airports_data_pickup || [];
			case 'dropoff_airport':
				return this.airports_data_dropoff || [];
			case 'return_pickup_airport':
				return this.airports_data_r_pickup || [];
			case 'return_dropoff_airport':
				return this.airports_data_r_dropoff || [];
			default:
				return [];
		}
	}

	isAirportDropdownOpen(fieldName: string): boolean {
		return this.activeAirportDropdown === fieldName;
	}

	private clearAirportDropdownBlurTimer(): void {
		if (this.airportDropdownBlurTimeout) {
			clearTimeout(this.airportDropdownBlurTimeout);
			this.airportDropdownBlurTimeout = undefined;
		}
	}

	openAirportDropdown(fieldName: string): void {
		this.clearAirportDropdownBlurTimer();
		this.activeAirportDropdown = fieldName;
		const selectedOption = this.getResolvedAirportDropdownOption(fieldName);
		if (selectedOption) {
			this.setAirportOptions(fieldName, [selectedOption]);
			return;
		}
		void this.searchAirport(this.quoteBotForm.get(`${fieldName}_name`)?.value || '', fieldName);
	}

	closeAirportDropdown(fieldName?: string): void {
		this.clearAirportDropdownBlurTimer();
		if (!fieldName || this.activeAirportDropdown === fieldName) {
			this.activeAirportDropdown = null;
		}
	}

	private clearAirportSearchDebounceTimer(fieldName: string): void {
		if (this.airportSearchDebounceTimers[fieldName]) {
			clearTimeout(this.airportSearchDebounceTimers[fieldName]);
			delete this.airportSearchDebounceTimers[fieldName];
		}
	}

	private scheduleAirportSearch(value: string, fieldName: string, delay = 300): void {
		this.clearAirportSearchDebounceTimer(fieldName);
		this.setAirportSearchLoading(fieldName, !!String(value || '').trim());
		this.airportSearchDebounceTimers[fieldName] = setTimeout(() => {
			void this.searchAirport(value || '', fieldName);
		}, delay);
	}

	private getOrCreateAirportSessionToken(fieldName: string): string {
		const existingToken = this.airportAutocompleteSessionTokens[fieldName];
		if (existingToken) {
			return existingToken;
		}

		const token = typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
			? crypto.randomUUID()
			: `${fieldName}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

		this.airportAutocompleteSessionTokens[fieldName] = token;
		return token;
	}

	private resetAirportSessionToken(fieldName: string): void {
		delete this.airportAutocompleteSessionTokens[fieldName];
	}

	private isTouchAirportInteraction(): boolean {
		if (typeof window === 'undefined') {
			return false;
		}

		return window.matchMedia('(pointer: coarse)').matches || window.innerWidth <= 1024;
	}

	onAirportFieldFocus(fieldName: string, input?: HTMLInputElement): void {
		if (!this.isTouchAirportInteraction()) {
			input?.select();
		}
		this.openAirportDropdown(fieldName);
	}

	onAirportFieldBlur(fieldName: string): void {
		this.clearAirportDropdownBlurTimer();
		this.airportDropdownBlurTimeout = setTimeout(() => {
			this.closeAirportDropdown(fieldName);
		}, 150);
	}

	private clearAirportResolvedSelection(fieldName: string): void {
		this.SetFormValue(fieldName, '');
		this.SetFormValue(`${fieldName}_lat`, '');
		this.SetFormValue(`${fieldName}_long`, '');
	}

	onAirportFieldInput(value: string, fieldName: string): void {
		this.clearAirportDropdownBlurTimer();
		this.activeAirportDropdown = fieldName;
		this.clearAirportResolvedSelection(fieldName);
		if (!String(value || '').trim()) {
			this.setAirportSearchLoading(fieldName, false);
		}
		this.scheduleAirportSearch(value || '', fieldName, 300);
	}

	async selectAirportOption(airport: any, fieldName: string): Promise<void> {
		this.clearAirportDropdownBlurTimer();
		if (airport?.placeId) {
			const googleAirport = await this.fetchGoogleAirportDetails(airport.placeId, airport.name);
			if (googleAirport) {
				this.onAirportSelected(googleAirport, fieldName);
			}
		} else {
			this.selectedAirport(this.getAirportOptions(fieldName), airport, fieldName);
		}
		this.resetAirportSessionToken(fieldName);
		this.closeAirportDropdown(fieldName);
	}

	isAirportTerminalOption(airport: any): boolean {
		return !!airport?.isTerminal;
	}

	getAirportOptionLabel(airport: any): string {
		const normalizedName = String(airport?.name || airport?.airport || '').trim();
		if (normalizedName) {
			return normalizedName;
		}

		const description = String(airport?.description || '').trim();
		if (description) {
			return description.split(',')[0]?.trim() || description;
		}

		return '';
	}

	getAirportOptionSecondaryText(airport: any): string {
		const description = String(airport?.description || '').trim();
		if (description) {
			const parts = description.split(',').map((part: string) => part.trim()).filter(Boolean);
			if (parts.length > 1) {
				return parts.slice(1).join(', ');
			}
		}

		const secondaryText = airport?.secondaryText || airport?.city || '';
		if (secondaryText) {
			return secondaryText;
		}

		return '';
	}

	private setAirportOptions(fieldName: string, options: Array<any>): void {
		switch (fieldName) {
			case 'pickup_airport':
				this.airports_data_pickup = options;
				break;
			case 'dropoff_airport':
				this.airports_data_dropoff = options;
				break;
			case 'return_pickup_airport':
				this.airports_data_r_pickup = options;
				break;
			case 'return_dropoff_airport':
				this.airports_data_r_dropoff = options;
				break;
		}
	}

	private nextAirportSearchVersion(fieldName: string): number {
		const nextVersion = (this.airportSearchRequestVersion[fieldName] || 0) + 1;
		this.airportSearchRequestVersion[fieldName] = nextVersion;
		return nextVersion;
	}

	private isLatestAirportSearchVersion(fieldName: string, version: number): boolean {
		return (this.airportSearchRequestVersion[fieldName] || 0) === version;
	}

	private getAirportPlacesService(): google.maps.places.PlacesService | null {
		if (typeof google === 'undefined' || !google?.maps?.places) {
			return null;
		}

		if (!this.airportPlacesService) {
			this.airportPlacesService = new google.maps.places.PlacesService(document.createElement('div'));
		}

		return this.airportPlacesService;
	}

	private isAirportLikePredictionText(value: string): boolean {
		const predictionText = String(value || '').toLowerCase();

		return ['airport', 'terminal', 'concourse', 'fbo', 'airfield', 'aerodrome', 'gate', 'parking', 'garage', 'departures', 'arrivals'].some((keyword) =>
			predictionText.includes(keyword)
		);
	}

	private isAirportOrTerminalResult(name: string, secondaryText: string, description: string): boolean {
		const combinedText = [name, secondaryText, description].join(' ').toLowerCase();

		return ['airport', 'terminal', 'concourse', 'fbo', 'airfield', 'aerodrome'].some((keyword) =>
			combinedText.includes(keyword)
		);
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

	private getAirportPredictionType(prediction: any): string {
		const types = Array.isArray(prediction?.types) ? prediction.types.map((type: string) => String(type || '').toLowerCase()) : [];
		return types.includes('airport') ? 'airport' : 'terminal';
	}

	private mapAirportPrediction(prediction: any, searchText: string): any {
		const name = this.getPredictionTextValue(prediction?.structuredFormat?.mainText)
			|| this.getPredictionTextValue(prediction?.text)?.split(',')[0]?.trim()
			|| this.getPredictionTextValue(prediction?.text);
		const secondaryText = this.getPredictionTextValue(prediction?.structuredFormat?.secondaryText);
		const description = this.getPredictionTextValue(prediction?.text);

		return {
			placeId: prediction?.placeId,
			name,
			secondaryText,
			description,
			searchText,
			resultType: this.getAirportPredictionType(prediction),
			isTerminal: false,
		};
	}

	private normalizeAirportSearchText(value: string): string {
		return String(value || '')
			.toLowerCase()
			.replace(/[^a-z0-9\s]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	private getAirportBaseQuery(searchText: string): string {
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

	private buildAirportMatchTokens(airport: any, searchText: string): string[] {
		const codeMatches = [airport?.name, airport?.description, searchText]
			.flatMap((value: any) => String(value || '').match(/\b[A-Z]{3,4}\b/g) || [])
			.map((value: string) => value.toLowerCase());

		const phraseCandidates = [
			String(searchText || '').trim(),
			String(airport?.name || '').trim(),
			String(airport?.secondaryText || '').split(',')[0]?.trim() || '',
		]
			.map((value) => this.normalizeAirportSearchText(value))
			.filter((value) => value.length >= 3);

		return Array.from(new Set([...codeMatches, ...phraseCandidates]));
	}

	private findMatchingAirportForTerminal(terminal: any, airports: Array<any>, searchText: string): any | null {
		const normalizedDescription = this.normalizeAirportSearchText(terminal?.description || terminal?.secondaryText || terminal?.name || '');
		if (!normalizedDescription.includes('terminal')) {
			return null;
		}

		for (const airport of airports) {
			const tokens = this.buildAirportMatchTokens(airport, searchText);
			if (tokens.some((token) => token && normalizedDescription.includes(token))) {
				return airport;
			}
		}

		return null;
	}

	private dedupeAirportDropdownOptions(options: Array<any>): Array<any> {
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

	private mergeAirportAndTerminalPredictions(airports: Array<any>, terminals: Array<any>, searchText: string): Array<any> {
		const merged: Array<any> = [];
		const matchedTerminalIds = new Set<string>();
		const normalizedTerminals = this.dedupeAirportDropdownOptions(terminals);

		for (const airport of this.dedupeAirportDropdownOptions(airports)) {
			merged.push({
				...airport,
				isTerminal: false,
			});

			const airportTerminals = normalizedTerminals.filter((terminal: any) => {
				const matchingAirport = this.findMatchingAirportForTerminal(terminal, [airport], searchText);
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

	private fetchGooglePlaceAutocompleteSuggestions(input: string, sessionToken: string): Promise<Array<any>> {
		const apiKey = this.getGoogleMapsApiKey();
		if (!apiKey || !String(input || '').trim()) {
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
				input,
				includeQueryPredictions: false,
				languageCode: 'en-US',
				sessionToken
			})
		})
			.then((response) => response.ok ? response.json() : Promise.resolve({ suggestions: [] }))
			.then((response: any) => Array.isArray(response?.suggestions) ? response.suggestions : [])
			.catch(() => []);
	}

	private searchGoogleAirportPredictions(searchText: string, fieldName: string): Promise<Array<any>> {
		const rawSearchText = String(searchText || '').trim();
		if (!rawSearchText) {
			return Promise.resolve([]);
		}

		const baseSearchText = this.getAirportBaseQuery(rawSearchText) || rawSearchText;
		const terminalSearchText = `${baseSearchText} terminal`.trim();
		const sessionToken = this.getOrCreateAirportSessionToken(fieldName);

		return Promise.all([
			this.fetchGooglePlaceAutocompleteSuggestions(baseSearchText, sessionToken),
			this.fetchGooglePlaceAutocompleteSuggestions(terminalSearchText, sessionToken)
		]).then(([airportSuggestionResponse, terminalSuggestionResponse]) => {
			const airportPredictions = airportSuggestionResponse
				.map((suggestion: any) => suggestion?.placePrediction)
				.filter((prediction: any) => !!prediction?.placeId)
				.filter((prediction: any) => this.getAirportPredictionType(prediction) === 'airport')
				.map((prediction: any) => this.mapAirportPrediction(prediction, baseSearchText));

			const terminalPredictions = terminalSuggestionResponse
				.map((suggestion: any) => suggestion?.placePrediction)
				.filter((prediction: any) => !!prediction?.placeId)
				.map((prediction: any) => this.mapAirportPrediction(prediction, baseSearchText))
				.filter((prediction: any) => String(prediction?.description || '').toLowerCase().includes('terminal'));

			if (!terminalPredictions.length) {
				return this.dedupeAirportDropdownOptions(airportPredictions);
			}

			return this.mergeAirportAndTerminalPredictions(airportPredictions, terminalPredictions, baseSearchText);
		}).catch(() => []);
	}

	private fetchGoogleAirportDetails(placeId: string, fallbackName = ''): Promise<{ id: string; name: string; latitude: number; longitude: number } | null> {
		const service = this.getAirportPlacesService();
		if (!service || !placeId) {
			return Promise.resolve(null);
		}

		return new Promise((resolve) => {
			service.getDetails(
				{
					placeId,
					fields: ['place_id', 'name', 'formatted_address', 'geometry']
				},
				(place, status) => {
					if (status !== google.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) {
						resolve(null);
						return;
					}

					const formattedAddress = place.formatted_address ?? '';
					const placeName = (place.name ?? fallbackName ?? '').trim();
					resolve({
						id: place.place_id ?? placeId,
						name: this.getAirportSelectionLabel(placeName, formattedAddress),
						latitude: place.geometry.location.lat(),
						longitude: place.geometry.location.lng()
					});
				}
			);
		});
	}

	private syncQuoteBotAutocompleteDisplays(): void {
		const inputRefs = [
			this.addressinput,
			this.dropaddressinput,
			this.retaddressinput,
			this.retdropaddressinput,
			this.airportinput,
			this.dropairportinput,
			this.retairportinput,
			this.retdropairportinput,
		];

		inputRefs.forEach((inputRef) => {
			if (inputRef?.nativeElement) {
				syncPlaceAutocompleteDisplay(inputRef.nativeElement);
			}
		});
	}

	private scheduleQuoteBotAutocompleteDisplaySync(): void {
		[0, 100, 300, 700].forEach((delay) => {
			setTimeout(() => this.syncQuoteBotAutocompleteDisplays(), delay);
		});
	}

	Subscriptions() {
		this.quoteBotForm.get('service_type')?.valueChanges.subscribe(() => {
			setTimeout(() => {
				this.retryGoogleAutocompleteInitialization();
			}, 200);
		});

		this.quoteBotForm.get('pickup_type').valueChanges.subscribe((value: string) => {
			console.log("in value chanes", value)
			this.closeAirportDropdown();
			this.closeAddressDropdown();
			setTimeout(() => {
				this.retryGoogleAutocompleteInitialization()
			}, 200)
		})

		this.quoteBotForm.get('dropoff_type').valueChanges.subscribe((value: string) => {
			console.log("in value chanes", value)
			this.closeAirportDropdown();
			this.closeAddressDropdown();
			setTimeout(() => {
				this.retryGoogleAutocompleteInitialization()
			}, 200)
		})
	}
	fetchPageData(section: string) {
		if (section != undefined && this.homePageData != undefined) {
			if (this.homePageData) {
				for (let item in this.homePageData) {
					if (this.homePageData[item].hasOwnProperty('title') && this.homePageData[item]['title'].toLowerCase() == section.toLowerCase()) {
						return this.homePageData[item]
					}
				}
			}
		}
	}

	fetchHomePageData() {
		this.isHomePageLoading = true;
		// this.spinner.show()

		this.websiteService.fetchHomePageData()
			.pipe(
				catchError(err => {
					this.isHomePageLoading = false;
					// this.spinner.hide()
					return throwError(err)
				})
			).subscribe(({ data }: any) => {
				this.isHomePageLoading = false;
				// this.spinner.hide()
				console.log(data, "gsducgjsdgcfugsdu")
				this.homePageData = data;
				this.clientImages = this.fetchPageData('SOME OF OUR CLIENTS')?.images || [];
				// Initialize all carousels after data is loaded
				setTimeout(() => {
					this.initClientCarousel();
					this.initOtherCarousels();
					this.initStepRotation(); // Initialize step rotation animation
				}, 100);
			})

	}

	// --------------------------------- 	Quotebot Data 		----------------------------------------------

	/**
	 * after generating Form, prefills and fetches airport data
	 */
	initialiseQuotebot() {
		if (this.generateQBForm()) {
			this.prefillQuotebot()
		}
	}


	/**
	 * fill the location coordinates from google maps autocomplete
	 * @param event [any] Required. input event
	 * @param field_name [string] Required. input field and key of the form
	 */
	// onAutocompleteSelected(location: any, field_name: string) {
	// 	this.SetFormValue(field_name, location.formatted_address)

	// 	// fill return address and airport for round trip
	// 	this.QBForm.service_type.value == 'round_trip' && !field_name.includes('return_') && this.fillReturnDetails()
	// }

	/**
	 * fill the formatted address from google maps autocomplete
	 * @param event [any] Required. input event
	 * @param field_name [string] Required. input field and key of the form
	 */
	// onLocationSelected(coordinates: any, field_name: string) {
	// 	this.SetFormValue(field_name + '_lat', coordinates['latitude'])
	// 	this.SetFormValue(field_name + '_long', coordinates['longitude'])

	// 	this.QBForm.service_type.value == 'round_trip' && !field_name.includes('return_') && this.fillReturnDetails()

	// }

	/**
	 * Fill Return Details for the form
	 */
	fillReturnDetails() {
		this.quoteBotForm.get('return_pickup_address').setValidators([Validators.required])
		this.quoteBotForm.get('return_pickup_address_lat').setValidators([Validators.required])
		this.quoteBotForm.get('return_pickup_address_long').setValidators([Validators.required])
		this.quoteBotForm.get('return_dropoff_address').setValidators([Validators.required])
		this.quoteBotForm.get('return_dropoff_address_lat').setValidators([Validators.required])
		this.quoteBotForm.get('return_dropoff_address_long').setValidators([Validators.required])
		this.quoteBotForm.get('return_pickup_airport').setValidators([Validators.required])
		this.quoteBotForm.get('return_pickup_airport_lat').setValidators([Validators.required])
		this.quoteBotForm.get('return_pickup_airport_long').setValidators([Validators.required])
		this.quoteBotForm.get('return_dropoff_airport').setValidators([Validators.required])
		this.quoteBotForm.get('return_dropoff_airport_lat').setValidators([Validators.required])
		this.quoteBotForm.get('return_dropoff_airport_long').setValidators([Validators.required])
		this.quoteBotForm.updateValueAndValidity()

		this.quoteBotForm.patchValue({
			return_pickup_address: this.QBForm.dropoff_address.value,
			return_pickup_address_lat: this.QBForm.dropoff_address_lat.value,
			return_pickup_address_long: this.QBForm.dropoff_address_long.value,
			return_dropoff_address: this.QBForm.pickup_address.value,
			return_dropoff_address_lat: this.QBForm.pickup_address_lat.value,
			return_dropoff_address_long: this.QBForm.pickup_address_long.value,
			return_pickup_airport: this.QBForm.dropoff_airport.value,
			return_pickup_airport_lat: this.QBForm.dropoff_airport_lat.value,
			return_pickup_airport_long: this.QBForm.dropoff_airport_long.value,
			return_dropoff_airport: this.QBForm.pickup_airport.value,
			return_dropoff_airport_lat: this.QBForm.pickup_airport_lat.value,
			return_dropoff_airport_long: this.QBForm.pickup_airport_long.value,
		})
	}

	/**
	 * generating Quote Bot Form only
	 */
	generateQBForm() {
		this.quoteBotForm = this.formBuilder.group({
			service_type: ['', Validators.required],		// form type
			booking_hour: ['', Validators.required],	// charte tour
			pickup_type: ['', Validators.required],
			dropoff_type: ['', Validators.required],
			pickup_date: ['', Validators.required],
			pickup_time: ['', Validators.required],
			pickup_airport: ['', Validators.required],
			pickup_airport_name: [''],
			pickup_airport_lat: ['', Validators.required],
			pickup_airport_long: ['', Validators.required],
			pickup_address: ['', Validators.required],
			pickup_address_lat: ['', Validators.required],
			pickup_address_long: ['', Validators.required],
			dropoff_airport: ['', Validators.required],
			dropoff_airport_name: [''],
			dropoff_airport_lat: ['', Validators.required],
			dropoff_airport_long: ['', Validators.required],
			dropoff_address: ['', Validators.required],
			dropoff_address_lat: ['', Validators.required],
			dropoff_address_long: ['', Validators.required],
			return_pickup_date: ['',],
			return_pickup_time: ['',],
			return_pickup_airport: ['',],
			return_pickup_airport_name: [''],
			return_pickup_airport_lat: ['',],
			return_pickup_airport_long: ['',],
			return_pickup_address: ['',],
			return_pickup_address_lat: ['',],
			return_pickup_address_long: ['',],
			return_dropoff_airport: ['',],
			return_dropoff_airport_name: [''],
			return_dropoff_airport_lat: ['',],
			return_dropoff_airport_long: ['',],
			return_dropoff_address: ['',],
			return_dropoff_address_lat: ['',],
			return_dropoff_address_long: ['',],
			no_of_passenger: [1,],
			no_of_luggage: [0,],
			location_info: this.formBuilder.array([],),
		});

		if (this.quoteBotForm) {
			return true
		}
	}

	useCurrentPickupLocation(fieldName: string) {
		if (this.hasExistingQuoteBotLocation(fieldName)) {
			return;
		}
		this.getCurrentLocation(fieldName, { showErrorDialog: true });
	}

	private hasExistingQuoteBotLocation(fieldName: string): boolean {
		const addressValue = String(this.quoteBotForm?.get(fieldName)?.value || '').trim();
		const latitude = this.quoteBotForm?.get(`${fieldName}_lat`)?.value;
		const longitude = this.quoteBotForm?.get(`${fieldName}_long`)?.value;

		return !!addressValue
			&& latitude !== ''
			&& latitude !== null
			&& latitude !== undefined
			&& longitude !== ''
			&& longitude !== null
			&& longitude !== undefined;
	}

	private nextLocationRequestVersion(fieldName: string): number {
		const nextVersion = (this.locationRequestVersionByField[fieldName] || 0) + 1;
		this.locationRequestVersionByField[fieldName] = nextVersion;
		return nextVersion;
	}

	private isLatestLocationRequest(fieldName: string, version: number): boolean {
		return (this.locationRequestVersionByField[fieldName] || 0) === version;
	}

	getCurrentLocation(fieldName: string, options: { showErrorDialog?: boolean } = {}) {
		const { showErrorDialog = true } = options;
		this.errorDialogService.closeDialog();

		if (!navigator.geolocation) {
			if (showErrorDialog) {
				this.errorDialogService.openDialog({
					errors: {
						error: "Geolocation is not supported by this browser."
					}
				});
			}
			return;
		}

		const requestVersion = this.nextLocationRequestVersion(fieldName);
		this.spinner.show();
		const geoOptions = {
			enableHighAccuracy: true,
			timeout: 10000,
			maximumAge: 300000 // 5 minutes
		};

		navigator.geolocation.getCurrentPosition(
			(position) => {
				this.ngZone.run(() => {
					if (!this.isLatestLocationRequest(fieldName, requestVersion)) {
						return;
					}

					this.spinner.hide();
					this.errorDialogService.closeDialog();
					const lat = position.coords.latitude;
					const lng = position.coords.longitude;

					console.log("Current Location:", lat, lng);

					// Fill the QB form lat/long fields
					this.SetFormValue(`${fieldName}_lat`, lat);
					this.SetFormValue(`${fieldName}_long`, lng);

					// Reverse Geocode to get formatted address
					this.reverseGeocode(lat, lng, fieldName);
				});
			},
			(error) => {
				this.ngZone.run(() => {
					if (!this.isLatestLocationRequest(fieldName, requestVersion)) {
						return;
					}

					this.spinner.hide();
					console.error("Geolocation Error:", error);
					let errorMessage = "Unable to fetch your location. ";

					switch (error.code) {
						case error.PERMISSION_DENIED:
							errorMessage += "Please enable location access in your browser settings.";
							break;
						case error.POSITION_UNAVAILABLE:
							errorMessage += "Location information is unavailable.";
							break;
						case error.TIMEOUT:
							errorMessage += "Location request timed out. Please try again.";
							break;
						default:
							errorMessage += "Please check your GPS and try again.";
							break;
					}

					if (showErrorDialog) {
						this.errorDialogService.openDialog({
							errors: {
								error: errorMessage
							}
						});
					}
				});
			},
			geoOptions
		);
	}


	reverseGeocode(lat: number, lng: number, fieldName: string) {
		if (!google || !google.maps) {
			console.warn("Google Maps API not loaded");
			return;
		}

		const geocoder = new google.maps.Geocoder();
		const latlng = { lat: lat, lng: lng };

		geocoder.geocode({ location: latlng }, (results, status) => {
			this.ngZone.run(() => {
				if (status === "OK" && results[0]) {
					this.errorDialogService.closeDialog();
					const address = results[0].formatted_address;
					this.SetFormValue(fieldName, address);
					console.log("Reverse Geocoded Address:", address);

					// Keep round-trip mirrored addresses in sync with the outbound side.
					if (this.QBForm?.service_type?.value === 'round_trip' && !fieldName.includes('return_')) {
						this.fillReturnDetails();
					}
				} else {
					console.warn("Reverse Geocoding failed:", status);
					// Still set coordinates even if geocoding fails
					const fallbackAddress = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
					this.SetFormValue(fieldName, fallbackAddress);
				}
			});
		});
	}


	roundToNearest15(minutes) {
		const quarterHour = 15;
		return Math.round(minutes / quarterHour) * quarterHour;
	}
	returnValidDate(dateString) {
		// Attempt to create a Date object from the provided dateString
		const date: any = new Date(dateString);
		console.log('in function validate date-->', date, date.getTime(), new Date().getTime())
		if (date.getTime() > new Date().getTime()) {
			console.log('formattedDate', moment(date).format('YYYY-MM-DD'))
			// this.SetFormValue('pickup_date', date)
			return moment(date).format('YYYY-MM-DD')

		} else {
			console.log('formattedDate', moment(new Date()).format('YYYY-MM-DD'))
			return moment(new Date()).format('YYYY-MM-DD')
		}


		// Check if the Date object is valid and the dateString is a valid date
		// The condition isNaN(date) will be true if the date is not valid
		// Also, check if the parsed date string is equal to the original dateString
	}

	format(text) {
		if (text)
			return text.replace('_', ' ');
		else
			return ' ';
	}

	private getStoredTextValue(value: any): string {
		return typeof value === 'string' ? value : '';
	}

	private getStoredAirportValue(value: any, fallbackValue: any): string {
		const storedValue = this.getStoredTextValue(value);
		if (storedValue) {
			return storedValue;
		}

		return this.getStoredTextValue(fallbackValue);
	}

	private getStoredCoordinateValue(value: any): number | '' {
		if (value === '' || value === null || value === undefined) {
			return '';
		}

		const numericValue = Number(value);
		return Number.isFinite(numericValue) ? numericValue : '';
	}

	private syncAirportValueFromDisplay(prefix: 'pickup' | 'dropoff' | 'return_pickup' | 'return_dropoff'): void {
		const airportControl = this.quoteBotForm?.get(`${prefix}_airport`);
		const airportNameControl = this.quoteBotForm?.get(`${prefix}_airport_name`);
		const airportLatControl = this.quoteBotForm?.get(`${prefix}_airport_lat`);
		const airportLongControl = this.quoteBotForm?.get(`${prefix}_airport_long`);

		if (!airportControl || !airportNameControl) {
			return;
		}

		const airportValue = this.getStoredTextValue(airportControl.value);
		const airportNameValue = this.getStoredTextValue(airportNameControl.value);
		const latitude = airportLatControl?.value;
		const longitude = airportLongControl?.value;
		const hasCoordinates = latitude !== '' && latitude !== null && latitude !== undefined
			&& longitude !== '' && longitude !== null && longitude !== undefined;

		if (!airportValue && airportNameValue && hasCoordinates) {
			airportControl.setValue(airportNameValue, { emitEvent: false });
			airportControl.updateValueAndValidity({ emitEvent: false });
		}
	}

	private syncPrefilledAirportSelections(): void {
		this.syncAirportValueFromDisplay('pickup');
		this.syncAirportValueFromDisplay('dropoff');
		this.syncAirportValueFromDisplay('return_pickup');
		this.syncAirportValueFromDisplay('return_dropoff');
	}

	prefillQuotebot() {
		if (localStorage.getItem('quotebot_form')) {
			let previous_quotebot = JSON.parse(localStorage.getItem('quotebot_form'))
			const previousOtherDetails = previous_quotebot?.other_details ?? {};
			console.log('return date function', this.returnValidDate(previous_quotebot?.pickup_date))
			// fill previous values if localStorage has item
			console.log('filling QB form from local-->>>', previous_quotebot, previous_quotebot?.service_type.length > 1)
			this.quoteBotForm.patchValue({
				service_type: previous_quotebot?.service_type,
				booking_hour: previous_quotebot?.booking_hour || 2,
				pickup_type: previous_quotebot?.pickup_type,
				dropoff_type: previous_quotebot?.dropoff_type,
				pickup_date: this.returnValidDate(previous_quotebot?.pickup_date),
				pickup_time: previous_quotebot.pickup_time ? this.validateTimeHHMMSS(previous_quotebot.pickup_time) : "12:00:00",
				pickup_airport: this.getStoredAirportValue(previous_quotebot?.pickup_airport, previousOtherDetails?.pickup_airport_name ?? previous_quotebot?.pickup_airport_name),
				pickup_airport_name: this.getStoredTextValue(previousOtherDetails?.pickup_airport_name ?? previous_quotebot?.pickup_airport_name),
				pickup_airport_lat: this.getStoredCoordinateValue(previous_quotebot?.pickup_airport_lat),
				pickup_airport_long: this.getStoredCoordinateValue(previous_quotebot?.pickup_airport_long),
				pickup_address: this.getStoredTextValue(previous_quotebot?.pickup_address),
				pickup_address_lat: this.getStoredCoordinateValue(previous_quotebot?.pickup_address_lat),
				pickup_address_long: this.getStoredCoordinateValue(previous_quotebot?.pickup_address_long),
				dropoff_airport: this.getStoredAirportValue(previous_quotebot?.dropoff_airport, previousOtherDetails?.dropoff_airport_name ?? previous_quotebot?.dropoff_airport_name),
				dropoff_airport_name: this.getStoredTextValue(previousOtherDetails?.dropoff_airport_name ?? previous_quotebot?.dropoff_airport_name),
				dropoff_airport_lat: this.getStoredCoordinateValue(previous_quotebot?.dropoff_airport_lat),
				dropoff_airport_long: this.getStoredCoordinateValue(previous_quotebot?.dropoff_airport_long),
				dropoff_address: this.getStoredTextValue(previous_quotebot?.dropoff_address),
				dropoff_address_lat: this.getStoredCoordinateValue(previous_quotebot?.dropoff_address_lat),
				dropoff_address_long: this.getStoredCoordinateValue(previous_quotebot?.dropoff_address_long),
				return_pickup_date: this.returnValidDate(previous_quotebot?.return_pickup_date),
				return_pickup_time: previous_quotebot?.return_pickup_time ?? this.getTimeHHMMSS('', false),
				return_pickup_airport: this.getStoredAirportValue(previous_quotebot?.return_pickup_airport, previousOtherDetails?.return_pickup_airport_name ?? previous_quotebot?.return_pickup_airport_name),
				return_pickup_airport_name: this.getStoredTextValue(previousOtherDetails?.return_pickup_airport_name ?? previous_quotebot?.return_pickup_airport_name),
				return_pickup_airport_lat: this.getStoredCoordinateValue(previous_quotebot?.return_pickup_airport_lat),
				return_pickup_airport_long: this.getStoredCoordinateValue(previous_quotebot?.return_pickup_airport_long),
				return_pickup_address: this.getStoredTextValue(previous_quotebot?.return_pickup_address ?? previous_quotebot?.dropoff_address),
				return_pickup_address_lat: this.getStoredCoordinateValue(previous_quotebot?.return_pickup_address_lat),
				return_pickup_address_long: this.getStoredCoordinateValue(previous_quotebot?.return_pickup_address_long),
				return_dropoff_airport: this.getStoredAirportValue(previous_quotebot?.return_dropoff_airport, previousOtherDetails?.return_dropoff_airport_name ?? previous_quotebot?.return_dropoff_airport_name),
				return_dropoff_airport_name: this.getStoredTextValue(previousOtherDetails?.return_dropoff_airport_name ?? previous_quotebot?.return_dropoff_airport_name),
				return_dropoff_airport_lat: this.getStoredCoordinateValue(previous_quotebot?.return_dropoff_airport_lat),
				return_dropoff_airport_long: this.getStoredCoordinateValue(previous_quotebot?.return_dropoff_airport_long),
				return_dropoff_address: this.getStoredTextValue(previous_quotebot?.return_dropoff_address ?? previous_quotebot?.pickup_address),
				return_dropoff_address_lat: this.getStoredCoordinateValue(previous_quotebot?.return_dropoff_address_lat),
				return_dropoff_address_long: this.getStoredCoordinateValue(previous_quotebot?.return_dropoff_address_long),
				no_of_passenger: Math.max(1, previous_quotebot?.no_of_passenger || 1),
				no_of_luggage: Math.max(0, previous_quotebot?.no_of_luggage || 0),
				location_info: previous_quotebot?.location_info
			})
			this.syncPrefilledAirportSelections()
			this.vars = { ...previousOtherDetails }
			console.warn('pickup_time: & date', this.QBForm.pickup_time.value, this.QBForm.pickup_date.value)
			this.quoteBotSwitch(previous_quotebot?.service_type.length > 1 ? previous_quotebot?.service_type : "one_way")
			this.scheduleQuoteBotAutocompleteDisplaySync()
			setTimeout(() => this.retryGoogleAutocompleteInitialization(), 0);
			this.autoPickLocationOnLoad();

			// if (new Date(this.QBForm.pickup_date.value).getDate() < new Date().getDate() || new Date(this.QBForm.pickup_date.value).getMonth() + 1 < new Date().getMonth() + 1) {
			// 	console.log('----------ssssssssssssssetttttttttt', this.getTimeHHMMSS(this.QBForm.pickup_date.value, true))
			// 	this.SetFormValue('pickup_date', this.getTimeHHMMSS(this.QBForm.pickup_date.value, true))
			// }

			// set values for data receiving from data.js
			// $('pickupTime option:selected').attr('selected', null)
			// $(`#pickupTime option[value=\"${previous_quotebot.pickup_time}\"]`).attr('selected', 'selected')
		} else {
			// fill default values
			this.quoteBotForm.patchValue({
				service_type: 'one_way',
				booking_hour: '2',
				pickup_type: 'city',
				dropoff_type: 'airport',
				pickup_date: new Date().toISOString().split('T')[0],
				pickup_time: this.getTimeHHMMSS('', false),
				return_pickup_date: new Date().toISOString().split('T')[0],
				return_pickup_time: this.getTimeHHMMSS('', false),
				no_of_passenger: 1,
				no_of_luggage: 0,
			})

			this.quoteBotSwitch('one_way')
			this.scheduleQuoteBotAutocompleteDisplaySync()
			setTimeout(() => this.retryGoogleAutocompleteInitialization(), 0);
			this.autoPickLocationOnLoad();
		}
	}

	/**
	 * Auto-pick current pickup location on page load/reload.
	 */
	autoPickLocationOnLoad() {
		setTimeout(() => {
			if (this.QBForm?.pickup_type?.value === 'airport') {
				return;
			}

			if (this.hasExistingQuoteBotLocation('pickup_address')) {
				return;
			}

			console.log('Auto-picking current location on home page load...');
			this.getCurrentLocation('pickup_address', { showErrorDialog: true });
		}, 100);
	}

	validateTimeHHMMSS(time) {
		let arr = time.split(':')
		if (arr.length != 3) return '12:00:00'
		let hours = parseInt(arr[0], 10);
		let minutes = parseInt(arr[1], 10);
		const seconds = arr[2];

		// Round minutes to nearest 15
		let roundedMinutes = this.roundToNearest15(minutes);

		if (roundedMinutes === 60) {
			roundedMinutes = 0;
			hours = (hours + 1) % 24;
		}

		// Format minutes with leading zero
		const formattedMinutes = roundedMinutes.toString().padStart(2, '0');

		// Format hours: 
		// - 0 should vary based on your data.js logic, but typically 00:00:00 or 12:00:00
		// - 1-9 should generally NOT have leading zero if data.js doesn't use it
		// Based on data.js provided earlier: 
		// "00:00:00" for midnight
		// "1:00:00", "2:00:00" etc for single digits

		let formattedHours;
		if (hours === 0) {
			formattedHours = "00";
		} else {
			formattedHours = hours.toString(); // No padding for 1-23 based on inspection of data.js
		}

		// Combine the time components into a string
		const currentTime = `${formattedHours}:${formattedMinutes}:00`;
		console.log('----------validateTimeHHMMSS-->>>', arr, currentTime)

		return currentTime
	}


	getTimeHHMMSS(date, isExist) {
		let now = new Date();
		if (isExist) {
			now = new Date(date)
		}

		// Get the current time components
		let hours = now.getHours();
		let minutes = now.getMinutes();
		// const seconds = now.getSeconds();

		// Round minutes to nearest 15
		let roundedMinutes = this.roundToNearest15(minutes);

		if (roundedMinutes === 60) {
			roundedMinutes = 0;
			hours = (hours + 1) % 24;
		}

		// Pad minutes with leading zero
		const formattedMinutes = roundedMinutes.toString().padStart(2, '0');

		// Format hours based on data.js convention
		let formattedHours;
		if (hours === 0) {
			formattedHours = "00";
		} else {
			formattedHours = hours.toString(); // No padding for 1-23 to match data.js "1:00:00", "12:00:00"
		}

		// Combine the time components into a string
		const currentTime = `${formattedHours}:${formattedMinutes}:00`;
		console.log('----------getTimeHHMMSS result', currentTime)

		return currentTime; // Removed incorrect bracket that was in original code
	}



	/**
	 * Fetches only Airports Data
	 */
	fetchAirportsData() {
		this.quotebotService.getAirportsData().subscribe((response: any) => {
			this.airports_data = response.success ? response.data : []
			this.airports_data_copy = JSON.parse(JSON.stringify(this.airports_data))
			this.airports_data_pickup = JSON.parse(JSON.stringify(this.airports_data))
			this.airports_data_dropoff = JSON.parse(JSON.stringify(this.airports_data))
			this.airports_data_r_pickup = JSON.parse(JSON.stringify(this.airports_data))
			this.airports_data_r_dropoff = JSON.parse(JSON.stringify(this.airports_data))
		})
	}

	returnSearchAirport(searchText: string) {
		console.log('search text is->', searchText);

		// Convert searchText to lowercase for case-insensitive comparison
		const searchTextLower = searchText.toLowerCase();

		// If the search term is exactly 3 characters, match it to the airport code (extracted from the 'airport' field)
		if (searchText.length === 3) {
			return JSON.parse(JSON.stringify(this.airports_data_copy.filter((item: any) => {
				// Extract the airport code (before the first dash) and match it with the search text
				const airportCode = item['airport'].split('-')[0].toLowerCase();
				return airportCode === searchTextLower;
			})));
		} else {
			// If the search term is longer than 3 characters, match it to the airport name or city
			return JSON.parse(JSON.stringify(this.airports_data_copy.filter((item: any) => {
				// Match the search text against the airport name or city (case-insensitive)
				return item['airport'].toLowerCase().includes(searchTextLower) ||   // Airport name match
					item['city'].toLowerCase().includes(searchTextLower);        // City name match
			})));
		}
	}



	async searchAirport(letter: string, form_control: string) {
		const requestVersion = this.nextAirportSearchVersion(form_control);
		const searchText = (letter || '').trim();
		const selectedOption = this.getResolvedAirportDropdownOption(form_control);
		const fallbackOptions = searchText === ''
			? (selectedOption ? [selectedOption] : [])
			: this.returnSearchAirport(searchText);

		if (!searchText) {
			if (this.isLatestAirportSearchVersion(form_control, requestVersion)) {
				this.setAirportSearchLoading(form_control, false);
				this.setAirportOptions(form_control, fallbackOptions);
			}
			return;
		}

		this.setAirportSearchLoading(form_control, true);

		try {
			const googleOptions = await this.searchGoogleAirportPredictions(searchText, form_control);
			if (this.isLatestAirportSearchVersion(form_control, requestVersion)) {
				this.setAirportOptions(
					form_control,
					googleOptions.length
						? googleOptions
						: (selectedOption ? [selectedOption] : fallbackOptions)
				);
				this.setAirportSearchLoading(form_control, false);
			}
		} catch {
			if (this.isLatestAirportSearchVersion(form_control, requestVersion)) {
				this.setAirportOptions(form_control, selectedOption ? [selectedOption] : fallbackOptions);
				this.setAirportSearchLoading(form_control, false);
			}
		}
	}


	fillAirportData(list: any, form_control: string, comparitive_key: string, returning_key: string): string {
		// fetch form value
		let form_value = this.quoteBotForm.get(form_control).value
		console.log('fillAirportData executes-->>', form_value)

		// validation check for form value to not be empty
		if (form_value == null || form_value == '' || this.airports_data == undefined) {
			return ''
		}

		// return the returning name
		const object = list.find((item: any) => item[comparitive_key] == form_value)
		if (object) {
			return object[returning_key]
		}
		return ''
	}

	selectedAirport(list: any, value: any, field_name: string): void {
		console.log('selectedAirport-->>', value)

		this.SetFormValue(field_name, value.id)
		this.SetFormValue(field_name + '_name', value.airport)
		this.SetFormValue(field_name + '_lat', value.lat)
		this.SetFormValue(field_name + '_long', value.lon)
		console.log(this.quoteBotForm.value)
		this.vars[field_name + '_name'] = value.airport
		if (field_name.includes('pickup_airport')) this.vars['return_dropoff_airport_name'] = value.airport
		if (field_name.includes('dropoff_airport')) this.vars['return_pickup_airport_name'] = value.airport
		this.fillReturnDetails()
		try {
			if (field_name == 'pickup_airport') {
				this.SetFormValue('return_dropoff_airport_name', value.airport)
			}
			else if (field_name == 'dropoff_airport') {
				this.SetFormValue('return_pickup_airport_name', value.airport)
			}
			else if (field_name == 'return_pickup_airport') {
				this.SetFormValue('dropoff_airport_name', value.airport)
			}
			else if (field_name == 'return_dropoff_airport') {
				this.SetFormValue('pickup_airport_name', value.airport)
			}
		} catch (error) {
			console.log(error)
		}
	}

	onAirportSelected(
		airport: { id: string; name: string; latitude: number; longitude: number },
		fieldName: string
	): void {
		this.resetAirportSessionToken(fieldName);
		this.SetFormValue(fieldName, airport.id);
		this.SetFormValue(`${fieldName}_name`, airport.name);
		this.SetFormValue(`${fieldName}_lat`, airport.latitude);
		this.SetFormValue(`${fieldName}_long`, airport.longitude);
		this.vars[`${fieldName}_name`] = airport.name;

		if (fieldName.includes('pickup_airport')) {
			this.vars['return_dropoff_airport_name'] = airport.name;
		}
		if (fieldName.includes('dropoff_airport')) {
			this.vars['return_pickup_airport_name'] = airport.name;
		}

		this.fillReturnDetails();

		if (fieldName === 'pickup_airport') {
			this.SetFormValue('return_dropoff_airport', airport.id);
			this.SetFormValue('return_dropoff_airport_name', airport.name);
			this.SetFormValue('return_dropoff_airport_lat', airport.latitude);
			this.SetFormValue('return_dropoff_airport_long', airport.longitude);
			this.vars['return_dropoff_airport_name'] = airport.name;
		} else if (fieldName === 'dropoff_airport') {
			this.SetFormValue('return_pickup_airport', airport.id);
			this.SetFormValue('return_pickup_airport_name', airport.name);
			this.SetFormValue('return_pickup_airport_lat', airport.latitude);
			this.SetFormValue('return_pickup_airport_long', airport.longitude);
			this.vars['return_pickup_airport_name'] = airport.name;
		} else if (fieldName === 'return_pickup_airport') {
			this.SetFormValue('dropoff_airport_name', airport.name);
		} else if (fieldName === 'return_dropoff_airport') {
			this.SetFormValue('pickup_airport_name', airport.name);
		}
	}

	clearAirportSelection(fieldName: string): void {
		this.resetAirportSessionToken(fieldName);
		this.clearAirportSearchDebounceTimer(fieldName);
		this.closeAirportDropdown(fieldName);
		this.SetFormValue(fieldName, '');
		this.SetFormValue(`${fieldName}_name`, '');
		this.SetFormValue(`${fieldName}_lat`, '');
		this.SetFormValue(`${fieldName}_long`, '');
		delete this.vars[`${fieldName}_name`];

		if (fieldName === 'pickup_airport') {
			this.SetFormValue('return_dropoff_airport', '');
			this.SetFormValue('return_dropoff_airport_name', '');
			this.SetFormValue('return_dropoff_airport_lat', '');
			this.SetFormValue('return_dropoff_airport_long', '');
			delete this.vars['return_dropoff_airport_name'];
		} else if (fieldName === 'dropoff_airport') {
			this.SetFormValue('return_pickup_airport', '');
			this.SetFormValue('return_pickup_airport_name', '');
			this.SetFormValue('return_pickup_airport_lat', '');
			this.SetFormValue('return_pickup_airport_long', '');
			delete this.vars['return_pickup_airport_name'];
		}
	}

	clearAddressSelection(fieldName: string): void {
		this.closeAddressDropdown(fieldName);
		this.SetFormValue(fieldName, '');
		this.SetFormValue(`${fieldName}_lat`, '');
		this.SetFormValue(`${fieldName}_long`, '');

		if (fieldName === 'pickup_address') {
			this.SetFormValue('return_dropoff_address', '');
			this.SetFormValue('return_dropoff_address_lat', '');
			this.SetFormValue('return_dropoff_address_long', '');
		} else if (fieldName === 'dropoff_address') {
			this.SetFormValue('return_pickup_address', '');
			this.SetFormValue('return_pickup_address_lat', '');
			this.SetFormValue('return_pickup_address_long', '');
		}
	}

	private persistQuoteBotState(): void {
		if (!this.quoteBotForm) {
			return;
		}

		const savedState = {
			...this.quoteBotForm.getRawValue(),
			other_details: { ...this.vars }
		};
		localStorage.setItem('quotebot_form', JSON.stringify(savedState));
	}

	SetFormValue(field_name: string, value: string | number) {
		console.log(`Filling ${value} into ${field_name}`)
		const control = this.quoteBotForm.get(field_name);
		control?.setValue(value);
		control?.updateValueAndValidity();
		this.quoteBotForm.updateValueAndValidity();
	}

	SetFormValidator(field_name: string, validators: Array<any>): void {
		this.quoteBotForm.get(field_name).setValidators(validators)
		this.quoteBotForm.updateValueAndValidity()
	}


	get QBForm() {
		return this.quoteBotForm.controls;
	}


	// $(".classChange").removeClass("col-12 col-md-12").addClass("col-6 col-md-6");
	// $(".returnClassChange").removeClass("col-12 col-md-12").addClass("col-6 col-md-6");
	// reset the input fields on click of cross svg
	reset(field_name: string) {
		const syncAddressField = (inputRef?: ElementRef) => {
			if (inputRef?.nativeElement) {
				queueMicrotask(() => clearPlaceAutocompleteDisplay(inputRef.nativeElement));
				setTimeout(() => clearPlaceAutocompleteDisplay(inputRef.nativeElement), 0);
			}
		};
		const syncAirportField = (inputRef?: ElementRef) => {
			if (inputRef?.nativeElement) {
				queueMicrotask(() => clearPlaceAutocompleteDisplay(inputRef.nativeElement));
				setTimeout(() => clearPlaceAutocompleteDisplay(inputRef.nativeElement), 0);
			}
		};

		switch (field_name) {
			case 'pickup_address':
				this.clearAddressSelection('pickup_address');
				syncAddressField(this.addressinput);
				syncAddressField(this.retdropaddressinput);
				break
			case 'pickup_airport':
				console.log('resseting pickup address')
				this.clearAirportSelection('pickup_airport');
				syncAirportField(this.airportinput);
				syncAirportField(this.retdropairportinput);
				break
			case 'dropoff_airport':
				console.log('resseting dropoff_airport address')
				this.clearAirportSelection('dropoff_airport');
				syncAirportField(this.dropairportinput);
				syncAirportField(this.retairportinput);
				break
			case 'return_pickup_airport':
				console.log('resseting return_pickup_airport address')
				this.clearAirportSelection('return_pickup_airport');
				syncAirportField(this.retairportinput);
				break
			case 'return_dropoff_airport':
				console.log('resseting return_dropoff_airport address')
				this.clearAirportSelection('return_dropoff_airport');
				syncAirportField(this.retdropairportinput);
				break
			case 'dropoff_address':
				this.clearAddressSelection('dropoff_address');
				syncAddressField(this.dropaddressinput);
				syncAddressField(this.retaddressinput);
				break
			case 'return_pickup_address':
				this.clearAddressSelection('return_pickup_address');
				syncAddressField(this.retaddressinput);
				break
			case 'return_dropoff_address':
				this.clearAddressSelection('return_dropoff_address');
				syncAddressField(this.retdropaddressinput);
				break
		}

		this.quoteBotForm.markAsDirty();
		this.quoteBotForm.updateValueAndValidity();
		this.persistQuoteBotState();
	}



	/**
	 * Change quotebot type
	 * 
	 * @param quoteBotType type to change to
	 */
	quoteBotSwitch(quoteBotType: string) {
		this.QBForm.service_type.setValue(quoteBotType)
		if (quoteBotType == 'round_trip') {
			this.fillReturnDetails()
		}
	}


	/**
	 * update values of specific function calls to form
	 */
	getNextQuarterHour(time: string): string {
		const [h, m] = time.split(':').map(Number);

		let hours = h;
		let minutes = m;

		// Round UP to next 15 min
		minutes = Math.ceil(minutes / 15) * 15;

		if (minutes === 60) {
			minutes = 0;
			hours = (hours + 1) % 24;
		}

		// Match data.js format: 00 for midnight, but no leading zero for 1-23 (e.g. "9:00:00")
		const formattedHours = hours === 0 ? "00" : hours.toString();

		return `${formattedHours}:${minutes.toString().padStart(2, '0')}:00`;
	}
	changeDetection = {
		pickupDate: (value: any) => {
			console.log('timeeee--->>>>', value.format("YYYY-MM-DD"))
			this.SetFormValue('pickup_date', value.format("YYYY-MM-DD"))
		},
		// pickupTime: (event: any = null, form_control: string) => {
		// 	if (event == null) {
		// 		return ''
		// 	}
		// 	console.log('Pickup Time Event: ', event.target.value)
		// 	this.SetFormValue(form_control, event.target.value)
		// },
		pickupTime: (event: any, form_control: string) => {
			if (!event?.target?.value) return;

			const rawTime = event.target.value; // "03:07"
			const roundedTime = this.getNextQuarterHour(rawTime);

			console.log('Rounded Time:', roundedTime);

			this.SetFormValue(form_control, roundedTime);
		},
		return_pickup_date: (value: any) => {
			console.log('value-- return ', value.format("YYYY-MM-DD"))
			this.SetFormValue('return_pickup_date', value.format("YYYY-MM-DD"))
		},

		bookingHours: (event: any) => {
			this.SetFormValue('booking_hours', event.target.value)
		}
	}

	locationInfo(rows: Array<any>, index: number) {
		let group = this.formBuilder.group({
			distance: [rows[index].elements[index].distance.value, Validators.required],
			duration: [rows[index].elements[index].duration.value, Validators.required]
		})
		console.log(group)
		return group
	}

	calculateDistance(pickup_coordinates: string | any[], dropoff_coordinates: string | any[]) {
		console.group(`\n\nCalculating Distance between\n\n`, pickup_coordinates, dropoff_coordinates);

		const newPromise = new Promise((resolve, reject) => {
			// ✅ Ensure Google Maps API is available
			if (!google || !google.maps) {
				reject('Google Maps JavaScript API not loaded');
				return;
			}

			const distanceMatrixService = new google.maps.DistanceMatrixService();

			// generate request for distance matrix service
			const request: google.maps.DistanceMatrixRequest = {
				origins: [pickup_coordinates[0]],
				destinations: [dropoff_coordinates[0]],
				travelMode: google.maps.TravelMode.DRIVING,
				unitSystem: google.maps.UnitSystem.METRIC,
				avoidHighways: false,
				avoidTolls: false
			};

			if (pickup_coordinates.length > 1 || dropoff_coordinates.length > 1) {
				request.origins = [pickup_coordinates[0], pickup_coordinates[1]];
				request.destinations = [dropoff_coordinates[0], dropoff_coordinates[1]];
			}

			// get distance matrix of that route
			distanceMatrixService.getDistanceMatrix(request, (response) => {
				console.log(response);
				if (response) {
					try {
						if (
							response.rows[0].elements[0].status === 'ZERO_RESULTS' ||
							(pickup_coordinates.length > 1 &&
								response.rows[1].elements[1].status === 'ZERO_RESULTS')
						) {
							reject('InvalidLocationPoints');
							return;
						}

						// push into the desired field
						(<FormArray>this.QBForm.location_info).push(this.formBuilder.group({
							distance: [response.rows[0].elements[0].distance, Validators.required],
							duration: [response.rows[0].elements[0].duration, Validators.required]
						}));

						if (response.rows.length > 1) {
							(<FormArray>this.QBForm.location_info).push(this.formBuilder.group({
								distance: [response.rows[1].elements[1].distance, Validators.required],
								duration: [response.rows[1].elements[1].duration, Validators.required]
							}));
						}

						resolve(true);
						return;
					} catch (err) {
						reject(err);
						return;
					}
				}
			});
		});

		console.groupEnd();
		return newPromise;
	}


	// calculateDistance(pickup_coordinates: string | any[], dropoff_coordinates: string | any[]) {
	// 	console.group(`\n\nCalculating Distance between\n\n`, pickup_coordinates, dropoff_coordinates)
	// 	const newPromise = new Promise((resolve, reject) => {
	// 		this.mapsAPILoader.load().then(() => {
	// 			const distanceMatrixService = new google.maps.DistanceMatrixService()

	// 			// generate request for distance matrix service
	// 			const request = {
	// 				origins: [pickup_coordinates[0]],
	// 				destinations: [dropoff_coordinates[0]],
	// 				travelMode: google.maps.TravelMode.DRIVING,
	// 				unitSystem: google.maps.UnitSystem.METRIC,
	// 				avoidHighways: false,
	// 				avoidTolls: false
	// 			}

	// 			if (pickup_coordinates.length > 1 || dropoff_coordinates.length > 1) {
	// 				request.origins = [pickup_coordinates[0], pickup_coordinates[1]]
	// 				request.destinations = [dropoff_coordinates[0], dropoff_coordinates[1]]
	// 			}

	// 			// get distance matrix of that route
	// 			distanceMatrixService.getDistanceMatrix(request, (response) => {
	// 				console.log(response)
	// 				if (response) {
	// 					try {
	// 						if ((response.rows[0].elements[0].status == 'ZERO_RESULTS') || (pickup_coordinates.length > 1 && response.rows[1].elements[1].status == 'ZERO_RESULTS')) {
	// 							reject('InvalidLocationPoints')
	// 							return
	// 						}
	// 						// push into the desired field
	// 						(<FormArray>this.QBForm.location_info).push(this.formBuilder.group({
	// 							distance: [response.rows[0].elements[0].distance, Validators.required],
	// 							duration: [response.rows[0].elements[0].duration, Validators.required]
	// 						}));
	// 						if (response.rows.length > 1) {
	// 							(<FormArray>this.QBForm.location_info).push(this.formBuilder.group({
	// 								distance: [response.rows[1].elements[1].distance, Validators.required],
	// 								duration: [response.rows[1].elements[1].duration, Validators.required]
	// 							}));
	// 						}
	// 						resolve(true)
	// 						return
	// 					} catch (err) {
	// 						reject(err)
	// 						return
	// 					}
	// 				}
	// 			})
	// 		}, (error) => {
	// 			console.log('Error while calculating distance. \n', error)
	// 		})
	// 		return
	// 	})
	// 	console.groupEnd()
	// 	return newPromise
	// }

	ValidateForm(form: FormGroup) {
		// remove return keys for other than round_trip
		if (form.get('service_type').value == "one_way" || form.get('service_type').value == 'charter_tour') {
			console.log('Removing Controls ...')
			// for (const key in form.controls) {
			// 	if (key.includes('return_')) {
			// 		// clear all validators 
			// 		this.quoteBotForm.removeControl(key)
			// 		this.quoteBotForm.updateValueAndValidity()
			// 	}
			// }


			if (form.get('pickup_type').value == 'airport') {
				console.log('clear validator for 1')
				this.clearValidatorsAndReset(['pickup_address', 'pickup_address_lat', 'pickup_address_long'])
				this.addRequiredValidators(['pickup_airport', 'pickup_airport_lat', 'pickup_airport_long'])
			}
			if (this.QBForm.dropoff_type.value == 'airport') {
				console.log('clear validator for 2')
				this.clearValidatorsAndReset(['dropoff_address', 'dropoff_address_lat', 'dropoff_address_long'])
				this.addRequiredValidators(['dropoff_airport', 'dropoff_airport_lat', 'dropoff_airport_long'])
			}
			if (this.QBForm.pickup_type.value != 'airport') {
				console.log('clear validator for 3')
				this.clearValidatorsAndReset(['pickup_airport', 'pickup_airport_lat', 'pickup_airport_long'])
				this.addRequiredValidators(['pickup_address', 'pickup_address_lat', 'pickup_address_long'])
			}
			if (this.QBForm.dropoff_type.value == 'city') {
				console.log('clear validator for 4')
				this.clearValidatorsAndReset(['dropoff_airport', 'dropoff_airport_lat', 'dropoff_airport_long'])
			}
			// else {
			// 	this.clearValidatorsAndReset(['dropoff_airport', 'dropoff_airport_lat', 'dropoff_airport_long'])
			// }
			this.quoteBotForm.updateValueAndValidity()
		}
		console.log('form validated')
	}
	addRequiredValidators(arr: Array<string>) {
		arr.forEach((item: string) => {
			this.quoteBotForm.get(item).setValidators([Validators.required])
			this.quoteBotForm.get(item).updateValueAndValidity()
		})
	}
	clearValidatorsAndReset(arr: Array<string>) {
		arr.forEach((item: string) => {
			console.log('clearing valildations from ', item)
			this.quoteBotForm.get(item).clearValidators()
			this.quoteBotForm.get(item).reset()
			this.quoteBotForm.get(item).updateValueAndValidity()
		})
	}

	private normalizeLocationText(value: any): string {
		return String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ');
	}

	private getLocationIdentity(type: string, value: any, lat: any, long: any): string {
		const normalizedValue = this.normalizeLocationText(value);
		const latitude = Number(lat);
		const longitude = Number(long);

		if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
			return `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
		}

		if (normalizedValue) {
			return normalizedValue;
		}

		return this.normalizeLocationText(type);
	}

	private getQuoteBotLocationIdentity(prefix: 'pickup' | 'dropoff'): string {
		const type = this.QBForm[`${prefix}_type`]?.value;

		if (type == 'airport') {
			return this.getLocationIdentity(
				type,
				this.QBForm[`${prefix}_airport`]?.value || this.QBForm[`${prefix}_airport_name`]?.value,
				this.QBForm[`${prefix}_airport_lat`]?.value,
				this.QBForm[`${prefix}_airport_long`]?.value
			);
		}

		return this.getLocationIdentity(
			type,
			this.QBForm[`${prefix}_address`]?.value,
			this.QBForm[`${prefix}_address_lat`]?.value,
			this.QBForm[`${prefix}_address_long`]?.value
		);
	}

	private hasInvalidSamePickupDropoff(): boolean {
		const serviceType = this.QBForm.service_type.value;
		if (serviceType != 'one_way' && serviceType != 'round_trip') {
			return false;
		}

		return this.getQuoteBotLocationIdentity('pickup') === this.getQuoteBotLocationIdentity('dropoff');
	}

	async fileTheQuote() {
		this.submitted = true
		this.syncPrefilledAirportSelections()
		this.ValidateForm(this.quoteBotForm)

		console.log('checking form valid', this.quoteBotForm.valid, this.quoteBotForm, this.QBForm.location_info.valid);

		// enter only if values excluding location_info presents invalid status
		if (!this.quoteBotForm.valid && !this.QBForm.location_info.valid) {
			console.log('-------------->>>>>>>>>>>>>>>>>>> returning the form', this.quoteBotForm)
			return
		}

		if (this.hasInvalidSamePickupDropoff()) {
			this.errorDialogService.openDialog({
				errors: {
					error: "Pickup and drop locations must be different for One Way and Round Trip bookings."
				}
			})
			return
		}



		// calculate distance and duration of locations entered and wait before navigating to next page for successful operation 
		// intialize array instances of coordinates
		let pickup_coordinates = []; let dropoff_coordinates = []

		let a = this.QBForm.pickup_type.value,
			b = this.QBForm.dropoff_type.value

		// -------------------- if airport ?? ------------------
		if (a == 'airport') {
			pickup_coordinates.push({
				lat: this.QBForm.pickup_airport_lat.value,
				lng: this.QBForm.pickup_airport_long.value
			})
		} else {
			// push for address
			pickup_coordinates.push({
				lat: this.QBForm.pickup_address_lat.value,
				lng: this.QBForm.pickup_address_long.value
			})
		}

		if (b == 'airport') {
			dropoff_coordinates.push({
				lat: this.QBForm.dropoff_airport_lat.value,
				lng: this.QBForm.dropoff_airport_long.value
			})
		} else {
			//  push for address
			dropoff_coordinates.push({
				lat: this.QBForm.dropoff_address_lat.value,
				lng: this.QBForm.dropoff_address_long.value
			})
		}

		if (this.QBForm.service_type.value == 'round_trip') {
			if (a == 'airport') {
				dropoff_coordinates.push({
					lat: this.QBForm.return_dropoff_airport_lat.value,
					lng: this.QBForm.return_dropoff_airport_long.value
				})
			} else {
				dropoff_coordinates.push({
					lat: this.QBForm.return_dropoff_address_lat.value,
					lng: this.QBForm.return_dropoff_address_long.value
				})
			}
			if (b == 'airport') {
				pickup_coordinates.push({
					lat: this.QBForm.return_pickup_airport_lat.value,
					lng: this.QBForm.return_pickup_airport_long.value
				})
			} else {
				pickup_coordinates.push({
					lat: this.QBForm.return_pickup_address_lat.value,
					lng: this.QBForm.return_pickup_address_long.value
				})
			}
		}

		console.log(pickup_coordinates, dropoff_coordinates)
		// return


		this.spinner.show();
		// finally calculate the distance between the coordinates and proceed after success only else show error
		(pickup_coordinates.length > 0 || dropoff_coordinates.length > 0) && this.calculateDistance(pickup_coordinates, dropoff_coordinates).then((response: any) => {
			//store data in localstorage after succesfully sending request to backend 
			this.quoteBotForm.value['other_details'] = this.vars

			console.log(`\n\n\n Receiving Response after filing the quote .....\n ${response} \n\n\n`, this.quoteBotForm.value)
			localStorage.setItem('quotebot_form', JSON.stringify(this.quoteBotForm.value));
			this.router.navigate(['quotebot/master-vehicle']);
			return
		}, (error) => {
			console.group('Facing Some Issues while calculating distance .... Error fetched ->\n')
			console.warn(error)
			console.log('\n ------ Quote Bot Form ------- \n', this.quoteBotForm.value)
			this.errorDialogService.openDialog({
				errors: {
					error: "Please provide valid location points."
				}
			})
			console.groupEnd()
		})
		this.spinner.hide()





	}

	swapPickupDropoff(value: any) {
		try {
			this.spinner.show()
			let temp_dropoff = {
				dropoff_address: this.quoteBotForm.get('dropoff_address')?.value,
				dropoff_airport: this.quoteBotForm.get('dropoff_airport')?.value,
				dropoff_airport_name: this.ReturnNameOfAirportById(this.quoteBotForm.get('dropoff_airport')?.value),
				dropoff_airport_lat: this.quoteBotForm.get('dropoff_airport_lat')?.value,
				dropoff_airport_long: this.quoteBotForm.get('dropoff_airport_long')?.value,
				dropoff_address_lat: this.quoteBotForm.get('dropoff_address_lat')?.value,
				dropoff_address_long: this.quoteBotForm.get('dropoff_address_long')?.value,
			}
			this.quoteBotForm.patchValue({
				pickup_type: this.quoteBotForm.get('dropoff_type')?.value,
				dropoff_type: this.quoteBotForm.get('pickup_type')?.value,

				dropoff_airport: this.quoteBotForm.get('pickup_airport')?.value,
				dropoff_airport_name: this.ReturnNameOfAirportById(this.quoteBotForm.get('pickup_airport')?.value),
				dropoff_address: this.quoteBotForm.get('pickup_address')?.value,
				dropoff_airport_lat: this.quoteBotForm.get('pickup_airport_lat')?.value,
				dropoff_airport_long: this.quoteBotForm.get('pickup_airport_long')?.value,
				dropoff_address_lat: this.quoteBotForm.get('pickup_address_lat')?.value,
				dropoff_address_long: this.quoteBotForm.get('pickup_address_long')?.value,
				pickup_address: temp_dropoff?.dropoff_address,
				pickup_airport: temp_dropoff?.dropoff_airport,
				pickup_airport_name: temp_dropoff?.dropoff_airport_name,
				pickup_airport_lat: temp_dropoff?.dropoff_airport_lat,
				pickup_airport_long: temp_dropoff?.dropoff_airport_long,
				pickup_address_lat: temp_dropoff?.dropoff_address_lat,
				pickup_address_long: temp_dropoff?.dropoff_address_long,


				return_pickup_airport: this.quoteBotForm.get('return_dropoff_airport')?.value,
				return_pickup_airport_name: this.quoteBotForm.get('return_dropoff_airport_name')?.value,
				return_pickup_address: this.quoteBotForm.get('return_dropoff_address')?.value,
				return_dropoff_airport: this.quoteBotForm.get('return_pickup_airport')?.value,
				return_dropoff_airport_name: this.quoteBotForm.get('return_pickup_airport_name')?.value,
				return_dropoff_address: this.quoteBotForm.get('return_pickup_address')?.value,
				return_pickup_airport_lat: this.quoteBotForm.get('return_dropoff_airport_lat')?.value,
				return_pickup_airport_long: this.quoteBotForm.get('return_dropoff_airport_long')?.value,
				return_pickup_address_lat: this.quoteBotForm.get('return_dropoff_address_lat')?.value,
				return_pickup_address_long: this.quoteBotForm.get('return_dropoff_address_long')?.value,
				return_dropoff_airport_lat: this.quoteBotForm.get('return_pickup_airport_lat')?.value,
				return_dropoff_airport_long: this.quoteBotForm.get('return_pickup_airport_long')?.value,
				return_dropoff_address_lat: this.quoteBotForm.get('return_pickup_address_lat')?.value,
				return_dropoff_address_long: this.quoteBotForm.get('return_pickup_address_long')?.value,
			})

		} catch (error) {
			this.spinner.hide()
			console.log(error)
		}
		// need to set values of vars
		this.vars = {
			dropoff_airport_name: this.ReturnNameOfAirportById(this.quoteBotForm.get('dropoff_airport')?.value),
			pickup_airport_name: this.ReturnNameOfAirportById(this.quoteBotForm.get('pickup_airport')?.value),
		}
		// if round trip selected

		if (this.QBForm.service_type.value == 'round_trip') {
			this.vars['return_dropoff_airport_name'] = this.vars['pickup_airport_name']
			this.vars['return_pickup_airport_name'] = this.vars['dropoff_airport_name']
		}
		this.spinner.hide()

	}
	ReturnNameOfAirportById(id: any) {
		let airport = this.airports_data?.find((item) => item.id == id)
		console.log('airport found-->>>', id, airport)
		if (airport) {
			return airport.airport
		}

		const airportFieldNames = ['pickup_airport', 'dropoff_airport', 'return_pickup_airport', 'return_dropoff_airport'];
		for (const fieldName of airportFieldNames) {
			if (this.quoteBotForm?.get(fieldName)?.value == id) {
				return this.quoteBotForm?.get(`${fieldName}_name`)?.value || '';
			}
		}

		return ''
	}



	// --------------------------------- 	Quotebot Data Ends 	----------------------------------------------










	//modal values
	modalSwitch(modalType, onRefresh = null) {
		switch (modalType) {
			case 'modal_1': {
				this.modalInformation = true;
				this.selectedModal = 'modal_1';
				this.modalHeading = "The Best Drivers and Nicest Vehicles";
				this.modalInstructions = "1-800-LIMO.COM’s mission is to match the best drivers with the best customers. Like any business,great drivers are hard to come by and keep. Drivers want to serve you but they are also in business to earn a living wage. We believe in offering our drivers and customers the opportunity to serve each other in the best partnership possible. Our drivers want to give you the safest and smoothest ride in a nicer, larger vehicle that they take pride in owning and maintaining. <br> If you don’t like a particular driver, no worries, we’ll match the right driver for next time. We don’t fire drivers, you do. Rate your driver with a thumbs for a great ride. Rate your driver thumbs down and let us know the details. Is it major or minor? Minor can be fixed, but a major problem will get immediate action to fix or inactive the driver. <br> We want all of our drivers to go the extra mile and give you a great experience. We encourage them to help you with your luggage to and from the vehicle, assist with the door if you prefer and just be as helpful as possible. If you’re from out of town, we encourage our drivers to know the best sights to see, dine out and the best hot spots. It doesn’t matter if you are abled or disabled, our drivers will treat you with respect and courtesy. <br> Drivers will carry insurance determined by local regulations.";
				break;
			}
			case 'modal_2': {
				this.modalInformation = true;
				this.selectedModal = 'modal_2';
				this.modalHeading = "Strong Background Checks, Fingerprinting and Vehicle Inspections";
				this.modalInstructions = "We believe our clients deserve to feel safe no matter which vehicle, driver or rate they choose. We pride ourselves in the fact that all of our drivers follow all local city, state and country regulations to insure you only get the best. Our drivers must pass our thorough requirement’s along with their vehicles passing bi-annual/annual safety inspections. We like demanding clients because we’re demanding too.";
				break;
			}
			case 'modal_3': {
				this.modalInformation = true;
				this.selectedModal = 'modal_3';
				this.modalHeading = "The Best Value";
				this.modalInstructions = "Our Quotebot is easy to use to find a rate. Rates are based primarily by size of the vehicle and number of passenger/luggage. We use Google Maps to estimate route and distance. We are not like other TNC that also charge you time like a taxi meter. <br> Just enter the pickup and drop off address and number of passengers and luggage. Our bot will recommend the best group of vehicles and rates that are acceptable to you. Ride by budget or ride in maximum comfort. Everyone is different! We will never Surge Price you and the quote is an all-inclusive rate. We do our best to figure taxes and tolls. Waiting time, extra stops and any other in route requests will be additional. You can touch the Pay button with the final total before you exit your vehicle for on-demand rides. Prearranged rides are prepaid and nothing to do but say thanks to your driver. <br> Our unique algorithm is designed to offer you the lowest available rate for any type vehicle,for any number of passengers, for any time you need quality transportation. We do allow our drivers to charge slightly higher rates during early morning, late night, holidays, high demand times and days of the week. But you will always see the lowest available rates.";
				break;
			}
			case 'modal_4': {
				this.modalInformation = true;
				this.selectedModal = 'modal_4';
				this.modalHeading = "Consistent Quality Service";
				this.modalInstructions = "Other TNCs claim to be Good, Fast and Cheap. We all know you can’t be all three and most would be happy to choose only two and hope for the best. <br> What’s the point of being in business if you’re not consistently Good, Cheap, or Fast? You can’t	afford to be late for a meeting, a plane, or a group or business event! You don’t want to over pay, ever! You want service to be consistent! Does your TNC do all three? How about two? <br> 1-800-LIMO.COM’s only goal is to be Good, all of the time, for worry-free transportation! <br> <strong>Fast Invoicing</strong> Just get in and go. You’ll get a very accurate all-inclusive rate when you book a ride and you’ll get a receipt by the time you exit your ride. We started the cashless transaction 16 years ago. You’ll know the Total Cost of your ride before leaving your vehicle. Just click the Pay button. <br> If your driver blows you away with kindness and personality, tip your driver extra in cash or on the app, and you can request that same great driver whenever you travel. What could be better than an extra tip and a repeat booking? We love clients like you and share that love and let	your friends know how good we are.";
				break;
			}
		}
		if (!onRefresh) {
			$('#myModal').modal('show');
		}
	}

	// fragment
	scroll(el: HTMLElement) {
		el.scrollIntoView();
	}

	//increment/decrement in ONE WAY form
	change(changeType: 'i' | 'd', fieldName: 'l' | 'p') {
		let max_length = 100
		if (fieldName == 'p') {
			// for passenger
			$('#no_of_passenger').addClass('highlight-text')
			setTimeout(() => {
				$('#no_of_passenger').removeClass('highlight-text')
			}, 1000)
			if (changeType == 'i' && this.quoteBotForm.value.no_of_passenger < max_length) {
				this.QBForm.no_of_passenger.setValue(parseInt(this.quoteBotForm.value.no_of_passenger) + 1)
			} else if (changeType == 'd' && this.quoteBotForm.value.no_of_passenger > 1) {
				this.QBForm.no_of_passenger.setValue(parseInt(this.quoteBotForm.value.no_of_passenger) - 1)
			}
		} else {
			// for luggage
			$('#no_of_luggage').addClass('highlight-text')
			setTimeout(() => {
				$('#no_of_luggage').removeClass('highlight-text')
			}, 1000)
			if (changeType == 'i' && this.quoteBotForm.value.no_of_luggage < max_length) {
				this.QBForm.no_of_luggage.setValue(parseInt(this.quoteBotForm.value.no_of_luggage) + 1)
			} else if (changeType == 'd' && this.quoteBotForm.value.no_of_luggage >= 1) {
				this.QBForm.no_of_luggage.setValue(parseInt(this.quoteBotForm.value.no_of_luggage) - 1)
			}
		}
	}


	// loginbuttons
	loginButtons(role: string) {
		if (role != 'driver' && role != 'sub_admin' && role != 'travel_agent' && role != 'individual' && role != 'subscriber') {
			this.errorDialogService.openDialog({
				errors: {
					error: 'Currently only Drivers are allowed to Sign In. User accounts coming soon! Recruiting quality vetted drivers, and chauffeurs, only at this time. Refer a trusted driver/ chauffeur to 1-800 - LIMO.COM now! You deserve the best.'
				}
			})
			return
		}
		//navigate to login screen
		this.router.navigateByUrl('/login/' + role);
	}

	get fGetInTouch() { return this.getInTouchForm.controls; }
	onSubmitGetInTouch() {
		console.log(this.getInTouchForm);
		this.submitted = true;
	}

	clearField() {
		$('#clearInput').value = '';
		console.log("clear 1415155")
	}


	// UNUSABLE
	onReset() {
		this.submitted = false;
		this.quoteBotForm.reset();
	}

	dashboard(role) {
		if (role == 'affiliate') {
			let isAffiliate_approved = localStorage.getItem('account_approval')
			this.spinner.show();//show spinner
			if (isAffiliate_approved == "accepted") {
				this.router.navigateByUrl('/affiliate/my-bookings');
			}
			else {
				this.router.navigateByUrl('/affiliate');
				console.log("step 0  dashboard")
			}
		}
		else if (role == 'admin') {
			this.spinner.show();//show spinner
			this.router.navigateByUrl('/admin/daily-bookings-admin');
			console.log("step 0  dashboard");
		}
		else if (role == 'driver') {
			this.spinner.show();
			this.router.navigateByUrl('/affiliate/my-bookings');
		}
		else if (role == 'sub_affiliate') {
			this.router.navigateByUrl('/sub_affiliate/my-bookings');
		}
		else {
			console.log(`redirecting to ${role}/bookings`)
			this.spinner.show();
			this.router.navigateByUrl(`${role}/bookings`)
		}
	}

	logout() {
		this.spinner.show();//show spinner
		this.authService.logout()
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(({ success }: any) => {
				this.spinner.hide();//hide spinner
				if (success) {
					this.stateManagementService.removeUser();
					this.router.navigate(['/home']);
					location.reload()
					console.log("Logout Successfully");
				}
			});
	}

	joinButton() {
		if (this.currentUser?.created_by_role == 'subscriber') {
			this.errorDialogService.openDialog({
				errors: {
					error: "You are already registered with as subscriber!"
				}
			})
		}
		else {
			this.router.navigate(['/subscription'])
		}
	}

	//conver text to html

	convertTextToHtml(str: string): string {
		if (!str) return '';

		return str
			// temporarily protect <small> tags
			.replace(/<small>/gi, '___SMALL_OPEN___')
			.replace(/<\/small>/gi, '___SMALL_CLOSE___')

			// escape everything else
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;')

			// restore <small> tags
			.replace(/___SMALL_OPEN___/g, '<small>')
			.replace(/___SMALL_CLOSE___/g, '</small>');
	}


	initClientCarousel() {
		// Wait for DOM and data to be ready
		setTimeout(() => {
			if (this.clientLogoContainer && this.clientLogoContainer.nativeElement && this.clientImages && this.clientImages.length > 0) {
				// Destroy existing Swiper instance if it exists
				if (this.clientLogoSwiper) {
					this.clientLogoSwiper.destroy(true, true);
					this.clientLogoSwiper = null;
				}

				// Check if navigation should be enabled (desktop only)
				const isDesktop = window.innerWidth >= 768;
				const nextButton = this.clientLogoContainer.nativeElement.querySelector('.client-logo-swiper-button-next');
				const prevButton = this.clientLogoContainer.nativeElement.querySelector('.client-logo-swiper-button-prev');

				const navButtons = nextButton && prevButton ? {
					nextEl: nextButton,
					prevEl: prevButton,
					disabledClass: 'swiper-button-disabled',
				} : false;

				// Initialize Swiper
				this.clientLogoSwiper = new Swiper(this.clientLogoContainer.nativeElement, {
					modules: [Navigation, Autoplay, Pagination],
					slidesPerView: 4,
					spaceBetween: 8,
					loop: this.clientImages.length > 2,
					autoplay: {
						delay: 2000,
						disableOnInteraction: false,
						pauseOnMouseEnter: true,
					},
					pagination: {                // ✅ THIS IS "dots"
						el: '.swiper-pagination',
						clickable: true,
						dynamicBullets: false
					},
					speed: 300,
					watchOverflow: true,
					watchSlidesProgress: true,
					centeredSlides: false,
					centeredSlidesBounds: false,
					preventClicks: true,
					preventClicksPropagation: true,
					slideToClickedSlide: false,
					navigation: navButtons,
					breakpoints: {
						0: {
							slidesPerView: 2,
							spaceBetween: 0,
							centeredSlides: false,
						},
						375: {
							slidesPerView: 2,
							spaceBetween: 0,
						},
						480: {
							slidesPerView: 2,
							spaceBetween: 0,
						},
						640: {
							slidesPerView: 2,
							spaceBetween: 0,
						},
						768: {
							slidesPerView: 4,
							spaceBetween: 20,
						},
						992: {
							slidesPerView: 4,
							spaceBetween: 20,
						},
						1200: {
							slidesPerView: 5,
							spaceBetween: 25,
						}
					},
					on: {
						init: () => {
							// Force update after initialization
							if (this.clientLogoSwiper) {
								setTimeout(() => {
									this.clientLogoSwiper?.update();
								}, 100);
							}
						}
					}
				});
			} else if (this.clientImages && this.clientImages.length > 0) {
				// Retry if container not ready yet
				setTimeout(() => this.initClientCarousel(), 200);
			}
		}, 100);
	}

	initVehicleCarousel() {
		// Initialize vehicle carousel with improved settings
		const $vehicleCarousel = $('.chk_vehicles');

		if ($vehicleCarousel.length > 0) {
			// Destroy existing carousel if it exists
			if ($vehicleCarousel.hasClass('owl-loaded')) {
				$vehicleCarousel.trigger('destroy.owl.carousel');
				$vehicleCarousel.removeClass('owl-loaded');
				$vehicleCarousel.find('.owl-stage-outer').children().unwrap();
			}

			// Initialize with optimized settings
			$vehicleCarousel.owlCarousel({
				loop: true,
				margin: 15,
				dotsEach: 3,
				autoplay: true,
				autoplayTimeout: 4000,
				autoplayHoverPause: true,
				smartSpeed: 800,
				dots: true,
				nav: true,
				responsiveClass: true,
				// navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
				// 	'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve"> <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
				responsive: {
					0: {
						items: 1,
						nav: false,
						loop: true,
						dots: true
					},
					575: {
						items: 2,
						nav: true,
						dots: true
					},
					992: {
						items: 3, // Desktop: 3 items as requested
						nav: true,
						loop: true,
						margin: 20,
						dots: false
					}
				}
			});
		}
	}

	initOtherCarousels() {
		// Initialize all other carousels with 1 item on mobile
		setTimeout(() => {
			// General owl carousels
			$('.owl-carousels').owlCarousel({
				loop: true,
				autoplay: true,
				autoplayTimeout: 2000,
				dotsEach: 3,
				dots: true,
				autoplayHoverPause: true,
				margin: 10,
				responsiveClass: true,
				// navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
				// 	'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"> <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
				responsive: {
					0: {
						items: 1, // Mobile: 1 item
						nav: false,
						loop: true,
						dots: true
					},
					600: {
						items: 2, // Tablet: 2 items
						nav: true,
						dots: true
					},
					1000: {
						items: 3, // Desktop: 3 items
						nav: true,
						loop: true,
						autoplay: true,
						margin: 20
					}
				}
			});

			// Destination carousel
			$('.destinationCarousel').owlCarousel({
				loop: true,
				autoplay: false,
				dotsEach: 3,
				dots: true,
				autoplayTimeout: 2000,
				autoplayHoverPause: true,
				margin: 10,
				responsiveClass: true,
				// navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
				// 	'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"> <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
				responsive: {
					0: {
						items: 1, // Mobile: 1 item
						nav: false,
						loop: true,
						dots: true
					},
					600: {
						items: 2, // Tablet: 2 items
						nav: true,
						dots: true
					},
					1000: {
						items: 3, // Desktop: 3 items
						nav: true,
						loop: true,
						autoplay: false,
						margin: 10,
						dots: true
					}
				}
			});

			// View vehicle carousel
			$('.viewVehicleCarousel').owlCarousel({
				loop: true,
				autoplay: true,
				autoplayTimeout: 2000,
				dotsEach: 3,
				dots: true,
				autoplayHoverPause: true,
				margin: 10,
				responsiveClass: true,
				// navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
				// 	'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"> <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
				responsive: {
					0: {
						items: 1, // Mobile: 1 item
						nav: false,
						loop: true,
						dots: true
					},
					600: {
						items: 2, // Tablet: 2 items
						nav: true,
						dots: true
					},
					1000: {
						items: 3, // Desktop: 3 items
						nav: true,
						loop: true,
						autoplay: true,
						margin: 20,
						dots: true
					}
				}
			});

			// View vehicle carousel
			$('.viewClientLogo').owlCarousel({
				loop: true,
				autoplay: true,
				autoplayTimeout: 2000,
				dotsEach: 3,
				dots: true,
				autoplayHoverPause: true,
				margin: 10,
				responsiveClass: true,
				// navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
				// 	'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve" fill="#fff"> <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
				responsive: {
					0: {
						items: 1, // Mobile: 1 item
						nav: false,
						loop: true,
						dots: true
					},
					600: {
						items: 2, // Tablet: 2 items
						nav: true,
						dots: true
					},
					1000: {
						items: 3, // Desktop: 3 items
						nav: true,
						loop: true,
						autoplay: true,
						margin: 20,
						dots: true
					},
					1199: {
						items: 4, // Desktop: 3 items
						nav: true,
						loop: true,
						autoplay: true,
						margin: 20,
						dots: true
					},
					1380: {
						items: 5, // Desktop: 3 items
						nav: true,
						loop: true,
						autoplay: true,
						margin: 20,
						dots: true
					}
				}
			});

			// client_logo carousel is now handled by Swiper in initClientCarousel() method
		}, 200);
	}

	// Initialize step rotation animation for "How Works" section
	initStepRotation() {
		this.startStepRotation();
	}

	startStepRotation() {
		// Clear any existing interval
		if (this.stepRotationInterval) {
			clearInterval(this.stepRotationInterval);
		}

		// Start with step 1
		this.currentActiveStep = 1;
		this.updateProgress(); // Set initial state

		// Rotate through steps every 2 seconds (faster animation)
		this.stepRotationInterval = setInterval(() => {
			this.currentActiveStep++;
			if (this.currentActiveStep > 4) {
				this.currentActiveStep = 1; // Loop back to start
			}
			this.updateProgress();
		}, 1000); // 2 seconds per step for faster flow
	}

	manualSelectStep(step: number) {
		// Stop auto-rotation if user interacts
		if (this.stepRotationInterval) {
			clearInterval(this.stepRotationInterval);
		}
		this.currentActiveStep = step;
		this.updateProgress();
	}

	updateProgress() {
		// Calculate width: 
		// Step 1 = 0%, Step 2 = 33%, Step 3 = 66%, Step 4 = 100% of the LINE width.
		// Since there are 3 segments connecting 4 points:
		const segments = 3;
		const stepIndex = this.currentActiveStep - 1;
		this.progressWidth = (stepIndex / segments) * 100;
	}

	@HostListener('window:resize', ['$event'])
	onResize(event: any) {
		// Refresh Swiper on resize to fix rendering issues
		if (this.clientLogoSwiper && this.clientImages && this.clientImages.length > 0) {
			// Use debounce to avoid excessive refreshes
			clearTimeout((this as any).resizeTimeout);
			(this as any).resizeTimeout = setTimeout(() => {
				if (this.clientLogoSwiper) {
					this.clientLogoSwiper.update();
					// Reinitialize if navigation state changed (desktop <-> mobile)
					const isDesktop = window.innerWidth >= 768;
					const shouldHaveNav = isDesktop;
					const currentNav = this.clientLogoSwiper.params.navigation;
					const hasNav = currentNav !== false && currentNav !== null && currentNav !== undefined;

					if (shouldHaveNav !== hasNav) {
						this.initClientCarousel();
					}
				}
			}, 250);
		}
	}

	ngOnDestroy(): void {
		if (this.quoteBotAutofillSyncInterval) {
			clearInterval(this.quoteBotAutofillSyncInterval);
		}
		if (this.quoteBotAutocompleteRetryTimeout) {
			clearTimeout(this.quoteBotAutocompleteRetryTimeout);
		}
		// Clean up step rotation interval
		if (this.stepRotationInterval) {
			clearInterval(this.stepRotationInterval);
		}
		// Clean up resize timeout
		if ((this as any).resizeTimeout) {
			clearTimeout((this as any).resizeTimeout);
		}
		Object.values(this.airportSearchDebounceTimers).forEach((timer) => clearTimeout(timer));
		this.airportSearchDebounceTimers = {};
		this.airportAutocompleteSessionTokens = {};
		// Clean up Swiper instance
		if (this.clientLogoSwiper) {
			this.clientLogoSwiper.destroy(true, true);
			this.clientLogoSwiper = null;
		}
	}

	toggleAppStorePopup() {
		this.showAppStorePopup = !this.showAppStorePopup;
	}
}
