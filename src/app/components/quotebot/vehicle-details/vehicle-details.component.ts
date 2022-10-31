import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { MapsAPILoader } from '@agm/core'

declare let $: any


@Component({
	selector: 'app-vehicle-details',
	templateUrl: './vehicle-details.component.html',
	styleUrls: ['./vehicle-details.component.scss']
})
export class VehicleDetailsComponent implements OnInit
{

	selected_vehicle: any	// selected vehicle details from previous page
	quotebot_form: any	// quotebot details from previous page
	one_way_rates: any
	round_trip_rates: any

	constructor(
		private _router: Router,
		private _activatedRoute: ActivatedRoute,
		private _errorDialogService: ErrorDialogService,
		private mapsApiLoader: MapsAPILoader
	) { }

	ngOnInit(): void
	{
		/**
		 * check for Quotebot form values in local storage
		 * parse the values and show them upfront
		 * else, show error and navigate back to homepage to file a quote
		 */
		if (localStorage.getItem('quotebot_form') === null)
		{
			this._errorDialogService.openDialog({
				errors: {
					error: 'Please file a quote first, before selecting vehicles.'
				}
			})
			this._router.navigate(['/home'])
		} else if (sessionStorage.getItem('selected_vehicle') === null)
		{
			this._errorDialogService.openDialog({
				errors: {
					error: 'Please select a vehicle first.'
				}
			})
			this._router.navigateByUrl('/quotebot/select-vehicle')
		} else
		{
			// fetch the values and perform the operation
			this.selected_vehicle = JSON.parse(sessionStorage.getItem('selected_vehicle'))
			this.quotebot_form = JSON.parse(localStorage.getItem('quotebot_form'))


			this.one_way_rates = this.selected_vehicle[Object.keys(this.selected_vehicle).find(value => /^rate_breakdown_one_way/g.test(value))]
			console.log(this.one_way_rates, "5555555555555555555")

			this.round_trip_rates = this.selected_vehicle[Object.keys(this.selected_vehicle).find(value => /^rate_breakdown_round_trip/g.test(value))]
			console.log(this.round_trip_rates, "44444444444444")
			// Re-categorise list of amenities 
			let amenities = JSON.parse(JSON.stringify(this.selected_vehicle.amenities))	// make a deep copy
			this.selected_vehicle.amenities = {} // empty the contents 
			this.selected_vehicle.amenities['chargeable'] = amenities.filter((item) => item.chargeable === 'yes')
			this.selected_vehicle.amenities['non-chargeable'] = amenities.filter((item) => item.chargeable === 'no')

			this.routeSelection(this.quotebot_form.service_type)

			console.log(this.selected_vehicle)
		}

		// initialize Map
		this.initMap()

		var config = {
			items: this.selected_vehicle.vehicle_images.length + 1,
			dots: false,
			nav: false,
			smartSpeed: 200,
			slideSpeed: 500,
			slideBy: 4,
			responsiveRefreshRate: 100
		}

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
					autoplay: false,
					dots: false,
					loop: true,
					responsiveRefreshRate: 200,
					responsiveClass: true,
					navText: ['<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve"><g><path d="M64.96,111.2c2.65,2.73,2.59,7.08-0.13,9.73c-2.73,2.65-7.08,2.59-9.73-0.14L1.97,66.01l4.93-4.8l-4.95,4.8 c-2.65-2.74-2.59-7.1,0.15-9.76c0.08-0.08,0.16-0.15,0.24-0.22L55.1,2.09c2.65-2.73,7-2.79,9.73-0.14 c2.73,2.65,2.78,7.01,0.13,9.73L16.5,61.23L64.96,111.2L64.96,111.2L64.96,111.2z"/></g></svg>',
						'<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 66.91 122.88" style="enable-background:new 0 0 66.91 122.88" xml:space="preserve">  <g><path d="M1.95,111.2c-2.65,2.72-2.59,7.08,0.14,9.73c2.72,2.65,7.08,2.59,9.73-0.14L64.94,66l-4.93-4.79l4.95,4.8 c2.65-2.74,2.59-7.11-0.15-9.76c-0.08-0.08-0.16-0.15-0.24-0.22L11.81,2.09c-2.65-2.73-7-2.79-9.73-0.14 C-0.64,4.6-0.7,8.95,1.95,11.68l48.46,49.55L1.95,111.2L1.95,111.2L1.95,111.2z"/></g></svg> '],
					responsive: {
						0: {
							items: 1,
							nav: false,
							loop: true,
							slideSpeed: 10,
							autoplay: true,
							dots: false
						},
						600: {
							items: 1,
							nav: false,
							loop: true,
							slideSpeed: 10,
							autoplay: false,
							dots: false
						},
						1199: {
							items: 1,
							nav: false,
							loop: true,
							dots: false
						}
					}
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
				.owlCarousel(config)
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
	}
	//ngOnInit ends

