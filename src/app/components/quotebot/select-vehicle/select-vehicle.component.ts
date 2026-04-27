import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { bindCallback, Observable, Subscription, throwError } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { ErrorDialogService } from '../../../services/error-dialog/errordialog.service';
import { StateManagementService } from '../../../services/statemanagement.service';
import { QuotebotService } from '../../../services/quotebot.service';
import { SharedModule } from '../../shared/shared.module';
import { AdminService } from '../../../services/admin.service';
import { AmenitiesService } from 'src/app/services/amenities.service';

declare let $: any


interface Filters {
	original: Object,
	copy: Object,
	request: Object,	// request for the response of selected filters from backend
	selections: Array<Object>,
	vars: Object
}

@Component({
	selector: 'app-select-vehicle',
	templateUrl: './select-vehicle.component.html',
	styleUrls: ['./select-vehicle.component.scss']
})
export class SelectVehicleComponent implements OnInit {
	@ViewChild("inputmsg", { static: false }) message: ElementRef;
	@ViewChild("sendEmailModalFocus") sendEmailModalFocus: any;
	/**
	 * 
	 * Please DO NOT CHANGE any conditions in this file.
	 * 
	 * 
	 * The code written here is very much interdependent and made dirty, reason being the interdependency.
	 *  
	 * 
	 * All the conditions are made with the permission of client and may face consequences in other parts of the code if changed at any place. 
	 * 
	 * 
	 * This file took a total of 1 month to make an error free and bug free.
	 * (especially the filters functionality)
	 * 
	 * For changes or adding any functionality, make sure you UNDERSTAND each and every dependency of this file. 
	 * 
	 * 
	 * 
	 */
	innerWidth = window.innerWidth
	currentUser = JSON.parse(localStorage.getItem('currentUser'))


	FILTERS_ORDER = [
		{
			dp: 'vehicle-type-preferences',
			rp: 'vehicle-type'
		},
		{
			dp: 'driver-preferences',
			rp: [
				{
					dp: 'dresses',
					rp: 'driver-dresses'
				},
				{
					dp: 'languages',
					rp: 'driver-languages'
				},
				{
					dp: 'gender',
					rp: 'driver-gender'
				}
			]
		},
		{
			dp: 'extra-$-amenities',
			rp: 'amenities'
		},
		{
			dp: 'make-model',
			rp: [
				{
					dp: 'make',
					rp: 'make'
				},
				{
					dp: 'model',
					rp: 'model'
				},
			],
		},
		{
			dp: 'years',
			rp: 'years'
		},
		{
			dp: 'colors',
			rp: 'colors'
		},
		{
			dp: 'interiors',
			rp: 'interiors'
		}
		,
		{
			dp: 'amenities',
			rp: 'special-amenities'
		},
		{
			dp: 'vehicle-service-area-type',
			rp: 'vehicle-service-area'
		},
		{
			dp: 'operator-preferences',
			rp: 'affiliate-preferences',
		}
	]

	// FILTERS_ORDER = [
	// 	{
	// 		dp: 'vehicle-type-preferences',
	// 		rp: 'vehicle-type'
	// 	},
	// 	{
	// 		dp: 'make-model',
	// 		rp: [
	// 			{
	// 				dp: 'make',
	// 				rp: 'make'
	// 			},
	// 			{
	// 				dp: 'model',
	// 				rp: 'model'
	// 			},
	// 		],
	// 	},
	// 	{
	// 		dp: 'year-color-interior',
	// 		rp: [
	// 			{
	// 				dp: 'year',
	// 				rp: 'years'
	// 			},
	// 			{
	// 				dp: 'color',
	// 				rp: 'colors'
	// 			},
	// 			{
	// 				dp: 'interior',
	// 				rp: 'interiors'
	// 			}
	// 		]
	// 	},
	// 	{
	// 		dp: 'amenities',
	// 		rp: 'amenities'
	// 	},
	// 	{
	// 		dp: 'extra-$-amenities',
	// 		rp: 'special-amenities'
	// 	},
	// 	{
	// 		dp: 'driver-preferences',
	// 		rp: [
	// 			{
	// 				dp: 'dresses',
	// 				rp: 'driver-dresses'
	// 			},
	// 			{
	// 				dp: 'languages',
	// 				rp: 'driver-languages'
	// 			},
	// 			{
	// 				dp: 'gender',
	// 				rp: 'driver-gender'
	// 			},
	// 			{
	// 				dp: 'background',
	// 				rp: 'driver-background'
	// 			}
	// 		]
	// 	},
	// 	{
	// 		dp: 'vehicle-service-area',
	// 		rp: 'vehicle-service-area'
	// 	},
	// 	{
	// 		dp: 'operator-preferences',
	// 		rp: 'affiliate-preferences',
	// 	}
	// ]

