import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';


import { combineLatest } from 'rxjs';


interface Rates
{
	kmrate: number,
	minimum: number,
	direct_taxes: number,
	gratuity: number,
	taxes: Record<string, any>,
	amenities: number
}
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

	minimum_rate: Record<string, any>

	grand_total: number = 0

	interval: any

	trigger_error: boolean = false

	constructor(
		private $form: FormBuilder,
		private $api: AdminService
	) { }

	ngOnInit(): void
	{ }
	ngOnChanges(changes: SimpleChanges)
	{
		console.log(changes)
		if (changes.init_rates && !changes.init_rates.firstChange)
		{
			changes.init_rates.currentValue && this.initRates(changes.affiliate_type.currentValue)
		}
		this.calculateAmount('all_inclusive_rates', 'Milage_Rate')
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
		this.fetchRates().then((data: any) =>
		{
			this.buildRatesForm(data)
		})
	}

	get RateForm(): Record<string, any>
	{
		return this.RatesForm.controls
	}

	fetchRates(): Promise<Record<string, any> | string>
	{
		return new Promise((resolve, reject) =>
		{
			this.$api.fetchAdminNewBookingRates('').subscribe((response: any) =>
			{
				if (response.success)
				{
					resolve(response.data.rateArray)
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
			if ((value?.all_inclusive_rates?.Kilometer_Rate?.baserate < value?.all_inclusive_rates?.Minimum_Rate?.baserate) || (value.all_inclusive_rates?.Milage_Rate?.baserate < value?.all_inclusive_rates?.Minimum_Rate?.baserate))
			{
				this.trigger_error = true
			}

			value['grand_total'] = this.grand_total

			this.data.emit(value)
		})
	}


	calculateAmount(formgroup: string, subform: string)
	{
		let baserate = (<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('baserate').value;

		if (['direct_taxes', 'amenities', 'taxes'].includes(formgroup))
		{
			// Flat Values
			this.RateForm[formgroup].controls[subform].controls.amount.setValue(baserate);
			// initially run for taxes also because default value will be flat
		}

		if (formgroup == 'all_inclusive_rates')
		{
			// Milage Rate
			let amount = Number(Number(Number(this.distance) * baserate).toFixed(2));
			(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('amount').setValue(amount);
		}

		if (formgroup == 'others')
		{
			// Gratuity
			let kmrate = (<FormGroup>(<FormGroup>this.RatesForm.get('all_inclusive_rates')).get('Milage_Rate')).get('amount').value;
			let gratuity = (<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('baserate').value;

			let amount = Number(Number((gratuity / 100) * kmrate).toFixed(2));

			(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('amount').setValue(amount);
			// set value of percentage same as gratuity
			(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('percentage').setValue(gratuity);
		}

		if (formgroup == 'taxes')
		{
			if ((<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('type').value == 'flat')
			{
				(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('amount').setValue(baserate);
			}
			else
			{
				let kmrate = (<FormGroup>(<FormGroup>this.RatesForm.get('all_inclusive_rates')).get('Milage_Rate')).get('amount').value;
				let taxvalue = (<FormGroup>(<FormGroup>this.RatesForm.get('taxes')).get(subform)).get('baserate').value;

				let amount = Number(Number((taxvalue / 100) * kmrate).toFixed(2));

				(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('amount').setValue(amount);
			}
			// Flat | Percentage - Taxes
			(<FormGroup>(<FormGroup>this.RatesForm.get('taxes')).get(subform)).get('type').valueChanges.subscribe((value: any) =>
			{
				if (value === 'percent')
				{
					this.calculateAmount(formgroup, subform)
				}
			})
		}
		this.grand_total = Number(this.grand_total.toFixed(2)) + Number(Number((<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('amount').value).toFixed(2))
		this.RatesForm.updateValueAndValidity()
	}


}
