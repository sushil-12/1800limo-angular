import { Component, ElementRef, EventEmitter, Input, OnInit, ViewChild } from '@angular/core';
import { AffiliateService } from '../../../services/affiliate.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { StateManagementService } from '../../../services/statemanagement.service';
declare var $:any;

@Component({
	selector: 'app-step6',
	templateUrl: './step6.component.html',
	styleUrls: ['./step6.component.scss']
})
export class Step6Component implements OnInit {

	Step6Form: FormGroup
	public src: string;
	public clearMe = false;
	public affiliateId: string;
	public modalImage: string;
	public stepCompleted: string;
	public submittedForm: boolean;
	public signatureImg: string;
	public signature_id: string;
	public response: any;
	public signatureImage: boolean;

	// show/hide content variables
	main_content: string
	section_content: string
	account_approval:string = localStorage.getItem('account_approval') || ''


	// array variables
	step6Data: Array<any> = []
	@Input() closeTab: EventEmitter<any> = new EventEmitter();
	constructor(
		private affiliateService: AffiliateService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private stateManagementService: StateManagementService,
	) { }

	ngOnInit(): void {
		$('.HeadingH1').css({display: "block"})
		this.fetchStep6Data();

		this.affiliateService.getSignatureImage().subscribe((response: any) => {
			this.signatureImg = response.signature_url;
			console.log("check response", this.signatureImg)
		})



		// ----------------------------------------------- canvas -------------------------------------------------

		// var canvas = this.signature_pad.nativeElement

		// 		// Adjust canvas coordinate space taking into account pixel ratio,
		// 		// to make it look crisp on mobile devices.
		// 		// This also causes canvas to be cleared.
		// 		function resizeCanvas() {
		// 			// When zoomed out to less than 100%, for some very strange reason,
		// 			// some browsers report devicePixelRatio as less than 1
		// 			// and only part of the canvas is cleared then.
		// 			var ratio =  Math.min(window.devicePixelRatio || 1, 1);
		// 			canvas.width = canvas.offsetWidth * ratio;
		// 			canvas.height = canvas.offsetHeight * ratio;
		// 			canvas.getContext("1d").scale(ratio, ratio);
		// 		}

		// 		window.onresize = resizeCanvas;
		// 		resizeCanvas();

		// 		var signaturePad = new SignaturePad(canvas, {
		// 		backgroundColor: 'rgb(143, 156, 55)' // necessary for saving image as JPEG; can be removed is only saving as PNG or SVG
		// 		});

		// 		document.getElementById('save-png').addEventListener('click', function () {
		// 		if (signaturePad.isEmpty()) {
		// 			return alert("Please provide a signature first.");
		// 		}

		// 		var data = signaturePad.toDataURL('image/png');
		// 		console.log(data);
		// 		window.open(data);
		// 		});

		// 		document.getElementById('clear').addEventListener('click', function () {
		// 		signaturePad.clear();
		// 		});

		// 		document.getElementById('draw').addEventListener('click', function () {
		// 		var ctx = canvas.getContext('2d');
		// 		console.log(ctx.globalCompositeOperation);
		// 		ctx.globalCompositeOperation = 'source-over'; // default value
		// 		});








		// ------------------------------------------------------------ canvas ends ------------------------------------s
	}

	signature(signatureImage) {
		switch (signatureImage) {
			case 'digitalSign': {
				this.signatureImage = false;
				break;
			}
			case 'uploadSign': {
				this.signatureImage = true;
				break;
			}
		}
	}

	srcChange(src) {
		this.src = src;

		console.log(this.src, "image preview")
	}

	clear() {
		this.clearMe = !this.clearMe;
	}

	// save()
	// {
	// 	this.signing = false;
	// }

