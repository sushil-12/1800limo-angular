import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService } from 'src/app/services/admin.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

@Component({
  selector: 'app-staff-roles-list',
  templateUrl: './staff-roles-list.component.html',
  styleUrls: ['./staff-roles-list.component.scss']
})
export class StaffRolesListComponent implements OnInit {

  rolesList:any[]
  constructor(
    private $form: FormBuilder,
		private $api: AdminService,
		private $route: ActivatedRoute,
		private $router: Router,
		private $errors: ErrorDialogService,
		private $spinner: NgxSpinnerService,
  ) { }

  ngOnInit(): void {
    this.$api.getPermission().subscribe((response: any) => {
			// this.$errors.openDialog({
			// 	errors: {
			// 		error: `<span class='text-success'>${response.message}</span>`
			// 	}
			// })
			// this.$router.navigate(['/admin/daily-bookings-admin'])
			console.log('response-->>' , response)
			this.$spinner.hide()
		})
  }

}
