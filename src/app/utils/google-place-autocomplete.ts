import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * Binds Google's recommended PlaceAutocompleteElement to an existing text input:
 * hides the input (keeps Angular/form bindings), inserts the web component after it,
 * and maps the new Place API result to legacy PlaceResult for existing handlers.
 */
const CLEANUP_KEY = '__gmpPlaceAutocompleteCleanup';
const GMP_ATTACH_SHADOW_PATCHED_KEY = '__gmpAttachShadowPatched';

export interface AttachPlaceAutocompleteOptions {
	types?: string[];
	/** Ignored for fetchFields; new API always loads id, displayName, formattedAddress, location, addressComponents, types */
	fields?: string[];
	/** When set, keeps the visible gmp widget in sync after patchValue/setValue (e.g. async API load). */
	syncControl?: AbstractControl;
}

function newPlaceToLegacyPlaceResult(place: {
	id?: string;
	displayName?: string;
	formattedAddress?: string;
	location?: google.maps.LatLng | google.maps.LatLngLiteral | null;
	addressComponents?: Array<{ longText: string; shortText: string; types: string[] }>;
	types?: string[];
}): google.maps.places.PlaceResult {
	let latLng: google.maps.LatLng | undefined;
	const loc = place.location;
	if (loc) {
		if (typeof (loc as google.maps.LatLng).lat === 'function') {
			latLng = loc as google.maps.LatLng;
		} else {
			const l = loc as google.maps.LatLngLiteral;
			latLng = new google.maps.LatLng(l.lat, l.lng);
		}
	}
	const address_components = (place.addressComponents || []).map((c) => ({
		long_name: c.longText,
		short_name: c.shortText,
		types: c.types,
	}));
	return {
		formatted_address: place.formattedAddress,
		name: place.displayName,
		geometry: latLng ? { location: latLng } : undefined,
		address_components,
		place_id: place.id,
		types: place.types,
	} as google.maps.places.PlaceResult;
}

/**
 * Injects a one-time global <style> tag that suppresses the GMP focus ring
 * via CSS custom properties (these DO pierce closed shadow roots).
 */
function injectGmpFocusRingSuppressor(): void {
	const STYLE_ID = '__gmp-focus-ring-suppressor';
	if (document.getElementById(STYLE_ID)) {
		return; // Already injected
	}
	const style = document.createElement('style');
	style.id = STYLE_ID;
	style.textContent = `
		gmp-place-autocomplete {
			/* Suppress GMP's internal blue focus ring via its own CSS custom properties.
			   CSS custom properties DO pierce closed shadow roots unlike selectors. */
			--gmp-color-stroke-input-focus: transparent;
			--gmp-focus-ring-color: transparent;

			/* Suppress any host-level outline/border */
			outline: none !important;
			box-shadow: none !important;
		}

		gmp-place-autocomplete:focus,
		gmp-place-autocomplete:focus-within,
		gmp-place-autocomplete:focus-visible {
			outline: none !important;
			box-shadow: none !important;
			border-color: transparent !important;
		}
	`;
	document.head.appendChild(style);
}

/**
 * Optional GMP Shadow DOM patch:
 * forces gmp-place-autocomplete shadow root to open and injects custom styles.
 * This is intentionally guarded and applied once.
 */