	fetchStep6Data() {
		this.spinner.show()

		this.affiliateService.fetchStepData('step6')
			.pipe(
				catchError(err => {
					this.spinner.hide()
					console.log('Facing Issues while fetching data -> [fetchStep6Data()] ----', err)
					return throwError(err)
				})
			).subscribe(({ data }: any) => {
				this.spinner.hide()
				console.log('\n\n\n ------------------------------------ \n')
				console.log('\n Receiving Response from Backend .....', data)
				console.log('\n ------------------------------------ \n\n\n')
				this.step6Data = this.generateStep6Content(data)
				// this.step6Data = data

			})
	}
	signImageChange(event, imageType, imageId = null) {
		this.stateManagementService.setprogressBar(true);
		const reader = new FileReader();
		if (event.target.files && event.target.files.length) {
			const [file] = event.target.files;
			reader.readAsDataURL(file);
			reader.onload = () => {
				this.signatureImg = reader.result as string;
				this.affiliateService.uploadVehicleImage(this.signatureImg)
					.pipe(
						catchError(err => {
							this.stateManagementService.setprogressBar(false);
							return throwError(err);
						})
					)
					.subscribe(({ data }: any) => {

						switch (imageType) {
							case 'signatureImg': {
								this.signatureImg = data.image;
								this.signature_id = data.ID;
								break;
							}
							default: {
								break;
							}
						}
						this.stateManagementService.setprogressBar(false);
					});
			};
		}
	}

	deleteImage(id, imageType) {
		switch (imageType) {
			case 'signatureImg': {

				this.signatureImg = '';
				break;
			}
			default: {
				break;
			}
		}
	}

	showImageInModal(imageUrl) {
		console.log("enter in image modal", imageUrl)
		this.modalImage = imageUrl;
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
	}

	closeButton() {
		this.closeTab.emit();
	}

	submitForm() {

		this.spinner.show();
		const currentUser = JSON.parse(localStorage.getItem("currentUser"));
		this.affiliateId = currentUser.account_id;

		let stepCompleted = this.affiliateService.getUpdatedStepsLocal('6');
		var obj = {
			acc_id: this.affiliateId,
			Accept: true,
			stepCompleted: stepCompleted
		};
		/*
		!this.signatureImage && this.affiliateService.uploadVehicleImage(this.src).subscribe((response: any) =>
		{
			this.signatureImg = response.data.image;
			console.log(response, "check responsee")
			obj['signature_id'] = response.data.ID
			console.log(obj)
			this.affiliateService.affiliateTermsAccept(obj)
				.pipe(
					catchError(err =>
					{
						this.spinner.hide();//hide spinner
						console.error('Facing Error: ', err)
						if (err.otherParams.step)
						{
							this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
							{
								this.router.navigate(['/affiliate/step' + err.otherParams.step]);
							});
						}
						return throwError(err);
					})
				)
				.subscribe(({ success }: any) =>
				{
					this.spinner.hide();//hide spinner

					if (success == true)
					{
						this.affiliateService.updateStepsLocal('6');
						localStorage.setItem('account_approval', 'completed');
					}
					this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
						this.router.navigate(['/affiliate/account-status'])
					);
				});
		})*/

		// obj['signature_id'] = this.signature_id
		this.affiliateService.affiliateTermsAccept(obj)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					console.error('Facing Error: ', err)
					if (err.otherParams.step) {
						this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
							this.router.navigate(['/affiliate/step1']);
						});
					}
					return throwError(err);
				})
			)
			.subscribe(({ success }: any) => {
				this.spinner.hide();//hide spinner

				if (success == true) {
					this.affiliateService.updateStepsLocal('6');
					localStorage.setItem('account_approval', 'completed');
					
				}
				
				// this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
				// 	this.router.navigate(['/affiliate/account-status'])
				// );
			});
			$('#thankYouModal').modal('show')
	}
	thankYouModalButton(){
		this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
					this.router.navigate(['/affiliate/account-status'])
				);
	}


	generateStep6Content(data: any) {
		// if (data.other_listing_arr != null && data.other_listing_arr.length > 0)
		// {
		// 	data.other_listing_arr.forEach((item) =>
		// 	{
		// 		return item.replace(/(\")/g, '"')
		// 	})
		// }

		// console.log(data)
		return data
		// data.forEach((object: any) =>
		// {
		// 	if (data.id == 24)
		// 	{
		// 		this.main_content = data.content
		// 	}
		// 	if (data.id == 25)
		// 	{

		// 	}
		// })
	}
}
