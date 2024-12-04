import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmOutBookingsComponent } from './farm-out-bookings.component';

describe('FarmOutBookingsComponent', () => {
  let component: FarmOutBookingsComponent;
  let fixture: ComponentFixture<FarmOutBookingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FarmOutBookingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FarmOutBookingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
