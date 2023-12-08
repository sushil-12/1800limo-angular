import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormBuilder, FormGroup, FormArray, FormControl, Validator, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { CommonService } from 'src/app/services/common.service';

@Component({
	selector: 'app-home-page-edit',
	templateUrl: './home-page-edit.component.html',
	styleUrls: ['./home-page-edit.component.scss']
})
export class HomePageEditComponent implements OnInit
{
	public heading: string;
	public editHomePageContentForm: FormGroup;
	public pageID: string;
	public title: any;
	public subtitle: any;
	public content: any;
	public video_url: any;
	public section_status: boolean;
	public other_listing_arr: Array<any> = [];
	public slider_type_content: Array<any> = [];
	public slider_type_content_arr: Array<any> = [];
	public other_group_listing_arr: Array<any> = [];
	public title_content_list: Array<any> = [];
	public title_content_list_arr: Array<any> = [];
	public imageArray: Array<any> = [];
	public imagesArray: Array<any> = [];
	public imageSrc: string;
	public imagesRecords: Array<any> = [];

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private adminServices: AdminService,
		private commonServices: CommonService,
		private spinner: NgxSpinnerService
	) { }

	ngOnInit(): void
	{
		this.spinner.show();

		this.editHomePageContentForm = this.fb.group({
			id: [this.pageID, Validators.required],
			title: ['', Validators.required],
			subtitle: ['', Validators.required],
			content: ['', Validators.required],
			images: this.fb.array([]),
			section_status: ['', Validators.required],
			video_url: ['', Validators.required],
			other_listing_arr: this.fb.array([]),
			title_content_list_arr: this.fb.array([]),
			other_group_listing_arr: this.fb.array([]),
			slider_type_content: this.fb.array([])
		})
		const pageUrl = this.router.parseUrl(this.router.url);
		this.pageID = pageUrl.root.children.primary.segments[4].path;
		//Get Section data
		this.adminServices.getSingleSectionHomePage(this.pageID).pipe(
			catchError(err =>
			{
				return throwError(err);
			})
		).subscribe(({ data }: any) =>
		{
			console.log('\n\n\n --------------------------------------------- ')
			console.log('\n Backend Response :  ', data)
			console.log('\n\n --------------------------------------------------- \n\n')
			this.editHomePageContentForm.patchValue({
				id: data.id,
				title: data.title,
				subtitle: data.subtitle,
				content: data.content,
				section_status: data.section_status,
				//images : data.images
			})
			this.heading = "Edit Home Page Section - " + data.title;
			this.title = data.title;
			this.subtitle = data.subtitle;
			this.content = data.content;
			this.section_status = data.section_status;
			this.other_listing_arr = data.other_listing_arr;
			this.title_content_list = data.title_content_list_arr;
			this.other_group_listing_arr = data.other_group_listing_arr;
			this.slider_type_content = this.slider_type_content_arr = data.slider_type_content;
			this.video_url = data.video_url;

			if (data.other_listing_arr && data.other_listing_arr.length > 0)
			{
				data.other_listing_arr.forEach(val =>
				{
					this.addFieldValue(val.list);
				});
			}

			if (data.images && data.images.length > 0)
			{
				data.images.forEach((element, index) =>
				{
					this.addImageValue(element);
				});
			}

			if (data.slider_type_content && data.slider_type_content.length > 0)
			{
				data.slider_type_content.forEach(element =>
				{
					this.addSliderContentFieldValue(element);
				});
			}

			if (data.title_content_list_arr && data.title_content_list_arr.length > 0)
			{
				data.title_content_list_arr.forEach(element =>
				{
					this.addTitleContentValue(element);
				});
			}


			//remove contorl
			if (this.subtitle == null || this.subtitle === '')
			{
				this.editHomePageContentForm.removeControl('subtitle');
			}
			if (this.video_url == null)
			{
				this.editHomePageContentForm.removeControl('video_url');
			}
			if (this.content == null)
			{
				this.editHomePageContentForm.removeControl('content');
			}
			if (this.imagesRecords.length == 0)
			{
				this.editHomePageContentForm.removeControl('images');
			}
			if (this.other_listing_arr.length == 0)
			{
				this.editHomePageContentForm.removeControl('other_listing_arr');
			}
			if (this.title_content_list.length == 0)
			{
				this.editHomePageContentForm.removeControl('title_content_list_arr');
			}
			if (this.other_group_listing_arr.length == 0)
			{
				this.editHomePageContentForm.removeControl('other_group_listing_arr');
			}
			if (this.slider_type_content_arr.length == 0)
			{
				this.editHomePageContentForm.removeControl('slider_type_content');
			}
			this.spinner.hide();
		})




	}


	get other_listing_list(): FormArray
	{
		return this.editHomePageContentForm.get("other_listing_arr") as FormArray
	}
	addFieldValue(list = null)
	{
		this.other_listing_list.push(this.newList(list));
	}
	newList(list): FormGroup
	{
		return this.fb.group({
			list: list
		})
	}
	deleteFieldValue(index)
	{
		this.other_listing_list.removeAt(index);
	}

	//images upload
	get multipleImages(): FormArray
	{
		return this.editHomePageContentForm.get('images') as FormArray
	}
	addImageValue(imageData = null)
	{
		if (imageData != null)
		{
			this.imagesRecords.push(imageData.path);
			return this.multipleImages.push(new FormControl(imageData.id, Validators.required))
		}
		else
		{
			this.imagesRecords.push(null);
			return this.multipleImages.push(new FormControl())
		}

	}
	f()
	{
		return this.editHomePageContentForm.controls;
	}

	deleteImage(index)
	{
		this.imagesArray.splice(index, 1);
		this.multipleImages.removeAt(index);
	}
	//title content type data
	get title_content_list_list(): FormArray
	{
		return this.editHomePageContentForm.get('title_content_list_arr') as FormArray;
	}
	addTitleContentValue(titleContent = null)
	{
		this.title_content_list_list.push(this.newTitleContentControl(titleContent));
	}

	deleteTitleContentValue(index)
	{
		this.title_content_list_list.removeAt(index);
	}

	newTitleContentControl(titleContent): FormGroup
	{

		if (titleContent != null)
		{
			return this.fb.group({
				title: [titleContent.title, Validators.required],
				content: [titleContent.content, Validators.required]
			})
		} else
		{
			return this.fb.group({
				title: ['', Validators.required],
				content: ['', Validators.required]
			})
		}
	}

	//slider type content
	get slider_type_content_list(): FormArray
	{
		return this.editHomePageContentForm.get('slider_type_content') as FormArray;
	}

	addSliderContentFieldValue(slideData = null)
	{
		this.slider_type_content_list.push(this.newSlide(slideData));
	}

	newSlide(slideData): FormGroup
	{

		if (slideData != null)
		{
			this.imageArray.push(slideData.image.path);
			return this.fb.group({
				title: [slideData.title, Validators.required],
				content: [slideData.content, Validators.required],
				image: [slideData.image.id],
			})
		} else
		{
			return this.fb.group({
				title: ['', Validators.required],
				content: ['', Validators.required],
				image: [''],
			})
		}
	}

	deleteSlide(index)
	{
		console.log(index);
		this.imageArray.splice(index, 1);
		this.slider_type_content_list.removeAt(index);
	}




	showImageInModal(imageUrl)
	{
		console.log(imageUrl)
	}


	backButton()
	{
		this.router.navigate(['/admin/cms/home-page']);
	}

	get formControlsValue()
	{
		return this.editHomePageContentForm.controls;
	}

	async DynamicImageChange(event, section, imageArrayIndex, imageId = null)
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
					//     catchError(err => {
					//       this.spinner.hide();//hide spinner
					//       return throwError(err);
					//     })
					// )
					.then(({ data }: any) =>
					{
						if (section == 'clientLogo')
						{
							this.imagesRecords[imageArrayIndex] = data.image;
							this.editHomePageContentForm.controls['images'].value[imageArrayIndex] = data.id;
							// this.multipleImages.push(new FormControl(data.id))
						} else if (section == 'sliderImages')
						{
							this.imageArray[imageArrayIndex] = data.image;
							this.editHomePageContentForm.controls['slider_type_content'].value[imageArrayIndex].image = data.id;
						}
						this.spinner.hide();//hide spinner
					});
			};
		} else
		{
			this.spinner.hide();//hide spinner
			return throwError('Something went wrong!');
		}
	}


	saveHomePageSection()
	{
		if (this.editHomePageContentForm.invalid)
		{
			return;
		}
		if (this.editHomePageContentForm.status == "VALID")
		{
			this.adminServices.saveDataHomePageSection(this.editHomePageContentForm.value).pipe(
				catchError(err =>
				{
					return throwError(err);
				})
			).subscribe(({ data }: any) =>
			{
				this.router.navigate(['/admin/cms/home-page'])
			})
		}

	}
}
// class ends
