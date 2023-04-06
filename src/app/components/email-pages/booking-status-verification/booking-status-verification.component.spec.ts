import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingStatusVerificationComponent } from './booking-status-verification.component';

describe('BookingStatusVerificationComponent', () => {
  let component: BookingStatusVerificationComponent;
  let fixture: ComponentFixture<BookingStatusVerificationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookingStatusVerificationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookingStatusVerificationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
