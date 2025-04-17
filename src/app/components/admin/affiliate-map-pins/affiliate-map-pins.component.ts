
import { Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-affiliate-map-pins',
  templateUrl: './affiliate-map-pins.component.html',
  styleUrls: ['./affiliate-map-pins.component.scss']
})
export class AffiliateMapPinsComponent implements OnInit {
  @ViewChild(GoogleMap) googleMap!: GoogleMap;

  mapCenter: google.maps.LatLngLiteral = { lat: 41.850033, lng: -87.6500523 };
  zoom = 7;
  markers: any[] = [];

  vehiclesRes: any;
  vehicles: any;
  selectedVehicleId: string = 'all';

  constructor(
    private adminService: AdminService,
  ) { }

  ngOnInit(): void {
    this.loadMarkers('all');

    // Load master vehicle
    this.adminService.getOurVehicles().then(result => {
      this.vehiclesRes = result;
      this.vehicles = this.vehiclesRes.data;
      console.log("veh resp", this.vehicles);
    }).catch(err => {
      console.log("err", err);
    });
  }


  onVehicleChange(event: any) {
    const selectedValue = event.value; // The selected value (id or "all")
    this.loadMarkers(selectedValue); // Call the loadMarkers method with the selected value
  }


  loadMarkers(selectedValue: string) {
    this.markers = []; // Clear old markers

    this.adminService.mapsPin(selectedValue).subscribe(
      (data: any) => {
        console.log("data", data);

        this.markers = data
          .filter(loc => loc.latitude && loc.longitude)
          .map(loc => ({
            position: {
              lat: Number(loc.latitude),
              lng: Number(loc.longitude)
            },
            title: loc.affiliate_name,
            options: {
              animation: google.maps.Animation.DROP
            },
            infoContent: `
              <b>${loc.affiliate_name} (${loc.affiliate_type})</b><br>
              ${loc.mobile}<br>
              ${loc.vehicles}
            `
          }));
      },
      (error) => {
        console.error('Error fetching marker data:', error);
      }
    );
  }

  openInfoWindow(marker: any, infoWindow: any) {
    infoWindow.open(marker);
  }

}