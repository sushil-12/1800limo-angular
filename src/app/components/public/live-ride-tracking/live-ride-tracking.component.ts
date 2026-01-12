import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

declare var google: any;
declare var io: any;

interface Socket {
  on(event: string, callback: Function): void;
  disconnect(): void;
  connected: boolean;
  id: string;
  io?: any;
}

@Component({
  selector: 'app-live-ride-tracking',
  templateUrl: './live-ride-tracking.component.html',
  styleUrls: ['./live-ride-tracking.component.scss']
})
export class LiveRideTrackingComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef;

  status = 'Connecting...';
  rideData: any = null;
  pathHistory: any[] = [];
  error: string | null = null;

  private socket: Socket | null = null;
  private googleMap: any = null;
  private markers: { driver: any; pickup: any; dropoff: any } = { driver: null, pickup: null, dropoff: null };
  private directionsRenderer: any = null;
  private historyPolyline: any = null;
  private lastRouteUpdate = 0;
  private readonly SECRET = 'LIMO_LIVE_TRACK_SECRET_2026'; // keep same everywhere
  private readonly TOKEN_LENGTH = 32;

  private attachSocketDebugger(socket: any): void {
    const originalOn = socket.on.bind(socket);
  
    socket.on = (event: string, callback: Function) => {
      return originalOn(event, (...args: any[]) => {
        console.log('[SOCKET EVENT SUSHIL]', event, args);
        callback(...args);
      });
    };
  }

  // ID Decoding Logic
  private readonly PREFIX = "LXSH";
  private readonly SUFFIX = "ZXSL";

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.initializeSocket();
  }

  ngAfterViewInit(): void {
    this.initializeMap();
  }

  ngOnDestroy(): void {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  private initializeMap(): void {
    const defaultCenter = { lat: 40.7128, lng: -74.0060 };

    this.googleMap = new google.maps.Map(this.mapContainer.nativeElement, {
      zoom: 13,
      center: defaultCenter,
      disableDefaultUI: true,
      zoomControl: false,
      styles: [
        { featureType: "poi", stylers: [{ visibility: "off" }] },
        { featureType: "transit", stylers: [{ visibility: "off" }] }
      ]
    });

    // Route Line (Black)
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      map: this.googleMap,
      suppressMarkers: true,
      preserveViewport: true,
      polylineOptions: { strokeColor: '#111827', strokeWeight: 5, strokeOpacity: 0.9 }
    });

    // History Trail (Gray)
    this.historyPolyline = new google.maps.Polyline({
      map: this.googleMap,
      path: [],
      geodesic: true,
      strokeColor: '#9ca3af',
      strokeOpacity: 0.8,
      strokeWeight: 4
    });
  }

  private initializeSocket(): void {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedUserId = urlParams.get('tracking_id');
    const userId = this.decodeId(encodedUserId);

    console.log('Initializing socket with tracking_id:', encodedUserId, 'decoded userId:', userId);

    if (!userId) {
      this.error = 'Invalid or Missing Link';
      console.error('Invalid tracking_id:', encodedUserId);
      return;
    }

    const socketUrl = 'https://limortservice.infodevbox.com';
    console.log('Connecting to socket URL:', socketUrl);

    this.socket = io(socketUrl, {
      transports: ['polling', 'websocket'],
      auth: { userId: userId, userType: 'customer', secret: 'limoapi_notifications_secret_2024_xyz789' }
    });

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.status = 'Connected';
    });

    this.socket.on('disconnect', (reason: any) => {
      console.log('Socket disconnected:', reason);
      this.status = 'Disconnected';
    });

    this.socket.on('connect_error', (error: any) => {
      console.error('Socket connection error:', error);
      this.status = 'Connection Error';
    });
    this.attachSocketDebugger(this.socket);
    // Add periodic connection check
    setInterval(() => {
      console.log('Socket status check:', {
        connected: this.socket?.connected,
        id: this.socket?.id,
        transport: (this.socket as any)?.io?.engine?.transport?.name
      });
    }, 10000); // Check every 10 seconds

    const handleData = (data: any, type: string) => this.processRideData(data, type);

    this.socket.on('active_ride', (d: any) => {
      console.log('Received active_ride event:', d);
      handleData(d, 'active_ride');
    });

    this.socket.on('chat_message', (d: any) => {
      console.log('Received chat_message event:', d);
      handleData(d, 'chat_message');
    });

    this.socket.on('driver_location_update', (d: any) => {
      console.log('Received driver.location.update event:', d);
      handleData(d, 'driver_loc');
    });

    this.socket.on('driver.location.update', (d: any) => {
      console.log('Received driver.location.update event:', d);
      handleData(d, 'driver_loc');
    });

    this.socket.on('user.notifications', (d: any) => {
      console.log('Received user.notifications event:', d);
      handleData(d, 'notification');
    });
  }

  private processRideData(incomingData: any, type: string): void {
    console.log('Processing ride data:', { type, data: incomingData });
    let lat: number, lng: number, bookingId: any;

    // Extract Driver Location
    if (type === 'driver_loc') {
      lat = parseFloat(incomingData.latitude);
      lng = parseFloat(incomingData.longitude);
      bookingId = incomingData.bookingId;
      console.log('Extracted driver location:', { lat, lng, bookingId, rawData: incomingData });
    } else {
      const d = incomingData.data || incomingData;
      lat = parseFloat(d.driver_latitude || d.driver_lat || d.location?.latitude);
      lng = parseFloat(d.driver_longitude || d.driver_lng || d.location?.longitude);
      bookingId = d.booking_id || d.bookingId;
    }

    // Update Path History
    if (!isNaN(lat) && !isNaN(lng)) {
      const last = this.pathHistory[this.pathHistory.length - 1];
      if (!last || Math.abs(last.lat - lat) > 0.0001 || Math.abs(last.lng - lng) > 0.0001) {
        this.pathHistory = [...this.pathHistory, { lat, lng }];
        // Update map after path history changes
        setTimeout(() => this.updateMapVisuals(), 100);
      }
    }

    if (type === 'driver_loc') {
      this.rideData = {
        ...this.rideData,
        driver_lat: lat,
        driver_lng: lng
      };
      // Update map after driver location changes
      setTimeout(() => this.updateMapVisuals(), 100);
      return;
    }

    let data = incomingData.data || incomingData;
    if (type === 'notification') {
      if (!['live_ride', 'live_ride_do', 'on_location', 'ended'].includes(incomingData.type)) return;
      data = incomingData.data || {};
    }

    const locations = data.locations || {};
    const driver = data.driver || {};
    const vehicle = data.vehicle || driver.vehicle || {};

    this.rideData = {
      booking_id: data.booking_id || data.bookingId,
      status: data.status || incomingData.type || 'In Progress',
      driver_name: driver.name || `${driver.first_name || ''} ${driver.last_name || ''}`.trim() || 'Assigned Driver',
      driver_phone: driver.phone || driver.mobile,
      vehicle_info: vehicle.vehicle_type || vehicle.type || data.vehicle_info || 'Vehicle',
      vehicle_plate: vehicle.plate_number || vehicle.plate || '',
      pickup: {
        address: locations.pickup?.address || data.pickup_address,
        lat: parseFloat(locations.pickup?.latitude || data.pickup_latitude || data.pickup_lat),
        lng: parseFloat(locations.pickup?.longitude || data.pickup_longitude || data.pickup_lng)
      },
      dropoff: {
        address: locations.dropoff?.address || data.dropoff_address,
        lat: parseFloat(locations.dropoff?.latitude || data.dropoff_latitude || data.dropoff_lat),
        lng: parseFloat(locations.dropoff?.longitude || data.dropoff_longitude || data.dropoff_lng)
      },
      driver_lat: lat,
      driver_lng: lng,
      pickup_time: (data.timestamps && data.timestamps.pickup_time) || data.pickup_datetime || data.pickupDateTime
    };

    // Update map visuals after data changes
    setTimeout(() => this.updateMapVisuals(), 100);
  }

  private updateMapVisuals(): void {
    if (!this.rideData || !this.googleMap) return;

    // Car Icon
    const carIcon = {
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24"><path fill="#111827" stroke="white" stroke-width="1.5" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`
      )}`,
      scaledSize: new google.maps.Size(44, 44),
      anchor: new google.maps.Point(22, 22)
    };

    const getPin = (color: string) => ({
      url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="3"/><circle cx="12" cy="12" r="3" fill="white"/></svg>`)}`,
      scaledSize: new google.maps.Size(24, 24),
      anchor: new google.maps.Point(12, 12)
    });

    // Update Markers
    if (this.rideData.driver_lat && !isNaN(this.rideData.driver_lat)) {
      const pos = { lat: this.rideData.driver_lat, lng: this.rideData.driver_lng };
      if (!this.markers.driver) {
        this.markers.driver = new google.maps.Marker({
          position: pos,
          map: this.googleMap,
          icon: carIcon,
          zIndex: 100
        });
      } else {
        this.markers.driver.setPosition(pos);
      }
    }

    if (this.rideData.pickup.lat && !this.markers.pickup) {
      this.markers.pickup = new google.maps.Marker({
        position: this.rideData.pickup,
        map: this.googleMap,
        icon: getPin('#10b981')
      });
    }
    if (this.rideData.dropoff.lat && !this.markers.dropoff) {
      this.markers.dropoff = new google.maps.Marker({
        position: this.rideData.dropoff,
        map: this.googleMap,
        icon: getPin('#111827')
      });
    }

    // Update Path History
    if (this.historyPolyline) {
      this.historyPolyline.setPath(this.pathHistory);
    }

    // Route Logic
    const now = Date.now();
    const shouldUpdate = (now - this.lastRouteUpdate > 5000);

    if (shouldUpdate) {
      let origin = null;
      let destination = null;
      const directionsService = new google.maps.DirectionsService();

      const hasDriver = this.rideData.driver_lat && !isNaN(this.rideData.driver_lat);

      if (hasDriver) {
        origin = { lat: this.rideData.driver_lat, lng: this.rideData.driver_lng };
        if (this.rideData.status.includes('pu') || this.rideData.status === 'en_route') {
          destination = this.rideData.pickup;
        } else if (this.rideData.status === 'on_location') {
          destination = null;
        } else {
          destination = this.rideData.dropoff;
        }
      } else {
        if (this.rideData.pickup.lat && this.rideData.dropoff.lat) {
          origin = this.rideData.pickup;
          destination = this.rideData.dropoff;
        }
      }

      if (origin && destination && destination.lat) {
        directionsService.route({
          origin: origin,
          destination: destination,
          travelMode: google.maps.TravelMode.DRIVING
        }, (response: any, status: any) => {
          if (status === 'OK') {
            this.directionsRenderer.setDirections(response);
            this.lastRouteUpdate = now;
          }
        });
      }
    }
  }

  handleRecenter(): void {
    if (!this.googleMap || !this.rideData) return;

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    // Add Driver
    if (this.rideData.driver_lat && !isNaN(this.rideData.driver_lat)) {
      bounds.extend({ lat: this.rideData.driver_lat, lng: this.rideData.driver_lng });
      hasPoints = true;
    }

    // Add Destination Context
    if (this.rideData.status.includes('pu') && this.rideData.pickup.lat) {
      bounds.extend(this.rideData.pickup);
      hasPoints = true;
    } else if (this.rideData.dropoff.lat) {
      bounds.extend(this.rideData.dropoff);
      hasPoints = true;
    }

    if (hasPoints) {
      this.googleMap.fitBounds(bounds);
    } else if (this.rideData.pickup.lat) {
      this.googleMap.setCenter(this.rideData.pickup);
      this.googleMap.setZoom(15);
    }
  }

  getStatusText(status: string): string {
    const map: { [key: string]: string } = {
      'en_route_pu': 'Driver Arriving',
      'on_location': 'Driver Arrived',
      'en_route_do': 'Heading to Destination',
      'ended': 'Trip Completed'
    };
    return map[status] || status || 'In Progress';
  }

  encodeId(id) {
    const SECRET = 'LIMO_LIVE_TRACK_SECRET_2026';
    const ts = Math.floor(Date.now() / 1000);
    const raw = `${id}:${ts}:${SECRET}`;
  
    let hash = 2166136261;
    for (let i = 0; i < raw.length; i++) {
      hash ^= raw.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
  
    const hashPart = Math.abs(hash).toString(36);
    const idPart = id.toString(36);
  
    // IMPORTANT: "|" is the separator
    return `${hashPart}|${idPart}`
      .padEnd(32, 'x')
      .slice(0, 32);
  }
  
  decodeId(token) {
    if (!token || token.length !== 32) return null;
  
    const core = token.replace(/x+$/, '');
    const parts = core.split('|');
  
    if (parts.length !== 2) return null;
  
    const userId = parseInt(parts[1], 36);
    return isNaN(userId) ? null : userId;
  }
}
