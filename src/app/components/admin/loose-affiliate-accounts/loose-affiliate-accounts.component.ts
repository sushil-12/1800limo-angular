import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';

@Component({
  selector: 'app-loose-affiliate-accounts',
  templateUrl: './loose-affiliate-accounts.component.html',
  styleUrls: ['./loose-affiliate-accounts.component.scss']
})
export class LooseAffiliateAccountsComponent implements OnInit {

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  public paramResponse: any;
  public LooseAffiliateAccRes: any;
  public LooseAffiliateAcc: any;

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
    this.searchText = localStorage.getItem('looseAffiliateSearch') ? localStorage.getItem('looseAffiliateSearch') : ''
    this.loadSubLooseAffiliateAcc();//load LooseAffiliateAcc
  }

  timer: any
  handleSearchKeyword(text: any) {
    console.log('on change search text-->>', text)
    this.searchText = text
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      localStorage.setItem('looseAffiliateSearch', text)
      this.loadSubLooseAffiliateAcc()
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

  loadSubLooseAffiliateAcc(pageUrl = null) {
    /** spinner starts on init */
    if (pageUrl) {
      console.log("pageurl", pageUrl)
      this.scroll('loose_affiliae_table')
    }
    this.spinner.show();

    var keyword = this.searchText;

    // Load Our LooseAffiliateAcc using API
    this.adminService.getLooseAffiliaeAccounts(pageUrl, keyword).then(result => {
      this.LooseAffiliateAccRes = result;
      this.LooseAffiliateAcc = this.LooseAffiliateAccRes?.data?.data;
      console.log('loose aff acc--->', this.LooseAffiliateAcc)
      this.firstPage = 1;
      this.travelAccountCount = this.LooseAffiliateAccRes?.data?.account_counts
      this.lastPage = this.LooseAffiliateAccRes.data.last_page;
      this.totalPage = this.LooseAffiliateAccRes.data.last_page;
      this.currentPage = this.LooseAffiliateAccRes.data.current_page;
      this.from = this.LooseAffiliateAccRes.data.from;
      this.to = this.LooseAffiliateAccRes.data.to;
      this.path = this.LooseAffiliateAccRes.data.path;
      this.firstPageUrl = this.LooseAffiliateAccRes.data.first_page_url;
      this.lastPageUrl = this.LooseAffiliateAccRes.data.last_page_url;
      this.prevPageUrl = this.LooseAffiliateAccRes.data.prev_page_url;
      this.nextPageUrl = this.LooseAffiliateAccRes.data.next_page_url;
      // sessionStorage.setItem('LooseAffiliateAcc',JSON.stringify(this.LooseAffiliateAcc));
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


}
