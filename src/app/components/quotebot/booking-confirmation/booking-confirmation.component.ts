import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';

/**
 * Public landing page after an unregistered visitor submits a booking.
 * Guests have no bookings list, so the reservation reference is handed over
 * through router state by BookingComponent.navigatePostSave().
 */
@Component({
	selector: 'app-booking-confirmation',
	templateUrl: './booking-confirmation.component.html',
	styleUrls: ['./booking-confirmation.component.scss']
})
export class BookingConfirmationComponent implements OnInit {
	reservationId: string | number | null = null;
	confirmationNumber: string | null = null;
	email: string | null = null;
	message: string | null = null;

	constructor(private $router: Router, private $spinner: NgxSpinnerService) {
		const state = this.$router.getCurrentNavigation()?.extras?.state as any;
		this.reservationId = state?.reservation_id ?? null;
		this.confirmationNumber = state?.confirmation_number ?? null;
		this.email = state?.email ?? null;
		this.message = state?.message ?? null;
	}

	ngOnInit(): void {
		// terminal page — nothing is loading here, so clear any overlay left running
		// by whatever navigated in
		['primary', 'normalspinner', 'fetchspinner'].forEach((name) => this.$spinner.hide(name));
		// the quote that produced this booking is spent
		sessionStorage.removeItem('selected_vehicle');
	}

	get reference(): string | number | null {
		return this.confirmationNumber || this.reservationId;
	}

	startNewQuote(): void {
		this.$router.navigate(['/home']);
	}
}
