import { Component, ElementRef, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
// @ts-ignore - html2pdf.js ships no type definitions
import html2pdf from 'html2pdf.js';
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
  @ViewChild('specialInstructionBox') specialInstructionBox!: ElementRef;
  @ViewChild('receiptContent') receiptContent!: ElementRef;

  isScrollable = false;

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

  @Output() editBooking = new EventEmitter<any>();
  @Output() shareBooking = new EventEmitter<any>();

  shareEditorContent: string = '';

  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      ['link'],
      ['clean'],
    ],
  };

  constructor(
    private $affiliateService: AffiliateService,
    private $adminService: AdminService,
    private $spinner: NgxSpinnerService,
    private stateManagementService: StateManagementService,
    private $individualService: IndividualService,
    private $travelAgentService: TravelAgentService,
    private toastr: ToastrService,
  ) { }

  // ── Header actions ─────────────────────────────────────────────────
  onEdit(): void {
    this.editBooking.emit(this.bookingPreview);
  }

  onShare(): void {
    this.shareEditorContent = this.buildShareMessage();
    this.shareBooking.emit(this.bookingPreview);
    try {
      $('#shareBookingModal').modal('show');
    } catch (err) {
      console.error('[BookingPreview] onShare: failed to open share modal', err);
    }
  }

  copyShareHtml(): void {
    const html = this.shareEditorContent || '';
    // Plain-text version: strip tags, turn block ends into newlines.
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const plain = (tmp.innerText || tmp.textContent || '').trim();

    const done = () => this.toastr.success('Copied to clipboard');
    const fail = () => this.toastr.error('Could not copy');

    const w = window as any;
    if (navigator?.clipboard && w.ClipboardItem) {
      // Rich copy: pasting into email/docs keeps the exact HTML formatting.
      const item = new w.ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob([plain], { type: 'text/plain' }),
      });
      navigator.clipboard.write([item]).then(done).catch(() => {
        navigator.clipboard.writeText(html).then(done).catch(fail);
      });
    } else if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(html).then(done).catch(fail);
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = html;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      } catch {
        fail();
      }
    }
  }

  private buildShareMessage(): string {
    const b = this.bookingPreview || {};

    const pickupAddress =
      b.pickup_address || b.pickup || b.pickup_airport_name || '';
    const dropoffAddress =
      b.dropoff_address || b.dropoff || b.dropoff_airport_name || '';

    const dateStr = b.pickup_date
      ? `${moment(b.pickup_date).format('MM/DD/YYYY')} | ${moment(b.pickup_date).format('MMM D, YYYY')}`
      : '';
    const timeM = b.pickup_time ? moment(b.pickup_time, ['HH:mm:ss', 'HH:mm']) : null;
    const timeStr = timeM && timeM.isValid()
      ? `${timeM.format('h:mm a')} | ${timeM.format('HHmm')} h`
      : '';

    const bookingType = [
      this.textFormatter(b.service_type),
      b.transfer_type,
    ].filter(Boolean).join('/');

    const lines: (string | null)[] = [
      'Hi, I need an all-inclusive rate, with tip, tax, and any tolls, for this booking.',
      '',
      bookingType ? `Booking Type: ${bookingType}` : null,
      b.cancellation_hours
        ? `Cancellation Period: ${this.getCancellationTime(b.cancellation_hours)}`
        : null,
      '',
      b.vehicle_type_name || null,
      b.total_passengers != null ? `${b.total_passengers} pax` : null,
      b.luggage_count != null ? `${b.luggage_count} luggage` : null,
      '',
      'Travel Information',
      '',
      'Pickup Details:',
      dateStr ? `Date: ${dateStr}` : null,
      timeStr ? `Time: ${timeStr}` : null,
      pickupAddress ? `Address: ${pickupAddress}` : null,
      '',
      'Drop Off Details:',
      dropoffAddress ? `Address: ${dropoffAddress}` : null,
      '',
      b.distance != null
        ? `Total Distance: ${this.mToMi(b.distance)} Miles / ${this.mToKm(b.distance)} Km`
        : null,
      b.duration != null
        ? `Estimated Time: ${this.convertToMinutes(b.duration)}`
        : null,
    ];

    // Quill stores content as <p> blocks; blank lines become empty paragraphs.
    const esc = (s: string) =>
      s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return lines
      .filter((l) => l !== null)
      .map((l) => (l ? `<p>${esc(l as string)}</p>` : '<p><br></p>'))
      .join('');
  }

  isGeneratingPdf = false;

  printReceipt(): void {
    const node = this.receiptContent?.nativeElement as HTMLElement;
    if (!node || this.isGeneratingPdf) {
      return;
    }

    this.isGeneratingPdf = true;

    // Clone so we can strip the live map (cross-origin tiles taint the
    // html2canvas snapshot) without touching the on-screen receipt.
    const clone = node.cloneNode(true) as HTMLElement;
    clone.querySelectorAll('google-map, .rcpt-map, .rcpt-actions, .rcpt-close')
      .forEach((el) => el.remove());

    const fileName = `Booking-${this.bookingPreview?.reservation_id || 'receipt'}.pdf`;

    const opt = {
      margin: [8, 8, 8, 8],
      filename: fileName,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        windowWidth: node.scrollWidth,
      },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
    };

    html2pdf()
      .set(opt)
      .from(clone)
      .save()
      .then(() => {
        this.isGeneratingPdf = false;
        this.toastr.success('Receipt downloaded');
      })
      .catch((err: any) => {
        this.isGeneratingPdf = false;
        console.error('[BookingPreview] printReceipt: PDF generation failed', err);
        this.toastr.error('Could not generate PDF');
      });
  }

  copyDetails(): void {
    const b = this.bookingPreview || {};
    const lines = [
      `Booking #${b.reservation_id ?? ''}`,
      b.pickup_date ? `Date: ${this.formatDate(b.pickup_date)}` : '',
      b.pickup_time ? `Pickup Time: ${this.formatTime(b.pickup_time)}` : '',
      b.passenger_name ? `Passenger: ${b.passenger_name}` : '',
      b.passenger_email ? `Email: ${b.passenger_email}` : '',
      b.passenger_cell ? `Phone: (${b.passenger_cell_isd ?? ''}) ${b.passenger_cell}` : '',
      b.pickup ? `Pickup: ${b.pickup}` : '',
      b.dropoff ? `Drop Off: ${b.dropoff}` : '',
      b.vehicle_type_name ? `Vehicle: ${b.vehicle_type_name}` : '',
      b.grand_total ? `Total: ${this.currencySymbol ?? ''}${b.grand_total}` : '',
    ].filter(Boolean);
    const text = lines.join('\n');

    const done = () => this.toastr.success('Booking details copied');
    const fail = () => this.toastr.error('Could not copy details');

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text).then(done).catch(fail);
    } else {
      try {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        done();
      } catch {
        fail();
      }
    }
  }

  ngOnInit(): void {
    try {
      this.currencySymbol = this.stateManagementService.getCurrencySymbol();
      console.debug('[BookingPreview] ngOnInit: currencySymbol =', this.currencySymbol);
    } catch (err) {
      console.error('[BookingPreview] ngOnInit: Failed to get currency symbol', err);
    }
  }

  ngAfterViewInit(): void {
    this.checkScrollable();
  }

  ngAfterViewChecked(): void {
    this.checkScrollable();
  }

  checkScrollable(): void {
    const el = this.specialInstructionBox?.nativeElement;
    if (el) {
      const scrollable = el.scrollHeight > el.clientHeight;
      if (scrollable !== this.isScrollable) {
        this.isScrollable = scrollable;
      }
    }
  }

  scrollInstruction(direction: 'up' | 'down'): void {
    const el = this.specialInstructionBox.nativeElement;
    el.scrollBy({ top: direction === 'down' ? 60 : -60, behavior: 'smooth' });
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
    if (!m.isValid()) {
      return '';
    }
    const formatted = m.format('ddd, MMM D, YYYY');
    if (m.isSame(moment(), 'day')) {
      return `Today · ${formatted}`;
    }
    return formatted;
  }

  formatTime(time: string): string {
    const m = moment(time, ['HH:mm:ss', 'HH:mm']);
    return m.isValid() ? m.format('h:mm A') : '';
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