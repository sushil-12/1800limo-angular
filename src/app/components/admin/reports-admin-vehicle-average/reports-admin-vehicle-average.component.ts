import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService } from 'src/app/services/admin.service';
import { constant_data } from 'src/assets/js/data.js'



@Component({
  selector: 'app-reports-admin-vehicle-average',
  templateUrl: './reports-admin-vehicle-average.component.html',
  styleUrls: ['./reports-admin-vehicle-average.component.scss']
})
export class ReportsAdminVehicleAverageComponent implements OnInit {

  public year:any = '2025';
  public yearsData: Array<any> = constant_data.reportsYear;
	public bookingsResult: any[];


     // Set the options for the chart
	  view: any[] = [window.innerWidth > 768 ? 700 : window.innerWidth * 0.9, 400]; // Optional: Define the size of the chart
	

   colorScheme = {
     domain: ['#1a73e8', '#ff4081', '#4caf50', '#ffeb3b', '#e91e63','#5AA454','#A10A28','#C7B42C','#AAAAAA']
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

    this.loadVehPercentReport(this.year)

  }

   //on change of filters call data
   onFilterChange(name,event: any) {
    if(name == 'year'){
      this.year = event.value;
    }
    this.loadVehPercentReport(this.year)
  }

  //load reports for bookings
  loadVehPercentReport(year){
    this.spinner.show()
    this.adminService.getVehAverageReport(year).subscribe((response: any) => {
      this.spinner.hide()
			console.log("in function getVehAverageReport", response);
      this.bookingsResult = response?.data
		});
  }
}
