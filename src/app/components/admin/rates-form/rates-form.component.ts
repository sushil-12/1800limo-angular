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
	@Input('isTravelShare') isTravelShare: boolean = false;
	@Input('book_data') book_data: any = {};

	
	
	// Throw Events.
	@Output("formvalue") formvalue = new EventEmitter<Record<string, any>>();
	@Output("returnformvalue") returnformvalue = new EventEmitter<Record<string, any>>();
	@Output("returnNumberOfHr") returnNumberOfHr = new EventEmitter<Record<string, any>>();

	RatesForm: FormGroup;
	ReturnRatesForm: FormGroup;

	ratesdata = new BehaviorSubject<any>({});
	returnRatesdata = new BehaviorSubject<any>({});

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
	travel_share :number = 10
	calc_admin_share: number = 0;
	r_calc_admin_share: number = 0;

	vehicles: number = 1;
	hours: number = 0;
	newBooking: boolean = false;
	is_readonly_min_rate: boolean = false;
	bookingType: any = 'new';
	master_vehicle_id: any = null;
	travel_agent_share : any = 0;
	r_travel_agent_share : any = 0;
	emptyRateArray: any;

	constructor(
		private $form: FormBuilder,
		private $api: AdminService,
		private $routeurl: ActivatedRoute,

	) { }

	ngOnInit(): void {
		this.$routeurl.queryParams.subscribe((params: any) => {
			console.log('params-->>' , params)
			if (!params?.vehicle_id ) {
				this.fetchRates('');
			}
			if (params && params.new == 'true') {
				this.newBooking = params.new == 'true'
			}
			if (params && params.updateType) {
				this.bookingType = params.updateType
			}
			if(params && params.is_master_vehicle == 'true'){
				this.master_vehicle_id = params.vehicle_id
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

		// if(changes?.distance.currentValue){
		// 	console.log('<><><>><><><><><><><><><><><><><><>' ,changes?.distance.currentValue , changes?.book_data?.currentValue)
		// 	this.fetchRatesArrayByAffiliateVehicle(changes?.book_data?.currentValue)
		// }
		if(changes?.book_data?.currentValue){

			this.fetchRatesArrayByAffiliateVehicle(changes?.book_data?.currentValue)
		}
		// if (changes?.QB_vehicle_id?.currentValue) {
		// 		console.log('got QB_vehicle_id------->>>>>>>>>', changes.QB_vehicle_id)
		// 		this.QB_vehicle_id = changes?.QB_vehicle_id?.currentValue
		// 		let QB: any = JSON.parse(localStorage.getItem('quotebot_form'))
		// 		let no_of_hours = null
		// 		if (QB?.service_type == 'charter_tour') {
		// 			no_of_hours = QB?.booking_hour
		// 		}
		// 		let location_info = QB?.location_info[0]
		// 		let transfer_type_value = QB?.pickup_type + '_to_' + QB?.dropoff_type
		// 		let return_transfer_type_value = QB?.dropoff_type + '_to_' + QB?.pickup_type
		// 		let data = {
		// 			vehicle_id : this.QB_vehicle_id,
		// 			service_type: QB?.service_type,
		// 			transfer_type: transfer_type_value,
		// 			numberOfVehicles: 1,
		// 			no_of_hours: no_of_hours,
		// 			distance: location_info.distance.value,
		// 			is_master_vehicle: JSON.parse(sessionStorage.getItem('selected_vehicle'))?.is_master_vehicle 
		// 		}
		// 		this.fetchRatesArrayByAffiliateVehicle(data)
		// }
		
		// if asked to initialise the rates
		if (changes.init_rates?.currentValue) {
			if(!this.QB_vehicle_id){
				this.initRates();
			}
		}
	

		// if (changes.init_r_rates?.currentValue || this.returnratesform) {
		// 	this.hours = 0;
		// 	// if (!changes.vehs) {
		// 	// 	this.initReturnRates();
		// 	// }
		// 		let data = {
		// 			vehicle_id : this.master_vehicle_id ? this.master_vehicle_id : this.book_data?.vehicle_id,
		// 			service_type: this.book_data?.service_type,
		// 			transfer_type: this.book_data?.transfer_type,
		// 			numberOfVehicles: this.book_data?.numberOfVehicles,
		// 			no_of_hours: this.book_data?.no_of_hours,
		// 			distance: this.book_data?.distance,
		// 			is_master_vehicle:this.book_data?.is_master_vehicle,
		// 			extra_stops:this.book_data?.extra_stops,
		// 			return_extra_stops:this.book_data?.return_extra_stops
		// 		}
		// 			this.fillReturnRateForm(data)
		// }

		if (changes.nums) {
			this.hours = Number(changes.nums.currentValue)
			this.RatesForm && this.calculateAmount('RatesForm', 'all_inclusive_rates', 'Base_Rate');
		}
		if(changes.isTravelShare){
			this.initRates();
			if (this.ReturnRatesForm) {
				this.initReturnRates
			}
		}
		// if(changes.affiliate_type?.currentValue){
		// 	this.initRates();
		// 	if (this.ReturnRatesForm) {
		// 		this.initReturnRates
		// 	}
		// }

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

			// this.getRatesData().subscribe((response: any) => {
			// 	if (response && Object.keys(response).length > 0) {
			// 		for (let item in this.RateForm) {
			// 			for (let key in (<FormGroup>this.RatesForm.get(item)).controls) {
			// 				console.log(item, key);
			// 				let baserate = response[item][key]["baserate"];
			// 				let type = response[item][key]["type"] ?? "flat";
			// 				(<FormGroup>((<FormGroup>this.RatesForm.get(item)).get(key))).get("baserate").setValue(baserate);
			// 				if ((<FormGroup>((<FormGroup>this.RatesForm.get(item)).get(key))).get("type")) {
			// 					(<FormGroup>((<FormGroup>this.RatesForm.get(item)).get(key))).get("type").setValue(type);
			// 				}
			// 			}
			// 		}
			// 	}
			// })
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
	handleNegtiveValue(formgroup,subform,formcontrol,value){
		let v = parseFloat((Math.abs(Number(value))).toFixed(2));
		(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get(formcontrol).setValue(v);
		this.RatesForm.updateValueAndValidity();
		console.log('handleNegtiveValue-->>' , formgroup,subform,formcontrol,parseFloat((Math.abs(Number(value))).toFixed(2))) 
	}
	handleNegtiveValuReturn(formgroup,subform,formcontrol,value){
		let v = parseFloat((Math.abs(Number(value))).toFixed(2));
		(<FormGroup>(<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform)).get(formcontrol).setValue(v);
		this.ReturnRatesForm.updateValueAndValidity();
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
		let elementRect = el.getBoundingClientRect();
		let absoluteElementTop = elementRect.top + window.pageYOffset;
		let topElement = absoluteElementTop - 150;
		
		console.log(`scrolling to ${id}`, el , absoluteElementTop ,window.innerHeight);
		window.scrollTo({
			top: topElement,
			behavior: 'smooth'
		});
		// console.log(`scrolling to ${id}`, el);
		// el.scrollIntoView();
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
	closeReturnAllChevrons() {
		this.rate_params["chevrons"]['r_section'] = false
		this.rate_params["chevrons"]['r_all_inclusive_rates'] = false
		this.rate_params["chevrons"]['r_others'] = false
		this.rate_params["chevrons"]['r_direct_taxes'] = false
		this.rate_params["chevrons"]['r_taxes'] = false
		this.rate_params["chevrons"]['r_amenities'] = false
		this.rate_params["chevrons"]['r_misc'] = false
		setTimeout(() => {
			this.scroll('rate-heading')
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
			// others: this.$form.group({}), // As discussed we don't need gratuity bucket
		});

		// fetch the data from backend
		this.getRatesData().subscribe((response) => {
			if (response && Object.keys(response).length > 0) {
				console.log('get rates data resposne-->>', response)
				this.buildRatesForm('RatesForm', response);
			}
		})

		//calculating totals of rates form if data auto fill by quote bot 
		
			console.log('calculating total for QB ')
			for (let formgroup in this.RateForm) {
				for (let subform in this.RateForm[formgroup].controls) {
						this.calculateAmount('RatesForm', formgroup, subform)
						if(this.init_r_rates){
						this.calculateAmount('ReturnRatesForm', formgroup, subform)
						}
				}
			}

			this.calculateTotal("RatesForm");
			this.calculateGrandTotal("RatesForm");
		
		// will send the rates form value to the booking component on any change in the whole form
		this.RatesForm.valueChanges.subscribe((value: any) => {
			this.calculateTotal("RatesForm");
			this.calculateGrandTotal("RatesForm");
		});
		(<FormGroup>this.RatesForm.get('all_inclusive_rates')).valueChanges.subscribe(() => {
			for (let formgroup in this.RateForm) {
				for (let subform in this.RateForm[formgroup]?.controls) {
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

		if(this.newBooking || this.distance){
			this.getReturnRatesData().subscribe((response: any) => {
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
				console.log('calculating return total for QB ')
				for (let formgroup in this.ReturnRateForm) {
					for (let subform in this.ReturnRateForm[formgroup].controls) {
							this.calculateAmount('ReturnRatesForm', formgroup, subform)
					}
				}
			
		}
		else{
			this.getReturnRatesData().subscribe((response: any) => {
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
		}

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
				this.emptyRateArray = response?.data?.rateArray
				this.ratesdata.next({})
				this.is_readonly_min_rate = response?.data?.min_rate_involved ? true : false
				this.ratesdata.next(response.data.rateArray);
				this.initRates();
			}
		});
	}

	fillReturnRateForm(data){
		this.returnRatesdata.next({})
		console.log('in function fill return rate form' , data)
		this.$api.fetchRatesByAffiliateVeh(data.vehicle_id, data).subscribe((response: any) => {
			this.is_readonly_min_rate = response?.data?.min_rate_involved ? true : false
				this.returnRatesdata.next(response?.data?.retrunRateArray)
				this.initReturnRates()
		});
	}
	fetchRatesArrayByAffiliateVehicle(data) {
		console.log('<<<<<<<<<<<________ data to send fetchRatesArrayByAffiliateVehicle---------------->>>>>>>>>>>>>>',data,
		data.vehicle_id , this.master_vehicle_id)
		try {
			let vehicle_id =  ''
			if(data.vehicle_id){
				vehicle_id = data?.vehicle_id.toString().length ? data?.vehicle_id : this.master_vehicle_id
				data['is_master_vehicle'] = data?.vehicle_id.toString().length ? false : true
			}
			this.$api.fetchRatesByAffiliateVeh(vehicle_id, data).subscribe((response: any) => {
				if(this.bookingType !='edit'  && this.bookingType !='repeat'){
					this.ratesdata.next({})
					this.calc_admin_share = 0
					this.travel_agent_share = 0
					this.is_readonly_min_rate = response?.data?.min_rate_involved ? true : false
					this.ratesdata.next(response?.data?.rateArray)
					this.initRates();
				}
				if(data.service_type == 'round_trip'){
					this.returnRatesdata.next(response?.data?.retrunRateArray)
					this.initReturnRates()
				}
			});
		} catch (error) {
			
			console.log('error--__>>>>' , error)
		}
	}
	getReturnRatesData() {
		return this.returnRatesdata.asObservable();
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
			value["min_rate_involved"] = this.is_readonly_min_rate

			this.formvalue.emit(value);
		}
		if (form == 'ReturnRatesForm' && this.ReturnRatesForm) {
			if (this.vehicles !== 0) {
				this.r_grandtotal = Number(this.r_subtotal.toFixed(2)) * this.vehicles;
			}
			let value = this.ReturnRatesForm.value;
			value["r_grandtotal"] = this.r_grandtotal;
			value["r_subtotal"] = this.r_subtotal

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
				if (this.hours != 0 && subform == 'Base_Rate' && !this.is_readonly_min_rate) {
					amount = Number(Number(Number(this.hours) * baserate).toFixed(2));
				}else {
					amount = baserate;
				}

				// Admin Share Calculation
				if (subform == 'Base_Rate' && !this.is_readonly_min_rate) {
					this.calc_admin_share = (amount * this.admin_share) / 100;
					console.log('calc_admin_share--->>', amount, this.calc_admin_share)
					amount = parseFloat((amount + this.calc_admin_share).toFixed(2));
				}
				console.log('is_readonly_min_rate-->>' ,this.is_readonly_min_rate )
				if(this.isTravelShare && subform == 'Base_Rate'){
					let min_rate = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("baserate").value;
					this.travel_agent_share = (min_rate * this.travel_share) / 100
					amount = amount + this.travel_agent_share;
					}
				if(this.is_readonly_min_rate && subform == 'Base_Rate'){
					let min_rate = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("baserate").value;
					this.calc_admin_share = (min_rate * this.admin_share) / 100
					amount = amount + this.calc_admin_share;
					console.log('is_readonly_min_rate_amount-->>' , amount , this.calc_admin_share )
				}

				(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
			}

		

			if (formgroup == "taxes") {
				let type = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("type").value;
				if (type === "flat" || type==null) {
					(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").setValue(baserate);
				}

				if (type === "percent") {
					// let kmrate = (<FormGroup>((<FormGroup>(this.RatesForm.get("all_inclusive_rates"))).get("Base_Rate"))).get("amount").value;
					let kmrate = await this.calculateBaseRate('RatesForm') - this.calc_admin_share - this.travel_agent_share;
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
					amount = parseFloat((amount + this.r_calc_admin_share).toFixed(2));
					if(this.isTravelShare && subform == 'Base_Rate'){
						let min_rate = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("baserate").value;
						this.r_travel_agent_share = (min_rate * this.travel_share) / 100
						amount = amount + this.r_travel_agent_share;
						}
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
					let kmrate = await this.calculateBaseRate('ReturnRatesForm') - this.r_calc_admin_share  - this.r_travel_agent_share;
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
					let kmrate = await this.calculateBaseRate('ReturnRatesForm') - this.r_calc_admin_share - this.r_travel_agent_share;
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