	modal_driver_info_labels: Array<String> = ['name', 'gender', 'phone', 'languages', 'experience', 'dress', 'background', 'starRating']
	vehicleDetails: any = [];
	vehicleImages: Array<any> = []
	master_vehicles: Array<any> = []
	booking_created_from: string = 'admin';

	// Filters

	filters: Filters = {
		original: JSON.parse(sessionStorage.getItem('filters'))?.original,
		copy: JSON.parse(sessionStorage.getItem('filters'))?.copy,
		request: JSON.parse(sessionStorage.getItem('filters'))?.request,
		selections: JSON.parse(sessionStorage.getItem('filters'))?.selections,
		vars: JSON.parse(sessionStorage.getItem('filters'))?.vars
		// original:"" ,
		// copy: "",
		// request:"",
		// selections: [],
		// vars: ""
	}

	min_length: number = 12 	// number of filters to show in one column and on the filters sidebar

	// filter modal to show more filters exceeding specified limit
	filter_title: string 	// filter modal title
	selection_made_button: string
	no_vehicle_msg: string = ''
	filter_body: Array<any> = []	// filter modal body - probably list

	category_selected: any
	vehicle_selected: any
	quotebot_form: any
	role: number = JSON.parse(localStorage.getItem("currentUser"))?.role
	openfilters: boolean = false
	changeText: boolean = false
	bookingId: any = null;
	quotebotNewData: any;
	isLoading: boolean = true;
	skeletonItems = new Array(6).fill(0);
	show = false;
	notification_msg: any;
	passengerDetails: any;
	currencySymbol: any;
	vehicleListAmenity: any = [];
	selectedAffiliate: any;

	get requestedExtraStops(): string[] {
		return (this.quotebot_form?.extra_stops || [])
			.map((s: any) => s?.address)
			.filter(Boolean);
	}

	get requestedAmenityNames(): string[] {
		const ids: number[] = [
			...(this.quotebot_form?.amenities || []),
			...(this.quotebot_form?.chargedAmenities || [])
		];
		return this.getAmenityNamesByIds(ids);
	}

	private getSavedAmenityIds(): number[] {
		return [...new Set(
			[
				...(this.quotebot_form?.amenities || []),
				...(this.quotebot_form?.chargedAmenities || [])
			]
				.map((id: any) => Number(id))
				.filter((id: number) => !Number.isNaN(id) && id > 0)
		)];
	}

	private findAmenitySelection(id: number): { category: string, amenity: any } | null {
		const originalFilters = this.filters.original as any;
		for (const category of ['amenities', 'special-amenities']) {
			const amenity = originalFilters?.[category]?.find((item: any) => item.id == id && item.id !== 0);
			if (amenity) {
				return { category, amenity };
			}
		}

		return null;
	}

	private ensureFilterVisible(category: string, selector: any): void {
		const copiedFilters = this.filters.copy as any;
		if (!Array.isArray(copiedFilters?.[category])) {
			return;
		}

		if (copiedFilters[category].findIndex((item: any) => item.id == selector.id) == -1) {
			copiedFilters[category] = [...copiedFilters[category], selector];
		}
	}

	private applySavedAmenitySelections(): void {
		this.getSavedAmenityIds().forEach((id: number) => {
			const match = this.findAmenitySelection(id);
			if (!match) {
				return;
			}

			this.ensureFilterVisible(match.category, match.amenity);

			if (this.filters.selections.findIndex(item => item['catg_name'] == match.category && item['id'] == match.amenity.id) == -1) {
				this.filterSelection(true, match.category, match.amenity);
			}
		});
	}

	private getAmenityNamesByIds(ids: number[]): string[] {
		const amenityNames: string[] = [];

		[...new Set(
			(ids || [])
				.map((id: any) => Number(id))
				.filter((id: number) => !Number.isNaN(id) && id > 0)
		)].forEach((id: number) => {
			const match = this.findAmenitySelection(id);
			if (match && amenityNames.indexOf(match.amenity.name) == -1) {
				amenityNames.push(match.amenity.name);
			}
		});

		return amenityNames;
	}

	@HostListener('window:popstate')
	handleBrowserBack(): void {
		this.closeTransientPopups();
		// Clear saved amenities so master-vehicle won't auto-redirect back to select-vehicle
		if (this.quotebot_form) {
			this.quotebot_form.amenities = [];
			this.quotebot_form.chargedAmenities = [];
			localStorage.setItem('quotebot_form', JSON.stringify(this.quotebot_form));
		}
	}
 selectedAmenities: number[] = [];
private subscription: Subscription;


