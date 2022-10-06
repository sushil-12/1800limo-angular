import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVehicleFromAffiliateComponent } from './add-vehicle-from-affiliate.component';

describe('AddVehicleFromAffiliateComponent', () => {
  let component: AddVehicleFromAffiliateComponent;
  let fixture: ComponentFixture<AddVehicleFromAffiliateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddVehicleFromAffiliateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVehicleFromAffiliateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
