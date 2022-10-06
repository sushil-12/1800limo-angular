import { Component, OnInit, ViewChild, ElementRef, NgZone } from '@angular/core';
import { MapsAPILoader } from '@agm/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Component({
	selector: 'app-create-new-booking2',
	templateUrl: './create-new-booking2.component.html',
	styleUrls: ['./create-new-booking2.component.scss']
})
export class CreateNewBooking2Component implements OnInit
{

	public response: any;
	public bookingDetail: any;
	public CreditCardsDetail: any;
	public paramResponse: any;
	public bookingId: any;
	public chargesForm: FormGroup;
	public sub_total: number;
	public grand_total: number;
	public baseRate: number;
	public showMinimumRate: boolean;
	public recentlyStoredValue: number;
	public showCards: boolean = false;
	public selectedCardId: number;

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private fb: FormBuilder,
		private activatedroute: ActivatedRoute)
	{ }

	ngOnInit(): void
	{
		this.activatedroute.queryParams
			.subscribe((params) =>
			{
				this.bookingId = params.bookingId
				console.log(this.bookingId, "booking id")

				if (!this.bookingId)
				{
					this.router.navigate(['/admin/daily-bookings-admin']);
				}
				else
				{
					this.buildChargesFormGroup()
					this.chargesForm.get('reservation_id').setValue(this.bookingId)
					this.getBookingData()
				}
			});
	}

	buildChargesFormGroup()
	{
		this.chargesForm = this.fb.group({
			reservation_id: ['', Validators.required],
			sub_total: ['', Validators.required],
			grand_total: ['', Validators.required],
			payment_method: ['', Validators.required],
			CreditCardsDetail: this.fb.group({
				cardID: [''],
				cvc: [''],
			}),
			priceDetail: this.fb.group({
				all_inclusive_rates: new FormGroup({}),
				amenities: new FormGroup({}),
				others: new FormGroup({}),
				direct_taxes: new FormGroup({}),
				taxes: new FormGroup({})
			})
		})
	}



	getBookingData()
	{
		this.adminService.getReservationDetails(this.bookingId)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(({ data }: any) =>
			{
				console.log("array response", data)
				this.bookingDetail = data.booking_detail;
				this.CreditCardsDetail = data.CreditCardsDetail;
				console.log(this.CreditCardsDetail, "////////////////////////")
				this.sub_total = data.sub_total;
				this.grand_total = data.grand_total;
				this.chargesForm.patchValue({
					sub_total: this.sub_total,
					grand_total: this.grand_total
				});

				//set base rate based on hourly/milage rate
				if (data.priceDetail.all_inclusive_rates.Milage_Rate)
				{
					if (data.priceDetail.all_inclusive_rates.Milage_Rate.amount >= data.priceDetail.all_inclusive_rates.Minimum_Rate.amount)
					{
						// console.log('Milage_Rate')
						this.baseRate = data.priceDetail.all_inclusive_rates.Milage_Rate.amount;
						this.showMinimumRate = false;
					}
					else
					{
						// console.log('milage minimum rate')
						this.baseRate = data.priceDetail.all_inclusive_rates.Minimum_Rate.amount;
						this.showMinimumRate = true;
					}
				}
				else
				{
					//set base rate based on minimum rate
					if (data.priceDetail.all_inclusive_rates.Hourly_Rate.amount >= data.priceDetail.all_inclusive_rates.Minimum_Rate.amount)
					{
						// console.log('Hourly_Rate')
						this.baseRate = data.priceDetail.all_inclusive_rates.Hourly_Rate.amount;
						this.showMinimumRate = false;
					}
					else
					{
						// console.log('hourly minimum rate')
						this.baseRate = data.priceDetail.all_inclusive_rates.Minimum_Rate.amount;
						this.showMinimumRate = true;
					}
				}


				Object.entries(data.priceDetail.all_inclusive_rates).forEach(
					([key, value]) =>
					{
						// console.log(value)
						this.all_inclusive_rates.addControl(key, this.createItem(value))
					}
				);
				// console.log(this.all_inclusive_rates.controls)

				if (data.priceDetail.amenities)
				{
					Object.entries(data.priceDetail.amenities).forEach(
						([key, value]) =>
						{
							this.amenities.addControl(key, this.createItem(value))
						}
					);
				}
				// console.log(this.amenities.controls)

				Object.entries(data.priceDetail.others).forEach(
					([key, value]) =>
					{
						this.others.addControl(key, this.createItem(value))
					}
				);
				// console.log(this.others.controls)

				Object.entries(data.priceDetail.direct_taxes).forEach(
					([key, value]) =>
					{
						this.direct_taxes.addControl(key, this.createItem(value))
					}
				);
				// console.log(this.direct_taxes.controls)

				Object.entries(data.priceDetail.taxes).forEach(
					([key, value]) =>
					{

						this.taxes.addControl(key, this.createItem(value))
					}
				);
				// console.log(this.taxes.controls)

				this.spinner.hide();//hide spinner
				// this.calculate();
			});
	}

	get all_inclusive_rates(): FormGroup
	{
		return this.chargesForm.get("priceDetail").get("all_inclusive_rates") as FormGroup;
	}

	get amenities(): FormGroup
	{
		return this.chargesForm.get("priceDetail").get("amenities") as FormGroup;
	}

	get others(): FormGroup
	{
		return this.chargesForm.get("priceDetail").get("others") as FormGroup;
	}

	get direct_taxes(): FormGroup
	{
		return this.chargesForm.get("priceDetail").get("direct_taxes") as FormGroup;
	}

	get taxes(): FormGroup
	{
		return this.chargesForm.get("priceDetail").get("taxes") as FormGroup;
	}

	editBooking()
	{
		this.router.navigate(['/admin/create-new-booking'], {
			queryParams: {
				bookingId: this.bookingId
			}
		});
	}

	createItem(e): FormGroup
	{
		return this.fb.group({ ...e });
	}

	clickRates(value)
	{
		this.recentlyStoredValue = Number(value);
	}
	calculateRates(calculationType, key = null, obj = null)
	{
		switch (calculationType)
		{
			case 'all_inclusive_rates':
				{
					var res = obj.baserate * obj.multiple;
					res = Math.round(res * 100) / 100;// round of to 2 digits
					this.all_inclusive_rates.setControl(key, this.fb.group({ ...obj, amount: res || 0 }));

					// console.log(this.all_inclusive_rates.value.Minimum_Rate.amount);

					//set base rate based on minimum rate
					if (res >= this.all_inclusive_rates.value.Minimum_Rate.amount)
					{
						// console.log('Milage_Rate')
						this.baseRate = res;
						this.showMinimumRate = false;
					}
					else
					{
						// console.log('milage minimum rate')
						this.baseRate = this.all_inclusive_rates.value.Minimum_Rate.amount;
						this.showMinimumRate = true;
					}

					this.calculateRates('changeRatesOnChangeOfBaseRate');//calling function to update rate of all fields dependent on base rate
					break;
				}
			case 'Gratuity':
				{
					if (obj.percentage > 20)
					{
						alert("Gratuity Percentage can't be more than 20");
						this.others.setControl(key, this.fb.group({ ...obj, percentage: this.recentlyStoredValue || 0 }));
						return false;
					}
					var res = (this.baseRate * obj.percentage) / 100;
					res = Math.round(res * 100) / 100;// round of to 2 digits
					this.others.setControl(key, this.fb.group({ ...obj, amount: res || 0 }));
					this.calculate();
					break;
				}
			case 'taxes':
				{
					console.log(calculationType, key, obj);
					if (obj.type == 'percent')
					{
						var res = (this.baseRate * obj.percentage) / 100;
						res = Math.round(res * 100) / 100;// round of to 2 digits
						this.taxes.setControl(key, this.fb.group({ ...obj, percentage: obj.percentage || 0, amount: res || 0 }));
					}
					else if (obj.type == 'flat')
					{
						this.taxes.setControl(key, this.fb.group({ ...obj, flat_baserate: obj.flat_baserate || 0, amount: obj.flat_baserate || 0 }));
					}
					this.calculate();
					break;
				}
			case 'changeRatesOnChangeOfBaseRate':
				{
					// console.log(this.taxes.value);
					Object.entries(this.taxes.value).forEach(
						([key, value]) =>
						{
							// console.log(key,value);
							var data: any = value;
							if (data.type == 'percent')
							{
								var res = (this.baseRate * data.percentage) / 100;
								res = Math.round(res * 100) / 100;// round of to 2 digits
								this.taxes.setControl(key, this.fb.group({ ...data, percentage: data.percentage || 0, amount: res || 0 }));
							}
							else if (data.type == 'flat')
							{
								this.taxes.setControl(key, this.fb.group({ ...data, flat_baserate: data.flat_baserate || 0, amount: data.flat_baserate || 0 }));
							}
						}
					);
					Object.entries(this.others.value).forEach(
						([key, value]) =>
						{
							// console.log(key,value);
							var data: any = value;
							if (data.percentage > 20)
							{
								alert("Gratuity Percentage can't be more than 20");
								this.others.setControl(key, this.fb.group({ ...data, percentage: this.recentlyStoredValue || 0 }));
								return false;
							}
							var res = (this.baseRate * data.percentage) / 100;
							res = Math.round(res * 100) / 100;// round of to 2 digits
							this.others.setControl(key, this.fb.group({ ...data, amount: res || 0 }));
						}
					);

					this.calculate();
					break;
				}
		}
	}
	calculate()
	{
		// console.log('calculate',this.chargesForm);return false;
		this.sub_total = 0;

		Object.entries(this.chargesForm.value.priceDetail.all_inclusive_rates).forEach(
			([key, value]) =>
			{
				var data: any = value;

				//checking minimum rate case
				if (key == 'Minimum_Rate')
				{
					//add minimum rate in case of minimum rate is higher than milage/hourly rate
					if (this.showMinimumRate)
					{
						// console.log('11')
						this.sub_total += (+data.amount);
					}
				}
				else
				{
					//set base rate based on minimum rate
					if (!this.showMinimumRate)
					{
						// console.log('22')
						this.sub_total += (+data.amount);
					}
				}
				// console.log('33')
			});

		Object.entries(this.chargesForm.value.priceDetail.others).forEach(
			([key, value]) =>
			{
				var data: any = value;
				this.sub_total += (+data.amount);
			});
		Object.entries(this.chargesForm.value.priceDetail.amenities).forEach(
			([key, value]) =>
			{
				var data: any = value;
				this.sub_total += (+data.amount);
			});
		Object.entries(this.chargesForm.value.priceDetail.direct_taxes).forEach(
			([key, value]) =>
			{
				var data: any = value;
				this.sub_total += (+data.amount);
			});
		Object.entries(this.chargesForm.value.priceDetail.taxes).forEach(
			([key, value]) =>
			{
				var data: any = value;
				this.sub_total += (+data.amount);
			});
		this.sub_total = Math.round(this.sub_total * 100) / 100;
		this.grand_total = this.sub_total * this.bookingDetail.number_of_vehicles;
		console.log(
			"sub_total",
			this.sub_total
		);
		this.chargesForm.patchValue({
			sub_total: this.sub_total,
			grand_total: this.grand_total
		});

	}

	ChangePaymentMethod(paymentMethod)
	{
		if (paymentMethod == 'credit_card')
		{
			this.showCards = true;
		}
		else
		{
			this.showCards = false;
		}
	}

	ChangeCard(selectedCardId)
	{
		console.log(selectedCardId, "LLLLLLLLLLLLLLLLLLLLLLLLLLLLL")
		this.selectedCardId = selectedCardId;
	}

	submitForm()
	{
		console.log(this.chargesForm);
		// return false;
		// stop here if form is invalid
		if (this.chargesForm.invalid)
		{
			return;
		}

		this.spinner.show();
		// this.disableSubmitButton=true; //disable submit button

		this.adminService.paymentProcessing(this.chargesForm.value)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.response = result;
				this.spinner.hide();//hide spinner

				this.router.navigate(['/admin/invoice-summary'], { queryParams: { bookingId: this.bookingId } });
			});
	}
}