	constructor(
		private $quotebotService: QuotebotService,
		private $spinner: NgxSpinnerService,
		private $router: Router,
		private $errorDialog: ErrorDialogService,
		private $state: StateManagementService,
		private $activatedRoute: ActivatedRoute,
		private $globals: SharedModule,
		private adminService: AdminService,
		private amenitiesService: AmenitiesService
	) {
		console.log('in constructor select vehicle')
	}

	/**
	 * make sure the quote has been filled before doing anything on this page, else navigate back to home for quote filling
	 * Fetching Master Vehicles Categories
	 * Fetching all filters
	 * Building fiters array for selected ones and to be sent to backend
	 * Fetching vehicle details based on filters data
	 */
	ngOnInit(): void {
			window.scrollTo(0, 0);
			this.isLoading = true;

			try {
				// 1. First, subscribe to amenities service (so that selectedAmenities is updated)
				this.subscription = this.amenitiesService.selectedAmenities$.subscribe(amenities => {
				console.log('[SelectVehicle] received amenities from service:', amenities);
				this.selectedAmenities = amenities;
				if (this.quotebot_form) {
					this.quotebot_form.amenities = amenities;
				}
				});

				// 2. Now load quotebot_form from localStorage
				if (!localStorage.getItem('quotebot_form')) {
				this.$errorDialog.openDialog({
					errors: { error: "Please request a Quote before selecting a vehicle." }
				});
				this.$router.navigateByUrl('/');
				return;
				}
				this.quotebot_form = JSON.parse(localStorage.getItem('quotebot_form'));

				// 3. Check filters
				if (!JSON.parse(sessionStorage.getItem('filters'))) {
				this.$router.navigateByUrl('/home');
				}

				this.$spinner.show();
				sessionStorage.getItem('selected_vehicle') ? sessionStorage.removeItem('selected_vehicle') : '';

				// 4. Now call APIs – they will use the updated this.selectedAmenities
				this.fetchMasterVehicles();
				this.getAllFilters();

				this.$activatedRoute.queryParams.subscribe((params: any) => {
				if (params?.id) this.bookingId = params?.id;
				if (params?.list == 'master') this.vehicleDetails = [];
				if (params?.sort == 'plh') this.Sort.LowToHigh();
				else this.Sort.HighToLow();
				});

				if (this.bookingId) {
				this.getQuoteDetails(this.bookingId);
				} else {
				this.getVehicleDetails();
				}

				let currency = JSON.parse(sessionStorage.getItem('currencyData'));
				this.currencySymbol = currency?.symbol;

			} catch (error) {
				console.log('errr----->>', error);
			}
    }
	

	// documentgetElementById('affiliate-info')
	isArray(value: any): boolean {
		return Array.isArray(value)
	}


	//increment/decrement in ONE WAY form
	change(changeType: 'i' | 'd', fieldName: 'l' | 'p') {
		// console.log(changeType, fieldName)
		let max_length = 75
		if (fieldName == 'p') {
			// for passenger
			if (changeType == 'i' && this.quotebot_form.no_of_passenger < max_length) {
				this.quotebot_form['no_of_passenger'] = this.quotebot_form.no_of_passenger + 1
			} else if (changeType == 'd' && this.quotebot_form.no_of_passenger > 1) {
				this.quotebot_form['no_of_passenger'] = this.quotebot_form.no_of_passenger - 1
			}
		} else {
			// for luggage
			if (changeType == 'i' && this.quotebot_form.no_of_luggage < max_length) {
				this.quotebot_form['no_of_luggage'] = this.quotebot_form.no_of_luggage + 1
			} else if (changeType == 'd' && this.quotebot_form.no_of_luggage >= 1) {
				this.quotebot_form['no_of_luggage'] = this.quotebot_form.no_of_luggage - 1
			}
		}
		localStorage.setItem('quotebot_form', JSON.stringify(this.quotebot_form))
	}


	editAffiliateAccount(vehInfo: any) {
		console.log('valueee--->>>>', vehInfo)
		// this.affiliateService.updateStepsArrayLocal(this.response.data.affiliateParmas.step_completed);
		// this.affiliateService.updateStepsCompletedObject(this.response.data.affiliateParmas.step_completed_obj);
		sessionStorage.setItem('affiliateId', JSON.stringify(vehInfo.affiliate_id))
		sessionStorage.setItem("affiliateType", vehInfo.affiliate_type);
		// this.$router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
		// 	this.$router.navigate(['/admin/affiliate/step0']);
		// });
		const url = this.$router.serializeUrl(
			this.$router.createUrlTree(['/admin/affiliate/step0'], { queryParams: { affiliate: vehInfo.affiliate_id } })
		);

		window.open(url, '_blank');
		// affiliate_id: number, affiliate_type: string

	}

