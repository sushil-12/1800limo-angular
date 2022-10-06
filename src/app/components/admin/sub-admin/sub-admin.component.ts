
import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import {Router} from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'app-sub-admin',
  templateUrl: './sub-admin.component.html',
  styleUrls: ['./sub-admin.component.scss']
})
export class SubAdminComponent implements OnInit {

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  public paramResponse:any;
  public subAdminId:string;
  public subAdminRes:any;
  public subAdmins:any;

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
      this.loadSubAdmin();//load subAdmins
  }

  loadSubAdmin(pageUrl=null)
  {
      /** spinner starts on init */
      this.spinner.show();

      var keyword = ((document.getElementById("keyword") as HTMLInputElement).value);
      // console.log(keyword);
      // Load Our subAdmins using API
      this.adminService.subAdminAccounts(pageUrl,keyword).then(result=>{
        this.subAdminRes=result;
        this.subAdmins=this.subAdminRes.data.data;

        this.firstPage=1;
        this.lastPage=this.subAdminRes.data.last_page;
        this.totalPage=this.subAdminRes.data.last_page;
        this.currentPage=this.subAdminRes.data.current_page;
        this.from=this.subAdminRes.data.from;
        this.to=this.subAdminRes.data.to;
        this.path=this.subAdminRes.data.path;
        this.firstPageUrl=this.subAdminRes.data.first_page_url;
        this.lastPageUrl=this.subAdminRes.data.last_page_url;
        this.prevPageUrl=this.subAdminRes.data.prev_page_url;
        this.nextPageUrl=this.subAdminRes.data.next_page_url;
        // sessionStorage.setItem('subAdmin',JSON.stringify(this.subAdmin));
        this.spinner.hide();//hide spinner
      })
      .catch(err=>{
        this.spinner.hide();//hide spinner
      });
  }

  addSubAdminClick(subAdminId)
  {
    this.router.navigate(['/admin/add-sub-admin'],{queryParams:{subAdminId:subAdminId}});
  }

  clickEditSubAdmin(subAdminId)
  {
    this.router.navigate(['/admin/edit-sub-admin'],{queryParams:{subAdminId:subAdminId}});
  }

  clickSubAdminCards(subAdminId)
  {
    this.router.navigate(['/admin/cards'],{queryParams:{accountType:'subAdmin',accountId:subAdminId}});
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
    this.adminService.subAdminAccountStatus(id,status)
    .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
    ).subscribe(result=>{

      this.spinner.hide();//hide spinner
    });
  }

  //for pagination
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
