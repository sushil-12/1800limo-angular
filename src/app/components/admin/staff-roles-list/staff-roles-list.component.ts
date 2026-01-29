import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import * as moment from 'moment';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService } from 'src/app/services/admin.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
declare var $: any;
@Component({
	selector: 'app-staff-roles-list',
	templateUrl: './staff-roles-list.component.html',
	styleUrls: ['./staff-roles-list.component.scss']
})
export class StaffRolesListComponent implements OnInit {

	rolesList: any[]
	addRoleForm: FormGroup

	constructor(
		private $form: FormBuilder,
		private $api: AdminService,
		private $route: ActivatedRoute,
		private $router: Router,
		private $errors: ErrorDialogService,
		private $spinner: NgxSpinnerService,
	) { }

	ngOnInit(): void {
		this.buildAddRoleForm()
		this.getRolesList()

	}
	getRolesList() {
		this.$api.getRoles().subscribe((response: any) => {
			console.log('response-->>', response)
			this.rolesList = response?.data
			this.$spinner.hide()
		})
	}
	buildAddRoleForm() {
		this.addRoleForm = this.$form.group({
			name: ['', [Validators.required]]
		})
	}
	formatDate(date: any) {
		return moment(date).format('lll')
	}
	get Form() {
		return this.addRoleForm.controls;
	}
	handleSubmitAddRole() {
		console.log(this.addRoleForm.value.name.toLowerCase().replaceAll(/ /g, '_'))
		let data = {
			name: this.addRoleForm.value.name,
			slug: this.addRoleForm.value.name.toLowerCase().replaceAll(/ /g, '_')
		}
		if (this.addRoleForm.valid) {
			this.$spinner.show()
			this.$api.addRole(data).subscribe((response: any) => {
				this.$errors.openDialog({
					errors: {
						error: `<span class='text-success'>${response.message}</span>`
					}
				})
				$("#addRoleModal").modal("hide");
				this.getRolesList()
				this.$spinner.hide()
			})
		}
	}
}
