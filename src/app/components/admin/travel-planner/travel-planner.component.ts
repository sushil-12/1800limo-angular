import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import {Router} from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'app-travel-planner',
  templateUrl: './travel-planner.component.html',
  styleUrls: ['./travel-planner.component.scss']
})
export class TravelPlannerComponent implements OnInit {

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  public paramResponse:any;
  public travelPlannerId:string;
  public travelPlannersRes:any;
  public travelPlanners:any;

  public firstPage:Number;
  public lastPage:Number;
  public totalPage:Number;
  public currentPage:any;
  public from:Number;
  public to:Number;
  public path:string;
  public firstPageUrl:string;
  public lastPageUrl:string;
  public prevPageUrl:string;
  public nextPageUrl:string;
  searchText: any;

  constructor(
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
		this.searchText = localStorage.getItem('TravelAgentSearch') ? localStorage.getItem('TravelAgentSearch') : '' 
      this.loadTravelPlanners();//load travelPlanners
  }

	timer: any
	handleSearchKeyword(text:any){
		console.log('on change search text-->>' , text)
		this.searchText = text
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			localStorage.setItem('TravelAgentSearch' , text)
			this.loadTravelPlanners()
		}, 700)
	}
	handleKeypressEvents() {
		clearTimeout(this.timer)
	}


  loadTravelPlanners(pageUrl=null)
  {
      /** spinner starts on init */
      this.spinner.show();

      var keyword = this.searchText;

      // Load Our travelPlanners using API
      this.adminService.travelPlannerAccounts(pageUrl,keyword).then(result=>{
        this.travelPlannersRes=result;
        this.travelPlanners=this.travelPlannersRes.data.data;

        this.firstPage=1;
        this.lastPage=this.travelPlannersRes.data.last_page;
        this.totalPage=this.travelPlannersRes.data.last_page;
        this.currentPage=this.travelPlannersRes.data.current_page;
        this.from=this.travelPlannersRes.data.from;
        this.to=this.travelPlannersRes.data.to;
        this.path=this.travelPlannersRes.data.path;
        this.firstPageUrl=this.travelPlannersRes.data.first_page_url;
        this.lastPageUrl=this.travelPlannersRes.data.last_page_url;
        this.prevPageUrl=this.travelPlannersRes.data.prev_page_url;
        this.nextPageUrl=this.travelPlannersRes.data.next_page_url;
        // sessionStorage.setItem('travelPlanners',JSON.stringify(this.travelPlanners));
        this.spinner.hide();//hide spinner
      })
      .catch(err=>{
        this.spinner.hide();//hide spinner
      });
  }

  addTravelPlannerClick(travelPlannerId)
  {
    this.router.navigate(['/admin/add-travel-planner-account/step1'],{queryParams:{travelPlannerId:travelPlannerId}});
  }

  clickEditTravelPlanner(travelPlannerId)
  {
    this.router.navigate(['/admin/edit-travel-planner-account'],{queryParams:{travelPlannerId:travelPlannerId}});
  }

  clickTravelPlannerCards(travelPlannerId)
  {
    this.router.navigate(['/admin/cards'],{queryParams:{accountType:'travelPlanner',accountId:travelPlannerId}});
  }
  
  clickTravelPlannerStaff(travelPlannerId)
  {
    this.router.navigate(['/admin/staff'],{queryParams:{accountType:'travelPlanner',accountId:travelPlannerId}});
  }

  highlighText(args: string) {
		if (!this.searchText) { return args; }
		if (args) {
			args = args.toString()
			var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
			return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
		}
	}

  enableDisableClicked(event,id)
  {
    this.spinner.show();//show spinner
    console.log(event.checked);
    if(event.checked)
    {
      var status='enable';
    }
    else
    {
      var status='disable';
    }
    this.adminService.travelPlannerAccountStatus(id,status)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
    ).subscribe(result=>{

      this.spinner.hide();//hide spinner
    });
  }

  //for paginator
  counter() {
    var currentPage;
    var startFrom;
    var endTo;

    if(this.currentPage<5)
    {
      startFrom=0;
      endTo=this.totalPage;
    }
    else if(this.currentPage<this.totalPage){
      currentPage=this.currentPage
      endTo=currentPage+1;
      startFrom=endTo-5;
    }
    else{
      endTo=this.totalPage;
      startFrom=endTo-5;
    }

    var i;
    var udpArr=new Array();
    for(i=startFrom;i<endTo;i++)
    {
      udpArr.push(i+1);
    }
    return udpArr;
  }
}
