import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService } from 'src/app/services/admin.service';
import { constant_data } from 'src/assets/js/data.js'

@Component({
  selector: 'app-reports-admin-users',
  templateUrl: './reports-admin-users.component.html',
  styleUrls: ['./reports-admin-users.component.scss']
})
export class ReportsAdminUsersComponent implements OnInit {

  public userType:any;
  public ClientAccounts:any;
  public acc_id:any;
  public userTypesData:Array<any>=constant_data.userType

  constructor(
    private adminService: AdminService,
    private spinner : NgxSpinnerService
  ) { }

  ngOnInit(): void {
  }

  onFilterChange(name,event: any) {
    console.log("in filter change",name,event)
    if(name == 'userType'){
      this.userType = event.value;
    }
    this.acc_id = null
    this.getAccount(this.userType)
  }

  handleClientAccount(event){
    console.log("in handleClientAccount",event)
  }

  getAccount(acc_type){
    this.spinner.show()
    this.adminService.getAccountBytype(acc_type).subscribe((response: any) => {
      if (response.success && response.data.length > 0) {
        this.spinner.hide()
        this.ClientAccounts = response.data;
      }
      else {
        this.ClientAccounts = []
      }
      console.log("client acc", this.ClientAccounts)
      this.spinner.hide()
    })
  }

}
