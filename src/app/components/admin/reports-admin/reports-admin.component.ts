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
  public vehicleType:any='all';
  public serviceType:any='all';
  public transferType:any = 'all';
  public yearsData: Array<any> = constant_data.reportsYear;
  public statusData: Array<any> = constant_data.reportsStatus;
  public serviceTypeData: Array<any> = constant_data.serviceType;
  public vehicles:any;
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

    // Load master vehicle
    this.adminService.getOurVehicles().then((result:any) => {
      this.vehicles = result.data;
      console.log("veh resp", this.vehicles);
    }).catch(err => {
      console.log("err", err);
    });

      this.loadBookingsReport(this.year,this.status,this.vehicleType,this.serviceType,this.transferType)

  }

  //on change of filters call data
  onFilterChange(name,event: any) {
    console.log("in filter change",name,event)
    if(name == 'year'){
      this.year = event.value;
    }
    else if(name == 'status'){
      this.status = event.value; 
    }
    else if(name == 'vehicleType'){
      this.vehicleType = event.value; 
    }
    else if(name == 'serviceType'){
      this.serviceType = event.value;
    }
    else if(name == 'transferType'){
      this.transferType = event.value
    }
    this.loadBookingsReport(this.year,this.status,this.vehicleType,this.serviceType,this.transferType)
  }

  //load reports for bookings
  loadBookingsReport(year,status,vehType,serType,transType){
    this.spinner.show()
    this.adminService.getBookingsReport(year,status,vehType,serType,transType).subscribe((response: any) => {
      this.spinner.hide()
			console.log("in function get bookings report", response);
      this.bookingsResult = response?.data?.monthlyBookings
      this.bookingCount = response?.data?.totalBookings
		});
  }

}