	fetchMasterVehicles(): Promise<Array<any> | string> {
		return new Promise((resolve, reject) => {
			const payload = {
			...this.quotebot_form,
				selected_amenities: this.amenitiesService.getCurrentValue() 
			};
			this.$quotebotService.getMasterVehicleTypes(payload)
			.pipe(catchError(err => throwError(err)))
			.subscribe((response: any) => {
				if (response.data.length === 0) {
				this.no_vehicle_msg = "No Vehicle Categories Found.";
				reject('No Master Vehicle Found.');
				return;
				}
				this.master_vehicles = response.data;
				sessionStorage.setItem('currencyData', JSON.stringify(response?.currency));
				this.currencySymbol = response.currency.symbol;
				resolve(this.master_vehicles);
			});
		});
	}

	/**
	 * Selects the vehicle and fills its data in filters data and selected filters array
	 *
	 * @param vehicle selected vehicle
	 */
	selectCategory(vehicle_name: string) {
		let vehicle_index = this.filters.original['vehicle-type'].findIndex(item => item['name'] == vehicle_name)
		this.filterSelection(true, 'vehicle-type', this.filters.original['vehicle-type'][vehicle_index])
		this.getVehicleDetails()
		window.scrollTo(0, 0)
	}


	/**
	 * Logic to fetch all filters from backend
	 */
	getAllFilters(): void {
		this.$spinner.show()
		this.$quotebotService.getAllFilters().subscribe((response: any) => {
			this.$spinner.hide()
			// format every filter name from response
			this.filters.original = JSON.parse(JSON.stringify(response.data)) // create a deep copy of the response object
			for (let catg in this.filters.original) {
				// changing the name here? Do not forget to change in the includes and selected filters function.
				if (this.filters?.selections.length) {
					this.filters.original[catg].unshift({ id: 0, name: 'any or all', checked: false })
				}
				else {
					this.filters.original[catg].unshift({ id: 0, name: 'any or all', checked: true })
				}
			}


			this.cutTillMinimum(this.min_length)	// cut the list till min length
			this.applySavedAmenitySelections()

			// this.filters.copy['driver-background'] = [{
			// 	slug: 'child_certified_driver',
			// 	name: 'Child Certified Driver'
			// }]
			// fetch the last selected category
			// this.$state.get().subscribe((data: any) =>
			// {
			// 	if (data && data.selected_filters != undefined)
			// 	{
			// 		data.selected_filters.forEach((item: Filters['selections']) =>
			// 		{
			// 			this.filterSelection(true, item['catg_name'], item)
			// 		})
			// 		this.getVehicleDetails()
			// 	}
			// })
			console.group('Filters List: ', this.filters)
			console.log('--------------------------------\n\n')
			console.groupEnd()
		});
	}


	cutTillMinimum(min_length: number) {
		// showing only till min_length
		for (let filter in this.filters.original) {
			if (Array.isArray(this.filters.original[filter]) && this.filters.original[filter].length > min_length) {
				// assign the filter with specified length into a new object
				this.filters.copy[filter] = this.filters.original[filter].slice(0, min_length)
			} else {
				// else, assign the filter into the new object
				this.filters.copy[filter] = this.filters.original[filter]
			}
			this.filters.vars[filter] = true
		}
	}


	/**
	 * Replaces any text with hyphen(-) or an underscore(_) with an empty space..
	 *
	 * @param value text to replace
	 * @returns replaced text
	 */
	formatter(value: string): string {
		if (value == null) { return }
		if (typeof (value) == 'number' || !isNaN(parseInt(value))) {
			return value
		}
		if (value == 'starRating') {
			value = 'star-rating'
		}
		if (value == 'oneway') {
			return 'One Way'
		}
		if (typeof (value) == 'string' && /[a-z]/.test(value.charAt(0))) {
			value = value.replace(value.charAt(0), value.charAt(0).toUpperCase())
		}
		return value.replace(/[-|_]/g, ' ')
	}

	halfText(text: string) {
		return (text.length > 15 && text.substring(0, 15) + '...') || text
	}

	searchIn(card_header: string, text: string) {
		console.log(card_header, text)
		if (text == '') {
			this.filters.vars[card_header] = true
			this.filters.copy[card_header] = this.filters.original[card_header].slice(0, this.min_length)
			return
		} else {
			this.filters.vars[card_header] = false
			this.filters.copy[card_header] = this.$globals.ListSearch('filter', this.filters.original[card_header], text, 'name')
		}
	}


	getKeyName(): string {
		return this.quotebot_form?.service_type
	}

