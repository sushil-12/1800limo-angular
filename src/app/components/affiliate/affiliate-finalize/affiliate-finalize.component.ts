import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { AffiliateService } from 'src/app/services/affiliate.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';

@Component({
	selector: 'app-affiliate-finalize',
	templateUrl: './affiliate-finalize.component.html',
	styleUrls: ['./affiliate-finalize.component.scss']
})
export class AffiliateFinalizeComponent implements OnInit {

	public bookingId: any;
	public BookingDetail: any;
	public transferType: any;
	public deleteCardForm: FormGroup;
	cardForm: FormGroup
	init_rates: boolean = false;
	edit_rates_value: any;
	finalize_btn: any = 'Finalize'
	isCardFormOpen: boolean = false
	paymentMethod: string = 'card';
	CardsInformation: any = [];
	primaryCards: any = []
	selectedCard: any;
	paymentSection: boolean = true;
	chevron: boolean = true
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

	finalize_params = {
		distance: 0,
		number_of_hours: 0,
		number_of_vehicles: 0,
		booking_id: 0
	}
	quoteAmount: any;
	hours: any;
	main_receipt_url: any;
	paymentDetailByCard: any;
	isTravelShare: boolean;
	editRate: any;
	isCreatedByAdmin: boolean = true;
	shareArray: any;
	r_shareArray: any;
	adminSharePercent: number = 25;
	service_type: any;
	isFarmoutBooking: boolean = false;
	isFinalizeButton: boolean = false;
	bookdataresp: any;
	currencySymbol: any;
	paidAmount:any;
	currentUser:any;

	constructor(
		private $api: AdminService,
		private affiliateService: AffiliateService,
		private $form: FormBuilder,
		private router: Router,
		private spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private fb: FormBuilder,
		private activatedroute: ActivatedRoute,
		private stateManagementService: StateManagementService,
	) { }

	ngOnInit(): void {

		this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
		// this.spinner.show()
		this.buildingCardForm();
		this.activatedroute.queryParams
			.subscribe((params) => {
				this.bookingId = params?.bookingId
				this.editRate = params?.editRate
				console.log("booking id---->>>>>>", this.bookingId,)

				if (!this.bookingId) {
					if(this.currentUser.roleName == 'sub_affiliate'){
						this.router.navigate(['/sub_affiliate/my-bookings']);
					}
					else{
						this.router.navigate(['/affiliate/my-bookings']);
					}
				}
				else {
					// this.buildChargesFormGroup()
					// this.chargesForm.get('reservation_id').setValue(this.bookingId)
					this.getBookingData()
					this.paymentDetail(this.bookingId)
				}
			});
		this.deleteCardForm = this.$form.group({
			cardId: ["", Validators.required],
			accId: ["", Validators.required],
		});

		//save currency symbol
		this.currencySymbol = this.stateManagementService.getCurrencySymbol();
	}


