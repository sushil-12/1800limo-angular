import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
declare var $: any;

@Component({
  selector: 'app-recover-accounts',
  templateUrl: './recover-accounts.component.html',
  styleUrls: ['./recover-accounts.component.scss']
})
export class RecoverAccountsComponent implements OnInit {

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  public paramResponse:any;

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
  public accountToDelete: number;
  public alertMessage: string;
  searchText: any;
  accounts: any;
  isDeletedAcc: boolean = false;
  showActionColumn: boolean = true;
  title: string = 'All';
  accounts_count: any;

  constructor(
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
		this.searchText = localStorage.getItem('allAccountsSearch') ? localStorage.getItem('allAccountsSearch') : '' 
    // this.searchText = ''
      this.loadAccounts();//load travelPlanners

        // localStorage.removeItem('travelAgent_id' )
  }

	timer: any
	handleSearchKeyword(text:any){
		console.log('on change search text-->>' , text)
		this.searchText = text
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			localStorage.setItem('allAccountsSearch' , text)
			this.loadAccounts()
		}, 700)
	}
	handleKeypressEvents() {
		clearTimeout(this.timer)
	}


  loadAccounts(pageUrl=null)
  {
      /** spinner starts on init */
      this.spinner.show();

      var keyword = this.searchText;

      // Load Our travelPlanners using API
      this.adminService.getAccounts(pageUrl,this.isDeletedAcc , keyword).then((result:any)=>{
        let response = result
        this.accounts= result?.data?.users?.data;
        this.accounts_count = result?.data?.account_counts;

        this.firstPage=1;
        this.lastPage=result.data.last_page;
        this.totalPage=result.data.last_page;
        this.currentPage=result.data.current_page;
        this.from=result.data.from;
        this.to=result.data.to;
        this.path=result.data.path;
        this.firstPageUrl=result.data.first_page_url;
        this.lastPageUrl=result.data.last_page_url;
        this.prevPageUrl=result.data.prev_page_url;
        this.nextPageUrl=result.data.next_page_url;
        // sessionStorage.setItem('travelPlanners',JSON.stringify(this.travelPlanners));
        //hide action column
       
        this.spinner.hide();//hide spinner
      })
      .catch(err=>{
        this.spinner.hide();//hide spinner
      });
  }

  addTravelPlannerClick(travelPlannerId)
  {
    this.router.navigate(['/admin/travel-planner-account/step1'],{queryParams:{travelPlannerId:travelPlannerId}});
  }

  formatText(value){
    return value ? value.replaceAll('_', ' ') : 'N/A'
  }
  handleChangeToggle(){
    this.isDeletedAcc=!this.isDeletedAcc;
    if(this.isDeletedAcc){
      this.showActionColumn = false
      this.title = "Deleted"
    }
    else{
      this.showActionColumn = true
       this.title = "All"
    }
  }

  enableDisableClickedDelete(id) {
    $('#deleteConfirmationModal').modal('show');
    console.log('in function open modal', this.accountToDelete)
		this.accountToDelete = id;
		this.alertMessage = "Are you sure you want to delete this account?"
	}

  deleteAccount(){
    $('#deleteConfirmationModal').modal('hide');
    console.log('in function delete account', this.accountToDelete)
    this.adminService.deleteAccount(this.accountToDelete)
    .pipe(
      catchError(err => {
        // this.stateManagementService.setprogressBar(false);
        return throwError(err);
      })
    ).subscribe(result => {
      this.router.navigateByUrl('/RefreshComponent', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/admin/recover-accounts']);
      });
      this.loadAccounts()
      });

  }

  clickEditTravelPlanner(travelPlannerId)
  {
    localStorage.setItem('travelAgent_id', travelPlannerId)
    this.router.navigate(['/admin/travel-planner-account/step1'],{queryParams:{travelPlannerId:travelPlannerId}});
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
		if (!this.searchText) { return args ? args : 'N/A'; }
		if (args) {
			args = args.toString()
			var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
			return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
		}
	}

  messagetype: Record<string, any>
	sendMessage(type: 'email' | 'sms', travelPlanner: Object, message: string = null) {
		console.log('Request to send a Message to travel agent id: ', type, travelPlanner['id'])
		this.messagetype = { type, travelPlanner }
		$('#messageModal').modal('show')
		$('#messageModal').find('.modal-header').find('h4').text('Contact to Travel Agent via ' + type.toUpperCase())
		$('#messageModal').find('.modal-body').find('p#affiliate-details').html(`Travel Agent Name: ${travelPlanner['first_name']} ${travelPlanner['last_name']}<br/>Travel Agent Email: ${travelPlanner['email']}`)
		if (message != null) {
			this.adminService.sendAffiliateMessage(type, travelPlanner['id'], { sendContent: message },).subscribe((response: any) => {
				if (response.success) {
					console.log('Message Sent Successfully. ')
				}
			})
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
