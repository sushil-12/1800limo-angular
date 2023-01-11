import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges, ViewChild, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AdminService } from 'src/app/services/admin.service';


import { combineLatest } from 'rxjs';



@Component({
	selector: 'app-rates-form',
	templateUrl: './rates-form.component.html',
	styleUrls: ['./rates-form.component.scss']
})
export class RatesFormComponent implements OnInit, OnChanges
{
	// Capture Events.
	@Input('initRates') init_rates: boolean = false
	@Input('initReturnRates') init_r_rates: boolean = false
	@Input('affiliate_type') affiliate_type: string = ''
	@Input('distance') distance: string = ''
	@Input('reservation_id') bookingId: number = 0
	@Input('amenities') amenities: Array<string> = []

	// Throw Events.
	@Output('formvalue') formvalue = new EventEmitter<Record<string, any>>()
	@Output('returnformvalue') returnformvalue = new EventEmitter<Record<string, any>>()

	RatesForm: FormGroup
	ReturnRatesForm: FormGroup

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
		}
	}

	minimum_rate: Record<string, any>

	total: Record<string, any> = {}
	r_total: Record<string, any> = {}
	grand_total: number = 0
	r_grand_total: number = 0

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

		// if asked to initialise the rates
		if (changes.init_rates?.currentValue)
		{
			this.initRates(changes.affiliate_type?.currentValue)
		}

		if (changes.init_r_rates?.currentValue)
		{
			this.initReturnRates(changes.affiliate_type?.currentValue)
		}

		// if (changes.bookingId.currentValue !== 0)
		// {
		// 	this.initRates('', changes.bookingId.currentValue)
		// }
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

	initRates(affiliate_type: string, bookingId: number = 0)
	{
		console.log('Init Rates')
		// build form
		this.RatesForm = this.$form.group({
			all_inclusive_rates: this.$form.group({}),
			others: this.$form.group({}),
			direct_taxes: this.$form.group({}),
			taxes: this.$form.group({}),
			amenities: this.$form.group({})
		})


		// fetch the data from backend
		this.fetchRates(affiliate_type, bookingId).then((data: any) =>
		{
			this.buildRatesForm('RatesForm', data)
		})

		// this.RatesForm.valueChanges.subscribe((value: any) =>
		// {
		// 	this.calculateGrandTotal('RatesForm')
		// 	value['grand_total'] = this.grand_total

		// 	this.formvalue.emit(value)
		// })
	}

	initReturnRates(affiliate_type: string)
	{
		console.log('Init Return Rates')

		this.fetchRates(affiliate_type).then((data: any) =>
		{
			this.ReturnRatesForm = this.$form.group({
				all_inclusive_rates: this.$form.group({}),
				others: this.$form.group({}),
				direct_taxes: this.$form.group({}),
				taxes: this.$form.group({}),
				amenities: this.$form.group({})
			})
			this.buildRatesForm('ReturnRatesForm', data)
			this.ReturnRatesForm.valueChanges.subscribe((value: any) =>
			{
				this.calculateGrandTotal('ReturnRatesForm')
				value['r_grand_total'] = this.r_grand_total

				this.returnformvalue.emit(value)
			})
		})
	}


	get RateForm(): Record<string, any>
	{
		return this.RatesForm.controls
	}

	get ReturnRateForm(): Record<string, any>
	{
		return this.ReturnRatesForm.controls
	}

	changeValue(form: string, formgroup: string, subform: string, formcontrol: string, value: any)
	{
		if (form === 'RatesForm')
		{
			(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get(formcontrol).setValue(value);
			this.RatesForm.updateValueAndValidity()
		}
		if (form === 'ReturnRatesForm')
		{
			(<FormGroup>(<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform)).get(formcontrol).setValue(value);
			this.ReturnRatesForm.updateValueAndValidity()
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
					resolve(response.data.rateArray)
				} else
				{
					reject(response.error)
				}
			})
		})
	}

	buildRatesForm(form: string, data: Record<string, any>): FormGroup
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
					if (form === 'RatesForm')
					{
						(<FormGroup>this.RatesForm.get(key)).addControl(item, this.buildRatesForm(form, data[key][item]));
						(<FormGroup>(<FormGroup>this.RatesForm.get(key)).get(item)).get('baserate').valueChanges.subscribe((value: number) =>
						{
							this.calculateAmount('RatesForm', key, item)
						})
					}
					if (form === 'ReturnRatesForm')
					{
						(<FormGroup>this.ReturnRatesForm.get(key)).addControl(item, this.buildRatesForm(form, data[key][item]));
					}
				}
			}
		}
		console.log(this.RatesForm);
		console.log(this.ReturnRatesForm);
	}

	/**
	 * calculates amount based on the baserate. [WORKS FOR BOTH TYPES OF FORM]
	 * @param form type of Form
	 * @param formgroup name of the parent form
	 * @param subform name of the child form
	 */
	calculateAmount(form: string, formgroup: string, subform: string)
	{
		if (form === 'RatesForm')
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
				// let amount = Number(Number(Number(this.distance) * baserate).toFixed(2));
				(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('amount').setValue(baserate);
			}

			if (formgroup == 'others')
			{
				// Gratuity
				let kmrate = (<FormGroup>(<FormGroup>this.RatesForm.get('all_inclusive_rates')).get('Base_Rate')).get('amount').value;
				let gratuity = (<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('baserate').value;

				let amount = Number(Number((gratuity / 100) * kmrate).toFixed(2));

				(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('amount').setValue(amount);
				// set value of percentage same as gratuity
				(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('percentage').setValue(gratuity);
			}

			if (formgroup == 'taxes')
			{
				let type = (<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('type').value
				if (type === 'flat')
				{
					(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('amount').setValue(baserate);
				}

				if (type === 'percent')
				{
					let kmrate = (<FormGroup>(<FormGroup>this.RatesForm.get('all_inclusive_rates')).get('Base_Rate')).get('amount').value;
					let taxvalue = (<FormGroup>(<FormGroup>this.RatesForm.get('taxes')).get(subform)).get('baserate').value;

					let amount = Number(Number((taxvalue / 100) * kmrate).toFixed(2));

					(<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('amount').setValue(amount);
				}
				// On Change of Flat | Percentage - Taxes
				(<FormGroup>(<FormGroup>this.RatesForm.get('taxes')).get(subform)).get('type').valueChanges.subscribe((value: any) =>
				{
					this.calculateAmount('RatesForm', formgroup, subform);
				})
			}
			let amount = (<FormGroup>(<FormGroup>this.RatesForm.get(formgroup)).get(subform)).get('amount').value
			this.total[subform] = Number(Number(amount).toFixed(2))
			this.RatesForm.updateValueAndValidity()
		}

		// --------------------- RETURN RATES FORM ------------------------
		if (form === 'ReturnRatesForm')
		{
			(<FormGroup>(<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform)).get('baserate').setValue(value);
			let baserate = (<FormGroup>(<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform)).get('baserate').value;

			if (['direct_taxes', 'amenities', 'taxes'].includes(formgroup))
			{
				// Flat Values
				this.ReturnRateForm[formgroup].controls[subform].controls.amount.setValue(baserate);
				// initially run for taxes also because default value will be flat
			}

			if (formgroup == 'all_inclusive_rates')
			{
				// Milage Rate
				// let amount = Number(Number(Number(this.distance) * baserate).toFixed(2));
				(<FormGroup>(<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform)).get('amount').setValue(baserate);
			}

			if (formgroup == 'others')
			{
				// Gratuity
				let kmrate = (<FormGroup>(<FormGroup>this.ReturnRatesForm.get('all_inclusive_rates')).get('Base_Rate')).get('amount').value;
				let gratuity = (<FormGroup>(<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform)).get('baserate').value;

				let amount = Number(Number((gratuity / 100) * kmrate).toFixed(2));

				(<FormGroup>(<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform)).get('amount').setValue(amount);
				// set value of percentage same as gratuity
				(<FormGroup>(<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform)).get('percentage').setValue(gratuity);
			}

			if (formgroup == 'taxes')
			{
				let type = (<FormGroup>(<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform)).get('type').value
				if (type === 'flat')
				{
					(<FormGroup>(<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform)).get('amount').setValue(baserate);
				}

				if (type === 'percent')
				{
					let kmrate = (<FormGroup>(<FormGroup>this.ReturnRatesForm.get('all_inclusive_rates')).get('Base_Rate')).get('amount').value;
					let taxvalue = (<FormGroup>(<FormGroup>this.ReturnRatesForm.get('taxes')).get(subform)).get('baserate').value;

					let amount = Number(Number((taxvalue / 100) * kmrate).toFixed(2));

					(<FormGroup>(<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform)).get('amount').setValue(amount);
				}

				// Flat | Percentage - Taxes
				(<FormGroup>(<FormGroup>this.ReturnRatesForm.get('taxes')).get(subform)).get('type').valueChanges.subscribe((value: any) =>
				{
					this.calculateAmount('ReturnRatesForm', formgroup, subform, baserate);
				})
			}
			let amount = (<FormGroup>(<FormGroup>this.ReturnRatesForm.get(formgroup)).get(subform)).get('amount').value
			this.r_total[subform] = Number(Number(amount).toFixed(2))
			this.ReturnRatesForm.updateValueAndValidity()
		}
		console.log(this.total, this.r_total)
	}


	calculateGrandTotal(form: string)
	{
		if (form === 'RatesForm')
		{
			this.grand_total = 0
			for (let item in this.total)
			{
				this.grand_total = Number(this.grand_total) + Number(this.total[item])
			}
		}

		if (form === 'ReturnRatesForm')
		{
			this.r_grand_total = 0
			for (let item in this.r_total)
			{
				this.r_grand_total = Number(this.r_grand_total) + Number(this.r_total[item])
			}
		}
	}


	toggleDropdown(section: string)
	{
		this.rate_params['chevrons'][section] = !this.rate_params['chevrons'][section]
	}


}
