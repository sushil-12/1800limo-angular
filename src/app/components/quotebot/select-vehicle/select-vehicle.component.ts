import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { bindCallback, Observable, throwError } from 'rxjs';
import { catchError, filter } from 'rxjs/operators';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { QuotebotService } from '../../../services/quotebot.service';

declare let $: any


interface Filters
{
	id: number,
	slug?: string,
	make_id?: number,
	name: string
}

interface FiltersData
{
	return_name?: string,
	data?: Filters,
	display_name?: string
}

@Component({
	selector: 'app-select-vehicle',
	templateUrl: './select-vehicle.component.html',
	styleUrls: ['./select-vehicle.component.scss']
})
export class SelectVehicleComponent implements OnInit
{
	innerWidth = window.innerWidth


	FILTERS_ORDER = [
		{
			dp: 'vehicle-type-preferences',
			rp: 'vehicle-type'
		},
		{
			dp: 'make-and-model',
			rp: [
				{
					dp: 'make',
					rp: 'make'
				},
				{
					dp: 'model',
					rp: 'model'
				},
				{
					dp: 'interior',
					rp: 'interiors'
				},
				{
					dp: 'year',
					rp: 'years'
				},
				{
					dp: 'color',
					rp: 'colors'
				}
			]
		},
		{
			dp: 'amenities',
			rp: 'amenities'
		},
		{
			dp: 'extra-$-amenities',
			rp: 'special-amenities'
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
				},
				{
					dp: 'background',
					rp: 'driver-background'
				}
			]
		},
		{
			dp: 'vehicle service area',
			rp: 'vehicle-service-area'
		},
		{
			dp: 'operator-preferences',
			rp: 'affiliate-preferences',
		}
	]

	modal_driver_info_labels: Array<String> = ['name', 'gender', 'phone', 'languages', 'experience', 'dress', 'background', 'starRating']
	filtersList: Array<any> = [];
	vehicleDetails: Array<any> = []
	vehicleImages: Array<any> = []
	master_vehicles: Array<any> = []
	filters: any = {}
	filters_data: any = {}
	selected_filters: Array<{ category: string, name: string }> = []

	min_length: number = 12 	// number of filters to show in one column and on the filters sidebar

	// filter modal to show more filters exceeding specified limit
	filter_title: string 	// filter modal title
	selection_made_button: string
	no_vehicle_msg: string = ''
	filter_body: Array<any> = []	// filter modal body - probably list

	category_selected: any
	vehicle_selected: any
	quotebot_form: any

	openfilters: boolean = false

	is_show_more_button_hidden: boolean = false


	constructor(
		private _quotebotService: QuotebotService,
		private _spinner: NgxSpinnerService,
		private _router: Router,
		private _errorDialog: ErrorDialogService,
		private _activatedRoute: ActivatedRoute,
		private $state: StateManagementService
	) { }

	/**
	 * make sure the quote has been filled before doing anything on this page, else navigate back to home for quote filling
	 * Fetching Master Vehicles Categories
	 * Fetching all filters
	 * Building fiters array for selected ones and to be sent to backend
	 * Fetching vehicle details based on filters data
	 */
	ngOnInit(): void
	{
		this._spinner.show()
		sessionStorage.removeItem('selected_vehicle')
		// Do not add anything here or before below conditional logic. This should be the first step
		if (localStorage.getItem('quotebot_form') == null)
		{
			this._errorDialog.openDialog({
				errors: {
					error: "Please request a Quote before selecting a vehicle. "
				}
			})
			this._router.navigateByUrl('/')
			return
		} else
		{
			this.quotebot_form = JSON.parse(localStorage.getItem('quotebot_form'))
		}

		this.fetchMasterVehicles()
		this.getAllFilters()	// fetch filters from database

		// fetch the last selected category
		this.$state.getState().subscribe((data: any) =>
		{
			console.log(data)
			if (data.selected_filters != undefined)
			{
				this.selected_filters = data.selected_filters
				this.filters_data = data.filters_data
				this.getVehicleDetails(this.filters_data)
			}
		})
	}
	// ngOnInit ends

	isArray(value: any)
	{
		return Array.isArray(value)
	}


	//increment/decrement in ONE WAY form
	change(changeType: 'i' | 'd', fieldName: 'l' | 'p')
	{
		// console.log(changeType, fieldName)
		let max_length = 75
		if (fieldName == 'p')
		{
			// for passenger
			if (changeType == 'i' && this.quotebot_form.no_of_passenger < max_length)
			{
				this.quotebot_form['no_of_passenger'] = this.quotebot_form.no_of_passenger + 1
			} else if (changeType == 'd' && this.quotebot_form.no_of_passenger > 1)
			{
				this.quotebot_form['no_of_passenger'] = this.quotebot_form.no_of_passenger - 1
			}
		} else
		{
			// for luggage
			if (changeType == 'i' && this.quotebot_form.no_of_luggage < max_length)
			{
				this.quotebot_form['no_of_luggage'] = this.quotebot_form.no_of_luggage + 1
			} else if (changeType == 'd' && this.quotebot_form.no_of_luggage >= 1)
			{
				this.quotebot_form['no_of_luggage'] = this.quotebot_form.no_of_luggage - 1
			}
		}
		localStorage.setItem('quotebot_form', JSON.stringify(this.quotebot_form))
	}


	fetchMasterVehicles()
	{
		return new Promise((resolve, reject) =>
		{
			this._quotebotService.getMasterVehicleTypes(this.quotebot_form).pipe(
				catchError(err => throwError(err))
			).subscribe((response: any) =>
			{
				if (response.data.length == 0)
				{
					this.no_vehicle_msg = "No Vehicle Categories Found. "
					reject('No Master Vehicle Found.')
					return
				}
				this.master_vehicles = response.data
				resolve(this.master_vehicles)
				return
			})
		})
	}


	/**
	 * Selects the vehicle and fills its data in filters data and selected filters array
	 *
	 * @param vehicle selected vehicle category
	 */
	selectCategory(vehicle: any)
	{
		this.selectedFilters({ target: { checked: true }, fetch_vehicles: true }, 'vehicle-type', vehicle)
	}


	/**
	 * Logic to fetch all filters from backend
	 */
	getAllFilters(): void
	{
		this._spinner.show()
		this._quotebotService.getAllFilters().subscribe((response: any) =>
		{
			this._spinner.hide()
			if (response.success)
			{
				for (let filter in response.data)
				{
					// changing the name here? Do not forget to change in the includes and selected filters function.
					response.data[filter].unshift({ name: 'any or all', checked: true })
				}

				// format every filter name from response
				this.filtersList = JSON.parse(JSON.stringify(response.data)) // create a deep copy of the response object


				// showing only till min_length
				for (let filter in this.filtersList)
				{
					if (Array.isArray(this.filtersList[filter]) && this.filtersList[filter].length > this.min_length)
					{
						// assign the filter with specified length into a new object
						this.filters[filter] = this.filtersList[filter].slice(0, this.min_length)
					} else
					{
						// else, assign the filter into the new object
						this.filters[filter] = this.filtersList[filter]
					}
				}


				this.filters['driver-background'] = [{
					slug: 'child_certified_driver',
					name: 'Child Certified Driver'
				}]

				// console.group('Filters List: ', this.filters)
			}
			// console.log('--------------------------------\n\n')
			// console.groupEnd()
		});
	}


	/**
	 * Replaces any text with hyphen(-) or an underscore(_) with an empty space..
	 *
	 * @param value text to replace
	 * @returns replaced text
	 */
	formatter(value: string): string
	{
		if (value == null) { return }
		if (typeof (value) == 'number' || !isNaN(parseInt(value)))
		{
			return value
		}
		if (value == 'starRating')
		{
			value = 'star-rating'
		}
		if (typeof (value) == 'string' && /[a-z]/.test(value.charAt(0)))
		{
			value = value.replace(value.charAt(0), value.charAt(0).toUpperCase())
		}
		return value.replace(/[-|_]/g, ' ')
	}


	getKeyName(): string
	{
		return this.quotebot_form?.service_type
	}

	/**
	 * show more filters on click
	 * @param button_id merely the index of the filter
	 */
	showMore(filter_name: string)
	{
		this.is_show_more_button_hidden = !this.is_show_more_button_hidden
		// populate filters list
		this.filters[filter_name] = this.is_show_more_button_hidden ? this.filtersList[filter_name] : this.filtersList[filter_name].slice(0, this.min_length)

		// show filters in modal
		// this.filter_body = this.dynamicCreateList(filter_name)
		// this.filter_title = filter_name
		// // console.log(this.filter_body)
		// $('#filtersModal').modal('toggle')
	}


	/**
	 * get vehicle details according to filter applied. Hits api on every filter click
	 *
	 * @param filters_data [Required] the data to be sent to backend
	 * @returns void
	 */
	getVehicleDetails(filters_data: any)
	{
		console.log('Fetching Vehicle Details. ')
		this._spinner.show()
		let data = {}
		if (this.quotebot_form != null)
		{
			data = this.quotebot_form
			data['filters'] = filters_data
		}
		console.group('Sending Data to backend ... ', data)
		console.groupEnd()
		// fetch the vehicle details - API HIT
		this._quotebotService.getVehicleDetails(data).subscribe((response: any) =>
		{
			if (response.data.length == 0)
			{
				this.no_vehicle_msg = 'No Vehicle found with the applied filter.'
			}
			this.vehicleDetails = response.data
			this.Sort.LowToHigh() // default sort to Low-High
			this._spinner.hide()
		})
	}


	/**
	 * generates three arrays providing different functions.
	 * array_1: selected_filters : to show only selected filters on top of the filters list
	 * array_2: filters_data : to send selected filter's id only to backend
	 * array_3: filters: updating filters simultaneously
	 *
	 * @param event: Any [Required] the input[type=checkbox] event
	 * @param category: String [Required] category of the filter
	 * @param filter_index: Number [Required] Index of the current filter checked
	 * @param filter_obj: Filters [Required] the current checked filter object
	 *
	 * @returns void
	 */
	selectedFilters(event: any, category: string, filter_obj: Filters)
	{
		console.log(`\n\n\nChecked: ${event.target.checked}\nCategory: ${category}\nFilter: `, filter_obj)

		if (JSON.parse(sessionStorage.getItem('selected_filters')) == null)
		{
			this.selected_filters = []
		} else
		{
			this.selected_filters = JSON.parse(sessionStorage.getItem('selected_filters'))
			this.getVehicleDetails(JSON.parse(sessionStorage.getItem('filters_data')))
			return
		}


		if (filter_obj.name.includes('any or all') && event.target.checked)
		{
			// remove all filters from that list apart from 'all' filter
			this.selected_filters = this.selected_filters.filter((item: any) => item.category != category)
			return
		}

		// ---------------------- APPENDING OPERATION FOR CHECKED FILTERS ----------------------
		if (event && event.target.checked)
		{
			if (category == 'make' && !this.filters_data.hasOwnProperty('make'))
			{
				this.filters['model'] = []
			}
			if (category == 'make')
			{
				this.filters['model'] =
					this.filters.hasOwnProperty('model') ?
						this.filters['model'].concat(this.filtersList['model'].filter(item => item.make_id === filter_obj.id)) :
						this.filtersList['model'].filter(item => item.make_id === filter_obj.id)
			}

			// append into the filters data array
			if (!this.filters_data.hasOwnProperty(category))
			{
				let values = []	// every new array for all new categories
				values.push(filter_obj.slug != undefined ? filter_obj.slug : filter_obj.id)

				// push into array_2
				this.filters_data[category] = values
			} else
			{
				// push into array_2
				this.filters_data[category].push(filter_obj.slug != undefined ? filter_obj.slug : filter_obj.id)	// push into existing category
			}

			// push into array_1 always
			filter_obj.name != 'any' && this.selected_filters.push({
				category,
				name: filter_obj.name
			})
		}
		// ------------------ APPENDING OPERATION ENDS	-------------------------


		// -------------- REMOVING OPERATION FOR UNCHECKED FILTERS -------------------
		else
		{
			if (category == 'make')
			{
				this.selected_filters = this.selected_filters.filter(item => item.name !== filter_obj.name || (item.category === category))
				this.filters['model'] = this.filters['model'].filter(item => item.make_id !== filter_obj.id)
			}
			if (category == 'model')
			{
				this.selected_filters = this.selected_filters.filter(item => item.name !== filter_obj.name || (item.category === category))
				this.filters_data['model'] = this.filters_data['model'].filter(item => item.make_id !== filter_obj.make_id)
			}

			// filter out others, other than unchecked
			this.selected_filters = this.selected_filters.filter(item => item.name !== filter_obj.name)
			this.filters_data[category] = this.filters_data[category].filter(item => item !== (filter_obj.slug == undefined ? filter_obj.id : filter_obj.slug))
		}
		// ------------- REMOVING OPERATION ENDS ---------------------

		// REMOVING EMPTY VALUES FROM FILTERS DATA
		for (let key in this.filters_data)
		{
			if (key.length == 0)
			{
				delete this.filters_data[key]
			}
		}

		// this.getVehicleDetails(this.filters_data)	// THE API HIT - FETCH THE VEHICLE DETAILS UPON GENERATED FILTERS DATA

		if (event.fetch_vehicles)
		{
			this.getVehicleDetails(this.filters_data)
		}
		// 	console.log('Selected Filters: ', this.selected_filters, '\n')
		// 	console.log('Filters Data: ', this.filters_data, '\n')
		// 	console.log('Filters: ', this.filters, '\n')
	}


	/**
	 * Checks if the specified filter list contains the specified comparison keys
	 */
	includes(filter_list: any, comparison_key: string, filter_obj: any, card_header: string)
	{
		let array = filter_list.some(item => item[comparison_key] == filter_obj[comparison_key])
		if (array)
		{
			this.filters[card_header][0]['checked'] = false
		}

		// remove any or all filter when any other filter is selected
		if (this.filters[card_header][0]['checked'] && array)
		{
			this.filters[card_header][0]['checked'] = false
		}

		if (filter_obj.name.includes('any or all'))
		{
			return filter_obj['checked']
		}
		return array
	}

	showModal(vehicle_selected: any, selection_button: string)
	{
		this.vehicle_selected = vehicle_selected
		this.vehicle_selected['selection_button'] = selection_button
		$('#filtersModal').modal('toggle')
	}

	viewDetails(vehicle_selected: any)
	{
		sessionStorage.setItem('selected_vehicle', JSON.stringify(vehicle_selected))
		this.$state.setState({
			selected_filters: this.selected_filters,
			filters_data: this.filters_data
		})
		this._router.navigate(['quotebot/vehicle-details'], {
			queryParamsHandling: 'preserve'
		})
	}

	/**
	 * Navigate to booking page for final confirmation or other details
	 *
	 * @params vehicle_selected: Any [Required] the selected vehicle
	 *
	 * @returns void
	 */
	bookNow(vehicle_selected: any)
	{
		// // console.log('Will navigate to Book Now Page ...')
		sessionStorage.setItem('selected_vehicle', JSON.stringify(vehicle_selected))
		if (localStorage.getItem('currentUser') != null)
		{
			if (JSON.parse(localStorage.getItem('currentUser'))['roleName'] == 'admin')
			{
				this._router.navigate(['/admin/create-new-booking'])
			} else
			{
				let user = JSON.parse(localStorage.getItem('currentUser'))['roleName']
				user = user == 'driver' ? 'affiliate' : user	// roleName of driver has to be directed to affiliate/..

				this._router.navigate([
					'/' + user + '/'
				])
			}
		} else
		{
			// this._errorDialog.openDialog({
			// 	errors: {
			// 		error: 'Please open an account or login to proceed.'
			// 	}
			// })
			this._router.navigate(['/login/driver'], {
				skipLocationChange: true
			})
		}
	}

	showAllImages(vehicle_selected: any, vehicle_selected_index: number)
	{
		// // console.log(vehicle_selected)
		this.vehicleImages = this.vehicleDetails[vehicle_selected_index].vehicle_images

		// Owl Carousel Images Slider
		$(document).ready(function ()
		{
			var bigimage = $("#big");
			var thumbs = $("#thumbs");
			//var totalslides = 10;
			var syncedSecondary = true;

			bigimage
				.owlCarousel({
					items: 1,
					slideSpeed: 10,
					nav: false,
					autoplay: true,
					dots: false,
					loop: true,
					responsiveRefreshRate: 200,
				})
				.on("changed.owl.carousel", syncPosition);

			thumbs
				.on("initialized.owl.carousel", function ()
				{
					thumbs
						.find(".owl-item")
						.eq(0)
						.addClass("current");
				})
				.owlCarousel({
					items: 8,
					dots: false,
					nav: true,
					smartSpeed: 200,
					slideSpeed: 500,
					slideBy: 4,
					responsiveRefreshRate: 100
				})
				.on("changed.owl.carousel", syncPosition2);

			function syncPosition(el)
			{
				//if loop is set to false, then you have to uncomment the next line
				var current = el.item.index;

				//to disable loop, comment this block
				var count = el.item.count - 1;
				var current: any = Math.round(el.item.index - el.item.count / 2 - 0.5);

				if (current < 0)
				{
					current = count;
				}
				if (current > count)
				{
					current = 0;
				}
				//to this
				thumbs
					.find(".owl-item")
					.removeClass("current")
					.eq(current)
					.addClass("current");
				var onscreen = thumbs.find(".owl-item.active").length - 1;
				var start = thumbs
					.find(".owl-item.active")
					.first()
					.index();
				var end = thumbs
					.find(".owl-item.active")
					.last()
					.index();

				if (current > end)
				{
					thumbs.data("owl.carousel").to(current, 100, true);
				}
				if (current < start)
				{
					thumbs.data("owl.carousel").to(current - onscreen, 100, true);
				}
			}

			function syncPosition2(el)
			{
				if (syncedSecondary)
				{
					var number = el.item.index;
					bigimage.data("owl.carousel").to(number, 100, true);
				}
			}

			thumbs.on("click", ".owl-item", function (e)
			{
				e.preventDefault();
				var number = $(this).index();
				bigimage.data("owl.carousel").to(number, 300, true);
			});
		});
		$('#view_all_images').modal('show')
	}

	clearFilters(filter_name: { category: string, name: string })
	{
		if (this.selected_filters.length == 0) return
		if (filter_name !== null && this.selected_filters.length > 1)
		{
			// console.log('---- Clearing Filter ----', filter_name ?? '')
			this.selected_filters = this.selected_filters.filter(item => item.name != filter_name.name)
			this.filters_data[filter_name.category] = this.filters_data[filter_name.category].filter((item: any) =>
			{
				return item.name !== filter_name.name
			})
		} else
		{
			// empty the whole in a snap
			// console.log('------ Clearing All -----')
			this.selected_filters = []
			this.filters_data = {}
			for (let item in this.filters)
			{
				this.filters[item][0]['checked'] = true
			}
			this.getVehicleDetails(this.filters_data)
		}


		// console.log('Selected Filters: ', this.selected_filters)
		// console.log('Filters Data: ', this.filters_data)
		// console.log('Vehicle Details: ', this.vehicleDetails)
	}


	/**
	 * Create a list of multiple colums and each column having a specific number of items.
	 * A 2D aray is generated with each 1st level containing a specific number of items.
	 *
	 * @param filter_name: String [Required] key name of the datalist
	 * @param filter_index: Number [Required] Index of the key name
	 * @param filter_list: Array [Optional] Filters List to consider. (default -> this.filtersList)
	 */
	dynamicCreateList(filter_name: string, filter_list: Array<Filters> = this.filtersList)
	{
		// // console.log(filter_name, filter_list)	// test the values

		let n = filter_list[filter_name].length		// length of the original filters list
		// console.log('Length of the Original Filters List: ', n)

		let cols = Math.ceil(n / this.min_length)	// will generate number of columns to show with equal number of items
		let rows = this.min_length	// number of items in one column
		// let extra = n % this.min_length	// generates extra number of items to be shown in extra column
		let modal_filtersList: Array<any> = []
		let prev = 0
		let n_rows = []

		// console.log(this.min_length, cols, rows)

		const promise = function ()
		{
			// console.log(prev)
			n_rows = filter_list[filter_name].slice(prev, prev + rows)
			prev = prev + rows
			return n_rows
		}

		for (let i = 0; i < cols; i++)
		{
			modal_filtersList.push(promise())
		}
		// // console.log(modal_filtersList)	// test the value


		// return generated list
		return modal_filtersList
	}

	Sort = {
		// fetch the service_type from quotebot 
		getkey: 'rate_breakdown_' + JSON.parse(localStorage.getItem('quotebot_form'))['service_type'], // modify the key
		LowToHigh: () =>
		{
			let getKeyName = this.Sort.getkey
			console.log(getKeyName)
			// for Master Vehicles
			if (this.vehicleDetails.length == 0 && this.selected_filters.length == 0)
			{
				this.master_vehicles.length > 1 && this.master_vehicles.sort((a, b) =>
				{
					if (a[getKeyName].length == 0 && b[getKeyName].length == 0)
					{
						a[getKeyName].grand_total = 0
						b[getKeyName].grand_total = 0
					}
					// validate if the key has values and then find the 'rate_breakdown_' key in object and sort
					return a[getKeyName].grand_total - b[getKeyName].grand_total
				})
			}

			// for vehicles
			this.vehicleDetails.length > 0 && this.vehicleDetails.sort((a, b) => 
			{
				if (a[getKeyName].length == 0 && b[getKeyName].length == 0)
				{
					a[getKeyName].grand_total = 0
					b[getKeyName].grand_total = 0
				}
				return a[getKeyName].grand_total - b[getKeyName].grand_total
			})
		},
		HighToLow: () =>
		{
			let getKeyName = this.Sort.getkey
			// for master vehicles
			if (this.vehicleDetails.length == 0 && this.selected_filters.length == 0)
			{
				this.master_vehicles.length > 1 && this.master_vehicles.sort((a, b) =>
				{
					if (a[getKeyName].length == 0 && b[getKeyName].length == 0)
					{
						a[getKeyName].grand_total = 0
						b[getKeyName].grand_total = 0
					}
					// validate if the key has values and then find the 'rate_breakdown_' key in object and sort
					return b[getKeyName].grand_total - a[getKeyName].grand_total
				})
			}

			// for vehicles
			this.vehicleDetails.length > 0 && this.vehicleDetails.sort((a, b) => 
			{
				if (a[getKeyName].length == 0 && b[getKeyName].length == 0)
				{
					a[getKeyName].grand_total = 0
					b[getKeyName].grand_total = 0
				}
				return b[getKeyName].grand_total - a[getKeyName].grand_total
			})
		}
	}



}
