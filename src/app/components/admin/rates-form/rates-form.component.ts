import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, OnChanges } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { AdminService } from "src/app/services/admin.service";

import { BehaviorSubject, combineLatest, Observable, Subject, Subscription } from "rxjs";
import { ActivatedRoute } from "@angular/router";

@Component({
	selector: "app-rates-form",
	templateUrl: "./rates-form.component.html",
	styleUrls: ["./rates-form.component.scss"],
})
export class RatesFormComponent implements OnInit, OnChanges {
	// Capture Events.
	@Input("initRates") init_rates: boolean = false;
	@Input("initReturnRates") init_r_rates: boolean = false;
	@Input("affiliate_type") affiliate_type: string = "";
	@Input("distance") distance: string = "";
	@Input("reservation_id") bookingId: number = 0;
	@Input("vehicles") vehs: number = 0;
	@Input("hours") nums: number = 0;
	@Input("vehicle_id") QB_vehicle_id: any = 0;
	@Input('reset') reset: boolean = false;

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

	constructor(
		private $form: FormBuilder,
		private $api: AdminService,
		private $routeurl: ActivatedRoute,

	) { }

	ngOnInit(): void {
		this.$routeurl.queryParams.subscribe((params: any) => {
			if (!params?.vehicle_id ) {
				this.fetchRates('');
			}
		})
	}

	handleSubHeading(items: string) {
		console.log(items, "check items")
		this.rate_params["chevrons"][items] = !this.rate_params["chevrons"][items];
	}
	getTabIndex(item:any){
		return this.rate_params["chevrons"][item] ? 0 : 1
	}


