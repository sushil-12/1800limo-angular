import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';

@Component({
	selector: 'app-rates-form',
	templateUrl: './rates-form.component.html',
	styleUrls: ['./rates-form.component.scss']
})
export class RatesFormComponent implements OnInit, OnChanges
{

	@Input('initRates') init_rates: boolean = false
	@Input('affiliate_type') affiliate_type: string
	@Input('distance') distance: string
	@Output('formvalue') data = new EventEmitter<Record<string, any>>()

	RatesForm: FormGroup

	interval: any

	trigger_error: boolean = false

	constructor(
		private $form: FormBuilder,
		private $api: AdminService
	) { }

	ngOnInit(): void
	{
	}
	ngOnChanges(changes: SimpleChanges)
	{
		console.log(changes)
		if (changes.init_rates && !changes.init_rates.firstChange)
		{
			changes.init_rates.currentValue && this.initRates(changes.affiliate_type.currentValue)
			this.distance = changes.distance.currentValue
		}
	}
	ngOnDestroy()
	{
		clearInterval(this.interval)
	}

	returnZero()
	{
		return 0
	}


	textFormatter(text: string)
	{
		try
		{
			return text.replace(/[\\\_$]+/g, ' ')
		}
		catch
		{
			return text
		}
	}

	initRates(affiliate_type: string)
	{
		// build form
		this.RatesForm = this.$form.group({
			all_inclusive_rates: this.$form.group({}),
			others: this.$form.group({}),
			direct_taxes: this.$form.group({}),
			taxes: this.$form.group({}),
			amenities: this.$form.group({})
		})

		// fetch the data from backend
		// this.fetchRates(affiliate_type).then((data: any) =>
		// {
		// 	this.buildRatesForm(data)
		// })
		let data = {
			"all_inclusive_rates": {
				"Kilometer_Rate": {
					"rate_label": "Kilometer Rate",
					"baserate": 0,
					"multiple": 0,
					"percentage": null,
					"amount": 0
				},
				"Minimum_Rate": {
					"rate_label": "Minimum Rate",
					"baserate": 0,
					"multiple": null,
					"percentage": null,
					"amount": 0
				}
			},
			"others": {
				"Gratuity": {
					"rate_label": "Gratuity",
					"baserate": 0,
					"multiple": null,
					"percentage": 20,
					"amount": 0
				}
			},
			"amenities": {
				"Baby_Seat": {
					"rate_label": "Baby Seat",
					"baserate": 0,
					"multiple": null,
					"percentage": null,
					"amount": 0
				},
				"Per_Diem": {
					"rate_label": "Per Diem",
					"baserate": 0,
					"multiple": null,
					"percentage": null,
					"amount": 0
				}
			},
			"direct_taxes": {
				"Airport_Arrival_Tax": {
					"rate_label": "Airport Arrival Tax",
					"baserate": 0,
					"multiple": null,
					"percentage": null,
					"amount": 0
				},
				"Airport_Departure_Tax": {
					"rate_label": "Airport Departure Tax",
					"baserate": 0,
					"multiple": null,
					"percentage": null,
					"amount": 0
				},
				"Sea_Port_Tax": {
					"rate_label": "Sea Port Tax",
					"baserate": 0,
					"multiple": null,
					"percentage": null,
					"amount": 0
				},
				"City_Congestion_Tax": {
					"rate_label": "City Congestion Tax",
					"baserate": 0,
					"multiple": null,
					"percentage": null,
					"amount": 0
				}
			},
			"taxes": {
				"City_Tax": {
					"rate_label": "City Tax",
					"baserate": 0,
					"multiple": null,
					"percentage": null,
					"amount": 0,
					"type": "flat",
					"flat_baserate": 0
				},
				"State_Tax": {
					"rate_label": "State Tax",
					"baserate": 0,
					"multiple": null,
					"percentage": null,
					"amount": 0,
					"type": "flat",
					"flat_baserate": 0
				},
				"VAT_Tax": {
					"rate_label": "VAT Tax",
					"baserate": 0,
					"multiple": null,
					"percentage": null,
					"amount": 0,
					"type": "flat",
					"flat_baserate": 0
				},
				"Workman_Comp_Tax": {
					"rate_label": "Workman Comp Tax",
					"baserate": 0,
					"multiple": null,
					"percentage": null,
					"amount": 0,
					"type": "flat",
					"flat_baserate": 0
				},
				"Other_Transportation_Tax": {
					"rate_label": "Other Transportation Tax",
					"baserate": 0,
					"multiple": null,
					"percentage": null,
					"amount": 0,
					"type": "flat",
					"flat_baserate": 0
				}
			}
		}
		this.buildRatesForm(data)
	}

	get RateForm(): Record<string, any>
	{
		return this.RatesForm.controls
	}

	fetchRates(): Promise<Record<string, any> | string>
	{
		return new Promise((resolve, reject) =>
		{
			this.$api.fetchAdminNewBookingRates(this.affiliate_type).subscribe((response: any) =>
			{
				if (response.success)
				{
					resolve(response.data)
				} else
				{
					reject(response.error)
				}
			})
		})
	}

	buildRatesForm(data: Record<string, any>): FormGroup
	{
		// Base Value for foundation of the whole algorithm
		if (data.hasOwnProperty('rate_label'))
		{
			console.log('Returning data', data)
			return this.$form.group({ ...data })
		}

		for (let key in data)
		{
			console.log('For Key: ', key)
			if (Array.isArray(data[key]))
			{
				// TODO do thing for array type
				console.log('Data contains array.')
				return
			}
			// if inner values contains object, ONLY
			else (Object.values(data[key]).length > 0)
			{
				for (let item in data[key])
				{
					console.log('Item: ', item);
					(<FormGroup>this.RatesForm.get(key)).addControl(item, this.buildRatesForm(data[key][item]))
				}
			}
		}
		console.log(this.RatesForm)
		this.RatesForm.valueChanges.subscribe((value: any) =>
		{
			// Minimum Rate should always be the lowest of all inlcusive rates
			if ((value.all_inclusive_rates.Kilometer_Rate.baserate < value.all_inclusive_rates.Minimum_Rate.baserate) || (value.all_inclusive_rates.Milage_Rate.baserate < value.all_inclusive_rates.Minimum_Rate.baserate))
			{
				this.trigger_error = true
			}

			// this.data.emit(value)
		})
	}
}
