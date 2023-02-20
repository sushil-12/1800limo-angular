import { MapsAPILoader } from '@agm/core';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
	selector: 'app-locate-map',
	templateUrl: './locate-map.component.html',
	styleUrls: ['./locate-map.component.scss']
})
export class LocateMapComponent implements OnInit
{


	p_latitude: number = 0;
	p_longitude: number = 0;
	d_latitude: number = 0;
	d_longitude: number = 0;

	constructor(
		private $mapsApi: MapsAPILoader,
		private activatedRoute: ActivatedRoute
	) { }

	ngOnInit(): void 
	{
		this.activatedRoute.queryParams.subscribe((params: any) =>
		{
			if (params.plat && params.plng)
			{
				this.p_latitude = Number(params.plat);
				this.p_longitude = Number(params.plng);
				this.d_latitude = Number(params.dlat);
				this.d_longitude = Number(params.dlng);
			}
		})

		this.$mapsApi.load().then(() =>
		{
			const directionsRenderer = new google.maps.DirectionsRenderer;
			const directionsService = new google.maps.DirectionsService;

			const map = new google.maps.Map(document.getElementById('map'), {
				center: new google.maps.LatLng(this.p_latitude, this.p_longitude),
				zoom: 12,
				scaleControl: true,
			})
			// new google.maps.Marker({
			// 	position: new google.maps.LatLng(this.latitude, this.longitude),
			// 	map,
			// 	title: sessionStorage.getItem('location')
			// })

			directionsRenderer.setMap(map);

			const request: google.maps.DirectionsRequest = {
				origin: new google.maps.LatLng(this.p_latitude, this.p_longitude),
				destination: new google.maps.LatLng(this.d_latitude, this.d_longitude),
				optimizeWaypoints: true,
				travelMode: google.maps.TravelMode.DRIVING
			}

			directionsService.route(request, (route: any, status: string) =>
			{
				if (status == google.maps.DirectionsStatus.OK)
				{
					directionsRenderer.setMap(map);
					directionsRenderer.setDirections(route);
				}
			})

		})
	}

}
