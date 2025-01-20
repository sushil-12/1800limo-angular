import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService } from 'src/app/services/admin.service';
import { constant_data } from 'src/assets/js/data.js'


@Component({
  selector: 'app-reports-admin-vehicles',
  templateUrl: './reports-admin-vehicles.component.html',
  styleUrls: ['./reports-admin-vehicles.component.scss']
})
export class ReportsAdminVehiclesComponent implements OnInit {

  public year:any = '2024';
  public yearsData: Array<any> = constant_data.reportsYear;
	public bookingsResult: any[];


     // Set the options for the chart
	   view: any[] = [800, 600];
	

   colorScheme = {
     domain: ['#1a73e8', '#ff4081', '#4caf50', '#ffeb3b', '#e91e63','#5AA454','#A10A28','#C7B42C','#AAAAAA']
   };


 

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
    this.adminService.getVehPercentReport(year).subscribe((response: any) => {
      this.spinner.hide()
			console.log("in function getVehPercentReport", response);
      this.bookingsResult = response?.data
		});
  }
  

}
