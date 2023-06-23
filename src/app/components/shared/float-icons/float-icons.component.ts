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
		$("#fixed-form-container .body").hide();
		$("#fixed-form-container .button").click(function ()
		{
			$(this).next("#fixed-form-container div").slideToggle(400);
			$(this).toggleClass("expanded");
		});
	}

	chevronFunctionality()
	{
		console.log('chat logo clicked--->>')
		this.chevron = !this.chevron
		console.log(this.chevron)
	}
}

