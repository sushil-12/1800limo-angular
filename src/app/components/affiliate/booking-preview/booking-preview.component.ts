import { Component, OnInit, ViewChild } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { AdminService } from '../../../services/admin.service';
import { AffiliateService } from '../../../services/affiliate.service';
import { StateManagementService } from 'src/app/services/statemanagement.service';
import { GoogleMap } from '@angular/google-maps';
import { IndividualService } from 'src/app/services/individual.service';
import { TravelAgentService } from 'src/app/services/travel-agent.service';
import moment from 'moment';


declare var $: any;

@Component({
  selector: 'app-booking-preview',
  templateUrl: './booking-preview.component.html',
  styleUrls: ['./booking-preview.component.scss']
})
export class BookingPreviewComponent implements OnInit {
  @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;

  zoom = 7;
  mapCenter: google.maps.LatLngLiteral = { lat: 41.850033, lng: -87.6500523 };
  directionsRenderer!: google.maps.DirectionsRenderer;

  bookingPreview: any;
  adminSharePercent: number;
  rates_preview: any;
  shareArray: any;
  currencySymbol: any;
  isAffiliate: boolean = false;
  isLooseAffiliate: boolean = false;
  showRateDistribution: boolean = false;
  deducted_stripe_fee: number;
  userRole: string;
  isAdminView: boolean = false;

  constructor(
    private $affiliateService: AffiliateService,
    private $adminService: AdminService,
    private $spinner: NgxSpinnerService,
    private stateManagementService: StateManagementService,
    private $individualService: IndividualService,
    private $travelAgentService: TravelAgentService,
  ) { }

  ngOnInit(): void {
    try {
      this.currencySymbol = this.stateManagementService.getCurrencySymbol();
      console.debug('[BookingPreview] ngOnInit: currencySymbol =', this.currencySymbol);
    } catch (err) {
      console.error('[BookingPreview] ngOnInit: Failed to get currency symbol', err);
    }
  }

  openPreview(booking_id: number, userRole: 'admin' | 'affiliate' | 'individual' | 'travel_agent' = 'affiliate') {
    console.debug(`[BookingPreview] openPreview called — booking_id=${booking_id}, userRole=${userRole}`);
    this.$spinner.show();
    this.userRole = userRole;
    this.isAdminView = userRole === 'admin';


    const request = userRole === 'admin'
      ? this.$adminService.getBookingPreview(booking_id)
      : userRole === 'individual'
        ? this.$individualService.getBookingPreview(booking_id)
        : userRole === 'travel_agent'
          ? this.$travelAgentService.getBookingPreview(booking_id)
          : this.$affiliateService.getBookingPreview(booking_id);

    request
      .pipe(
        catchError((err) => {
          console.error('[BookingPreview] openPreview: API request failed', err);
          this.$spinner.hide();
          return throwError(err);
        })
      ).subscribe((response: any) => {
        try {
          console.debug('[BookingPreview] openPreview: API response received', response);

          if (!response?.data) {
            console.warn('[BookingPreview] openPreview: response.data is null or undefined', response);
          }

          this.bookingPreview = response.data;
          console.debug('[BookingPreview] openPreview: bookingPreview set', this.bookingPreview);

          this.showRateDistribution =
            userRole === 'admin' ||
            (userRole === 'affiliate' &&
              !!this.bookingPreview &&
              this.bookingPreview.reservation_type !== 'farmout' &&
              this.bookingPreview?.payment_status != 'paid' &&
              this.bookingPreview?.payment_status != 'transfer_failed') || userRole === 'travel_agent';

          console.log('--- showRateDistribution Logic ---');
          console.log('userRole:', userRole);
          console.log('reservation_type:', this.bookingPreview?.reservation_type);
          console.log('payment_status:', this.bookingPreview?.payment_status);
          console.log('Result:', this.showRateDistribution);

          // Calculate deducted_stripe_fee
          try {
            const grandTotal = this.bookingPreview?.share_array?.grandTotal ? this.bookingPreview?.share_array?.grandTotal : this.bookingPreview?.share_array?.returnGrandTotal;
            this.deducted_stripe_fee = (grandTotal * 0.029) + 0.30;
          } catch (e) {
            console.error('[BookingPreview] Failed to calc deducted_stripe_fee', e);
          }

          // ── Map ──────────────────────────────────────────────────────────
          try {
            this.MapController();
          } catch (mapErr) {
            console.error('[BookingPreview] openPreview: MapController() threw an error', mapErr);
          }

          // ── Admin share percent ──────────────────────────────────────────
          try {
            if (this.bookingPreview?.account_type == 'travel_planner' && this.bookingPreview?.created_by != 1) {
              this.adminSharePercent = 15;
            } else if (this.bookingPreview?.share_array?.farmoutShare) {
              this.adminSharePercent = 15;
            } else {
              this.adminSharePercent = 25;
            }
            console.debug('[BookingPreview] openPreview: adminSharePercent =', this.adminSharePercent);
          } catch (shareErr) {
            console.error('[BookingPreview] openPreview: Failed to calculate adminSharePercent', shareErr);
          }

          // ── Payment status ───────────────────────────────────────────────
          if (this.bookingPreview?.payment_status == 'unpaid') {
            this.shareArray = this.bookingPreview?.share_array;
            this.rates_preview = this.bookingPreview?.rates_preview;
            console.debug('[BookingPreview] openPreview: unpaid — shareArray =', this.shareArray, ', rates_preview =', this.rates_preview);
          }

          // ── Affiliate type ───────────────────────────────────────────────
          this.isAffiliate = this.bookingPreview?.affiliate_type == 'affiliate';
          this.isLooseAffiliate = this.bookingPreview?.affiliate_type == 'loose_affiliate';
          console.debug('[BookingPreview] openPreview: isAffiliate =', this.isAffiliate, ', isLooseAffiliate =', this.isLooseAffiliate);

          // ── Booking instructions ─────────────────────────────────────────
          if (this.bookingPreview?.booking_instructions) {
            try {
              this.bookingPreview.booking_instructions =
                this.bookingPreview.booking_instructions.replaceAll('<br />', '');
            } catch (instrErr) {
              console.error('[BookingPreview] openPreview: Failed to process booking_instructions', instrErr);
            }
          }

          $('#previewBookingOnID').modal('show');
          this.$spinner.hide();
          console.debug('[BookingPreview] openPreview: modal shown, spinner hidden');

        } catch (err) {
          console.error('[BookingPreview] openPreview: Unexpected error inside subscribe', err);
          this.$spinner.hide();
        }
      });
  }

