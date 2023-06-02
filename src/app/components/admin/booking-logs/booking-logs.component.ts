import { Component, OnInit } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { AdminService } from 'src/app/services/admin.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import * as moment from 'moment';

@Component({
  selector: 'app-booking-logs',
  templateUrl: './booking-logs.component.html',
  styleUrls: ['./booking-logs.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*', minHeight: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class BookingLogsComponent implements OnInit {

  dataSource : PeriodicElement[] = []
  constructor(
    private $api: AdminService,
		private $route: ActivatedRoute,
		private $router: Router,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit(): void {
    this.getBookingLogs();
  }

  columnsToDisplay = [
    'id',
    'booking_type',
    'affiliate_id',
    'booking_status',
    'amount_captured',
    'amount_refunded'
    // 'Description',
  ];
  expandedElement: PeriodicElement | null;

  getBookingLogs(){
    this.spinner.show()
    this.$api.getBookingLogs().subscribe((response: any) =>
		{
      this.dataSource = response?.data?.data
      console.log('response-->>' , this.dataSource)
      this.spinner.hide()
		})
  }
  formatText(text:any){
    return text.replace(/_/g, " ");
  }
  FormatDate(date:any){
    return moment(date).format('lll');
  }

}

export interface PeriodicElement {
  id: number;
  affiliate_id: number;
  booking_status: string;
  booking_type: string;
  // description: string;
  charges: Array<any>;
  payment_details: Object;
}

