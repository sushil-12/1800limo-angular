import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService } from 'src/app/services/admin.service';

@Component({
	selector: 'app-affiliate-step0',
	templateUrl: './affiliate-step0.component.html',
	styleUrls: ['./affiliate-step0.component.scss']
})
export class AffiliateStep0Component implements OnInit {

	content_data: any
	public agreementValidation: boolean;
	public agreement: boolean;
	public disableSubmitButton: boolean = false;
	public stepCompleted: any;
	public Step0Information: boolean = true;
	public selectedStep: string;
	public modalImage: string;

	public vehicleList: Array<String> = [
		"Acura TLX",
		"Audi A5",
		"BMW 540i",
		"Cadillac CT6",
		"Genesis G80",
		"Honda Accord",
		"Jaguar F-Type",
		"Lexus ES",
		"Mercedes Benz E Class",
		"Toyota Camry",
		"Toyota Prius V",
		"Tesla Model 3",
		"Volvo S90"
	];
	public vehicleList1: Array<String>;
	public vehicleList2: Array<String>;

	public why1800limo: Array<String> = [
		"Enter your wholesale, all-inclusive rates for each vehicle type so travel agents and fellow operators can easily search, compare, book and share revenue",
		"Farm-outs and travel planners earn a minimum 10% commission",
		"Reduce deadheading and share rides going in the same direction to/from large crowd gatherings – airports, sports arenas and special events",
		"We are totally transparent with riders, drivers and local governments",
		"We do not share personal data with any third parties",
		"Set your own rates, schedule and accept or reject any booking",
		"You and the client see the same rates. We do not mark it up",
		"You may add up to a 20% gratuity in your profile",
		"Match or lower your all-inclusive rates with friendly competitors to keep your share of the volume",
		"Our clients know value and may hand-tip or add an additional tip when finalizing",
		"Raise or lower rates in real time depending on the season or market conditions",
		"We sell your excess capacity so you can work more efficiently",
		"We earn a 25% commission on each booking. We pay the charge card fee and the 10% on farm-outs and commission to travel planners",
		"Get paid with direct deposit in 3 to 5 business days"
	];
	public why1800limo1: Array<String>;
	public why1800limo2: Array<String>;

	modalSwitch(modalType) {
		$("#imageModal").addClass("showImage");
		$("#imageModal").removeClass("d-none");
		switch (modalType) {
			case 'step_1': {
				this.Step0Information = true;
				this.selectedStep = 'step_1';
				this.modalImage = "../../../../assets/images/step_1.png";
				break;
			}
			case 'step_2': {
				this.Step0Information = true;
				this.selectedStep = 'step_2';
				this.modalImage = "../../../../assets/images/step_2.png";
				break;
			}
			case 'step_3': {
				this.Step0Information = true;
				this.selectedStep = 'step_3';
				this.modalImage = "../../../../assets/images/step_3.png";
				break;
			}
			case 'step_4': {
				this.Step0Information = true;
				this.selectedStep = 'step_4';
				this.modalImage = "../../../../assets/images/step_4.png";
				break;
			}
			case 'step_5': {
				this.Step0Information = true;
				this.selectedStep = 'step_5';
				this.modalImage = "../../../../assets/images/step_5.png";
				break;
			}
			case 'step_6': {
				this.Step0Information = true;
				this.selectedStep = 'step_6';
				this.modalImage = "../../../../assets/images/step_6.png";
				break;
			}
		}
	}


	constructor(
		private router: Router,
		private adminService: AdminService,
		private spinner: NgxSpinnerService,
	) { }
	@Input() closeTab: EventEmitter<any> = new EventEmitter();


	ngOnInit(): void {
		const stepCompleted = this.adminService.getLocalStepsCompleted();
		if (stepCompleted.includes('0')) {
			this.agreement = true;
		}
		this.spinner.show(); //spinner show 

		this.adminService.fetchStep0Data().subscribe((data: any) => {
			this.spinner.hide(); //spinner hide
			this.content_data = data.data
			this.fetchContentData();
			const halfVehicles = Math.ceil(this.fetchContentData(4).other_listing_arr.length / 2);
			this.vehicleList1 = this.vehicleList.splice(0, halfVehicles);
			this.vehicleList2 = this.vehicleList.splice(-halfVehicles);

			const half = Math.ceil(this.fetchContentData(5).other_listing_arr.length / 2);
			this.why1800limo1 = this.why1800limo.splice(0, half);
			this.why1800limo2 = this.why1800limo.splice(-half);
		})

	}
	fetchContentData(id?: number | null) {
		if (id && this.content_data) {
			return this.content_data.find((item: any) => item.id == id)
		}
	}
	scroll(el: HTMLElement) {
		el.scrollIntoView();
	}

	closeButton() {
		this.closeTab.emit();
	}

	onCheckboxChange(e) {
		this.agreement = e.target.checked;
	}

	submitForm() {
		if (!this.agreement) {
			this.agreementValidation = true;
		}
		else {
			this.agreementValidation = false;
			this.stepCompleted = this.adminService.getLocalStepsCompleted();

			if (!this.stepCompleted.includes('0')) {
				this.adminService.getUpdatedStepsLocal('0')
				this.adminService.updateStepsLocal('0');

				//update step completed obj to change color of step icon
				let stepCompletedObj = this.adminService.getLocalStepsCompletedObj();
				stepCompletedObj.step0 = 'completed';
				this.adminService.updateStepsCompletedObj(stepCompletedObj);

				this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
					this.router.navigate(['/admin/affiliate/step1'])
				);
			}
			else {
				this.router.navigateByUrl('/', { skipLocationChange: true }).then(() =>
					this.router.navigate(['/admin/affiliate/step1'])
				);
			}
		}
	}
}
