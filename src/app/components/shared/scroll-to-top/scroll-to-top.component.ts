import { Component, HostListener, OnInit } from '@angular/core';

@Component({
	selector: 'app-scroll-to-top',
	templateUrl: './scroll-to-top.component.html',
	styleUrls: ['./scroll-to-top.component.scss']
})
export class ScrollToTopComponent implements OnInit
{
	showScrollTop: boolean = false;
	showScrollDown: boolean = true;

	scrollTop()
	{
		window.scrollTo({
			top: 0,
			behavior: "smooth" // Optional, adds smooth scrolling effect
		  });
		
		// (function smoothscroll()
		// {
		// 	var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
		// 	console.log(currentScroll);
		// 	if (currentScroll > 0)
		// 	{
				
		// 		// window.requestAnimationFrame(smoothscroll);
				
		// 	}
		// })();
	}


	scrollDown(){
			window.scrollTo({
			  top: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight),
			  behavior: "smooth" // Optional, adds smooth scrolling effect
			});
		// (function smoothDownScroll()
		// {
		// 	var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
		// 	if (currentScroll < (document.documentElement.scrollHeight-700))
		// 	{
		// 		window.requestAnimationFrame(smoothDownScroll);
		// 		window.scrollTo(0, currentScroll + ((currentScroll + 50) / 8));
		// 	}
		// })();
	}

	ngOnInit()
	{
		this.updateScrollButtons();
	}

	@HostListener('window:scroll')
	@HostListener('window:resize')
	updateScrollButtons()
	{
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
		const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
		const documentHeight = Math.max(
			document.body.scrollHeight,
			document.documentElement.scrollHeight,
			document.body.offsetHeight,
			document.documentElement.offsetHeight
		);
		const threshold = 160;

		this.showScrollTop = scrollTop > threshold;
		this.showScrollDown = (scrollTop + viewportHeight) < (documentHeight - threshold);
	}
}
