import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder, FormArray, FormControl, Validators } from '@angular/forms';
import { CommonService } from 'src/app/services/common.service';
@Component({
	selector: 'app-about-us-edit',
	templateUrl: './about-us-edit.component.html',
	styleUrls: ['./about-us-edit.component.scss']
})
export class AboutUsEditComponent implements OnInit
{
	public heading: any;
	public title: any;
	public sectionUrl: any;
	public video_url: any;
	public subtitle: any;
	public content: any;
	public title_content_list_arr: Array<any> = [];
	public images_data: Array<any> = [];
	public imageSrc: any;
	public imageArray: any;
	public timelineSlider: Array<any> = [];
	public imagesRecords: Array<any> = [];
	public other_group_listing_arr: Array<any> = [];
	public disableSubmitButton: any;
	public response: any;
	timeline_images: Array<any> = []
	submittedForm:boolean;


	public editAboutUsForm: FormGroup;
	constructor(
		private fb: FormBuilder,
		private adminServices: AdminService,
		private route: Router,
		private commonServices: CommonService,
		private spinner: NgxSpinnerService
	) { }

	ngOnInit(): void
	{
		this.spinner.show();
		this.heading = "About Us Page";


		const getUrl = this.route.parseUrl(this.route.url);
		this.sectionUrl = getUrl.root.children.primary.segments[4].path;

		this.editAboutUsForm = this.fb.group({
			id: [this.sectionUrl,],
			title: ['',],
			subtitle: ['',],
			video_url: ['',],
			content: ['',],
			section_status: ['',],
			images: this.fb.array([]),
			timeline_slider: this.fb.array([]),
			title_content_list_arr: this.fb.array([]),

		})

		this.adminServices.getAboutUsSectionDataByID(this.sectionUrl).pipe(
			catchError(err =>
			{
				this.spinner.hide()
				return throwError(err);
			})
		).subscribe(({ data }: any) =>
		{
			console.group('\n\n\nResponse from Backend: ', data)
			this.spinner.hide();
			this.editAboutUsForm.patchValue({
				id: data.id,
				section: data.section,
				title: data.title,
				subtitle: data.subtitle,
				content: data.content,
				section_status: data.section_status,
				video_url: data.video_url,
			});


			// pre fillling response values for easy global file interaction
			// mainly using for if conditions
			this.title = data.title; 		// title of the page + title of the timeline
			this.video_url = data.video_url;	// url of the video if embedded
			this.subtitle = data.subtitle;		// subtitle for the video
			// this.images_data = data.images;		// images for the timeline slider
			this.timelineSlider = data.timeline_slider;	// timeline slider images
			this.content = data.content;	// content
			this.title_content_list_arr = data.title_content_list_arr;		// title content




			/**
			 * add values into "title_content_list_arr" of form if values are fetched from backend
			 */
			if (this.title_content_list_arr && this.title_content_list_arr.length > 0)
			{
				this.title_content_list_arr.forEach(val =>
				{
					return
					this.addTitleContentControl(val)		// currently omitting as values from backend are null
				})
			}


			// not so much useful
			// if (this.images_data && this.images_data.length > 0)
			// {
			// 	data.images.forEach((element, index) =>
			// 	{
			// 		this.addImageValue(element);
			// 	});
			// }



			/**
			 * add values into "timeline_slider" of form if values are fetched from backend
			 */
			if (this.timelineSlider && this.timelineSlider.length > 0)
			{
				this.timelineSlider.forEach((element, index) =>
				{
					this.addtimelineSliderControl(element, index);	// add control in form
				})
			}



			/**
			 * remove controls of values are null. Currenly omitted 
			 */
			// if (this.subtitle == null)
			// {
			// 	this.editAboutUsForm.removeControl('subtitle');
			// }
			// if (this.video_url == null)
			// {
			// 	this.editAboutUsForm.removeControl('video_url');
			// }
			// if (this.content == null)
			// {
			// 	this.editAboutUsForm.removeControl('content');
			// }
			// if (this.images_data.length == 0)
			// {
			// 	this.editAboutUsForm.removeControl('images');
			// }

			// if (this.timelineSlider.length == 0)
			// {
			// 	this.editAboutUsForm.removeControl('timeline_slider');
			// }

			// if (this.title_content_list_arr.length == 0)
			// {
			// 	this.editAboutUsForm.removeControl('title_content_list_arr');
			// }


		})
		this.spinner.hide();
	}
	// ngOnInit ends







