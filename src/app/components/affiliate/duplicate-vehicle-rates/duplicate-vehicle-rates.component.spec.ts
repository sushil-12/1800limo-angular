import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DuplicateVehicleRatesComponent } from './duplicate-vehicle-rates.component';

describe('DuplicateVehicleRatesComponent', () => {
  let component: DuplicateVehicleRatesComponent;
  let fixture: ComponentFixture<DuplicateVehicleRatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DuplicateVehicleRatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DuplicateVehicleRatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
