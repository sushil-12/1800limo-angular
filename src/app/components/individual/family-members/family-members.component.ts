import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AdminService } from 'src/app/services/admin.service';
import { IndividualService } from 'src/app/services/individual.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';
declare var $: any;

@Component({
  selector: 'app-family-members',
  templateUrl: './family-members.component.html',
  styleUrls: ['./family-members.component.scss']
})
export class FamilyMembersComponent implements OnInit {

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
  public rejectCauseForm: FormGroup;
  public submitted: boolean = false;

  constructor(
    private individualService: IndividualService,
    private adminService: AdminService,
    private router: Router,
    private $form: FormBuilder,
    private spinner: NgxSpinnerService) { }

  ngOnInit(): void {
    this.searchText = localStorage.getItem('familyMemberSearch') ? localStorage.getItem('familyMemberSearch') : ''
    this.loadClientAccounts();//load clients

  }

  timer: any
  handleSearchKeyword(text: any) {
    console.log('on change search text-->>', text)
    this.searchText = text
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      localStorage.setItem('familyMemberSearch', text)
      this.loadClientAccounts()
    }, 700)
  }
  handleKeypressEvents() {
    clearTimeout(this.timer)
  }




  scroll(id) {

    let el = document.getElementById(id);
    console.log(`scrolling to ${id}`, el);
    el.scrollIntoView({ behavior: 'smooth' });
  }

  loadClientAccounts(pageUrl = null) {
    /** spinner starts on init */
    if (pageUrl) {
      console.log("pageurl", pageUrl)
      this.scroll('family_member_list')
    }
    this.spinner.show();

    var keyword = this.searchText;

    // Load Our clients using API
    this.individualService.getFamilyMemberList(pageUrl, keyword).then(result => {
      this.clientRes = result;
      this.clients = this.clientRes?.data;

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


  highlighText(args: string) {
    if (!this.searchText) { return args; }
    if (args) {
      args = args.toString()
      var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
      return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
    }
  }

  //for paginator
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

  editFamilyMember(id) {
    this.router.navigate(['/individual/edit-family-member'], { queryParams: { id: id } });
  }

  addFamilyMember() {
    this.router.navigate(['/individual/add-family-member']);
  }

}
