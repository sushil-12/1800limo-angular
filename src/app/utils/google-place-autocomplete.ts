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
		.input-container { padding: 0 !important; }
		.focus-ring { display: none !important; }

		/* 🔥 MAIN FIX: override full screen dialog */
		dialog.full-window-autocomplete-dialog[open] {
			position: absolute !important;
			inset: unset !important;
			top: 100% !important;
			left: 0 !important;
			width: 100% !important;
			max-height: 250px !important;
			border-radius: 12px !important;
			overflow-y: auto !important;
			box-shadow: 0 6px 16px rgba(0,0,0,0.2) !important;
		}

		/* Optional: spacing below input */
		dialog.full-window-autocomplete-dialog {
			margin-top: 6px !important;
		}
		`;

		shadow.appendChild(style);
		return shadow;
	}

	return originalAttachShadow.call(this, init);
	};

	w[GMP_ATTACH_SHADOW_PATCHED_KEY] = true;
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

	const handler = async (ev: Event) => {
		const raw = ev as unknown as {
			placePrediction?: { toPlace: () => unknown };
		};
		const placePrediction =
			raw.placePrediction ??
			(ev as unknown as CustomEvent<{ placePrediction?: { toPlace: () => unknown } }>).detail
				?.placePrediction;
		if (!placePrediction) {
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
	const v = nativeInput.value;
	if (v == null || v === '') {
		return;
	}
	const el = pac as HTMLElement & { value?: string };
	try {
		el.value = v;
	} catch {
		/* ignore */
	}
	try {
		const root = (pac as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot;
		const inner = root?.querySelector?.('input');
		if (inner instanceof HTMLInputElement) {
			inner.value = v;
		}
	} catch {
		/* ignore */
	}
}