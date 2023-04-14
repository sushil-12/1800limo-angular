import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AffiliateService } from 'src/app/services/affiliate.service';

@Component({
	selector: 'app-affiliate-finalize-rates',
	templateUrl: './affiliate-finalize-rates.component.html',
	styleUrls: ['./affiliate-finalize-rates.component.scss']
})
export class AffiliateFinalizeRatesComponent implements OnInit {
	@Input("initRates") init_rates: boolean = false;
	@Input("affiliate_type") affiliate_type: string = "";
	@Input("distance") distance: string = "";
	@Input("reservation_id") bookingId: number = 0;
	@Input("vehicles") vehs: number = 0;
	@Input("hours") nums: number = 0;
	@Input('reset') reset: boolean = false;



	@Output("formvalue") formvalue = new EventEmitter<Record<string, any>>();

	ratesform: boolean = true;
	ratesdata = new BehaviorSubject<any>({});
	RatesForm: FormGroup;
	response:any;


	rate_params: any = {
		chevrons: {
			section: true,
			all_inclusive_rates: true,
			others: false,
			direct_taxes: false,
			taxes: false,
			amenities: false,
			misc: false,
		},
	};


	minimum_rate: Record<string, any>;

	total: Record<string, any> = {};

	subtotal: number = 0;
	grandtotal: number = 0;
	admin_share: number = 25;
	calc_admin_share: number = 0;

	vehicles: number = 1;
	hours: number = 0;

	constructor(
		private $form: FormBuilder,
		private affiliateService: AffiliateService,
		private spinner: NgxSpinnerService
	) { }

	ngOnInit(): void {
		
	}

	ngOnChanges(changes: SimpleChanges) {
		console.warn("Change has been detected: ", changes);

		if (changes?.bookingId && changes?.bookingId?.currentValue != 0) {
			this.initRates();
		}
	}





	// fetchRates() {
	// 	this.affiliateService.getBookingData(this.bookingId)
	// 		.pipe(
	// 			catchError(err => {
	// 				this.spinner.hide();//hide spinner
	// 				return throwError(err);
	// 			})
	// 		).subscribe(({ data }: any) => {
	// 			if (Object.keys(data.priceDetail).length) {
	// 				this.ratesdata.next(data.priceDetail);
	// 			}
	// 			else {
	// 				console.error('Could not fetch Rates Data. ')
	// 			}
	// 		})
	// }



	getRatesData() {
		return this.ratesdata.asObservable();
	}

	toggleDropdown(section: string) {
		this.rate_params["chevrons"][section] = !this.rate_params["chevrons"][section];
	}

	handleSubHeadingScroll(items: string, id: any) {
		this.rate_params["chevrons"][items] = !this.rate_params["chevrons"][items];
		let el = document.getElementById(id);
		console.log(`scrolling to ${id}`, el);
		setTimeout(() => {
			el.scrollIntoView();
		}, 600)
	}
	textFormatter(text: string) {
		try {
			return text.replace(/[\\\_$]+/g, " ");
		} catch {
			return text;
		}
	}



	buildRatesForm(form: string, data: Record<string, any>): FormGroup {
		// Base Value for foundation of the whole algorithm
		if (data.hasOwnProperty("rate_label")) {
			return this.$form.group({ ...data });
		}

		for (let key in data) {
			if (Array.isArray(data[key])) {
				// TODO do thing for array type
				console.log("Data contains array.");
				return;
			}
			// if inner values contains object, ONLY
			else Object.values(data[key]).length > 0;
			{
				for (let item in data[key]) {
					if (form === "RatesForm") {
						console.log('field created--->>>', key, item);
						(<FormGroup>this.RatesForm.get(key)).addControl(item, this.buildRatesForm(form, data[key][item]));
						(<FormGroup>((<FormGroup>this.RatesForm.get(key)).get(item))).get("baserate").valueChanges.subscribe((value: number) => {
							this.calculateAmount("RatesForm", key, item);
						});
					}
				}
			}
		}
	}



	initRates() {
		console.log("Init Rates");
		this.RatesForm = this.$form.group({
			all_inclusive_rates: this.$form.group({}),
			others: this.$form.group({}),
			direct_taxes: this.$form.group({}),
			taxes: this.$form.group({}),
			amenities: this.$form.group({}),
			misc: this.$form.group({}),
		});
		console.log('Rates form init()')
		this.affiliateService.getBookingData(this.bookingId)
		.pipe(
			catchError(err => {
				this.spinner.hide();//hide spinner
				return throwError(err);
			})
		).subscribe(({ data }: any) => {
			if (Object.keys(data.priceDetail).length) {
				this.response = data
				this.grandtotal = data.grand_total
				this.subtotal = data.sub_total
				console.log('subtotal-->>' , this.subtotal)
				this.ratesdata.next(data.priceDetail);
			}
			else {
				console.error('Could not fetch Rates Data. ')
			}
		})
		this.getRatesData().subscribe((data: any) => {
			this.buildRatesForm("RatesForm", data);
			console.info('rates form 1--->>>>>',this.RatesForm)
			
		})


		// will send the rates form value to the booking component on any change in the whole form
		this.RatesForm.valueChanges.subscribe((value: any) => {
			this.calculateTotal("RatesForm");
			this.calculateGrandTotal("RatesForm");
		});

		(<FormGroup>this.RatesForm.get('all_inclusive_rates')).valueChanges.subscribe(() => {
			for (let formgroup in this.RateForm) {
				for (let subform in this.RateForm[formgroup].controls) {
					if (formgroup != 'all_inclusive_rates') {
						this.calculateAmount('RatesForm', formgroup, subform)
					}
				}
			}
		});
	}




