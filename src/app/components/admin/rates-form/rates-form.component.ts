import
{ Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, OnChanges } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { AdminService } from "src/app/services/admin.service";

import { combineLatest } from "rxjs";

@Component({
	selector: "app-rates-form",
	templateUrl: "./rates-form.component.html",
	styleUrls: ["./rates-form.component.scss"],
})
export class RatesFormComponent implements OnInit, OnChanges
{
	// Capture Events.
	@Input("initRates") init_rates: boolean = false;
	@Input("initReturnRates") init_r_rates: boolean = false;
	@Input("affiliate_type") affiliate_type: string = "";
	@Input("distance") distance: string = "";
	@Input("reservation_id") bookingId: number = 0;
	@Input("amenities") amenities: Array<string> = [];
	@Input("vehicles") vehs: number = 0;
	@Input("hours") nums: number = 0;
	@Input('reset') reset: boolean = false;

	// Throw Events.
	@Output("formvalue") formvalue = new EventEmitter<Record<string, any>>();
	@Output("returnformvalue") returnformvalue = new EventEmitter<Record<string, any>>();

	RatesForm: FormGroup;
	ReturnRatesForm: FormGroup;

	ratesdata: any;
	temp: any;

	ratesform: boolean = false;
	returnratesform: boolean = false;

	rate_params: any = {
		chevrons: {
			section: false,
			sub_section_0: false,
			sub_section_1: false,
			sub_section_2: false,
			sub_section_3: false,
			sub_section_4: false,
			sub_section_5: false,
			r_section: false,
			r_sub_section_0: false,
			r_sub_section_1: false,
			r_sub_section_2: false,
			r_sub_section_3: false,
			r_sub_section_4: false,
			r_sub_section_5: false,
		},
	};

	minimum_rate: Record<string, any>;

	total: Record<string, any> = {};
	r_total: Record<string, any> = {};

	subtotal: number = 0;
	r_subtotal: number = 0;
	grandtotal: number = 0;
	r_grandtotal: number = 0;

	vehicles: number = 0;
	hours: number = 0;

	constructor(private $form: FormBuilder, private $api: AdminService) { }

	ngOnInit(): void
	{
		this.fetchRates("").then((data: any) =>
		{
			this.ratesdata = data;
		});
	}

	ngOnChanges(changes: SimpleChanges)
	{
		console.warn("Change has been detected: ", changes);

		this.ratesform = changes.init_rates?.currentValue ?? this.ratesform;
		this.returnratesform =
			changes.init_r_rates?.currentValue ?? this.returnratesform;

		// if asked to initialise the rates
		if (changes.init_rates?.currentValue)
		{
			this.initRates();
		}

		if (changes.init_r_rates?.currentValue || this.returnratesform)
		{
			this.hours = 0;
			setTimeout(() =>
			{
				this.initReturnRates();
			}, 3000);
		}

		if (changes.nums)
		{
			this.hours = changes.nums.currentValue
		}

		if (changes.vehs)
		{
			this.vehicles = changes.vehs ? changes.vehs.currentValue : this.vehicles;
			if (!this.vehicles)
			{
				this.vehicles = 1;
			}
			this.calculateGrandTotal('RatesForm');
			if (this.ReturnRatesForm)
			{
				this.calculateGrandTotal('ReturnRatesForm');
			}
		} else
		{
			this.vehicles = 1
		}

		if (changes.bookingId && changes.bookingId.currentValue !== 0)
		{
			this.fetchRates("", changes.bookingId?.currentValue).then((data: any) =>
			{
				for (let item in this.RateForm)
				{
					for (let key in (<FormGroup>this.RatesForm.get(item)).controls)
					{
						console.log(item, key);
						let baserate = data[item][key]["baserate"];
						let type = data[item][key]["type"] ?? "flat";
						(<FormGroup>((<FormGroup>this.RatesForm.get(item)).get(key))).get("baserate").setValue(baserate);
						if ((<FormGroup>((<FormGroup>this.RatesForm.get(item)).get(key))).get("type"))
						{
							(<FormGroup>((<FormGroup>this.RatesForm.get(item)).get(key))).get("type").setValue(type);
						}
					}
				}
			});
		}

		if (changes.reset)
		{
			this.RatesForm = null
			this.ReturnRatesForm = null
			this.total = {}
			this.r_total = {}
			this.initRates()
			this.calculateTotal('RatesForm')
			this.calculateGrandTotal('RatesForm')
			if (this.ReturnRatesForm)
			{
				this.initReturnRates()
				this.calculateTotal('ReturnRatesForm')
				this.calculateGrandTotal('ReturnRatesForm')
			}
		}
	}

