import { Component, OnInit } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';

@Component({
  selector: 'app-travel-client-accounts',
  templateUrl: './travel-client-accounts.component.html',
  styleUrls: ['./travel-client-accounts.component.scss']
})
export class TravelClientAccountsComponent implements OnInit {

  color: ThemePalette = 'primary';
  checked = false;
  disabled = false;

  public paramResponse: any;
  public clientId: string;
  public clientRes: any;
  public clients: any;

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
  currentUser: any;

  constructor(
    private travelService: TravelAgentService,
    private adminService: AdminService,
    private router: Router,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.searchText = localStorage.getItem('ClientSearch') ? localStorage.getItem('ClientSearch') : ''
    this.loadClientAccounts();//load clients

    this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
  }

  timer: any
  handleSearchKeyword(text: any) {
    console.log('on change search text-->>', text)
    this.searchText = text
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      localStorage.setItem('ClientSearch', text)
      this.loadClientAccounts()
    }, 700)
  }
  handleKeypressEvents() {
    clearTimeout(this.timer)
  }


  loadClientAccounts(pageUrl = null) {
    /** spinner starts on init */
    this.spinner.show();

    var keyword = this.searchText;

    // Load Our clients using API
    this.travelService.getTravelClientAccounts(pageUrl, keyword).then(result => {
      this.clientRes = result;
      this.clients = this.clientRes.data.data;

      this.firstPage = 1;
      this.lastPage = this.clientRes.data.last_page;
      this.totalPage = this.clientRes.data.last_page;
      this.currentPage = this.clientRes.data.current_page;
      this.from = this.clientRes.data.from;
      this.to = this.clientRes.data.to;
      this.path = this.clientRes.data.path;
      this.firstPageUrl = this.clientRes.data.first_page_url;
      this.lastPageUrl = this.clientRes.data.last_page_url;
      this.prevPageUrl = this.clientRes.data.prev_page_url;
      this.nextPageUrl = this.clientRes.data.next_page_url;
      // sessionStorage.setItem('clients',JSON.stringify(this.clients));
      this.spinner.hide();//hide spinner
    })
      .catch(err => {
        this.spinner.hide();//hide spinner
      });
  }

  addTravelPlannerClick(clientId) {
    this.router.navigate([`/${this.currentUser?.roleName}/add-client-account`], { queryParams: { clientId: clientId } });
  }

  clickEditTravelPlanner(clientId) {
    this.router.navigate([`/${this.currentUser?.roleName}/edit-client-account`], { queryParams: { clientId: clientId, type: 'edit' } });
  }

  clickTravelPlannerCards(clientId) {
    this.router.navigate([`/${this.currentUser?.roleName}/debit-cc-card`], { queryParams: { accountType: 'travelPlanner', accountId: clientId.id, name: clientId.first_name } });
  }

  highlighText(args: string) {
    if (!this.searchText) { return args; }
    if (args) {
      args = args.toString()
      var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
      return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
    }
  }

  enableDisableClicked(event, id) {
    this.spinner.show();//show spinner
    console.log(event.checked);
    if (event.checked) {
      var status = 'enable';
    }
    else {
      var status = 'disable';
    }
    this.adminService.travelPlannerAccountStatus(id, status)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
      ).subscribe(result => {

        this.spinner.hide();//hide spinner
      });
  }
  deleteTravelPlannerClient(id) {
    this.spinner.show();
    this.travelService.deleteClient(id)
      .pipe(
        catchError(err => {
          this.spinner.hide();//hide spinner
          return throwError(err);
        })
      ).subscribe(result => {
        this.spinner.hide();//hide spinner
        this.loadClientAccounts()
      });
  }

  //for paginator
  counter() {
    var currentPage;
    var startFrom;
    var endTo;

    if (this.currentPage as number < 5) {
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

}
