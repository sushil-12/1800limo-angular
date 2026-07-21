import {
	Directive,
	HostListener,
	ElementRef
} from "@angular/core";
import { AbstractControl, FormArray, FormGroup, FormGroupDirective } from "@angular/forms";

/**
 * Scrolls the first invalid field of a reactive form into view on submit.
 *
 * Resolution is driven by the *form model* (depth-first, declaration order) and
 * then mapped back to the DOM, rather than by a plain `.ng-invalid` lookup:
 * Angular stamps `ng-invalid` on the host `<form>` too, so a naive query matches
 * the whole form and centring it parks the page in the middle of the page
 * instead of on the offending field.
 */
@Directive({
	selector: "[appInvalidControlScroll]"
})
export class InvalidControlScrollDirective {

	/** Guards against a double scroll when ngSubmit and an explicit call overlap. */
	private lastScrollAt = 0;

	constructor(
		private el: ElementRef,
		private formGroupDir: FormGroupDirective
	) { }

	@HostListener("ngSubmit") onSubmit(): void {
		if (this.formGroupDir.control.invalid) {
			this.scrollToFirstInvalidControl();
		}
	}

	/**
	 * Scroll (and focus) the first invalid field the user can actually act on.
	 * Public so components that submit outside the native submit event (modal
	 * buttons, programmatic saves) can trigger the same behaviour.
	 */
	scrollToFirstInvalidControl(): void {
		const host = this.el?.nativeElement as HTMLElement;
		if (!host) {
			return;
		}

		// Both the ngSubmit listener and an explicit caller may ask within the
		// same interaction — honour only the first request.
		const now = Date.now();
		if (now - this.lastScrollAt < 500) {
			return;
		}

		let target: HTMLElement | null = null;
		let hiddenFallback: HTMLElement | null = null;

		for (const path of this.collectInvalidControlPaths(this.formGroupDir.control)) {
			const el = this.findControlElement(path);
			if (!el) {
				continue;
			}
			if (this.isFieldVisible(el)) {
				target = el;
				break;
			}
			hiddenFallback = hiddenFallback || el;
		}

		// Controls bound with `[formControlName]="…"` (property binding emits no
		// attribute) and custom widgets aren't reachable by path — fall back to
		// whatever the template rendered as invalid.
		if (!target) {
			const invalidWidgets = Array.from(
				host.querySelectorAll<HTMLElement>(
					"input.ng-invalid, select.ng-invalid, textarea.ng-invalid, ng-select.ng-invalid, mat-select.ng-invalid, [formcontrolname].ng-invalid, .mat-form-field-invalid"
				)
			);
			target = invalidWidgets.find((el) => this.isFieldVisible(el))
				|| hiddenFallback
				|| invalidWidgets[0]
				|| host.querySelector<HTMLElement>(".text-danger");
		}

		if (!target) {
			return;
		}

		this.lastScrollAt = now;
		target.scrollIntoView({ behavior: "smooth", block: "center" });

		// ng-select and mat-form-field wrap their own input; native controls focus directly.
		const focusable = target.matches("input, select, textarea")
			? target
			: target.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea');
		if (focusable) {
			setTimeout(() => focusable.focus({ preventScroll: true }), 350);
		}
	}

	/**
	 * Depth-first list of the dotted paths of every invalid leaf control, in
	 * declaration order. Valid and disabled branches are skipped entirely — a
	 * disabled control reports `valid === false` and must not be treated as an
	 * error the user can fix.
	 */
	private collectInvalidControlPaths(control: AbstractControl, path: string[] = [], out: string[] = []): string[] {
		if (!control || control.disabled || control.valid) {
			return out;
		}
		if (control instanceof FormGroup || control instanceof FormArray) {
			Object.keys(control.controls).forEach((key) => {
				this.collectInvalidControlPaths((control as any).controls[key], [...path, key], out);
			});
		}
		else if (path.length) {
			out.push(path.join("."));
		}
		return out;
	}

	/**
	 * Resolve the DOM node rendering a control path (e.g. `loose_customer.phone`).
	 * Walks the formGroupName/formArrayName chain first so a nested control whose
	 * name also exists at root level can't match the wrong element, and prefers a
	 * visible candidate when the same control is rendered more than once.
	 */
	private findControlElement(path: string): HTMLElement | null {
		const parts = path.split(".");
		const name = parts.pop();
		let scope: ParentNode = this.el?.nativeElement as ParentNode;
		if (!scope || !name) {
			return null;
		}
		for (const groupName of parts) {
			const next = scope.querySelector<HTMLElement>(
				`[formgroupname="${groupName}"], [formarrayname="${groupName}"]`
			);
			if (!next) {
				break;
			}
			scope = next;
		}
		const candidates = Array.from(scope.querySelectorAll<HTMLElement>(`[formcontrolname="${name}"]`));
		return candidates.find((el) => this.isFieldVisible(el)) || candidates[0] || null;
	}

	/** An element counts as reachable only if it actually occupies space on screen. */
	private isFieldVisible(el: HTMLElement): boolean {
		if (!el) {
			return false;
		}
		const rect = el.getBoundingClientRect();
		return !!(el.offsetParent || el.getClientRects().length) && rect.width > 0 && rect.height > 0;
	}
}
