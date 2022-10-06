import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVehicleRatesFromAffiliateComponent } from './add-vehicle-rates-from-affiliate.component';

describe('AddVehicleRatesFromAffiliateComponent', () => {
  let component: AddVehicleRatesFromAffiliateComponent;
  let fixture: ComponentFixture<AddVehicleRatesFromAffiliateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddVehicleRatesFromAffiliateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVehicleRatesFromAffiliateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
