import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

/**
 * Special Instructions quill editor. Rendered twice by BookingComponent —
 * once for the one-way form (prefix '', variant 'card') and once for the
 * return-trip form (prefix 'return_', variant 'inline') — matching each
 * call site's existing surrounding chrome exactly, since only the visual
 * redesign pass (not this extraction) should change how either looks.
 */
@Component({
	selector: 'app-special-instructions-section',
	templateUrl: './special-instructions-section.component.html',
})
export class SpecialInstructionsSectionComponent {
	@Input() group!: FormGroup;
	@Input() prefix: 'return_' | '' = '';
	@Input() quillModules: any;
	@Input() variant: 'card' | 'inline' = 'card';

	@Output() editorCreated = new EventEmitter<any>();

	get controlName(): string {
		return this.prefix + 'booking_instructions';
	}

	get heading(): string {
		return this.prefix ? 'Return Special Instructions' : 'Special Instructions';
	}

	get placeholder(): string {
		return this.prefix
			? 'Return Special Instructions / Exact Building Name'
			: 'Special Instructions / Exact Building Name';
	}
}
