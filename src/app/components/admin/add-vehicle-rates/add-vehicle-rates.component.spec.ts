import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddVehicleRatesComponent } from './add-vehicle-rates.component';

describe('AddVehicleRatesComponent', () => {
  let component: AddVehicleRatesComponent;
  let fixture: ComponentFixture<AddVehicleRatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddVehicleRatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddVehicleRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
