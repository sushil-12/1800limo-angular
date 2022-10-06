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
		(function smoothscroll()
		{
			var currentScroll = document.documentElement.scrollTop || document.body.scrollTop;
			if (currentScroll > 0)
			{
				window.requestAnimationFrame(smoothscroll);
				window.scrollTo(0, currentScroll - (currentScroll / 8));
			}
		})();
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
	}

}