	/**
	 * show more filters on click
	 * @param filter_name name of the filter category to populate
	 */
	add: number = this.min_length
	showMore(button_name: string, filter_name: string, addmore: boolean = true): void {
		if (!this.filters.vars[button_name]) {
			this.add += this.min_length
		} else {
			this.add = this.min_length
		}
		if (addmore) {
			// populate filters list
			this.filters.copy[filter_name] = this.filters.original[filter_name].slice(0, this.add)
		}
		else {
			this.filters.copy[filter_name] = this.filters.original[filter_name].slice(0, this.min_length)
		}

		if (this.filters.copy[filter_name].length == this.filters.original[filter_name].length) {
			this.filters.vars[button_name] = true
		}
		else {
			this.filters.vars[button_name] = false
		}

	}
	convertHrIntoDays(hours) {
		let res: any = hours / 24
		if (res <= 2) {
			res = hours + ' hrs'
		}
		if (2 < res && res < 7) {
			res = res + ' days'
		}
		if (7 <= res) {
			res = res / 7 + ' Wk'
		}
		return res;
	}


	/**
	 * get vehicle details according to filter applied. Hits api on every filter click
	 *
	 * @param filters_data [Required] the data to be sent to backend
	 * @returns void
	 */
	getVehicleDetails() {
		sessionStorage.setItem('filters', JSON.stringify(this.filters));
		this.isLoading = true;
		
		const payload = {
			...this.quotebot_form,
			filters: this.filters.request,
			user_id: this.currentUser?.id,
			selected_amenities: this.amenitiesService.getCurrentValue() 
		};
		
		this.$spinner.show();
		this.$quotebotService.getVehicleDetails(payload).subscribe({
			next: (response: any) => {
			if (response.data.length === 0) {
				this.no_vehicle_msg = 'No Vehicle found with the applied filter.';
			}
			this.vehicleDetails = [...response.data];
			this.vehicleDetails = this.vehicleDetails.map(i => {
				if (i?.affiliate_company && i?.affiliate_name) {
				i['readMore'] = (i?.affiliate_company?.length || i?.affiliate_name?.length) > 8;
				} else {
				i['readMore'] = false;
				}
				return i;
			});
			this.Sort.LowToHigh();
			this.$spinner.hide();
			this.isLoading = false;
			},
			error: (err) => {
			console.error(err);
			this.$spinner.hide();
			this.isLoading = false;
			}
		});
	}

	getQuoteDetails(id) {
		this.isLoading = true; // Show skeleton loader
		this.$quotebotService.getQuoteData(id).subscribe((response: any) => {
			try {
				console.log('in function get quote data', response)
				if (response.data.vehicleData.length == 0) {
					this.no_vehicle_msg = 'No Vehicle found with the applied filter.'
				}

				this.vehicleDetails = [...response.data?.vehicleData]
				this.quotebotNewData = response.data?.quote

				// let location_info = []
				// let tempObj = {
				// 	distance: {
				// 		text: this.quotebotNewData?.distance / 1000 + "km",
				// 		value: Number(this.quotebotNewData?.distance)
				// 	},
				// 	duration: {
				// 		text: this.quotebotNewData?.duration / 60 + "mins",
				// 		value: Number(this.quotebotNewData?.duration)
				// 	}
				// }
				// location_info.push(tempObj)
				// this.quotebotNewData['location_info'] = location_info
				console.log("in location->", this.quotebotNewData)
				localStorage.setItem('quotebot_form', JSON.stringify(this.quotebotNewData))
			} catch (error) {
				console.log("error-----_>", error)
			}
			this.vehicleDetails = this.vehicleDetails.map(i => {
				if (i?.affiliate_company && i?.affiliate_name) {
					i['readMore'] = (i?.affiliate_company?.length || i?.affiliate_name?.length) > 8 ? true : false
				}
				else {
					i['readMore'] = false
				}
				return i
			})
			console.log('vehicle details-->>>', this.vehicleDetails)
			// this.Sort.LowToHigh() // default sort to Low-High
			this.$spinner.hide()
			this.isLoading = false;
		})
	}