	ngOnChanges(changes: SimpleChanges) {
		console.warn("Change has been detected: ", changes);

		this.ratesform = true;
		// changes.init_rates?.currentValue ?? this.ratesform
		this.returnratesform =
			changes.init_r_rates?.currentValue ?? this.returnratesform;

		if (changes?.QB_vehicle_id?.currentValue) {
				console.log('got QB_vehicle_id------->>>>>>>>>', changes.QB_vehicle_id)
				this.QB_vehicle_id = changes?.QB_vehicle_id?.currentValue
				this.fetchRatesArrayByAffiliateVehicle(this.QB_vehicle_id)
		}
		// if asked to initialise the rates
		if (changes.init_rates?.currentValue) {
			if(!this.QB_vehicle_id){
				this.initRates();
			}
		}
	

		if (changes.init_r_rates?.currentValue || this.returnratesform) {
			this.hours = 0;
			if (!changes.vehs) {
				this.initReturnRates();
			}
		}

		if (changes.nums) {
			this.hours = Number(changes.nums.currentValue)
			this.RatesForm && this.calculateAmount('RatesForm', 'all_inclusive_rates', 'Base_Rate');
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

	handleSubHeadingScroll(items: string, id: any) {
		this.rate_params["chevrons"][items] = !this.rate_params["chevrons"][items];
		let el = document.getElementById(id);
		console.log(`scrolling to ${id}`, el);
		setTimeout(() => {
			el.scrollIntoView();
		}, 600)
	}
	scroll(id) {
		let el = document.getElementById(id);
		console.log(`scrolling to ${id}`, el);
		el.scrollIntoView();
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
			this.scroll('closeAll-btn')
		}, 300)
	}
	closeReturnAllChevrons() {
		this.rate_params["chevrons"]['r_section'] = false
		this.rate_params["chevrons"]['r_all_inclusive_rates'] = false
		this.rate_params["chevrons"]['r_others'] = false
		this.rate_params["chevrons"]['r_direct_taxes'] = false
		this.rate_params["chevrons"]['r_taxes'] = false
		this.rate_params["chevrons"]['r_amenities'] = false
		this.rate_params["chevrons"]['r_misc'] = false
		setTimeout(() => {
			this.scroll('closeAll-btn_r')
		}, 300)
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
			others: this.$form.group({}),
		});

		// fetch the data from backend
		this.getRatesData().subscribe((response) => {
			if (response && Object.keys(response).length > 0) {
				console.log('get rates data resposne-->>', response)
				this.buildRatesForm('RatesForm', response);
			}
		})

		//calculating totals of rates form if data auto fill by quote bot 
		if(this.QB_vehicle_id){
			console.log('calculating total for QB ')
			for (let formgroup in this.RateForm) {
				for (let subform in this.RateForm[formgroup].controls) {
						this.calculateAmount('RatesForm', formgroup, subform)
						if(this.init_r_rates){
						this.calculateAmount('ReturnRatesForm', formgroup, subform)
						}
				}
			}
		}
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
			others: this.$form.group({}),
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

	fetchRates(affiliate: string, bookingId: number = 0) {
		this.$api.fetchAdminNewBookingRates(affiliate, bookingId).subscribe((response: any) => {
			if (response?.success && response?.data?.rateArray) {
				this.ratesdata.next(response.data.rateArray);
			}
		});
	}
	fetchRatesArrayByAffiliateVehicle(vehicle_id) {
		this.ratesdata.next({})
		console.log('<<<<<<<<<<<________ data to send fetchRatesArrayByAffiliateVehicle---------------->>>>>>>>>>>>>>',
			vehicle_id)
		let QB: any = JSON.parse(localStorage.getItem('quotebot_form'))
		let no_of_hours = null
		if (QB?.service_type == 'charter_tour') {
			no_of_hours = QB?.booking_hour
		}
		let location_info = QB?.location_info[0]
		// let return_location_info = QB?.location_info[1]
		// need to handle create return rate form
		// if(QB?.service_type == "round_trip"){
		// }
		let transfer_type_value = QB?.pickup_type + '_to_' + QB?.dropoff_type
		let return_transfer_type_value = QB?.dropoff_type + '_to_' + QB?.pickup_type
		let data = {
			service_type: QB?.service_type,
			transfer_type: transfer_type_value,
			numberOfVehicles: 1,
			no_of_hours: no_of_hours,
			distance: location_info.distance.value
		}
		this.$api.fetchRatesByAffiliateVeh(vehicle_id, data).subscribe((response: any) => {
			this.ratesdata.next(response?.data?.rateArray)
			this.initRates();
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
					}
					if (form === "ReturnRatesForm") {
						(<FormGroup>this.ReturnRatesForm.get(key)).addControl(
							item,
							this.buildRatesForm(form, data[key][item])
						);
						(<FormGroup>(
							(<FormGroup>this.ReturnRatesForm.get(key)).get(item)
						))
							.get("baserate")
							.valueChanges.subscribe((value: number) => {
								this.calculateAmount(
									"ReturnRatesForm",
									key,
									item
								);
							});
					}
				}
			}
		}
	}


	calculateTotal(form: "RatesForm" | "ReturnRatesForm") {
		if (form === "RatesForm") {
			this.subtotal = 0;
			for (let item in this.total) {
				this.subtotal = Number(this.subtotal.toFixed(2)) + Number(this.total[item].toFixed(2));
			}
		}

		if (form === "ReturnRatesForm") {
			this.r_subtotal = 0;
			for (let item in this.r_total) {
				this.r_subtotal = Number(this.r_subtotal.toFixed(2)) + Number(this.r_total[item].toFixed(2));
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
	}

	toggleDropdown(section: string) {
		this.rate_params["chevrons"][section] = !this.rate_params["chevrons"][section];
	}


	async calculateAmount(form: string, formgroup: string, subform: string) {

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
					console.log('calc_admin_share--->>', amount, this.calc_admin_share)
					amount = amount + this.calc_admin_share;
				}

				(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
			}

			if (formgroup == "others") {
				// let kmrate = (<FormGroup>((<FormGroup>this.RatesForm.get("all_inclusive_rates")).get("Base_Rate"))).get("amount").value;
				let type = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("type").value;
				(<FormGroup>((<FormGroup>this.RatesForm.get("others")).get(subform))).get("type").valueChanges.subscribe((value: any) => {
					this.calculateAmount("RatesForm", formgroup, subform);
				});
				if (type === "flat") {
					let kmrate = await this.calculateBaseRate('RatesForm') - this.calc_admin_share;
					let basevalue = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("baserate").value;

					let amount = Number(Number((basevalue)).toFixed(2));

					(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get("amount").setValue(amount);
					// set value of percentage same as gratuity
					(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("percentage").setValue(basevalue);
					console.log('km rate-->>', kmrate, '-->> basevalue-->>', basevalue, '-->> amount', amount)
				}
				if (type === "percent") {
					let kmrate = await this.calculateBaseRate('RatesForm') - this.calc_admin_share;
					let basevalue = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("baserate").value;

					let amount = Number(Number((basevalue / 100) * kmrate).toFixed(2));

					(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get("amount").setValue(amount);
					// set value of percentage same as gratuity
					(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("percentage").setValue(basevalue);
					console.log('km rate-->>', kmrate, '-->> basevalue-->>', basevalue, '-->> amount', amount)
				}
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

		// --------------------- RETURN RATES FORM ------------------------
		if (form === "ReturnRatesForm") {
			let baserate = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("baserate").value;

			if (["direct_taxes", "amenities", "taxes", "misc"].includes(formgroup)) {
				// Flat Values
				this.ReturnRateForm[formgroup].controls[subform].controls.amount.setValue(baserate);
				// initially run for taxes also because default value will be flat
			}

			if (formgroup == "all_inclusive_rates") {
				let amount = baserate;
				if (subform == 'Base_Rate') {
					this.r_calc_admin_share = (amount * this.admin_share) / 100;
					amount = amount + this.r_calc_admin_share;
				}
				(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
			}

			if (formgroup == "others") {
				// Gratuity
				// let kmrate = (<FormGroup>((<FormGroup>(this.ReturnRatesForm.get("all_inclusive_rates"))).get("Base_Rate"))).get("amount").value;
				let type = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("type").value;
				if (type === "flat") {
					let kmrate = await this.calculateBaseRate('ReturnRatesForm') - this.r_calc_admin_share;
				let basevalue = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("baserate").value;

				let amount = Number(Number(basevalue)).toFixed(2);

				(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
				// set value of percentage same as gratuity
				(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("percentage").setValue(basevalue);
				}

				if (type === "percent") {
					// let kmrate = (<FormGroup>((<FormGroup>(this.ReturnRatesForm.get("all_inclusive_rates"))).get("Base_Rate"))).get("amount").value;
					let kmrate = await this.calculateBaseRate('ReturnRatesForm') - this.r_calc_admin_share;
					let basevalue = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("baserate").value;
	
					let amount = Number(Number((basevalue / 100) * kmrate).toFixed(2)
					);
	
					(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
					// set value of percentage same as gratuity
					(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("percentage").setValue(basevalue);
				}

				// Flat | Percentage - Taxes
				(<FormGroup>((<FormGroup>this.ReturnRatesForm.get("others")).get(subform))).get("type").valueChanges.subscribe((value: any) => {
					this.calculateAmount("ReturnRatesForm", formgroup, subform);
				});
				
			}

			if (formgroup == "taxes") {
				let type = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("type").value;
				if (type === "flat") {
					(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("amount").setValue(baserate);
				}

				if (type === "percent") {
					// let kmrate = (<FormGroup>((<FormGroup>(this.ReturnRatesForm.get("all_inclusive_rates"))).get("Base_Rate"))).get("amount").value;
					let kmrate = await this.calculateBaseRate('ReturnRatesForm') - this.r_calc_admin_share;
					let taxvalue = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get("taxes")).get(subform))).get("baserate").value;

					let amount = Number(Number((taxvalue / 100) * kmrate).toFixed(2));

					(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
				}

				// Flat | Percentage - Taxes
				(<FormGroup>((<FormGroup>this.ReturnRatesForm.get("taxes")).get(subform))).get("type").valueChanges.subscribe((value: any) => {
					this.calculateAmount("ReturnRatesForm", formgroup, subform);
				});
			}

			let amount = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("amount").value;
			this.r_total[subform] = Number(Number(amount).toFixed(2));
			this.ReturnRatesForm.updateValueAndValidity();
		}
		// console.log(this.total, this.r_total);
	}
}
