import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { BehaviorSubject, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AffiliateService } from 'src/app/services/affiliate.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';

@Component({
	selector: 'app-affiliate-finalize-rates',
	templateUrl: './affiliate-finalize-rates.component.html',
	styleUrls: ['./affiliate-finalize-rates.component.scss']
})
export class AffiliateFinalizeRatesComponent implements OnInit {
	@Input("initRates") init_rates: boolean = false;
	@Input("initReturnRates") init_r_rates: boolean = false;
	@Input("affiliate_type") affiliate_type: string = "";
	@Input("distance") distance: string = "";
	@Input("reservation_id") bookingId: number = 0;
	@Input("vehicles") vehs: number = 0;
	@Input("hours") nums: number = 0;
	@Input('isTravelShare') isTravelShare: boolean = false;
	@Input('reset') reset: boolean = false;
	@Input('isCreatedByAdmin') isCreatedByAdmin: boolean = true;
	@Input('service_type') service_type: any;
	@Input('isFarmoutBooking') isFarmoutBooking: boolean = false;

	// Throw Events.
	@Output("formvalue") formvalue = new EventEmitter<Record<string, any>>();
	@Output("returnformvalue") returnformvalue = new EventEmitter<Record<string, any>>();
	@Output("returnNumberOfHr") returnNumberOfHr = new EventEmitter<Record<string, any>>();

	RatesForm: FormGroup;
	ReturnRatesForm: FormGroup;

	ratesdata = new BehaviorSubject<any>({});
	temp: any;

	ratesform: boolean = false;
	returnratesform: boolean = false;

	rate_params: any = {
		chevrons: {
			section: true,
			all_inclusive_rates: true,
			others: false,
			direct_taxes: false,
			taxes: false,
			amenities: false,
			misc: false,
			r_section: true,
			r_all_inclusive_rates: true,
			r_others: false,
			r_direct_taxes: false,
			r_taxes: false,
			r_amenities: false,
			r_misc: false,
		},
	};

	minimum_rate: Record<string, any>;

	total: Record<string, any> = {};
	r_total: Record<string, any> = {};

	subtotal: number = 0;
	r_subtotal: number = 0;
	grandtotal: number = 0;
	r_grandtotal: number = 0;
	admin_share: number = 25;
	calc_admin_share: number = 0;
	r_calc_admin_share: number = 0;

	vehicles: number = 1;
	hours: number = 0;
	is_readonly_min_rate: boolean = false;
	travel_share: number = 10
	travel_agent_share: any = 0;
	farmoutShare: any;
	currencySymbol: any;

	constructor(
		private $form: FormBuilder,
		// private $api: AdminService,
		private affiliateService: AffiliateService,
		private $spinner: NgxSpinnerService,
		private $route: ActivatedRoute,
		private stateManagementService: StateManagementService,
	) { }

	ngOnInit(): void {
		this.$route.queryParams.subscribe((params: any) => {
			(params.bookingId) ? this.fetchRates('', params.bookingId) : ""
		});

		//save currency symbol
		this.currencySymbol = this.stateManagementService.getCurrencySymbol();

	}
	ngAfterViewInit() {
		this.scroll('grandTotal')
	}

