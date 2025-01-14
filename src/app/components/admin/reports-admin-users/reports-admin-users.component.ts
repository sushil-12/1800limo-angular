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
  public userBasedReportResponse:any;
  public totalBookings:any;
  public volume:any;
  public lifetimeBookings:any;
  public userTypesData:Array<any>=constant_data.userType
  public firstPage: Number;
	public lastPage: Number;
	public totalPage: Number;
	public currentPage: any;
	public from: Number;
	public to: Number;
	public path: string;
	public firstPageUrl: string;
	public lastPageUrl: string;
	public prevPageUrl: string;
	public nextPageUrl: string;

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
    this.userBasedReportResponse = null
    this.getAccount(this.userType)
  }

  handleClientAccount(event){
    console.log("in handleClientAccount",event)
    if(event){
      console.log('acc_id',this.acc_id)
      this.loadReport()
    }
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

  //for pagination
	counter() {
		var currentPage;
		var startFrom;
		var endTo;

		if (this.currentPage < 5) {
			startFrom = 0;
			endTo = this.totalPage;
		}
		else if (this.currentPage < this.totalPage) {
			currentPage = this.currentPage
			endTo = currentPage + 1;
			startFrom = endTo - 5;
		}
		else {
			endTo = this.totalPage;
			startFrom = endTo - 5;
		}

		var i;
		var udpArr = new Array();
		for (i = startFrom; i < endTo; i++) {
			udpArr.push(i + 1);
		}
		return udpArr;
	}

  loadReport(pageUrl = null) {
		this.spinner.show();
		this.adminService.getUserBasedReport(pageUrl,this.acc_id).then((resp:any) => {
      this.spinner.hide()
      let reports = resp;
			this.userBasedReportResponse = reports?.data?.data;
      this.volume = reports?.data?.total_amount
      this.totalBookings = reports?.data?.total_bookings
      this.lifetimeBookings = reports?.data?.lifetime_bookings

			this.firstPage = 1;
			this.lastPage = this.userBasedReportResponse.data.last_page;
			this.totalPage = this.userBasedReportResponse.data.last_page;
			this.currentPage = this.userBasedReportResponse.data.current_page;
			this.from = this.userBasedReportResponse.data.from;
			this.to = this.userBasedReportResponse.data.to;
			this.path = this.userBasedReportResponse.data.path;
			this.firstPageUrl = this.userBasedReportResponse.data.first_page_url;
			this.lastPageUrl = this.userBasedReportResponse.data.last_page_url;
			this.prevPageUrl = this.userBasedReportResponse.data.prev_page_url;
			this.nextPageUrl = this.userBasedReportResponse.data.next_page_url;
			
		})
			.catch(err => {
				this.spinner.hide();
        console.log("err in user based report",err)
			});
	}

}
