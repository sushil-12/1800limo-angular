import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { AffiliateService } from 'src/app/services/affiliate.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormGroup, FormBuilder, Validators, FormArray, FormControl } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';


@Component({
	selector: 'app-edit-step0',
	templateUrl: './edit-step0.component.html',
	styleUrls: ['./edit-step0.component.scss']
})
export class EditStep0Component implements OnInit
{

	heading = 'Step0';

	editContentForm: FormGroup;


	submittedForm: boolean;
	sectionID: string;
	section: string;
	title: any;
	subtitle: any;
	content: any;
	id_front_image: string;
	imageSrc: string;
	section_status: string;
	id_front_image_id: string;
	pageSectionID: string;
	sectionContentRes: any;
	video_url: any;
	response: any;
	disableSubmitButton: boolean = false;



	images: Array<any> = [];
	other_listing_arr: Array<any> = [];
	other_group_listing_arr: Array<any> = [];
	multiChoice: Array<any> = [];
	listImage: Array<any> = [];



	constructor(
		private adminServices: AdminService,
		private affiliateService: AffiliateService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private commonServices: CommonService,
		private formBuilder: FormBuilder
	)
	{


	}


	ngOnInit(): void
	{
		this.spinner.show();


		this.editContentForm = this.formBuilder.group(
			{
				id: [this.sectionID],
				section: [this.section],
				title: ['', Validators.required],
				subtitle: [''],
				content: ['', Validators.required],
				images: [''],
				section_status: [''],
				video_url: [''],
				other_listing_arr: this.formBuilder.array([]),
				other_group_listing_arr: this.formBuilder.array([]),
			}
		);

		const tree = this.router.parseUrl(this.router.url);
		this.pageSectionID = tree.root.children.primary.segments[4].path;

		// passing page section id from route URL params
		this.adminServices.getPageSectionData(this.pageSectionID, 'step0').pipe(catchError(err =>
		{
			this.spinner.hide();
			return throwError(err);
		})
		).subscribe(({ data }: any) =>
		{
			console.log('Receiving API Response : ', data);
			this.spinner.hide();
			// this.sectionContentRes = data;		// no use
			// return false;

			// fill details of fields
			this.title = data.title;
			this.content = data.content;
			this.section = data.section;
			this.subtitle = data.subtitle;
			this.video_url = data.video_url;
			this.images = data.images;
			this.other_listing_arr = data.other_listing_arr;
			this.other_group_listing_arr = data.other_group_listing_arr;

			// pre filling details of form group
			this.editContentForm.patchValue({
				id: data.id,
				section: data.section,
				title: data.title,
				subtitle: data.subtitle,
				content: data.content,
				section_status: data.section_status,
				video_url: data.video_url
			});


			// remove all fields up front with value as null
			if (this.subtitle == null)
			{
				this.editContentForm.removeControl('subtitle');		// remove subtitle field
			}
			if (this.video_url == null)
			{
				this.editContentForm.removeControl('video_url');	// remove video field
			}
			if (this.content == null)
			{
				this.editContentForm.removeControl('content');		// remove content field
			}
			if (this.images.length == 0)
			{
				this.editContentForm.removeControl('images');		// remove images field
			}
			if (this.other_listing_arr.length == 0)
			{
				this.editContentForm.removeControl('other_listing_arr');	// remove other list field
			}
			if (this.other_group_listing_arr.length == 0)
			{
				this.editContentForm.removeControl('other_group_listing_arr');	// remove other group list field
			}


			// add Field for every other_list
			if (data.other_listing_arr && data.other_listing_arr.length > 0)
			{
				data.other_listing_arr.forEach(val =>
				{
					console.log('\nAdd Field Value - addFieldValue()\n')
					this.addFieldValue(val.list);
				});
			}

			// add group field for every other group field
			if (data.other_group_listing_arr && data.other_group_listing_arr.length > 0)
			{
				data.other_group_listing_arr.forEach((element, index) =>
				{
					console.log('\nAdd Group Field Values\n')
					this.addGroupFieldValues(element, index);
				});

			}


		});
		// API Request ends
	}
	// ngOnInit() ends



	get other_listing_list(): FormArray
	{
		return this.editContentForm.get("other_listing_arr") as FormArray
	}

	addFieldValue(list = null)
	{
		this.other_listing_list.push(this.newList(list));
	}

	newList(list): FormGroup
	{
		return this.formBuilder.group({
			list: list
		})
	}

	// returns the key's value of the editContentForm as an array
	get other_group_listing_list(): FormArray
	{
		// console.log('-------- Edit Content Form - other_group_listing_list() --------', this.editContentForm)
		return this.editContentForm.get("other_group_listing_arr") as FormArray
	}

