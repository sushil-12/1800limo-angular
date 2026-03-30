import { AbstractControl, FormArray, FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * Binds Google's recommended PlaceAutocompleteElement to an existing text input:
 * hides the input (keeps Angular/form bindings), inserts the web component after it,
 * and maps the new Place API result to legacy PlaceResult for existing handlers.
 */
const CLEANUP_KEY = '__gmpPlaceAutocompleteCleanup';
const GMP_ATTACH_SHADOW_PATCHED_KEY = '__gmpAttachShadowPatched';
type PacHelperMode = 'prompt' | 'loading' | 'empty' | 'hidden';

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

		.input-contain--address[data-mobile-place-dialog-open="true"] .address-clear-wrap,
		.input-contain--address[data-mobile-place-dialog-open="true"] .airport-clear-wrap,
		.input-contain--address[data-mobile-place-dialog-open="true"] .airport-clear-btn {
			display: none !important;
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
			input{padding-right:18px !important;},
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

		:host([data-mobile-dialog-open="true"]) > .widget-container > .input-container input {
			color: transparent !important;
			-webkit-text-fill-color: transparent !important;
			caret-color: transparent !important;
			text-shadow: none !important;
		}

		:host([data-mobile-dialog-open="true"]) > .widget-container > .input-container input::placeholder {
			color: transparent !important;
			-webkit-text-fill-color: transparent !important;
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
			:host([data-mobile-dialog-open="true"]) {
				min-height: 0 !important;
				height: 0 !important;
				overflow: visible !important;
				margin: 0 !important;
				padding: 0 !important;
				border: 0 !important;
				box-shadow: none !important;
			}

			:host([data-mobile-dialog-open="true"]) > .widget-container {
				overflow: visible !important;
				border: 0 !important;
				box-shadow: none !important;
				background: transparent !important;
			}

			:host([data-mobile-dialog-open="true"]) > .widget-container > :not(dialog.full-window-autocomplete-dialog),
			:host([data-mobile-dialog-open="true"]) > .widget-container::before,
			:host([data-mobile-dialog-open="true"]) > .widget-container::after {
				display: none !important;
			}

			dialog.full-window-autocomplete-dialog[open] {
				pointer-events: none !important;
				background: transparent !important;
				border-radius: 8px !important;
				box-shadow: 0 10px 24px rgba(0,0,0,0.22) !important;
			}

			dialog.full-window-autocomplete-dialog[open]::backdrop {
				background: transparent !important;
				pointer-events: none !important;
			}

			dialog.full-window-autocomplete-dialog[open] .widget-container,
			dialog.full-window-autocomplete-dialog[open] .input-container {
				background: #fff !important;
			}

			dialog.full-window-autocomplete-dialog[open] .widget-container {
				border-radius: 8px !important;
				overflow: hidden !important;
			}

			dialog.full-window-autocomplete-dialog[open] .input-container {
				display: flex !important;
				align-items: center !important;
				gap: 8px !important;
				min-height: 48px !important;
				padding: 0 14px !important;
				box-shadow: none !important;
				border-radius: 8px 8px 0 0 !important;
				border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;
			}

			dialog.full-window-autocomplete-dialog[open] input {
				background: #fff !important;
				color: #000 !important;
				-webkit-text-fill-color: #000 !important;
				caret-color: #000 !important;
				text-shadow: none !important;
				font-size: 16px !important;
				font-weight: 500 !important;
				line-height: 1.4 !important;
				padding: 0 !important;
				border: 0 !important;
				box-shadow: none !important;
				opacity: 1 !important;
			}

			dialog.full-window-autocomplete-dialog[open] input::placeholder {
				color: #6b7280 !important;
				-webkit-text-fill-color: #6b7280 !important;
				opacity: 1 !important;
			}

			dialog.full-window-autocomplete-dialog[open] .widget-container,
			dialog.full-window-autocomplete-dialog[open] .input-container,
			dialog.full-window-autocomplete-dialog[open] [role="listbox"],
			dialog.full-window-autocomplete-dialog[open] [role="option"],
			dialog.full-window-autocomplete-dialog[open] .suggestion-item,
			dialog.full-window-autocomplete-dialog[open] .text-content,
			dialog.full-window-autocomplete-dialog[open] input {
				pointer-events: auto !important;
			}

			dialog.full-window-autocomplete-dialog[open] .text-content,
			dialog.full-window-autocomplete-dialog[open] .primary-text,
			dialog.full-window-autocomplete-dialog[open] .secondary-text,
			dialog.full-window-autocomplete-dialog[open] .place-name,
			dialog.full-window-autocomplete-dialog[open] .place-address {
				width: 100% !important;
				text-align: left !important;
			}

			dialog.full-window-autocomplete-dialog[open] [role="listbox"] {
				padding: 0 !important;
				background: #fff !important;
			}

			dialog.full-window-autocomplete-dialog[open] .place-autocomplete-element-row {
				display: grid !important;
				grid-template-columns: 22px minmax(0, 1fr) !important;
				column-gap: 10px !important;
				align-items: start !important;
				width: 100% !important;
			}

			dialog.full-window-autocomplete-dialog[open] [role="option"],
			dialog.full-window-autocomplete-dialog[open] .suggestion-item {
				display: block !important;
				min-height: 0 !important;
				padding: 10px 14px !important;
				border-bottom: 1px solid rgba(15, 23, 42, 0.08) !important;
				background: #fff !important;
			}

			dialog.full-window-autocomplete-dialog[open] [role="option"]:last-child,
			dialog.full-window-autocomplete-dialog[open] .suggestion-item:last-child {
				border-bottom: 0 !important;
			}

			dialog.full-window-autocomplete-dialog[open] .place-autocomplete-element-prediction-item-icon,
			dialog.full-window-autocomplete-dialog[open] .location-icon,
			dialog.full-window-autocomplete-dialog[open] .leading-icon,
			dialog.full-window-autocomplete-dialog[open] .icon {
				width: 22px !important;
				height: 22px !important;
				min-width: 22px !important;
				margin-top: 3px !important;
				padding: 0 !important;
			}

			dialog.full-window-autocomplete-dialog[open] .place-autocomplete-element-text-div,
			dialog.full-window-autocomplete-dialog[open] .text-content {
				display: flex !important;
				flex-direction: column !important;
				align-items: flex-start !important;
				justify-content: flex-start !important;
				gap: 2px !important;
				min-width: 0 !important;
			}

			dialog.full-window-autocomplete-dialog[open] .primary-text,
			dialog.full-window-autocomplete-dialog[open] .place-name {
				display: block !important;
				margin: 0 !important;
				font-size: 15px !important;
				font-weight: 500 !important;
				line-height: 1.25 !important;
				color: #111827 !important;
				white-space: nowrap !important;
				overflow: hidden !important;
				text-overflow: ellipsis !important;
			}

			dialog.full-window-autocomplete-dialog[open] .secondary-text,
			dialog.full-window-autocomplete-dialog[open] .place-address {
				display: block !important;
				margin: 0 !important;
				font-size: 12px !important;
				font-weight: 400 !important;
				line-height: 1.25 !important;
				color: #4b5563 !important;
				white-space: nowrap !important;
				overflow: hidden !important;
				text-overflow: ellipsis !important;
			}
		}

		.pac-helper-state {
			display: none;
			position: absolute;
			top: 52px;
			left: 0;
			right: 0;
			z-index: 5;
			align-items: center;
			gap: 10px;
			min-height: 56px;
			padding: 16px;
			background: #fff !important;
			color: #6b7280 !important;
			font-size: 14px;
			font-weight: 500;
			border-top: 1px solid rgba(0,0,0,0.08);
			pointer-events: none;
		}

		.pac-helper-state.visible {
			display: flex;
		}

		.pac-helper-state::before {
			content: "⌕";
			font-size: 15px;
			line-height: 1;
			color: #9ca3af !important;
		}

		.pac-helper-state[data-mode="loading"]::before {
			content: "↻";
			animation: pac-helper-spin 0.9s linear infinite;
		}

		.pac-helper-state[data-mode="empty"]::before {
			content: "!";
			color: #ef4444 !important;
			font-weight: 700;
		}

		@keyframes pac-helper-spin {
			from { transform: rotate(0deg); }
			to { transform: rotate(360deg); }
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

function syncPlaceAutocompleteElementValue(
	pac: Element,
	value: string,
	retries = 20
): void {
	const normalizedValue = value || '';
	const el = pac as HTMLElement & { value?: string };

	try {
		el.value = normalizedValue;
	} catch {
		/* ignore */
	}

	try {
		(pac as HTMLElement).setAttribute('value', normalizedValue);
	} catch {
		/* ignore */
	}

	try {
		const root = (pac as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot;
		const inner = root?.querySelector?.('input');
		if (inner instanceof HTMLInputElement) {
			if (inner.value !== normalizedValue) {
				inner.value = normalizedValue;
				inner.dispatchEvent(new Event('input', { bubbles: true }));
				inner.dispatchEvent(new Event('change', { bubbles: true }));
			}
			inner.scrollLeft = 0;
		} else if (retries > 0) {
			setTimeout(() => syncPlaceAutocompleteElementValue(pac, normalizedValue, retries - 1), 75);
		}
	} catch {
		if (retries > 0) {
			setTimeout(() => syncPlaceAutocompleteElementValue(pac, normalizedValue, retries - 1), 75);
		}
	}
}

function setupPlaceAutocompleteHelper(
	pac: HTMLElement,
	nativeInput?: HTMLInputElement,
	syncControl?: AbstractControl
): () => void {
	let helperEl: HTMLDivElement | null = null;
	let emptyTimer: number | null = null;
	let delayedSyncTimers: number[] = [];
	let inputListener: (() => void) | null = null;
	let focusListener: (() => void) | null = null;
	let blurListener: (() => void) | null = null;

	const getRoot = () => (pac as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot ?? null;

	const getInnerInput = (): HTMLInputElement | null => {
		try {
			const inner = getRoot()?.querySelector?.('input');
			return inner instanceof HTMLInputElement ? inner : null;
		} catch {
			return null;
		}
	};

	const isInputFocused = (inner: HTMLInputElement): boolean => {
		const root = getRoot();
		return document.activeElement === pac || document.activeElement === inner || root?.activeElement === inner;
	};

	const getDialog = (): HTMLElement | null => {
		const root = getRoot();
		if (!root) {
			return null;
		}
		return (root.querySelector('dialog.full-window-autocomplete-dialog[open]') as HTMLElement | null)
			?? (root.querySelector('dialog.full-window-autocomplete-dialog') as HTMLElement | null);
	};

	const syncDialogOpenState = () => {
		if (typeof window === 'undefined') {
			return;
		}
		const isMobile = window.matchMedia('(max-width: 767px)').matches;
		const dialog = getDialog();
		const isOpen = !!dialog && dialog.getAttribute('open') !== null;
		const fieldContainer = nativeInput?.closest('.input-contain--address') as HTMLElement | null;
		if (isMobile && isOpen) {
			pac.setAttribute('data-mobile-dialog-open', 'true');
			fieldContainer?.setAttribute('data-mobile-place-dialog-open', 'true');
			return;
		}
		pac.removeAttribute('data-mobile-dialog-open');
		fieldContainer?.removeAttribute('data-mobile-place-dialog-open');
	};

	const ensureHelper = (): HTMLDivElement | null => {
		const root = getRoot();
		if (!root) {
			return null;
		}
		const dialog =
			(root.querySelector('dialog.full-window-autocomplete-dialog[open]') as HTMLElement | null) ??
			(root.querySelector('dialog.full-window-autocomplete-dialog') as HTMLElement | null);
		const helperHost = (dialog as HTMLElement | null) ?? root;
		if (helperEl && root.contains(helperEl)) {
			if (helperEl.parentElement !== helperHost) {
				helperHost.appendChild(helperEl);
			}
			return helperEl;
		}
		helperEl = root.querySelector('.pac-helper-state') as HTMLDivElement | null;
		if (!helperEl) {
			helperEl = document.createElement('div');
			helperEl.className = 'pac-helper-state';
		}
		helperHost.appendChild(helperEl);
		return helperEl;
	};

	const setMode = (mode: PacHelperMode, text = '') => {
		const helper = ensureHelper();
		const dialog = getDialog();
		syncDialogOpenState();
		if (mode === 'hidden') {
			if (helper) {
				helper.classList.remove('visible');
				helper.textContent = '';
				helper.setAttribute('data-mode', mode);
			}
			dialog?.removeAttribute('data-helper-visible');
			dialog?.removeAttribute('data-helper-text');
			dialog?.removeAttribute('data-helper-mode');
			return;
		}
		if (helper) {
			helper.classList.add('visible');
			helper.textContent = text;
			helper.setAttribute('data-mode', mode);
		}
		dialog?.setAttribute('data-helper-visible', 'true');
		dialog?.setAttribute('data-helper-text', text);
		dialog?.setAttribute('data-helper-mode', mode);
	};

	const getPredictionCount = (): number => {
		const root = getRoot();
		if (!root) {
			return 0;
		}
		return root.querySelectorAll('[role="option"], .suggestion-item').length;
	};

	const clearEmptyTimer = () => {
		if (emptyTimer !== null) {
			window.clearTimeout(emptyTimer);
			emptyTimer = null;
		}
	};

	const clearDelayedSyncTimers = () => {
		delayedSyncTimers.forEach((timer) => window.clearTimeout(timer));
		delayedSyncTimers = [];
	};

	const syncDraftToField = (value: string) => {
		if (!nativeInput) {
			return;
		}
		nativeInput.value = value;
		if (syncControl && syncControl.value !== value) {
			syncControl.setValue(value, { emitEvent: false } as never);
			syncControl.updateValueAndValidity({ emitEvent: false });
		}
	};

	const syncState = () => {
		syncDialogOpenState();
		const inner = getInnerInput();
		if (!inner) {
			return;
		}
		const value = inner.value.trim();
		const hasPredictions = getPredictionCount() > 0;
		const isFocused = isInputFocused(inner);

		if (!isFocused) {
			clearEmptyTimer();
			setMode('hidden');
			return;
		}
		if (!value) {
			clearEmptyTimer();
			setMode('prompt', 'Search address');
			return;
		}
		if (hasPredictions) {
			clearEmptyTimer();
			setMode('hidden');
			return;
		}

		setMode('loading', 'Loading addresses...');
		clearEmptyTimer();
		emptyTimer = window.setTimeout(() => {
			emptyTimer = null;
			const currentInput = getInnerInput();
			if (currentInput && isInputFocused(currentInput) && currentInput.value.trim() && getPredictionCount() === 0) {
				setMode('empty', 'Result not found');
			}
		}, 700);
	};

	const attach = (retries = 20) => {
		const root = getRoot();
		const inner = getInnerInput();
		if (!root || !inner) {
			if (retries > 0) {
				window.setTimeout(() => attach(retries - 1), 100);
			}
			return;
		}

		ensureHelper();
		inputListener = () => {
			const currentValue = inner.value || '';
			syncDraftToField(currentValue);
			clearEmptyTimer();
			clearDelayedSyncTimers();
			syncState();
			delayedSyncTimers = [250, 700, 1200].map((delay) =>
				window.setTimeout(() => syncState(), delay)
			);
		};
		focusListener = () => {
			const currentValue = inner.value || '';
			if (currentValue) {
				syncDraftToField(currentValue);
			}
			syncState();
		};
		blurListener = () => window.setTimeout(() => syncState(), 0);

		inner.addEventListener('input', inputListener);
		inner.addEventListener('focus', focusListener);
		inner.addEventListener('blur', blurListener);
		syncState();
	};

	attach();

	return () => {
		pac.removeAttribute('data-mobile-dialog-open');
		(nativeInput?.closest('.input-contain--address') as HTMLElement | null)?.removeAttribute('data-mobile-place-dialog-open');
		clearEmptyTimer();
		clearDelayedSyncTimers();
		const inner = getInnerInput();
		if (inner && inputListener) inner.removeEventListener('input', inputListener);
		if (inner && focusListener) inner.removeEventListener('focus', focusListener);
		if (inner && blurListener) inner.removeEventListener('blur', blurListener);
		helperEl?.remove();
	};
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
	const cleanupHelper = setupPlaceAutocompleteHelper(pac, nativeInput, _options?.syncControl);
	let lastDraftValue = nativeInput.value || '';
	let isRebuildingAutocomplete = false;
	let cleanup: (() => void) | undefined;

	const readInnerDraftValue = (): string => {
		try {
			const root = (pac as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot;
			const inner = root?.querySelector?.('input');
			return inner instanceof HTMLInputElement ? (inner.value || '') : '';
		} catch {
			return '';
		}
	};

	const syncDraftFromInner = () => {
		const innerDraft = readInnerDraftValue();
		if (innerDraft.trim()) {
			lastDraftValue = innerDraft;
		}
	};

	const updatePlacement = () => {
		const anchorElement =
			(nativeInput.closest('.input-contain') as HTMLElement | null) ??
			(nativeInput.closest('.input-contain--address') as HTMLElement | null) ??
			(nativeInput.parentElement as HTMLElement | null) ??
			pac;
		const rect = anchorElement.getBoundingClientRect();
		const visualViewport = window.visualViewport;
		const viewportHeight = visualViewport?.height || window.innerHeight || document.documentElement.clientHeight || 0;
		const viewportOffsetTop = visualViewport?.offsetTop || 0;
		const viewportOffsetLeft = visualViewport?.offsetLeft || 0;
		const estimatedDialogHeight = Math.min(250, Math.max(180, viewportHeight * 0.35));
		const spaceBelow = viewportHeight - rect.bottom;
		const isMobile = window.matchMedia('(max-width: 767px)').matches;
		const shouldOpenAbove = !isMobile && spaceBelow < estimatedDialogHeight && rect.top > spaceBelow;
		const dialogTop = shouldOpenAbove
			? Math.max(8, rect.top + viewportOffsetTop - estimatedDialogHeight)
			: rect.bottom + viewportOffsetTop + 4;

		pac.style.setProperty('--dialog-top', `${dialogTop}px`);
		pac.style.setProperty('--dialog-left', `${rect.left + viewportOffsetLeft}px`);
		pac.style.setProperty('--dialog-width', `${rect.width}px`);
	};

	const schedulePlacementSync = () => {
		updatePlacement();
		requestAnimationFrame(updatePlacement);
		[60, 120, 220, 360].forEach((delay) => {
			setTimeout(updatePlacement, delay);
		});
	};

	const restoreInlineFieldUi = (value: string) => {
		try {
			const root = (pac as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot;
			const widgetContainer = root?.querySelector?.('.widget-container') as HTMLElement | null;
			const widgetChildren = widgetContainer
				? Array.from(widgetContainer.children).filter((child) => !(child instanceof HTMLDialogElement))
				: [];
			const inputContainer = root?.querySelector?.('.input-container') as HTMLElement | null;
			const inlineInput = root?.querySelector?.('.input-container input') as HTMLInputElement | null;
			const iconCandidates = root?.querySelectorAll?.(
				'.widget-container svg, .widget-container .leading-icon, .widget-container .icon, .widget-container [aria-hidden="true"]'
			);

			pac.removeAttribute('data-mobile-dialog-open');
			(nativeInput.closest('.input-contain--address') as HTMLElement | null)?.removeAttribute('data-mobile-place-dialog-open');

			if (widgetContainer) {
				widgetContainer.style.display = '';
				widgetContainer.style.visibility = '';
				widgetContainer.style.opacity = '';
				widgetContainer.style.background = '';
				widgetContainer.style.border = '';
				widgetContainer.style.boxShadow = '';
			}

			widgetChildren.forEach((child) => {
				if (child instanceof HTMLElement) {
					child.style.display = '';
					child.style.visibility = 'visible';
					child.style.opacity = '1';
				}
			});

			if (inputContainer) {
				inputContainer.style.display = 'flex';
				inputContainer.style.visibility = 'visible';
				inputContainer.style.opacity = '1';
			}

			if (inlineInput) {
				inlineInput.value = value;
				inlineInput.style.color = '#000';
				inlineInput.style.webkitTextFillColor = '#000';
				inlineInput.style.caretColor = '#000';
				inlineInput.style.visibility = 'visible';
				inlineInput.style.opacity = '1';
			}

			iconCandidates?.forEach((icon) => {
				if (icon instanceof HTMLElement) {
					icon.style.display = '';
					icon.style.visibility = 'visible';
					icon.style.opacity = '1';
				}
			});
		} catch {
			/* ignore */
		}
	};

	const closeAutocompletePopup = () => {
		try {
			const root = (pac as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot;
			const inner = root?.querySelector?.('input');
			const dialog = root?.querySelector?.('dialog.full-window-autocomplete-dialog[open]');
			const currentValue = inner instanceof HTMLInputElement ? inner.value || '' : '';
			const restoredValue = currentValue.trim() ? currentValue : lastDraftValue;
			const finalizeRestore = () => {
				restoreInlineFieldUi(restoredValue);
				syncPlaceAutocompleteDisplay(nativeInput);
			};
			const rebuildAutocompleteIfNeeded = () => {
				if (isRebuildingAutocomplete || !window.matchMedia('(max-width: 767px)').matches) {
					return;
				}
				isRebuildingAutocomplete = true;
				nativeInput.value = restoredValue;
				if (_options?.syncControl && _options.syncControl.value !== restoredValue) {
					_options.syncControl.setValue(restoredValue, { emitEvent: false } as never);
					_options.syncControl.updateValueAndValidity({ emitEvent: false });
				}
				setTimeout(() => {
					cleanup?.();
					void attachPlaceAutocompleteElement(nativeInput, _options, onPlaceSelect);
				}, 0);
			};

			if (restoredValue.trim()) {
				nativeInput.value = restoredValue;
				if (_options?.syncControl && _options.syncControl.value !== restoredValue) {
					_options.syncControl.setValue(restoredValue, { emitEvent: false } as never);
					_options.syncControl.updateValueAndValidity({ emitEvent: false });
				}
			}

			if (dialog instanceof HTMLDialogElement && dialog.open) {
				dialog.addEventListener('close', () => {
					requestAnimationFrame(() => {
						finalizeRestore();
						setTimeout(finalizeRestore, 40);
						setTimeout(finalizeRestore, 120);
						setTimeout(rebuildAutocompleteIfNeeded, 0);
					});
				}, { once: true });
				dialog.close();
			}

			if (inner instanceof HTMLInputElement) {
				inner.blur();
			}

			(pac as HTMLElement).blur();
			finalizeRestore();
			requestAnimationFrame(() => {
				finalizeRestore();
				setTimeout(() => {
					finalizeRestore();
				}, 80);
			});
			if (!(dialog instanceof HTMLDialogElement) || !dialog.open) {
				setTimeout(rebuildAutocompleteIfNeeded, 0);
			}
		} catch {
			/* ignore */
		}
	};

	const getOpenDialog = (): HTMLDialogElement | null => {
		try {
			const root = (pac as HTMLElement & { shadowRoot?: ShadowRoot | null }).shadowRoot;
			const dialog = root?.querySelector?.('dialog.full-window-autocomplete-dialog[open]');
			return dialog instanceof HTMLDialogElement ? dialog : null;
		} catch {
			return null;
		}
	};

	const isWithinCurrentAutocomplete = (target: Node | null): boolean => {
		if (!target) {
			return false;
		}

		const fieldContainer =
			(nativeInput.closest('.input-contain') as HTMLElement | null) ??
			(nativeInput.parentElement as HTMLElement | null);

		return pac.contains(target) || nativeInput.contains(target) || fieldContainer?.contains(target) || false;
	};

	const getFocusableTarget = (target: Node | null): HTMLElement | null => {
		if (!(target instanceof HTMLElement)) {
			return null;
		}

		return target.closest('input, textarea, select, button, [tabindex]') as HTMLElement | null;
	};

	const getEventPoint = (event: Event): { clientX: number; clientY: number } | null => {
		if ('clientX' in event && 'clientY' in event) {
			const pointerEvent = event as PointerEvent;
			return { clientX: pointerEvent.clientX, clientY: pointerEvent.clientY };
		}

		if ('touches' in event && (event as TouchEvent).touches?.length) {
			const touch = (event as TouchEvent).touches[0];
			return { clientX: touch.clientX, clientY: touch.clientY };
		}

		if ('changedTouches' in event && (event as TouchEvent).changedTouches?.length) {
			const touch = (event as TouchEvent).changedTouches[0];
			return { clientX: touch.clientX, clientY: touch.clientY };
		}

		return null;
	};

	const focusUnderlyingElementAtPoint = (event: Event) => {
		const point = getEventPoint(event);
		if (!point) {
			return;
		}

		const findAndFocus = () => {
			const elements = document.elementsFromPoint(point.clientX, point.clientY) as HTMLElement[];
			const nextTarget = elements.find((element) => {
				if (!element || element === pac || pac.contains(element) || nativeInput.contains(element)) {
					return false;
				}

				return !!element.closest('input, textarea, select, button, [tabindex]');
			});

			const focusTarget = getFocusableTarget(nextTarget ?? null);
			if (focusTarget && !pac.contains(focusTarget)) {
				focusTarget.focus({ preventScroll: true });
				if (focusTarget instanceof HTMLInputElement || focusTarget instanceof HTMLTextAreaElement) {
					focusTarget.click();
				}
			}
		};

		closeAutocompletePopup();

		requestAnimationFrame(() => {
			requestAnimationFrame(() => {
				findAndFocus();
				setTimeout(findAndFocus, 60);
			});
		});
	};

	const isSuggestionTarget = (target: EventTarget | null): boolean => {
		if (!(target instanceof HTMLElement)) {
			return false;
		}

		return !!target.closest('[role="option"], .suggestion-item, input');
	};

	const handleDialogTouchStart = (event: Event) => {
		const dialog = getOpenDialog();
		const target = event.target;

		if (!dialog || !dialog.contains(target as Node) || isSuggestionTarget(target)) {
			return;
		}

		event.preventDefault();
		event.stopPropagation();
		closeAutocompletePopup();
		focusUnderlyingElementAtPoint(event);
	};

	const handleDocumentPointerDown = (event: Event) => {
		const targetNode = event.target as Node | null;
		if (isWithinCurrentAutocomplete(targetNode)) {
			return;
		}

		const openDialog = getOpenDialog();
		const shouldRetargetFocus = !!openDialog && targetNode instanceof Node && openDialog.contains(targetNode);
		closeAutocompletePopup();
		if (shouldRetargetFocus) {
			focusUnderlyingElementAtPoint(event);
			return;
		}

		const focusTarget = getFocusableTarget(targetNode);
		if (focusTarget && !pac.contains(focusTarget)) {
			setTimeout(() => focusTarget.focus({ preventScroll: true }), 0);
		}
	};

	const handleDocumentFocusIn = (event: FocusEvent) => {
		const targetNode = event.target as Node | null;
		if (isWithinCurrentAutocomplete(targetNode)) {
			return;
		}

		closeAutocompletePopup();
	};

	pac.addEventListener('click', schedulePlacementSync);
	pac.addEventListener('focusin', schedulePlacementSync);
	pac.addEventListener('touchstart', schedulePlacementSync, { passive: true });
	pac.addEventListener('input', syncDraftFromInner as EventListener, true);
	pac.addEventListener('change', syncDraftFromInner as EventListener, true);
	pac.addEventListener('touchstart', handleDialogTouchStart, true);
	pac.addEventListener('mousedown', handleDialogTouchStart, true);
	document.addEventListener('pointerdown', handleDocumentPointerDown, true);
	document.addEventListener('touchstart', handleDocumentPointerDown, true);
	document.addEventListener('focusin', handleDocumentFocusIn, true);
	window.addEventListener('resize', updatePlacement);
	window.addEventListener('scroll', updatePlacement, { capture: true, passive: true });
	window.visualViewport?.addEventListener('resize', updatePlacement);
	window.visualViewport?.addEventListener('scroll', updatePlacement);

	// Force initial placement calculation slightly after attach
	setTimeout(schedulePlacementSync, 50);

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

	cleanup = () => {
		cleanupHelper();
		valueSub?.unsubscribe();
		valueSub = undefined;
		pac.removeEventListener('gmp-select', handler as EventListener);
		pac.removeEventListener('click', schedulePlacementSync);
		pac.removeEventListener('focusin', schedulePlacementSync);
		pac.removeEventListener('touchstart', schedulePlacementSync);
		pac.removeEventListener('input', syncDraftFromInner as EventListener, true);
		pac.removeEventListener('change', syncDraftFromInner as EventListener, true);
		pac.removeEventListener('touchstart', handleDialogTouchStart, true);
		pac.removeEventListener('mousedown', handleDialogTouchStart, true);
		document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
		document.removeEventListener('touchstart', handleDocumentPointerDown, true);
		document.removeEventListener('focusin', handleDocumentFocusIn, true);
		window.removeEventListener('resize', updatePlacement);
		window.removeEventListener('scroll', updatePlacement, { capture: true } as EventListenerOptions);
		window.visualViewport?.removeEventListener('resize', updatePlacement);
		window.visualViewport?.removeEventListener('scroll', updatePlacement);
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
	[100, 250, 500, 900].forEach((delay) => {
		setTimeout(() => syncPlaceAutocompleteDisplay(nativeInput), delay);
	});
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
	syncPlaceAutocompleteElementValue(pac, v);
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

				syncPlaceAutocompleteElementValue(pac, visibleValue);
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