	returnZero()
	{
		return 0;
	}

	textFormatter(text: string)
	{
		try
		{
			return text.replace(/[\\\_$]+/g, " ");
		} catch {
			return text;
		}
	}

	initRates()
	{
		console.log("Init Rates");
		this.RatesForm = this.$form.group({});
		// build form
		this.RatesForm = this.$form.group({
			all_inclusive_rates: this.$form.group({}),
			others: this.$form.group({}),
			direct_taxes: this.$form.group({}),
			taxes: this.$form.group({}),
			amenities: this.$form.group({}),
			misc: this.$form.group({}),
		});

		// fetch the data from backend
		if (this.ratesdata)
		{
			this.buildRatesForm("RatesForm", this.ratesdata);
		}

		this.RatesForm.valueChanges.subscribe((value: any) =>
		{
			this.calculateTotal("RatesForm");
			this.calculateGrandTotal("RatesForm");
			value["grand_total"] = this.grandtotal;
			value["sub_total"] = this.subtotal;

			this.formvalue.emit(value);
		});
	}

	initReturnRates()
	{
		console.log("Init Return Rates");

		this.ReturnRatesForm = this.$form.group({
			all_inclusive_rates: this.$form.group({}),
			others: this.$form.group({}),
			direct_taxes: this.$form.group({}),
			taxes: this.$form.group({}),
			amenities: this.$form.group({}),
			misc: this.$form.group({}),
		});

		if (this.ratesdata)
		{
			this.buildRatesForm("ReturnRatesForm", this.ratesdata);

			this.ReturnRatesForm.valueChanges.subscribe((value: any) =>
			{
				this.calculateTotal("ReturnRatesForm");
				this.calculateGrandTotal('ReturnRatesForm');
				value["r_grand_total"] = this.r_subtotal;
				value["r_sub_total"] = this.r_subtotal;

				this.returnformvalue.emit(value);
			});
		}
	}

	get RateForm(): Record<string, any>
	{
		if (!this.RatesForm)
		{
			return;
		}
		return this.RatesForm.controls;
	}

	get ReturnRateForm(): Record<string, any>
	{
		if (!this.ReturnRatesForm)
		{
			return;
		}
		return this.ReturnRatesForm.controls;
	}