	get timelineSliderObj(): FormArray
	{
		// console.log(this.editAboutUsForm.get('timeline_slider') as FormArray)
		return this.editAboutUsForm.get('timeline_slider') as FormArray
	}

	addtimelineSliderControl(element: any, index: number)
	{
		this.timelineSliderObj.push(this.newTimelineSlide(element, index));
		console.log(this.editAboutUsForm, '\n\n\n\\\\\n\n\\nn\n\n\n\n\n\n\n')
	}

	imageRecordsGroupArray: Array<any> = [];
	newTimelineSlide(element: any, index = null): FormGroup
	{
		// make array for images of timeline_images for template rendering and easy pushing into form, if values fetched from backend
		if (Object.keys(element).length > 0)
		{
			this.imageRecordsGroupArray = []
			// console.log('Element [newTimelineSlide()] -> ', element);
			element.timeline_images.forEach((element: any, index1: string | number) =>
			{
				// make individual object for images of that particular timeline
				this.imageRecordsGroupArray[index1] = { id: element.id, path: element.path }
				//this.addTimelineSldierImge(element.id, index, index1);
			})
			console.log('Element, Index: ', element, index)

			// make an array similar to -> [ [id: ?, path: ?], [id: ?, path: ?] ]
			this.imagesRecords[index] = this.imageRecordsGroupArray;

			console.log('Images Records: ', this.imagesRecords)
			return this.fb.group({
				year: [element.year, Validators.required],
				title: [element.title, Validators.required],
				text: [element.text, Validators.required],
				timeline_images: this.fb.array(this.imageRecordsGroupArray)
			})
		} else
		{
			// empty timeline slide
			this.imagesRecords.push([])
			return this.fb.group({
				year: ['', Validators.required],
				title: ['', Validators.required],
				text: ['', Validators.required],
				timeline_images: this.fb.array([])
			})
		}

	}



	/**
	 * add image values into "timeline_slider -> timeline_images" of form
	 */

	imageSliderObj(listIndex: number): FormArray
	{
		// console.log(this.timelineSliderObj.at(listIndex).get('timeline_images') as FormArray)
		return this.timelineSliderObj.at(listIndex).get('timeline_images') as FormArray;
	}

	// addTimelineImage(id: any, index: any, index1: any)
	// {
	// 	this.imageSliderObj(index).push(this.newTimelineSlideImage(id, index1));
	// }

	// newTimelineSlideImage(id: any, index1: any): FormGroup
	// {
	// 	console.log('Index1: ', index1)
	// 	return this.fb.group({
	// 		index1: [id, Validators.required]
	// 	})
	// }


	addTimeline()
	{
		console.log('Adding New Timeline ...')
		this.timelineSliderObj.push(this.newTimelineSlide({}))
	}

	deleteTimeline(timeline_index: number)
	{
		console.log('Deleting Timeline at Index: ', timeline_index)
		this.timelineSliderObj.removeAt(timeline_index)
	}




	newChoice(id = null): FormGroup
	{
		return this.fb.group({
			id: [id, Validators.required]
		});
	}