	/**
	 * Identifies the selection and fills the filter's variable intelligently
	 * @param is_checked: Boolean [Required] is the selection checked or not ? 
	   * @param selection_category: String [Required] category of the filter that is selected
	 * @param selector: Object [Required] selection object
	 */
	filterSelection(is_checked: boolean, sel_category: string, selector: object) {
		let sel_index: number = 0
		if (selector.hasOwnProperty('slug')) {
			sel_index = this.filters.original[sel_category].findIndex((item: any) => item.slug == selector['slug'])
		} else {
			sel_index = this.filters.original[sel_category].findIndex((item: any) => item.id == selector['id'])
		}
		console.log(`\nChecked: ${is_checked}\nCategory: ${sel_category}\nSelector | Index: ${selector} | ${sel_index}\n`)

		// ---------------------------------- Selection Part ------------------------
		if (is_checked) {
			// if 'any or all' filter gets selected directly
			if (sel_index == 0) {
				// remove all the filters of that category
				this.filters.selections = this.filters.selections.filter((item: Object) => item['catg_name'] != sel_category)
				// check the 'any or all' filter
				this.filters.copy[sel_category][0]['checked'] = true	// check operation
				delete this.filters.request[sel_category]	// delete selected category from the request
				return
				// end here only
			}


			/**
			 * Make sure the selections and request does'nt have duplicate values
			 * - Push after confirmed -
			 */
			(this.filters.selections.findIndex(item => item['catg_name'] == sel_category && item['name'] == selector['name']) == -1) &&
				this.filters.selections.push(Object.assign({}, { catg_name: sel_category, sel_index: sel_index }, { ...selector }))


			// refill the models according to selected make else with the default value.
			if (sel_category == 'make') {
				if (this.filters.selections.findIndex(item => item['catg_name'] == sel_category) == -1) {
					// default value
					this.filters.vars['model'] = true
					this.filters.copy['model'] = this.filters.original['model'].slice(0, this.min_length)
				} else {
					this.filters.vars['model'] = false 	// hide the Show More button
					let make_filters = this.filters.selections.filter((item) => item['catg_name'] == 'make')
					let array = []
					make_filters.forEach((item: any) => {
						array.push(item.id)
					})
					// refill the models
					this.filters.copy['model'] = this.filters.original['model'].filter(item => array.includes(item['make_id']))
				}
			}


			if (this.filters.request[sel_category] === undefined) {
				// push into a new category
				this.filters.request[sel_category] = []
				this.filters.request[sel_category].push(this.filters.original[sel_category][sel_index]['id'])
			}
			else {
				// push into existing category, after duplicacy values check
				this.filters.request[sel_category].findIndex(item => item == this.filters.original[sel_category][sel_index]['id']) == -1 &&
					this.filters.request[sel_category].push(this.filters.original[sel_category][sel_index]['id'])
			}
		}

		// ------------------------ Deselection -----------------------------
		if (!is_checked) {
			// removing from selections
			const index = this.filters.selections.findIndex(item => item['catg_name'] == sel_category && item['sel_index'] == sel_index)
			this.filters.selections.splice(index, 1)	// remove operation

			// removing from request
			this.filters.request[sel_category] = this.filters.request[sel_category].filter(item => item != selector['id'])

			// remove the key if list is empty
			this.filters.request[sel_category].length == 0 && delete this.filters.request[sel_category]

			if (sel_category == 'make') {
				// populate with all models if no selection of make exists
				if (this.filters.selections.findIndex(item => item['catg_name'] == sel_category) == -1) {
					this.filters.vars['model'] = true		// hide the Show More button
					// default sliced value
					this.filters.copy['model'] = this.filters.original['model'].slice(0, this.min_length)
				}
				else {
					this.filters.vars['model'] = false
					let make_filters = this.filters.selections.filter((item) => item['catg_name'] == 'make')
					let array = []
					make_filters.forEach((item: any) => {
						array.push(item.id)
					})
					this.filters.copy['model'] = this.filters.original['model'].filter((item: any) => array.includes(item['make_id']))
				}

			}
		}

		// no filter of that category exists in selections, then make any or all active.
		if (this.filters.selections.findIndex(item => item['catg_name'] == sel_category) == -1) {
			this.filters.copy[sel_category][0]['checked'] = true		// checked operation
		}
		else {
			this.filters.copy[sel_category][0]['checked'] = false		// unchecked operation
		}


		console.log(this.filters.request, this.filters.selections)
	}



	isFilterAlreadySelected(catg_name: string, fil: object): boolean {
		// return for all 'any or all' filters
		if (fil['id'] == 0) {
			return this.filters.copy[catg_name][0]['checked']
		}

		return !(this.filters.selections.findIndex(item => item['catg_name'] == catg_name && item['name'] == fil['name']) == -1)
	}

	showModal(vehicle_selected: any, selection_button: string) {
		this.vehicle_selected = vehicle_selected
		this.vehicle_selected['selection_button'] = selection_button
		$('#filtersModal').modal('toggle')
	}

	viewDetails(vehicle_selected: any) {
		sessionStorage.setItem('selected_vehicle', JSON.stringify(vehicle_selected))
		this.$state.set({
			selected_filters: this.filters.selections
		})
		this.$router.navigate(['quotebot/vehicle-details'], {
			queryParamsHandling: 'preserve'
		})
	}

	closeAllAccordian() {
		$('.collapse').collapse('hide');
	}

