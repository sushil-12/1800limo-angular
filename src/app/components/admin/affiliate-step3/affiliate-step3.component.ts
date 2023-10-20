import { Component, EventEmitter, Input, OnInit, AfterViewInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { StateManagementService } from '../../../services/statemanagement.service';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { formatDate } from '@angular/common';
import { CustomvalidationService } from '../../../services/customvalidation.service';
declare var $: any;

@Component({
	selector: 'app-affiliate-step3',
	templateUrl: './affiliate-step3.component.html',
	styleUrls: ['./affiliate-step3.component.scss']
})
export class AffiliateStep3Component implements OnInit {

	public imageSrc: string;
	public addInsuranceForm: FormGroup;
	public submittedForm: boolean;
	public disableSubmitButton: boolean = false;
	public affiliateId: string;
	public AgentTelephoneObject: any;
	public currentUser: any;

	public insCertificateImage: string;
	public insuranceCardImage: string;
	public insCertificateId: string;
	public insuranceCardId: string;
	public currentDate: string;
	public modalImage: string;
	public affiliate_type: string;
	public policyExpiredDay: Array<number> = [];
	public policyExpiredYear: Array<number> = [];

	@Input() closeTab: EventEmitter<any> = new EventEmitter();
	stepsObj: any;
	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private stateManagementService: StateManagementService,
		private formBuilder: FormBuilder,
		private customValidator: CustomvalidationService) { }

	ngAfterViewInit() {
		//set current user country as default in phone number
		this.AgentTelephoneObject.setCountry(this.currentUser.CellNumberCountry);
	}
	ngOnInit(): void {
		this.stepsObj = JSON.parse(sessionStorage.getItem('step_completed_obj'));
		for (let [key, value] of Object.entries(this.stepsObj)) {
			if (key == 'step2' && value == 'uncompleted') {

				$('#errorModal').modal('show')
			}
		}
		//show "stripe can take upto 24 hours" modal on first time completing step 2
		const showStripe24HourAlert = sessionStorage.getItem("showStripe24HourAlert");
		if (showStripe24HourAlert == 'yes') {
			$('#showStripe24HourAlert').modal('show');
			sessionStorage.removeItem("showStripe24HourAlert");
		}

		this.currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');

		this.currentUser = JSON.parse(sessionStorage.getItem("affiliateUserData"));
		this.affiliate_type = this.currentUser.AffiliateType;
		this.affiliateId = sessionStorage.getItem('affiliateId');
		const stepCompleted = this.adminService.getLocalStepsCompleted();

		let currentYear: number = (new Date()).getFullYear();
		//days
		for (let i = 1; i <= 31; i++) {
			this.policyExpiredDay.push(i);
		}
		//year
		let temp = 0;
		while (temp < 50)//max 50 year future
		{
			this.policyExpiredYear.push(currentYear);
			currentYear++;
			temp++;
		}

		//add insurance form validation
		this.addInsuranceForm = this.formBuilder.group({
			id: [''],//insurance id for edit purpose
			acc_id: [this.affiliateId, Validators.required],//affiliate account id
			CompanyName: ['', Validators.required],
			AgentName: [''],
			stepCompleted: [''],
			AgentTelephone: ['', [Validators.required, Validators.pattern("^[0-9]*$"), Validators.minLength(4), Validators.maxLength(15), this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			AgentTelephoneIsd: ['+1', Validators.required],
			AgentTelephoneCountry: ['us', Validators.required],
			policyNumber: ['', [Validators.required, this.customValidator.dashValidator(), this.customValidator.plusValidator()]],
			policyExpiredDay: ['', Validators.required],
			policyExpiredMonth: ['', Validators.required],
			policyExpiredYear: ['', Validators.required],
			insuranceLimits: ['', Validators.required],
			AgentEmail: ['', [Validators.pattern("^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$")]],
			insCertificate: ['', Validators.required],
			insuranceCard: ['', Validators.required],
		});
		// , { validator: this.customValidationFunction }

		if (this.affiliateId) {
			if (stepCompleted.includes('3')) {
				// get data for editing using API
				// this.stateManagementService.setprogressBar(true);
				this.adminService.getInsuranceDetail(this.affiliateId)
					.pipe(
						catchError(err => {
							// this.stateManagementService.setprogressBar(false);
							return throwError(err);
						})
					).subscribe(({ data }: any) => {
						// this.stateManagementService.setprogressBar(false);
						this.insCertificateImage = data.insCertificate.image;
						this.insuranceCardImage = data.insuranceCard.image;

						this.insCertificateId = data.insCertificate.ID;
						this.insuranceCardId = data.insuranceCard.ID;

						this.addInsuranceForm.patchValue({
							id: data.id,
							insCertificate: data.insCertificate.ID,
							insuranceCard: data.insuranceCard.ID,
							CompanyName: data.CompanyName,
							AgentName: data.AgentName,
							AgentTelephone: data.AgentTelephone,
							AgentTelephoneIsd: data.AgentTelephoneIsd,
							policyNumber: data.policyNumber,
							policyExpiredDay: data.policyExpiredDay,
							policyExpiredMonth: data.policyExpiredMonth,
							policyExpiredYear: data.policyExpiredYear,
							insuranceLimits: data.insuranceLimits,
							AgentEmail: data.AgentEmail,
						});
						this.AgentTelephoneObject.setCountry(data.AgentTelephoneCountry);
					});
			}
			else {
				var dateobj = new Date();
				var month = dateobj.getMonth() + 1;
				var day = dateobj.getDate();
				var year = dateobj.getFullYear();
				console.log(month, day, year);
				this.addInsuranceForm.patchValue({
					policyExpiredDay: '31',
					policyExpiredMonth: '12',
					policyExpiredYear: year.toString()
				});
			}
		}
	}

	closeButton() {
		this.closeTab.emit();
	}

	customValidationFunction(group): any {
		if (group) {
			var currentDate = formatDate(new Date(), 'yyyy-MM-dd', 'en');
			console.log(currentDate)
			if (!group.controls['policyExpiredDay'].value ||
				!group.controls['policyExpiredMonth'].value ||
				!group.controls['policyExpiredYear'].value) {
				return null;
			}
			const enteredDate = group.controls['policyExpiredYear'].value + '-' + group.controls['policyExpiredMonth'].value + '-' + group.controls['policyExpiredDay'].value;
			console.log(currentDate, enteredDate)
			if(!new Date(enteredDate).getTime()){
				return { 'InvalidDate':true};
			}
			if (new Date(enteredDate).getTime() >= new Date(currentDate).getTime()) {
				return null;
			}
			
		}
		return { 'policyError': true };
	}

	onCountryChange(event, type) {
		if (type == 'AgentTelephone') {
			this.addInsuranceForm.patchValue({
				AgentTelephoneIsd: '+' + event.dialCode,
				AgentTelephoneCountry: event.iso2
			});
		}
	}
	telInputObjectAgentTelephone(obj) {
		this.AgentTelephoneObject = obj;
	}
	fetchImageBlob(url ,key ,id){
		this.stateManagementService.setprogressBar(true);
		
		this.adminService.fetchImageBlob(url)
		.pipe(
			catchError(err => {
				this.stateManagementService.setprogressBar(false);
				return throwError(err);
			})
		)
		.subscribe(async({ data }: any) => {
			this.stateManagementService.setprogressBar(false);
			const response = await fetch(data);
			const imageBlob = await response.blob()
			console.log('imageBlob',imageBlob)
		const canvas = document.createElement("canvas");
		const ctx = canvas.getContext("2d");
		const img = new Image();
		img.src = URL.createObjectURL(imageBlob);
		console.log('img-->' , img)
		img.onload = () => {
			// Rotate the image by 90 degrees (or your desired angle)
			canvas.width = img.width; 
			canvas.height = img.height;
			ctx.translate(canvas.width / 2, canvas.height / 2);
			ctx.rotate(Math.PI); // Rotate by 180 degrees
			ctx.drawImage(img, -img.width / 2, -img.height / 2);
			// ctx.drawImage(img, 0, -canvas.width);

			// Convert the canvas to a Blob (JPEG format)
			canvas.toBlob((blob) => {
				console.log(blob);

				this.blobToDataURL(blob, key ,id);
				// });
			}, "image/jpeg");
		}
		})
	}
	blobToDataURL(blob: Blob , key , id) {
		var reader = new FileReader();
		reader.readAsDataURL(blob);
		reader.onload = () => {
			let dataUrl = reader.result;
			console.log(dataUrl); //DataURL
			this.vehicleOfficialImagesChange1(dataUrl, key,id);
		};
	}


	vehicleOfficialImagesChange1(imageUrl, imageType, imageId)
	{
		this.stateManagementService.setprogressBar(true);
		
				this.imageSrc = imageUrl;
				this.adminService.uploadVehicleImage(this.imageSrc)
					.pipe(
						catchError(err => {
							this.stateManagementService.setprogressBar(false);
							return throwError(err);
						})
					)
					.subscribe(({ data }: any) => {

						switch (imageType) {
							case 'insCertificate': {
								this.addInsuranceForm.patchValue({
									insCertificate: data.id,
								});
								this.insCertificateImage = data.image;
								this.insCertificateId = data.id;
								break;
							}
							case 'insuranceCard': {
								this.addInsuranceForm.patchValue({
									insuranceCard: data.id,
								});
								this.insuranceCardImage = data.image;
								this.insuranceCardId = data.id;
								break;
							}
							default: {
								break;
							}
						}
						this.stateManagementService.setprogressBar(false);
					});
	}

	vehicleOfficialImagesChange(event, imageType, imageId) {
		// this.stateManagementService.setprogressBar(true);
		const reader = new FileReader();
		if (event.target.files && event.target.files.length) {
			const [file] = event.target.files;
			reader.readAsDataURL(file);
			reader.onload = () => {
				this.imageSrc = reader.result as string;
				this.adminService.uploadVehicleImage(this.imageSrc)
					.pipe(
						catchError(err => {
							// this.stateManagementService.setprogressBar(false);
							return throwError(err);
						})
					)
					.subscribe(({ data }: any) => {

						switch (imageType) {
							case 'insCertificate': {
								this.addInsuranceForm.patchValue({
									insCertificate: data.id,
								});
								this.insCertificateImage = data.image;
								this.insCertificateId = data.id;
								break;
							}
							case 'insuranceCard': {
								this.addInsuranceForm.patchValue({
									insuranceCard: data.id,
								});
								this.insuranceCardImage = data.image;
								this.insuranceCardId = data.id;
								break;
							}
							default: {
								break;
							}
						}
						// this.stateManagementService.setprogressBar(false);
					});
			};
		}
	}

	deleteImage(id, imageType) {
		switch (imageType) {
			case 'insCertificate': {
				this.addInsuranceForm.patchValue({
					insCertificate: '',
				});
				this.insCertificateImage = '';
				break;
			}
			case 'insuranceCard': {
				this.addInsuranceForm.patchValue({
					insuranceCard: '',
				});
				this.insuranceCardImage = '';
				break;
			}
			default: {
				break;
			}
		}
	}

	showImageInModal(imageUrl) {
		this.modalImage = imageUrl;
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
	}

	get f() {
		return this.addInsuranceForm.controls;
	}

	submitForm() {
		if (this.affiliate_type != 'fleet_operator') {
			console.log("set validation on field")
			this.addInsuranceForm.get('insuranceCard').setValidators([Validators.required]);
		} else {
			console.log("enter in conditions")
			this.addInsuranceForm.get('insuranceCard').clearValidators();
			this.addInsuranceForm.get('insuranceCard').updateValueAndValidity();
		}
		console.log(this.addInsuranceForm);
		this.submittedForm = true;
		// stop here if form is invalid
		if (this.addInsuranceForm.invalid) {
			return;
		}
		this.addInsuranceForm.value.stepCompleted =
			this.adminService.getUpdatedStepsLocal("3");
		this.spinner.show();
		this.disableSubmitButton = true; //disable submit button

		this.adminService.addInsuranceDetail(this.addInsuranceForm.value)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					this.disableSubmitButton = false; //enable submit button
					return throwError(err);
				})
			)
			.subscribe((success: any) => {
				this.spinner.hide();//hide spinner
				this.disableSubmitButton = false; //enable submit button

				if (success.success == true) {
					this.adminService.updateStepsLocal("3");
				}


				this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
					this.router.navigate(['/admin/affiliate/step4'])
				);
			});
	}

	resetForm() {
		// this.addInsuranceForm.reset();
		this.addInsuranceForm.patchValue({
			CompanyName: '',
			AgentName: '',
			AgentTelephone: '',
			policyNumber: '',
			policyExpiredDay: '',
			policyExpiredMonth: '',
			policyExpiredYear: '',
			insuranceLimits: '',
			AgentEmail: '',
		})
		this.insCertificateImage = "";
		this.insuranceCardImage = "";
	}
}
