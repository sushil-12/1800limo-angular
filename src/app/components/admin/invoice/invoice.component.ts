import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import {Router} from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import {ThemePalette} from '@angular/material/core';

@Component({
  selector: 'app-invoice',
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.scss']
})
export class InvoiceComponent implements OnInit {

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  public paramResponse:any;
  public invoiceId:string;
  public invoiceRes:any;
  public invoices:any;

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

  constructor(
    private adminService:AdminService,
    private router: Router,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
      this.loadInvoice();//load invoices
  }

  loadInvoice(pageUrl=null)
  {
      /** spinner starts on init */
      this.spinner.show();

      var keyword = ((document.getElementById("keyword2") as HTMLInputElement).value);
      // console.log(keyword);
      // Load Our invoices using API
      this.adminService.invoiceList(pageUrl,keyword).then(result=>{
        this.invoiceRes=result;
        this.invoices=this.invoiceRes.data.data;

        this.firstPage=1;
        this.lastPage=this.invoiceRes.data.last_page;
        this.totalPage=this.invoiceRes.data.last_page;
        this.currentPage=this.invoiceRes.data.current_page;
        this.from=this.invoiceRes.data.from;
        this.to=this.invoiceRes.data.to;
        this.path=this.invoiceRes.data.path;
        this.firstPageUrl=this.invoiceRes.data.first_page_url;
        this.lastPageUrl=this.invoiceRes.data.last_page_url;
        this.prevPageUrl=this.invoiceRes.data.prev_page_url;
        this.nextPageUrl=this.invoiceRes.data.next_page_url;
        // sessionStorage.setItem('invoice',JSON.stringify(this.invoice));
        this.spinner.hide();//hide spinner
      })
      .catch(err=>{
        this.spinner.hide();//hide spinner
      });
  }

  clicViewInvoice(bookingId)
  {
    this.router.navigate(['/admin/invoice-summary'],{queryParams:{bookingId:bookingId}});
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
