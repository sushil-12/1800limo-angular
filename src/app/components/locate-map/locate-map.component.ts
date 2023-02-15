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


	latitude: number = 0
	longitude: number = 0
	constructor(
		private $mapsApi: MapsAPILoader,
		private activatedRoute: ActivatedRoute
	) { }

	ngOnInit(): void 
	{
		this.activatedRoute.params.subscribe((params: any) =>
		{
			if (params.lat && params.lng)
			{
				this.latitude = Number(params.lat);
				this.longitude = Number(params.lng);
			}
		})

		this.$mapsApi.load().then(() =>
		{
			const map = new google.maps.Map(document.getElementById('map'), {
				center: new google.maps.LatLng(this.latitude, this.longitude),
				zoom: 12,
				scaleControl: true,
			})
			new google.maps.Marker({
				position: new google.maps.LatLng(this.latitude, this.longitude),
				map,
				title: sessionStorage.getItem('location')
			})
		})
	}

}
