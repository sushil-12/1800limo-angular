import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { QuotebotService } from 'src/app/services/quotebot.service';

/**
 * Reusable, self-contained quote browser.
 *
 * Drives the quotebot drill-down (master vehicle classes -> available affiliate
 * vehicles) without any coupling to a host form. The host builds a quotebot-shaped
 * payload (same shape stored in localStorage as `quotebot_form`), passes it in via
 * [quotePayload], and listens to (vehicleSelected) to react to the picked vehicle.
 *
 * Declared + exported by SharedModule, so any module importing SharedModule
 * (admin, quotebot, affiliate/individual sides, ...) can drop in <app-embedded-quote>.
 *
 * NOTE: this intentionally re-implements only the simple drill-down. The full
 * filter system lives in the (do-not-touch) quotebot master-vehicle / select-vehicle
 * components; we call the same QuotebotService endpoints they use.
 */
@Component({
	selector: 'app-embedded-quote',
	templateUrl: './embedded-quote.component.html',
	styleUrls: ['./embedded-quote.component.scss']
})
export class EmbeddedQuoteComponent implements OnChanges {
	/** quotebot-shaped payload (service_type, pickup/dropoff, passengers, amenities, ...) */
	@Input() quotePayload: any = null;
	@Input() currencySymbol = '$';
	@Input() selectedVehicleId: any = null;
	@Input() selectedVehicleTypeId: any = null;
	@Input() isIndividual = false;
	@Input() isTravelAgent = false;

	/** emits the chosen affiliate-vehicle object from getVehicleDetails */
	@Output() vehicleSelected = new EventEmitter<any>();

	view: 'classes' | 'vehicles' = 'classes';
	masterVehicles: Array<any> = [];
	vehicles: Array<any> = [];
	selectedClass: any = null;
	/** vehicle class name -> vehicle-type filter id (from getAllFilters) */
	vehicleTypeMap: Record<string, number> = {};
	isLoading = false;
	noVehicleMsg = '';
	skeletonItems = new Array(4);

	constructor(private $quotebot: QuotebotService) { }

	ngOnChanges(changes: SimpleChanges): void {
		if (changes['quotePayload'] && this.quotePayload) {
			this.search();
		}
	}

	getKeyName(): string {
		return this.quotePayload?.service_type;
	}

	rate(vehicle: any): string {
		const total = vehicle?.['rate_breakdown_' + this.getKeyName()]?.grand_total;
		return total != undefined ? total : '0.00';
	}

	/** Fetch master vehicle classes for the current payload. */
	search(): void {
		this.view = 'classes';
		this.vehicles = [];
		this.selectedClass = null;
		this.noVehicleMsg = '';
		this.isLoading = true;

		// load filters once to translate a class name into its vehicle-type id
		this.$quotebot.getAllFilters().subscribe((res: any) => {
			const types = res?.data?.['vehicle-type'] || [];
			this.vehicleTypeMap = {};
			types.forEach((t: any) => {
				if (t?.name) {
					this.vehicleTypeMap[t.name] = t.id;
				}
			});
		});

		this.$quotebot.getMasterVehicleTypes(this.quotePayload).pipe(
			catchError(err => throwError(err))
		).subscribe({
			next: (response: any) => {
				this.masterVehicles = response?.data || [];
				if (response?.currency?.symbol) {
					this.currencySymbol = response.currency.symbol;
				}
				if (this.masterVehicles.length === 0) {
					this.noVehicleMsg = 'No vehicle categories found for this trip.';
				}
				this.isLoading = false;
			},
			error: () => {
				this.noVehicleMsg = 'Unable to load vehicles. Please try again.';
				this.isLoading = false;
			}
		});
	}

	/** Drill into a class and fetch its available affiliate vehicles. */
	selectClass(master: any): void {
		// Master vehicles have no affiliate backing — emit directly so the host
		// applies loose-affiliate logic, same as the direct quotebot flow.
		if (master?.is_master_vehicle) {
			this.choose(master);
			return;
		}

		this.selectedClass = master;
		this.view = 'vehicles';
		this.vehicles = [];
		this.noVehicleMsg = '';
		this.isLoading = true;

		const typeId = this.vehicleTypeMap[master?.name];
		const request: Record<string, any> = {};
		if (typeId != undefined) {
			request['vehicle-type'] = [typeId];
		}

		const payload = {
			...this.quotePayload,
			filters: request,
			selected_amenities: this.quotePayload?.amenities || []
		};

		this.$quotebot.getVehicleDetails(payload).pipe(
			catchError(err => throwError(err))
		).subscribe({
			next: (response: any) => {
				this.vehicles = response?.data || [];
				if (this.vehicles.length === 0) {
					this.noVehicleMsg = 'No vehicles found for this class.';
				}
				this.isLoading = false;
			},
			error: () => {
				this.noVehicleMsg = 'Unable to load vehicles. Please try again.';
				this.isLoading = false;
			}
		});
	}

	backToClasses(): void {
		this.view = 'classes';
		this.vehicles = [];
		this.selectedClass = null;
		this.noVehicleMsg = '';
	}

	choose(vehicle: any): void {
		this.vehicleSelected.emit(vehicle);
	}

	/** masterVehicles with the currently selected class (if any) moved to the front. */
	get sortedMasterVehicles(): Array<any> {
		return this.moveSelectedToFront(this.masterVehicles, (m) => this.isClassSelected(m));
	}

	/** vehicles with the currently selected vehicle (if any) moved to the front. */
	get sortedVehicles(): Array<any> {
		return this.moveSelectedToFront(this.vehicles, (v) => this.isVehicleSelected(v));
	}

	private moveSelectedToFront(list: Array<any>, isSelected: (item: any) => boolean): Array<any> {
		if (!list?.length) {
			return list;
		}
		const selected = list.filter(isSelected);
		if (!selected.length) {
			return list;
		}
		const rest = list.filter((item) => !isSelected(item));
		return [...selected, ...rest];
	}

	isClassSelected(m: any): boolean {
		if (!m) return false;
		if (this.selectedVehicleId && m.id == this.selectedVehicleId) {
			return true;
		}
		if (this.selectedVehicleTypeId && this.vehicleTypeMap[m?.name] != undefined && this.vehicleTypeMap[m?.name] == this.selectedVehicleTypeId) {
			return true;
		}
		return false;
	}

	isVehicleSelected(v: any): boolean {
		if (!v) return false;
		return !!(this.selectedVehicleId && v.id == this.selectedVehicleId);
	}
}
