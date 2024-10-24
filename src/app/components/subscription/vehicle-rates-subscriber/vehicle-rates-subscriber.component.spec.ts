import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehicleRatesSubscriberComponent } from './vehicle-rates-subscriber.component';

describe('VehicleRatesSubscriberComponent', () => {
  let component: VehicleRatesSubscriberComponent;
  let fixture: ComponentFixture<VehicleRatesSubscriberComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehicleRatesSubscriberComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehicleRatesSubscriberComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
