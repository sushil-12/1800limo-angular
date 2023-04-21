import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AffiliateService } from 'src/app/services/affiliate.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

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
	init_rates: boolean=false;
	edit_rates_value: any;
	finalize_btn: any = 'Finalize'
	isCardFormOpen: boolean = false
	paymentMethod: string = 'card';
	CardsInformation: any=[];
	selectedCard:any;
	paymentSection: boolean = true;
	chevron: boolean = true

	finalize_params = {
		distance: 0,
		number_of_hours: 0,
		number_of_vehicles: 0,
		booking_id: 0
	}
	constructor(
		private affiliateService: AffiliateService,
		private $form: FormBuilder,
		private router: Router,
		private spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private fb: FormBuilder,
		private activatedroute: ActivatedRoute
	) { }

	ngOnInit(): void {
		// this.spinner.show()
		this.buildingCardForm();
		this.activatedroute.queryParams
			.subscribe((params) => {
				this.bookingId = params?.bookingId
				console.log("booking id---->>>>>>", this.bookingId,)

				if (!this.bookingId) {
					this.router.navigate(['/affiliate/my-bookings']);
				}
				else {
					// this.buildChargesFormGroup()
					// this.chargesForm.get('reservation_id').setValue(this.bookingId)
					this.getBookingData()
				}
			});
			this.deleteCardForm = this.$form.group({
				cardId: ["", Validators.required],
				accId: ["", Validators.required],
			});
	}


	getBookingData() {
		this.affiliateService.getBookingData(this.bookingId)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(({ data }: any) => {
				console.log('response getBookingData Affiliate--->>>>', data)
				this.BookingDetail = data?.booking_detail
				this.transferType = this.BookingDetail?.transfer_type
				this.finalize_params.number_of_vehicles = data?.booking_detail?.number_of_vehicles
				this.init_rates = true;
				// this.selectedCard = this.CardsInformation.filter(i=> i.cc_prority == 'Primary')[0]
				// this.CardsInformation = data.cards
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
	}


	submitForm() {
		this.finalize_btn = 'Finalized'
		let rateArray = JSON.parse(JSON.stringify(this.edit_rates_value))
		delete rateArray.sub_total
		delete rateArray.grand_total
		let body = {
			reservation_id: this.bookingId,
			rateArray: rateArray,
			sub_total: this.edit_rates_value.sub_total,
			grand_total: this.edit_rates_value.grand_total
		}
		console.log('final obj -------------->>>>>>>', body)
		console.log('\n\n Submitting Form', body);
		this.affiliateService.updateFinalizeRates(body).subscribe((response: any) => {
			this.$errors.openDialog({
				errors: {
					error: `<span class='text-success'>${response.message}</span>`
				}
			})
			// this.$router.navigate(['/admin/daily-bookings-admin'])
			console.log('response-->>', response)
		})

	}
	resetCardForm() {
		this.cardForm.reset()
	}
	deleteCardClicked(item:any) {
		this.deleteCardForm.patchValue({
			cardId: item.ID,
			accId: this.BookingDetail.acc_id,
		});
	}
	handleChangeCard(card:any){
		this.selectedCard = card
	}
	handlePaymentSection() {
		this.chevron = !this.chevron
		this.paymentSection = !this.paymentSection
	}
	buildingCardForm() {
		this.cardForm = this.$form.group({
			name: ['', [Validators.required ]],
			card_number: ['', [Validators.required ,Validators.pattern("^[0-9]*$"), Validators.minLength(12) , Validators.maxLength(20)]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			cvv: ['', [Validators.required , Validators.pattern("^[0-9]*$")]],
			save_card_detail :[false]
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
	makePayment() {

		console.log('In function make payment')
		// console.log('<<<<-----handle valid---->>>>> ' , this.cardForm.valid)
		// console.log('-----=====?>>>>>',this.isCardFormOpen ? this.cardForm.valid : (this.CardsInformation.length>0))
		// let dataToSend :any
		// if(this.paymentMethod=='cash'){
		// 	console.log('<<<<<----payment through cash-->>>>')
		// 	dataToSend = {
		// 		reservation_id : this.bookingId,
		// 		grand_total : this.edit_rates_value.grand_total,
		// 		paymentMethod : 'cash'
		// 	}
		// 	this.$spinner.show()
		// 			this.$api.paymentProcessing(dataToSend).subscribe((response: any) => {
		// 				this.$errors.openDialog({
		// 					errors: {
		// 						error: `<span class='text-success'>${response.message}</span>`
		// 					}
		// 				})
		// 				this.$router.navigate(['/admin/invoice-summary'] ,{ queryParams: { bookingId: this.bookingId } })
		// 				console.log('response---------------------->>' , response)
		// 				this.$spinner.hide()
		// 			})
		// }
		// else{
		// 	if(this.isCardFormOpen ? this.cardForm.valid : (this.CardsInformation.length>0) ){
		// 		if(this.paymentMethod=='cash'){
		// 			console.log('<<<<<----payment through cash-->>>>')
		// 			dataToSend = {
		// 				reservation_id : this.bookingId,
		// 				grand_total : this.edit_rates_value.grand_total,
		// 				paymentMethod : 'cash'
		// 			}
		// 		}
		// 		else{
		// 			if(this.isCardFormOpen){
		// 				dataToSend = {
		// 					CreditCardsDetail : {...this.cardForm.value},
		// 					isExistingCard : false,
		// 					paymentMethod : 'credit_card',
		// 					reservation_id : this.bookingId,
		// 					grand_total : this.edit_rates_value.grand_total
		// 				}
		// 				console.log('<<<<--card form detail-->>>')
		// 			}
		// 			else{
		// 				dataToSend = {
		// 					isExistingCard :true,
		// 					paymentMethod : 'credit_card',
		// 					CreditCardsDetail:{
		// 						cardID:	this.selectedCard.ID
		// 					},
		// 					reservation_id : this.bookingId,
		// 					grand_total : this.edit_rates_value.grand_total
		// 				}
		// 				console.log('selected card-->>>')
		// 			}
		// 		}
		// 		this.$spinner.show()
		// 			this.$api.paymentProcessing(dataToSend).subscribe((response: any) => {
		// 				this.$errors.openDialog({
		// 					errors: {
		// 						error: `<span class='text-success'>${response.message}</span>`
		// 					}
		// 				})
		// 				this.$router.navigate(['/admin/invoice-summary'] ,{ queryParams: { bookingId: this.bookingId } })
		// 				console.log('response---------------------->>' , response)
		// 				this.$spinner.hide()
		// 			})
		// 	}
		// 	else{
		// 		console.log('<<<<-----handle valid---->>>>> ' , this.cardForm.valid)
		// 		if(!this.CardsInformation.length && !this.isCardFormOpen){
		// 			this.$errors.openDialog({
		// 				errors: {
		// 					error: `<span class='text-danger'> No card selected</span>`
		// 				}
		// 			})
		// 		}
		// 		else{
		// 			this.$errors.openDialog({
		// 			errors: {
		// 				error: `<span class='text-danger'>Please Enter correct card details</span>`
		// 			}
		// 		})
		// 		}
		// 	}
		// }

	}

	deleteCard() {
		this.spinner.show()
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
