import { Component, OnInit, isDevMode } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { AdminService } from "src/app/services/admin.service";
import { FormBuilder, FormGroup, Validators, FormControl, FormArray, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';

@Component({
	selector: "app-finalize-booking",
	templateUrl: "./finalize-booking.component.html",
	styleUrls: ["./finalize-booking.component.scss"],
})
export class FinalizeBookingComponent implements OnInit {
	bookingId: number = 0;

	BookingDetail: any;
	RatesList: any;
	CardsInformation: any;
	paymentSection: boolean = false;
	chevron: boolean = true


	booking_details_list: Record<string, any> = {};
	transferType: any;
	edit_rates_value: any;
	return_edit_rates_value: any;

	finalize_params = {
		distance: 0,
		number_of_hours: 0,
		number_of_vehicles: 0,
		booking_id: 0
	}

	cardForm: FormGroup
	paymentMethod: string = 'cash';
	isCardFormOpen: boolean = false
	visibility: boolean = true
	card_params = {
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
	}
	constructor(
		private $form: FormBuilder,
		private $api: AdminService,
		private $route: ActivatedRoute,
		private $router: Router,
		private $spinner: NgxSpinnerService
	) { }

	ngOnInit(): void {
		this.buildingCardForm()
		this.$route.queryParams.subscribe((params: any) => {
			isDevMode && console.log("Params Found: ", params);
			if (params.bookingId) {
				this.bookingId = params.bookingId;

				this.getReservationDetails(this.bookingId);
			} else {
				// navigate back to dashboard in case of no booking Id specified.
				this.$router.navigate(["/admin/daily-bookings-admin"]);
			}

		});
	}


	/**
	 * Change Detection Functions with minimum functionality 
	 * like saving a form value or assigning a variable
	 */

	changeDetection(method: string) {
		this.paymentMethod = method
	}


	handleCardForm() {
		console.log(this.isCardFormOpen)
		this.isCardFormOpen = !this.isCardFormOpen
	}
	handlePaymentSection() {
		this.chevron = !this.chevron
		this.paymentSection = !this.paymentSection
	}

	/**
	 *  Reset all fields of the card form
	 */
	resetCardForm() {
		this.cardForm.reset()
	}




	buildingCardForm() {
		this.cardForm = this.$form.group({
			name: ['', Validators.required],
			card_number: ['', Validators.required],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			cvv: ['', Validators.required]
		})
	}
	// formatText(text: string)
	// {
	// 	return text.replace(/[\_\-]+/g, " ").trim();
	// }

	init_rates: boolean = false;
	getReservationDetails(booking_id: number = 0) {
		this.$spinner.show();
		this.$api
			.getBookingPreview(booking_id)
			.pipe()
			.subscribe((response: any) => {
				this.$spinner.hide();
				console.log(response.data, "check response");
				this.BookingDetail = response.data
				this.transferType = this.BookingDetail.transfer_type
				this.init_rates = true;
				this.finalize_params['distance'] = this.BookingDetail.distance
				this.finalize_params['number_of_hours'] = this.BookingDetail.number_of_hours
				this.finalize_params['number_of_vehicles'] = this.BookingDetail.number_of_vehicles
				this.finalize_params['booking_id'] = this.BookingDetail.reservation_id
			});
			// api for card detailss
			// getFinalizeDetails 
	}
	dateFormat(value: any) {
		if (value) {
			return moment(value, 'YYYY-MM-DD').format('ll')
		}
	}

	dateFormat2(value: any) {
		if (value) {
			return moment(value, 'YYYY-MM-DD').format('L')
		}
	}

	timeFormat(value: any) {
		if (value?.toUpperCase() == '12:00 AM') {
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
		if (value) {
			return moment(value, 'HH:mm a').format('h:mm a');
		}
	}

	textFormatter(text: string) {
		try {
			return text?.replace(/[\\\_$]+/g, ' ')
		}
		catch
		{
			return text
		}
	}
	mToMi(distance: number): string {
		return (distance / 1609).toFixed(2)
	}

	mToKm(distance: number): string {
		return (distance / 1000).toFixed(2)
	}

	editRates() {

	}
	RateFormValue(form: any) {
		this.edit_rates_value = form
	}
	ReturnRateFormValue(form: any) {
		this.return_edit_rates_value = form
	}
	showSaveButton(visibility: boolean) {
		this.visibility = !this.visibility
	}
}