function installGmpAttachShadowPatch(): void {
	if (typeof window === 'undefined' || typeof Element === 'undefined') {
		return;
	}
	const w = window as typeof window & { [GMP_ATTACH_SHADOW_PATCHED_KEY]?: boolean };
	if (w[GMP_ATTACH_SHADOW_PATCHED_KEY]) {
		return;
	}

	const originalAttachShadow = Element.prototype.attachShadow;

	Element.prototype.attachShadow = function (init: ShadowRootInit): ShadowRoot {
	if (this.localName === 'gmp-place-autocomplete') {
		const shadow = originalAttachShadow.call(this, { ...init, mode: 'open' });

		const style = document.createElement('style');
			style.textContent = `
			.widget-container { border: none !important; }
			.input-container {
				padding: 0 !important;
				color: #000 !important;
			}
			.input-container,
			.input-container input,
			input{padding-right:25px !important;},
			[role="option"],
			.suggestion-item,
			.text-content,
			.primary-text,
			.secondary-text,
			.place-name,
			.place-address {
				text-align: left !important;
				color: #000 !important;
			}
			[role="listbox"],
			.suggestions-container,
			.suggestion-list,
			.list-container {
				background: #fff !important;
				color: #000 !important;
			}
			[role="option"] {
				border-bottom: 1px solid rgba(0,0,0,0.12) !important;
			}
			[role="option"][aria-selected="true"],
			[role="option"]:hover,
			[role="option"]:focus,
			[role="option"]:focus-visible,
			.suggestion-item:hover,
			.suggestion-item:focus,
			.suggestion-item:focus-visible {
				background: #f3f4f6 !important;
				color: #000 !important;
			}
			svg,
			.location-icon,
			.leading-icon,
			.icon,
			[aria-hidden="true"] {
				color: #000 !important;
				fill: #000 !important;
				stroke: #000 !important;
				opacity: 1 !important;
				font-weight: 700 !important;
			}
			.place-autocomplete-element-row .place-autocomplete-element-prediction-item-icon {
				padding: 6px !important;
				position: relative !important;
				width: 30px !important;
				height: 30px !important;
				background-color: transparent !important;
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M12 21.25c-.27 0-.53-.11-.72-.31-.86-.9-6.03-6.36-6.03-11.02C5.25 5.82 8.28 3 12 3s6.75 2.82 6.75 6.92c0 4.66-5.17 10.12-6.03 11.02-.19.2-.45.31-.72.31Z' stroke='%23000' stroke-width='1.9' stroke-linecap='round' stroke-linejoin='round'/%3E%3Ccircle cx='12' cy='9.92' r='2.65' stroke='%23000' stroke-width='1.9'/%3E%3C/svg%3E") !important;
				background-repeat: no-repeat !important;
				background-position: center !important;
				background-size: 0 !important;
				border-radius: 0 !important;
			}
			.place-autocomplete-element-row .place-autocomplete-element-prediction-item-icon svg,
			.place-autocomplete-element-row .place-autocomplete-element-prediction-item-icon [aria-hidden="true"] {
				opacity: 0 !important;
			}
			.place-autocomplete-element-row .place-autocomplete-element-prediction-item-icon svg,
			.location-icon svg,
			.leading-icon svg,
			.icon svg {
				display: block !important;
				width: 18px !important;
				height: 18px !important;
				overflow: visible !important;
				transform: translateZ(0) !important;
				-webkit-transform: translateZ(0) !important;
			}
			.place-autocomplete-element-row .place-autocomplete-element-prediction-item-icon path,
			.location-icon path,
			.leading-icon path,
			.icon path {
				fill: #000 !important;
				stroke: #000 !important;
				opacity: 1 !important;
			}
			.place-autocomplete-element-row .place-autocomplete-element-text-div{text-align:left !important;}
			input::placeholder,
			.input-container input::placeholder {
				color: #6b7280 !important;
				opacity: 1 !important;
			}
			.focus-ring { display: none !important; }
			button[aria-label*="Clear"],
			button[title*="Clear"],
			.clear-button,
			.clear-icon {
				display: none !important;
			}

		:host {
			display: block;
			min-height: 45px;
			position: relative;
			color: #000 !important;
		}

		:host *,
		:host input,
		:host button,
		:host [role="option"] {
			color: #000 !important;
		}

		/* 🔥 MAIN FIX: override full screen dialog */
		dialog.full-window-autocomplete-dialog[open] {
			position: fixed !important;
			inset: unset !important;
			top: var(--dialog-top, 100px) !important;
			left: var(--dialog-left, 0px) !important;
			width: var(--dialog-width, 100%) !important;
			max-height: 250px !important;
			border-radius: 5px !important;
			overflow-y: auto !important;
			box-shadow: 0 6px 16px rgba(0,0,0,0.2) !important;
			margin: 0 !important;
			transform: none !important;
			background: #fff !important;
			color: #000 !important;
		}
		dialog.full-window-autocomplete-dialog[open] * {
			background: transparent !important;
			color: #000 !important;
		}
		dialog.full-window-autocomplete-dialog[open] [role="listbox"],
		dialog.full-window-autocomplete-dialog[open] [role="option"],
		dialog.full-window-autocomplete-dialog[open] .suggestion-item,
		dialog.full-window-autocomplete-dialog[open] .text-content {
			background: #fff !important;
			color: #000 !important;
		}
		@media (max-width: 767px) {
			dialog.full-window-autocomplete-dialog[open] .text-content,
			dialog.full-window-autocomplete-dialog[open] .primary-text,
			dialog.full-window-autocomplete-dialog[open] .secondary-text,
			dialog.full-window-autocomplete-dialog[open] .place-name,
			dialog.full-window-autocomplete-dialog[open] .place-address {
				width: 100% !important;
				text-align: left !important;
			}
		}
		`;

		shadow.appendChild(style);
		return shadow;
	}

	return originalAttachShadow.call(this, init);
	};

	w[GMP_ATTACH_SHADOW_PATCHED_KEY] = true;
}

