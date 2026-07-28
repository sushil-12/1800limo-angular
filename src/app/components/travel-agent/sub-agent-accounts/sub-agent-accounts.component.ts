import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';
declare var $:any;

@Component({
  selector: 'app-sub-agent-accounts',
  templateUrl: './sub-agent-accounts.component.html',
  styleUrls: ['./sub-agent-accounts.component.scss']
})
export class SubAgentAccountsComponent implements OnInit {

  color: ThemePalette = 'accent';
  checked = false;
  disabled = false;

  public paramResponse:any;
  public clientId:string;
  public clientRes:any;
  public clients:any;

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
  public rejectCauseForm: FormGroup;
  public submitted: boolean = false;

  constructor(
		private travelService: TravelAgentService,
    private adminService:AdminService,
    private router: Router,
    private $form: FormBuilder,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
		this.searchText = localStorage.getItem('subAgentAccountSearch') ? localStorage.getItem('subAgentAccountSearch') : '' 
      this.loadClientAccounts();//load clients

      // this.rejectCauseForm = this.$form.group({
      //   acc_id: ['', Validators.required],
      //   reject_cause: ['', Validators.required],
      // });
  }

	timer: any
	handleSearchKeyword(text:any){
		console.log('on change search text-->>' , text)
		this.searchText = text
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			localStorage.setItem('subAgentAccountSearch' , text)
			this.loadClientAccounts()
		}, 700)
	}
	handleKeypressEvents() {
		clearTimeout(this.timer)
	}

  // get rejectCauseF() {
	// 	return this.rejectCauseForm.controls;
	// }

  // rejectAffiliateClick(acc_id) {
	// 	this.rejectCauseForm.patchValue({
	// 		acc_id: acc_id
	// 	});
	// }

  // rejectAffiliate() {
	// 	this.submitted = true;
	// 	console.log(this.rejectCauseForm);
	// 	// stop here if form is invalid
	// 	if (this.rejectCauseForm.invalid) {
	// 		return;
	// 	}

	// 	this.spinner.show();
	// 	// this.disableSubmitButton=true; //disable submit button

	// 	this.adminService.rejectAffiliate(this.rejectCauseForm.value)
	// 		.pipe(
	// 			catchError(err => {
	// 				this.spinner.hide();//hide spinner
	// 				$('#rejectCauseModal').modal('hide');
	// 				return throwError(err);
	// 			})
	// 		)
	// 		.subscribe(({ data, success, message }: any) => {
	// 			if (success == true) {
	// 				this.spinner.hide()
	// 				$('#rejectCauseModal').modal('hide');
	// 				this.loadClientAccounts()
	// 			}
	// 		});
	// }

  acceptRejectAffiliate(acc_id,status) {
		this.spinner.show();
		// this.disableSubmitButton=true; //disable submit button
		console.log('acc_id', acc_id,'status',status)

		this.travelService.acceptRejectAffiliate(acc_id,status)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			)
			.subscribe(({ data, success, message }: any) => {
				if (success == true) {
					this.spinner.hide();//hide spinner
					this.loadClientAccounts()
				}
			});
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

  loadClientAccounts(pageUrl=null)
  {
      /** spinner starts on init */
      if(pageUrl){
        console.log("pageurl",pageUrl)
        this.scroll('sub_agrnt_accounts')
      }
      this.spinner.show();

      var keyword = this.searchText;
      
      // Load Our clients using API
      this.travelService.getSubAgentAccounts(pageUrl,keyword).then(result=>{
        this.clientRes=result;
        this.clients=this.clientRes?.data?.data;

        this.firstPage=1;
        this.lastPage=this.clientRes.data.last_page;
        this.totalPage=this.clientRes.data.last_page;
        this.currentPage=this.clientRes.data.current_page;
        this.from=this.clientRes.data.from;
        this.to=this.clientRes.data.to;
        this.path=this.clientRes.data.path;
        this.firstPageUrl=this.clientRes.data.first_page_url;
        this.lastPageUrl=this.clientRes.data.last_page_url;
        this.prevPageUrl=this.clientRes.data.prev_page_url;
        this.nextPageUrl=this.clientRes.data.next_page_url;
        // sessionStorage.setItem('clients',JSON.stringify(this.clients));
        this.spinner.hide();//hide spinner
      })
      .catch(err=>{
        this.spinner.hide();//hide spinner
      });
  }


  highlighText(args: string) {
		if (!this.searchText) { return args; }
		if (args) {
			args = args.toString()
			const escapedSearchText = this.searchText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
			var re = new RegExp(escapedSearchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
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
    this.travelService.subTavelPlannerAccountStatus(id,status)
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

    if (this.currentPage as number < 5)
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

  editSubAgentAccount(id){
    this.router.navigate(['/travel_agent/sub-agent-account-details'],{ queryParams: { id:id }});
  }
}
