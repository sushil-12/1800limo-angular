import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import * as moment from 'moment';
import { GoogleMap } from '@angular/google-maps';

declare let $: any


@Component({
	selector: 'app-vehicle-details',
	templateUrl: './vehicle-details.component.html',
	styleUrls: ['./vehicle-details.component.scss']
})
export class VehicleDetailsComponent implements OnInit {
	@ViewChild('map') map!: GoogleMap;
	@ViewChild('returnMap') returnMap!: GoogleMap;

	zoom = 15;
	center = { lat: 41.850033, lng: -87.6500523 };
	mapOptions: google.maps.MapOptions = {
		scaleControl: true,
	};

	selected_vehicle: any	// selected vehicle details from previous page
	quotebot_form: any	// quotebot details from previous page
	one_way_rates: any
	round_trip_rates: any
	distance: any = 0
	duration: any = 0
	returnDistance: any = 0
	returnDuration: any = 0
	bookingId: any = null
	booking_created_from: string = 'admin';

	driver_info_display_keys: Array<string> = ['gender', 'dress', 'experience', 'languages', 'insurance_limit']
	currencySymbol: any;

	constructor(
		private _router: Router,
		private _activatedRoute: ActivatedRoute,
		private _errorDialogService: ErrorDialogService,
		 private cdr: ChangeDetectorRef
	) { }

