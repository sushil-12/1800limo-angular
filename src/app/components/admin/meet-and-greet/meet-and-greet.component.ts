import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
declare var $: any;

@Component({
	selector: 'app-meet-and-greet',
	templateUrl: './meet-and-greet.component.html',
	styleUrls: ['./meet-and-greet.component.scss']
})
export class MeetAndGreetComponent implements OnInit
{
	colorToggle: ThemePalette = 'accent';
	checked = false;
	disabled = false;

	MeetAndGreet: any;
	MeetAndGreetRes: any;

	public addMeetAndGreetForm: FormGroup;
	public editMeetAndGreetForm: FormGroup;

	public submitted = false;
	public submittedEditForm = false;
	public response: any;
	public disableAddButton: boolean = false;
	public disableEditButton: boolean = false;
	currentUser = JSON.parse(localStorage.getItem('currentUser'))

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private formBuilder: FormBuilder) { }

	ngOnInit(): void
	{

		/** spinner starts on init */
		this.spinner.show();

		// Load Our Meet and Greet using API
		this.adminService.getMeetAndGreetList().then(result =>
		{
			this.MeetAndGreetRes = result;
			this.MeetAndGreet = this.MeetAndGreetRes.data;
			console.log(this.MeetAndGreet, "///////////////////////////////////////////////////////////////////////////")
			sessionStorage.setItem('MeetAndGreet', JSON.stringify(this.MeetAndGreet));
			this.spinner.hide();//hide spinner
		});

		//add MeetAndGreet type form validation
		this.addMeetAndGreetForm = this.formBuilder.group({
			message: ['', Validators.required]
		});

		//edit MeetAndGreet type form validation
		this.editMeetAndGreetForm = this.formBuilder.group({
			id: ['', Validators.required],
			message: ['', Validators.required]
		});
	}

	serach(val)
	{
		let allMeetAndGreet = JSON.parse(sessionStorage.getItem('MeetAndGreet'));
		let searchMeetAndGreet = allMeetAndGreet.filter(function (MeetAndGreet)
		{
			if (MeetAndGreet.message.toLowerCase().search(val) != -1)
			{
				return true;
			}
		});
		this.MeetAndGreet = searchMeetAndGreet;
	}

	get f()
	{
		return this.addMeetAndGreetForm.controls;
	}
	drop(event: CdkDragDrop<string[]>)
	{
		// moveItemInArray(this.vehicles, event.previousIndex, event.currentIndex);'
		console.log(event, "check event")
		console.log("previous index", event.previousIndex)
		console.log("current index", event.currentIndex)
		this.spinner.show();
		let id = this.MeetAndGreet[event.previousIndex].id
		console.log(id, "////////////")
		this.adminService.changeSortingOrder({ meet_id: id, currentIndex: event.currentIndex, previousIndex: event.previousIndex }).subscribe((response: any) =>
		{
			this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
			{
				this.router.navigate(['/admin/meet-and-greet']);
			});
			this.spinner.hide();
			// console.log(response.data)
		})
	}
	submitForm()
	{
		this.submitted = true;
		// stop here if form is invalid
		if (this.addMeetAndGreetForm.invalid)
		{
			return;
		}

		this.spinner.show();
		this.disableAddButton = true; //disable submit button

		this.adminService.addMeetAndGreet(this.addMeetAndGreetForm.value)
			.pipe(
				catchError(err =>
				{
					$('#addMeetAndGreetModal').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.response = result;
				$('#addMeetAndGreetModal').modal('hide');
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
				{
					this.router.navigate(['/admin/meet-and-greet']);
				});
			});
	}

	editMeetAndGreet(id)
	{
		this.spinner.show();

		this.adminService.getMeetAndGreet(id)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.response = result;

				this.editMeetAndGreetForm.patchValue({
					id: this.response.data.id,
					message: this.response.data.message
				});
				$('#editMeetAndGreetModal').modal('show');
				this.spinner.hide();//hide spinner
			});
	}

	get fEdit()
	{
		return this.editMeetAndGreetForm.controls;
	}
	updateMeetAndGreetForm()
	{
		this.submittedEditForm = true;
		// stop here if form is invalid
		if (this.editMeetAndGreetForm.invalid)
		{
			return;
		}

		this.spinner.show();
		this.disableEditButton = true; //disable submit button

		this.adminService.updateMeetAndGreet(this.editMeetAndGreetForm.value)
			.pipe(
				catchError(err =>
				{
					$('#editMeetAndGreetModal').modal('hide');
					return throwError(err);
				})
			)
			.subscribe(result =>
			{
				this.response = result;
				$('#editMeetAndGreetModal').modal('hide');
				this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() =>
				{
					this.router.navigate(['/admin/meet-and-greet']);
				});
			});
	}

	enableDisableClicked(event, id)
	{
		this.spinner.show();//show spinner
		console.log(event.checked);
		if (event.checked)
		{
			var status = 'enable';
		}
		else
		{
			var status = 'disable';
		}
		this.adminService.MeetAndGreetStatus(id, status)
			.pipe(
				catchError(err =>
				{
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result =>
			{

				this.spinner.hide();//hide spinner
			});
	}
}

