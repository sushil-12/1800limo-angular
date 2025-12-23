import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { bindCallback, Observable, throwError } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { QuotebotService } from '../../../services/quotebot.service';
import { SharedModule } from '../../shared/shared.module';

declare let $: any


interface Filters {
	original: Object,
	copy: Object,
	request: Object,	// request for the response of selected filters from backend
	selections: Array<Object>,
	vars: Object
}

@Component({
	selector: 'app-master-vehicle',
	templateUrl: './master-vehicle.component.html',
	styleUrls: ['./master-vehicle.component.scss']
})
export class MasterVehicleComponent implements OnInit {

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
	vehicleDetails: Array<any> = []
	vehicleImages: Array<any> = []
	master_vehicles: Array<any> = []

	// Filters
	filters: Filters = {
		original: {},
		copy: {},
		request: {},
		selections: [],
		vars: {}
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
	currencySymbol: any;


	constructor(
		private $quotebotService: QuotebotService,
		private $spinner: NgxSpinnerService,
		private $router: Router,
		private $errorDialog: ErrorDialogService,
		private $state: StateManagementService,
		private $activatedRoute: ActivatedRoute,
		private $globals: SharedModule
	) { }

	/**
	 * make sure the quote has been filled before doing anything on this page, else navigate back to home for quote filling
	 * Fetching Master Vehicles Categories
	 * Fetching all filters
	 * Building fiters array for selected ones and to be sent to backend
	 * Fetching vehicle details based on filters data
	 */
	ngOnInit(): void {
		window.scrollTo(0, 0)
		// sessionStorage.removeItem('selected_vehicle')
		sessionStorage.removeItem('filters')
		console.log('filter removed from session storage')
		this.$spinner.show()
		// Note: Do not add anything here or before below conditional logic. This should be the first step
		if (localStorage.getItem('quotebot_form') == null) {
			this.$errorDialog.openDialog({
				errors: {
					error: "Please request a Quote before selecting a vehicle. "
				}
			})
			this.$router.navigateByUrl('/')
			return
		} else {
			// fetch the user's travelling quote
			this.quotebot_form = JSON.parse(localStorage.getItem('quotebot_form'))
		}

		this.$activatedRoute.queryParams.subscribe((params: any) => {
			if (params?.list == 'master') {
				this.vehicleDetails = []
			}
			if (params?.sort == 'plh') {
				this.Sort.LowToHigh()
			} else {
				this.Sort.HighToLow()
			}
		})

		this.fetchMasterVehicles()	// fetches 16 vehicle categories
		this.getAllFilters()	// fetch filters from database
	}
	// ngOnInit ends
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
			this.$router.createUrlTree(['/admin/affiliate/step0'])
		);

		window.open(url, '_blank');
		// affiliate_id: number, affiliate_type: string

	}


	fetchMasterVehicles(): Promise<Array<any> | string> {
		this.$spinner.show()
		return new Promise((resolve, reject) => {
			this.$quotebotService.getMasterVehicleTypes(this.quotebot_form).pipe(
				catchError(err =>  throwError(err))
			).subscribe((response: any) => {
				
				if (response.data.length == 0) {
					this.no_vehicle_msg = "No Vehicle Categories Found. "
					reject('No Master Vehicle Found.')
					return
				}
				this.master_vehicles = response.data
				sessionStorage.setItem('currencyData', JSON.stringify(response?.currency))
				this.currencySymbol = response.currency.symbol
				resolve(this.master_vehicles)
				this.$spinner.hide()
				return
			})
		})
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
				this.filters.original[catg].unshift({ id: 0, name: 'any or all', checked: true })
			}


			this.cutTillMinimum(this.min_length)	// cut the list till min length

			// fetch the last selected category
			// this.$state.get().subscribe((data: any) =>
			// {
			// 	if (data && data.selected_filters != undefined)
			// 	{
			// 		data.selected_filters.forEach((item: Filters['selections']) =>
			// 		{
			// 			this.filterSelection(true, item['catg_name'], item)
			// 		})
			// 		// this.getVehicleDetails()
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


	/**
	 * get vehicle details according to filter applied. Hits api on every filter click
	 *
	 * @param filters_data [Required] the data to be sent to backend
	 * @returns void
	 */
	getVehicleDetails() {
		sessionStorage.setItem('filters', JSON.stringify(this.filters))
		console.log('===============================>> navigate to select vehicle')
		this.$router.navigateByUrl('/quotebot/select-vehicle')
		// console.log('Fetching Vehicle Details. ')
		// let data = {}
		// if (this.quotebot_form != null)
		// {
		// 	data = this.quotebot_form
		// 	data['filters'] = this.filters.request
		// }
		// this.$spinner.show()
		// this.$quotebotService.getVehicleDetails(data).subscribe((response: any) =>
		// {
		// 	if (response.data.length == 0)
		// 	{
		// 		this.no_vehicle_msg = 'No Vehicle found with the applied filter.'
		// 	}
		// 	this.vehicleDetails = [...response.data]
		// 	this.vehicleDetails = this.vehicleDetails.map(i=> {
		// 		if(i?.affiliate_company && i?.affiliate_name){
		// 			i['readMore']=(i?.affiliate_company?.length || i?.affiliate_name?.length) > 8 ? true : false 
		// 		}
		// 		else{
		// 			i['readMore'] = false
		// 		}
		// 		return i
		// 	})
		// 	console.log('vehicle details-->>>' , this.vehicleDetails)
		// 	this.Sort.LowToHigh() // default sort to Low-High
		// 	this.$spinner.hide()
		// })
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
		if (localStorage.getItem('currentUser') != null) {
			if (JSON.parse(localStorage.getItem('currentUser'))['roleName'] == 'admin') {
				this.$router.navigate(['/admin/new-booking'],
					{ queryParams: { affiliate_id: vehicle_selected.affiliate_id, vehicle_id: vehicle_selected.id, new: true } })
			} else {
				let user = JSON.parse(localStorage.getItem('currentUser'))['roleName']
				user = user == 'driver' ? 'affiliate' : user	// roleName of driver has to be directed to affiliate/..

				this.$router.navigate([
					'/' + user + '/create-new-booking'
				],
					{ queryParams: { affiliate_id: vehicle_selected.affiliate_id, vehicle_id: vehicle_selected.id, new: true } })
			}
		} else {
			// this.$errorDialog.openDialog({
			// 	errors: {
			// 		error: 'Please open an account or login to proceed.'
			// 	}
			// })
			localStorage.setItem('QB_redirectUrl', 'true')
			this.$router.navigate(['/login/driver'], {
				skipLocationChange: true
			})
		}
	}

	clearFilters(filter: Filters['selections']) {
		if (this.filters.selections.length == 0) return // don't do anything if no filter is selected

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

		this.$router.navigateByUrl('/home')


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


}
