import { Component, Input, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { finalize } from 'rxjs/operators';
import { AiRateScoreService } from '../../../services/ai-rate-score.service';
import { AiRateScoreResponse } from '../../../interfaces/ai-rate-score.interface';

/** Vehicle context passed from parent */
export interface AiRateScoreVehicleContext {
	vehicleType: string;
	currency: string;
	currencySymbol?: string;
	unit: 'mile' | 'kilometer';
}

/**
 * AI Rate Score Calculator - Displays Mistral-powered rate competitiveness score,
 * per-category breakdown, and actionable suggestions.
 */
@Component({
	selector: 'app-ai-rate-score-calculator',
	templateUrl: './ai-rate-score-calculator.component.html',
	styleUrls: ['./ai-rate-score-calculator.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AiRateScoreCalculatorComponent implements OnInit, OnDestroy {
	/** Rate form values (flattened key-value) */
	@Input() set ratesData(value: Record<string, unknown> | null) {
		this._ratesData = value ?? {};
	}
	get ratesData(): Record<string, unknown> {
		return this._ratesData;
	}
	private _ratesData: Record<string, unknown> = {};

	/** Vehicle context for AI prompt */
	@Input() vehicleContext: AiRateScoreVehicleContext = {
		vehicleType: '',
		currency: 'USD',
		currencySymbol: '$',
		unit: 'mile',
	};

	/** Emitted when score calculation completes (success or error) */
	@Output() scoreCalculated = new EventEmitter<AiRateScoreResponse | null>();
	@Output() scoreError = new EventEmitter<string>();

	loading = false;
	result: AiRateScoreResponse | null = null;
	errorMessage: string | null = null;

	/** Previous score for before/after comparison when recalculating */
	previousScore: number | null = null;

	/** Animated display score (count-up effect) */
	displayScore = 0;
	private scoreAnimationInterval: ReturnType<typeof setInterval> | null = null;

	/** Expanded breakdown indices (click to expand) */
	expandedBreakdown = new Set<number>();

	/** User feedback: null = not answered, true = helpful, false = not helpful */
	feedbackSubmitted: boolean | null = null;

	/** Rotating messages shown during API load (progress steps) */
	loadingMessages = [
		'Analyzing your rates against market standards...',
		'Comparing mileage, airport & hourly rates...',
		'Evaluating competitiveness across categories...',
		'Almost done — preparing your personalized insights...',
	];
	currentLoadingMessageIndex = 0;
	loadingMessageInterval: ReturnType<typeof setInterval> | null = null;

	constructor(
		private aiRateScoreService: AiRateScoreService,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit(): void {
		this.startAutoCalculate();
	}

	ngOnDestroy(): void {
		this.clearLoadingMessageInterval();
		this.clearScoreAnimation();
	}

	/** Auto-trigger API on open when rates exist */
	private startAutoCalculate(): void {
		const sanitized = this.sanitizeRates(this.ratesData);
		if (Object.keys(sanitized).length > 0) {
			this.calculate();
		} else {
			this.errorMessage = 'Please enter at least one rate value to analyze.';
			this.cdr.markForCheck();
		}
	}

	private startLoadingMessages(): void {
		this.clearLoadingMessageInterval();
		this.currentLoadingMessageIndex = 0;
		this.loadingMessageInterval = setInterval(() => {
			this.currentLoadingMessageIndex = (this.currentLoadingMessageIndex + 1) % this.loadingMessages.length;
			this.cdr.markForCheck();
		}, 2500);
	}

	private clearLoadingMessageInterval(): void {
		if (this.loadingMessageInterval) {
			clearInterval(this.loadingMessageInterval);
			this.loadingMessageInterval = null;
		}
	}

	calculate(): void {
		this.errorMessage = null;
		// Keep previous score for before/after when recalculating
		if (this.result?.score != null) {
			this.previousScore = this.result.score;
		}
		this.result = null;
		this.feedbackSubmitted = null;
		this.expandedBreakdown.clear();

		const sanitized = this.sanitizeRates(this.ratesData);
		if (Object.keys(sanitized).length === 0) {
			this.errorMessage = 'Please enter at least one rate value before calculating.';
			return;
		}

		this.loading = true;
		this.startLoadingMessages();
		const payload = {
			rates: sanitized,
			vehicleType: this.vehicleContext.vehicleType || 'Vehicle',
			currency: this.vehicleContext.currency || 'USD',
			unit: this.vehicleContext.unit || 'mile',
		};

		this.aiRateScoreService.calculateScore(payload).pipe(
			finalize(() => {
				this.loading = false;
				this.clearLoadingMessageInterval();
				this.cdr.markForCheck();
			})
		).subscribe({
			next: (res) => {
				this.result = res;
				this.animateScore(res.score);
				this.scoreCalculated.emit(res);
			},
			error: (err) => {
				const msg = err?.message ?? 'Failed to calculate score. Please try again.';
				this.errorMessage = msg;
				this.scoreError.emit(msg);
			},
		});
	}

	/** Convert form values to numeric where possible, drop empty */
	private sanitizeRates(data: Record<string, unknown>): Record<string, number | string> {
		const out: Record<string, number | string> = {};
		const skip = ['id', 'vehicle_id', 'acc_id', 'affiliate_type', 'amenites_rates'];
		for (const [key, val] of Object.entries(data)) {
			if (skip.includes(key) || val === null || val === undefined || val === '') continue;
			if (typeof val === 'object') continue;
			const n = Number(val);
			out[key] = Number.isFinite(n) ? n : String(val);
		}
		return out;
	}

	get isNoRatesError(): boolean {
		return !!this.errorMessage?.toLowerCase().includes('enter at least one');
	}

	getScoreColor(score: number): string {
		if (score >= 75) return 'score-high';
		if (score >= 50) return 'score-mid';
		return 'score-low';
	}

	getScoreLabel(score: number): string {
		if (score >= 75) return 'Competitive';
		if (score >= 50) return 'Moderate';
		return 'Needs review';
	}

	/** Tooltip explaining what each score tier means */
	getScoreTooltip(score: number): string {
		if (score >= 75) return 'Your rates are competitive with typical market pricing for this vehicle type.';
		if (score >= 50) return 'Your rates are moderate — some categories may be above or below market. Consider small adjustments.';
		return 'Your rates may need review. Focus on the suggestions below to improve competitiveness.';
	}

	toggleBreakdownExpand(index: number): void {
		if (this.expandedBreakdown.has(index)) {
			this.expandedBreakdown.delete(index);
		} else {
			this.expandedBreakdown.add(index);
		}
		this.expandedBreakdown = new Set(this.expandedBreakdown);
		this.cdr.markForCheck();
	}

	isBreakdownExpanded(index: number): boolean {
		return this.expandedBreakdown.has(index);
	}

	submitFeedback(helpful: boolean): void {
		this.feedbackSubmitted = helpful;
		this.cdr.markForCheck();
	}

	private animateScore(target: number): void {
		this.clearScoreAnimation();
		this.displayScore = 0;
		const duration = 1200;
		const steps = 20;
		const stepMs = duration / steps;
		const increment = target / steps;
		let step = 0;
		this.scoreAnimationInterval = setInterval(() => {
			step++;
			const next = step >= steps ? target : Math.round(increment * step);
			this.displayScore = Math.min(next, target);
			this.cdr.markForCheck();
			if (step >= steps) {
				this.clearScoreAnimation();
			}
		}, stepMs);
	}

	private clearScoreAnimation(): void {
		if (this.scoreAnimationInterval) {
			clearInterval(this.scoreAnimationInterval);
			this.scoreAnimationInterval = null;
		}
	}

	/** Key rate fields with human-readable labels for display */
	private readonly rateLabels: Record<string, string> = {
		milage_rate: 'Per mile',
		kilometer_rate: 'Per km',
		upto_miles: 'First X miles',
		upto_km: 'First X km',
		after_mileage_rate: 'Additional per mile',
		after_kilometer_rate: 'Additional per km',
		minimum_airport_departure_rate: 'Airport min (departure)',
		minimum_airport_arrival_rate: 'Airport min (arrival)',
		minimum_city_rate: 'City/Intercity min',
		minimum_cruise_port_arrival_rate: 'Cruise port min (arrival)',
		minimum_cruise_port_departure_rate: 'Cruise port min (departure)',
		hourly_rate: 'Hourly rate',
		hourly_rate_after_five_hours: 'Rate after 5 hours',
		day_rate: 'Day rate',
		wait_time_cost: 'Wait time (per 15 min)',
		early_late_charges: 'Early AM / Late PM surge',
		friday_saturday_charges: 'Fri/Sat night surge',
		in_town_extra_stop: 'Extra stop (same town)',
		outside_town_extra_stop: 'Extra stop (different town)',
		per_person_group_ride_rate: 'Shared ride (per person)',
		airport_city_percentage_booking_cancel_charges: 'Airport/City cancellation',
	};

	/** Build display list of user's key rates (non-zero, with labels) */
	getYourRatesDisplay(): Array<{ label: string; value: string }> {
		const sym = this.vehicleContext.currencySymbol || '$';
		const unit = this.vehicleContext.unit;
		const isMile = unit === 'mile';
		const items: Array<{ label: string; value: string }> = [];
		const r = this.sanitizeRates(this.ratesData);
		const skipKm = isMile ? ['kilometer_rate', 'upto_km', 'after_kilometer_rate'] : [];
		const skipMile = !isMile ? ['milage_rate', 'upto_miles', 'after_mileage_rate'] : [];
		const skipKeys = [...skipKm, ...skipMile];
		for (const [key, val] of Object.entries(r)) {
			if (skipKeys.includes(key)) continue;
			const label = this.rateLabels[key];
			if (!label) continue;
			const v = typeof val === 'number' ? val : Number(val);
			if (!Number.isFinite(v) || v === 0) continue;
			let value = '';
			if (key.includes('mile') || key.includes('km') || key === 'upto_miles' || key === 'upto_km') {
				value = key.startsWith('upto') ? `${v} ${isMile ? 'mi' : 'km'}` : `${sym}${v}/${isMile ? 'mi' : 'km'}`;
			} else {
				value = `${sym}${v}`;
			}
			items.push({ label, value });
		}
		return items;
	}
}
