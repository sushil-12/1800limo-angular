import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminService } from 'src/app/services/admin.service';
import { BookingDetailsComponent } from './booking-details.component';

describe('BookingDetailsComponent', () => {
	let component: BookingDetailsComponent;
	let fixture: ComponentFixture<BookingDetailsComponent>;

	beforeEach(async () => {
		await TestBed.configureTestingModule({
			declarations: [BookingDetailsComponent],
			providers: [
				{
					provide: AdminService,
					useValue: {
						getBookingPreview: () => of({ data: { reservation_id: 1, extra_stops: [], return_extra_stops: [] } })
					}
				},
				{
					provide: ActivatedRoute,
					useValue: {
						queryParams: of({ bookingId: 1 })
					}
				},
				{
					provide: Router,
					useValue: {
						navigate: jasmine.createSpy('navigate')
					}
				}
			],
			schemas: [NO_ERRORS_SCHEMA]
		})
			.compileComponents();
	});

	beforeEach(() => {
		fixture = TestBed.createComponent(BookingDetailsComponent);
		component = fixture.componentInstance;
		fixture.detectChanges();
	});

	it('should create', () => {
		expect(component).toBeTruthy();
	});
});
