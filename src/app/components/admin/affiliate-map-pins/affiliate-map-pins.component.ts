import { MapsAPILoader } from '@agm/core';
import { Component, OnInit } from '@angular/core';
import { AdminService } from 'src/app/services/admin.service';

@Component({
  selector: 'app-affiliate-map-pins',
  templateUrl: './affiliate-map-pins.component.html',
  styleUrls: ['./affiliate-map-pins.component.scss']
})
export class AffiliateMapPinsComponent implements OnInit {
  map: google.maps.Map;
  markers: google.maps.Marker[] = []; // Store the markers
  vehiclesRes: any;
  vehicles: any;
  selectedVehicleId: string = 'all';

  constructor(
    private adminService: AdminService,
    private $mapsapi: MapsAPILoader,
  ) { }

  ngOnInit(): void {
    this.MapController();

    // Load master vehicle
    this.adminService.getOurVehicles().then(result => {
      this.vehiclesRes = result;
      this.vehicles = this.vehiclesRes.data;
      console.log("veh resp", this.vehicles);
    }).catch(err => {
      console.log("err", err);
    });
  }

  MapController() {
    console.log('Map has been initialised.');

    this.$mapsapi.load().then(() => {
      this.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: new google.maps.LatLng(41.850033, -87.6500523),
        scaleControl: true
      });

      // Fetch coordinates and add markers
      this.loadMarkers('all');
    });
  }

  onVehicleChange(event: any) {
    const selectedValue = event.value; // The selected value (id or "all")
    this.loadMarkers(selectedValue); // Call the loadMarkers method with the selected value
  }

  loadMarkers(selectedValue: string) {
    // Clear existing markers
    this.clearMarkers();

    this.adminService.mapsPin(selectedValue).subscribe(
      (data: any) => {
        console.log("data", data);

        data.forEach((location) => {
          if (location.latitude && location.longitude) {
            const marker = new google.maps.Marker({
              position: { lat: Number(location.latitude), lng: Number(location.longitude) },
              map: this.map,
              title: location.affiliate_name
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `<b>${location.affiliate_name} (${location.affiliate_type})</b><br>${location.mobile}<br>${location.vehicles}`
            });

            marker.addListener('click', () => {
              infoWindow.open(this.map, marker);
            });

            this.markers.push(marker); // Add marker to the array
          } else {
            console.warn('Invalid location data:', location);
          }
        });
      },
      (error) => {
        console.error('Error fetching marker data:', error);
      }
    );
  }

  clearMarkers() {
    // Set each marker's map to null to remove it from the map
    this.markers.forEach(marker => marker.setMap(null));
    this.markers = []; // Reset the markers array
  }
}