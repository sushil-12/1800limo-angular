import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { MapUtils } from '../../../utils/map-utils';

@Component({
	selector: 'app-booking-details',
	templateUrl: './booking-details.component.html',
	styleUrls: ['./booking-details.component.scss']
})
export class BookingDetailsComponent implements OnInit, AfterViewInit {
	@ViewChild(GoogleMap, { static: false }) map?: GoogleMap;

	bookingDetail: Record<string, any> | null = null;
	loading = false;
	zoom = 7;
	mapCenter: google.maps.LatLngLiteral = { lat: 41.850033, lng: -87.6500523 };
	directionsRenderer: google.maps.DirectionsRenderer | null = null;
	markers: google.maps.Marker[] = [];

	constructor(
		private $api: AdminService,
		private $route: ActivatedRoute,
		private $router: Router
	) { }

	ngOnInit(): void {
		this.$route.queryParams.subscribe((params: any) => {
			if (params.bookingId) {
				this.getReservationDetails(Number(params.bookingId));
			} else {
				this.$router.navigate(['/admin/daily-bookings-admin']);
			}
		});
	}

	ngAfterViewInit(): void {
		if (this.bookingDetail) {
			this.renderMapWhenReady();
		}
	}

	getReservationDetails(booking_id: number): void {
		this.loading = true;
		this.$api.getBookingPreview(booking_id).subscribe({
			next: (response: any) => {
				this.bookingDetail = this.normalizeBookingDetail(response?.data || {});
				this.loading = false;
				this.renderMapWhenReady();
			},
			error: () => {
				this.loading = false;
			}
		});
	}

	private normalizeBookingDetail(detail: Record<string, any>): Record<string, any> {
		return {
			...detail,
			extra_stops: this.normalizeStops(detail?.extra_stops),
			return_extra_stops: this.normalizeStops(detail?.return_extra_stops)
		};
	}

	private normalizeStops(stops: any): Array<Record<string, any>> {
		let parsedStops = stops;
		if (typeof parsedStops === 'string') {
			try {
				parsedStops = JSON.parse(parsedStops);
			} catch {
				parsedStops = [];
			}
		}

		if (!Array.isArray(parsedStops)) {
			return [];
		}

		return parsedStops
			.filter((stop: any) => stop && typeof stop === 'object')
			.map((stop: any) => {
				const address = String(
					stop?.display_address
					|| stop?.formatted_address
					|| stop?.address
					|| ''
				).trim();

				return {
					...stop,
					address,
					latitude: stop?.latitude ?? stop?.lat ?? stop?.pickup_latitude ?? '',
					longitude: stop?.longitude ?? stop?.lng ?? stop?.long ?? stop?.pickup_longitude ?? ''
				};
			})
			.filter((stop: Record<string, any>) =>
				!!stop.address || (
					this.parseCoordinate(stop.latitude) !== null &&
					this.parseCoordinate(stop.longitude) !== null
				)
			);
	}

	private renderMapWhenReady(retries = 10): void {
		if (!this.bookingDetail) {
			return;
		}

		if (this.map?.googleMap) {
			this.MapController();
			return;
		}

		if (retries <= 0) {
			return;
		}

		setTimeout(() => this.renderMapWhenReady(retries - 1), 200);
	}

	MapController(): void {
		if (!this.bookingDetail) {
			return;
		}

		const mapInstance = this.map?.googleMap;
		if (!mapInstance) {
			this.renderMapWhenReady();
			return;
		}

		const transferType = String(this.bookingDetail?.transfer_type || '');
		const origin = this.resolveEndpointLatLng('pickup', transferType.includes('airport_'));
		const destination = this.resolveEndpointLatLng('dropoff', transferType.includes('_airport'));

		if (!origin || !destination) {
			return;
		}

		const waypoints = (this.bookingDetail?.extra_stops || [])
			.map((stop: Record<string, any>) => this.resolveStopLocation(stop))
			.filter((location: google.maps.LatLng | string | null): location is google.maps.LatLng | string => !!location)
			.map((location) => ({
				location,
				stopover: true
			}));

		this.drawMap({
			origin,
			destination,
			waypoints,
			optimizeWaypoints: false,
			travelMode: google.maps.TravelMode.DRIVING
		});
	}

	private resolveEndpointLatLng(endpoint: 'pickup' | 'dropoff', useAirportCoordinates: boolean): google.maps.LatLng | null {
		if (!this.bookingDetail) {
			return null;
		}

		const prefix = useAirportCoordinates ? `${endpoint}_airport_` : `${endpoint}_`;
		const latitude = this.parseCoordinate(this.bookingDetail[`${prefix}latitude`]);
		const longitude = this.parseCoordinate(this.bookingDetail[`${prefix}longitude`]);

		if (latitude === null || longitude === null) {
			return null;
		}

		return new google.maps.LatLng(latitude, longitude);
	}

	private resolveStopLocation(stop: Record<string, any>): google.maps.LatLng | string | null {
		const latitude = this.parseCoordinate(stop?.latitude);
		const longitude = this.parseCoordinate(stop?.longitude);

		if (latitude !== null && longitude !== null) {
			return new google.maps.LatLng(latitude, longitude);
		}

		return stop?.address || null;
	}

