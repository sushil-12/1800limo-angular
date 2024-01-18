import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

@Component({
  selector: 'app-sub-travel-planner-account',
  templateUrl: './sub-travel-planner-account.component.html',
  styleUrls: ['./sub-travel-planner-account.component.scss']
})
export class SubTravelPlannerAccountComponent implements OnInit {

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  public paramResponse: any;
  public travelPlannerId: string;
  public travelPlannersRes: any;
  public travelPlanners: any;

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
  searchText: any;
  travelAccountCount: any;
  loginAsUserResponse: any;

  constructor(
    private adminService: AdminService,
    private router: Router,
    private errorDialog: ErrorDialogService,
    private $routeurl: ActivatedRoute,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.searchText = localStorage.getItem('SubTravelAgentSearch') ? localStorage.getItem('SubTravelAgentSearch') : ''
    this.$routeurl.queryParams.subscribe((params: any) => {
			console.log('-_>>>>>>>' , params)
      if(params){
        this.travelPlannerId = params?.travelPlannerId
      }
		})
    this.loadSubTravelPlanners();//load travelPlanners
  }

  timer: any
  handleSearchKeyword(text: any) {
    console.log('on change search text-->>', text)
    this.searchText = text
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      localStorage.setItem('SubTravelAgentSearch', text)
      this.loadSubTravelPlanners()
    }, 700)
  }


	scroll(id) {
		// let el = document.getElementById(id);
		// let elementRect = el.getBoundingClientRect();
		// let absoluteElementTop = elementRect.top + window.pageYOffset;
		// let topElement = absoluteElementTop - 200;

		// console.log(`scrolling to ${id}`, el , absoluteElementTop ,window.innerHeight);
		// window.scrollTo({
		// 	top: topElement,
		// 	behavior: 'smooth'
		// });

		let el = document.getElementById(id);
		console.log(`scrolling to ${id}`, el);
		el.scrollIntoView({ behavior: 'smooth' });
	}

  loadSubTravelPlanners(pageUrl = null) {
    /** spinner starts on init */
    if(pageUrl){
			console.log("pageurl",pageUrl)
      this.scroll('sub_ta_table')
		}
    this.spinner.show();

    var keyword = this.searchText;

    // Load Our travelPlanners using API
    this.adminService.subTravelPlannerAccountsbyId(pageUrl, keyword,this.travelPlannerId).then(result => {
      this.travelPlannersRes = result;
      this.travelPlanners = this.travelPlannersRes.data.data;

      this.firstPage = 1;
      this.travelAccountCount = this.travelPlannersRes?.data?.account_counts
      this.lastPage = this.travelPlannersRes.data.last_page;
      this.totalPage = this.travelPlannersRes.data.last_page;
      this.currentPage = this.travelPlannersRes.data.current_page;
      this.from = this.travelPlannersRes.data.from;
      this.to = this.travelPlannersRes.data.to;
      this.path = this.travelPlannersRes.data.path;
      this.firstPageUrl = this.travelPlannersRes.data.first_page_url;
      this.lastPageUrl = this.travelPlannersRes.data.last_page_url;
      this.prevPageUrl = this.travelPlannersRes.data.prev_page_url;
      this.nextPageUrl = this.travelPlannersRes.data.next_page_url;
      // sessionStorage.setItem('travelPlanners',JSON.stringify(this.travelPlanners));
      this.spinner.hide();//hide spinner
    })
      .catch(err => {
        this.spinner.hide();//hide spinner
      });
  }

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

  
  highlighText(args: string) {
    if (!this.searchText) { return args; }
    if (args) {
      args = args.toString()
      var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
      return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
    }
  }

  loginAsUser(travelPlanner) {
   
    if(travelPlanner?.account_approval == 'pending' || travelPlanner?.account_approval == 'rejected'){
      this.errorDialog.openDialog({
        errors: {
          error: `Sorry! You can not log into this account as this account is currently ${travelPlanner?.account_approval} by Super Travel Agent,`
        }
      })
    }
    else{
      this.spinner.show()
      this.adminService.loginAsUser(travelPlanner?.user_id).pipe(
        catchError(err => {
          this.spinner.hide()
          return throwError(err);
        })
      ).subscribe(response => {
        this.spinner.hide()
        this.loginAsUserResponse = response
        let bkp_a_token = localStorage.getItem('access_token')
        let bkp_crnt_dt = localStorage.getItem('currentUser')
        let bkp_u_dt = localStorage.getItem('userData')
        localStorage.setItem('bkp_a_token', bkp_a_token)
        localStorage.setItem('bkp_crnt_dt', bkp_crnt_dt)
        localStorage.setItem('bkp_u_dt', bkp_u_dt)
        console.log("response", response)
        localStorage.setItem('access_token', this.loginAsUserResponse.data?.access_token)
        localStorage.setItem('currentUser', JSON.stringify(this.loginAsUserResponse.data?.user))
        // localStorage.setItem('userData', bkp_u_dt)
        if(this.loginAsUserResponse?.data?.user?.is_profile_complete){
          this.router.navigateByUrl('/sub_travel_agent/bookings');
        }
        else{
          this.router.navigateByUrl('/sub_travel_agent/profile')
        }
  
  
      });
    }
  }

}