	ngOnInit(): void {
		/**
		 * check for Quotebot form values in local storage
		 * parse the values and show them upfront
		 * else, show error and navigate back to homepage to file a quote
		 */
		if (localStorage.getItem('quotebot_form') === null) {
			this._errorDialogService.openDialog({
				errors: {
					error: 'Please file a quote first, before selecting vehicles.'
				}
			})
			this._router.navigate(['/home', { queryParams: { r: true } }])
		} else if (sessionStorage.getItem('selected_vehicle') === null) {
			this._errorDialogService.openDialog({
				errors: {
					error: 'Please select a vehicle first.'
				}
			})
			this._router.navigateByUrl('/quotebot/select-vehicle')
		} else {
			// fetch the values and perform the operation
			this.selected_vehicle = JSON.parse(sessionStorage.getItem('selected_vehicle'))
			if (this.selected_vehicle.hasOwnProperty('driverInformation')) {
				let name = this.selected_vehicle.driverInformation.name.split(' ')
				name[name.length - 1] = name[name.length - 1].charAt(0).toUpperCase()
				this.selected_vehicle['name_initials'] = name.join(' ')
			}
			this.quotebot_form = JSON.parse(localStorage.getItem('quotebot_form'))
			let rates = this.selected_vehicle[Object.keys(this.selected_vehicle).find(value => /^rate_breakdown_one_way/g.test(value))]
			this.one_way_rates = rates ? rates : this.selected_vehicle[Object.keys(this.selected_vehicle).find(value => /^rate_breakdown_charter_tour/g.test(value))]
			console.log('rates-->>', rates ? 'yes' : 'no', this.one_way_rates)

			this.round_trip_rates = this.selected_vehicle[Object.keys(this.selected_vehicle).find(value => /^rate_breakdown_round_trip/g.test(value))]

			// Re-categorise list of amenities 
			let amenities = JSON.parse(JSON.stringify(this.selected_vehicle.amenities))	// make a deep copy
			this.selected_vehicle.amenities = {} // empty the contents 
			this.selected_vehicle.amenities['chargeable'] = amenities.filter((item) => item.chargeable === 'yes')
			this.selected_vehicle.amenities['non-chargeable'] = amenities.filter((item) => item.chargeable === 'no')

			this.routeSelection(this.quotebot_form.service_type)

			console.log(this.selected_vehicle)
		}

		let currency = JSON.parse(sessionStorage.getItem('currencyData'))
		this.currencySymbol = currency?.symbol

		this._activatedRoute.queryParams.subscribe((params: any) => {
			console.log('paramsa->>>>', params.booking_id)
			if (params?.id) {
				this.bookingId = params?.id
			}



		})

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
		$(document).ready(function () {
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
					responsiveClass: true,
				})
				.on("changed.owl.carousel", syncPosition);

			thumbs
				.on("initialized.owl.carousel", function () {
					thumbs
						.find(".owl-item")
						.eq(0)
						.addClass("current");
				})
				.owlCarousel(config)
				.on("changed.owl.carousel", syncPosition2);

			function syncPosition(el) {
				//if loop is set to false, then you have to uncomment the next line
				var current = el.item.index;

				//to disable loop, comment this block
				var count = el.item.count - 1;
				var current: any = Math.round(el.item.index - el.item.count / 2 - 0.5);

				if (current < 0) {
					current = count;
				}
				if (current > count) {
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

				if (current > end) {
					thumbs.data("owl.carousel").to(current, 100, true);
				}
				if (current < start) {
					thumbs.data("owl.carousel").to(current - onscreen, 100, true);
				}
			}

			function syncPosition2(el) {
				if (syncedSecondary) {
					var number = el.item.index;
					bigimage.data("owl.carousel").to(number, 100, true);
				}
			}

			thumbs.on("click", ".owl-item", function (e) {
				e.preventDefault();
				var number = $(this).index();
				bigimage.data("owl.carousel").to(number, 300, true);
			});
		});
	}
	//ngOnInit ends

	ngAfterViewInit() {
		if (!this.quotebot_form) return;
		this.initMap();
		if (this.quotebot_form.service_type === 'round_trip') {
			this.initReturnMap();
		}
	}

	initMap(): any {
		const directionsService = new google.maps.DirectionsService();
		const directionsRenderer = new google.maps.DirectionsRenderer();
		directionsRenderer.setMap(this.map.googleMap!);

		const origin = this.getOrigin();
		const destination = this.getDestination();

		const waypoints: google.maps.DirectionsWaypoint[] = (this.quotebot_form.extra_stops || []).map((stop: any) => ({
			location: { lat: stop.latitude, lng: stop.longitude },
			stopover: true,
		}));

		const request: google.maps.DirectionsRequest = {
			origin,
			destination,
			waypoints,
			travelMode: google.maps.TravelMode.DRIVING,
		};

		directionsService.route(request, (response, status) => {
			if (status === google.maps.DirectionsStatus.OK && response) {
				directionsRenderer.setDirections(response);
				response.routes.forEach(route => {
					route.legs.forEach(leg => {
						this.distance += leg.distance?.value || 0;
						this.duration += leg.duration?.value || 0;
					});
				});
			} else {
				console.error('Directions request failed due to', status);
			}
		});
	}

	initReturnMap(): any {
		if (!this.returnMap?.googleMap) return;

		const directionsService = new google.maps.DirectionsService();
		const directionsRenderer = new google.maps.DirectionsRenderer();
		directionsRenderer.setMap(this.returnMap.googleMap!);

		const origin = this.getReturnOrigin();
		const destination = this.getReturnDestination();

		const waypoints: google.maps.DirectionsWaypoint[] = (this.quotebot_form.return_extra_stops || []).map((stop: any) => ({
			location: { lat: stop.latitude, lng: stop.longitude },
			stopover: true,
		}));

		const request: google.maps.DirectionsRequest = {
			origin,
			destination,
			waypoints,
			travelMode: google.maps.TravelMode.DRIVING,
		};

		directionsService.route(request, (response, status) => {
			if (status === google.maps.DirectionsStatus.OK && response) {
				directionsRenderer.setDirections(response);
				response.routes.forEach(route => {
					route.legs.forEach(leg => {
						this.returnDistance += leg.distance?.value || 0;
						this.returnDuration += leg.duration?.value || 0;
					});
				});
			} else {
				console.error('Return directions request failed due to', status);
			}
		});
	}

	getOrigin(): google.maps.LatLngLiteral {
		switch (this.quotebot_form.pickup_type) {
			case 'airport':
				return {
					lat: Number(this.quotebot_form.pickup_airport_lat),
					lng: Number(this.quotebot_form.pickup_airport_long),
				};
			default:
				return {
					lat: Number(this.quotebot_form.pickup_address_lat),
					lng: Number(this.quotebot_form.pickup_address_long),
				};
		}
	}

	getDestination(): google.maps.LatLngLiteral {
		switch (this.quotebot_form.dropoff_type) {
			case 'airport':
				return {
					lat: Number(this.quotebot_form.dropoff_airport_lat),
					lng: Number(this.quotebot_form.dropoff_airport_long),
				};
			default:
				return {
					lat: Number(this.quotebot_form.dropoff_address_lat),
					lng: Number(this.quotebot_form.dropoff_address_long),
				};
		}
	}

	getReturnOrigin(): google.maps.LatLngLiteral {
		switch (this.quotebot_form.return_pickup_type) {
			case 'airport':
				return {
					lat: Number(this.quotebot_form.return_pickup_airport_lat),
					lng: Number(this.quotebot_form.return_pickup_airport_long),
				};
			default:
				return {
					lat: Number(this.quotebot_form.return_pickup_address_lat),
					lng: Number(this.quotebot_form.return_pickup_address_long),
				};
		}
	}

	getReturnDestination(): google.maps.LatLngLiteral {
		switch (this.quotebot_form.return_dropoff_type) {
			case 'airport':
				return {
					lat: Number(this.quotebot_form.return_dropoff_airport_lat),
					lng: Number(this.quotebot_form.return_dropoff_airport_long),
				};
			default:
				return {
					lat: Number(this.quotebot_form.return_dropoff_address_lat),
					lng: Number(this.quotebot_form.return_dropoff_address_long),
				};
		}
	}


	getKeyName(): string {
		return JSON.parse(localStorage.getItem('quotebot_form')).service_type
	}

	textFormat(text: string) {
		return text.replace(/[_|-]/g, ' ')
	}
	convertToMi(value) {
		return (value * 0.000621371).toFixed(2)
	}
	convertToKm(value) {
		return (value * 0.001).toFixed(2)
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
		// return (value/60).toFixed(2)
	}

	/**
	 * Check if the passed object is array?
	 * @param obj [Required] object to check for
	 * 
	 * @returns boolean
	 */
	isArray(obj: any) {
		return Array.isArray(obj)
	}

	/**
	 * String formatter for replacing underscores or hyphens with space
	 * @param text: String [Required] text to format
	 * 
	 * @returns String
	 */
	formatString(text: string) {
		return text.replace(/(_|-)/g, ' ')
	}

	selectPrice() {
		$('input[type="checkbox"].custom-control-input').on('change', function () {
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
	bookNow() {
		console.log('Will navigate to Book Now Page ...')
		let vehicle_selected = JSON.parse(sessionStorage.getItem('selected_vehicle'))
		if (vehicle_selected?.created_by != 1) {
			this.booking_created_from = 'subscriber'
		}
		if (localStorage.getItem('currentUser') != null) {
			if (JSON.parse(localStorage.getItem('currentUser'))['roleName'] == 'admin') {
				// this._router.navigate(['/admin/new-booking'])
				// console.log('navigate to new booking----')
				if (this.bookingId) {
					this._router.navigate(['/admin/new-booking'],
						{ queryParams: { affiliate_id: vehicle_selected.affiliate_id, vehicle_id: vehicle_selected.id, new: 'reaffiliate', updateType: 'reaffiliate', reaffiliate_book_id: this.bookingId } })
				} else {
					this._router.navigate(['/admin/new-booking'],
						{ queryParams: { affiliate_id: vehicle_selected.affiliate_id, vehicle_id: vehicle_selected.id, new: true, created_by: (JSON.parse(localStorage.getItem('currentUser'))['created_by_role'] == 'admin' ? 'admin' : this.booking_created_from) } })
				}
			} else {
				let user = JSON.parse(localStorage.getItem('currentUser'))['roleName']
				let vehicle_selected: any = JSON.parse(sessionStorage.getItem('selected_vehicle'))
				console.log('vehicle_selected---->>>>>', vehicle_selected)
				user = user == 'driver' ? 'affiliate' : user	// roleName of driver has to be directed to affiliate/..

				// navigate to farm in bookings page
				this._router.navigate([
					'/' + user + '/create-new-booking'
				],
					{ queryParams: { affiliate_id: vehicle_selected.affiliate_id, vehicle_id: vehicle_selected.id, new: true, created_by: this.booking_created_from } }
				)
			}
		} else {
			// this._errorDialogService.openDialog({
			// 	errors: {
			// 		error: 'Please open an account or login to proceed.'
			// 	}
			// })
			// this._router.navigate(['/login/driver'], {
			// 	skipLocationChange: true
			// })
			console.log("TESTTTTTT1")
			this._router.navigate([
				'/quotebot/new-booking'
			],
				{ queryParams: { affiliate_id: vehicle_selected.affiliate_id, vehicle_id: vehicle_selected.id, new: true, is_master_vehicle: vehicle_selected?.is_master_vehicle } })
		}
	}

	routeSelection(type: string) {
		let obj = {}
		this.quotebot_form.service_type = type
		switch (type) {
			case 'round_trip':
				obj = {
					return_pickup_date: this.quotebot_form?.pickup_date,
					return_pickup_time: this.quotebot_form?.pickup_time,
					return_pickup_type: this.quotebot_form?.dropoff_type,
					return_dropoff_type: this.quotebot_form?.pickup_type,
					return_pickup_airport: this.quotebot_form?.dropoff_airport,
					return_pickup_airport_lat: Number(this.quotebot_form?.dropoff_airport_lat),
					return_pickup_airport_long: Number(this.quotebot_form?.dropoff_airport_long),
					return_dropoff_airport: this.quotebot_form?.pickup_airport,
					return_dropoff_airport_lat: Number(this.quotebot_form?.pickup_airport_lat),
					return_dropoff_airport_long: Number(this.quotebot_form?.pickup_airport_long),
					return_pickup_address: this.quotebot_form?.dropoff_address,
					return_dropoff_address: this.quotebot_form?.pickup_address,
					return_pickup_address_lat: Number(this.quotebot_form?.dropoff_address_lat),
					return_pickup_address_long: Number(this.quotebot_form?.dropoff_address_long),
					return_dropoff_address_lat: Number(this.quotebot_form?.pickup_address_lat),
					return_dropoff_address_long: Number(this.quotebot_form?.pickup_address_long),
					other_details: this.quotebot_form?.other_details
				}

				Object.assign(obj, this.quotebot_form, obj) // assign the new object to old quote

				sessionStorage.setItem('quotebot_original_distance_data', JSON.stringify(this.quotebot_form['location_info']))
				if (obj['location_info']?.length == 1) {
					obj['location_info'].push(obj['location_info'][0])
				}
				setTimeout(() => {
					this.cdr.detectChanges(); // force DOM update

					if (this.returnMap?.googleMap) {
					this.initReturnMap();
					} else {
					console.warn('returnMap not ready yet');
					}
				}, 300);
				break
			case 'one_way':
				obj = { ...this.quotebot_form }
				obj['pickup_airport_lat'] = Number(this.quotebot_form?.pickup_airport_lat)
				obj['pickup_airport_long'] = Number(this.quotebot_form?.pickup_airport_long)
				obj['dropoff_airport_lat'] = Number(this.quotebot_form?.dropoff_airport_lat)
				obj['dropoff_airport_long'] = Number(this.quotebot_form?.dropoff_airport_long)
				obj['pickup_address_lat'] = Number(this.quotebot_form?.pickup_address_lat)
				obj['pickup_address_long'] = Number(this.quotebot_form?.pickup_address_long)
				obj['dropoff_address_lat'] = Number(this.quotebot_form?.dropoff_address_lat)
				obj['dropoff_address_long'] = Number(this.quotebot_form?.dropoff_address_long)
			case 'oneway':
				obj = { ...this.quotebot_form }
			case 'charter_tour':
				obj = { ...this.quotebot_form }
				if (this.quotebot_form?.location_info?.length > 1) {
					obj['location_info'].pop()
				}
				for (let item in obj) {
					if (/^return_/g.test(item)) {
						delete obj[item]
					}
				}
				break
		}
		obj['service_type'] = type
		this.quotebot_form = obj
		localStorage.setItem('quotebot_form', JSON.stringify(obj))
	}

	/**
	 * 
	 * @param value :String [Required] date value
	 * @returns String of format('LL') i.e. November 7, 2022
	 */
	formatDate(value: string): string {
		return moment(value).format('LL')
	}

	formatTime(value: string): string {
		return moment(value, 'HH:mm:ss').format('hh:mm a')
	}

 // helper function for images
 getImageUrl(item: string): string {
  const oldBase = 'https://1800limoapi.infodevbox.com/';
  const newBase = 'https://api.1800limo.com/';

  return item.startsWith(oldBase)
    ? item.replace(oldBase, newBase)
    : item;
}



	backButton() {
		// navigate to select vehicle page and delete the prev vehicle selected from localStorage
		sessionStorage.removeItem('selected_vehicle')
		this._router.navigate(['../select-vehicle'], {
			relativeTo: this._activatedRoute,
			queryParamsHandling: 'preserve'
		})
	}
}
