import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
	selector: 'app-vehicle-card',
	templateUrl: './vehicle-card.component.html',
	styleUrls: ['./vehicle-card.component.scss']
})
export class VehicleCardComponent {

	@Input() vehicle: any;
	@Input() serviceType: string;
	@Output() selected = new EventEmitter<any>();

	get price(): string {
		const rb = this.serviceType === 'round_trip'
			? this.vehicle?.rate_breakdown_round_trip
			: this.serviceType === 'charter_tour'
				? this.vehicle?.rate_breakdown_charter_tour
				: this.vehicle?.rate_breakdown_one_way
					|| this.vehicle?.rate_breakdown_round_trip
					|| this.vehicle?.rate_breakdown_charter_tour;
		if (!rb?.grand_total) return 'Contact for price';
		const currency = (this.vehicle?.currency || 'usd').toUpperCase();
		return `${currency} $${rb.grand_total}`;
	}

	get vehicleName(): string {
		const parts = [
			this.vehicle?.make,
			this.vehicle?.model,
			this.vehicle?.year,
		].filter(Boolean);
		return parts.length ? parts.join(' ') : this.vehicle?.vehicle_type || 'Vehicle';
	}

	get affiliateName(): string {
		return this.vehicle?.affiliate_name || this.vehicle?.affiliate_company || '';
	}

	get capacity(): string {
		const p = this.vehicle?.max_passenger || this.vehicle?.passenger_capacity;
		const l = this.vehicle?.max_luggage    || this.vehicle?.luggage_capacity;
		const parts = [];
		if (p) parts.push(`${p} pax`);
		if (l) parts.push(`${l} bags`);
		return parts.join(' · ');
	}

	get imageUrl(): string {
		return this.vehicle?.image_url || this.vehicle?.vehicle_image || this.vehicle?.image || '';
	}

	selectVehicle() {
		this.selected.emit(this.vehicle);
	}
}
