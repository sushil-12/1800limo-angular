import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddMasterVehicleRatesComponent } from './add-master-vehicle-rates.component';

describe('AddMasterVehicleRatesComponent', () => {
  let component: AddMasterVehicleRatesComponent;
  let fixture: ComponentFixture<AddMasterVehicleRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddMasterVehicleRatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddMasterVehicleRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
