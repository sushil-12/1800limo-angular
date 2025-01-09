import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService } from 'src/app/services/admin.service';
import { constant_data } from 'src/assets/js/data.js'

@Component({
  selector: 'app-reports-admin',
  templateUrl: './reports-admin.component.html',
  styleUrls: ['./reports-admin.component.scss']
})
export class ReportsAdminComponent implements OnInit {

  public year:any = '2024';
  public status:any = 'Paid';
  public yearsData: Array<any> = constant_data.reportsYear
  public statusData: Array<any> = constant_data.reportsStatus
  public bookingCount :any;
	public bookingsResult: any[];
	

	  // Set the options for the chart
	  view: any[] = [window.innerWidth > 768 ? 700 : window.innerWidth * 0.9, 400]; // Optional: Define the size of the chart
	
	  // Customize chart configurations (optional)
	  showXAxis = true;
	  showYAxis = true;
	  gradient = true;
	  showLegend = false;
	  showXAxisLabel = true;
	  xAxisLabel = 'Months';
	  showYAxisLabel = true;
	  yAxisLabel = 'No. of bookings';
    // color scheme for bars
    colorScheme = {
      domain: [
        '#7AA3E5','#ACCDED'
      ]
    };

    // Dynamically resize the chart view based on screen width
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (event.target.innerWidth <= 768) {
      // For mobile view (<= 768px), make the chart responsive
      this.view = [event.target.innerWidth * 0.9, 400]; // 90% of screen width
    } else {
      // For larger screens, set a fixed size
      this.view = [700, 400];  // Fixed width and height
    }
  }

  constructor(
    private httpClient : HttpClient,
    private adminService : AdminService,
    private spinner : NgxSpinnerService
  ) { }

  ngOnInit(): void {

      this.loadBookingsReport(this.year,this.status)

  }

  //on change of year call data
  onYearChange(event: any) {
    this.year = event.value;
    this.loadBookingsReport(this.year,this.status)
  }

  //on chnage of status call data
  onStatusChange(event: any) {
    this.status = event.value; 
    this.loadBookingsReport(this.year,this.status)
  }


  //load reports for bookings
  loadBookingsReport(year,status){
    this.spinner.show()
    this.adminService.getBookingsReport(year,status).subscribe((response: any) => {
      this.spinner.hide()
			console.log("in function get bookings report", response);
      this.bookingsResult = response?.data?.monthlyBookings
      this.bookingCount = response?.data?.totalBookings
		});
  }

}