	private parseCoordinate(value: any): number | null {
		if (value === '' || value === null || typeof value === 'undefined') {
			return null;
		}

		const parsedValue = Number(value);
		return Number.isFinite(parsedValue) ? parsedValue : null;
	}

	private clearMapState(): void {
		if (this.directionsRenderer) {
			this.directionsRenderer.setMap(null);
			this.directionsRenderer = null;
		}

		if (this.markers.length > 0) {
			this.markers.forEach((marker) => marker.setMap(null));
			this.markers = [];
		}
	}

	drawMap(request: google.maps.DirectionsRequest): void {
		const mapInstance = this.map?.googleMap;
		if (!mapInstance) {
			this.renderMapWhenReady();
			return;
		}

		this.clearMapState();

		const directionsService = new google.maps.DirectionsService();
		this.directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: true });
		this.directionsRenderer.setMap(mapInstance);

		directionsService.route(request, (response, status) => {
			if (status === google.maps.DirectionsStatus.OK && response) {
				this.directionsRenderer?.setDirections(response);
				this.renderCustomMarkers(mapInstance, response);
			}
		});
	}

	private renderCustomMarkers(
		map: google.maps.Map,
		response: google.maps.DirectionsResult
	): void {
		const route = response.routes?.[0];
		if (!route?.legs?.length) {
			return;
		}

		const locations: google.maps.LatLngLiteral[] = [];
		locations.push(route.legs[0].start_location.toJSON());

		for (let index = 0; index < route.legs.length - 1; index++) {
			locations.push(route.legs[index].end_location.toJSON());
		}

		locations.push(route.legs[route.legs.length - 1].end_location.toJSON());

		MapUtils.getOffsetMarkers(locations, 100).forEach((item, index) => {
			const labelChar = String.fromCharCode(65 + index);

			const marker = new google.maps.Marker({
				position: item.position,
				map,
				zIndex: 1000 + index,
				title: `Stop ${labelChar}`,
				icon: {
					path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
					fillColor: '#EA4335',
					fillOpacity: 1,
					strokeColor: '#B31412',
					strokeWeight: 1,
					scale: 1.5,
					anchor: new google.maps.Point(12 - (item.pixelOffset / 1.5), 22),
					labelOrigin: new google.maps.Point(12, 9)
				},
				label: {
					text: labelChar,
					color: 'white',
					fontSize: '14px',
					fontWeight: 'bold'
				}
			});

			this.markers.push(marker);
		});
	}

	getPickupLocation(): string {
		if (!this.bookingDetail) {
			return '';
		}

		return String(
			this.bookingDetail?.pickup_address
			|| this.bookingDetail?.pickup
			|| this.bookingDetail?.pickup_airport_name
			|| ''
		).trim();
	}

	getDropoffLocation(): string {
		if (!this.bookingDetail) {
			return '';
		}

		return String(
			this.bookingDetail?.dropoff_address
			|| this.bookingDetail?.dropoff
			|| this.bookingDetail?.dropoff_airport_name
			|| ''
		).trim();
	}

	getReturnPickupLocation(): string {
		if (!this.bookingDetail) {
			return '';
		}

		return String(
			this.bookingDetail?.return_pickup_address
			|| this.bookingDetail?.return_pickup
			|| this.bookingDetail?.return_pickup_airport_name
			|| ''
		).trim();
	}

	getReturnDropoffLocation(): string {
		if (!this.bookingDetail) {
			return '';
		}

		return String(
			this.bookingDetail?.return_dropoff_address
			|| this.bookingDetail?.return_dropoff
			|| this.bookingDetail?.return_dropoff_airport_name
			|| ''
		).trim();
	}

	formatEnum(value: any): string {
		return String(value || '')
			.replace(/_/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
	}

	mToKm(value: any): string {
		const distance = Number(value);
		return Number.isFinite(distance) ? (distance / 1000).toFixed(2) : '0.00';
	}

	mToMi(value: any): string {
		const distance = Number(value);
		return Number.isFinite(distance) ? (distance / 1609.34).toFixed(2) : '0.00';
	}

	convertToMinutes(value: any): string {
		const seconds = Number(value);
		if (!Number.isFinite(seconds) || seconds <= 0) {
			return '';
		}

		const days = Math.floor(seconds / (24 * 60 * 60));
		const remainingSeconds = seconds % (24 * 60 * 60);
		const hours = Math.floor(remainingSeconds / (60 * 60));
		const remainingMinutes = Math.floor((remainingSeconds % (60 * 60)) / 60);

		const parts: string[] = [];
		if (days > 0) {
			parts.push(`${days} day${days === 1 ? '' : 's'}`);
		}
		if (hours > 0) {
			parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
		}
		if (remainingMinutes > 0) {
			parts.push(`${remainingMinutes} minute${remainingMinutes === 1 ? '' : 's'}`);
		}

		return parts.join(' ');
	}

	showLocationPointOnMapByAddress(address: any): void {
		const destination = String(address || '').trim();
		if (!destination || typeof window === 'undefined') {
			return;
		}

		window.open(
			`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}&travelmode=driving`,
			'_blank'
		);
	}

	hasReturnLeg(): boolean {
		return String(this.bookingDetail?.service_type || '').toLowerCase().includes('round');
	}
}
