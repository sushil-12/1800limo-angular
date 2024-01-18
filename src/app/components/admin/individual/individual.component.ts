import { Component, OnInit } from '@angular/core';
import { AdminService } from '../../../services/admin.service';
import { Router } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { ThemePalette } from '@angular/material/core';
declare var $: any;
@Component({
	selector: 'app-individual',
	templateUrl: './individual.component.html',
	styleUrls: ['./individual.component.scss']
})
export class IndividualComponent implements OnInit {

	color: ThemePalette = 'primary';
	checked = false;
	disabled = false;

	public paramResponse: any;
	public individualId: string;
	public individualsRes: any;
	public individuals: any;

	public firstPage: Number;
	public lastPage: Number;
	public totalPage: Number;
	public currentPage: Number;
	public from: Number;
	public to: Number;
	public path: string;
	public firstPageUrl: string;
	public lastPageUrl: string;
	public prevPageUrl: string;
	public nextPageUrl: string;
	searchText: string = '';

	constructor(
		private adminService: AdminService,
		private router: Router,
		private spinner: NgxSpinnerService) { }

	ngOnInit(): void {
		this.searchText = localStorage.getItem('individualSearch') ? localStorage.getItem('individualSearch') : ''
		this.loadIndividuals();//load individuals

	}

	timer: any
	handleSearchKeyword(text: any) {
		console.log('on change search text-->>', text)
		this.searchText = text
		clearTimeout(this.timer);
		this.timer = setTimeout(() => {
			localStorage.setItem('individualSearch', text)
			this.loadIndividuals()
		}, 700)
	}
	handleKeypressEvents() {
		clearTimeout(this.timer)
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

	loadIndividuals(pageUrl = null) {
		/** spinner starts on init */
		// this.spinner.show();
		if(pageUrl){
			console.log("pageurl",pageUrl)
			this.scroll('individual_table')
		}
		// var keyword = ((document.getElementById("keyword") as HTMLInputElement).value);
		let keyword = this.searchText
		// console.log(keyword);
		// Load Our individuals using API
		this.adminService.individualAccounts(pageUrl, keyword).then(result => {
			this.individualsRes = result;
			this.individuals = this.individualsRes.data.data;

			this.firstPage = 1;
			this.lastPage = this.individualsRes.data.last_page;
			this.totalPage = this.individualsRes.data.last_page;
			this.currentPage = this.individualsRes.data.current_page;
			this.from = this.individualsRes.data.from;
			this.to = this.individualsRes.data.to;
			this.path = this.individualsRes.data.path;
			this.firstPageUrl = this.individualsRes.data.first_page_url;
			this.lastPageUrl = this.individualsRes.data.last_page_url;
			this.prevPageUrl = this.individualsRes.data.prev_page_url;
			this.nextPageUrl = this.individualsRes.data.next_page_url;
			// sessionStorage.setItem('individuals',JSON.stringify(this.individuals));
			// this.spinner.hide();//hide spinner
		})
			.catch(err => {
				// this.spinner.hide();//hide spinner
			});
	}

	addIndividualClick(individualId) {
		this.router.navigate(['/admin/add-individual-account'], { queryParams: { individualId: individualId } });
	}

	clickEditIndividual(individualId) {

		this.router.navigate(['/admin/edit-individual-account'], { queryParams: { individualId: individualId } });
	}

	clickIndividualCards(individualId) {
		this.router.navigate(['/admin/cards'], { queryParams: { accountType: 'individual', accountId: individualId } });
	}

	highlighText(args: string) {
		if (!this.searchText) { return args; }
		if (args) {
			args = args.toString()
			var re = new RegExp(this.searchText, 'gi'); //'gi' for case insensitive and can use 'g' if you want the search to be case sensitive.
			return args.replace(re, '<mark class="font-weight-bold">$&</mark>');
		}
	}

	messagetype: Record<string, any>
	sendMessage(type: 'email' | 'sms', individual: Object, message: string = null) {
		console.log('Request to send a Message to individual id: ', type, individual['id'])
		this.messagetype = { type, individual }
		$('#messageModal').modal('show')
		$('#messageModal').find('.modal-header').find('h4').text('Contact to Individual via ' + type.toUpperCase())
		$('#messageModal').find('.modal-body').find('p#affiliate-details').html(`Individual Name: ${individual['first_name']} ${individual['last_name']}<br/>Individual Email: ${individual['email']}`)
		if (message != null) {
			this.adminService.sendAffiliateMessage(type, individual['id'], { sendContent: message },).subscribe((response: any) => {
				if (response.success) {
					console.log('Message Sent Successfully. ')
				}
			})
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
		this.adminService.individualAccountStatus(id, status)
			.pipe(
				catchError(err => {
					this.spinner.hide();//hide spinner
					return throwError(err);
				})
			).subscribe(result => {

				this.spinner.hide();//hide spinner
			});
	}

	//for pagination
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
}
