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
  totalRecords: any;
  searchText: string = '';
  currentPage: any;
  firstPage: number;
  lastPage: any;
  totalPage: any;
  from: any;
  to: any;
  path: any;
  prevPageUrl: any;
  nextPageUrl: any;
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

  getBookingLogs(pageUrl = null, search_value: string = ''){
    this.spinner.show()
    this.$api.getBookingLogs(pageUrl,search_value).subscribe((response: any) =>
		{
      this.dataSource = response?.data?.data
      // this.dataSource = this.dataSource.map(i=> {
      //   return 
      // })
      
      this.totalRecords = response?.data?.total;
			this.firstPage = 1;
			this.lastPage = response?.data?.last_page;
			this.totalPage = response?.data?.last_page;
			this.currentPage = response?.data?.current_page;
			this.from = response?.data?.from;
			this.to = response?.data?.to;
			this.path = response?.data?.path;
			this.firstPage = response?.data?.first_page_url;
			this.lastPage = response?.data?.last_page_url;
			this.prevPageUrl = response?.data?.prev_page_url;
			this.nextPageUrl = response?.data?.next_page_url;
      console.log('response-->>' , this.dataSource)
      this.spinner.hide()
		})
  }

	timer: any
  searchInBookingslogs(search_value: string) {
		this.searchText = search_value
		console.log('--->>>>>', search_value)
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			this.getBookingLogs(null, search_value)
		}, 700)
	}
  formatText(text:any){
    if(text == 'affiliate_id'){
      return 'Affiliate Name'
    }
    else{
      return text.replace(/_/g, " ");
    }
  }

  columnData(columnData, columnName){
    console.log('------->>>>>>>>>>' , columnData,columnName)
    if(columnName=='affiliate_id' && columnData.booking_type == 'Affiliate'){
      return `${columnData.affiliate_account_details.first_name} ${columnData.affiliate_account_details.last_name}`
    }
    else if(columnName=='affiliate_id' && columnData.booking_type == "Loose Affiliate"){
      return `${columnData.lose_affiliate_details.name}`
    }
    else{
      return columnData[columnName]
    }
  }
  FormatDate(date:any){
    return moment(date).format('lll');
  }
  handleKeypressEvents() {
		clearTimeout(this.timer)
	}
  counter() {
		var currentPage;
		var startFrom;
		var endTo;

		if (this.currentPage < 5) {
			startFrom = 0;
			endTo = this.totalPage;
		} else if (this.currentPage < this.totalPage) {
			currentPage = this.currentPage;
			endTo = currentPage + 1;
			startFrom = endTo - 5;
		} else {
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