	ngOnChanges(changes: SimpleChanges) {
		console.warn("Change has been detected: ", changes);



		this.ratesform = changes.init_rates?.currentValue ?? this.ratesform;
		this.returnratesform =
			changes.init_r_rates?.currentValue ?? this.returnratesform;

		// if asked to initialise the rates
		if (changes.init_rates?.currentValue) {
			this.initRates();
		}


		if (changes.nums) {
			this.hours = Number(changes.nums.currentValue)
			if (this.RateForm.all_inclusive_rates.controls.Base_Rate) {
				this.hours > 0 && this.RatesForm && this.calculateAmount('RatesForm', 'all_inclusive_rates', 'Base_Rate');
			}
			else {
				if (this.RateForm.all_inclusive_rates.controls.Milage_Rate) {
					this.hours > 0 && this.RatesForm && this.calculateAmount('RatesForm', 'all_inclusive_rates', 'Milage_Rate');
				}
				if (this.RateForm.all_inclusive_rates.controls.Kilometer_Rate) {
					this.hours > 0 && this.RatesForm && this.calculateAmount('RatesForm', 'all_inclusive_rates', 'Kilometer_Rate');
				}

			}
		}

		this.vehicles = changes.vehs ? changes.vehs.currentValue : this.vehicles;
		if (this.vehicles) {
			this.calculateGrandTotal('RatesForm');
			if (this.ReturnRatesForm) {
				this.calculateGrandTotal('ReturnRatesForm');
			}
		} else {
			console.log('Resetting Number of Vehicles ');
			this.vehicles = 1;
		}
		if (changes.isTravelShare) {
			this.initRates();
			if (this.ReturnRatesForm) {
				this.initReturnRates
			}
		}

		if (changes.bookingId && changes.bookingId.currentValue !== 0) {
			this.fetchRates("", changes.bookingId?.currentValue)

			this.getRatesData().subscribe((response: any) => {
				if (response && Object.keys(response).length > 0) {
					for (let item in this.RateForm) {
						for (let key in (<FormGroup>this.RatesForm.get(item)).controls) {
							console.log(item, key);
							let baserate = response[item][key]["baserate"];
							let type = response[item][key]["type"] ?? "flat";
							(<FormGroup>((<FormGroup>this.RatesForm.get(item)).get(key))).get("baserate").setValue(baserate);
							if ((<FormGroup>((<FormGroup>this.RatesForm.get(item)).get(key))).get("type")) {
								(<FormGroup>((<FormGroup>this.RatesForm.get(item)).get(key))).get("type").setValue(type);
							}
						}
					}
				}
			})
		}

		if (changes.reset && changes.reset.currentValue) {
			this.RatesForm = null
			this.ReturnRatesForm = null
			this.total = {}
			this.r_total = {}
			this.initRates()
			this.calculateTotal('RatesForm')
			this.calculateGrandTotal('RatesForm')
			if (this.ReturnRatesForm) {
				this.initReturnRates()
				this.calculateTotal('ReturnRatesForm')
				this.calculateGrandTotal('ReturnRatesForm')
			}
		}
	}
	handleNegtiveValue(formgroup, subform, formcontrol, value) {
		let v = parseFloat((Math.abs(Number(value))).toFixed(2));
		(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get(formcontrol).setValue(v);
		this.RatesForm.updateValueAndValidity();
		console.log('handleNegtiveValue-->>', formgroup, subform, formcontrol, parseFloat((Math.abs(Number(value))).toFixed(2)))
	}

	scroll(id) {
		let el = document.getElementById(id);
		let elementRect = el.getBoundingClientRect();
		let absoluteElementTop = elementRect.top + window.pageYOffset;
		let topElement = absoluteElementTop - 200;

		console.log(`scrolling to ${id}`, el, absoluteElementTop, window.innerHeight);
		window.scrollTo({
			top: topElement,
			behavior: 'smooth'
		});
		// el.scrollIntoView();
	}
	returnZero() {
		return 0;
	}

	textFormatter(text: string) {
		try {
			return text.replace(/[\\\_$]+/g, " ");
		} catch {
			return text;
		}
	}

	initRates() {
		console.log("Init Rates");

		this.RatesForm = this.$form.group({});
		// build form
		this.RatesForm = this.$form.group({
			all_inclusive_rates: this.$form.group({}),
			direct_taxes: this.$form.group({}),
			taxes: this.$form.group({}),
			amenities: this.$form.group({}),
			misc: this.$form.group({}),
			// others: this.$form.group({}), // As discussed we don't need gratuity bucket
		});

		// fetch the data from backend
		this.getRatesData().subscribe((response) => {
			if (response && Object.keys(response).length > 0) {
				this.buildRatesForm('RatesForm', response);
			}
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

	async initReturnRates() {
		console.log("Init Return Rates");

		this.ReturnRatesForm = this.$form.group({
			all_inclusive_rates: this.$form.group({}),
			direct_taxes: this.$form.group({}),
			taxes: this.$form.group({}),
			amenities: this.$form.group({}),
			misc: this.$form.group({}),
			// others: this.$form.group({}), // As discussed we don't need gratuity bucket
		});

		this.getRatesData().subscribe((response: any) => {
			if (response && Object.keys(response).length > 0) {
				this.buildRatesForm('ReturnRatesForm', response);
				if (this.bookingId) {
					for (let formgroup in this.ReturnRateForm) {
						for (let subform in this.ReturnRateForm[formgroup].controls) {
							this.calculateAmount('ReturnRatesForm', formgroup, subform)
						}
					}
				}
			}
		});

		this.ReturnRatesForm.valueChanges.subscribe((value: any) => {
			this.calculateTotal("ReturnRatesForm");
			this.calculateGrandTotal('ReturnRatesForm');
		});

		(<FormGroup>this.ReturnRatesForm.get('all_inclusive_rates')).valueChanges.subscribe(() => {
			for (let formgroup in this.ReturnRateForm) {
				for (let subform in this.ReturnRateForm[formgroup].controls) {
					if (formgroup != 'all_inclusive_rates') {
						this.calculateAmount('ReturnRatesForm', formgroup, subform)
					}
				}
			}
		})
	}

	get RateForm(): Record<string, any> {
		if (!this.RatesForm) {
			return;
		}
		return this.RatesForm.controls;
	}

	get ReturnRateForm(): Record<string, any> {
		if (!this.ReturnRatesForm) {
			return;
		}
		return this.ReturnRatesForm.controls;
	}

	changeValue(form: string, formgroup: string, subform: string, formcontrol: string, value: any) {
		if (form === "RatesForm") {
			(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get(formcontrol).setValue(value);
			this.RatesForm.updateValueAndValidity();
		}
		if (form === "ReturnRatesForm") {
			(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get(formcontrol).setValue(value);
			this.ReturnRatesForm.updateValueAndValidity();
		}
	}
	changeInHours(hours: any) {
		console.log('in function change in hours-->>>', hours)
		if (!Number(hours)) {
			return

		}
		this.hours = Number(hours)
		if (this.RateForm.all_inclusive_rates.controls.Base_Rate) {
			this.hours > 0 && this.RatesForm && this.calculateAmount('RatesForm', 'all_inclusive_rates', 'Base_Rate');
		}
		else {
			if (this.RateForm.all_inclusive_rates.controls.Milage_Rate) {
				this.hours > 0 && this.RatesForm && this.calculateAmount('RatesForm', 'all_inclusive_rates', 'Milage_Rate');
			}
			if (this.RateForm.all_inclusive_rates.controls.Kilometer_Rate) {
				this.hours > 0 && this.RatesForm && this.calculateAmount('RatesForm', 'all_inclusive_rates', 'Kilometer_Rate');
			}

		}

		this.returnNumberOfHr.emit(hours)
		console.log("in change in hours rates", this.hours)
	}
	fetchRates(affiliate: string, bookingId: number = 0) {
		this.$spinner.show()
		this.affiliateService.finalizeRates(bookingId).subscribe((response: any) => {
			this.$spinner.hide()
			if (response?.success && response?.data?.rateArray) {
				this.is_readonly_min_rate = response?.data?.min_rate_involved ? true : false
				if (Object.keys(response.data.rateArray).length) {
					this.ratesdata.next(response.data.rateArray);
				}
				else {
					this.fetchRates(affiliate, null)
				}
			}
			console.log("in fetch rates", response?.data?.rateArray)
		});
	}

	getRatesData() {
		return this.ratesdata.asObservable();
	}
	handleHourChange(event: any) {
		console.log('------->>>>>>>', event.target.value)
		if (event.target.value == '') {
			let n_hr: any = 1
			this.returnNumberOfHr.emit(n_hr)
		}
		this.returnNumberOfHr.emit(event.target.value)
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
						console.log(key, item);
						(<FormGroup>this.RatesForm.get(key)).addControl(item, this.buildRatesForm(form, data[key][item]));
						(<FormGroup>((<FormGroup>this.RatesForm.get(key)).get(item))).get("baserate").valueChanges.subscribe((value: number) => {
							this.calculateAmount("RatesForm", key, item);
						});
						// this.calculateAmount("RatesForm", key, item);
					}

				}
			}
			console.log('in function build rates form-->>>', data)
		}
	}


	calculateTotal(form: "RatesForm" | "ReturnRatesForm") {
		if (form === "RatesForm") {
			this.subtotal = 0;
			for (let item in this.total) {
				this.subtotal = Number(this.subtotal.toFixed(2)) + Number(this.total[item].toFixed(2));
				console.log("in total checkk---->", this.subtotal, Number(this.subtotal.toFixed(2)), '--->', Number(this.total[item].toFixed(2)))
			}
		}
		console.log('in function calcultae total-->>>', this.subtotal)

		if (form === "ReturnRatesForm") {
			this.r_subtotal = 0;
			for (let item in this.r_total) {
				this.r_subtotal = Number(this.r_subtotal.toFixed(2)) + Number(this.r_total[item].toFixed(2));
			}
		}
		console.log("in function calculate total", this.grandtotal, this.subtotal)

	}

	calculateBaseRate(form: string): number {
		if (form === 'RatesForm') {
			let temp = 0
			for (let subform in this.RateForm.all_inclusive_rates.controls) {
				let amount = (<FormGroup>((<FormGroup>this.RatesForm.get('all_inclusive_rates')).get(subform))).get("amount").value
				temp += amount
			}
			console.log('in function calc base rate-->>>', temp)
			return temp
		}
		if (form === 'ReturnRatesForm') {
			let temp = 0
			for (let subform in this.ReturnRateForm.all_inclusive_rates.controls) {
				let amount = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get('all_inclusive_rates')).get(subform))).get("amount").value
				temp += amount
			}
			return temp
		}
	}

	calculateGrandTotal(form: "RatesForm" | "ReturnRatesForm") {
		if (form === "RatesForm" && this.RatesForm) {
			if (this.vehicles !== 0) {
				this.grandtotal = Number(this.subtotal.toFixed(2)) * this.vehicles;
			}
			let value = this.RatesForm.value;
			value["grand_total"] = this.grandtotal;
			value["sub_total"] = this.subtotal;

			this.formvalue.emit(value);
			console.log('in function calc g total-->>>', this.grandtotal)

		}
		if (form == 'ReturnRatesForm' && this.ReturnRatesForm) {
			if (this.vehicles !== 0) {
				this.r_grandtotal = Number(this.r_subtotal.toFixed(2)) * this.vehicles;
			}
			let value = this.ReturnRatesForm.value;
			value["r_grandtotal"] = this.r_grandtotal;
			value["r_subtotal"] = this.r_subtotal;

			this.returnformvalue.emit(value);
		}
		console.log("in function calculate total", this.grandtotal, this.subtotal)
	}

	toggleDropdown(section: string) {
		this.rate_params["chevrons"][section] = !this.rate_params["chevrons"][section];
	}

	handleSubHeading(items: string) {
		console.log(items, "check items")
		this.rate_params["chevrons"][items] = !this.rate_params["chevrons"][items];
	}
	getTabIndex(item: any) {
		return this.rate_params["chevrons"][item] ? 0 : 1
	}

	handleSubHeadingScroll(items: string, id: any) {
		this.rate_params["chevrons"][items] = !this.rate_params["chevrons"][items];
		let el = document.getElementById(id);
		console.log(`scrolling to ${id}`, el);
		setTimeout(() => {
			el.scrollIntoView();
		}, 600)
	}
	closeAllChevrons() {
		this.rate_params["chevrons"]['section'] = false
		this.rate_params["chevrons"]['all_inclusive_rates'] = false
		this.rate_params["chevrons"]['others'] = false
		this.rate_params["chevrons"]['direct_taxes'] = false
		this.rate_params["chevrons"]['taxes'] = false
		this.rate_params["chevrons"]['amenities'] = false
		this.rate_params["chevrons"]['misc'] = false
		setTimeout(() => {
			this.scroll('rate-heading')
		}, 300)
	}

	calculateBaseRateShare() {
		try {
			let baseRate = 0;
			console.log('in function calculateBaseRateShare', this.RatesForm)
			if (this?.service_type == 'charter_tour' && !this.is_readonly_min_rate) {
				baseRate += (<FormGroup>((<FormGroup>this.RatesForm.get('all_inclusive_rates'))?.get('Base_Rate')))?.get("baserate").value * this.nums
				console.log('in function if charter-->>>', baseRate)

			}
			else {
				baseRate += (<FormGroup>((<FormGroup>this.RatesForm.get('all_inclusive_rates'))?.get('Base_Rate')))?.get("baserate").value || 0
				console.log('in function else charter-->>>', baseRate)

			}
			['ELH_Charges', 'Stops', 'Wait'].map((i) => {
				baseRate += (<FormGroup>((<FormGroup>this.RatesForm.get('all_inclusive_rates'))?.get(i)))?.get("baserate").value || 0
			});
			['Baby_Seat', 'Baggage_Meet_(Dom)', 'Baggage_Meet_(Int)', 'Bike_Rack', 'Booster_Seat', 'Golf_Bags',
				'Lei_Greeting_–_Hawaii', 'Luggage_Trailer', 'Per_Diem', 'Red_Carpet', 'Security_/_Guard', 'Skis',
				'Tour_Guide', 'Wedding_Package'].map((j) => {
					baseRate += (<FormGroup>((<FormGroup>this.RatesForm.get('amenities'))?.get(j)))?.get("baserate").value || 0
				})

			console.log('in function calculateBaseRateShare', baseRate)

			return baseRate;
		} catch (error) {
			console.log('error---------------->>>>>>', error)
		}
	}
	calculateAdminShare() {
		console.log('in function calculateAdminShare')

		let baseRate = this.calculateBaseRateShare()
		this.admin_share = (this.isTravelShare && !this.isCreatedByAdmin || this.isFarmoutBooking) ? 15 : 25
		this.calc_admin_share = baseRate * this.admin_share / 100
		this.isFarmoutBooking ? this.farmoutShare = baseRate * 0.10 : ''
		console.log('in function caculate admin share-->>', this.calc_admin_share)
	}
	calculateTravelShare() {
		console.log('in function calculateTravelShare')
		if (!this.isTravelShare && this.isCreatedByAdmin) {
			return 0
		}
		let baseRate = this.calculateBaseRateShare()
		this.travel_agent_share = baseRate * this.travel_share / 100
	}

	async calculateAmount(form: string, formgroup: string, subform: string) {
		console.log('in function calculateAmount')
		await this.calculateAdminShare()
		await this.calculateTravelShare()
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
				if (this.hours != 0 && subform == 'Base_Rate' && !this.is_readonly_min_rate) {
					amount = Number(Number(Number(this.hours) * baserate).toFixed(2));
				} else {
					amount = baserate;
				}

				// Admin Share Calculation
				if (subform == 'Base_Rate' && !this.is_readonly_min_rate) {
					// this.calc_admin_share = (amount * this.admin_share) / 100;
					console.log('calc_admin_share--->>', amount, this.calc_admin_share)
					// amount = parseFloat((amount + this.calc_admin_share).toFixed(2));
				}
				console.log('is_readonly_min_rate-->>', this.is_readonly_min_rate)
				if (this.isTravelShare && subform == 'Base_Rate') {
					let min_rate = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("baserate").value;
					// this.travel_agent_share = (min_rate * this.travel_share) / 100
					// amount = amount + this.travel_agent_share;
				}
				if (this.is_readonly_min_rate && subform == 'Base_Rate') {
					let min_rate = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("baserate").value;
					// this.calc_admin_share = (min_rate * this.admin_share) / 100
					// amount = amount + this.calc_admin_share;   
					console.log('is_readonly_min_rate_amount-->>', amount, this.calc_admin_share)
				}

				(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
			}



			if (formgroup == "taxes") {
				let type = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("type").value;
				if (type === "flat" || type == null) {
					(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").setValue(baserate);
				}

				if (type === "percent") {
					// let kmrate = (<FormGroup>((<FormGroup>(this.RatesForm.get("all_inclusive_rates"))).get("Base_Rate"))).get("amount").value;
					// - this.calc_admin_share - this.travel_agent_share;
					let kmrate = await this.calculateBaseRate('RatesForm');
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
			if (formgroup == 'amenities' || formgroup == "all_inclusive_rates") {
				let baseRateAmount = (<FormGroup>((<FormGroup>this.RatesForm.get('all_inclusive_rates')).get('Base_Rate'))).get("baserate").value;
				if (this.service_type == 'charter_tour' && !this.is_readonly_min_rate) {
					baseRateAmount = (<FormGroup>((<FormGroup>this.RatesForm.get('all_inclusive_rates')).get('Base_Rate'))).get("baserate").value * this.nums
				}
				baseRateAmount += this.calc_admin_share
				if (this.isTravelShare && !this.isCreatedByAdmin) {
					baseRateAmount = baseRateAmount + this.travel_agent_share;
				}
				else if (this.isFarmoutBooking) {
					baseRateAmount = baseRateAmount + this.farmoutShare;
				}
				// (<FormGroup>((<FormGroup>this.RatesForm.get('all_inclusive_rates')).get('Base_Rate'))).get("amount").setValue(baseRateAmount);
				this.total['Base_Rate'] = Number(Number(baseRateAmount).toFixed(2));
			}
			this.RatesForm.updateValueAndValidity();
		}


	}

}