	/**
	 * Navigate to booking page for final confirmation or other details
	 *
	 * @params vehicle_selected: Any [Required] the selected vehicle
	 *
	 * @returns void
	 */
	bookNow(vehicle_selected: any) {
		// // console.log('Will navigate to Book Now Page ...')
		sessionStorage.setItem('selected_vehicle', JSON.stringify(vehicle_selected))
		if (vehicle_selected?.created_by != 1) {
			this.booking_created_from = 'subscriber'
		}
		if (localStorage.getItem('currentUser') != null) {
			if (JSON.parse(localStorage.getItem('currentUser'))['roleName'] == 'admin') {
				if (this.bookingId) {
					this.$router.navigate(['/admin/new-booking'],
						{ queryParams: { affiliate_id: vehicle_selected.affiliate_id, vehicle_id: vehicle_selected.id, new: 'reaffiliate', is_master_vehicle: vehicle_selected?.is_master_vehicle, updateType: 'reaffiliate', reaffiliate_book_id: this.bookingId } })
				}
				else {
					this.$router.navigate(['/admin/new-booking'],
						{ queryParams: { affiliate_id: vehicle_selected.affiliate_id, vehicle_id: vehicle_selected.id, new: true, is_master_vehicle: vehicle_selected?.is_master_vehicle, created_by: (JSON.parse(localStorage.getItem('currentUser'))['created_by_role'] == 'admin' ? 'admin' : this.booking_created_from) } })
				}
			} else {
				let user = JSON.parse(localStorage.getItem('currentUser'))['roleName']
				user = user == 'driver' ? 'affiliate' : user	// roleName of driver has to be directed to affiliate/..

				this.$router.navigate([
					'/' + user + '/create-new-booking'
				],
					{ queryParams: { affiliate_id: vehicle_selected.affiliate_id, vehicle_id: vehicle_selected.id, new: true, is_master_vehicle: vehicle_selected?.is_master_vehicle, created_by: this.booking_created_from } })
			}
		} else {
			// this.$errorDialog.openDialog({
			// 	errors: {
			// 		error: 'Please open an account or login to proceed.'
			// 	}
			// })
			// window.alert('Creating booking without logged In')
			this.$router.navigate([
				'/quotebot/new-booking'
			],
				{ queryParams: { affiliate_id: vehicle_selected.affiliate_id, vehicle_id: vehicle_selected.id, new: true, is_master_vehicle: vehicle_selected?.is_master_vehicle } })
			//  Redirecting to create new booking without login 
			// localStorage.setItem('QB_redirectUrl','true')
			// this.$router.navigate(['/login/driver'], {
			// 	skipLocationChange: true
			// })
		}
	}

	clearFilters(filter: Filters['selections']) {
		console.log('filter clear filter clicked--->>', !filter, this.filters.selections.length)
		if(this.quotebot_form?.amenities.length > 0){
			console.log('clearing amenities from quotebot form', this.quotebot_form.amenities)
			this.quotebot_form.amenities = [];
			localStorage.setItem('quotebot_form', JSON.stringify(this.quotebot_form))
		}
		if (this.filters.selections.length <= 1 || !filter) {
			this.$router.navigateByUrl('/quotebot/master-vehicle')
			return
		}  // don't do anything if no filter is selected

		if (filter !== null && this.filters.selections.length > 1) {
			// deselecting the filter will remove from selections and request
			this.filterSelection(false, filter['catg_name'], filter)
		} else {
			this.$spinner.show()
			// empty the whole
			this.filters.selections = []
			this.filters.request = {}
			this.vehicleDetails = []
			Object.keys(this.filters.copy).forEach((item: string) => {
				if (!this.filters.copy[item][0]['checked']) {
					this.filters.copy[item][0]['checked'] = true
				}
			})
			this.cutTillMinimum(this.min_length)	// reset the filters area
			this.$spinner.hide()
		}
	}



	Sort = {
		// fetch the service_type from quotebot 
		getkey: 'rate_breakdown_' + JSON.parse(localStorage.getItem('quotebot_form'))['service_type'], // modify the key
		LowToHigh: () => {
			let getKeyName = this.Sort.getkey
			console.log(getKeyName)
			// for Master Vehicles
			if (this.vehicleDetails.length == 0 && this.filters.selections.length == 0) {
				this.master_vehicles.length > 1 && this.master_vehicles.sort((a, b) => {
					if (a[getKeyName].length == 0 && b[getKeyName].length == 0) {
						a[getKeyName].grand_total = 0
						b[getKeyName].grand_total = 0
					}
					// validate if the key has values and then find the 'rate_breakdown_' key in object and sort
					return a[getKeyName].grand_total - b[getKeyName].grand_total
				})
			}

			// for vehicles
			this.vehicleDetails.length > 0 && this.vehicleDetails.sort((a, b) => {
				if (a[getKeyName].length == 0 && b[getKeyName].length == 0) {
					a[getKeyName].grand_total = 0
					b[getKeyName].grand_total = 0
				}
				return a[getKeyName].grand_total - b[getKeyName].grand_total
			})
		},
		HighToLow: () => {
			let getKeyName = this.Sort.getkey
			// for master vehicles
			if (this.vehicleDetails.length == 0 && this.filters.selections.length == 0) {
				this.master_vehicles.length > 1 && this.master_vehicles.sort((a, b) => {
					if (a[getKeyName].length == 0 && b[getKeyName].length == 0) {
						a[getKeyName].grand_total = 0
						b[getKeyName].grand_total = 0
					}
					// validate if the key has values and then find the 'rate_breakdown_' key in object and sort
					return b[getKeyName].grand_total - a[getKeyName].grand_total
				})
			}

			// for vehicles
			this.vehicleDetails.length > 0 && this.vehicleDetails.sort((a, b) => {
				if (a[getKeyName].length == 0 && b[getKeyName].length == 0) {
					a[getKeyName].grand_total = 0
					b[getKeyName].grand_total = 0
				}
				return b[getKeyName].grand_total - a[getKeyName].grand_total
			})
		}
	}

