import { Component, ComponentFactoryResolver, OnInit, isDevMode } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { AdminService } from "src/app/services/admin.service";
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { CustomvalidationService } from "src/app/services/customvalidation.service";
import { HttpClient } from "@angular/common/http";
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';

declare var $: any;

export const MY_FORMATS = {
	parse: {
		dateInput: 'MM/YYYY',
	},
	display: {
		dateInput: 'MM/YYYY',
		monthYearLabel: 'MMM YYYY',
		dateA11yLabel: 'LL',
		monthYearA11yLabel: 'MMMM YYYY',
	},
};

@Component({
	selector: "app-finalize-booking",
	templateUrl: "./finalize-booking.component.html",
	styleUrls: ["./finalize-booking.component.scss"],
	providers: [
		{
			provide: DateAdapter,
			useClass: MomentDateAdapter,
			deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
		},
		{ provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
	],
})
export class FinalizeBookingComponent implements OnInit {

	public deleteCardForm: FormGroup;
	bookingId: number = 0;

	BookingDetail: any;
	RatesList: any;
	CardsInformation: any = [];
	primaryCards: any = [];
	paymentSection: boolean = true;
	chevron: boolean = true


	booking_details_list: Record<string, any> = {};
	transferType: any;
	edit_rates_value: any;
	return_edit_rates_value: any;
	affiliate_type: string;
	finalize_btn: string = "Finalize"
	subModules: any = [];
	currentUser: any;

	finalize_params = {
		distance: 0,
		number_of_hours: 0,
		number_of_vehicles: 0,
		booking_id: 0
	}

	cardForm: FormGroup
	expiryDateControl = new FormControl(moment());
	paymentMethod: string = 'card';
	isCardFormOpen: boolean = false
	visibility: boolean = true
	selectedCard: any;
	//Total_amount is booking total amount
	totalAmount: number = 0
	//payableAmount is an amount to be paid
	payableAmount: number = 0
	// paidAmount is an amount that is already paid
	paidAmount: number = 0

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
	paymentDetailByCard: any;
	main_receipt_url: any;
	isTravelShare: boolean;
	isCreatedByAdmin: boolean = true;
	shareArray: any;
	r_shareArray: any;
	adminSharePercent: number = 25;
	service_type: any;
	isFarmoutBooking: boolean = false;
	isFinalizeButton: boolean = false;
	currencyObj: any;
	currencySymbol: any;
	vehicle_created_by: any;
	booking_created_from: any;
	is_readonly_min_rate: boolean = false;
	paymentSuccessMessage: String = '';
	waiting_time_in_mins: any = 0;

	constructor(
		private $form: FormBuilder,
		private $api: AdminService,
		private $route: ActivatedRoute,
		private $router: Router,
		private $errors: ErrorDialogService,
		private $spinner: NgxSpinnerService,
		private customValidator: CustomvalidationService,
		private httpClient: HttpClient,
	) {

	}

	ngOnInit(): void {

		// this.$spinner.show('normalspinner');

		this.buildingCardForm();
		this.deleteCardForm = this.$form.group({
			cardId: ["", Validators.required],
			accId: ["", Validators.required],
		});
		this.$route.queryParams.subscribe((params: any) => {
			this.$spinner.show()
			isDevMode() && console.log("Params Found: ", params);
			if (params.bookingId) {
				this.bookingId = params.bookingId;
				this.getReservationDetails(this.bookingId);
				this.paymentDetail(this.bookingId)
				this.scroll('submitForm')
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
		if (method == 'new_card') {
			this.isCardFormOpen = true
			this.paymentMethod = 'card'
			this.setExpiryDate(moment());
			// Prefill card holder name with passenger name
			if (this.BookingDetail && this.BookingDetail.passenger_name) {
				this.cardForm.patchValue({
					name: this.BookingDetail.passenger_name
				});
			}
		} else {
			this.paymentMethod = method
			this.isCardFormOpen = false
		}
	}

	scroll(id) {
		let el = document.getElementById(id);
		console.log(`scrolling to ${id}`, el);
		el.scrollIntoView();
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
		this.setExpiryDate(moment());
	}




	buildingCardForm() {
		this.cardForm = this.$form.group({
			name: ['', [Validators.required]],
			card_number: ['', [Validators.required, Validators.pattern("^[0-9+]*$"), Validators.minLength(12), Validators.maxLength(20)]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			cvv: ['', [Validators.required, Validators.pattern("^[0-9+]*$")]],
			save_card_detail: [false]
		}, { validators: this.expiryDateValidator() })

		this.setExpiryDate(moment());
	}
	// formatText(text: string)
	// {
	// 	return text.replace(/[\_\-]+/g, " ").trim();
	// }

	init_rates: boolean = false;
	getReservationDetails(booking_id: number = 0) {
		// this.$spinner.show();
		this.$api
			.getFinalizeDetails(booking_id)
			.pipe()
			.subscribe((response: any) => {
				this.$spinner.hide();
				console.log(response.data, "check response");
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
				this.isTravelShare = response?.data?.account_type == 'travel_planner' ? true : false
				this.isCreatedByAdmin = response?.data?.created_by == 1 ? true : false
				this.isFarmoutBooking = response?.data?.reservation_type == 'farmout' ? true : false
				this.BookingDetail = response.data
				this.waiting_time_in_mins = this.BookingDetail?.waiting_time_in_mins
				this.isFinalizeButton = this.BookingDetail?.booking_status == 'finalized' ? true : false,
					this.transferType = this.BookingDetail.transfer_type
				this.init_rates = true;
				this.service_type = response?.data?.service_type
				this.CardsInformation = response?.data?.cards
				this.primaryCards = this.CardsInformation
				this.selectedCard = this.primaryCards[this.primaryCards.length - 1]
				this.finalize_params['distance'] = this.BookingDetail.distance
				this.finalize_params['number_of_hours'] = this.BookingDetail.number_of_hours
				this.finalize_params['number_of_vehicles'] = this.BookingDetail.number_of_vehicles
				this.finalize_params['booking_id'] = this.BookingDetail.reservation_id
				this.affiliate_type = response.data.affiliate_type
				this.visibility = (response.data.payment_status == 'paid' || response.data.payment_status == 'transfer_failed') ? false : true
				this.paidAmount = response.data?.charged_amount ? parseFloat(response.data?.charged_amount) : 0
				this.subModules = localStorage.getItem('sub_modules') || [];
				this.currentUser = JSON.parse(localStorage.getItem('userData')) || "";
				this.vehicle_created_by = response?.data?.vehicle_created_by
				this.booking_created_from = response?.data?.created_by_role
				this.is_readonly_min_rate = response?.data?.min_rate_involved ? true : false
				setTimeout(() => {
					this.scroll('submitForm')

				}, 600)
			});
		// api for card detailss
		// getFinalizeDetails 
	}
	paymentDetail(bookingId) {
		// this.$spinner.show();
		this.$api
			.getPaymentDetailFinalize(bookingId)
			.pipe()
			.subscribe((response: any) => {
				this.$spinner.hide();
				console.log(response.data, "check response paymentDetail");
				if (response.data) {
					this.main_receipt_url = response?.data?.main_receipt_url
					this.paymentDetailByCard = response?.data?.charges
				}
			});
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

	createReservationShareArray() {
		console.log('in function createReservationShareArray')
		if (this.edit_rates_value) {
			const vehiclesMultiplier = this.finalize_params.number_of_vehicles != 0 ? this.finalize_params.number_of_vehicles : 1;
			let base_rate = this.edit_rates_value?.all_inclusive_rates?.["Base_Rate"]?.amount
				?? this.edit_rates_value?.all_inclusive_rates?.["Base_Rate"]?.baserate
				?? 0;

			['ELH_Charges', 'Stops', 'Wait'].map((key) => {
				base_rate += this.edit_rates_value?.all_inclusive_rates?.[key]?.amount
					?? this.edit_rates_value?.all_inclusive_rates?.[key]?.baserate
					?? 0;
			});
			for (const key of Object.keys(this.edit_rates_value.amenities)) {
				base_rate += this.edit_rates_value?.amenities?.[key]?.amount
					?? this.edit_rates_value?.amenities?.[key]?.baserate
					?? 0;
			}
			base_rate *= vehiclesMultiplier
			const grandTotal = this.edit_rates_value.grand_total
			const stripeFee = grandTotal * 0.05 + 0.30
			const extraGratuityShare = ((this.edit_rates_value?.misc?.Extra_Gratuity?.amount ?? 0) * 0.25) * vehiclesMultiplier
			const isTravelBooking = this.BookingDetail?.account_type == 'travel_planner' && !this.isCreatedByAdmin;
			const adminSharePercent = this.booking_created_from == 'subscriber'
				? 0
				: (isTravelBooking || this.isFarmoutBooking ? 15 : 25);
			const travelAgentShare = isTravelBooking ? base_rate * 0.10 : 0;
			const farmoutShare = this.isFarmoutBooking ? base_rate * 0.10 : 0;
			const adminShare = (base_rate * adminSharePercent) / 100 + extraGratuityShare;
			const deducted_admin_share = this.booking_created_from == 'subscriber'
				? 0
				: adminShare - stripeFee;

			const shareArray: any = {
				baseRate: base_rate,
				grandTotal,
				stripeFee,
				adminShare,
				deducted_admin_share,
				affiliateShare: grandTotal - base_rate * 0.25
			}

			if (travelAgentShare) {
				shareArray['travelAgentShare'] = travelAgentShare;
			}

			if (farmoutShare) {
				shareArray['farmoutShare'] = farmoutShare;
			}

			if (this.booking_created_from == 'subscriber') {
				shareArray['affiliateShare'] = grandTotal - stripeFee
			}
			this.shareArray = shareArray
			// console.log('in function createReservationShareArray-->>>' , base_rate, shareArray )
			return shareArray;
			// value['rateArray'] = JSON.parse(JSON.stringify(this.edit_rates_value))
		}
	}
	submitForm() {

		// console.log(this.BookingForm);
		let rateArray = JSON.parse(JSON.stringify(this.edit_rates_value))
		if (rateArray.all_inclusive_rates.Base_Rate.rate_label == "Minimum Rate") {
			rateArray.all_inclusive_rates.Base_Rate.rate_label = "Base Rate"
		}
		delete rateArray.sub_total
		delete rateArray.grand_total
		this.createReservationShareArray()
		let body = {
			reservation_id: this.bookingId,
			rateArray: rateArray,
			sub_total: this.edit_rates_value.sub_total,
			grand_total: this.edit_rates_value.grand_total,
			affiliate_type: this.affiliate_type,
			number_of_hours: this.finalize_params['number_of_hours'],
			shareArray: this.shareArray
		}
		console.log('\n\n Submitting Form', body);
		this.$spinner.show()
		this.$api.updateFinalizeRates(body).subscribe((response: any) => {
			// this.$errors.openDialog({
			// 	errors: {
			// 		error: `<span class='text-success'>${response.message}</span>`
			// 	}
			// })
			// this.$router.navigate(['/admin/daily-bookings-admin'])
			console.log('response-->>', response)
			this.$spinner.hide()
			this.finalize_btn = "Finalized"
			this.getReservationDetails(this.bookingId);
		})

		// else {
		// $('#previewBooking').modal('handleUpdate').modal('show')
		// }
	}
	handleChangeCard(card: any) {
		this.selectedCard = card
	}
	deleteCardClicked(item: any) {
		this.deleteCardForm.patchValue({
			cardId: item.ID,
			accId: this.BookingDetail.acc_id,
		});
	}

	deleteCard() {
		this.$spinner.show()
		this.$api.deleteCardFinalize(this.deleteCardForm.value.cardId, this.deleteCardForm.value.accId).subscribe((response: any) => {
			// this.$errors.openDialog({
			// 	errors: {
			// 		error: `<span class='text-success'>${response.message}</span>`
			// 	}
			// })
			// this.$router.navigate(['/admin/daily-bookings-admin'])
			this.$spinner.hide()
			this.getReservationDetails(this.bookingId)
		})
		$('#warnDeleteCard').modal('hide')
	}

	makePayment() {
		$('#paymentModal').modal('hide')
		console.log('<<<<-----handle valid---->>>>> ', this.cardForm.valid, this.cardForm.value, this.paymentMethod)
		console.log('-----=====?>>>>>', this.isCardFormOpen ? this.cardForm.valid : (this.CardsInformation.length > 0))
		let dataToSend: any
		if (this.paymentMethod == 'cash') {
			console.log('<<<<<----payment through cash-->>>>')
			dataToSend = {
				reservation_id: this.bookingId,
				grand_total: this.payableAmount,
				paymentMethod: 'cash'
			}
			this.$spinner.show()
			this.$api.paymentProcessing(dataToSend).subscribe((response: any) => {
				console.log(response)
				// this.$errors.openDialog({
				// 	errors: {
				// 		error: `<span class='text-success'>${response.message}</span>`
				// 	}
				// })
				// this.$router.navigate(['/admin/invoice-summary'], { queryParams: { bookingId: this.bookingId } })
				// this.$router.navigate(['/admin/invoice-summary'], { queryParams: { bookingId: this.bookingId } })
				this.$router.navigate(['/admin/daily-bookings-admin'])

				console.log('response---------------------->>', response)
				this.$spinner.hide()
			})
		}
		else {
			if (this.isCardFormOpen ? this.cardForm.valid : (this.CardsInformation.length > 0)) {
				if (this.paymentMethod == 'cash') {
					console.log('<<<<<----payment through cash-->>>>')
					dataToSend = {
						reservation_id: this.bookingId,
						grand_total: this.payableAmount,
						paymentMethod: 'cash'
					}
				}
				else {
					if (this.isCardFormOpen) {
						dataToSend = {
							CreditCardsDetail: { ...this.cardForm.value },
							isExistingCard: false,
							paymentMethod: 'credit_card',
							reservation_id: this.bookingId,
							grand_total: this.payableAmount
						}
						console.log('<<<<--card form detail-->>>', dataToSend)
					}
					else {
						dataToSend = {
							isExistingCard: true,
							paymentMethod: 'credit_card',
							CreditCardsDetail: {
								cardID: this.selectedCard.ID
							},
							reservation_id: this.bookingId,
							grand_total: this.payableAmount
						}
						console.log('selected card-->>>', dataToSend)
					}
				}
				this.$spinner.show()
				this.$api.paymentProcessing(dataToSend).subscribe((response: any) => {
					// this.$errors.openDialog({
					// 	errors: {
					// 		error: `<span class='text-success'>${response.message}</span>`
					// 	}
					// })
					// this.$router.navigate(['/admin/invoice-summary'], { queryParams: { bookingId: this.bookingId } })
					this.$spinner.hide()
					$('#paymentSuccessModal').modal('show')
					this.paymentSuccessMessage = response?.data?.message
					setTimeout(() => {
						this.redirecttodailybooking()
					}, 2500)
					// this.$router.navigate(['/admin/daily-bookings-admin'])
					console.log('response---------------------->>', response)
				})
			}
			else {
				console.log('<<<<-----handle valid---->>>>> ', this.cardForm.valid)
				if (!this.CardsInformation.length && !this.isCardFormOpen) {
					this.$errors.openDialog({
						errors: {
							error: `<span class='text-danger'> No card selected</span>`
						}
					})
				}
				else {
					this.$errors.openDialog({
						errors: {
							error: `<span class='text-danger'>Please Enter correct card details</span>`
						}
					})
				}
			}
		}

	}

	redirecttodailybooking() {
		$('#paymentSuccessModal').modal('hide')
		this.$router.navigate(['/admin/daily-bookings-admin'])
	}
	RateFormValue(form: any) {
		this.edit_rates_value = form
		console.log("edit_rates_value", this.edit_rates_value)
		this.payableAmount = this.edit_rates_value.grand_total
		this.createReservationShareArray()
		if (this.BookingDetail?.booking_status == 'finalized') {
			if (this.edit_rates_value.grand_total != this.BookingDetail?.grand_total) {
				this.isFinalizeButton = false
			}
			else {
				this.isFinalizeButton = true
			}
		}
		else {
			this.isFinalizeButton = false
		}

	}
	ReturnRateFormValue(form: any) {
		this.return_edit_rates_value = form
		if (this.BookingDetail?.booking_status == 'finalized') {
			if (this.return_edit_rates_value.grand_total != this.BookingDetail?.r_grand_total) {
				this.isFinalizeButton = false
			}
			else {
				this.isFinalizeButton = true
			}
		}
		else {
			this.isFinalizeButton = false
		}

	}
	HandleReturnNumberOfHr(data: any) {
		console.log('____<><><><><><><><>', data)
		this.finalize_params['number_of_hours'] = data

	}
	saveCardDetails() {
		if (this.cardForm.invalid) {
			this.cardForm.markAllAsTouched();
			this.expiryDateControl.markAsTouched();
			this.$spinner.hide();
			return;
		}
		console.log('saving card details')
		this.$spinner.show()
		// {

		// }
		// let dataToSend = {
		// 	CreditCardsDetail: {
		// 		name: "TESTT",
		// 		card_number: "4242424242424242",
		// 		exp_month: "01",
		// 		exp_year: 2026,
		// 		cvv: "233",
		// 		save_card_detail: false
		// 	},
		// 	isExistingCard: false,

		// 	paymentMethod: "credit_card",
		// 	reservation_id: "853",
		// 	grand_total: 122.5
		// }

		let dataToSend = {
			CreditCardsDetail: { ...this.cardForm.value },
			isExistingCard: false,
			paymentMethod: 'credit_card',
			saveCreditCardOnly: true,
			reservation_id: this.bookingId,
			grand_total: this.payableAmount
		}
		this.$api.paymentProcessing(dataToSend).subscribe((response: any) => {
			console.log(response)
			// this.$errors.openDialog({
			// 	errors: {
			// 		error: `<span class='text-success'>${response.message}</span>`
			// 	}
			// })
			console.log('response---------------------->>', response)
			this.$spinner.hide()
			this.getReservationDetails(this.bookingId)
			this.buildingCardForm()
			this.changeDetection('card')

		})
	}
	showSaveButton(visibility: boolean) {
		this.visibility = !this.visibility
		console.log(this.BookingDetail.payment_status)
		if (this.BookingDetail.payment_status == 'paid' || this.BookingDetail.payment_status == 'transfer_failed') {
			this.visibility = false
		}
	}

	backButton() {
		this.$router.navigate(['/admin/daily-bookings-admin']);
	}

	// Month-Year Picker Logic
	get minExpiryDate() {
		return moment().startOf('month');
	}

	private setExpiryDate(date: moment.Moment) {
		const selectedDate = date.clone().startOf('month');
		this.expiryDateControl.setValue(selectedDate);
		this.cardForm.patchValue({
			exp_month: selectedDate.format('MM'),
			exp_year: selectedDate.year()
		}, { emitEvent: false });
		this.cardForm.updateValueAndValidity({ emitEvent: false });
	}

	private expiryDateValidator(): ValidatorFn {
		return (control: AbstractControl): ValidationErrors | null => {
			const expMonth = control.get('exp_month')?.value;
			const expYear = control.get('exp_year')?.value;

			if (!expMonth || !expYear) {
				return null;
			}

			const selectedDate = moment(`${expYear}-${expMonth}-01`, 'YYYY-MM-DD', true);
			if (!selectedDate.isValid()) {
				return { invalidExpiryDate: true };
			}

			return selectedDate.isBefore(moment().startOf('month')) ? { invalidExpiryDate: true } : null;
		};
	}

	chosenYearHandler(normalizedYear: moment.Moment) {
		const ctrlValue = this.expiryDateControl.value || moment();
		ctrlValue.year(normalizedYear.year());
		this.expiryDateControl.setValue(ctrlValue);
	}

	chosenMonthHandler(normalizedMonth: moment.Moment, datepicker: any) {
		const selectedDate = normalizedMonth.clone().year(normalizedMonth.year()).month(normalizedMonth.month());
		this.setExpiryDate(selectedDate);

		this.cardForm.get('exp_month').markAsDirty();
		this.cardForm.get('exp_year').markAsDirty();
		this.cardForm.get('exp_month').markAsTouched();
		this.cardForm.get('exp_year').markAsTouched();
		this.expiryDateControl.markAsTouched();

		datepicker.close();
	}
}
