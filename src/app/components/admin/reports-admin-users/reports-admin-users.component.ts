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

  public userType:any='driver';
  public ClientAccounts:any;
  public acc_id:any;
  public userBasedReportResponse:any;
  public totalBookings:any;
  public volume:any;
  public lifetimeBookings:any;
  public year:any='all';
  public yearsData: Array<any> = constant_data.reportsYear;
  public monthsData: Array<any> = constant_data.reportsMonth;
  public month:any='all';
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

    this.getAccount('driver')
    
  }

  onFilterChange(name,event: any) {
    console.log("in filter change",name,event)
    if(name == 'userType'){
      this.userType = event.value;
      this.getAccount(this.userType)
      this.acc_id = null
      this.year = 'all'
      this.month = 'all'
    }
    else if(this.acc_id && name == 'year'){
      this.year = event.value
      this.loadReport()
    }
    else if(this.acc_id && name == 'month'){
      this.month = event.value
      this.loadReport()
    }
  }

  handleClientAccount(event){
    console.log("in handleClientAccount",event)
    if(event){
      console.log("in event")
      this.loadReport()
    }
      
  }

  getAccount(acc_type){
    this.spinner.show()
    this.adminService.getAccountBytypeforall(acc_type).subscribe((response: any) => {
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

		if (this.currentPage as number < 5) {
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

  loadReport(pageUrl = '') {
		this.spinner.show();
		this.adminService.getUserBasedReport(pageUrl,this.acc_id,this.year,this.month).then((resp:any) => {
      this.spinner.hide()
      let reports = resp;
			this.userBasedReportResponse = reports?.data?.data?.data;
      this.volume = reports?.data?.total_amount
      this.totalBookings = reports?.data?.total_bookings
      this.lifetimeBookings = reports?.data?.lifetime_bookings

			this.firstPage = 1;
			this.lastPage = reports.data?.data?.last_page;
			this.totalPage = reports.data?.data?.last_page;
			this.currentPage = reports.data?.data?.current_page;
			this.from = reports.data?.data?.from;
			this.to = reports.data?.data?.to;
			this.path = reports.data?.data?.path;
			this.firstPageUrl = reports.data?.data?.first_page_url;
			this.lastPageUrl = reports.data?.data?.last_page_url;
			this.prevPageUrl = reports.data?.data?.prev_page_url;
			this.nextPageUrl = reports.data?.data?.next_page_url;

      console.log("data for pagnation",this.lastPage,this.totalPage,this.currentPage,this.from,this.to)
			
		})
			.catch(err => {
				this.spinner.hide();
        console.log("err in user based report",err)
			});
	}

}
