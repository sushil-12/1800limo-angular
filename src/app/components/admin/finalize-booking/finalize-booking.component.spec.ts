import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinalizeBookingComponent } from './finalize-booking.component';

describe('FinalizeBookingComponent', () => {
  let component: FinalizeBookingComponent;
  let fixture: ComponentFixture<FinalizeBookingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FinalizeBookingComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FinalizeBookingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