  MapController() {
    console.debug('[BookingPreview] MapController: start — bookingPreview =', this.bookingPreview);

    const transferType = this.bookingPreview?.transfer_type || '';
    console.debug('[BookingPreview] MapController: transferType =', transferType);

    let originCoords: google.maps.LatLng | null;
    let destinationCoords: google.maps.LatLng | null;
    const waypoints: google.maps.DirectionsWaypoint[] = [];

    try {
      originCoords = this.resolveLatLng([
        ['pickup_latitude', 'pickup_longitude'],
        ['pickup_address_lat', 'pickup_address_long'],
        ['pickup_lat', 'pickup_long'],
      ]);
      console.debug('[BookingPreview] MapController: originCoords =', originCoords?.toString());

      destinationCoords = this.resolveLatLng([
        ['dropoff_latitude', 'dropoff_longitude'],
        ['dropoff_address_lat', 'dropoff_address_long'],
        ['dropoff_lat', 'dropoff_long'],
      ]);
      console.debug('[BookingPreview] MapController: destinationCoords =', destinationCoords?.toString());
    } catch (err) {
      console.error('[BookingPreview] MapController: Failed to resolve base coordinates', err);
      return;
    }

    try {
      if (transferType.includes('airport_')) {
        originCoords = this.resolveLatLng([
          ['pickup_airport_latitude', 'pickup_airport_longitude'],
          ['pickup_airport_lat', 'pickup_airport_long'],
        ]) || originCoords;
        console.debug('[BookingPreview] MapController: airport_ override — originCoords =', originCoords?.toString());
      }

      if (transferType.includes('_airport')) {
        destinationCoords = this.resolveLatLng([
          ['dropoff_airport_latitude', 'dropoff_airport_longitude'],
          ['dropoff_airport_lat', 'dropoff_airport_long'],
        ]) || destinationCoords;
        console.debug('[BookingPreview] MapController: _airport override — destinationCoords =', destinationCoords?.toString());
      }
    } catch (err) {
      console.error('[BookingPreview] MapController: Failed to resolve airport coordinate overrides', err);
    }

    let origin: string | google.maps.LatLng | null;
    let destination: string | google.maps.LatLng | null;

    try {
      origin = this.resolveRouteLocation(
        originCoords,
        transferType.includes('airport_')
          ? ['pickup_airport_name', 'pickup']
          : ['pickup', 'pickup_airport_name']
      );
      destination = this.resolveRouteLocation(
        destinationCoords,
        transferType.includes('_airport')
          ? ['dropoff_airport_name', 'dropoff']
          : ['dropoff', 'dropoff_airport_name']
      );
      console.debug('[BookingPreview] MapController: origin =', origin, ', destination =', destination);
    } catch (err) {
      console.error('[BookingPreview] MapController: Failed to resolve route locations', err);
      return;
    }

    if (!origin || !destination) {
      console.warn('[BookingPreview] MapController: origin or destination is null — skipping map draw', { origin, destination });
      return;
    }

    try {
      if (originCoords) {
        this.mapCenter = { lat: originCoords.lat(), lng: originCoords.lng() };
      } else if (destinationCoords) {
        this.mapCenter = { lat: destinationCoords.lat(), lng: destinationCoords.lng() };
      }
      console.debug('[BookingPreview] MapController: mapCenter =', this.mapCenter);
    } catch (err) {
      console.error('[BookingPreview] MapController: Failed to set mapCenter', err);
    }

    setTimeout(() => {
      try {
        console.debug('[BookingPreview] MapController: calling drawMap');
        this.drawMap({
          origin,
          destination,
          waypoints,
          optimizeWaypoints: true,
          travelMode: google.maps.TravelMode.DRIVING
        });
      } catch (err) {
        console.error('[BookingPreview] MapController: drawMap() threw inside setTimeout', err);
      }
    }, 100);
  }

