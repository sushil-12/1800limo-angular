import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVehicleFromAffiliateComponent } from './edit-vehicle-from-affiliate.component';

describe('EditVehicleFromAffiliateComponent', () => {
  let component: EditVehicleFromAffiliateComponent;
  let fixture: ComponentFixture<EditVehicleFromAffiliateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditVehicleFromAffiliateComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditVehicleFromAffiliateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