	initMap(): any
	{
		this.mapsApiLoader.load().then(() =>
		{
			const directionsService = new google.maps.DirectionsService()
			const directionsRenderer = new google.maps.DirectionsRenderer()
			const map = new google.maps.Map(document.getElementById('map'), {
				zoom: 15,
				center: { lat: 41.850033, lng: -87.6500523 },
				scaleControl: true
			})

			directionsRenderer.setMap(map)

			let obj = {}
			switch (this.quotebot_form.pickup_type)
			{
				case 'airport':
					obj['origin'] = {
						lat: this.quotebot_form.pickup_airport_lat,
						lng: this.quotebot_form.pickup_airport_long
					}
					break
				case 'city':
				case 'cruise':
				case 'cruise_port':
					obj['origin'] = {
						lat: this.quotebot_form.pickup_address_lat,
						lng: this.quotebot_form.pickup_address_long
					}
					break
			}
			switch (this.quotebot_form.dropoff_type)
			{
				case 'airport':
					obj['destination'] = {
						lat: this.quotebot_form.dropoff_airport_lat,
						lng: this.quotebot_form.dropoff_airport_long
					}
					break
				case 'city':
				case 'cruise':
				case 'cruise_port':
					obj['destination'] = {
						lat: this.quotebot_form.dropoff_address_lat,
						lng: this.quotebot_form.dropoff_address_long
					}
					break
			}

			obj['travelMode'] = google.maps.TravelMode.DRIVING

			directionsService.route(obj, (response, error) =>
			{
				console.log('Directions Service Response: ', response)
				directionsRenderer.setDirections(response)
			})
		})
	}


	getKeyName(): string
	{
		return JSON.parse(localStorage.getItem('quotebot_form')).service_type
	}

	textFormat(text: string)
	{
		return text.replace(/[_|-]/g, ' ')
	}

	/**
	 * Check if the passed object is array?
	 * @param obj [Required] object to check for
	 * 
	 * @returns boolean
	 */
	isArray(obj: any)
	{
		return Array.isArray(obj)
	}

	/**
	 * String formatter for replacing underscores or hyphens with space
	 * @param text: String [Required] text to format
	 * 
	 * @returns String
	 */
	formatString(text: string)
	{
		return text.replace(/(_|-)/g, ' ')
	}

	selectPrice()
	{
		$('input[type="checkbox"].custom-control-input').on('change', function ()
		{
			$('input[type="checkbox"].custom-control-input').not(this).prop('checked', false)
		})
	}

	/**
	 * Navigate to booking page for final confirmation or other details
	 * 
	 * @params vehicle_selected: Any [Required] the selected vehicle
	 * 
	 * @returns void
	 */
	bookNow()
	{
		console.log('Will navigate to Book Now Page ...')
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
			// this._errorDialogService.openDialog({
			// 	errors: {
			// 		error: 'Please open an account or login to proceed.'
			// 	}
			// })
			this._router.navigate(['/login/driver'], {
				skipLocationChange: true
			})
		}
	}

	routeSelection(type: string)
	{
		let obj = {}
		this.quotebot_form.service_type = type
		switch (type)
		{
			case 'round_trip':
				obj = {
					return_pickup_date: this.quotebot_form.pickup_date,
					return_pickup_time: this.quotebot_form.pickup_time,
					return_pickup_type: this.quotebot_form.dropoff_type,
					return_dropoff_type: this.quotebot_form.pickup_type,
					return_pickup_airport: this.quotebot_form.dropoff_airport,
					return_pickup_airport_lat: this.quotebot_form.dropoff_airport_lat,
					return_pickup_airport_long: this.quotebot_form.dropoff_airport_long,
					return_dropoff_airport: this.quotebot_form.pickup_airport,
					return_dropoff_airport_lat: this.quotebot_form.pickup_airport_lat,
					return_dropoff_airport_long: this.quotebot_form.pickup_airport_long,
					return_pickup_address: this.quotebot_form.dropoff_address,
					return_dropoff_address: this.quotebot_form.pickup_address,
					return_pickup_address_lat: this.quotebot_form.dropoff_address_lat,
					return_pickup_address_long: this.quotebot_form.dropoff_address_long,
					return_dropoff_address_lat: this.quotebot_form.pickup_address_lat,
					return_dropoff_address_long: this.quotebot_form.pickup_address_long
				}
				Object.assign(obj, this.quotebot_form, obj)
				sessionStorage.setItem('quotebot_original_distance_data', JSON.stringify(this.quotebot_form['location_info']))
				if (obj['location_info'].length == 1)
				{
					obj['location_info'].push(obj['location_info'][0])
				}
				obj['service_type'] = 'one_way'
				break
			case 'one_way':
			case 'charter_tour':
				obj = { ...this.quotebot_form }
				if (this.quotebot_form.location_info.length > 1)
				{
					obj['location_info'].pop()
				}
				for (let item in obj)
				{
					if (/^return_/g.test(item))
					{
						delete obj[item]
					}
				}
				break
		}
		localStorage.setItem('quotebot_form', JSON.stringify(obj))
	}






	backButton()
	{
		// navigate to select vehicle page and delete the prev vehicle selected from localStorage
		sessionStorage.removeItem('selected_vehicle')
		this._router.navigate(['../select-vehicle'], {
			relativeTo: this._activatedRoute,
			queryParamsHandling: 'preserve'
		})
	}

}
