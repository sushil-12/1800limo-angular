import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVehicleRatesFromAffiliateComponent } from './edit-vehicle-rates-from-affiliate.component';

describe('EditVehicleRatesFromAffiliateComponent', () => {
  let component: EditVehicleRatesFromAffiliateComponent;
  let fixture: ComponentFixture<EditVehicleRatesFromAffiliateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditVehicleRatesFromAffiliateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditVehicleRatesFromAffiliateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