	get RateForm(): Record<string, any> {
		if (!this.RatesForm) {
			return;
		}
		return this.RatesForm.controls;
	}

	calculateGrandTotal(form: "RatesForm") {
		console.log('in function calculate grand total' ,this.grandtotal,this.response.grand_total )
		this.grandtotal = this.grandtotal || this.response.grand_total 
		this.subtotal  = this.subtotal  || this.response.sub_total
		if (form === "RatesForm" && this.RatesForm) {
			if (this.vehicles !== 0) {
				this.grandtotal = Number(this.subtotal.toFixed(2)) * this.vehicles;
			}
			let value = this.RatesForm.value;
			value["grand_total"] = this.grandtotal || this.response.grand_total ;
			value["sub_total"] = this.subtotal || this.response.sub_total;

			this.formvalue.emit(value);
		}
	}


	calculateTotal(form: "RatesForm") {
		console.log('in function calculate total')
		if (form === "RatesForm") {
			this.subtotal = 0;
			for (let item in this.total) {
				this.subtotal = Number(this.subtotal.toFixed(2)) + Number(this.total[item].toFixed(2));
			}
		}
	}

	calculateBaseRate(form: string): number {
		if (form === 'RatesForm') {
			let temp = 0
			for (let subform in this.RateForm.all_inclusive_rates.controls) {
				let amount = (<FormGroup>((<FormGroup>this.RatesForm.get('all_inclusive_rates')).get(subform))).get("amount").value
				temp += amount
			}
			return temp
		}
	}



	async calculateAmount(form: string, formgroup: string, subform: string) {
		console.log('in function calculate Ammount')
		if (form === "RatesForm") {
			let baserate = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("baserate").value;


			if (!baserate) {
				baserate = 0;
			}

			if (["direct_taxes", "amenities", "taxes", "misc"].includes(formgroup)) {
				// Flat Values
				this.RateForm[formgroup].controls[subform].controls.amount.setValue(baserate);
				// initially run for taxes also because default value will be flat
			}

			if (formgroup == "all_inclusive_rates") {
				let amount = 0;

				// Hourly Rate - only in case of hours
				if (this.hours != 0 && subform == 'Base_Rate') {
					amount = Number(Number(Number(this.hours) * baserate).toFixed(2));
				} else {
					amount = baserate;
				}

				// Admin Share Calculation
				if (subform == 'Base_Rate') {
					this.calc_admin_share = (amount * this.admin_share) / 100;
					amount = amount + this.calc_admin_share;
				}

				(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
			}

			if (formgroup == "others") {
				// let kmrate = (<FormGroup>((<FormGroup>this.RatesForm.get("all_inclusive_rates")).get("Base_Rate"))).get("amount").value;
				let kmrate = await this.calculateBaseRate('RatesForm') - this.calc_admin_share;
				let basevalue = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("baserate").value;

				let amount = Number(Number((basevalue / 100) * kmrate).toFixed(2));

				(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get("amount").setValue(amount);
				// set value of percentage same as gratuity
				(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("percentage").setValue(basevalue);
			}

			if (formgroup == "taxes") {
				let type = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("type").value;
				if (type === "flat") {
					(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").setValue(baserate);
				}

				if (type === "percent") {
					// let kmrate = (<FormGroup>((<FormGroup>(this.RatesForm.get("all_inclusive_rates"))).get("Base_Rate"))).get("amount").value;
					let kmrate = await this.calculateBaseRate('RatesForm') - this.calc_admin_share;
					let taxvalue = (<FormGroup>((<FormGroup>this.RatesForm.get("taxes")).get(subform))).get("baserate").value;

					let amount = Number(Number((taxvalue / 100) * kmrate).toFixed(2));

					(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
				}
				// On Change of Flat | Percentage - Taxes
				(<FormGroup>((<FormGroup>this.RatesForm.get("taxes")).get(subform))).get("type").valueChanges.subscribe((value: any) => {
					this.calculateAmount("RatesForm", formgroup, subform);
				});
			}

			let amount = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").value;
			this.total[subform] = Number(Number(amount).toFixed(2));
			this.RatesForm.updateValueAndValidity();
		}

	}

}
