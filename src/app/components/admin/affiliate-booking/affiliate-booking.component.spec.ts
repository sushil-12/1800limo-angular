import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AffiliateBookingComponent } from './affiliate-booking.component';

describe('AffiliateBookingComponent', () => {
  let component: AffiliateBookingComponent;
  let fixture: ComponentFixture<AffiliateBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AffiliateBookingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AffiliateBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
