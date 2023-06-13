import { Component, OnInit } from '@angular/core';
declare var $: any;

@Component({
	selector: 'app-scroll-to-top',
	templateUrl: './scroll-to-top.component.html',
	styleUrls: ['./scroll-to-top.component.scss']
})
export class ScrollToTopComponent implements OnInit
{

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
			  top: document.body.scrollHeight,
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
		$(window).scroll(function ()
		{
			var vH = $(window).height(),
				bodyHeight = ($(document).height() - (vH * 2)),
				scrolledPX = $(window).scrollTop();
			if (scrolledPX > bodyHeight)
			{
				$('.scrollTopButton').css('opacity', '1');
				$('.scrollTopButton').css('z-index', '0');
			} else
			{
				$('.scrollTopButton').css('opacity', '0');
				$('.scrollTopButton').css('z-index', '-1');
			};
		});
		$(window).scroll(function (){
			var vH = $(window).height(),
				bodyHeight = ($(document).height() - (vH * 2)),
				scrolledPX = $(window).scrollTop();
			if (scrolledPX < bodyHeight)
			{
				$('.scrollDownButton').css('opacity', '1');
				$('.scrollDownButton').css('z-index', '0');
			} else
			{
				$('.scrollDownButton').css('opacity', '0');
				$('.scrollDownButton').css('z-index', '-1');
			};
		});
	}

}