	addGroupFieldValues(obj, index)
	{

		// multiChoice is a 2D array containing title and subtitle of different titles
		// Eg: this.multiChoice = [[title, subtitle], [title, subtitle]]
		this.multiChoice[index] = obj.multiChoice;
		this.other_group_listing_list.push(this.newGroupList(obj.title, obj.imageUrl, obj.multiChoice));
		obj.multiChoice.forEach(element =>
		{
			if (element)
			{
				console.log('inside Function')
				this.listImage[index] = obj.imageUrl.path;
				this.addNewChoice(index, element);
			}

		});
	}


	// returns the form group filled with title, imageURL and multichoiceList
	newGroupList(title, imageUrl, list): FormGroup
	{
		if (title && imageUrl && list.length > 0)
		{
			return this.formBuilder.group({
				title: [title, Validators.required],
				imageUrl: [imageUrl.id],
				multiChoice: this.formBuilder.array([])
			})
		} else
		{
			return this.formBuilder.group({
				title: ['', Validators.required],
				imageUrl: [''],
				multiChoice: this.formBuilder.array([])
			})
		}

	}

	addBlockList()
	{
		let newChoiceList = { choice: '' };
		this.other_group_listing_list.push(this.formBuilder.group({
			title: [null, Validators.required],
			imageUrl: [null],
			multiChoice: this.formBuilder.array([this.newChoice(null)])
		}));

		console.log('Add Block List(): ', this.editContentForm)
	}

	multichoice(listIndex): FormArray
	{
		// console.log('List Index: ', listIndex)
		//console.log('\n\n\nMultichoice: ', this.editContentForm.get("other_group_listing_arr")['at'](listIndex))
		return this.editContentForm.get("other_group_listing_arr")['at'](listIndex).get('multiChoice') as FormArray;
	}

	newChoice(choice = null): FormGroup
	{
		return this.formBuilder.group({
			choice: [choice, Validators.required]
		})
	}

	addNewChoice(index = null, choice = null)
	{
		this.multichoice(index).push(this.newChoice(choice.choice));
		console.log('222222')
	}




	/**
	 * api hit with form's updated values
	*/
	saveEditValue()
	{
		console.log(this.editContentForm)
		console.log('\n\n\nValidity: ', this.editContentForm.invalid)
		if (this.editContentForm.invalid)
		{
			return false;	// return if invalid 
		}

		this.spinner.show();
		//this.disableSubmitButton=true;
		this.adminServices.saveStepSectionData('step0', this.editContentForm.value)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.response = result;
				this.spinner.hide();	//hide spinner
				this.disableSubmitButton = false;	//enable submit button

				this.router.navigate(['/admin/cms/step0']);
			});
		console.log(this.editContentForm.value);
	}



	AddChoiceList(j)
	{
		this.multichoice(j).push(this.newChoice(''));
	}

	deleteChoiceList(mainIndex, index)
	{
		this.multichoice(mainIndex).removeAt(index);
	}


	deleteFieldValue(index)
	{
		this.other_listing_list.removeAt(index);
	}
	RemoveListGroup(index)
	{
		this.listImage.splice(index, 1);
		this.other_group_listing_list.removeAt(index);
	}

	async imageChangefun(event, section, imageArrayIndex, imageId = null)
	{
		if(!await this.commonServices.handleFile(event)) {
			return;
		}
		this.spinner.show();
		const reader = new FileReader();
		if (event.target.files && event.target.files.length)
		{
			const [file] = event.target.files;
			reader.readAsDataURL(file);
			reader.onload = () =>
			{
				this.imageSrc = reader.result as string;
				this.adminServices.uploadAnlImage(this.imageSrc)
					// .pipe(
					// 	catchError(err =>
					// 	{
					// 		this.spinner.hide();//hide spinner
					// 		return throwError(err);
					// 	})
					// )
					.then(({ data }: any) =>
					{
						this.listImage[imageArrayIndex] = data.image;
						((this.editContentForm.controls['other_group_listing_arr'] as FormArray).at(imageArrayIndex) as FormGroup).get('imageUrl').patchValue(data.id)
						console.log('>>>>Controls>>>>>>>>>>>>>>>>>>>>>>>>>>>', this.editContentForm)

						//  this.other_group_listing_list['at'][imageArrayIndex].patchValue({
						//   imageUrl: data.id
						// });
						console.log("\n\n\nImage Change Function: ", this.editContentForm);
						this.spinner.hide();
					});
			};
		} else
		{
			this.spinner.hide();
			return throwError('Something went wrong!');
		}
	}




	backButton()
	{
		this.router.navigate(['/admin/cms/step0']);
	}



}