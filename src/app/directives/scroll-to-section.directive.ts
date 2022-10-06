import
{
	Directive, OnInit, ElementRef
} from "@angular/core";
import { Router } from '@angular/router';

@Directive({
	selector: '[appScrollToSection]'
})
export class ScrollToSectionDirective implements OnInit
{

	constructor(
		private router: Router,
	) { }

	ngOnInit()
	{

		const tree = this.router.parseUrl(this.router.url);
		const currentRoute = tree.root.children.primary.segments[0].path;
		if (currentRoute == 'services')
		{
			setTimeout(() =>
			{
				const labelOffset = 50;
				let eleementt: HTMLElement;
				eleementt = document.getElementById("ourservice_wrapper")
				const finnll = eleementt.getBoundingClientRect().top - labelOffset;
				window.scroll({
					top: finnll,
					left: 0,
					behavior: "smooth"
				});
			}, 10)
		}
		if (currentRoute == 'quotebot_section')
		{
			setTimeout(() =>
			{
				const labelOffset = 50;
				let eleementt: HTMLElement;
				eleementt = document.getElementById("quotebot_redirect");
				const finnll = eleementt.getBoundingClientRect().top - labelOffset;
				window.scroll({
					top: finnll,
					left: 0,
					behavior: "smooth"
				});
			}, 10)
		}
	}
}
