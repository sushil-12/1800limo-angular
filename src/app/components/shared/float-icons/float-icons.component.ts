import { Component, OnInit } from '@angular/core';
declare var $: any;
@Component({
	selector: 'app-float-icons',
	templateUrl: './float-icons.component.html',
	styleUrls: ['./float-icons.component.scss']
})
export class FloatIconsComponent implements OnInit
{
	chevron: boolean = false

	constructor() { }


	ngOnInit(): void
	{
		// $("#fixed-form-container .body").hide();
		// $("#fixed-form-container .button").click(function ()
		// {
		// 	$(this).next("#fixed-form-container div").slideToggle(400);
		// 	$(this).toggleClass("expanded");
		// });

		$(document).ready(function() {
			// Add an event listener for Bootstrap modal shown event
			$('#chat-modal').on('shown.bs.modal', function() {
			  console.log('Modal opened');
			  // Do something when the modal is opened
			});
		  
			// Add an event listener for Bootstrap modal hidden event
			$('#chat-modal').on('hidden.bs.modal', function() {
			  console.log('Modal closed');
			//   this.chevronFunctionality()
			  // Do something when the modal is closed
			});
		  });
	}

	chevronFunctionality()
	{
		console.log('chat logo clicked--->>')
		this.chevron = !this.chevron
		console.log(this.chevron)
	}
}