  drawMap(request: google.maps.DirectionsRequest) {
    console.debug('[BookingPreview] drawMap: request =', request);

    try {
      const directionsService = new google.maps.DirectionsService();
      this.directionsRenderer = new google.maps.DirectionsRenderer();

      const mapInstance = this.map?.googleMap;
      if (!mapInstance) {
        console.error('[BookingPreview] drawMap: mapInstance is null — GoogleMap ViewChild not ready');
        return;
      }

      google.maps.event.trigger(mapInstance, 'resize');
      mapInstance.setCenter(this.mapCenter);
      this.directionsRenderer.setMap(mapInstance);

      directionsService.route(request, (response, status) => {
        console.debug('[BookingPreview] drawMap: DirectionsService status =', status);
        if (status === google.maps.DirectionsStatus.OK) {
          this.directionsRenderer.setDirections(response);
          console.debug('[BookingPreview] drawMap: directions rendered successfully');
        } else {
          console.warn('[BookingPreview] drawMap: DirectionsService returned non-OK status', status, response);
        }
      });
    } catch (err) {
      console.error('[BookingPreview] drawMap: Unexpected error', err);
    }
  }

  private resolveCoordinate(...keys: string[]): number | null {
    for (const key of keys) {
      try {
        const rawValue = this.bookingPreview?.[key];
        const parsedValue = Number(rawValue);
        if (rawValue !== null && rawValue !== undefined && rawValue !== '' && Number.isFinite(parsedValue)) {
          return parsedValue;
        } else if (rawValue !== null && rawValue !== undefined && rawValue !== '') {
          console.warn(`[BookingPreview] resolveCoordinate: key="${key}" has non-finite value`, rawValue);
        }
      } catch (err) {
        console.error(`[BookingPreview] resolveCoordinate: Error processing key="${key}"`, err);
      }
    }
    return null;
  }

  private resolveLatLng(keyPairs: Array<[string, string]>): google.maps.LatLng | null {
    for (const [latKey, lngKey] of keyPairs) {
      try {
        const lat = this.resolveCoordinate(latKey);
        const lng = this.resolveCoordinate(lngKey);

        if (lat !== null && lng !== null) {
          if (lat === 0 && lng === 0) {
            console.warn(`[BookingPreview] resolveLatLng: skipping (0,0) for keys [${latKey}, ${lngKey}]`);
            continue;
          }
          console.debug(`[BookingPreview] resolveLatLng: resolved [${latKey}=${lat}, ${lngKey}=${lng}]`);
          return new google.maps.LatLng(lat, lng);
        }
      } catch (err) {
        console.error(`[BookingPreview] resolveLatLng: Error for keys [${latKey}, ${lngKey}]`, err);
      }
    }
    return null;
  }

  private resolveRouteLocation(
    coords: google.maps.LatLng | null,
    textKeys: string[]
  ): string | google.maps.LatLng | null {
    try {
      if (coords) return coords;
      for (const key of textKeys) {
        const rawValue = this.bookingPreview?.[key];
        if (typeof rawValue === 'string' && rawValue.trim()) {
          console.debug(`[BookingPreview] resolveRouteLocation: using text key="${key}", value="${rawValue.trim()}"`);
          return rawValue.trim();
        }
      }
      console.warn('[BookingPreview] resolveRouteLocation: no valid coords or text found', { coords, textKeys });
    } catch (err) {
      console.error('[BookingPreview] resolveRouteLocation: Unexpected error', err);
    }
    return null;
  }

