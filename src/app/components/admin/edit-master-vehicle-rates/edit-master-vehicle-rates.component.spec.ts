import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditMasterVehicleRatesComponent } from './edit-master-vehicle-rates.component';

describe('EditMasterVehicleRatesComponent', () => {
  let component: EditMasterVehicleRatesComponent;
  let fixture: ComponentFixture<EditMasterVehicleRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditMasterVehicleRatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditMasterVehicleRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
