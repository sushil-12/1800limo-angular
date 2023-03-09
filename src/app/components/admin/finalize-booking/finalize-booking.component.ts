import { Component, OnInit, isDevMode } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as moment from "moment";
import { NgxSpinnerService } from "ngx-spinner";
import { AdminService } from "src/app/services/admin.service";
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { FormBuilder, FormGroup, Validators, FormControl, FormArray, ValidationErrors, ValidatorFn, AbstractControl } from '@angular/forms';
import { CustomvalidationService } from "src/app/services/customvalidation.service";

@Component({
	selector: "app-finalize-booking",
	templateUrl: "./finalize-booking.component.html",
	styleUrls: ["./finalize-booking.component.scss"],
})
export class FinalizeBookingComponent implements OnInit {
	bookingId: number = 0;

	BookingDetail: any;
	RatesList: any;
	CardsInformation: any=[];
	paymentSection: boolean = true;
	chevron: boolean = true


	booking_details_list: Record<string, any> = {};
	transferType: any;
	edit_rates_value: any;
	return_edit_rates_value: any;
	affiliate_type:string;

	finalize_params = {
		distance: 0,
		number_of_hours: 0,
		number_of_vehicles: 0,
		booking_id: 0
	}

	cardForm: FormGroup
	paymentMethod: string = 'card';
	isCardFormOpen: boolean = false
	visibility: boolean = true
	selectedCard:any;
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
		private $errors: ErrorDialogService,
		private $spinner: NgxSpinnerService,
		private customValidator: CustomvalidationService
	) { 
	}

	ngOnInit(): void {
		this.$spinner.show();
		this.buildingCardForm();
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
		if(method == 'new_card'){
			this.isCardFormOpen = true
			this.paymentMethod = 'card'
		}else{
			this.paymentMethod = method
			this.isCardFormOpen = false
		}
	}

	scroll(id) {
		let el = document.getElementById(id);
		console.log(`scrolling to ${id}` , el);
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
	}




	buildingCardForm() {
		this.cardForm = this.$form.group({
			name: ['', [Validators.required , Validators.pattern("^[a-zA-Z]*$")]],
			card_number: ['', [Validators.required ,Validators.pattern("^[0-9]*$"), Validators.minLength(12) , Validators.maxLength(20)]],
			exp_month: ['', Validators.required],
			exp_year: ['', Validators.required],
			cvv: ['', [Validators.required , Validators.pattern("^[0-9]*$") , Validators.maxLength(4) , Validators.minLength(2)]],
			save_card_detail :[false]
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
			.getFinalizeDetails(booking_id)
			.pipe()
			.subscribe((response: any) => {
				console.log(response.data, "check response");
				this.BookingDetail = response.data
				this.transferType = this.BookingDetail.transfer_type
				this.init_rates = true;
				this.CardsInformation = response.data.cards
				this.selectedCard = this.CardsInformation.filter(i=> i.cc_prority == 'Primary')[0]
				this.finalize_params['distance'] = this.BookingDetail.distance
				this.finalize_params['number_of_hours'] = this.BookingDetail.number_of_hours
				this.finalize_params['number_of_vehicles'] = this.BookingDetail.number_of_vehicles
				this.finalize_params['booking_id'] = this.BookingDetail.reservation_id
				this.affiliate_type = response.data.affiliate_type
				this.visibility = response.data.payment_status=='paid' ? false : true 
				this.$spinner.hide();
				setTimeout(()=>{
					this.scroll('NumVehicles')
				},600)
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


	submitForm() {
		// console.log(this.BookingForm);
		let rateArray = JSON.parse(JSON.stringify(this.edit_rates_value))
		delete rateArray.sub_total
		delete rateArray.grand_total
		let body  = {
			reservation_id : this.bookingId,
			rateArray : rateArray,
			sub_total : this.edit_rates_value.sub_total,
			grand_total : this.edit_rates_value.grand_total,
			affiliate_type : this.affiliate_type
		}
		console.log('\n\n Submitting Form' , body);
			this.$spinner.show()
			this.$api.updateFinalizeRates(body).subscribe((response: any) => {
				this.$errors.openDialog({
					errors: {
						error: `<span class='text-success'>${response.message}</span>`
					}
				})
				// this.$router.navigate(['/admin/daily-bookings-admin'])
				console.log('response-->>' , response)
				this.$spinner.hide()
			})

		// else {
		// 	$('#previewBooking').modal('handleUpdate').modal('show')
		// }
	}
	handleChangeCard(card:any){
		this.selectedCard = card
	}

	makePayment(){

		console.log('<<<<-----handle valid---->>>>> ' , this.cardForm.valid)
		console.log('-----=====?>>>>>',this.isCardFormOpen ? this.cardForm.valid : (this.CardsInformation.length>0))
		let dataToSend :any
		if(this.paymentMethod=='cash'){
			console.log('<<<<<----payment through cash-->>>>')
			dataToSend = {
				reservation_id : this.bookingId,
				grand_total : this.edit_rates_value.grand_total,
				paymentMethod : 'cash'
			}
			this.$spinner.show()
					this.$api.paymentProcessing(dataToSend).subscribe((response: any) => {
						this.$errors.openDialog({
							errors: {
								error: `<span class='text-success'>${response.message}</span>`
							}
						})
						this.$router.navigate(['/admin/invoice-summary'] ,{ queryParams: { bookingId: this.bookingId } })
						console.log('response---------------------->>' , response)
						this.$spinner.hide()
					})
		}
		else{
			if(this.isCardFormOpen ? this.cardForm.valid : (this.CardsInformation.length>0) ){
				if(this.paymentMethod=='cash'){
					console.log('<<<<<----payment through cash-->>>>')
					dataToSend = {
						reservation_id : this.bookingId,
						grand_total : this.edit_rates_value.grand_total,
						paymentMethod : 'cash'
					}
				}
				else{
					if(this.isCardFormOpen){
						dataToSend = {
							CreditCardsDetail : {...this.cardForm.value},
							isExistingCard : false,
							paymentMethod : 'credit_card',
							reservation_id : this.bookingId,
							grand_total : this.edit_rates_value.grand_total
						}
						console.log('<<<<--card form detail-->>>')
					}
					else{
						dataToSend = {
							isExistingCard :true,
							paymentMethod : 'credit_card',
							CreditCardsDetail:{
								cardID:	this.selectedCard.ID
							},
							reservation_id : this.bookingId,
							grand_total : this.edit_rates_value.grand_total
						}
						console.log('selected card-->>>')
					}
				}
				this.$spinner.show()
					this.$api.paymentProcessing(dataToSend).subscribe((response: any) => {
						this.$errors.openDialog({
							errors: {
								error: `<span class='text-success'>${response.message}</span>`
							}
						})
						this.$router.navigate(['/admin/invoice-summary'] ,{ queryParams: { bookingId: this.bookingId } })
						console.log('response---------------------->>' , response)
						this.$spinner.hide()
					})
			}
			else{
				console.log('<<<<-----handle valid---->>>>> ' , this.cardForm.valid)
				if(!this.CardsInformation.length && !this.isCardFormOpen){
					this.$errors.openDialog({
						errors: {
							error: `<span class='text-danger'> No card selected</span>`
						}
					})
				}
				else{
					this.$errors.openDialog({
					errors: {
						error: `<span class='text-danger'>Please Enter correct card details</span>`
					}
				})
				}
			}
		}
		
	}
	RateFormValue(form: any) {
		this.edit_rates_value = form
	}
	ReturnRateFormValue(form: any) {
		this.return_edit_rates_value = form
	}
	showSaveButton(visibility: boolean) {
		this.visibility = !this.visibility
		console.log(this.BookingDetail.payment_status)
		if(this.BookingDetail.payment_status=='paid'){
			this.visibility = false
		}
	}
}
