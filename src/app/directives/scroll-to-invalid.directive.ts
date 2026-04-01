import {
Directive,
HostListener,
ElementRef
} from "@angular/core";
import { FormGroupDirective } from "@angular/forms";

@Directive({
	selector: "[appInvalidControlScroll]"
})
export class InvalidControlScrollDirective {

	constructor(
		private el: ElementRef,
		private formGroupDir: FormGroupDirective
	) { }

	@HostListener("ngSubmit") submitForm() {
		if (this.formGroupDir.control.invalid) {
			console.log("enter in directive")
			this.scrollToFirstInvalidControl();
		}
	}

	private scrollToFirstInvalidControl() {
		let firstInvalidControl: HTMLElement | null;
		firstInvalidControl = this.el.nativeElement.querySelector(
			"input.ng-invalid, textarea.ng-invalid, select.ng-invalid, mat-select.ng-invalid, .mat-mdc-input-element.ng-invalid, .mat-mdc-select.ng-invalid, [formcontrolname].ng-invalid"
		);
		if (!firstInvalidControl) {
			firstInvalidControl = this.el.nativeElement.querySelector(
				".ng-invalid"
			);
		}
		if (!firstInvalidControl) {
			firstInvalidControl = this.el.nativeElement.querySelector(
				".text-danger"
			);
		}

		console.log(firstInvalidControl, "1111111111111111")
		if (!firstInvalidControl) {
			return;
		}

		window.scroll({
			top: this.getTopOffset(firstInvalidControl),
			left: 0,
			behavior: "smooth"
		});
	}

	private getTopOffset(controlEl: HTMLElement): number {
		// console.log(controlEl.getBoundingClientRect());
		const labelOffset = 90;
		return controlEl.getBoundingClientRect().top + window.scrollY - labelOffset;
	}
}
