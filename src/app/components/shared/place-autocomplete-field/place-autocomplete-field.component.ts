import { CommonModule } from '@angular/common';
import {
	AfterViewInit,
	ChangeDetectionStrategy,
	ChangeDetectorRef,
	Component,
	CUSTOM_ELEMENTS_SCHEMA,
	EventEmitter,
	forwardRef,
	Input,
	OnDestroy,
	Output,
	ViewChild,
	ElementRef,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
	attachPlaceAutocompleteElement,
	detachPlaceAutocompleteElement,
	syncPlaceAutocompleteDisplay,
} from '../../../utils/google-place-autocomplete';

/**
 * Angular wrapper around `gmp-place-autocomplete` with ControlValueAccessor.
 * The visible address string is bound to the form; use `(placeSelected)` for lat/lng / full PlaceResult.
 */
@Component({
	selector: 'app-place-autocomplete-field',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './place-autocomplete-field.component.html',
	styleUrls: ['./place-autocomplete-field.component.scss'],
	providers: [
		{
			provide: NG_VALUE_ACCESSOR,
			useExisting: forwardRef(() => PlaceAutocompleteFieldComponent),
			multi: true,
		},
	],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	changeDetection: ChangeDetectionStrategy.OnPush,
	host: {
		class: 'place-autocomplete-field-host',
	},
})
export class PlaceAutocompleteFieldComponent implements ControlValueAccessor, AfterViewInit, OnDestroy {
	@ViewChild('nativeInput', { static: true }) nativeInputRef!: ElementRef<HTMLInputElement>;

	@Input() placeholder = '';
	@Input() inputId = '';
	@Input() ariaLabel = '';
	/** Passed to Places Autocomplete `types` (e.g. geocode, establishment). */
	@Input() types: string[] = ['geocode', 'establishment'];
	/**
	 * Classes copied onto the hidden input and mirrored onto the GMP host (Material input styling).
	 */
	@Input() inputClass = 'mat-mdc-input-element mat-input-element';
	@Input() extraClass = '';
	/** When true, prevents editing (e.g. family-member view) while keeping the value in the form. */
	@Input() readOnly = false;
	/**
	 * When true, use GMP `PlaceAutocompleteElement` on mobile (Google’s full-screen picker).
	 * Default false: mobile uses legacy `Autocomplete` for an inline, themeable dropdown.
	 */
	@Input() forceGmpOnMobile = false;
	/** Leading search icon + left border-radius (e.g. home quote next to clear button on the right). */
	@Input() showSearchIcon = false;

	@Output() placeSelected = new EventEmitter<google.maps.places.PlaceResult>();

	private _disabled = false;
	private onChangeFn: (value: string) => void = () => {};
	private onTouchedFn: () => void = () => {};

	constructor(private cdr: ChangeDetectorRef) {}

	ngAfterViewInit(): void {
		const el = this.nativeInputRef.nativeElement;
		const cls = [this.inputClass, this.extraClass].filter(Boolean).join(' ').trim();
		if (cls) {
			el.className = `${cls} place-autocomplete-field__native`.trim();
		}
		void this.initGmp(el);
	}

	ngOnDestroy(): void {
		const el = this.nativeInputRef?.nativeElement;
		if (el) {
			detachPlaceAutocompleteElement(el);
		}
	}

	private async initGmp(el: HTMLInputElement): Promise<void> {
		try {
			await attachPlaceAutocompleteElement(el, { types: this.types, forceGmpOnMobile: this.forceGmpOnMobile }, (place) => {
				this.handlePlaceSelected(place);
			});
		} catch {
			/* attach logs */
		}
		this.applyGmpDisabledState(el);
		if (this.readOnly) {
			el.readOnly = true;
			el.nextElementSibling?.setAttribute?.('disabled', '');
		}
		queueMicrotask(() => syncPlaceAutocompleteDisplay(el));
		this.cdr.markForCheck();
	}

	private handlePlaceSelected(place: google.maps.places.PlaceResult): void {
		if (!place.geometry?.location) {
			return;
		}
		const formattedAddress = place.formatted_address ?? '';
		const placeName = place.name ?? '';
		const displayAddress = placeName ? `${placeName} - ${formattedAddress}` : formattedAddress;
		const el = this.nativeInputRef.nativeElement;
		el.value = displayAddress;
		this.onChangeFn(displayAddress);
		this.onTouchedFn();
		this.placeSelected.emit(place);
		this.cdr.markForCheck();
	}

	writeValue(value: string | null): void {
		const v = value ?? '';
		const el = this.nativeInputRef?.nativeElement;
		if (el) {
			el.value = v;
			queueMicrotask(() => syncPlaceAutocompleteDisplay(el));
		}
		this.cdr.markForCheck();
	}

	registerOnChange(fn: (value: string) => void): void {
		this.onChangeFn = fn;
	}

	registerOnTouched(fn: () => void): void {
		this.onTouchedFn = fn;
	}

	setDisabledState(isDisabled: boolean): void {
		this._disabled = isDisabled;
		const el = this.nativeInputRef?.nativeElement;
		if (el) {
			el.disabled = isDisabled;
			this.applyGmpDisabledState(el);
		}
		this.cdr.markForCheck();
	}

	private applyGmpDisabledState(el: HTMLInputElement): void {
		const pac = el.nextElementSibling;
		if (!pac || pac.tagName.toLowerCase() !== 'gmp-place-autocomplete') {
			return;
		}
		if (this._disabled) {
			pac.setAttribute('disabled', '');
		} else {
			pac.removeAttribute('disabled');
		}
	}

	onNativeFocus(ev: FocusEvent): void {
		(ev.target as HTMLInputElement)?.select?.();
	}

	onNativeBlur(): void {
		this.onTouchedFn();
	}
}
