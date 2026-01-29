import { Injectable } from '@angular/core';
import { ErrorDialogService } from './error-dialog/errordialog.service';

@Injectable({
	providedIn: 'root'
})
export class CommonService {

	constructor(private errorModal: ErrorDialogService,) { }
	handleFile(event) {
		console.log("in function handle file", event)
		const [file] = event.target.files
		const fileType = file.type // image/jpeg
		console.log("fileType", fileType)
		const acceptedFiles: any = ["image/jpeg", "image/png"];
		console.log(!acceptedFiles.includes(fileType))
		if (!acceptedFiles.includes(fileType)) {
			return this.errorModal.openDialog({
				errors: {
					error: 'Please upload only jpeg or png file type!'
				}
			})
		} else {
			return true
		}
	}

	getTelInputOptions() {
		return {
			initialCountry: 'auto',
			geoIpLookup: function (callback: (countryCode: string) => void) {
				fetch('https://ipapi.co/json')
					.then(function (res) { return res.json(); })
					.then(function (data) { callback(data.country_code); })
					.catch(function () { callback('us'); });
			},
			preferredCountries: ['us', 'ca', 'mx', 'gb'],
			separateDialCode: true,
			nationalMode: true,
			utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.2.1/build/js/utils.js'
		};
	}
}