	getBookingData(booking_id: number = 0) {
		this.affiliateService.getBookingData(this.bookingId)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(({ data }: any) => {
				console.log('response getBookingData Affiliate--->>>>', data)
				this.bookdataresp = data
				this.BookingDetail = data?.booking_detail
				this.isFinalizeButton = this.BookingDetail?.booking_status == 'finalized' ? true : false,
					this.transferType = this.BookingDetail?.transfer_type
				this.paidAmount = this.BookingDetail?.charged_amount
				this.isTravelShare = data?.booking_detail?.account_type == 'travel_planner' ? true : false
				this.isFarmoutBooking = data?.booking_detail?.reservation_type == 'farmout' ? true : false
				this.finalize_params.number_of_vehicles = data?.booking_detail?.number_of_vehicles
				this.init_rates = true;
				this.hours = data?.booking_detail?.number_of_hours
				this.finalize_params['number_of_hours'] = this.BookingDetail.number_of_hours
				this.isCreatedByAdmin = data?.booking_detail?.created_by == 1 ? true : false
				this.service_type = data?.booking_detail?.service_type
				this.quoteAmount = data?.grand_total
				this.CardsInformation = data?.CreditCardsDetail
				this.primaryCards = this.CardsInformation
				console.log('primary cards--->>>>', this.primaryCards, this.primaryCards.length)
				this.selectedCard = this.primaryCards[this.primaryCards.length - 1]
				console.log('selected cards ----->>>', this.selectedCard)
			})
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

	HandleReturnNumberOfHr(data: any) {
		console.log('____<><><><><><><><>', data)
		this.finalize_params['number_of_hours'] = data
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
	RateFormValue(form: any) {
		console.log('rate form value ------>>>>', form)
		this.edit_rates_value = form
		if (this.BookingDetail?.booking_status == 'finalized') {
			if (this.edit_rates_value.grand_total != this.bookdataresp?.grand_total) {
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
	paymentDetail(bookingId) {
		this.$api
			.getPaymentDetailFinalize(bookingId)
			.pipe()
			.subscribe((response: any) => {
				console.log(response.data, "check response paymentDetail");
				if (response.data) {
					this.main_receipt_url = response?.data?.main_receipt_url
					this.paymentDetailByCard = response?.data?.charges
				}
			});
	}
	acceptRejectButton(type: string) {
		console.log("in func accpe and reject", type)
		if (type == 'reject') {
			console.log('in function cancel booking', this.bookingId)
			this.spinner.show();

			this.affiliateService.cancelBooking(this.bookingId)
				.pipe(
					catchError(err => {
						this.spinner.hide();//hide spinner
						// $('#cancelBooking').modal('hide');
						return throwError(err);
					})
				)
				.subscribe(({ data, success, message }: any) => {
					if (success == true) {
						this.spinner.hide();//hide spinner
						if(this.currentUser.roleName == 'sub_affiliate'){
							this.router.navigate(['/sub_affiliate/my-bookings']);
						}
						else{
							this.router.navigate(['/affiliate/my-bookings']);
						}

						// this.loadBookings()
						// $('#cancelBooking').modal('hide');
						// this.$errors.openDialog({
						// 	errors: {
						// 		error: `<span class='text-success'>${message}</span>`
						// 	}
						// })
					}
				});

		}
		else {
			console.log('in function accept booking', this.bookingId)
			this.spinner.show();

			this.affiliateService.acceptBooking(this.bookingId)
				.pipe(
					catchError(err => {
						this.spinner.hide();//hide spinner
						// $('#acceptBooking').modal('hide');
						return throwError(err);
					})
				)
				.subscribe(({ data, success, message }: any) => {
					if (success == true) {
						this.spinner.hide();//hide spinner
						if(this.currentUser.roleName == 'sub_affiliate'){
							this.router.navigate(['/sub_affiliate/my-bookings']);
						}
						else{
							this.router.navigate(['/affiliate/my-bookings']);
						}

						// this.loadBookings()
						// $('#acceptBooking').modal('hide');
						// this.$errors.openDialog({
						// 	errors: {
						// 		error: `<span class='text-success'>${message}</span>`
						// 	}
						// })
					}
				});
		}
	}
	createReservationShareArray() {
		console.log('in function createReservationShareArray')
		if (this.edit_rates_value) {
			let base_rate = 0
			if (this.service_type == 'charter_tour') {
				base_rate += this.edit_rates_value.all_inclusive_rates["Base_Rate"].baserate * this.finalize_params.number_of_hours
			}
			else {
				base_rate += this.edit_rates_value.all_inclusive_rates["Base_Rate"].baserate
			}
			['ELH_Charges', 'Stops', 'Wait'].map((key) => {
				base_rate += this.edit_rates_value.all_inclusive_rates[key].baserate
			});
			for (const key of Object.keys(this.edit_rates_value.amenities)) {
				base_rate += this.edit_rates_value.amenities[key].baserate;
			}
			// for (const key of Object.keys(this.edit_rates_value.all_inclusive_rates)) {
			// 	base_rate += this.edit_rates_value.all_inclusive_rates[key].baserate;
			// }
			// for (const key of Object.keys(this.edit_rates_value.amenities)) {
			// 	base_rate += this.edit_rates_value.amenities[key].baserate;
			// }
			let grandTotal = this.edit_rates_value.grand_total
			let stripeFee = grandTotal * 0.05 + 0.30
			let adminShare = (base_rate * this.adminSharePercent) / 100
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
			if (this.BookingDetail?.account_type == 'travel_planner' && !this.isCreatedByAdmin) {
				console.log("in if travel planner")
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
			}
			this.shareArray = shareArray
			// console.log('in function createReservationShareArray-->>>' , base_rate, shareArray )
			return shareArray;
			// value['rateArray'] = JSON.parse(JSON.stringify(this.edit_rates_value))
		}
	}
	submitForm() {
		this.spinner.show();

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
			number_of_hours: this.finalize_params['number_of_hours'],
			shareArray: this.shareArray
		}
		console.log('final obj -------------->>>>>>>', body)
		console.log('\n\n Submitting Form', body);
		this.affiliateService.updateFinalizeRates(body).subscribe((response: any) => {
			this.spinner.hide()
			// this.$errors.openDialog({
			// 	errors: {
			// 		error: `<span class='text-success'>${response.message}</span>`
			// 	}
			// })
			// this.$router.navigate(['/admin/daily-bookings-admin'])
			console.log('response-->>', response)
			this.finalize_btn = "Finalized"
			this.getBookingData(this.bookingId)
			this.$errors.openDialog({
				errors: {
					error: `<span class='text-danger font-weight-bolder text-2xl' style="font-size: 24px;">Please click charge button to get paid !</span>`
				}
			})

		})


	}

	resetCardForm() {
		this.cardForm.reset()
	}
	deleteCardClicked(item: any) {
		this.deleteCardForm.patchValue({
			cardId: item.ID,
			accId: this.BookingDetail.acc_id,
		});
	}
	handleChangeCard(card: any) {
		this.selectedCard = card
	}
	handlePaymentSection() {
		this.chevron = !this.chevron
		this.paymentSection = !this.paymentSection
	}
	buildingCardForm() {
		this.cardForm = this.$form.group({
			name: ['', [Validators.required]],
			card_number: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(12), Validators.maxLength(20)]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			cvv: ['', [Validators.required, Validators.pattern("^[0-9]*$")]],
			save_card_detail: [false]
		})
	}
	changeDetection(method: string) {
		if (method == 'new_card') {
			this.isCardFormOpen = true
			this.paymentMethod = 'card'
		} else {
			this.paymentMethod = method
			this.isCardFormOpen = false
		}
	}
	makePayment(method: string) {

		console.log('In function make payment', method)
		if (method == 'new_card') {
			this.isCardFormOpen = true
			this.paymentMethod = 'card'
		} else {
			this.paymentMethod = method
			this.isCardFormOpen = false
		}
		// /affiliate/finalize-rate-edit'
		console.log('<<<<-----handle valid---->>>>> ', this.cardForm.valid, 'is card form open--->>>>', this.isCardFormOpen)
		console.log('-----=====?>>>>>', this.isCardFormOpen ? this.cardForm.valid : (this.CardsInformation.length > 0))
		let dataToSend: any
		if (this.paymentMethod == 'cash') {
			console.log('<<<<<----payment through cash-->>>>')
			dataToSend = {
				reservation_id: this.bookingId,
				grand_total: this.edit_rates_value?.grand_total,
				payment_method: 'cash'
			}
			this.spinner.show()
			this.affiliateService.paymentProcessing(dataToSend).subscribe((response: any) => {
				// this.$errors.openDialog({
				// 	errors: {
				// 		error: `<span class='text-success'>${response.message}</span>`
				// 	}
				// })
				if(this.currentUser.roleName == 'sub_affiliate'){
					this.router.navigate(['/sub_affiliate/invoice-summary'], { queryParams: { bookingId: this.bookingId } })
				}
				else{
					this.router.navigate(['/affiliate/invoice-summary'], { queryParams: { bookingId: this.bookingId } })
				}
				console.log('response---------------------->>', response)
				this.spinner.hide()
			})
		}
		else {
			console.log('in else----->>>>>>>>..')
			if (this.isCardFormOpen ? this.cardForm.valid : (this.CardsInformation.length > 0)) {
				console.log('validation clear-_>>>>>>>>>>')
				if (this.paymentMethod == 'cash') {
					console.log('<<<<<----payment through cash-->>>>')
					dataToSend = {
						reservation_id: this.bookingId,
						grand_total: this.edit_rates_value.grand_total,
						payment_method: 'cash'
					}
				}
				else {
					if (this.isCardFormOpen) {
						dataToSend = {
							CreditCardsDetail: { ...this.cardForm.value },
							isExistingCard: false,
							payment_method: 'credit_card',
							reservation_id: this.bookingId,
							grand_total: this.edit_rates_value.grand_total
						}
						console.log('<<<<--card form detail-->>>')
					}
					else {
						dataToSend = {
							isExistingCard: true,
							payment_method: 'credit_card',
							CreditCardsDetail: {
								cardID: this.selectedCard?.ID
							},
							reservation_id: this.bookingId,
							grand_total: this.edit_rates_value.grand_total
						}
						console.log('selected card-->>>', this.selectedCard)
					}
				}
				console.log('<<<<<<<<---- data to send --->>>>>', dataToSend)
				this.spinner.show()
				this.affiliateService.paymentProcessing(dataToSend).subscribe((response: any) => {
					// this.$errors.openDialog({
					// 	errors: {
					// 		error: `<span class='text-success'>${response.message}</span>`
					// 	}
					// })
					if(this.currentUser.roleName == 'sub_affiliate'){
						this.router.navigate(['/sub_affiliate/invoice-summary'], { queryParams: { bookingId: this.bookingId } })
					}
					else{
						this.router.navigate(['/affiliate/invoice-summary'], { queryParams: { bookingId: this.bookingId } })
					}
					console.log('response---------------------->>', response)
					this.spinner.hide()
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

	deleteCard() {
		// this.spinner.show()
		// this.api.deleteCardFinalize(this.deleteCardForm.value.cardId,this.deleteCardForm.value.accId).subscribe((response: any) => {
		// 	this.$errors.openDialog({
		// 		errors: {
		// 			error: `<span class='text-success'>${response.message}</span>`
		// 		}
		// 	})
		// 	// this.$router.navigate(['/admin/daily-bookings-admin'])
		// 	this.$spinner.hide()
		// 	this.getReservationDetails(this.bookingId)
		// })
		// $('#warnDeleteCard').modal('hide')		
	}



}