  // ── Utility methods (unchanged, debug added) ───────────────────────────────

  mToMi(distance: number): string {
    return (distance / 1609).toFixed(2);
  }

  mToKm(distance: number): string {
    return (distance / 1000).toFixed(2);
  }

  convertToMinutes(value): string {
    try {
      const days = Math.floor(value / (24 * 60 * 60));
      const remainingSeconds = value % (24 * 60 * 60);
      const hours = Math.floor(remainingSeconds / (60 * 60));
      const remainingMinutes = Math.floor((remainingSeconds % (60 * 60)) / 60);
      let result = '';
      if (days > 0) result += `${days} days, `;
      if (hours > 0 || (days === 0 && hours === 0)) result += `${hours} hours, `;
      result += `${remainingMinutes} minutes`;
      return result;
    } catch (err) {
      console.error('[BookingPreview] convertToMinutes: Failed', { value, err });
      return '';
    }
  }

  iOS(): boolean {
    return ['iPad Simulator', 'iPhone Simulator', 'iPod Simulator', 'iPad', 'iPhone', 'iPod']
      .includes(navigator.platform)
      || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
  }

  showLocationPointOnMapByAddress(address: any) {
    if (!address) {
      console.warn('[BookingPreview] showLocationPointOnMapByAddress: address is empty');
      return;
    }
    try {
      const googleDirectionUrl = 'https://www.google.com/maps/dir/?api=1&destination=' +
        encodeURIComponent(address) + '&travelmode=driving';
      const iosDirectionUrl = 'http://maps.apple.com/?daddr=' + encodeURIComponent(address);
      console.debug('[BookingPreview] showLocationPointOnMapByAddress: iOS =', this.iOS(), ', address =', address);
      if (this.iOS()) {
        setTimeout(() => { window.location.href = iosDirectionUrl; });
      } else {
        window.open(googleDirectionUrl, '_blank');
      }
    } catch (err) {
      console.error('[BookingPreview] showLocationPointOnMapByAddress: Error opening map', err);
    }
  }

  textFormatter(text: any): string {
    try {
      if (text === null || text === undefined) {
        return '';
      }
      return String(text).replace(/[\\\_$]+/g, ' ');
    } catch (err) {
      console.error('[BookingPreview] textFormatter: Failed', { text, err });
      return String(text || '');
    }
  }

  searchOnGoogle(query: string) {
    if (!query) {
      console.warn('[BookingPreview] searchOnGoogle: query is empty');
      return;
    }
    try {
      const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
      window.open(url, '_blank');
    } catch (err) {
      console.error('[BookingPreview] searchOnGoogle: Failed', { query, err });
    }
  }

  formatBaseRate(baseRate: string | number): string {
    try {
      const numericValue = typeof baseRate === 'string' ? parseFloat(baseRate) : baseRate;
      if (!isNaN(numericValue)) return numericValue.toFixed(2);
      console.warn('[BookingPreview] formatBaseRate: non-numeric value', baseRate);
      return '0.00';
    } catch (err) {
      console.error('[BookingPreview] formatBaseRate: Error', { baseRate, err });
      return '0.00';
    }
  }

  formatDate(date: string): string {
    const m = moment(date);
    const dateStr = `${m.format('MM/DD/YYYY')} | ${m.format('MMMM D, YYYY')} | ${m.format('dddd')}`;
    if (m.isSame(moment(), 'day')) {
      return `Today | ${dateStr}`;
    }
    return dateStr;
  }

  formatTime(time: string): string {
    const m = moment(time, 'HH:mm:ss');
    return `${m.format('LT')} | ${m.format('HHmm')} h`;
  }

  getCancellationTime(cancellationHours: number): string {
    try {
      if (cancellationHours > 24) {
        const days = Math.floor(cancellationHours / 24);
        // const remainingHours = cancellationHours % 24;
        return `${days} days`;
      }
      return `${cancellationHours} hours`;
    } catch (err) {
      console.error('[BookingPreview] getCancellationTime: Error', { cancellationHours, err });
      return '';
    }
  }

  highlightNumbers(text: string): string {
    const parts = text.split(/\b(\d+\.\s)/);

    // Process parts and apply formatting
    let formattedText = '';
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        formattedText += parts[i];
      } else {
        formattedText += `<br><span class="text-danger font-weight-bolder">${parts[i]}</span>`;
      }
    }

    return formattedText;
  }
}