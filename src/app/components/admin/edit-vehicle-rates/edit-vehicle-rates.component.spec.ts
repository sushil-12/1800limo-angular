import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditVehicleRatesComponent } from './edit-vehicle-rates.component';

describe('EditVehicleRatesComponent', () => {
  let component: EditVehicleRatesComponent;
  let fixture: ComponentFixture<EditVehicleRatesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditVehicleRatesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditVehicleRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
