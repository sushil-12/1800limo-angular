import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder, FormArray, AbstractControl, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { Subscription, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';

@Component({
	selector: 'app-edit-step6',
	templateUrl: './edit-step6.component.html',
	styleUrls: ['./edit-step6.component.scss']
})
export class EditStep6Component implements OnInit
{
	Step6ContentForm: FormGroup

	pageID: number | string

	routeSub: Subscription

	title: string
	subtitle: string
	content: string
	section_status: boolean


	// for frontend functionality only - to display records and show/hide fields
	// other_listing_arr: Array<any> = []
	// title_content_list_arr: Array<any> = []

	// because it is an array of strings
	ol_arr: number = 0

	// because it is a group - array of objects each containing an element of array of strings
	tcl_arr: Array<any> = []


	constructor(
		private formBuilder: FormBuilder,
		private adminServices: AdminService,
		private spinner: NgxSpinnerService,
		private activatedRoute: ActivatedRoute,
		private router: Router
	) { }

	ngOnInit(): void
	{
		this.Step6ContentForm = this.formBuilder.group({
			id: ['', Validators.required],
			title: ['', Validators.required],
			subtitle: ['', Validators.required],
			content: ['', Validators.required],
			section_status: ['', Validators.required],
			title_content_list_arr: this.formBuilder.array([]),
			other_listing_arr: this.formBuilder.array([]),
		})

		// get page id from url
		this.routeSub = this.activatedRoute.params.subscribe(params =>
		{
			this.pageID = params.id
		})

		console.log("\nFetching Data for page: ", this.pageID)

		// fetch data from the backend
		this.adminServices.getPageSectionData(this.pageID, 'step6').pipe(
			catchError(err =>
			{
				this.spinner.hide()
				return throwError(err)
			})
		).subscribe(({ data }: any) =>
		{
			console.log("\n\n\n ---------------------------------------- \n")
			console.log("Receiving Data from Backend: ", data)
			console.log("\n -------------------------------------------- \n\n\n")
			if (Object.keys(data).length > 0)
			{
				this.Step6ContentForm.patchValue({
					id: data.id,
					title: data.title,
					subtitle: data.subtitle,
					content: data.content,
					section_status: data.section_status,
				})

				// for fields to show/hide at frontend
				this.title = data.title
				this.subtitle = data.subtitle
				this.content = data.content




				// remove controls for null values of first three fields to make the form valid on submission
				if (data.title == null)
				{
					this.Step6ContentForm.removeControl('title')
				}
				if (data.subtitle == null)
				{
					this.Step6ContentForm.removeControl('subtitle')
				}
				if (data.content == null)
				{
					this.Step6ContentForm.removeControl('content')
				}
				if (data.other_listing_arr == null)
				{
					this.Step6ContentForm.removeControl('other_listing_arr')
				}
				if (data.title_content_list_arr == null)
				{
					this.Step6ContentForm.removeControl('title_content_list_arr')
				}



				// if data is received in other_listing_arr from backend
				if (data.other_listing_arr && data.other_listing_arr.length > 0)
				{
					data.other_listing_arr.forEach((item) =>
					{
						// will form other_listing_arr for frontend
						this.addListingField(item)
					})
				}

				// if data is received in title_content_list_arr from backend
				if (data.title_content_list_arr && data.title_content_list_arr.length > 0)
				{
					data.title_content_list_arr.forEach((item, index) =>
					{
						// will form title_content_list_arr for frontend
						this.addTitleContentListingField(item, index)
					})
				}
			}
		})
	}
	// ngOnInit() ends

	get Object_other_listing_arr(): FormArray
	{
		return this.Step6ContentForm.get('other_listing_arr') as FormArray
	}

	get Object_title_content_list_arr(): FormArray
	{
		return this.Step6ContentForm.get('title_content_list_arr') as FormArray
	}

	Object_form_list_points(index: number): FormArray
	{
		return this.Object_title_content_list_arr.at(index).get('list_points') as FormArray
	}


	formatContent()
	{
		(this.Step6ContentForm.get('content') as FormControl).value.replace('\n', '<br>')
		console.log(this.Step6ContentForm.get('content').value)
	}

	addListingField(element?: any)
	{
		let content: AbstractControl;
		if (element && Object.keys(element).length > 0)
		{
			// this.other_listing_arr.push(element)
			content = new FormControl(element, Validators.required)
		} else
		{
			// this.other_listing_arr.push('')
			content = new FormControl('', Validators.required)
		}
		this.ol_arr += 1
		this.Object_other_listing_arr.push(content)
		console.log('Other Listing Array: ', this.ol_arr)
	}

	deleteListingField(index: number)
	{
		// delete listing field at particular index
		this.Object_other_listing_arr.removeAt(index)
		this.ol_arr -= 1
		// this.other_listing_arr.splice(index, 1)
		console.log('Other Listing Array: ', this.ol_arr)
	}


	addTitleContentListingField(element: any, index?: number)
	{
		let formGroup: AbstractControl
		let array = []
		console.log('\nAdding title_content_listing_field')
		if (element && Object.keys(element).length > 0)
		{
			// this.title_content_list_arr[index] = {
			// 	title: element.list_title,
			// 	content: element.content,
			// 	list_points: []
			// }
			this.tcl_arr.push({
				list_data: 1,
				list_points: 0
			})
			// make an array to fill the empty array of list_points
			element.list_points.forEach((item) =>
			{
				// this.title_content_list_arr[index]['list_points'].push(item)
				array.push(item)
				this.tcl_arr[index].list_points += 1

			})

			// form a valued Abstract Control
			formGroup = this.formBuilder.group({
				list_title: [element.list_title],
				list_content: [element.list_content],
				list_subcontent: [element.list_subcontent],
				list_points: this.formBuilder.array(array)
			})
		} else
		{
			// push an empty into local array 
			// this.title_content_list_arr.push({
			// 	list_title: '',
			// 	content: '',
			// 	list_points: ["skajg"]
			// })
			this.tcl_arr.push({
				list_data: 1,
				list_points: 0
			})

			// form an empty valued Abstract Control
			formGroup = this.formBuilder.group({
				list_title: [''],
				list_content: [''],
				list_subcontent: [''],
				list_points: this.formBuilder.array([])
			})
		}

		// push to form > title_content_list_arr
		console.log('Title Content List Array: ', this.tcl_arr)
		return this.Object_title_content_list_arr.push(formGroup)
	}

	deleteTitleContentListingField(object_index: number)
	{
		this.tcl_arr.splice(object_index, 1)
		return this.Object_title_content_list_arr.removeAt(object_index)
	}

	addListPointField(object_index: number)
	{
		if (object_index >= 0)
		{
			this.tcl_arr[object_index].list_points += 1
			this.Object_form_list_points(object_index).push(new FormControl('', Validators.required))
		} else
		{
			console.log('Index not specified ....')
		}
	}

	deleteListPointField(object_index: number, list_index: number)
	{
		if (object_index >= 0 && list_index >= 0)
		{
			this.tcl_arr[object_index].list_points -= 1
			this.Object_form_list_points(object_index).removeAt(list_index)
		}
	}

	saveStep6ContentForm()
	{

		// console.log(this.Step6ContentForm.value)
		// return

		this.spinner.show()
		if (this.Step6ContentForm.invalid)
		{
			return
		}

		this.adminServices.saveStepSectionData('step6', this.Step6ContentForm.value).pipe(
			catchError(err => 
			{
				this.spinner.hide()
				return throwError(err)
			})
		).subscribe(result =>
		{
			this.spinner.hide()
			console.clear()
			if (result['success'])
			{
				this.router.navigate(['/admin/cms/step6'])
			}
		})
	}

	backButton()
	{
		this.router.navigate(['admin/cms/step6'])
	}
}
