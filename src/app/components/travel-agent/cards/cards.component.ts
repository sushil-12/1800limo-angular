import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorDialogService } from 'src/app/services/error-dialog/errordialog.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';
declare var $: any;

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {
	public cards: any;
  alertMessage: string;
	public cardToDelete: any;
	clientId: any= null;
	name :any = 'Agent'
	currentUser:any;


  constructor(
    private TravelAgentService: TravelAgentService,
		private router: Router,
		private spinner: NgxSpinnerService,
		private $errors: ErrorDialogService,
		private $form: FormBuilder,
		private stateManagementService: StateManagementService,
		private activatedroute: ActivatedRoute
  ) { }

  ngOnInit(): void {
	this.currentUser = JSON.parse(localStorage.getItem('currentUser'))
	this.activatedroute.queryParams.subscribe((params: any) => {
		console.log('params---->>>>>', params)
		if(params && params.accountId){
			this.clientId = params?.accountId
		}
		if(params && params.name){
			this.name = params?.name
		}
		})
		if(this.clientId){
			this.loadCards(this.clientId)
		}
		else{
			this.loadCards()
		}
  }

  loadCards(id=null) {
		// Load Our cards using API
		this.TravelAgentService.cardsList(id).pipe(
      catchError(err => {
        this.stateManagementService.setprogressBar(false);//hide progressbar
        return throwError(err);
      })).subscribe(({data}:any) => {
			// this.cardsRes = result;
      console.log('data--->>>' , data)
			this.cards = data;
			this.stateManagementService.setprogressBar(false);
		});
	}

  addCardClick() {
    // { queryParams: { accountType: this.accountType, accountId: accountId } }
		this.router.navigate([`/${this.currentUser?.roleName}/add-card`]);
	}
  backButtonClick() {
	}
  delete() {
		this.stateManagementService.setprogressBar(true);
		$('#deleteConfirmationModal').modal('hide');
		this.TravelAgentService.deleteCard(this.cardToDelete)
			.pipe(
				catchError(err => {
					this.stateManagementService.setprogressBar(false);
					return throwError(err);
				})
			).subscribe(result => {
				window.location.reload();
				this.stateManagementService.setprogressBar(false);
			});
	}
  deleteCard(id) {
		this.cardToDelete = id;
		console.log("hgsdfj>>>>>>>>>>>>>>>>>>>>??????????????????????????", this.cardToDelete)
		this.alertMessage = "Are you sure you want to delete this Card?"
	}
}