	addNewTimelineImage(timeline_slide_index: number)
	{
		console.group('\n\n\n -------------------------------------------------------')
		console.log('\nAdding New Image into Timeline Slide at index: ', timeline_slide_index)
		if (timeline_slide_index >= 0)
		{
			let image_object = {
				id: null,
				path: null
			}
			this.imagesRecords[timeline_slide_index].push(image_object)
			this.imageSliderObj(timeline_slide_index).push(this.fb.group(image_object))
		}
		// {
		// 	this.images_data.push(imageData.path);
		// 	return this.multipleImages.push(new FormControl(imageData.id, Validators.required))
		// }
		// else
		// {
		// 	this.images_data.push(null);
		// 	return this.multipleImages.push(new FormControl())
		// }
	}

	backToMainPage()
	{
		this.route.navigate(['admin/cms/about-us'])
	}



	async DynamicImageChange(event: any, section: string, timeline_slide_index: number, image_index: number)
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
						if (section == 'about-us')
						{
							console.log('Response received [DynamicImageChange()] => ', data)
							let image_object = {
								id: data.id,
								path: data.image
							}

							console.group(timeline_slide_index, image_index)
							if (image_index >= 0 || image_index != null)
							{
								// update imagesRecords array for that particular index
								console.log(this.imagesRecords)

								this.imagesRecords[timeline_slide_index][image_index].path = data.image;
								this.imagesRecords[timeline_slide_index][image_index].id = data.id;

								// upadate forms's timeline_images section for that timeline_slider_index
								(this.imageSliderObj(timeline_slide_index).at(image_index) as FormGroup).get('id').patchValue(data.id);
								(this.imageSliderObj(timeline_slide_index).at(image_index) as FormGroup).get('path').patchValue(data.image);
							} else
							{
								// updating imagesRecords array
								this.imagesRecords[timeline_slide_index].push(image_object)
								console.log('\n\n\n\n\n\n', this.imagesRecords)

								// updating form's "timeline_images" array
								this.imageSliderObj(timeline_slide_index).push(this.fb.group(image_object))
								// this.images_data[imageArrayIndex] = data.image;
								// this.editAboutUsForm.controls['images'].value[imageArrayIndex] = data.id;
								// this.multipleImages.push(new FormControl(data.id))
							}
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


	saveEditValue()
	{
		// console.log(this.editAboutUsForm); return false;
		this.submittedForm = true
		// if (this.editAboutUsForm.invalid)
		// {
		// 	console.log('--------invalid form---------',this.editAboutUsForm , this.submittedForm)
		// 	return false;
		// }

		this.spinner.show();
		//this.disableSubmitButton=true;
		this.adminServices.saveDataAboutUsSection(this.editAboutUsForm.value)
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
				this.spinner.hide();//hide spinner
				this.disableSubmitButton = false; //enable submit button

				this.route.navigate(['/admin/cms/about-us']);
			});
		console.log(this.editAboutUsForm.value);
	}

	printReactiveForm()
	{
		console.log('\n\n\n\n ------------------------------------- ')
		console.group('\n\n\n ReactiveForm : ', this.editAboutUsForm)
	}

	printImagesRecords()
	{
		console.log('\n\n\n\n ------------------------------------- ')
		console.group('\n\n\n Images Records : ', this.imagesRecords)
	}








	get title_content_list_obj(): FormArray
	{
		return this.editAboutUsForm.get('title_content_list_arr') as FormArray
	}

	addTitleContentControl(titleContentArr = null)
	{
		console.log(this.editAboutUsForm)
		this.title_content_list_obj.push(this.newTitleContent(titleContentArr))
	}

	newTitleContent(titleContentArr = null): FormGroup
	{
		if (titleContentArr != null)
		{
			return this.fb.group({
				title: [titleContentArr.title, Validators.required],
				content: [titleContentArr.content, Validators.required]
			})
		} else
		{
			return this.fb.group({
				title: ['', Validators.required],
				content: ['', Validators.required]
			})
		}
	}

	deleteTitleContentValue(index)
	{
		this.title_content_list_obj.removeAt(index);
	}
}