	backButton() {
		// Clear saved amenities so master-vehicle won't auto-redirect back to select-vehicle
		if (this.quotebot_form) {
			this.quotebot_form.amenities = [];
			this.quotebot_form.chargedAmenities = [];
			localStorage.setItem('quotebot_form', JSON.stringify(this.quotebot_form));
		}
		this.$router.navigateByUrl('/quotebot/master-vehicle')

		// remove all selections
		// while (this.filters.selections.length > 0)
		// {
		// 	let item = this.filters.selections[0]
		// 	this.filterSelection(false, item['catg_name'], item)
		// }
		// this.vehicleDetails = []
	}

	handleReadMore(vehinfo: any, check: boolean) {
		this.vehicleDetails = this.vehicleDetails.map(i => {
			if (i.id == vehinfo.id) {
				i['readMore'] = check
			}
			return i;
		})
	}


	openAffiliateDetailsModal(vehinfo: any) {
		this.passengerDetails = vehinfo;
		$('#sendEmailModal').modal('show');
	}

	openModal(vehinfo) {
		try {
			setTimeout(() => {
				// $('textarea').attr('autofocus', 'autofocus');
				this.sendEmailModalFocus.nativeElement
					.querySelector("textarea")
					.focus();
			}, 1000);
		} catch (error) {
			console.log("----------error------->>>>>> ", error);
		}
		this.passengerDetails = vehinfo;
		// this.passengerDetails["selection_button"] = selection_button;
	}


	messageField(format) {
		setTimeout(() => {
			this.sendEmailModalFocus.nativeElement
				.querySelector("textarea")
				.focus();
		}, 1000);
		this.show = true;
		// switch (format) {
		// 	case "Phone": {
		// 		this.sendMessageField = true;
		// 		break;
		// 	}
		// 	case "Email": {
		// 		this.sendMessageField = false;
		// 		break;
		// 	}
		// }
	}

	closeModal() {
		// this.sendEmailModal.nativeElement.querySelector('textarea').blur();
		$("#sendEmailModal").modal("hide");
		this.message.nativeElement.value = "";
		this.show = false;
		// this.sendEmailModal.nativeElement.querySelector('textarea').focus();
	}

	submit(message, vehicleDetails) {

		console.log("in submit---->", vehicleDetails)
		let obj = {
			reciptentName: this.passengerDetails?.affiliate_name,
			sendTo: 'Affiliate',
			sendThrough: "Phone",
			sendValue: this.passengerDetails?.affiliate_phone || this.passengerDetails?.phone,
			sendContent: message,
		};
		console.log("in submit obj---->", obj)
		this.adminService
			.adminNotification(obj)
			.pipe(
				catchError((err) => {
					return throwError(err);
				})
			)
			.subscribe(({ message }: any) => {
				this.notification_msg = message;
				$("#notificationModal").modal("show");
				console.log(message);
				$("textarea").val("");
			});
		$("#closeModal").click(() => {
			$("#notificationModal").modal("hide");
		});
		$("#closeModal1").click(() => {
			$("#notificationModal").modal("hide");
		});
		$("#sendEmailModal").modal("hide");
		this.message.nativeElement.value = "";
		this.show = false;
	}

	viewAmenities(id) {
		this.vehicleListAmenity = this.vehicleDetails.find(item => item.id === id);
		console.log("in veh amenity--->", this.vehicleListAmenity, '=====', this.vehicleListAmenity.amenities)
	}

	private closeTransientPopups(): void {
		this.openfilters = false;
		this.show = false;
		$('#sendEmailModal').modal('hide');
		$('#filtersModal').modal('hide');
		$('#notificationModal').modal('hide');
		$('.modal-backdrop').remove();
		$('body').removeClass('modal-open');
		$('body').css('padding-right', '');
	}
}
