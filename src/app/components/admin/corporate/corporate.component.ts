import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import {Router} from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'app-corporate',
  templateUrl: './corporate.component.html',
  styleUrls: ['./corporate.component.scss']
})
export class CorporateComponent implements OnInit {

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  public paramResponse:any;
  public corporateId:string;
  public corporatesRes:any;
  public corporates:any;

  public firstPage:Number;
  public lastPage:Number;
  public totalPage:Number;
  public currentPage:Number;
  public from:Number;
  public to:Number;
  public path:string;
  public firstPageUrl:string;
  public lastPageUrl:string;
  public prevPageUrl:string;
  public nextPageUrl:string;

  constructor(
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
      this.loadCorporates();//load corporates
  }

  loadCorporates(pageUrl=null)
  {
      /** spinner starts on init */
      this.spinner.show();

      var keyword = ((document.getElementById("keyword") as HTMLInputElement).value);

      // Load Our corporates using API
      this.adminService.corporateAccounts(pageUrl,keyword).then(result=>{
        this.corporatesRes=result;
        this.corporates=this.corporatesRes.data.data;

        this.firstPage=1;
        this.lastPage=this.corporatesRes.data.last_page;
        this.totalPage=this.corporatesRes.data.last_page;
        this.currentPage=this.corporatesRes.data.current_page;
        this.from=this.corporatesRes.data.from;
        this.to=this.corporatesRes.data.to;
        this.path=this.corporatesRes.data.path;
        this.firstPageUrl=this.corporatesRes.data.first_page_url;
        this.lastPageUrl=this.corporatesRes.data.last_page_url;
        this.prevPageUrl=this.corporatesRes.data.prev_page_url;
        this.nextPageUrl=this.corporatesRes.data.next_page_url;
        // sessionStorage.setItem('corporates',JSON.stringify(this.corporates));
        this.spinner.hide();//hide spinner
      })
      .catch(err=>{
        this.spinner.hide();//hide spinner
      });
  }

  addCorporateClick(corporateId)
  {
    this.router.navigate(['/admin/add-corporate-account'],{queryParams:{corporateId:corporateId}});
  }

  clickEditCorporate(corporateId)
  {
    this.router.navigate(['/admin/edit-corporate-account'],{queryParams:{corporateId:corporateId}});
  }

  clickCorporateCards(corporateId)
  {
    this.router.navigate(['/admin/cards'],{queryParams:{accountType:'corporate',accountId:corporateId}});
  }
  
  clickCorporateStaff(corporateId)
  {
    this.router.navigate(['/admin/staff'],{queryParams:{accountType:'corporate',accountId:corporateId}});
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
    this.adminService.corporateAccountStatus(id,status)
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
}
