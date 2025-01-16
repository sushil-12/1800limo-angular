import { Component, OnInit } from '@angular/core';
import * as moment from 'moment';
import { AdminService } from 'src/app/services/admin.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';
import { DatePickerComponent } from '../../shared/date-picker/date-picker.component';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payouts',
  templateUrl: './payouts.component.html',
  styleUrls: ['./payouts.component.scss']
})
export class PayoutsComponent implements OnInit {

  exampleHeader = DatePickerComponent;
  outputDateFormat = "YYYY-MM-DD";

  public invoices: any = [];
  public startDate: string;
  public endDate: string;
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
  public invoiceRes: any;
  public totalBookings:any;
  public volume:any;
  public lifetimeBookings:any;
  audit_Trail: any;
  searchText: any = '';
  useDateFilter: boolean = true;
  currentUser: any;

  constructor(private TravelService: TravelAgentService, private adminService: AdminService, private router: Router,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
    this.loadPayouts();//load invoices

  }

  loadPayouts() {
    this.spinner.show()
    let data = {
      user_type: 'travel_planner',
      account_id: this.currentUser?.account_id
    }

    this.adminService.payouts(data)
      .pipe(
        catchError(err => {
          this.spinner.hide();
          return throwError(err);
        })
      )
      .subscribe((data: any) => {
        this.spinner.hide();
        this.invoiceRes = data;
        this.invoices = this.invoiceRes?.data?.data
        this.volume = this.invoiceRes?.data?.total_amount
        this.totalBookings = this.invoiceRes?.data?.total_bookings
        this.lifetimeBookings = this.invoiceRes?.data?.lifetime_bookings
        console.log("result", this.invoiceRes)

      });
  }

 

}