function restoreMobileAutocompleteFocus(pac: HTMLElement): void {
	if (typeof window === 'undefined' || !window.matchMedia('(max-width: 767px)').matches) {
		return;
	}

	const focusInnerInput = (retries = 10) => {
		try {
			const root = (pac as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot;
			const inner = root?.querySelector?.('input');
			if (inner instanceof HTMLInputElement) {
				const resetToStart = () => {
					inner.focus({ preventScroll: true });
					inner.setSelectionRange(0, 0);
					inner.scrollLeft = 0;
				};
				resetToStart();
				requestAnimationFrame(resetToStart);
			} else if (retries > 0) {
				setTimeout(() => focusInnerInput(retries - 1), 50);
			}
		} catch {
			if (retries > 0) {
				setTimeout(() => focusInnerInput(retries - 1), 50);
			}
		}
	};

	setTimeout(() => focusInnerInput(), 0);
}

export async function attachPlaceAutocompleteElement(
	nativeInput: HTMLInputElement,
	_options: AttachPlaceAutocompleteOptions | undefined,
	onPlaceSelect: (place: google.maps.places.PlaceResult) => void
): Promise<void> {
	installGmpAttachShadowPatch();
	const prev = (nativeInput as unknown as Record<string, unknown>)[CLEANUP_KEY];
	if (typeof prev === 'function') {
		(prev as () => void)();
	}

	const gmaps = google.maps as unknown as {
		importLibrary?: (name: string) => Promise<Record<string, unknown>>;
	};

	let PlaceAutocompleteElement: (new () => HTMLElement) | undefined;

	if (gmaps.importLibrary) {
		const placesLib = await gmaps.importLibrary('places');
		PlaceAutocompleteElement = placesLib['PlaceAutocompleteElement'] as new () => HTMLElement;
	} else {
		PlaceAutocompleteElement = (
			google.maps.places as unknown as {
				PlaceAutocompleteElement?: new () => HTMLElement;
			}
		).PlaceAutocompleteElement;
	}

	if (!PlaceAutocompleteElement) {
		console.error(
			'PlaceAutocompleteElement is not available. Use a current Maps JavaScript API build with importLibrary("places").'
		);
		return;
	}

	// Inject global CSS suppressor once (no-op if already done)
	injectGmpFocusRingSuppressor();

	const pac = new PlaceAutocompleteElement();
	pac.id = nativeInput.id;
	pac.className = nativeInput.className;
	const styleAttr = nativeInput.getAttribute('style');
	if (styleAttr) {
		pac.setAttribute('style', styleAttr);
	}
	const ph = nativeInput.getAttribute('placeholder');
	if (ph) {
		pac.setAttribute('placeholder', ph);
	}
	pac.setAttribute('tabindex', String(nativeInput.tabIndex));

	const prevDisplay = nativeInput.style.display;
	const prevPosition = nativeInput.style.position;
	const prevWidth = nativeInput.style.width;
	const prevHeight = nativeInput.style.height;
	const prevOpacity = nativeInput.style.opacity;
	const prevPointer = nativeInput.style.pointerEvents;

	nativeInput.style.display = 'none';
	nativeInput.style.position = 'absolute';
	nativeInput.style.width = '0';
	nativeInput.style.height = '0';
	nativeInput.style.opacity = '0';
	nativeInput.style.pointerEvents = 'none';

	nativeInput.after(pac);

	const updatePlacement = () => {
		const rect = pac.getBoundingClientRect();
		// Avoid anchoring to negative (offscreen top) if weird scroll bounce occurs, though 
		// fixed positioning handles out of viewport cleanly.
		pac.style.setProperty('--dialog-top', `${rect.top}px`);
		pac.style.setProperty('--dialog-left', `${rect.left}px`);
		pac.style.setProperty('--dialog-width', `${rect.width}px`);
	};

	pac.addEventListener('click', updatePlacement);
	pac.addEventListener('focusin', updatePlacement);
	window.addEventListener('resize', updatePlacement);
	window.addEventListener('scroll', updatePlacement, { capture: true, passive: true });

	// Force initial placement calculation slightly after attach
	setTimeout(updatePlacement, 50);

	const handler = async (ev: Event) => {
		const raw = ev as unknown as {
			placePrediction?: { toPlace: () => unknown };
		};
		const placePrediction =
			raw.placePrediction ??
			(ev as unknown as CustomEvent<{ placePrediction?: { toPlace: () => unknown } }>).detail
				?.placePrediction;
		if (!placePrediction) {
			// User cleared the input via the GMP internal 'x' button!
			onPlaceSelect({
				formatted_address: '',
				name: '',
				geometry: undefined,
				address_components: [],
				place_id: '',
				types: []
			} as unknown as google.maps.places.PlaceResult);
			return;
		}
		const place = placePrediction.toPlace() as {
			fetchFields: (o: { fields: string[] }) => Promise<void>;
			id?: string;
			displayName?: string;
			formattedAddress?: string;
			location?: google.maps.LatLng | google.maps.LatLngLiteral | null;
			addressComponents?: Array<{ longText: string; shortText: string; types: string[] }>;
			types?: string[];
		};
		await place.fetchFields({
			fields: ['id', 'displayName', 'formattedAddress', 'location', 'addressComponents', 'types'],
		});
		onPlaceSelect(newPlaceToLegacyPlaceResult(place));
		restoreMobileAutocompleteFocus(pac);
	};

	pac.addEventListener('gmp-select', handler as EventListener);

	let valueSub: Subscription | undefined;
	if (_options?.syncControl) {
		valueSub = _options.syncControl.valueChanges.subscribe(() => {
			queueMicrotask(() => syncPlaceAutocompleteDisplay(nativeInput));
		});
	}

	const cleanup = () => {
		valueSub?.unsubscribe();
		valueSub = undefined;
		pac.removeEventListener('gmp-select', handler as EventListener);
		pac.removeEventListener('click', updatePlacement);
		pac.removeEventListener('focusin', updatePlacement);
		window.removeEventListener('resize', updatePlacement);
		window.removeEventListener('scroll', updatePlacement, { capture: true } as EventListenerOptions);
		pac.remove();
		nativeInput.style.display = prevDisplay;
		nativeInput.style.position = prevPosition;
		nativeInput.style.width = prevWidth;
		nativeInput.style.height = prevHeight;
		nativeInput.style.opacity = prevOpacity;
		nativeInput.style.pointerEvents = prevPointer;
		delete (nativeInput as unknown as Record<string, unknown>)[CLEANUP_KEY];
	};

	(nativeInput as unknown as Record<string, unknown>)[CLEANUP_KEY] = cleanup;

	/** FormControl writes to the hidden input; the visible web component must be synced. */
	queueMicrotask(() => syncPlaceAutocompleteDisplay(nativeInput));
	queueMicrotask(() => syncRestoredPlaceAutocompleteValue(nativeInput, _options?.syncControl));
}

/**
 * Resolves the FormControl tied to a booking address field (pickup, dropoff,
 * loose_customer.address, extra_stops[].address, …)
 * for use as `syncControl` on `attachPlaceAutocompleteElement`.
 */
export function getBookingAddressSyncControl(
	bookingForm: FormGroup,
	control: string,
	index?: number
): AbstractControl | undefined {
	if (control === 'loose_customer') {
		const g = bookingForm.get('loose_customer') as FormGroup | null;
		return g?.get('address') ?? undefined;
	}
	if (control === 'extra_stops' && typeof index === 'number') {
		const arr = bookingForm.get('extra_stops') as FormArray | null;
		return arr?.at(index)?.get('address') ?? undefined;
	}
	if (control === 'return_extra_stops' && typeof index === 'number') {
		const arr = bookingForm.get('return_extra_stops') as FormArray | null;
		return arr?.at(index)?.get('address') ?? undefined;
	}
	return bookingForm.get(control) ?? undefined;
}

/**
 * Mirrors the hidden Angular-bound input value onto the sibling `gmp-place-autocomplete`
 * (and its shadow input when present) after programmatic patchValue/setValue.
 */
export function syncPlaceAutocompleteDisplay(nativeInput: HTMLInputElement): void {
	if (!nativeInput) {
		return;
	}
	const pac = nativeInput.nextElementSibling;
	if (!pac || pac.tagName.toLowerCase() !== 'gmp-place-autocomplete') {
		return;
	}
	const v = nativeInput.value || '';
	const el = pac as HTMLElement & { value?: string };
	try {
		el.value = v;
	} catch {
		/* ignore */
	}
	const trySyncInner = (retries = 10) => {
		try {
			const root = (pac as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot;
			const inner = root?.querySelector?.('input');
			if (inner instanceof HTMLInputElement) {
				if (inner.value !== (v || '')) {
					inner.value = (v || '');
				}
			} else if (retries > 0) {
				setTimeout(() => trySyncInner(retries - 1), 50);
			}
		} catch {
			/* ignore */
		}
	};
	trySyncInner();
}

export function getPlaceAutocompleteDisplayValue(
	nativeInput: HTMLInputElement | null | undefined
): string {
	if (!nativeInput) {
		return '';
	}

	if ((nativeInput.value || '').trim()) {
		return nativeInput.value;
	}

	const pac = nativeInput.nextElementSibling;
	if (!pac || pac.tagName.toLowerCase() !== 'gmp-place-autocomplete') {
		return '';
	}

	try {
		const root = (pac as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot;
		const inner = root?.querySelector?.('input');
		if (inner instanceof HTMLInputElement) {
			return inner.value || '';
		}
	} catch {
		/* ignore */
	}

	try {
		return ((pac as HTMLElement & { value?: string }).value || '');
	} catch {
		return '';
	}
}

/**
 * If the visible GMP widget restores a value on page load before Angular's hidden input/control
 * knows about it, mirror that value back into the hidden input and optional FormControl.
 */
export function syncRestoredPlaceAutocompleteValue(
	nativeInput: HTMLInputElement,
	syncControl?: AbstractControl
): void {
	if (!nativeInput) {
		return;
	}

	const pac = nativeInput.nextElementSibling;
	if (!pac || pac.tagName.toLowerCase() !== 'gmp-place-autocomplete') {
		return;
	}

	const trySyncFromInner = (retries = 20) => {
		try {
			const root = (pac as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot;
			const inner = root?.querySelector?.('input');

			if (inner instanceof HTMLInputElement) {
				const visibleValue = inner.value || '';
				if (!visibleValue.trim()) {
					if (retries > 0) {
						setTimeout(() => trySyncFromInner(retries - 1), 100);
					}
					return;
				}

				if (nativeInput.value !== visibleValue) {
					nativeInput.value = visibleValue;
				}

				if (syncControl && syncControl.value !== visibleValue) {
					syncControl.setValue(visibleValue);
					syncControl.updateValueAndValidity();
				}
			} else if (retries > 0) {
				setTimeout(() => trySyncFromInner(retries - 1), 100);
			}
		} catch {
			if (retries > 0) {
				setTimeout(() => trySyncFromInner(retries - 1), 100);
			}
		}
	};

	trySyncFromInner();
}
