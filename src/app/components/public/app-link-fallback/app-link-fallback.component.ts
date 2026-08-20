import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

/**
 * Which of the two native apps a deep link belongs to.
 * Set via the route `data.appTarget`.
 */
export type AppTarget = 'passenger' | 'driver';

interface AppTargetConfig {
	/** Human readable app name. */
	name: string;
	/** Short line shown under the title. */
	tagline: string;
	/** Apple App Store product page. */
	appStoreUrl: string;
	/** Google Play product page. */
	playStoreUrl: string;
	/** Custom URL scheme registered by the native app, used for "Open in app". */
	scheme: string;
}

const APP_TARGETS: Record<AppTarget, AppTargetConfig> = {
	passenger: {
		name: '1800Limo',
		tagline: 'Book and track your ride in the 1800Limo app.',
		appStoreUrl: 'https://apps.apple.com/app/id6751568791',
		playStoreUrl: 'https://play.google.com/store/apps/details?id=com.limo1800.limouserapp',
		scheme: 'limo1800passenger'
	},
	driver: {
		name: '1800Limo Chauffeur',
		tagline: 'Manage your rides in the 1800Limo Chauffeur app.',
		appStoreUrl: 'https://apps.apple.com/app/id6748669445',
		playStoreUrl: 'https://play.google.com/store/apps/details?id=com.limo1800driver.app',
		scheme: 'limo1800driver'
	}
};

/**
 * Web fallback for Universal Link / App Link URLs such as
 * `/passenger/booking/123` and `/driver/booking/123`.
 *
 * When the native app is installed iOS/Android intercept these URLs before the
 * browser ever loads them, so this component only renders when the app is NOT
 * installed (or the link was opened on desktop). It then sends the visitor to
 * the correct store listing, preserving the deep-link path so it can be
 * restored after install via a "deferred deep link" if that is added later.
 */
@Component({
	selector: 'app-app-link-fallback',
	templateUrl: './app-link-fallback.component.html',
	styleUrls: ['./app-link-fallback.component.scss']
})
export class AppLinkFallbackComponent implements OnInit, OnDestroy {

	/** Milliseconds to wait before sending a mobile visitor to the store. */
	private static readonly AUTO_REDIRECT_DELAY_MS = 1500;
	/** How long to wait for the custom scheme to take over before giving up. */
	private static readonly SCHEME_TIMEOUT_MS = 1200;

	target: AppTarget = 'passenger';
	config: AppTargetConfig = APP_TARGETS.passenger;

	/** The full path that was requested, e.g. `/passenger/booking/123`. */
	deepLinkPath = '';
	isIos = false;
	isAndroid = false;
	redirecting = false;
	/** Hides the logo if the asset fails to load. */
	logoFailed = false;

	private redirectTimer: number | null = null;
	private schemeTimer: number | null = null;

	constructor(private route: ActivatedRoute, private router: Router) {}

	ngOnInit(): void {
		const routeTarget = this.route.snapshot.data['appTarget'] as AppTarget | undefined;
		this.target = routeTarget === 'driver' ? 'driver' : 'passenger';
		this.config = APP_TARGETS[this.target];

		this.deepLinkPath = this.router.url.split('?')[0].split('#')[0];

		const ua = navigator.userAgent || '';
		this.isIos = /iPad|iPhone|iPod/.test(ua) ||
			// iPadOS 13+ reports itself as a Mac, so check for touch support too.
			(/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
		this.isAndroid = /Android/.test(ua);

		if (this.isIos || this.isAndroid) {
			this.redirecting = true;
			this.redirectTimer = window.setTimeout(
				() => this.goToStore(),
				AppLinkFallbackComponent.AUTO_REDIRECT_DELAY_MS
			);
		}
	}

	ngOnDestroy(): void {
		this.clearTimers();
	}

	/** The store URL that matches the current platform. */
	get storeUrl(): string {
		return this.isAndroid ? this.config.playStoreUrl : this.config.appStoreUrl;
	}

	/** Send the visitor straight to the correct store listing. */
	goToStore(): void {
		this.clearTimers();
		window.location.href = this.storeUrl;
	}

	/**
	 * Try the app's custom URL scheme, then fall back to the store if nothing
	 * takes over the page. Used by the "Open in app" button for the case where
	 * the app is installed but the Universal Link was not honoured (for example
	 * a link typed into the address bar, which iOS never routes to an app).
	 */
	openInApp(): void {
		this.clearTimers();
		const schemeUrl = `${this.config.scheme}://${this.deepLinkPath.replace(/^\//, '')}`;

		this.schemeTimer = window.setTimeout(() => {
			// Still here, so the scheme was not handled: the app is not installed.
			if (!document.hidden) {
				this.goToStore();
			}
		}, AppLinkFallbackComponent.SCHEME_TIMEOUT_MS);

		window.location.href = schemeUrl;
	}

	/** Stop the automatic redirect so the visitor can stay on the page. */
	cancelRedirect(): void {
		this.clearTimers();
		this.redirecting = false;
	}

	private clearTimers(): void {
		if (this.redirectTimer !== null) {
			window.clearTimeout(this.redirectTimer);
			this.redirectTimer = null;
		}
		if (this.schemeTimer !== null) {
			window.clearTimeout(this.schemeTimer);
			this.schemeTimer = null;
		}
	}
}
