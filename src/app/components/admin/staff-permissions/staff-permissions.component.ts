import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService } from 'src/app/services/admin.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
declare var $: any
@Component({
  selector: 'app-staff-permissions',
  templateUrl: './staff-permissions.component.html',
  styleUrls: ['./staff-permissions.component.scss']
})
export class StaffPermissionsComponent implements OnInit {
  group_data: any;
  role_id: any;
  checkAllBoxs:{};

  constructor(
    private $api: AdminService,
		private $route: ActivatedRoute,
		private $router: Router,
		private $errors: ErrorDialogService,
		private $spinner: NgxSpinnerService,
  ) { }

  ngOnInit(): void {

    this.$route.queryParams.subscribe((params: any) => {
			if (params.role ) {
        this.role_id = params.role 
			}
		})
    this.$spinner.show()
    this.getPermissions();
   
  }
  returnZero() {
		return 0;
	}
  getPermissions(){
    this.$spinner.show()
    this.$api.getPermission(this.role_id).subscribe((response: any) => {
			console.log('response-->>' , response)
      this.group_data = response?.data
			this.$spinner.hide()
		})
  }

  formatText(text:any){
    return text.replaceAll(/_/g,' ');
  }

  handleChangeToggle(event:any,id:any){
    this.$spinner.show()
    console.log('handleChangeToggle-->>',event.checked,id)
    let data = {
      role_id:this.role_id,
      permission_id:id,
      status:event.checked
    }
    this.$api.updartePermission(this.role_id,data).subscribe((response: any) => {
			console.log('response-->>' , response)
      // this.$errors.openDialog({
      //   errors: {
      //     error: `<span class='text-success'>${response.message}</span>`
      //   }
      // })
      this.getPermissions();
			this.$spinner.hide()
		})
  }
  // setAll(checked:any,group_name){
  //   console.log('in set all function-->>', checked,group_name)
  //   this.checkAllBoxs[group_name.key] = checked
  //   let temp = group_name.value.map(i=> i.is_permitted = checked)
  //   this.group_data[group_name.name] = temp
  // }

}