	changeValue(
		form: string,
		formgroup: string,
		subform: string,
		formcontrol: string,
		value: any
	)
	{
		if (form === "RatesForm")
		{
			(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get(formcontrol).setValue(value);
			this.RatesForm.updateValueAndValidity();
		}
		if (form === "ReturnRatesForm")
		{
			(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get(formcontrol).setValue(value);
			this.ReturnRatesForm.updateValueAndValidity();
		}
	}

	fetchRates(affiliate: string, bookingId: number = 0): Promise<Record<string, any> | string>
	{
		return new Promise((resolve, reject) =>
		{
			this.$api.fetchAdminNewBookingRates(affiliate, bookingId).subscribe((response: any) =>
			{
				if (response.success)
				{
					resolve(response.data.rateArray);
				} else
				{
					reject(response.error);
				}
			});
		});
	}

	buildRatesForm(form: string, data: Record<string, any>): FormGroup
	{
		// Base Value for foundation of the whole algorithm
		if (data.hasOwnProperty("rate_label"))
		{
			return this.$form.group({ ...data });
		}

		for (let key in data)
		{
			if (Array.isArray(data[key]))
			{
				// TODO do thing for array type
				console.log("Data contains array.");
				return;
			}
			// if inner values contains object, ONLY
			else Object.values(data[key]).length > 0;
			{
				for (let item in data[key])
				{
					if (form === "RatesForm")
					{
						console.log(key, item);
						(<FormGroup>this.RatesForm.get(key)).addControl(item, this.buildRatesForm(form, data[key][item]));
						(<FormGroup>((<FormGroup>this.RatesForm.get(key)).get(item))).get("baserate").valueChanges.subscribe((value: number) =>
						{
							this.calculateAmount("RatesForm", key, item);
						});
					}
					if (form === "ReturnRatesForm")
					{
						(<FormGroup>this.ReturnRatesForm.get(key)).addControl(
							item,
							this.buildRatesForm(form, data[key][item])
						);
						(<FormGroup>(
							(<FormGroup>this.ReturnRatesForm.get(key)).get(item)
						))
							.get("baserate")
							.valueChanges.subscribe((value: number) =>
							{
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

	/**
	* calculates amount based on the baserate. [WORKS FOR BOTH TYPES OF FORM]
	* @param form type of Form
	* @param formgroup name of the parent form
	* @param subform name of the child formaserate": 0,
*/
	async calculateAmount(form: string, formgroup: string, subform: string)
	{
		if (form === "RatesForm")
		{
			let baserate = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("baserate").value;

			if (!baserate)
			{
				baserate = 0;
			}

			if (["direct_taxes", "amenities", "taxes", "misc"].includes(formgroup))
			{
				// Flat Values
				this.RateForm[formgroup].controls[subform].controls.amount.setValue(baserate);
				// initially run for taxes also because default value will be flat
			}

			if (formgroup == "all_inclusive_rates")
			{
				let amount = 0;
				// Hourly Rate - only in case of hours
				if (this.hours !== 0)
				{
					amount = Number(Number(Number(this.hours) * baserate).toFixed(2));
				} else
				{
					amount = baserate;
				};

				(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
			}

			if (formgroup == "others")
			{
				// let kmrate = (<FormGroup>((<FormGroup>this.RatesForm.get("all_inclusive_rates")).get("Base_Rate"))).get("amount").value;
				let kmrate = await this.calculateBaseRate();
				let basevalue = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("baserate").value;

				let amount = Number(Number((basevalue / 100) * kmrate).toFixed(2));

				(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get("amount").setValue(amount);
				// set value of percentage same as gratuity
				(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("percentage").setValue(basevalue);
			}

			if (formgroup == "taxes")
			{
				let type = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("type").value;
				if (type === "flat")
				{
					(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").setValue(baserate);
				}

				if (type === "percent")
				{
					// let kmrate = (<FormGroup>((<FormGroup>(this.RatesForm.get("all_inclusive_rates"))).get("Base_Rate"))).get("amount").value;
					let kmrate = await this.calculateBaseRate();
					let taxvalue = (<FormGroup>((<FormGroup>this.RatesForm.get("taxes")).get(subform))).get("baserate").value;

					let amount = Number(Number((taxvalue / 100) * kmrate).toFixed(2));

					(<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
				}
				// On Change of Flat | Percentage - Taxes
				(<FormGroup>((<FormGroup>this.RatesForm.get("taxes")).get(subform))).get("type").valueChanges.subscribe((value: any) =>
				{
					this.calculateAmount("RatesForm", formgroup, subform);
				});
			}

			let amount = (<FormGroup>((<FormGroup>this.RatesForm.get(formgroup)).get(subform))).get("amount").value;
			this.total[subform] = Number(Number(amount).toFixed(2));
			this.RatesForm.updateValueAndValidity();
		}

		// --------------------- RETURN RATES FORM ------------------------
		if (form === "ReturnRatesForm")
		{
			let baserate = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("baserate").value;

			if (["direct_taxes", "amenities", "taxes", "misc"].includes(formgroup))
			{
				// Flat Values
				this.ReturnRateForm[formgroup].controls[subform].controls.amount.setValue(baserate);
				// initially run for taxes also because default value will be flat
			}

			if (formgroup == "all_inclusive_rates")
			{
				// Milage Rate
				// let amount = Number(Number(Number(this.distance) * baserate).toFixed(2));
				(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("amount").setValue(baserate);
			}

			if (formgroup == "others")
			{
				// Gratuity
				// let kmrate = (<FormGroup>((<FormGroup>(this.ReturnRatesForm.get("all_inclusive_rates"))).get("Base_Rate"))).get("amount").value;
				let kmrate = await this.calculateBaseRate();
				let basevalue = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("baserate").value;

				let amount = Number(Number((basevalue / 100) * kmrate).toFixed(2)
				);

				(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
				// set value of percentage same as gratuity
				(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("percentage").setValue(basevalue);
			}

			if (formgroup == "taxes")
			{
				let type = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("type").value;
				if (type === "flat")
				{
					(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("amount").setValue(baserate);
				}

				if (type === "percent")
				{
					// let kmrate = (<FormGroup>((<FormGroup>(this.ReturnRatesForm.get("all_inclusive_rates"))).get("Base_Rate"))).get("amount").value;
					let kmrate = await this.calculateBaseRate();
					let taxvalue = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get("taxes")).get(subform))).get("baserate").value;

					let amount = Number(Number((taxvalue / 100) * kmrate).toFixed(2));

					(<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("amount").setValue(amount);
				}

				// Flat | Percentage - Taxes
				(<FormGroup>((<FormGroup>this.ReturnRatesForm.get("taxes")).get(subform))).get("type").valueChanges.subscribe((value: any) =>
				{
					this.calculateAmount("ReturnRatesForm", formgroup, subform);
				});
			}

			let amount = (<FormGroup>((<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform))).get("amount").value;
			this.r_total[subform] = Number(Number(amount).toFixed(2));
			this.ReturnRatesForm.updateValueAndValidity();
		}
		console.log(this.total, this.r_total);
	}

	calculateTotal(form: "RatesForm" | "ReturnRatesForm")
	{
		if (form === "RatesForm")
		{
			this.subtotal = 0;
			for (let item in this.total)
			{
				this.subtotal = Number(this.subtotal.toFixed(2)) + Number(this.total[item].toFixed(2));
			}
		}

		if (form === "ReturnRatesForm")
		{
			this.r_subtotal = 0;
			for (let item in this.r_total)
			{
				this.r_subtotal = Number(this.r_subtotal.toFixed(2)) + Number(this.r_total[item].toFixed(2));
			}
		}
	}

	calculateBaseRate(): number
	{
		let temp = 0
		for (let subform in this.RateForm.all_inclusive_rates.controls)
		{
			let amount = (<FormGroup>((<FormGroup>this.RatesForm.get('all_inclusive_rates')).get(subform))).get("amount").value
			temp += amount
		}
		return temp
	}

	calculateGrandTotal(form: "RatesForm" | "ReturnRatesForm")
	{
		if (form === "RatesForm")
		{
			if (this.vehicles !== 0)
			{
				this.grandtotal = Number(this.subtotal.toFixed(2)) * this.vehicles;
			}
		}
		if (form == 'ReturnRatesForm')
		{
			if (this.vehicles !== 0)
			{
				this.r_grandtotal = Number(this.r_subtotal.toFixed(2)) * this.vehicles;
			}
		}
	}

	toggleDropdown(section: string)
	{
		this.rate_params["chevrons"][section] = !this.rate_params["chevrons"][section];
	}
}
